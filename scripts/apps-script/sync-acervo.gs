/**
 * Google Apps Script — sincronização diária da planilha de categorização com o Acervo.
 *
 * Como usar:
 * 1. Abra a planilha no Google Sheets → Extensões → Apps Script
 * 2. Cole este arquivo (Code.gs)
 * 3. Ajuste ACERVO_API_BASE, SYNC_TOKEN (= SPREADSHEET_SYNC_TOKEN do .env) e
 *    WEB_APP_SECRET (= APPS_SCRIPT_SYNC_SECRET do .env)
 * 4. Autorize o script (primeira execução de testSyncNow)
 * 5. Acionadores (ícone de relógio) → Adicionar acionador:
 *      - Função: syncAcervoDaily
 *      - Fonte do evento: Baseado em tempo
 *      - Tipo: Temporizador diário (ex.: entre 6h e 7h)
 * 6. Implantar → Nova implantação → "App da Web":
 *      - Executar como: eu (dono da planilha)
 *      - Quem pode acessar: qualquer pessoa
 *    Copie a URL /exec para APPS_SCRIPT_SYNC_URL no .env da API. É ela que o botão
 *    "Sincronizar agora" do painel admin usa — funciona mesmo com planilha privada.
 */

var ACERVO_API_BASE = 'http://13.217.4.132/api';
var SYNC_TOKEN = 'COLE_AQUI_O_MESMO_SPREADSHEET_SYNC_TOKEN_DO_ENV';
// Segredo do App da Web (mesmo valor de APPS_SCRIPT_SYNC_SECRET no .env da API).
// Deixe vazio para não exigir token na URL do App da Web.
var WEB_APP_SECRET = 'COLE_AQUI_O_MESMO_APPS_SCRIPT_SYNC_SECRET_DO_ENV';

/** Exporta a planilha e envia para a API. Retorna o jobId sem esperar a importação. */
function startAcervoSync_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var xlsx = exportSpreadsheetAsXlsx_(spreadsheet.getId());

  var response = UrlFetchApp.fetch(ACERVO_API_BASE + '/sync/spreadsheet', {
    method: 'post',
    payload: {
      spreadsheet: xlsx,
    },
    headers: {
      'X-Acervo-Sync-Token': SYNC_TOKEN,
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

  for (var attempt = 0; attempt < 40; attempt++) {
    Utilities.sleep(5000);
    var response = UrlFetchApp.fetch(
      ACERVO_API_BASE + '/sync/jobs/' + encodeURIComponent(jobId),
      {
        headers: { 'X-Acervo-Sync-Token': SYNC_TOKEN },
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
    var params = (event && event.parameter) || {};
    if (WEB_APP_SECRET && params.token !== WEB_APP_SECRET) {
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
