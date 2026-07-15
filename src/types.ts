/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OrbType {
  id: number;
  nameEn: string;
  nameHi: string;
  radius: number;
  color: string;
  scoreValue: number;
  glowColor: string;
}

export interface PhysicsObject {
  id: string;
  typeIndex: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isStatic: boolean;
  angle: number;
  angularVelocity: number;
  creationTime: number; // to prevent instant merging on spawn
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number; // 0 to 1
  decay: number;
  glowColor?: string;
  type?: "spark" | "ring" | "star";
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
  maxOrbReached: number;
}

export interface Achievement {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  unlocked: boolean;
  icon: string;
}

export const ORB_TIERS: OrbType[] = [
  { id: 0, nameEn: "Pulsar Ball", nameHi: "पल्सर गेंद", radius: 14, color: "#ffffff", glowColor: "rgba(255, 255, 255, 0.8)", scoreValue: 2 },
  { id: 1, nameEn: "Nebula Ball", nameHi: "नेबुला गेंद", radius: 20, color: "#a855f7", glowColor: "rgba(168, 85, 247, 0.8)", scoreValue: 4 },
  { id: 2, nameEn: "Aurora Ball", nameHi: "औरोरा गेंद", radius: 27, color: "#3b82f6", glowColor: "rgba(59, 130, 246, 0.8)", scoreValue: 8 },
  { id: 3, nameEn: "Comet Ball", nameHi: "धूमकेतु गेंद", radius: 35, color: "#06b6d4", glowColor: "rgba(6, 182, 212, 0.8)", scoreValue: 16 },
  { id: 4, nameEn: "Plasma Ball", nameHi: "प्लाज्मा गेंद", radius: 44, color: "#10b981", glowColor: "rgba(16, 185, 129, 0.8)", scoreValue: 32 },
  { id: 5, nameEn: "Nova Ball", nameHi: "नोवा गेंद", radius: 54, color: "#eab308", glowColor: "rgba(234, 179, 8, 0.8)", scoreValue: 64 },
  { id: 6, nameEn: "Solar Ball", nameHi: "सोलर गेंद", radius: 65, color: "#f97316", glowColor: "rgba(249, 115, 22, 0.8)", scoreValue: 128 },
  { id: 7, nameEn: "Quasar Ball", nameHi: "क्वेसार गेंद", radius: 77, color: "#ef4444", glowColor: "rgba(239, 68, 68, 0.8)", scoreValue: 256 },
  { id: 8, nameEn: "Eclipse Ball", nameHi: "इक्लिप्स गेंद", radius: 90, color: "#ec4899", glowColor: "rgba(236, 72, 153, 0.8)", scoreValue: 512 },
  { id: 9, nameEn: "Galaxy Ball", nameHi: "गैलेक्सी गेंद", radius: 104, color: "#8b5cf6", glowColor: "rgba(139, 92, 246, 0.8)", scoreValue: 1024 },
  { id: 10, nameEn: "Supernova Ball", nameHi: "सुपरनोवा गेंद", radius: 120, color: "#38bdf8", glowColor: "rgba(56, 189, 248, 0.9)", scoreValue: 2048 },
];

export const TRANSLATIONS = {
  en: {
    title: "Neon Ball Merge",
    subtitle: "Cosmic Ball Drop & Match",
    score: "Score",
    highScore: "High Score",
    next: "Next Ball",
    gameOver: "Game Over!",
    restart: "Play Again",
    start: "Start Game",
    soundOn: "Sound On",
    soundOff: "Muted",
    howToPlay: "How To Play",
    howToPlay1: "Drag or tap to aim, release to drop glowing cosmic balls.",
    howToPlay2: "Match two same-colored balls to merge them into a bigger, brighter ball.",
    howToPlay3: "Keep merging to create the ultimate Supernova Ball!",
    howToPlay4: "Warning: Don't let the balls stack above the top red danger line!",
    danger: "DANGER!",
    achievements: "Achievements",
    unlocked: "Unlocked!",
    locked: "Locked",
    enterName: "Enter your name for Leaderboard",
    leaderboard: "Top Playables Highscores",
    saveScore: "Save Score",
    scoreSaved: "Score Saved!",
    combo: "Combo!",
    clear: "Clear All",
    credits: "YouTube Playables Ready with Ad Placements"
  },
  hi: {
    title: "नेऑन बॉल मर्ज",
    subtitle: "कॉस्मिक बॉल ड्रॉप और मैच",
    score: "स्कोर",
    highScore: "हाई स्कोर",
    next: "अगली गेंद",
    gameOver: "खेल समाप्त!",
    restart: "फिर से खेलें",
    start: "खेल शुरू करें",
    soundOn: "आवाज़ चालू",
    soundOff: "म्यूट",
    howToPlay: "कैसे खेलें",
    howToPlay1: "निशाना लगाने के लिए ड्रैग या टैप करें, गेंद गिराने के लिए छोड़ें।",
    howToPlay2: "समान रंग की दो गेंदों को आपस में मिलाकर एक बड़ी, अधिक चमकदार गेंद में बदलें।",
    howToPlay3: "अंतिम सुपरनोवा गेंद बनाने के लिए मर्ज करते रहें!",
    howToPlay4: "सावधान: गेंदों को सबसे ऊपर की लाल डेंजर लाइन से ऊपर न जाने दें!",
    danger: "खतरा!",
    achievements: "उपलब्धियां",
    unlocked: "अनलॉक किया!",
    locked: "लॉक किया",
    enterName: "लीडरबोर्ड के लिए अपना नाम दर्ज करें",
    leaderboard: "टॉप प्लेबल्स हाई-स्कोर्स",
    saveScore: "स्कोर सुरक्षित करें",
    scoreSaved: "स्कोर सुरक्षित हुआ!",
    combo: "कॉम्बो!",
    clear: "सब हटाएं",
    credits: "यूट्यूब प्लेबल्स विज्ञापन सपोर्ट के साथ तैयार"
  }
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "first_merge", titleEn: "Cosmic Bond", titleHi: "ब्रह्मांडीय बंधन", descEn: "Merge your first two orbs", descHi: "अपने पहले दो ऑर्ब्स को मर्ज करें", unlocked: false, icon: "✨" },
  { id: "reach_nova", titleEn: "Solar Ignition", titleHi: "सोलर इग्निशन", descEn: "Unlock the Solar Orb (Tier 6)", descHi: "सोलर ऑर्ब (टियर 6) को अनलॉक करें", unlocked: false, icon: "🔥" },
  { id: "score_1000", titleEn: "Galactic Explorer", titleHi: "गैलेक्टिक एक्सप्लोरर", descEn: "Reach 1,000 points in a single run", descHi: "एक ही बार में 1,000 अंक प्राप्त करें", unlocked: false, icon: "👑" },
  { id: "supernova", titleEn: "Supernova Creator", titleHi: "सुपरनोवा निर्माता", descEn: "Create a Supernova (Tier 11)", descHi: "एक सुपरनोवा (टियर 11) बनाएं", unlocked: false, icon: "🌌" },
  { id: "combo_king", titleEn: "Combo Master", titleHi: "कॉम्बो मास्टर", descEn: "Trigger 4 merges in rapid succession", descHi: "तेज़ी से लगातार 4 मर्ज ट्रिगर करें", unlocked: false, icon: "⚡" }
];
