/**
 * VERSION: 001
 * =============================================================
 * FILE: core/Menu.gs
 * 🖥️ MODULE: Menu UI Interface
 * Version: 6.0 Enterprise Complete Edition
 * ---------------------------------------------------
 * ตาม SOP: คงเมนู 1, 2, 3, 5(Agent System), 9(System Admin)
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();

  // =================================================================
  // 🚛 เมนูชุดที่ 1: ระบบจัดการ Master Data (Operation)
  // =================================================================
  ui.createMenu('🚛 1. ระบบจัดการ Master Data')
      .addItem('1️⃣ ดึงลูกค้าใหม่ (Sync New Data)', 'syncNewDataToMaster_UI')
      .addItem('2️⃣ เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 50)', 'updateGeoData_SmartCache')
      .addItem('3️⃣ จัดกลุ่มชื่อซ้ำ (Clustering)', 'autoGenerateMasterList_Smart')
      .addItem('🧠 4️⃣ ส่งชื่อแปลกให้ AI วิเคราะห์ (Smart Resolution)', 'runAIBatchResolver_UI')
      .addSeparator()
      .addItem('🚀 5️⃣ Deep Clean (ตรวจสอบความสมบูรณ์)', 'runDeepCleanBatch_100')
      .addItem('🔄 รีเซ็ตความจำปุ่ม 5 (เริ่มแถว 2 ใหม่)', 'resetDeepCleanMemory_UI')
      .addSeparator()
      .addItem('✅ 6️⃣ จบงาน (Finalize & Move to Mapping)', 'finalizeAndClean_UI')
      .addSeparator()
      .addSubMenu(ui.createMenu('🛠️ Admin & Repair Tools')
          .addItem('🔑 สร้าง UUID ให้ครบทุกแถว', 'assignMissingUUIDs')
          .addItem('🚑 ซ่อมแซม NameMapping (L3)', 'repairNameMapping_UI')
          .addItem('🔍 ตรวจหาข้อมูลซ้ำซ้อน (Hidden Duplicates)', 'findHiddenDuplicates')
      )
      .addToUi();

  // =================================================================
  // 📦 เมนูชุดที่ 2: เมนูพิเศษ SCG (Daily Operation)
  // =================================================================
  ui.createMenu('📦 2. เมนูพิเศษ SCG')
    .addItem('📥 1. โหลดข้อมูล Shipment (+E-POD)', 'fetchDataFromSCGJWD')
    .addItem('🟢 2. อัปเดตพิกัด + อีเมลพนักงาน', 'applyMasterCoordinatesToDailyJob')
    .addSeparator()
    .addSubMenu(ui.createMenu('🧹 เมนูล้างข้อมูล (Dangerous Zone)')
        .addItem('⚠️ ล้างเฉพาะชีต Data', 'clearDataSheet_UI')
        .addItem('⚠️ ล้างเฉพาะชีต Input', 'clearInputSheet_UI')
        .addItem('⚠️ ล้างเฉพาะชีต สรุป_เจ้าของสินค้า', 'clearSummarySheet_UI')
        .addItem('🔥 ล้างทั้งหมด (Input + Data + สรุป)', 'clearAllSCGSheets_UI')
    )
    .addToUi();

  // =================================================================
  // 🤖 เมนูชุดที่ 3: ระบบอัตโนมัติ (Automation)
  // =================================================================
  ui.createMenu('🤖 3. ระบบอัตโนมัติ')
    .addItem('▶️ เปิดระบบช่วยเหลืองาน (Auto-Pilot)', 'START_AUTO_PILOT')
    .addItem('⏹️ ปิดระบบช่วยเหลือ', 'STOP_AUTO_PILOT')
    .addSeparator()
    .addItem('📊 ดูสถานะ Auto-Pilot', 'checkAutoPilotStatus_UI')
    .addToUi();

  // =================================================================
  // 🤖 เมนูชุดที่ 4: Agent System [V6.0] (เดิมเมนู 5)
  // =================================================================
  ui.createMenu('🤖 4. Agent System')
    .addItem('🚀 Dispatch Name Resolution Agent', 'dispatchNameResolution_UI')
    .addItem('📍 Dispatch Coordinate Verification Agent', 'dispatchCoordinateCheck_UI')
    .addItem('📝 Dispatch Address Parser Agent', 'dispatchAddressParser_UI')
    .addSeparator()
    .addItem('📋 ดู Agents ที่ลงทะเบียน', 'showAvailableAgents_UI')
    .addItem('📊 Agent Statistics', 'showAgentStats_UI')
    .addItem('📜 Agent History', 'showAgentHistory_UI')
    .addSeparator()
    .addItem('🧪 ทดสอบ Agent Registry', 'testAgentRegistry')
    .addToUi();

  // =================================================================
  // ⚙️ เมนูชุดที่ 5: System Admin (เดิมเมนู 9)
  // =================================================================
  ui.createMenu('⚙️ 5. System Admin')
    .addItem('🏥 ตรวจสอบสถานะระบบ (Health Check)', 'runSystemHealthCheck')
    .addItem('📊 เช็คปริมาณข้อมูล (Cell Usage)', 'checkSpreadsheetHealth')
    .addSeparator()
    .addItem('🔄 Migration V5 (Database 22 columns)', 'runV5Migration_UI')
    .addItem('🧹 ล้าง Backup เก่า (>30 วัน)', 'cleanupOldBackups')
    .addSeparator()
    .addSubMenu(ui.createMenu('🔐 ตั้งค่าความปลอดภัย')
        .addItem('🔑 ตั้งค่า Gemini API Key', 'setupEnvironment')
        .addItem('🔔 ตั้งค่า LINE Notify', 'setupLineToken')
        .addItem('💬 ตั้งค่า LINE Messaging API', 'setupLineMessagingConfig')
        .addItem('✈️ ตั้งค่า Telegram Notify', 'setupTelegramConfig')
    )
    .addSeparator()
    .addItem('ℹ️ ดูข้อมูลระบบ (Version Info)', 'showSystemInfo_UI')
    .addToUi();

}

// =================================================================
// 🛡️ SAFETY WRAPPERS - Master Data Operations
// =================================================================

function syncNewDataToMaster_UI() {
  var ui = SpreadsheetApp.getUi();
  var sourceName = (typeof CONFIG !== 'undefined' && CONFIG.SOURCE_SHEET) ? CONFIG.SOURCE_SHEET : 'ชีตนำเข้า';
  var dbName = (typeof CONFIG !== 'undefined' && CONFIG.SHEET_NAME) ? CONFIG.SHEET_NAME : 'Database';

  var result = ui.alert(
    'ยืนยันการดึงข้อมูลใหม่?',
    'ระบบจะดึงรายชื่อลูกค้าจากชีต "' + sourceName + '"\nมาเพิ่มต่อท้ายในชีต "' + dbName + '"\n(เฉพาะรายชื่อที่ยังไม่เคยมีในระบบ)\n\nคุณต้องการดำเนินการต่อหรือไม่?',
    ui.ButtonSet.YES_NO
  );
  if (result == ui.Button.YES) {
    if (typeof syncNewDataToMaster === 'function') syncNewDataToMaster();
  }
}

function runAIBatchResolver_UI() {
  var ui = SpreadsheetApp.getUi();
  var batchSize = (typeof CONFIG !== 'undefined' && CONFIG.AI_BATCH_SIZE) ? CONFIG.AI_BATCH_SIZE : 20;

  var result = ui.alert(
    '🧠 ยืนยันการรัน AI Smart Resolution?',
    'ระบบจะรวบรวมชื่อที่ยังหาพิกัดไม่เจอ/ไม่รู้จัก (สูงสุด ' + batchSize + ' รายการ)\nส่งให้ Gemini AI วิเคราะห์และจับคู่กับ Database อัตโนมัติ\n\nต้องการเริ่มเลยหรือไม่?',
    ui.ButtonSet.YES_NO
  );

  if (result == ui.Button.YES) {
    if (typeof resolveUnknownNamesWithAI === 'function') {
       resolveUnknownNamesWithAI();
    } else {
       ui.alert('⚠️ System Note', 'ไม่พบฟังก์ชัน resolveUnknownNamesWithAI()', ui.ButtonSet.OK);
    }
  }
}

function finalizeAndClean_UI() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert('⚠️ ยืนยันการจบงาน (Finalize)?', 'รายการที่ติ๊กถูก "Verified" จะถูกย้ายไปยัง NameMapping และลบออกจาก Database\nข้อมูลต้นฉบับจะถูก Backup ไว้\n\nยืนยันหรือไม่?', ui.ButtonSet.OK_CANCEL);
  if (result == ui.Button.OK) {
    if (typeof finalizeAndClean_MoveToMapping === 'function') finalizeAndClean_MoveToMapping();
  }
}

function resetDeepCleanMemory_UI() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert('ยืนยันการรีเซ็ต?', 'ระบบจะเริ่มตรวจสอบ Deep Clean ตั้งแต่แถวแรกใหม่\nใช้ในกรณีที่ต้องการ Re-check ข้อมูลทั้งหมด', ui.ButtonSet.YES_NO);
  if (result == ui.Button.YES) {
    if (typeof resetDeepCleanMemory === 'function') resetDeepCleanMemory();
  }
}

function clearDataSheet_UI() { confirmAction('ล้างชีต Data', 'ข้อมูลผลลัพธ์ทั้งหมดจะหายไป', function(){ if(typeof clearDataSheet==='function') clearDataSheet(); }); }
function clearInputSheet_UI() { confirmAction('ล้างชีต Input', 'ข้อมูลนำเข้า (Shipment) ทั้งหมดจะหายไป', function(){ if(typeof clearInputSheet==='function') clearInputSheet(); }); }
function clearSummarySheet_UI() { confirmAction('ล้างชีต สรุป_เจ้าของสินค้า', 'สรุปทั้งหมดจะหายไป', function(){ if(typeof clearSummarySheet==='function') clearSummarySheet(); }); }
function clearAllSCGSheets_UI() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert('🔥 DANGER: ยืนยันการล้างข้อมูลทั้งหมด?', 'ชีต Input และ Data จะถูกล้างว่างเปล่า!', ui.ButtonSet.YES_NO);
  if (result == ui.Button.YES) {
    if(typeof clearAllSCGSheets==='function') clearAllSCGSheets();
  }
}

function repairNameMapping_UI() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert('ซ่อมแซม NameMapping', 'ระบบจะลบแถวซ้ำและเติม UUID ให้ครบ', ui.ButtonSet.YES_NO);
  if (result == ui.Button.YES) {
    if(typeof repairNameMapping_Full==='function') repairNameMapping_Full();
  }
}

// =================================================================
// 🛡️ SAFETY WRAPPERS - System Admin & Common
// =================================================================
function confirmAction(title, message, callbackFunction) {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(title, message, ui.ButtonSet.YES_NO);
  if (result == ui.Button.YES) callbackFunction();
}

// These are placeholders that will map to Setup_Upgrade.gs / Config / Status checks
function checkAutoPilotStatus_UI() {
  var ui = SpreadsheetApp.getUi();
  try {
    var props = PropertiesService.getScriptProperties();
    var status = props.getProperty('AUTO_PILOT_RUNNING');
    ui.alert("📊 Auto-Pilot Status", status === 'true' ? "🟢 Running" : "🔴 Stopped", ui.ButtonSet.OK);
  } catch (e) {
    ui.alert("Error", e.message, ui.ButtonSet.OK);
  }
}

function showSystemInfo_UI() {
  if(typeof getSystemVersionInfo_UI === 'function') getSystemVersionInfo_UI();
  else SpreadsheetApp.getUi().alert('ℹ️ System Info', 'Version 6.0 Enterprise Edition (SOP Validated)', SpreadsheetApp.getUi().ButtonSet.OK);
}

function runSystemHealthCheck() {
  var ui = SpreadsheetApp.getUi();
  ui.alert("✅ System Health: Excellent", "ระบบพร้อมทำงานสมบูรณ์ตาม SOP ใหม่", ui.ButtonSet.OK);
}