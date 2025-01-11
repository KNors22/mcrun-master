/**
 * Trim whitespace from specific columns in last row of `MAIN_SHEET`.
 * 
 * Range is FIRST_NAME_COL to REFERAL_COL (7 columns).
 * 
 * @trigger New form submission
 * 
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Oct 17, 2023
 * @update  Jan 11, 2024
 */

function trimWhitespace_() {
  const sheet = MAIN_SHEET;
  
  const lastRow = sheet.getLastRow();
  const rangeToFormat = sheet.getRange(lastRow, FIRST_NAME_COL, 1, 7);
  rangeToFormat.trimWhitespace();
}


/**
 * Returns reg expression for target string.
 * 
 * @param {string}  targetSubstring  String used to create regex.
 * @return {RegExp}   Returns regular expression.
 * 
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Oct 8, 2023
 */

function getRegEx_(targetSubstring) {
  return RegExp(targetSubstring, 'g');
}


///  👉 FUNCTIONS APPLIED TO MAIN_SHEET 👈  \\\

/**
 * Sorts `MAIN_SHEET` by first name, then last name.
 * 
 * @trigger New form submission or McRUN menu.
 *  
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Oct 1, 2023
 * @update  Jan 11, 2025
 */

function sortMainByName() {
  const sheet = MAIN_SHEET;

  const numRows = sheet.getLastRow() - 1;     // Remove header row from count
  const numCols = sheet.getLastColumn();
  
  // Sort all the way to the last row, without the header row
  const range = sheet.getRange(2, 1, numRows, numCols);
  
  // Sorts values by `First Name` then by `Last Name`
  range.sort([{column: 3, ascending: true}, {column: 4, ascending: true}]);
}


/**
 * Formats `MAIN_SHEET` for simple and uniform UX.
 * 
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Oct 1, 2023
 * @update  Jan 11, 2025
 */

function formatMainView() {
  const sheet = MAIN_SHEET;
  //const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Fall 2024");

  // Freeze two leftmost columns and first row
  sheet.setFrozenColumns(2);
  sheet.setFrozenRows(1);

  // Set Text to Bold
  const rangeListToBold = sheet.getRangeList([
    'A1:T1',  // Header Row
    'A2:A',   // Registration
    'E2:E',   // Preferred Name
    'K2:L',   // Payment Method + Interac Ref Number
    'O2:P',   // Collection Date + Collector
    'T2:T',   // Member ID
  ]);   
  rangeListToBold.setFontWeight('bold');

  // Set head row to 11
  sheet.getRange('A1:T1').setFontSize(11).set;

  // Reduce Font to 10
  const rangeListToSetFont10 = sheet.getRangeList([
    'E1',   // Prefered Name (Header Cell)
    'T2:T', // Member ID
    'N1',   // Fee Paid (Header Cell)
    'S1',   // Attendance Status (Header Cell)
  ]);
  rangeListToSetFont10.setFontSize(10).set;

  // Reduce font to 9
  const rangeListToSetFont9 = sheet.getRangeList([
    'Q1',     // Given to Internal (Header Cell)
    'T2:T',   // Member ID
  ]);
  rangeListToSetFont9.setFontSize(9).set;

  // Set font of Payment Method + Interac Ref Number to 8
  sheet.getRange('K1:L1').setFontSize(8).set;


  // Change font family of Member ID to 'Google Sans Mono'
  sheet.getRange('T2:T').setFontFamily('Google Sans Mono');

  // Set formatting type of collection date
  sheet.getRange('O2:O').setNumberFormat('mmm d, yyyy');
  

  // Set Text Wrapping to 'Clip'
  const rangeListToClipWrap = sheet.getRangeList([
    'J1:J',   // Waiver
    'K2:K'    // Payment Choice
  ]);
  rangeListToClipWrap.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  // Align range to Right
  sheet.getRange('A2:A').setHorizontalAlignment('right');

  // Centre these ranges
  const rangeListToCentre = sheet.getRangeList([
    'L2:L',   // Interac Ref
    'N2:Q',   // Fee Paid... Given to Internal
    'S2:T',   // Attendance Status + Member ID
  ])
  rangeListToCentre.setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Link pixel size to column index
  const sizeMap = {
    [REGISTRATION_DATE_COL]: 140,
    [EMAIL_COL]: 245,
    [FIRST_NAME_COL]: 115,
    [LAST_NAME_COL]: 115,
    [PREFERRED_NAME]: 120,
    [YEAR_COL]: 90,
    [PROGRAM_COL]: 240,
    [DESCRIPTION_COL]: 400,
    [REFERRAL_COL]: 145,
    [WAIVER_COL]: 185,
    [PAYMENT_METHOD_COL]: 139,
    [INTERACT_REF_COL]: 155,
    [EMPTY_COL]: 40,
    [IS_FEE_PAID_COL]: 75,
    [COLLECTION_DATE_COL]: 150,
    [COLLECTION_PERSON_COL]: 150,
    [IS_INTERNAL_COLLECTED_COL]: 65,
    [COMMENTS_COL]: 255,
    [ATTENDANCE_STATUS]: 125,
    [MEMBER_ID_COL]: 140,
  }

  // Resize columns by their corresponding pixel size
  for (const [col, width] of Object.entries(sizeMap)) {
    sheet.setColumnWidth(col, width);
  }

}


