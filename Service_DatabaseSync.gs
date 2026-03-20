function syncCustomerData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName("SCGนครหลวงJWDภูมิภาค");
  const targetSheet = ss.getSheetByName("Database");
  const nameMappingSheet = ss.getSheetByName("NameMapping");
  
  const sourceData = sourceSheet.getDataRange().getValues();
  const nameMapping = nameMappingSheet.getDataRange().getValues();
  const targetData = targetSheet.getDataRange().getValues();
  
  const existingUUIDs = new Set(targetData.map(row => row[0])); // Assuming UUID is in the first column

  for (let i = 1; i < sourceData.length; i++) {
    let row = sourceData[i];
    const uuid = row[0]; // Assuming UUID is in the first column

    // Check for duplicates
    if (existingUUIDs.has(uuid)) continue;

    // Name correction using NameMapping
    const name = row[1]; // Assuming name is in the second column
    const correctedName = mapName(name, nameMapping);

    // Address enrichment using PostalRef
    const address = enrichAddress(row[2]); // Assuming address info is in the third column

    // Prepare the new customer record
    const newData = [uuid, correctedName, address]; // Adjust according to the target sheet structure
    targetSheet.appendRow(newData);
  }
}

function mapName(name, nameMapping) {
  for (let i = 0; i < nameMapping.length; i++) {
    if (nameMapping[i][0] === name) { // Assuming mapping is in the first column
      return nameMapping[i][1]; // Return the corrected name from the second column
    }
  }
  return name; // Return original name if no mapping found
}

function enrichAddress(address) {
  // Example enrichment logic goes here
  return address; // Modify as necessary based on PostalRef logic
}