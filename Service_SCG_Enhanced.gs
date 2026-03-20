function readNewCustomersFromSCGSheet() {
    const sheetName = 'SCGนครหลวงJWDภูมิภาค';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    
    // Process and return new customers
    let customers = [];
    for (let i = 1; i < data.length; i++) {
        customers.push(data[i]);
    }
    return customers;
}

function enrichWithNameMappingAndPostal(customers) {
    const nameMappingSheet = 'NameMapping';
    const postalRefSheet = 'PostalRef';
    const nameMappingData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nameMappingSheet).getDataRange().getValues();
    const postalData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(postalRefSheet).getDataRange().getValues();

    // Logic to enrich customers with name and postal data
    let enrichedCustomers = customers.map(customer => {
        // Example for mapping name and postal
        // Replace with actual mapping logic
        return {
            name: customer[0], // Example for name position
            postal: postalData.find(postal => postal[0] === customer[1])[1] // Example logic for postal
        };
    });
    return enrichedCustomers;
}

function archiveToDatabase(enrichedCustomers) {
    const databaseSheet = 'Database';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(databaseSheet);
    enrichedCustomers.forEach(customer => {
        const timestamp = new Date().toISOString();
        const uuid = generateUUID(); // Implement UUID generation as needed
        sheet.appendRow([uuid, timestamp, customer.name, customer.postal]);
    });
}

// Integrating into fetchDataFromSCGJWD
function fetchDataFromSCGJWD() {
    const customers = readNewCustomersFromSCGSheet();
    const enrichedCustomers = enrichWithNameMappingAndPostal(customers);
    archiveToDatabase(enrichedCustomers);
}

function generateUUID() {
    // Logic for UUID generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}