/* full PF2 condition list */
export const conditions = [
  // 🧠 Mental & Control Effects
  { cat: '🧠 Mental/Control', name: 'Frightened',   desc: 'Status penalty to all checks and DCs; reduces each round.' },
  { cat: '🧠 Mental/Control', name: 'Confused',     desc: 'Acts randomly; may attack allies.' },
  { cat: '🧠 Mental/Control', name: 'Fascinated',   desc: 'Cannot act except to observe the source; -2 Perception/skills vs. others.' },
  { cat: '🧠 Mental/Control', name: 'Stupefied',    desc: 'Penalty to mental ability checks and concentration/spell DCs.' },
  { cat: '🧠 Mental/Control', name: 'Controlled',   desc: 'Mind control - another creature dictates your actions.' },
  { cat: '🧠 Mental/Control', name: 'Dazed',        desc: 'Can use only one action on your turn.' },
  { cat: '🧠 Mental/Control', name: 'Unconscious',  desc: 'Knocked out; you are helpless.' },

  // 🤕 Physical Afflictions
  { cat: '🤕 Physical', name: 'Doomed',     desc: 'Die at a lower dying value.' },
  { cat: '🤕 Physical', name: 'Dying',      desc: 'On the brink of death; must make recovery checks.' },
  { cat: '🤕 Physical', name: 'Wounded',    desc: 'Dying threshold increases faster next time you fall.' },
  { cat: '🤕 Physical', name: 'Paralyzed',  desc: 'Cannot act; you are flat-footed and helpless.' },
  { cat: '🤕 Physical', name: 'Petrified',  desc: 'Turned to stone; treated as an object.' },
  { cat: '🤕 Physical', name: 'Clumsy',     desc: 'Penalty to Dexterity checks and DCs.' },
  { cat: '🤕 Physical', name: 'Enfeebled',  desc: 'Penalty to Strength checks and DCs.' },
  { cat: '🤕 Physical', name: 'Fatigued',   desc: '-1 to AC and saves; no exploration activities.' },
  { cat: '🤕 Physical', name: 'Exhausted',  desc: 'Severely weakened; GM adjudicates additional effects.' },

  // 🔥 Damage-Over-Time / Elemental
  { cat: '🔥 DoT', name: 'Persistent Damage', desc: 'Ongoing fire, acid, bleed, poison, etc.; applies each round until removed.' },
  { cat: '🔥 DoT', name: 'Burning',           desc: 'Narrative tag for ongoing fire damage (persistent fire).' },

  // 💢 Combat Utility / Movement
  { cat: '💢 Combat', name: 'Flat-Footed',  desc: '-2 AC against attacks.' },
  { cat: '💢 Combat', name: 'Prone',        desc: 'Lying on the ground; -2 attack rolls; must spend 5 feet to stand.' },
  { cat: '💢 Combat', name: 'Grabbed',      desc: 'Immobilized by a foe; you are flat-footed.' },
  { cat: '💢 Combat', name: 'Restrained',   desc: 'Cannot move or Strike; you are flat-footed.' },
  { cat: '💢 Combat', name: 'Immobilized',  desc: 'Cannot move voluntarily.' },
  { cat: '💢 Combat', name: 'Slowed',       desc: 'Lose one or more actions each round.' },
  { cat: '💢 Combat', name: 'Quickened',    desc: 'Gain one extra action each round (specific use).' },
  { cat: '💢 Combat', name: 'Invisible',    desc: 'Cannot be seen without special senses.' },
  { cat: '💢 Combat', name: 'Concealed',    desc: 'Concealment; attacker takes a DC 5 flat check to hit.' },
  { cat: '💢 Combat', name: 'Hidden',       desc: 'Attacker knows your square but not your location; DC 11 flat check.' },
  { cat: '💢 Combat', name: 'Undetected',   desc: 'Attacker does not know where you are.' },
  { cat: '💢 Combat', name: 'Observed',     desc: 'You are plainly visible; no stealth possible.' },

  // 💬 Speech / Sensory
  { cat: '💬 Sense', name: 'Blinded',         desc: 'Cannot see; all terrain counts as difficult; -4 Perception; flat-footed.' },
  { cat: '💬 Sense', name: 'Deafened',        desc: 'Cannot hear; -2 initiative; may fail verbal components.' },
  { cat: '💬 Sense', name: 'Sensory-Deprived',desc: 'Magical disruption of one or more senses; GM-defined effect.' },

  // 🎯 Targeting & Control
  { cat: '🎯 Target', name: 'Charmed',        desc: 'Treats you as a friend; cannot act hostile toward you.' },
  { cat: '🎯 Target', name: 'Stunned',        desc: 'Lose a number of actions equal to the condition\'s value.' },
  { cat: '🎯 Target', name: 'Incapacitated',  desc: 'Cannot use certain actions; limited to fewer actions (per trait).' },

  // 🧊 Special Combat Conditions
  { cat: '🧊 Special', name: 'Encumbered',    desc: 'Overloaded; your Speed is reduced.' }
]; 