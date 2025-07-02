const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { publish } = require('./agent-sync');

const replayLogPath = path.join(__dirname, '..', 'replayLogs.json');

function writeLocal(runId, entry) {
  let logs = {};
  if (fs.existsSync(replayLogPath)) {
    try {
      logs = JSON.parse(fs.readFileSync(replayLogPath, 'utf8'));
      if (typeof logs !== 'object' || logs === null) logs = {};
    } catch (_) {
      logs = {};
    }
  }
  if (!logs[runId]) logs[runId] = [];
  logs[runId].push(entry);
  fs.writeFileSync(replayLogPath, JSON.stringify(logs, null, 2));
}

async function logReplayEvent({ userId, runId, event, params = {}, state = {}, error }) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    params,
    state
  };
  if (error) entry.error = error;

  if (process.env.LOCAL_AGENT_RUN) {
    writeLocal(runId, { userId, ...entry });
    return;
  }
  const db = admin.firestore();
  await db
    .collection('users')
    .doc(userId)
    .collection('agentRuns')
    .doc(runId)
    .collection('logs')
    .add(entry);
}

class ReplayStream {
  constructor(runId, opts = {}) {
    this.runId = runId;
    this.speed = opts.speed || 1;
    this.annotations = [];
    this._stop = false;
    this.paused = false;
    this.index = 0;
    this.total = 0;
  }

  async _fetchCollection(ref) {
    const snap = await ref.orderBy('timestamp').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async _loadTimeline() {
    if (process.env.LOCAL_AGENT_RUN) {
      const stepsFile = path.join(__dirname, '..', 'steps.json');
      let steps = [];
      if (fs.existsSync(stepsFile)) {
        try {
          const raw = fs.readFileSync(stepsFile, 'utf8');
          const arr = JSON.parse(raw);
          steps = arr.filter(s => s.runId === this.runId);
        } catch (_) {
          steps = [];
        }
      }
      const snapFile = path.join(__dirname, '..', 'snapshots.json');
      let snaps = [];
      if (fs.existsSync(snapFile)) {
        try {
          const raw = fs.readFileSync(snapFile, 'utf8');
          const arr = JSON.parse(raw);
          snaps = arr.filter(s => s.runId === this.runId);
        } catch (_) {
          snaps = [];
        }
      }
      const timeline = [
        ...steps.map(s => ({ type: 'step', timestamp: s.timestamp, data: s })),
        ...snaps.map(s => ({ type: 'snapshot', timestamp: s.timestamp, data: s }))
      ];
      timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      return timeline;
    }

    const db = admin.firestore();
    const runRef = await db.collectionGroup('agentRuns').where(admin.firestore.FieldPath.documentId(), '==', this.runId).get();
    if (runRef.empty) {
      throw new Error('Run not found');
    }
    const doc = runRef.docs[0];
    const steps = await this._fetchCollection(doc.ref.collection('steps'));
    let snaps = [];
    try {
      snaps = await this._fetchCollection(doc.ref.collection('snapshots'));
    } catch (_) {}
    const timeline = [
      ...steps.map(s => ({ type: 'step', timestamp: s.timestamp, data: s })),
      ...snaps.map(s => ({ type: 'snapshot', timestamp: s.timestamp, data: s }))
    ];
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return timeline;
  }

  addAnnotation(note, extra = {}) {
    const entry = { note, timestamp: new Date().toISOString(), ...extra };
    this.annotations.push(entry);
    publish(this.runId, { type: 'annotation', ...entry, _replay: true }).catch(() => {});
    return entry;
  }

  async _emitState(extra = {}) {
    try {
      await publish(this.runId, {
        type: 'replay-state',
        index: this.index,
        total: this.total,
        paused: this.paused,
        _replay: true,
        ...extra
      });
    } catch (_) {}
  }

  stop() {
    this._stop = true;
    this.paused = true;
    this._emitState({ status: 'paused' }).catch(() => {});
  }

  async play() {
    const timeline = await this._loadTimeline();
    this.total = timeline.length;
    this.index = 0;
    this.paused = false;
    await this._emitState({ status: 'running' });
    let prev = null;
    for (const item of timeline) {
      if (this._stop) {
        await this._emitState({ status: 'paused' });
        break;
      }
      if (prev) {
        const diff = new Date(item.timestamp) - new Date(prev.timestamp);
        if (diff > 0) {
          await new Promise(r => setTimeout(r, diff / this.speed));
        }
      }
      await publish(this.runId, {
        type: item.type,
        ...item.data,
        _replay: true
      });
      this.index++;
      await this._emitState({ status: 'running' });
      prev = item;
    }
    if (!this._stop) {
      this.paused = false;
      await this._emitState({ status: 'completed' });
    }
    return this.annotations;
  }
}

module.exports = { ReplayStream, logReplayEvent };
