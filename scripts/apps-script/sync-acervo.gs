/**
 * Google Apps Script — sincronização diária da planilha de categorização com o Acervo.
 *
 * Como usar:
 * 1. Abra a planilha no Google Sheets → Extensões → Apps Script
 * 2. Cole este arquivo (Code.gs)
 * 3. Ajuste ACERVO_API_BASE e SYNC_TOKEN (mesmo valor de SPREADSHEET_SYNC_TOKEN no .env)
 * 4. Autorize o script (primeira execução de testSyncNow)
 * 5. Acionadores (ícone de relógio) → Adicionar acionador:
 *      - Função: syncAcervoDaily
 *      - Fonte do evento: Baseado em tempo
 *      - Tipo: Temporizador diário (ex.: entre 6h e 7h)
 *
 * Opcional — App da Web: Implantar → Nova implantação → Tipo "App da Web"
 * serve para disparar um teste via navegador (doGet). A rotina diária NÃO depende disso.
 */

var ACERVO_API_BASE = 'http://13.217.4.132/api';
var SYNC_TOKEN = 'COLE_AQUI_O_MESMO_SPREADSHEET_SYNC_TOKEN_DO_ENV';

function syncAcervoDaily() {
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
  Logger.log('HTTP ' + code + ' → ' + body);

  if (code < 200 || code >= 300) {
    throw new Error('Falha ao sincronizar com o Acervo: HTTP ' + code + ' ' + body);
  }

  return JSON.parse(body);
}

/** Teste manual no editor do Apps Script. */
function testSyncNow() {
  var result = syncAcervoDaily();
  Logger.log(result);
}

/**
 * Opcional: se implantar como App da Web, GET na URL dispara a sync
 * (útil para teste; proteja o token — não compartilhe a URL publicamente).
 */
function doGet() {
  try {
    var result = syncAcervoDaily();
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, result: result }, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(error) }, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  }
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
