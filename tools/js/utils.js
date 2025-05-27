/* helper to strip AoN / Foundry markup & HTML tags */
export function cleanMarkup(t) {
  return (t || '')
    .replace(/@UUID\[[^\]]+\]\{?([^}|]+)?\}?/g, '$1')
    .replace(/@Damage\[[^\]]+\]/g, '')
    .replace(/@Check\[[^\]]+\]/g, '')
    .replace(/@Template\[[^\]]+\]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/* dice util */
export function d20() {
  return Math.floor(Math.random() * 20) + 1;
}

/* monster scaling helper */
export function scaleMonsterJSON(cre, delta) {
  if (!delta) return cre;                 // Normal
  delta = Math.max(-4, Math.min(4, delta)); // clamp sensibly
  const mod = delta * 2;                 // PF2 uses ±2 per level step

  const scaled = JSON.parse(JSON.stringify(cre));        // deep clone
  const plusPct = delta > 0 ? 0.2 * delta : 0.2 * delta; // HP ±20 % per step

  /* bump every d20 modifier we can find */
  const bump = obj => { for (const k in obj) obj[k] += mod; };
  if (scaled.ac) scaled.ac += mod;
  if (scaled.perception) scaled.perception += mod;
  if (scaled.hp) scaled.hp = Math.max(1, Math.round(scaled.hp * (1 + plusPct)));
  if (scaled.saves) bump(scaled.saves);
  if (scaled.skills) bump(scaled.skills);
  if (scaled.abilities) bump(scaled.abilities);

  /* bump melee / ranged attack bonuses & damage */
  (scaled.melee || []).forEach(w => {
    if (w.attack) w.attack += mod;
    if (w.damageRoll) w.damageRoll += mod;              // flat mods
  });
  (scaled.ranged || []).forEach(w => {
    if (w.attack) w.attack += mod;
    if (w.damageRoll) w.damageRoll += mod;
  });

  /* top-level spell DC / attack */
  if (scaled.spellDC) scaled.spellDC += mod;
  if (scaled.spellAttack) scaled.spellAttack += mod;

  /* damage in actions text is flavour – leave it, GM can eyeball */
  scaled.level = (scaled.level ?? 0) + delta;
  return scaled;
}

/* stat block builder */
export function buildStatBlock(o) {
  const fmt = obj => Object.entries(obj).map(([k, v]) => k + ' ' + v).join(', ');
  const melee = (o.melee || []).map(m => {
    const act = m.action ?? 1, cls = act === 3 ? 'act-three' : act === 2 ? 'act-two' : 'act-one';
    const dmg = m.damage || m.damageRoll || '—';
    return `<li><span class="action-icon ${cls}"></span><b>Melee</b> ${cleanName(m.name)} ${m.attack || ''}${m.traits ? ' (' + m.traits + ')' : ''}, <i>Damage</i> ${dmg}</li>`;
  }).join('');
  const acts = (o.actions || []).map(a => {
    const cls = a.type === 'three' ? 'act-three' : a.type === 'two' ? 'act-two' : 'act-one';
    return `<div><span class="action-icon ${cls}"></span><b>${a.name}.</b> ${cleanMarkup(a.text)}</div>`;
  }).join('');

  return `<div class="stat-card">
    <h4>${o.name || 'Creature'} <span style="float:right">Lvl ${o.level ?? '?'}</span></h4>
    <div class="stat-tags">
      ${o.alignment ? buildTag(o.alignment) : ''}
      ${o.size ? buildTag(o.size) : ''}
      ${(o.traits || []).map(t => buildTag(t)).join('')}
    </div>
    <div class="stat-section"><b>Perception</b> ${o.perception || ''}${o.senses ? '; ' + o.senses.join(', ') : ''}</div>
    <div class="stat-section"><b>Skills</b> ${o.skills ? Object.entries(o.skills).map(([k, v]) => k + ' ' + v).join(', ') : '—'}<br>
      ${o.abilities ? Object.entries(o.abilities).map(([k, v]) => `${k} ${v}`).join(', ') : ''}</div>
    <div class="stat-section">AC ${o.ac || ''}; <b>Fort</b> ${o.saves?.Fort || ''}, <b>Ref</b> ${o.saves?.Ref || ''}, <b>Will</b> ${o.saves?.Will || ''}<br>
      <b>HP</b> ${o.hp || ''}${o.resist ? '; <b>Resist</b> ' + fmt(o.resist) : ''}${o.weak ? '; <b>Weak</b> ' + fmt(o.weak) : ''}</div>
    <div class="stat-section"><b>Speed</b> ${o.speed || '—'}</div>
    <ul>${melee}</ul>
    ${acts}
    ${o.description ? `<div class="stat-section">${cleanMarkup(o.description)}</div>` : ''}
  </div>`;
}

/* helper functions for stat block */
export function cleanName(str) {
  return str.replace(/^[^A-Za-z]+/, '').trim();
}

export function buildTag(lbl, cls) {
  cls = cls || lbl.replace(/\s+/g, '');
  return `<span class="tag-${cls}">${lbl}</span>`;
} 