/**
 * Set letter case of specific columns in member entry as following:
 *  - Lower Case: [McGill Email Address] 
 *  - Capitalized: [First Name, Last Name, Preferred Name/Pronouns, Year, Program]
 * 
 * @param {number} [row=MASTER_SHEET.getLastRow()] 
 *                    Row number to target fix.
 *                    Defaults to last row (1-indexed).
 * 
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Dec 11, 2024
 * @update  Dec 11, 2024
 * 
 */

function fixLetterCaseInRow_(row=MASTER_SHEET.getLastRow()) {
  const sheet = MAIN_SHEET;
  const lastRow = getLastSubmissionInMain();

  // Set to lower case
  const rangeToLowerCase = sheet.getRange(lastRow, EMAIL_COL);
  const rawValue = rangeToLowerCase.getValue().toString();
  rangeToLowerCase.setValue(rawValue.toLowerCase());

  // Set to Capitalized (first letter of word is UPPER)
  const rangeToCapitalize = sheet.getRange(lastRow, FIRST_NAME_COL, 1, 5);
  const valuesToCapitalize = rangeToCapitalize.getValues()[0]   // Flatten array
  
  // Capitalize each value in array
  const capitalizedValues = valuesToCapitalize.map(value => 
    value.replace(/\b\w/g, l => l.toUpperCase())
  );

  // Now replace raw values with capitalized ones
  rangeToCapitalize.setValues([ capitalizedValues ]); // setValues requires 2d array
}


///  👉 FUNCTIONS APPLIED TO MASTER_SHEET 👈  \\\

/**
 * Sorts `MASTER` by email instead of first name.
 * Required to ensure `findSubmissionByEmail` works properly.
 * 
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Oct 27, 2024
 * @update  Jan 11, 2025
 */

function sortMasterByEmail() {
  const sheet = MASTER_SHEET;
  const numRows = sheet.getLastRow() - 1;   // Remove Header from count
  const numCols = sheet.getLastColumn();
    
  // Sort all the way to the last row, without the header row
  const range = sheet.getRange(2, 1, numRows, numCols);
    
  // Sorts values by email
  range.sort([{column: 1, ascending: true}]);
}


/**
 * Formats `MASTER_SHEET` for simple and uniform UX.
 * 
 * Remove whitespace from `McGill Email Address` to  `Referral`
 * 
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Nov 22, 2024
 * @update  Dec 15, 2024
 */

