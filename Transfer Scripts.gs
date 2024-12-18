function onEdit(e) {
  // Get details of edit event's sheet
  const thisSheet = e.range.getSheet();
  const thisSheetName = thisSheet.getName();

  var debug_e = {
    authMode:  e.authMode,
    range:  e.range.getA1Notation(),
    sheetName : e.range.getSheet().getName(),
    source:  e.source,
    value:  e.value,
    oldValue: e.oldValue
  }

  console.log(`eventObject: ${debug_e}`);

  console.log(`onEdit 1 -> thisSheetName: ${thisSheetName}`);
  
  // Check if legal sheet
  if(thisSheetName != SHEET_NAME && thisSheetName != MASTER_NAME) return;

  console.log("onEdit -> Passed first check");

  // Check if legal edit
  if(!verifyLegalEditInRange(e, thisSheet)) return;

  console.log("onEdit 2 -> Passed verifyLegalEditInRange");

  // Get the email column for the current sheet
  const thisEmailCol = GET_COL_MAP_(thisSheetName).emailCol;
  const thisRow = e.range.getRow();

  console.log(`onEdit 3 -> thisEmailCol: ${thisEmailCol} thisRow: ${thisRow}`);

  // Get email from `thisRow` and `thisEmailCol`
  const email = thisSheet.getRange(thisRow, thisEmailCol).getValue();

  const isMainSheet = (thisSheetName == SHEET_NAME);
  console.log(`onEdit 4 -> email: ${email} isMainSheet: ${isMainSheet}`);

  const sourceSheet = isMainSheet ? MAIN_SHEET : MASTER_SHEET;
  const targetSheet = isMainSheet ? MASTER_SHEET : MAIN_SHEET;
  const targetRow = findMemberByEmail(email, targetSheet);  // Find row of member in `targetSheet` using their email

  // Throw error message if member not in `targetSheet`
  if(targetRow == null) {
    const errorMessage = `
      targetRow not found in onEdit(). 
      Edit made in ${thisSheetName} at row ${thisRow}.
      Email of edited member: ${email}. Please review this error.
    `
    throw Error(errorMessage);
  }

  console.log(`onEdit 5 -> targetRow: ${targetRow} found by \`findMemberByBinarySearch()\``);
    
  updateFeeInfo(e, sourceSheet, targetRow, targetSheet);
  console.log(`onEdit 6 -> successfully completed trigger check`);
}

function test_onEdit() {
  onEdit({
    user : Session.getActiveUser().getEmail(),
    source : SpreadsheetApp.getActiveSpreadsheet(),
    range : SpreadsheetApp.getActiveSpreadsheet().getActiveCell(),
    value : SpreadsheetApp.getActiveSpreadsheet().getActiveCell().getValue(),
    authMode : "LIMITED"
  });
}


/**
 * @param {Event} e  Event Object from `onEdit`.
 * @param {SpreadsheetApp.Sheet} sheet  Sheet where edit occurred.
 */

function verifyLegalEditInRange(e, sheet) {
  Logger.log("NOW ENTERING verifyLegalEditInRange()...");
  const sheetName = sheet.getName();
  var thisRow = e.range.getRow();
  var thisCol = e.range.getColumn();
  Logger.log(`verifyLegalEditInRange 1 -> sheetName: ${sheetName}`);
  
  // Function to get column mappings
  const feeStatus = GET_COL_MAP_(sheetName).feeStatus;
  const isInternalCollected = GET_COL_MAP_(sheetName).isInternalCollected;

  Logger.log(`verifyLegalEditInRange 2 -> feeStatusCol: ${feeStatus}, isInternalCollected: ${isInternalCollected}`);
  
  const feeEditRange = {
    top : 2,    // Skip header row
    bottom : sheet.getLastRow(),
    leftmost : feeStatus,
    rightmost : isInternalCollected,
  }

  // Helper function to log error message and exit function
  const logAndExitFalse = (cell) => { Logger.log(`${cell} is out of bounds`); return false; }

  // Exit if we're out of range
  if (thisRow < feeEditRange.top || thisRow > feeEditRange.bottom) logAndExitFalse("Row");
  if (thisCol < feeEditRange.left || thisCol > feeEditRange.right) logAndExitFalse("Column");
  
  return true;    // edit e is within legal edit range
}


