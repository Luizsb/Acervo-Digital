/**
 * Google Apps Script — sincronização diária da planilha de categorização com o Acervo.
 *
 * Como usar:
 * 1. Abra a planilha no Google Sheets → Extensões → Apps Script
 * 2. Cole este arquivo (Code.gs)
 * 3. Em Configurações do projeto → Propriedades do script, cadastre:
 *      - SYNC_TOKEN: mesmo valor de SPREADSHEET_SYNC_TOKEN da EC2
 *      - WEB_APP_SECRET: só se você for implantar o App da Web (opcional)
 * 4. Autorize o script (primeira execução de testSyncNow)
 * 5. Acionadores (ícone de relógio) → Adicionar acionador:
 *      - syncAcervoDaily: baseado em tempo, temporizador diário (ex.: 6h às 7h)
 *      - checkAcervoSyncRequests: baseado em tempo, por minuto, a cada 5 minutos
 *        (é o que faz o botão "Sincronizar agora" do painel admin funcionar)
 *
 * O App da Web é opcional e só funciona se o Workspace permitir acesso "qualquer
 * pessoa". Em domínios corporativos que bloqueiam isso, os acionadores acima já
 * cobrem tanto a rotina diária quanto a sincronização sob demanda.
 */

var ACERVO_API_BASE = 'http://13.217.4.132/api';

/**
 * Os segredos ficam nas Propriedades do Script, não neste arquivo.
 * Assim eles não são publicados junto com o código no GitHub.
 */
function getAcervoConfig_() {
  var properties = PropertiesService.getScriptProperties();
  var syncToken = properties.getProperty('SYNC_TOKEN');

  if (!syncToken) {
    throw new Error(
      'SYNC_TOKEN não configurado. Abra Configurações do projeto → Propriedades do script.'
    );
  }

  return {
    syncToken: syncToken,
    // Usado apenas pelo App da Web opcional.
    webAppSecret: properties.getProperty('WEB_APP_SECRET') || '',
  };
}

/** Exporta a planilha e envia para a API. Retorna o jobId sem esperar a importação. */
function startAcervoSync_(requestId) {
  var config = getAcervoConfig_();
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var xlsx = exportSpreadsheetAsXlsx_(spreadsheet.getId());

  var payload = { spreadsheet: xlsx };
  if (requestId) payload.requestId = requestId;

  var response = UrlFetchApp.fetch(ACERVO_API_BASE + '/sync/spreadsheet', {
    method: 'post',
    payload: payload,
    headers: {
      'X-Acervo-Sync-Token': config.syncToken,
    },
    muteHttpExceptions: true,
  });

  var code = response.getResponseCode();
  var body = response.getContentText();
  Logger.log('Envio: HTTP ' + code + ' → ' + body);

  if (code < 200 || code >= 300) {
    throw new Error('Falha ao enviar a planilha ao Acervo: HTTP ' + code + ' ' + body);
  }

  return JSON.parse(body);
}

/** Acionador diário: envia a planilha sem depender de pedido do painel. */
function syncAcervoDaily() {
  var started = startAcervoSync_();
  return waitForJob_(started.jobId);
}

/**
 * Acionador curto (a cada 5 minutos): atende o botão "Sincronizar agora" do painel.
 * Como o Workspace não permite App da Web público, é a planilha que pergunta à API
 * se algum admin pediu uma sincronização.
 */
function checkAcervoSyncRequests() {
  var config = getAcervoConfig_();
  var response = UrlFetchApp.fetch(ACERVO_API_BASE + '/sync/pending', {
    headers: { 'X-Acervo-Sync-Token': config.syncToken },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() !== 200) {
    Logger.log('Não foi possível consultar pedidos: HTTP ' + response.getResponseCode());
    return null;
  }

  var pending = JSON.parse(response.getContentText());
  if (!pending.pending) return null;

  Logger.log('Pedido de sincronização recebido do painel (' + pending.requestId + ').');
  var started = startAcervoSync_(pending.requestId);
  return waitForJob_(started.jobId);
}

/**
 * A API responde 202 e importa em background: aqui acompanhamos o job
 * para registrar o resultado no log de execuções do Apps Script.
 */
function waitForJob_(jobId) {
  if (!jobId) return null;
  var config = getAcervoConfig_();

  for (var attempt = 0; attempt < 40; attempt++) {
    Utilities.sleep(5000);
    var response = UrlFetchApp.fetch(
      ACERVO_API_BASE + '/sync/jobs/' + encodeURIComponent(jobId),
      {
        headers: { 'X-Acervo-Sync-Token': config.syncToken },
        muteHttpExceptions: true,
      }
    );
    if (response.getResponseCode() !== 200) {
      Logger.log('Status indisponível: HTTP ' + response.getResponseCode());
      continue;
    }

    var job = JSON.parse(response.getContentText());
    if (job.status === 'completed') {
      Logger.log(
        'Sincronizado: ' +
          job.summary.created +
          ' novos, ' +
          job.summary.updated +
          ' atualizados, ' +
          job.summary.deactivated +
          ' desativados, ' +
          job.summary.totalActive +
          ' ativos.'
      );
      return job;
    }
    if (job.status === 'failed') {
      throw new Error('Importação falhou no Acervo: ' + job.error);
    }
  }

  Logger.log('Importação segue em andamento no Acervo (acompanhe no painel admin).');
  return null;
}

/** Teste manual no editor do Apps Script. */
function testSyncNow() {
  var result = syncAcervoDaily();
  Logger.log(result);
}

/**
 * App da Web: é o que o botão "Sincronizar agora" do painel admin chama.
 * Com `?mode=start` (usado pela API) devolve o jobId na hora; sem isso,
 * espera a importação terminar para facilitar um teste manual no navegador.
 */
function doGet(event) {
  try {
    var config = getAcervoConfig_();
    var params = (event && event.parameter) || {};
    if (!config.webAppSecret || params.token !== config.webAppSecret) {
      return jsonOutput_({ ok: false, error: 'Token do App da Web inválido.' });
    }

    var started = startAcervoSync_();
    if (params.mode === 'start') {
      return jsonOutput_({ ok: true, jobId: started.jobId });
    }

    var job = waitForJob_(started.jobId);
    return jsonOutput_({ ok: true, jobId: started.jobId, job: job });
  } catch (error) {
    return jsonOutput_({ ok: false, error: String(error) });
  }
}

function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload, null, 2)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function exportSpreadsheetAsXlsx_(spreadsheetId) {
  var url =
    'https://docs.google.com/spreadsheets/d/' +
    spreadsheetId +
    '/export?format=xlsx';
  var response = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() !== 200) {
    throw new Error(
      'Não foi possível exportar a planilha (HTTP ' +
        response.getResponseCode() +
        ').'
    );
  }
  return response.getBlob().setName('categorizacao.xlsx');
}
