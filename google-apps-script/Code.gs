// ============================================================
// JADOOTECH ENTERPRISES — Google Apps Script
// File: google-apps-script/Code.gs
//
// PURPOSE:
//   Receives POST requests from the JadooTech Enterprises
//   website contact form and appends each enquiry as a new
//   row in a Google Sheet.
//
// SETUP:
//   1. Open your Google Sheet.
//   2. Go to Extensions → Apps Script.
//   3. Paste this entire file into the editor.
//   4. Update SPREADSHEET_ID below.
//   5. Deploy as a Web App (see README.md for full steps).
//   6. Copy the Web App URL into script.js → GOOGLE_SCRIPT_URL.
// ============================================================


// ============================================================
// CONFIGURATION — edit these values to match your setup
// ============================================================

/** The ID from your Google Sheet URL:
 *  https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 */
var SPREADSHEET_ID = '1Jv7NJhN-TXhAnxDjzscMLJDAUshOR14PsYfok8f7WrI';

/** The exact name of the sheet/tab where leads will be saved. */
var SHEET_NAME = 'Leads';

/** Column headers — must match the order in COLUMN_ORDER below.
 *  These are written to row 1 the first time the script runs
 *  if the sheet is empty.
 */
var HEADERS = [
  'Timestamp',
  'Full Name',
  'Company Name',
  'Email',
  'Phone',
  'Service Required',
  'Budget',
  'Project Details',
  'Source',
  'Status'
];

/** Default values appended by the server — not sent by the client. */
var DEFAULT_SOURCE = 'Website';
var DEFAULT_STATUS = 'New';

/** Required fields that must be present in every submission. */
var REQUIRED_FIELDS = ['fullName', 'email', 'serviceRequired', 'projectDetails'];


// ============================================================
// doPost — main entry point for form submissions
// ============================================================

/**
 * Handles HTTP POST requests from the website contact form.
 *
 * @param  {Object} e  Apps Script event object
 * @return {TextOutput} JSON response
 */
function doPost(e) {

  // Always return JSON with CORS headers so browsers can read the response.
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {

    // ── 1. Parse incoming parameters ──────────────────────────
    var params = e && e.parameter ? e.parameter : {};

    // ── 2. Validate required fields ───────────────────────────
    var missing = [];
    REQUIRED_FIELDS.forEach(function(field) {
      var value = (params[field] || '').toString().trim();
      if (!value) missing.push(field);
    });

    if (missing.length > 0) {
      output.setContent(JSON.stringify({
        status : 'error',
        message: 'Missing required fields: ' + missing.join(', ')
      }));
      return output;
    }

    // ── 3. Sanitise & extract values ──────────────────────────
    var fullName        = sanitise(params.fullName);
    var companyName     = sanitise(params.companyName     || '');
    var email           = sanitise(params.email);
    var phone           = sanitise(params.phone           || '');
    var serviceRequired = sanitise(params.serviceRequired);
    var budget          = sanitise(params.budget          || '');
    var projectDetails  = sanitise(params.projectDetails);

    // ── 4. Basic server-side email format check ────────────────
    if (!isValidEmail(email)) {
      output.setContent(JSON.stringify({
        status : 'error',
        message: 'Invalid email address provided.'
      }));
      return output;
    }

    // ── 5. Build the row ──────────────────────────────────────
    var timestamp = new Date();

    var row = [
      timestamp,       // 1. Timestamp
      fullName,        // 2. Full Name
      companyName,     // 3. Company Name
      email,           // 4. Email
      phone,           // 5. Phone
      serviceRequired, // 6. Service Required
      budget,          // 7. Budget
      projectDetails,  // 8. Project Details
      DEFAULT_SOURCE,  // 9. Source
      DEFAULT_STATUS   // 10. Status
    ];

    // ── 6. Open the sheet and append the row ──────────────────
    var sheet = getOrCreateSheet();
    sheet.appendRow(row);

    // ── 7. Return success ─────────────────────────────────────
    output.setContent(JSON.stringify({
      status   : 'success',
      message  : 'Enquiry received successfully.',
      timestamp: timestamp.toISOString()
    }));
    return output;

  } catch (err) {

    // ── 8. Catch unexpected errors ────────────────────────────
    Logger.log('JadooTech Form Error: ' + err.toString());

    output.setContent(JSON.stringify({
      status : 'error',
      message: 'An internal error occurred. Please try again later.'
    }));
    return output;
  }
}


// ============================================================
// doGet — simple health-check endpoint
// ============================================================

/**
 * Responds to GET requests (e.g. browser direct visit or health check).
 * Does NOT expose any lead data.
 *
 * @param  {Object} e  Apps Script event object
 * @return {TextOutput} JSON status response
 */
function doGet(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify({
    status : 'ok',
    service: 'JadooTech Enterprises Lead Capture',
    message: 'This endpoint accepts POST requests only.'
  }));
  return output;
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Opens the configured spreadsheet and returns the Leads sheet.
 * Creates the sheet with headers if it does not already exist.
 *
 * @return {Sheet} Google Sheets sheet object
 */
function getOrCreateSheet() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  // Create the sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    formatHeaderRow(sheet);
    return sheet;
  }

  // Add headers if the sheet is completely empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    formatHeaderRow(sheet);
  }

  return sheet;
}


/**
 * Formats the header row: bold, frozen, background colour.
 *
 * @param {Sheet} sheet
 */
function formatHeaderRow(sheet) {
  try {
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#0A1128');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);

    // Auto-resize columns for readability
    for (var i = 1; i <= HEADERS.length; i++) {
      sheet.setColumnWidth(i, 160);
    }
    // Make the Project Details column wider
    sheet.setColumnWidth(8, 300);
  } catch (err) {
    // Formatting is optional — log and continue
    Logger.log('Header formatting warning: ' + err.toString());
  }
}


/**
 * Sanitises a string value:
 * - Trims whitespace
 * - Removes control characters
 * - Limits length to 2000 characters
 *
 * @param  {*}      value  Input value
 * @return {string}        Sanitised string
 */
function sanitise(value) {
  if (value === null || value === undefined) return '';
  var str = String(value)
    .trim()
    // Remove control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limit length
    .substring(0, 2000);
  return str;
}


/**
 * Basic server-side email validation.
 *
 * @param  {string}  email
 * @return {boolean}
 */
function isValidEmail(email) {
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}


// ============================================================
// MANUAL TEST FUNCTION
// Run this from the Apps Script editor to verify the setup
// without needing a live form submission.
// ============================================================

/**
 * testSubmit — run manually from the Apps Script editor.
 * Go to: Run → testSubmit
 * Then open your Google Sheet to verify the row was added.
 */
function testSubmit() {
  var mockEvent = {
    parameter: {
      fullName       : 'Test User',
      companyName    : 'Test Company',
      email          : 'test@example.com',
      phone          : '+91 99999 99999',
      serviceRequired: 'Website Development',
      budget         : '₹25,000 – ₹50,000',
      projectDetails : 'This is a test submission from the Apps Script editor.',
      source         : 'Website'
    }
  };

  var result = doPost(mockEvent);
  Logger.log('Test result: ' + result.getContent());
}