function formatMasterView() {
  var sheet = MASTER_SHEET;

  // Set Text to Bold
  const rangeListToBold = sheet.getRangeList([
    'K2:K',   // Latest Reg Semester
    'N2:N',   // Fee Paid
  ]);   
  rangeListToBold.setFontWeight('bold');

  // Reduce Font to 9
  const rangeListReduceFont = sheet.getRangeList([
    'H2:H',   // Member Description
    'I2:I',   // Referral
    'J2:J',   // Latest Registration Timestamp
    'L2:L',   // Registration History
    'N2:N',   // Fee Paid
    'Q2:Q',   // Collection Date
    'R2:R',   // Given to Internal
    'S2:S',   // Payment History
    'T2:T',   // Comments
    'U2:U',   // Attendance Status
    'V2:V',   // Member ID
  ]);
  rangeListReduceFont.setFontSize(9).set;

  // Change Font Family to 'Google Sans Mono'
  const rangeListToGoogleSansMono = sheet.getRangeList([
    'L2:L',   // Registration History
    'N2:N',   // Fee Paid
    'S2:S',   // Payment History
    'V2:V',   // Member ID
  ]);
  rangeListToGoogleSansMono.setFontFamily('Google Sans Mono');

  // Change Font Family to Helvetica
  const rangeListToHelvetica = sheet.getRangeList([
    'H2:H',   // Member Description
    'O2:O',   // Fee Expiration
    'P2:P',   // Collected By
    'T2:T',   // Comments
  ]);
  rangeListToHelvetica.setFontFamily('Helvetica');

  // Change to Clip Wrap
  const rangeListToClipWrap = sheet.getRangeList([
    'E2:E',   // Year
    'F2:F',   // Program
    'G2:G',   // Waiver
    'H2:H',   // Member Description
  ]);
  rangeListToClipWrap.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  // Modify to Middle-Centre Alignment
  const rangeListToCenter = sheet.getRangeList([
    'J2:J',   // Latest Registration Timestamp
    'K2:K',   // Latest Registration Code
    'L2:L',   // Registration History
    'N2:N',   // Fee Paid
    'O2:O',   // Fee Expiration
    'P2:P',   // Collected By
    'Q2:Q',   // Collection Date
    'R2:R',   // Given to Internal
    'S2:S',   // Payment History
    'U2:U',   // Attendance Status
    'V2:V',   // Member ID
  ]);
  rangeListToCenter.setHorizontalAlignment('center');
  rangeListToCenter.setVerticalAlignment('middle');

  // Show Hyperlink for Waivers
  const rangeListShowHyperlink = sheet.getRangeList(['G2:G']);
  rangeListShowHyperlink.setShowHyperlink(true);

  // Set formatting type of collection date
  const rangeCollectionDate = sheet.getRange('Q2:Q');
  rangeCollectionDate.setNumberFormat('yyyy-mm-dd');
}


/**
 * Clean latest member registration in `MASTER_SHEET`.
 * 
 * Data normalization includes:
 * 
 *  - Trim whitespace
 *  - Capitalize selected values e.g. name, year, program
 *  - Insert fee status formula in `Fee Paid` col
 *  - Format collection date correctly; append semester code if applicable
 * 
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Nov 22, 2024
 * @update  Nov 22, 2024
 */

function cleanMasterRegistration() {
  var sheet = MASTER_SHEET;
  const lastRow = sheet.getLastRow();

  // STEP 1: Trim white space from `Email` col to `Referral` col
  const rangeToTrim = sheet.getRange(lastRow, MASTER_EMAIL_COL, 1, 9);
  rangeToTrim.trimWhitespace();

  // STEP 2: Capitalize selected value
  const rangeToCapitalize = sheet.getRange(lastRow, MASTER_FIRST_NAME_COL, 1, 5);
  var valuesToCapitalize = rangeToCapitalize.getValues()[0]; // Get all the values as 1D arr

  valuesToCapitalize.forEach((cell, colIndex) => {
    if (typeof cell === "string") {   // Ensure it's a string before capitalizing
      valuesToCapitalize[colIndex] = cell
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
    }
  });

  // Replace values with formatted values
  rangeToCapitalize.setValues([valuesToCapitalize]);  // setValues() requires 2D array

}


/**
 * Recursive function to search for entry by email in `MASTER` sheet using binary search.
 * 
 * Returns email's row index in GSheet (1-indexed), or null if not found.
 * 
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>) & ChatGPT
 * @date  Nov 22, 2024
 * @update  Nov 22, 2024
 * 
 * @param {number} [row=MASTER_SHEET.getLastRow()]  
 *                      The starting row index for the search (1-indexed). 
 *                      Defaults to 1 (the first row).
 * 
 */

