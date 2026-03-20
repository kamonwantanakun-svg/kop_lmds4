/**
 * VERSION: 001
 * =============================================================
 * FILE: services/Service_Agent_Registry.gs
 * 🤖 Service: Agent Registry V6.0
 * -------------------------------------------------------
 * [NEW v6.0]: Agent dispatcher pattern
 * [NEW v6.0]: Pluggable agent architecture
 * [NEW v6.0]: Task-based agent selection
 * [NEW v6.0]: Execution history tracking
 * [NEW v6.0]: Agent statistics and monitoring
 * Author: Elite Logistics Architect
 */

// ==========================================
// 1. AGENT REGISTRY CONFIGURATION
// ==========================================

var AGENT_REGISTRY = {
  // Task type -> Agent function mapping
  TASK_AGENTS: {
    'name_resolution': 'Agent_NameResolver',
    'coordinate_verification': 'Agent_Auditor',
    'address_parsing': 'Agent_AddressParser',
    'typo_prediction': 'Agent_TypoPredictor',
    'duplicate_detection': 'Agent_DuplicateDetector'
  },

  // Agent capabilities storage
  AGENTS: {},

  // Execution history
  HISTORY: [],

  // Maximum history entries
  MAX_HISTORY: 500,

  // Enable/disable agents
  ENABLED: true
};

// ==========================================
// 2. AGENT REGISTRATION
// ==========================================

function registerAgent(agentId, agent) {
  if (!agent.execute || typeof agent.execute !== 'function') {
    throw new Error("Agent must have execute() method");
  }

  AGENT_REGISTRY.AGENTS[agentId] = {
    id: agentId,
    name: agent.name || agentId,
    description: agent.description || '',
    version: agent.version || '1.0',
    execute: agent.execute,
    validate: agent.validate || function() { return true; }
  };
}

function unregisterAgent(agentId) {
  if (AGENT_REGISTRY.AGENTS[agentId]) {
    delete AGENT_REGISTRY.AGENTS[agentId];
    return true;
  }
  return false;
}

function getAvailableAgents() {
  return Object.keys(AGENT_REGISTRY.AGENTS).map(function(id) {
    var agent = AGENT_REGISTRY.AGENTS[id];
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      version: agent.version
    };
  });
}

// ==========================================
// 3. AGENT DISPATCHER
// ==========================================

function dispatchAgent(taskType, payload) {
  if (!AGENT_REGISTRY.ENABLED) throw new Error("Agent registry is disabled");

  var agentId = AGENT_REGISTRY.TASK_AGENTS[taskType];
  if (!agentId) throw new Error("No agent registered for task: " + taskType);

  var agent = AGENT_REGISTRY.AGENTS[agentId];
  if (!agent) throw new Error("Agent not registered: " + agentId);

  if (!agent.validate(payload)) throw new Error("Payload validation failed for agent: " + agentId);

  var startTime = new Date().getTime();
  var result;
  try {
    result = agent.execute(payload);
    var duration = new Date().getTime() - startTime;
    addAgentHistoryEntry_(agentId, taskType, duration, true, null);
    return result;
  } catch (e) {
    var duration = new Date().getTime() - startTime;
    addAgentHistoryEntry_(agentId, taskType, duration, false, e.message);
    throw e;
  }
}

function addAgentHistoryEntry_(agentId, taskType, duration, success, error) {
  AGENT_REGISTRY.HISTORY.push({
    timestamp: new Date().toISOString(),
    agent: agentId,
    taskType: taskType,
    duration: duration,
    success: success,
    error: error || null
  });
  if (AGENT_REGISTRY.HISTORY.length > AGENT_REGISTRY.MAX_HISTORY) {
    AGENT_REGISTRY.HISTORY = AGENT_REGISTRY.HISTORY.slice(-AGENT_REGISTRY.MAX_HISTORY);
  }
}

function getAgentHistory(limit) {
  limit = limit || 50;
  return AGENT_REGISTRY.HISTORY.slice(-limit);
}

