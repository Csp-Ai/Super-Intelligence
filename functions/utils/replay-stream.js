const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { publish } = require('./agent-sync');

class ReplayStream {
  constructor(runId, opts = {}) {
    this.runId = runId;
    this.speed = opts.speed || 1;
    this.annotations = [];
    this._stop = false;
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

  stop() {
    this._stop = true;
  }

  async play() {
    const timeline = await this._loadTimeline();
    let prev = null;
    for (const item of timeline) {
      if (this._stop) break;
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
      prev = item;
    }
    return this.annotations;
  }
}

module.exports = { ReplayStream };
