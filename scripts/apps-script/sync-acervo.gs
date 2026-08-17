/**
 * Google Apps Script — sincronização diária da planilha de categorização com o Acervo.
 *
 * Como usar:
 * 1. Abra a planilha no Google Sheets → Extensões → Apps Script
 * 2. Cole este arquivo (Code.gs)
 * 3. Em Configurações do projeto → Propriedades do script, cadastre:
 *      - SYNC_TOKEN: mesmo valor de SPREADSHEET_SYNC_TOKEN da EC2
 * 4. Autorize o script (primeira execução de testSyncNow)
 * 5. Acionadores (ícone de relógio) → Adicionar acionador:
 *      - Função: syncAcervoDaily
 *      - Fonte do evento: Baseado em tempo
 *      - Tipo: Temporizador diário (recomendado) ou semanal
 *
 * Não é necessário implantar como App da Web. A planilha continua privada e o
 * acionador executa com as permissões da conta que o criou.
 */

// Use HTTPS: em HTTP o token de sincronização viajaria em texto claro.
var ACERVO_API_BASE = 'https://13.217.4.132/api';

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
  };
}

/** Exporta a planilha e envia para a API. Retorna o jobId sem esperar a importação. */
function startAcervoSync_() {
  var config = getAcervoConfig_();
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var xlsx = exportSpreadsheetAsXlsx_(spreadsheet.getId());

  var response = UrlFetchApp.fetch(ACERVO_API_BASE + '/sync/spreadsheet', {
    method: 'post',
    payload: { spreadsheet: xlsx },
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

/** Acionador agendado: exporta e sincroniza a planilha. */
function syncAcervoDaily() {
  var started = startAcervoSync_();
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
