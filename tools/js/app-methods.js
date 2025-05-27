import { cleanMarkup, d20, scaleMonsterJSON, buildStatBlock, cleanName, buildTag } from './utils.js';

export const appMethods = {
  prefillMonster() {
    const hit = this.monsterIndex.find(m => m.name.toLowerCase() === this.newName.toLowerCase());
    if (!hit) return;

    const delta = this.newTemplateDelta || 0;
    const blob = scaleMonsterJSON(hit, delta);

    this.newHP = blob.hp;
    this.newColor = this.nextColour(hit.name);
    this.newStatBlock = JSON.stringify(blob);
  },

  d20() { return d20(); },
  rollInit() { this.newInitiative = this.d20() + 5; },

  nextColour(name) {
    const used = this.entities.filter(e => e.name === name).map(e => e.color);
    return this.colours.find(c => !used.includes(c)) || this.colours[0];
  },

  addEntity() {
    const name = this.newType === 'Player' ? 
      (this.newName === '__custom' ? this.customPlayer : this.newName) : 
      this.newName;
    if (!name.trim()) return;
    const init = this.newType === 'Monster' ? 
      (this.newInitiative || this.d20() + 5) : 
      (this.newInitiative || 0);
    this.entities.push({
      id: Date.now() + Math.random(),
      name,
      type: this.newType,
      order: this.entities.length,
      initiative: init,
      hp: this.newHP,
      hpMax: this.newHP,
      statBlock: this.newStatBlock,
      color: this.newColor,
      statuses: [],
      note: '',
      html: '',
      ac: null,
      fort: null,
      ref: null,
      will: null
    });
    this.newName = this.customPlayer = this.newStatBlock = '';
    this.newHP = this.newInitiative = null;
    this.newColor = 'red';
  },

  hpPercent(e) { return e.hpMax ? Math.max(0, Math.min(100, e.hp / e.hpMax * 100)) : 0; },
  hpColor(e) {
    const p = this.hpPercent(e);
    return p > 66 ? '#4caf50' : p > 33 ? '#ffc107' : '#f44336';
  },

  startCombat() {
    this.entities.forEach(e => { if (e.type === 'Monster' && e.ac == null) this.parseBlock(e); });
    this.entities.sort((a,b) => b.initiative - a.initiative || a.order - b.order);
    this.combatStarted = true;
    this.turnIndex = 0;
    this.round = 1;
    this.syncStatBlock();
  },

  nextTurn() {
    if (!this.entities.length) return;
    if (this.turnIndex === this.entities.length - 1) this.round++;
    this.turnIndex = (this.turnIndex + 1) % this.entities.length;
    
    const currentInit = this.displayOrder[this.turnIndex].initiative;
    this.entities.forEach(ent => {
      ent.statuses.forEach(st => {
        if (st.dur != null && st.srcInit === currentInit && st.lastTickRound !== this.round) {
          st.dur--;
          st.lastTickRound = this.round;
        }
      });
      ent.statuses = ent.statuses.filter(st => st.dur == null || st.dur > 0);
    });
    
    this.syncStatBlock();
  },

  endCombat() {
    this.entities = [];
    this.delayedEntities = [];
    this.turnIndex = 0;
    this.combatStarted = false;
    this.selectedMonster = null;
    this.round = 1;
  },

  duplicateFromRow(src) {
    const c = JSON.parse(JSON.stringify(src));
    c.id = Date.now() + Math.random();
    c.order = this.entities.length;
    c.color = this.nextColour(src.name);
    this.entities.push(c);
  },

  formatStatus(s) { return s.dur ? `${s.name}:${s.dur}` : s.name; },
  statusTitle(s) { return (this.conditionMap[s.name] || s.name) + (s.dur ? ` (${s.dur} rnds)` : ''); },

  tickStatus(ent, idx) {
    const st = ent.statuses[idx];
    if (st.dur != null) {
      st.dur--;
      if (st.dur <= 0) ent.statuses.splice(idx, 1);
    } else {
      ent.statuses.splice(idx, 1);
    }
  },

  applyStatus(ent, ev) {
    const val = ev.target.value;
    ent._addingStatus = false;
    if (!val) return;
    
    let name = val, dur = null;
    if (val === '__custom') {
      name = prompt('Status name');
      if (!name) return;
    }
    if (name.includes(':')) {
      const [n,d] = name.split(':');
      name = n;
      dur = parseInt(d);
    }
    if (dur == null) {
      const d = prompt('Duration (blank none)');
      if (d) dur = parseInt(d);
    }
    
    const srcInit = this.displayOrder[this.turnIndex]?.initiative ?? null;
    ent.statuses.push({
      name,
      dur: isNaN(dur) ? null : dur,
      srcInit,
      lastTickRound: null
    });
  },

  editNote(e) {
    const n = prompt('GM note', e.note || '');
    if (n !== null) e.note = n;
  },

  parseBlock(mon) {
    try {
      const o = typeof mon.statBlock === 'string' ? JSON.parse(mon.statBlock) : mon.statBlock;
      mon.html = buildStatBlock(o);
      mon.ac = o.ac || null;
      mon.fort = o.saves?.Fort || null;
      mon.ref = o.saves?.Ref || null;
      mon.will = o.saves?.Will || null;
      mon.hpMax = mon.hpMax || o.hp || mon.hp;
    } catch {
      mon.html = '<pre>' + String(mon.statBlock).replace(/</g,'&lt;') + '</pre>';
    }
  },

  showStats(e) {
    this.parseBlock(e);
    this.selectedMonster = e;
  },

  syncStatBlock() {
    const cur = this.entities[this.turnIndex];
    if (cur) this.parseBlock(cur);
    this.selectedMonster = (cur && cur.type === 'Monster') ? cur : null;
  },

  delayTurn(id) {
    const i = this.entities.findIndex(e => e.id === id);
    if (i != -1) {
      this.delayedEntities.push(this.entities.splice(i,1)[0]);
      if (this.turnIndex >= this.entities.length) this.turnIndex = 0;
      this.syncStatBlock();
    }
  },

  resumeTurn(id) {
    const i = this.delayedEntities.findIndex(e => e.id === id);
    if (i != -1) {
      const ent = this.delayedEntities.splice(i,1)[0];
      const active = this.displayOrder[this.turnIndex].id;
      const ins = this.entities.findIndex(e => e.id === active);
      this.entities.splice(ins,0,ent);
      this.turnIndex = ins;
      this.syncStatBlock();
    }
  },

  removeEntity(id) {
    this.entities = this.entities.filter(e => e.id !== id);
    this.delayedEntities = this.delayedEntities.filter(e => e.id !== id);
    if (this.turnIndex >= this.entities.length) this.turnIndex = 0;
    if (this.selectedMonster && this.selectedMonster.id === id) this.selectedMonster = null;
  },

  exportJSON() {
    return JSON.stringify({
      active: this.entities,
      delayed: this.delayedEntities
    }, null, 2);
  },

  copyExport() {
    navigator.clipboard.writeText(this.exportJSON())
      .then(() => alert('Copied!'));
  },

  downloadJSON() {
    const blob = new Blob([this.exportJSON()], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encounter.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  uploadJSON(ev) {
    const f = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = e => {
      try {
        const d = JSON.parse(e.target.result);
        this.entities = d.active || [];
        this.delayedEntities = d.delayed || [];
        this.turnIndex = 0;
        this.combatStarted = false;
        this.round = 1;
      } catch {
        alert('Invalid JSON');
      }
    };
    r.readAsText(f);
  },

  saveEncounter() {
    if (!this.saveName.trim()) {
      alert('Name?');
      return;
    }
    localStorage.setItem('encounter_' + this.saveName, JSON.stringify({
      active: this.entities,
      delayed: this.delayedEntities
    }));
    if (!this.savedList.includes(this.saveName)) {
      this.savedList.push(this.saveName);
      localStorage.setItem('encounterNames', JSON.stringify(this.savedList));
    }
    this.saveName = '';
    alert('Saved.');
  },

  loadEncounter() {
    if (!this.selectedSave) return;
    const raw = localStorage.getItem('encounter_' + this.selectedSave);
    if (!raw) {
      alert('No data');
      return;
    }
    const d = JSON.parse(raw);
    this.entities = d.active || [];
    this.delayedEntities = d.delayed || [];
    this.turnIndex = 0;
    this.combatStarted = false;
    this.selectedMonster = null;
    this.round = 1;
  },

  deleteEncounter() {
    if (this.selectedSave && confirm('Delete this encounter?')) {
      localStorage.removeItem('encounter_' + this.selectedSave);
      this.savedList = this.savedList.filter(n => n !== this.selectedSave);
      localStorage.setItem('encounterNames', JSON.stringify(this.savedList));
      this.selectedSave = '';
    }
  },

  copyLibrary() {
    navigator.clipboard.writeText(this.libraryJSON)
      .then(() => alert('Library JSON copied to clipboard!'))
      .catch(() => alert('Clipboard write failed.'));
  },

  downloadLibrary() {
    if (!this.savedList.length) {
      alert('No saved encounters to export.');
      return;
    }
    const blob = new Blob([this.libraryJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encounter_library.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  uploadLibrary(ev) {
    const f = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = e => { this.importLibraryBlob = e.target.result; };
    r.readAsText(f);
  },

  importLibrary() {
    try {
      const lib = JSON.parse(this.importLibraryBlob || '{}');
      if (!Array.isArray(lib.names) || typeof lib.slots !== 'object') {
        throw new Error('Bad shape');
      }
      lib.names.forEach(n => {
        localStorage.setItem('encounter_' + n, JSON.stringify(lib.slots[n]));
        if (!this.savedList.includes(n)) this.savedList.push(n);
      });
      localStorage.setItem('encounterNames', JSON.stringify(this.savedList));
      alert('Library imported!');
      this.importLibraryBlob = '';
    } catch {
      alert('Invalid library JSON');
    }
  },

  rerollInit(id) {
    const ent = this.entities.find(e => e.id === id);
    if (!ent) return;
    ent.initiative = this.d20() + 5;
  },

  rerollAll() {
    this.entities.forEach(ent => {
      if (ent.type === 'Monster') {
        ent.initiative = this.d20() + 5;
      }
    });
  },

  clearCurrent() {
    if (confirm('Clear current encounter?')) {
      this.entities = [];
      this.delayedEntities = [];
      this.turnIndex = 0;
      this.round = 1;
      this.selectedMonster = null;
    }
  },

  importJSON() {
    let raw = (this.importBlob || '').trim();
    if (!raw) {
      alert('Paste an encounter JSON first.');
      return;
    }
    raw = raw
      .replace(/```json|```/gi, '')
      .replace(/^\uFEFF/, '');

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error(err);
      alert('Invalid JSON – parser error.');
      return;
    }

    if (!data.active || !Array.isArray(data.active)) {
      alert('That file does not look like an encounter export.');
      return;
    }

    this.entities = data.active;
    this.delayedEntities = data.delayed || [];
    this.turnIndex = 0;
    this.combatStarted = false;
    this.round = 1;
    this.selectedMonster = null;
    this.importBlob = '';
  }
}; 