/** 
 * Update fee status from `sourceSheet` to `targetSheet`.
 * 
 * @param {Event} e  Event Object from `onEdit`.
 * @param {SpreadsheetApp.Sheet} sourceSheet  Source sheet to extract fee info.
 * @param {number} targetRow  Target row to update.
 * @param {SpreadsheetApp.Sheet} targetSheet  Target sheet to update fee info.
 * 
 * @author [Andrey Gonzalez](<andrey.gonzalez@mail.mcgill.ca>)
 * @date  Dec 16, 2024
 * @update  Dec 16, 2024
 * 
 */

function updateFeeInfo(e, sourceSheet, targetRow, targetSheet) {
  const thisRange = e.range;
  const thisCol = thisRange.getColumn();

  console.log(`NOW ENTERING updateFeeInfo()`);
  console.log(`{Source: ${sourceSheet}, Target: ${targetSheet}, targetRow: ${targetRow}, thisCol: ${thisCol}}`);

  const sourceCols = getColsFromSheet(sourceSheet);   //TODO: change to GET_COL_MAP_
  const targetCols = getColsFromSheet(targetSheet);   // same

  Logger.log("updateFeeInfo 1 -> Successfully got sourceCols and targetCols");

  // Find respective column where `targetCol` contains same data as `sourceCol`.
  const getTargetCol = (sourceCol) => {
    switch(sourceCol) {
      case(sourceCols.feeStatus) : return targetCols.feeStatus;
      case(sourceCols.collectionDate) : return targetCols.collectionDate;
      case(sourceCols.collector) : return targetCols.collector;
      case(sourceCols.isInternalCollected) : return target.isInternalCollected;
    }
  };

  // Find which column was edited in `sourceSheet` and find respective col in `targetSheet`
  const targetCol = getTargetCol(thisCol);
  Logger.log(`updateFeeInfo 2 -> targetRow: ${targetRow} targetCol: ${targetCol}`);
  
  const targetRange = targetSheet.getRange(targetRow, targetCol);

  thisRange.copyTo(targetRange, {contentsOnly: true});
  console.log("updateFeeInfo 2 ->  finished copying to target cell");
}
  

function updateFeeInfo2_(sourceRow, sourceSheet, targetRow, targetSheet) {
  sourceCols = getColsFromSheet(sourceSheet);
  targetCols = getColsFromSheet(targetSheet);

  const transferValue = (fromCell, toCell) => {
    let fromValue = fromCell.getValue();
    Logger.log("Previous value: " + toValue.getValue());    // Add previous value to execution log
    toCell.setValue(fromValue);
  }

  oldFeeStatusRange = targetSheet.getRange(targetRow, targetCols.feeStatus);
  newFeeStatusRange = sourceSheet.getRange(sourceRow, sourceSheet.feeStatus);
  transferValue(oldFeeStatusRange, newFeeStatusRange);

  oldCollectionDateRange = targetSheet.getRange(targetRow, targetCols.collectionDate);
  newCollectionDateRange = source.getRange(row, sourceSheet.collectionDate);

  oldCollector = targetSheet.getRange(targetRow, targetCols.collector);
  newCollector = source.getRange(sourceRow, sourceSheet.collector);

  oldInternalCollectedRange = targetSheet.getRange(targetRow, targetCols.isInternalCollected);
  newInternalCollectedRange = source.getRange(sourceRow, sourceSheet.isInternalCollected);
}


/** 
 * @author: Andrey S Gonzalez
 * @date: Oct 18, 2023
 * @update: Oct 18, 2023
 * 
 * Triggered by `checkURLFromIndex` when PassKit URL in `BACKUP` exists & !isCopied
 * 
 */

function copyToMain(url, targetEmail) {
  const mainSheet = MAIN_SHEET;
  const EMAIL_COL = 1;
  const URL_COL = 21;
  
  var mainData = mainSheet.getDataRange().getValues();
  var targetData = [];
  var mainRow, email, i;

  // Loop through rows in `main` until matching email entry is found
  for (i = 0; i < mainData.length; i++) {
    mainRow = mainData[i];
    email = mainRow[EMAIL_COL]; // get email using email column index
    
    if (email === targetEmail) {
      targetData.push(mainRow);
      break; // Exit the loop once the matching row is found
    }
  }

  // Copy URL when match is found
  if (targetData.length > 0) {
    targetRow = i + 1;
    mainSheet.getRange(targetRow, URL_COL).setValue(url);
    return true;
  }

  return false;
}