function getAgentStats() {
  var stats = {};
  AGENT_REGISTRY.HISTORY.forEach(function(entry) {
    if (!stats[entry.agent]) {
      stats[entry.agent] = { total: 0, success: 0, failed: 0, totalDuration: 0, minDuration: Infinity, maxDuration: 0 };
    }
    stats[entry.agent].total++;
    stats[entry.agent].totalDuration += entry.duration;
    if (entry.duration < stats[entry.agent].minDuration) stats[entry.agent].minDuration = entry.duration;
    if (entry.duration > stats[entry.agent].maxDuration) stats[entry.agent].maxDuration = entry.duration;
    if (entry.success) stats[entry.agent].success++; else stats[entry.agent].failed++;
  });
  Object.keys(stats).forEach(function(agentId) {
    var s = stats[agentId];
    s.avgDuration = Math.round(s.totalDuration / s.total);
    s.successRate = ((s.success / s.total) * 100).toFixed(1) + '%';
    s.minDuration = s.minDuration === Infinity ? 0 : s.minDuration;
  });
  return stats;
}

function clearAgentHistory() {
  AGENT_REGISTRY.HISTORY = [];
}

// ==========================================
// 6. BUILT-IN AGENTS
// ==========================================

var NAME_RESOLVER_AGENT = {
  name: 'Name Resolver',
  description: 'Resolves variant names to master UIDs using AI',
  version: '1.0',
  validate: function(payload) { return payload.unknownNames && Array.isArray(payload.unknownNames); },
  execute: function(payload) {
    if (typeof resolveUnknownNamesWithAI === 'function') {
      return resolveUnknownNamesWithAI();
    }
    throw new Error("Name resolver function not available");
  }
};

var AGENT_AUDITOR = {
  name: 'Coordinate Auditor',
  description: 'Verifies and validates coordinate accuracy',
  version: '1.0',
  validate: function(payload) { return payload.coordinates && Array.isArray(payload.coordinates); },
  execute: function(payload) {
    var results = [];
    payload.coordinates.forEach(function(coord) {
      var validation = validateCoordinate(coord.lat, coord.lng);
      results.push({ original: coord, validation: validation, suggestion: validation.valid ? null : suggestCorrection(coord) });
    });
    return results;
  }
};

var ADDRESS_PARSER_AGENT = {
  name: 'Address Parser',
  description: 'Parses Thai addresses into components',
  version: '1.0',
  validate: function(payload) { return payload.address && typeof payload.address === 'string'; },
  execute: function(payload) {
    if (typeof parseAddressFromText === 'function') {
      return parseAddressFromText(payload.address);
    }
    var result = { province: '', district: '', postcode: '' };
    var zipMatch = payload.address.match(/(\d{5})/);
    if (zipMatch) result.postcode = zipMatch[1];
    var provMatch = payload.address.match(/(?:จ\.|จังหวัด)\s*([ก-๙a-zA-Z0-9]+)/i);
    if (provMatch) result.province = provMatch[1];
    var distMatch = payload.address.match(/(?:อ\.|อำเภอ|เขต)\s*([ก-๙a-zA-Z0-9]+)/i);
    if (distMatch) result.district = distMatch[1];
    return result;
  }
};

var TYPO_PREDICTOR_AGENT = {
  name: 'Typo Predictor',
  description: 'Predicts common typos for customer names',
  version: '1.0',
  validate: function(payload) { return payload.name && typeof payload.name === 'string'; },
  execute: function(payload) {
    var name = payload.name;
    var variations = [name];
    variations.push(name.replace(/บจก\./, 'บริษัท'));
    variations.push(name.replace(/บริษัท/, 'บจก.'));
    variations.push(name.replace(/จำกัด/, ''));
    variations.push(name.replace(/\s+/g, ''));
    return {
      original: name,
      variations: variations.filter(function(v, i, arr) { return arr.indexOf(v) === i && v !== name; })
    };
  }
};

var DUPLICATE_DETECTOR_AGENT = {
  name: 'Duplicate Detector',
  description: 'Detects potential duplicate entries',
  version: '1.0',
  validate: function(payload) { return payload.records && Array.isArray(payload.records); },
  execute: function(payload) {
    var duplicates = [];
    var seen = {};
    payload.records.forEach(function(record, index) {
      var key = (record.name || '').toLowerCase().replace(/\s+/g, '');
      if (seen[key] !== undefined) {
        duplicates.push({ originalIndex: seen[key], duplicateIndex: index, name: record.name });
      } else {
        seen[key] = index;
      }
    });
    return { total: payload.records.length, duplicatesFound: duplicates.length, duplicates: duplicates };
  }
};

