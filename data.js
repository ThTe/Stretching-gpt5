// Guides & Interprétations
const TEST_GUIDE = [
  { title: "Cheville – Genou au mur", steps: [
      "Pied à plat, 2e orteil vers l’avant, talon fixé au sol.",
      "Avance le genou vers le mur sans que le talon se décolle.",
      "Mesure la distance maximale talon‑mur (en cm).",
      "Refais côté droit/gauche. Noter toute asymétrie > 3 cm."
    ], tips: ["Respire calmement", "Ne force pas dans la douleur"] },
  { title: "Hanche – Rotation interne (auto‑score 0–10)", steps: [
      "Assis, hanches et genoux à 90°.",
      "Laisse le pied s’éloigner vers l’extérieur (rotation interne).",
      "Note de 0 (bloqué/douloureux) à 10 (amplitude fluide, symétrique)."
    ], tips: ["Tronc immobile", "Pas de compensation du bassin"] },
  { title: "Flexion de hanche – Genou à la poitrine", steps: [
      "Allongé(dos) ou assis, ramène le genou vers la poitrine.",
      "0: douloureux/bloqué · 1: limité · 2: correct · 3: très bon."
    ], tips: ["Garde le bas du dos neutre", "Ne dépasse pas l’inconfort 3/10"] }
];
const INTERPRETATIONS = [
  "Dorsiflexion < 10 cm → priorité cheville (stretch + excentrique).",
  "Δ cheville ≥ 3 cm → corriger d’abord le côté faible.",
  "Rotation interne ≤ 3/10 → 90/90 levées + fente psoas.",
  "Flexion de hanche < 2/3 → mobilité + renforcement fessiers."
];
const EXOS = {
  ankleRock:{id:'ankleRock', name:'Rocking cheville (mur)', area:'Cheville', svg:'ankle', dose:'2×30s',
    how:'Face au mur, avance/recule le genou sans lever le talon. Cherche l’amplitude sans douleur.',
    cues:['Genou aligné 2e orteil','Talons au sol','Respiration lente'],
    errors:['Genou qui rentre','Talon qui se décolle','Allers‑retours trop rapides']
  },
  calfPNF:{id:'calfPNF', name:'Étirement mollet/soléaire (PNF)', area:'Cheville', svg:'calf', dose:'3×30s',
    how:'Contre un mur : d’abord genou tendu (gastroc), puis fléchi (soléaire). 5s contraction / 10s relâche.',
    cues:['Bassin au carré','Pression légère','Progression douce'],
    errors:['Rebondir','Hypercambrer','Bloquer la respiration']
  },
  eccCalf:{id:'eccCalf', name:'Mollet excentrique unilatéral', area:'Cheville', svg:'calfEcc', dose:'3×8',
    how:'Monte rapidement sur demi‑pointe, descends en 5s, amplitude complète.',
    cues:['Appui stable','Genou souple','Contrôle sur toute la descente'],
    errors:['Descente trop rapide','Cheville qui vrille','Talon en dedans/dehors']
  },
  ankleWallCar:{id:'ankleWallCar', name:'Dorsiflexion “car line” au mur', area:'Cheville', svg:'car', dose:'2×10',
    how:'Pied à plat, genou glisse vers le mur sur une ligne imaginaire, retour lent.',
    cues:['Talons au sol','Genou suit l’axe du pied','Amplitude progressive'],
    errors:['Genou en varus/valgus','Rotation du bassin']
  },
  "9090LiftL":{id:'9090LiftL', name:'90/90 – levées jambe arrière (G)', area:'Hanche', svg:'9090', dose:'3×5',
    how:'Assis 90/90, soulève la jambe arrière gauche sans bouger le tronc.',
    cues:['Tronc immobile','Levé court mais actif','Pied en flexion'],
    errors:['Bascule du bassin','Arrondir le dos']
  },
  "9090LiftR":{id:'9090LiftR', name:'90/90 – levées jambe arrière (D)', area:'Hanche', svg:'9090', dose:'3×5',
    how:'Assis 90/90, soulève la jambe arrière droite sans bouger le tronc.',
    cues:['Tronc immobile','Levé court mais actif','Pied en flexion'],
    errors:['Bascule du bassin','Arrondir le dos']
  },
  psoasL:{id:'psoasL', name:'Fente psoas (G) – PNF', area:'Hanche', svg:'lunge', dose:'3×',
    how:'Genou gauche au sol, contracte le fessier G 5s / relâche 10s.',
    cues:['Bassin neutre','Côtes basses','Regard loin'],
    errors:['Hypercambrure','Genou trop avancé']
  },
  psoasR:{id:'psoasR', name:'Fente psoas (D) – PNF', area:'Hanche', svg:'lunge', dose:'3×',
    how:'Genou droit au sol, contracte le fessier D 5s / relâche 10s.',
    cues:['Bassin neutre','Côtes basses','Regard loin'],
    errors:['Hypercambrure','Genou trop avancé']
  },
  cossack:{id:'cossack', name:'Cossack squat (latéral)', area:'Global', svg:'cossack', dose:'3×5/side',
    how:'Descends d’un côté, l’autre jambe tendue, buste haut, talons au sol.',
    cues:['Genou suit orteils','Buste haut','Respiration calme'],
    errors:['Talon qui se décolle','Genou qui rentre']
  },
  bridge:{id:'bridge', name:'Pont unilatéral', area:'Global', svg:'bridge', dose:'3×10/side',
    how:'Un pied au sol, monte le bassin sans vriller.',
    cues:['Bassin stable','Fessier contracté en haut','Exhale en haut'],
    errors:['Arc lombaire','Pousser avec les lombaires']
  },
  frog:{id:'frog', name:'Frog stretch (Grenouille)', area:'Global', svg:'frog', dose:'2×45s',
    how:'À genoux, genoux écartés, bascule doucement le bassin d’avant en arrière.',
    cues:['Hanches à ~90°','Appuis symétriques','Mouvement lent'],
    errors:['Glisser trop vite','Compression lombaire']
  },
  deepHold:{id:'deepHold', name:'Deep squat assisté', area:'Global', svg:'squat', dose:'2×1min',
    how:'Face au mur ou en appui, descends et maintiens, talons au sol.',
    cues:['Genoux ouverts activement','Poitrine fière','Respiration nasale'],
    errors:['S’effondrer en bas','Dos trop arrondi']
  },
  wallSquat:{id:'wallSquat', name:'Wall squat drill', area:'Global', svg:'wall', dose:'2×8',
    how:'Face au mur (20–30 cm), descends en squat sans toucher le mur ni lever les talons.',
    cues:['Genoux suivent les orteils','Buste droit','Gainage léger'],
    errors:['Talon qui se lève','Front contre le mur']
  }
};
function EXO_SVG(kind){
  const map = {
    ankle:'M50 10 v80 M20 70 h60 M35 70 q15-30 30 0',
    calf:'M30 20 v60 M70 20 v60 M20 80 h60',
    calfEcc:'M20 80 h60 M40 60 l10 20 l10 -20',
    "9090":'M20 70 h30 v-30 h-30 M70 40 h-20 v30 h20',
    lunge:'M20 70 h30 v-20 h20 v-15',
    cossack:'M20 70 h60 M30 70 l20 -20 l20 20',
    bridge:'M20 70 h60 M20 70 q30 -30 60 0',
    squat:'M20 70 h60 M30 70 v-25 h40 v25',
    frog:'M20 70 h60 M30 70 q20 -25 40 0',
    wall:'M70 20 v60 M30 70 h40',
    car:'M30 60 q20 -30 40 0'
  };
  const d = map[kind] || 'M10 10 h80 v80 h-80 z';
  return `<svg viewBox="0 0 100 100" width="100" height="90"><rect x="1" y="1" width="98" height="98" rx="10" fill="#0b142a" stroke="#2a3b66"/><path d="${d}" stroke="#7dd3fc" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
}
