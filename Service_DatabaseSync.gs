function syncNewCustomers() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dataSheet = ss.getSheetByName('Data');
    var dbSheet = ss.getSheetByName('Database');
    var nameMapping = getNameMappings();
    var postalRefs = getPostalRefs();

    // Get the last row from the database
    var lastRow = dbSheet.getLastRow();

    // Get data from Data sheet
    var dataRange = dataSheet.getDataRange();
    var dataValues = dataRange.getValues();

    // Iterate through each row in the Data sheet
    for (var i = 1; i < dataValues.length; i++) { // skip header row
        var customer = dataValues[i];
        var name = customer[0]; // assuming name is in the first column
        var address = customer[1]; // assuming address is in the second column

        // Correct name using NameMapping
        if (nameMapping[name]) {
            name = nameMapping[name];
        }

        // Enrich address using PostalRef
        if (postalRefs[address]) {
            address = postalRefs[address];
        }

        // Check if customer already exists in Database
        var exists = false;
        for (var j = 1; j <= lastRow; j++) {
            if (dbSheet.getRange(j, 1).getValue() === name) {
                exists = true;
                break;
            }
        }

        // If customer does not exist, add to Database
        if (!exists) {
            dbSheet.appendRow([name, address]);
        }
    }
}

function getNameMappings() {
    return {
        'John Doe': 'Jonathan Doe',
        'Jane Smith': 'Janet Smith'
        // Add more mappings as needed
    };
}

function getPostalRefs() {
    return {
        '123 Main St': '123 Main Street, Apt 4B',
        '456 Elm St': '456 Elm Street'
        // Add more postal references as needed
    };
}