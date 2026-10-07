// ============================================================
// JADOOTECH ENTERPRISES — Google Apps Script  v2
// File: google-apps-script/Code.gs
//
// IMPORTANT: After editing this file you MUST create a
// NEW deployment (Deploy → New deployment) — not update
// the existing one — for changes to take effect.
// ============================================================

var SPREADSHEET_ID = '1Jv7NJhN-TXhAnxDjzscMLJDAUshOR14PsYfok8f7WrI';
var SHEET_NAME     = 'Leads';
var HEADERS        = ['Timestamp','Full Name','Company Name','Email','Phone','Service Required','Budget','Project Details','Source','Status'];
var DEFAULT_SOURCE = 'Website';
var DEFAULT_STATUS = 'New';
var REQUIRED_FIELDS = ['fullName','email','serviceRequired','projectDetails'];

// ============================================================
// doPost
// ============================================================
function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var params = e && e.parameter ? e.parameter : {};

    // Validate required fields
    var missing = [];
    REQUIRED_FIELDS.forEach(function(field) {
      if (!(params[field] || '').toString().trim()) missing.push(field);
    });

    if (missing.length > 0) {
      output.setContent(JSON.stringify({ status:'error', message:'Missing: ' + missing.join(', ') }));
      return output;
    }

    var email = sanitise(params.email);
    if (!isValidEmail(email)) {
      output.setContent(JSON.stringify({ status:'error', message:'Invalid email address.' }));
      return output;
    }

    var timestamp = new Date();
    var row = [
      timestamp,
      sanitise(params.fullName),
      sanitise(params.companyName  || ''),
      email,
      sanitise(params.phone        || ''),
      sanitise(params.serviceRequired),
      sanitise(params.budget       || ''),
      sanitise(params.projectDetails),
      DEFAULT_SOURCE,
      DEFAULT_STATUS
    ];

    getOrCreateSheet().appendRow(row);

    output.setContent(JSON.stringify({ status:'success', message:'Enquiry received.', timestamp: timestamp.toISOString() }));
    return output;

  } catch (err) {
    Logger.log('JadooTech Error: ' + err.toString());
    output.setContent(JSON.stringify({ status:'error', message:'Internal error. Please try again.' }));
    return output;
  }
}

// ============================================================
// doGet — health check
// ============================================================
function doGet(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify({ status:'ok', service:'JadooTech Lead Capture' }));
  return output;
}

// ============================================================
// HELPERS
// ============================================================
function getOrCreateSheet() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    formatHeaderRow(sheet);
    return sheet;
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    formatHeaderRow(sheet);
  }
  return sheet;
}

function formatHeaderRow(sheet) {
  try {
    var r = sheet.getRange(1, 1, 1, HEADERS.length);
    r.setFontWeight('bold');
    r.setBackground('#0A1128');
    r.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    for (var i = 1; i <= HEADERS.length; i++) sheet.setColumnWidth(i, 160);
    sheet.setColumnWidth(8, 300);
  } catch(err) { Logger.log('Format warning: ' + err); }
}

function sanitise(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,'').substring(0, 2000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================
// TEST — Run this manually from the editor to verify
// ============================================================
function testSubmit() {
  var result = doPost({
    parameter: {
      fullName:'Test User', companyName:'Test Co', email:'test@example.com',
      phone:'+91 99999 99999', serviceRequired:'Website Development',
      budget:'₹25,000 – ₹50,000', projectDetails:'Test submission from editor.'
    }
  });
  Logger.log('Result: ' + result.getContent());
}