function validateCoordinate(lat, lng) {
  var issues = [];
  if (lat < -90 || lat > 90) issues.push("Latitude out of range (-90 to 90)");
  if (lng < -180 || lng > 180) issues.push("Longitude out of range (-180 to 180)");
  if (lat < 5 || lat > 21) issues.push("Latitude outside Thailand bounds");
  if (lng < 97 || lng > 106) issues.push("Longitude outside Thailand bounds");
  var latPrecision = (lat.toString().split('.')[1] || '').length;
  var lngPrecision = (lng.toString().split('.')[1] || '').length;
  if (latPrecision < 4 || lngPrecision < 4) issues.push("Low precision (less than 4 decimal places)");
  return { valid: issues.length === 0, issues: issues, confidence: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 20) };
}

function suggestCorrection(coord) {
  return { suggestedLat: coord.lat, suggestedLng: coord.lng, reason: "Manual verification recommended" };
}

function initializeAgents() {
  registerAgent('Agent_NameResolver', NAME_RESOLVER_AGENT);
  registerAgent('Agent_Auditor', AGENT_AUDITOR);
  registerAgent('Agent_AddressParser', ADDRESS_PARSER_AGENT);
  registerAgent('Agent_TypoPredictor', TYPO_PREDICTOR_AGENT);
  registerAgent('Agent_DuplicateDetector', DUPLICATE_DETECTOR_AGENT);
}

try { initializeAgents(); } catch (e) { }

// Menu Handlers
function runAgent_NameResolver_UI() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.alert('🤖 ยืนยัน', 'เริ่มให้ AI ช่วยหาชื่อที่จับคู่ไม่สำเร็จจากตารางใช่หรือไม่?', ui.ButtonSet.YES_NO);
  if(res == ui.Button.YES) {
    try {
      dispatchAgent('name_resolution', { unknownNames: [] });
      ui.alert('✅ สำเร็จ', 'ระบบส่งงานให้ Agent เรียบร้อยแล้ว', ui.ButtonSet.OK);
    } catch(e) {
      ui.alert('❌ ข้อผิดพลาด', e.message, ui.ButtonSet.OK);
    }
  }
}

function runAgent_CoordinateAuditor_UI() {
  SpreadsheetApp.getUi().alert('📍 Coordinate Auditor Agent กำลังตรวจสอบ (Demo)\n\nสามารถเปิดดู Logs เพื่อดูผลลัพธ์');
}

function runAgent_AddressParser_UI() {
  SpreadsheetApp.getUi().alert('📝 Address Parser Agent กำลังวิเคราะห์ที่อยู่ (Demo)\n\nสามารถเปิดดู Logs เพื่อดูผลลัพธ์');
}

function viewRegisteredAgents_UI() {
  var agents = getAvailableAgents();
  var text = "Registered Agents:\n\n";
  agents.forEach(function(a) { text += "• " + a.name + " (" + a.version + ")\n  " + a.description + "\n\n"; });
  SpreadsheetApp.getUi().alert(text);
}

function viewAgentStats_UI() {
  var stats = getAgentStats();
  var text = "Agent Statistics:\n\n";
  Object.keys(stats).forEach(function(k) {
    var s = stats[k];
    text += "🤖 " + k + "\n";
    text += "   Total: " + s.total + " | Success: " + s.successRate + "\n";
    text += "   Avg Duration: " + s.avgDuration + "ms\n\n";
  });
  SpreadsheetApp.getUi().alert(text || "No stats available yet.");
}

function viewAgentHistory_UI() {
  var history = getAgentHistory(10);
  var text = "Agent Execution History (Last 10):\n\n";
  history.forEach(function(h) {
    text += "[" + h.timestamp + "] " + h.agent + " -> " + h.taskType + " | " + (h.success ? "✅ Success" : "❌ Failed") + " (" + h.duration + "ms)\n";
  });
  SpreadsheetApp.getUi().alert(text || "No history available yet.");
}
