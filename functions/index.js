const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');
const fs = require('fs/promises');
const path = require('path');
admin.initializeApp();

exports.onCreateUser = require('./triggers/onCreateUser').onCreateUser;

const ALLOWLIST = (functions.config().debug && functions.config().debug.allowlist)
  ? functions.config().debug.allowlist.split(',')
  : ['admin@example.com'];

exports.getLogs = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    if (!decoded.email || !ALLOWLIST.includes(decoded.email)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const logPath = path.join(__dirname, 'logs.json');
    let logs = [];
    try {
      const content = await fs.readFile(logPath, 'utf8');
      logs = JSON.parse(content);
    } catch (_) {
      logs = [];
    }
    res.json(logs);
  } catch (err) {
    console.error('getLogs error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

exports.retryAgentRun = require('./retryAgentRun').retryAgentRun;
exports.replayAgentRun = require('./replayAgentRun').replayAgentRun;
exports.summarizeReplayLogs = require('./summarizeReplayLogs').summarizeReplayLogs;
const insights = require('./agents/insightsAgent');
exports.updateInsightsCron = insights.updateInsightsCron;
exports.getInsights = insights.getInsights;

const anomalies = require('./agents/anomalyAgent');
exports.anomalyCron = anomalies.anomalyCron;

const trends = require('./agents/trendsAgent');
exports.updateTrendsCron = trends.updateTrendsCron;
exports.getTrends = trends.getTrends;

const mentor = require('./agents/mentor-agent');
exports.mentorCron = mentor.mentorCron;

const board = require('./agents/board-agent');
exports.boardCron = board.boardCron;

const guardian = require('./agents/guardian-agent');
exports.guardianCron = guardian.guardianCron;

exports.updateAgentState = require('./ops/updateAgentState').updateAgentState;
exports.logCommit = require('./ops/logCommit').logCommit;
exports.agentSyncSubscribe = require('./ops/agentSyncSubscribe').agentSyncSubscribe;
exports.cleanupOldReplays = require('./ops/cleanupOldReplays').cleanupOldReplays;

exports.replayAgentRun = require('./replayAgentRun').replayAgentRun;

// Translation utilities for localizing agent outputs
exports.translateText = require('./utils/translate').translateText;
exports.translateOutput = require('./utils/translate').translateOutput;

exports.trainAgent = require('./trainAgent').trainAgent;
exports.analyticsAgent = require('./agents/analytics-agent').analyticsAgent;

exports.runWebsiteAnalysis = require('./runWebsiteAnalysis').runWebsiteAnalysis;

exports.agentEndpoint = require('./agentEndpoint').agentEndpoint;

