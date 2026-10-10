/**
 * Google referral intake — Apps Script attached to the referral spreadsheet.
 *
 * The website's server posts each validated form submission here. This script saves the resume to a
 * private Drive folder and appends one row to the first sheet. It runs as the sheet owner, so the
 * sheet and the folder stay private. Setup steps: docs/referral-sheet/README.md
 */

var HEADERS = ['Submitted at', 'Name', 'Email', 'Phone', 'Current company', 'Previous companies', 'Job link', 'Resume', 'Status'];
var FOLDER_NAME = 'Google referral resumes';

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('SECRET');
    if (!secret || data.secret !== secret) return reply({ ok: false, error: 'unauthorized' });

    lock.waitLock(20000);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var file = resumeFolder(props).createFile(
      Utilities.newBlob(Utilities.base64Decode(data.resume.data), data.resume.mime, data.name + ' - ' + data.resume.name)
    );

    sheet.appendRow([
      new Date(),
      safe(data.name),
      safe(data.email),
      safe(data.phone),
      safe(data.currentCompany),
      safe(data.previousCompanies),
      safe(data.jobLink),
      file.getUrl(),
      'New'
    ]);
    return reply({ ok: true });
  } catch (error) {
    return reply({ ok: false, error: String(error) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

// The folder is created on the first submission and remembered by id, so renaming or moving it is fine.
function resumeFolder(props) {
  var id = props.getProperty('FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (ignored) {}
  }
  var folder = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', folder.getId());
  return folder;
}

// A leading apostrophe makes Sheets store the value as plain text, so "+91…" stays a phone number and
// nothing a visitor types can run as a formula.
function safe(value) {
  var text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor (Run ▸ setup). Google asks for Sheets and Drive permission, and the script
// creates its own secret. The secret is printed in the Execution log: copy it into Netlify as
// REFERRAL_SCRIPT_SECRET. Running it again prints the same secret.
function setup() {
  SpreadsheetApp.getActiveSpreadsheet().getName();
  DriveApp.getRootFolder().getName();
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('SECRET');
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('SECRET', secret);
  }
  Logger.log('REFERRAL_SCRIPT_SECRET = ' + secret);
}