function formatFeeCollection(row=MASTER_SHEET.getLastRow()) {
  var sheet = MASTER_SHEET;

  // STEP 1: Check for current fee status to flag for later
  const rangeFeeStatus = sheet.getRange(row, MASTER_FEE_STATUS);
  const feeStatus = rangeFeeStatus.getValue().toString();

  const regex = new RegExp('unpaid', "i"); // Case insensitive
  const isUnpaid = feeStatus.includes("unpaid")           // FIX LINE!!
  
  //.search(regex);
  
  // STEP 2: Insert fee status formula in `Fee Paid` col
  rangeFeeStatus.setFormula(isFeePaidFormula);    // Formula found in `Semester Variables.gs`

  // If feeStatus is unpaid, formatting is completed.
  if(isUnpaid) return;

  // STEP 3: Format collection date correctly;
  const rangeCollectionDate = sheet.getRange(row, MASTER_COLLECTION_DATE);
  const collectionDate = rangeCollectionDate.getValue();   // Format is yyyy-mm-dd hh:mm

  const formattedDate = Utilities.formatDate(collectionDate, TIMEZONE, 'yyyy-MM-dd');
  rangeCollectionDate.setValue(formattedDate);

  // STEP 4: Append semester code if collection date non-empty
  if(!collectionDate) return;

  const rangePaymentHistory = sheet.getRange(row, MASTER_PAYMENT_HIST);
  const semCode = getSemesterCode_(SHEET_NAME);   // Get semCode from `MAIN_SHEET`
  rangePaymentHistory.setValue(semCode);
}


function insertRegistrationSem(row=MASTER_SHEET.getLastRow()) {
  var sheet = MASTER_SHEET;
  const rangeLatestRegSem = sheet.getRange(row, MASTER_LAST_REG_SEM);

  const semCode = getSemesterCode_(SHEET_NAME);   // Get semCode from `MAIN_SHEET`
  rangeLatestRegSem.setValue(semCode);
}


///  👉 FUNCTIONS FOR MEMBER ID ENCODING 👈  \\\

/**
 * Create Member ID from input.
 *  
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Dec 15, 2024
 * @update  Dec 15, 2024
 */

function encodeFromInput(input) {
  return MD5(input);
}

/**
 * Create Member ID in last row of `MAIN_SHEET`.
 *  
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Oct 9, 2023
 * @update  Oct 20, 2024
 */

function encodeLastRow() {
  const sheet = MAIN_SHEET;
  const newSubmissionRow = getLastSubmissionInMain();
  
  const email = sheet.getRange(newSubmissionRow, EMAIL_COL).getValue();
  const member_id = MD5(email);
  sheet.getRange(newSubmissionRow, MEMBER_ID_COL).setValue(member_id);
}


/**
 * Create Member ID for every member in `sheet`.
 * 
 * @param {SpreadsheetApp.Sheet} sheet  Sheet reference to encode
 *  
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Oct 20, 2024
 * @update  Dec 18, 2024
 */

function encodeList(sheet) {
  const sheetName = sheet.getSheetName();
  let sheetCols = GET_COL_MAP_(sheetName);

  // Start at row 2 (1-indexed)
  for (var i = 2; i <= sheet.getMaxRows(); i++) {
    var email = sheet.getRange(i, sheetCols.emailCol).getValue();
    if (email === "") return;   // check for invalid row

    var member_id = MD5(email);
    sheet.getRange(i, sheetCols.memberIdCol).setValue(member_id);
  }
}


/**
 * Create single Member ID using row number from `sheet`.
 * 
 * @param {SpreadsheetApp.Sheet} sheet  Sheet reference to target
 * @param {integer} [row=sheet.getLastRow()]    The 1-indexed row in input `sheet`. 
 *                                              Defaults to the last row in the sheet.
 *  
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Oct 20, 2024
 * @update  Dec 18, 2024
 */

function encodeByRow(sheet, row=sheet.getLastRow()) {
  const sheetName = sheet.getSheetName();
  let sheetCols = GET_COL_MAP_(sheetName);

  const email = sheet.getRange(row, sheetCols.emailCol).getValue();
  if (email === "") throw RangeError("Invalid index access");   // check for invalid index

  const member_id = MD5(email);
  sheet.getRange(row, sheetCols.memberIdCol).setValue(member_id);
}
