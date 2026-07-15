/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Gamepad2, Sparkles, Languages, HelpCircle, Trophy, Award, RotateCcw, Volume2, VolumeX } from "lucide-react";
import GameCanvas from "./components/GameCanvas";
import Leaderboard from "./components/Leaderboard";
import AchievementsPanel from "./components/AchievementsPanel";
import Instructions from "./components/Instructions";
import { TRANSLATIONS, INITIAL_ACHIEVEMENTS, Achievement, ORB_TIERS } from "./types";
import { gameAudio } from "./utils/audio";
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Check karein ki kya game YouTube ke environment mein chal raha hai
    if (window.ytgame) {
      try {
        // 1. YouTube ko batayein ki game ka pehla frame ready hai (Loading start)
        window.ytgame.game.firstFrameReady();
        console.log("YouTube SDK: First Frame Ready sent");

        // 2. Agar aapka game turant start ho jata hai toh gameReady bhi bhej dein
        // (Agar loading asset heavy hai, toh use asset load hone ke baad call karein)
        window.ytgame.game.gameReady();
        console.log("YouTube SDK: Game Ready sent");
      } catch (error) {
        console.error("YouTube SDK Initialization Error:", error);
      }
    }
  }, []);

  return (
    <div>
      {/* Aapka Game Canvas ya UI ya Code yahan hoga */}
    </div>
  );
}

export default App;


export default function App() {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [maxOrbReached, setMaxOrbReached] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [activeTab, setActiveTab] = useState<"scores" | "achievements" | "rules">("scores");

  // Achievement unlock banner state
  const [unlockedBanner, setUnlockedBanner] = useState<Achievement | null>(null);

  // YouTube Playables Simulated Ad Integration States
  const [reviveKey, setReviveKey] = useState(0);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(5);
  const [adType, setAdType] = useState<"double" | "revive" | "bonus">("bonus");
  const [playableBalloons, setPlayableBalloons] = useState<{ id: number; popped: boolean; color: string; x: number; y: number }[]>([]);
  const [adLog, setAdLog] = useState<string>("Ready to test ads...");

  const t = TRANSLATIONS[language];

  const startSimulatedAd = (type: "double" | "revive" | "bonus") => {
    setAdType(type);
    setShowAdOverlay(true);
    setAdTimeLeft(5);
    setAdLog(`Ad of type "${type}" loading...`);
    
    // Generate 5 interactive neon balloons for the playable preview
    const colors = ["#ff007f", "#00ffff", "#00ff66", "#ffff00", "#ff6600"];
    const items = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      popped: false,
      color: colors[i % colors.length],
      x: 10 + Math.random() * 80, // % width
      y: 20 + Math.random() * 50, // % height
    }));
    setPlayableBalloons(items);
    gameAudio.playCombo(1);
  };

  // 5-second Ad countdown
  useEffect(() => {
    let timer: any;
    if (showAdOverlay && adTimeLeft > 0) {
      timer = setTimeout(() => {
        setAdTimeLeft((prev) => prev - 1);
        if (adTimeLeft === 1) {
          gameAudio.playCombo(3);
          setAdLog("Ad play finished. Reward unlocked!");
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showAdOverlay, adTimeLeft]);

  // Pop balloon playable action
  const handlePopBalloon = (id: number) => {
    setPlayableBalloons((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, popped: true } : b));
      // Play a cute popping feedback sound
      gameAudio.playDrop();
      
      const allPopped = next.every((b) => b.popped);
      if (allPopped) {
        setAdLog("All balloons popped! Instant claim enabled!");
        // Instantly unlock reward early as a reward for playability!
        setAdTimeLeft(0);
        gameAudio.playCombo(4);
      }
      return next;
    });
  };

  // Reward claimer
  const claimAdReward = () => {
    setShowAdOverlay(false);
    
    if (adType === "double") {
      setScore((prev) => {
        const doubled = prev * 2;
        if (doubled >= 1000) triggerAchievementUnlock("score_1000");
        return doubled;
      });
      setAdLog("Success: Doubled final score!");
    } else if (adType === "revive") {
      setReviveKey((prev) => prev + 1);
      setGameState("playing");
      setAdLog("Success: Game revived & cleared!");
    } else if (adType === "bonus") {
      setScore((prev) => {
        const next = prev + 1000;
        if (next >= 1000) triggerAchievementUnlock("score_1000");
        return next;
      });
      setAdLog("Success: Awarded +1000 points bonus!");
    }
    
    gameAudio.playAchievement();
  };

  // Load Highscore and Achievements on mount
  useEffect(() => {
    // 0. Unlock Web Audio on first user interaction
    const unlockAudio = () => {
      gameAudio.resume();
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("pointerdown", unlockAudio);
    };
    window.addEventListener("click", unlockAudio, { passive: true });
    window.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("pointerdown", unlockAudio, { passive: true });

    // 1. Load Local High Score
    try {
      const storedScores = localStorage.getItem("neon_merge_scores");
      if (storedScores) {
        const parsed = JSON.parse(storedScores);
        if (parsed.length > 0) {
          setHighScore(parsed[0].score);
        }
      } else {
        setHighScore(1800); // Vega Pro initial highscore
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Load Achievements progress
    try {
      const storedAch = localStorage.getItem("neon_merge_achievements");
      if (storedAch) {
        const parsed = JSON.parse(storedAch) as Achievement[];
        // Align keys with initial configuration in case of scheme changes
        const merged = INITIAL_ACHIEVEMENTS.map((initial) => {
          const found = parsed.find((item) => item.id === initial.id);
          return found ? { ...initial, unlocked: found.unlocked } : initial;
        });
        setAchievements(merged);
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("pointerdown", unlockAudio);
    };
  }, []);

  // Update overall highscore when score increases
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  const handleScoreChange = (newScoreOrUpdater: number | ((prev: number) => number)) => {
    setScore(newScoreOrUpdater);
  };

  const handleMaxOrbUpdate = (maxOrbLvl: number) => {
    setMaxOrbReached(maxOrbLvl);
  };

  const handleRestart = () => {
    setScore(0);
    setResetKey((prev) => prev + 1);
    setGameState("playing");
  };

  const handleScoreSaved = () => {
    // Reload high score from leaderboard records
    try {
      const stored = localStorage.getItem("neon_merge_scores");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setHighScore(parsed[0].score);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger Achievement Unlocking
  const triggerAchievementUnlock = (id: string) => {
    setAchievements((prev) => {
      const updated = prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          // Play reward arpeggio
          gameAudio.playAchievement();

          // Save state to local storage
          const nextState = { ...ach, unlocked: true };
          setTimeout(() => {
            // Show alert banner
            setUnlockedBanner(nextState);
            // Hide banner after 3.5 seconds
            setTimeout(() => {
              setUnlockedBanner(null);
            }, 3500);
          }, 100);

          return nextState;
        }
        return ach;
      });

      localStorage.setItem("neon_merge_achievements", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const currentMaxOrb = ORB_TIERS[Math.min(maxOrbReached, ORB_TIERS.length - 1)];

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col justify-between overflow-x-hidden relative">
      {/* Background Ambient Cosmic Blur Shapes */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Achievement Banner Alert */}
      {unlockedBanner && (
        <div id="achievement-banner-alert" className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-yellow-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-xl shrink-0 select-none">
            {unlockedBanner.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-extrabold tracking-widest text-yellow-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {language === "en" ? "ACHIEVEMENT UNLOCKED!" : "उपलब्धि अनलॉक हुई!"}
            </div>
            <div className="text-xs font-bold text-white truncate mt-0.5">
              {language === "en" ? unlockedBanner.titleEn : unlockedBanner.titleHi}
            </div>
            <div className="text-[10px] text-gray-400 truncate mt-0.5">
              {language === "en" ? unlockedBanner.descEn : unlockedBanner.descHi}
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation / Header */}
      <header className="border-b border-[#181b28]/60 bg-[#0c0e15]/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 id="header-game-title" className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent leading-none">
                {t.title}
              </h1>
              <p className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wider mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              id="lang-toggle-btn"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11131a] hover:bg-[#1b1e2b] border border-[#232736] text-xs font-medium text-gray-300 transition-all duration-300 active:scale-95"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === "en" ? "हिन्दी" : "English"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Stage Layout Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start px-4 py-6">
        
        {/* LEFT COLUMN: THE ARCADE CONSOLE PLAYABLE */}
        <section className="lg:col-span-5 flex flex-col items-center">
          
          {/* Real-time score boards during active play */}
          <div className="w-full max-w-[380px] grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#11131a] border border-[#232736] rounded-2xl p-3.5 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-transparent"></div>
              <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{t.score}</span>
              <div id="game-live-score" className="text-2xl font-mono font-extrabold text-white mt-1 tracking-wider">
                {score}
              </div>
            </div>

            <div className="bg-[#11131a] border border-[#232736] rounded-2xl p-3.5 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-transparent"></div>
              <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{t.highScore}</span>
              <div id="game-live-highscore" className="text-2xl font-mono font-extrabold text-yellow-400 mt-1 tracking-wider">
                {highScore}
              </div>
            </div>
          </div>

          <GameCanvas
            score={score}
            onScoreChange={handleScoreChange}
            onMaxOrbUpdate={handleMaxOrbUpdate}
            onAchievementUnlock={triggerAchievementUnlock}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            language={language}
            gameState={gameState}
            setGameState={setGameState}
            onRestart={handleRestart}
            resetKey={resetKey}
            reviveKey={reviveKey}
            onWatchAdRevive={() => startSimulatedAd("revive")}
            onWatchAdDouble={() => startSimulatedAd("double")}
          />
        </section>

        {/* RIGHT COLUMN: INTERACTIVE HUD / TABS COCKPIT */}
        <section className="lg:col-span-7 flex flex-col gap-6 w-full">
          {/* Quick Tab Selector for Leaderboard, Achievements, Instructions */}
          <div className="flex bg-[#11131a] border border-[#232736] p-1 rounded-2xl w-full">
            <button
              id="tab-btn-scores"
              onClick={() => setActiveTab("scores")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === "scores"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{language === "en" ? "Leaderboard" : "लीडरबोर्ड"}</span>
            </button>
            <button
              id="tab-btn-achievements"
              onClick={() => setActiveTab("achievements")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === "achievements"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{language === "en" ? "Achievements" : "उपलब्धियां"}</span>
            </button>
            <button
              id="tab-btn-rules"
              onClick={() => setActiveTab("rules")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === "rules"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{language === "en" ? "How to Play" : "कैसे खेलें"}</span>
            </button>
          </div>

          {/* Active Tab View Rendering */}
          <div className="transition-all duration-300">
            {activeTab === "scores" && (
              <div className="space-y-4">
                {/* Real-time Max Orb Status Indicator card */}
                {gameState === "playing" && maxOrbReached > 0 && (
                  <div id="max-orb-banner" className="flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-[#11131a] border border-[#232736] p-4 rounded-2xl shadow-md">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-black text-xs relative"
                        style={{
                          backgroundColor: currentMaxOrb.color,
                          boxShadow: `0 0 14px ${currentMaxOrb.color}`,
                        }}
                      >
                        <div className="absolute inset-0.5 rounded-full bg-white/20"></div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {language === "en" ? "HIGHEST COSMIC ORB REACHED" : "प्राप्त किया गया उच्चतम ऑर्ब"}
                        </div>
                        <div id="max-orb-name" className="text-sm font-extrabold text-white mt-0.5">
                          {language === "en" ? currentMaxOrb.nameEn : currentMaxOrb.nameHi}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        Tier {maxOrbReached + 1}
                      </span>
                    </div>
                  </div>
                )}
                <Leaderboard
                  currentScore={score}
                  maxOrbReached={maxOrbReached}
                  language={language}
                  onScoreSaved={handleScoreSaved}
                  gameActive={gameState === "playing"}
                />
              </div>
            )}

            {activeTab === "achievements" && (
              <AchievementsPanel achievements={achievements} language={language} />
            )}

            {activeTab === "rules" && (
              <Instructions language={language} />
            )}
          </div>

          {/* YouTube Playables Ad Sandbox Controller Board */}
          <div id="ad-sandbox-console" className="bg-gradient-to-br from-[#0f111a] to-[#0c0d15] border border-dashed border-indigo-500/30 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-500/15 text-indigo-400 font-mono text-[9px] font-extrabold uppercase border-b border-l border-indigo-500/20 rounded-bl-lg">
              YouTube Sandbox
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs">📺</span>
              <h3 className="text-xs font-extrabold tracking-wider text-indigo-300 uppercase">
                {language === "en" ? "YouTube Playables Ad Simulator" : "यूट्यूब प्लेबल्स विज्ञापन सिमुलेटर"}
              </h3>
            </div>
            
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
              {language === "en" 
                ? "Simulate YouTube Playables SDK ads. Trigger ads manually to test scoring and free-revive loops instantly."
                : "यूट्यूब प्लेबल्स एसडीके विज्ञापनों का परीक्षण करें। स्कोरिंग और फ्री-रिवाइव का परीक्षण करने के लिए विज्ञापन चलाएं।"}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                id="sandbox-ad-bonus-btn"
                onClick={() => startSimulatedAd("bonus")}
                className="py-2.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-[11px] font-bold transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
              >
                <span>🎁</span>
                <span>{language === "en" ? "Rewarded Ad (+1000 Pts)" : "रिवॉर्ड विज्ञापन (+1000)"}</span>
              </button>
              
              <button
                id="sandbox-ad-revive-btn"
                onClick={() => startSimulatedAd("revive")}
                className="py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 rounded-xl text-[11px] font-bold transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
              >
                <span>💚</span>
                <span>{language === "en" ? "Test Revive Ad" : "रिवाइव विज्ञापन टेस्ट"}</span>
              </button>
            </div>

            {/* Simulated SDK Logs */}
            <div className="bg-[#07080c] border border-[#1b1e2b] rounded-xl p-2.5 font-mono text-[9px] text-gray-500 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shrink-0"></span>
                <span className="text-gray-400 font-semibold uppercase">SDK Log:</span>
                <span className="text-gray-300 truncate">{adLog}</span>
              </div>
              <span className="text-indigo-400 font-bold shrink-0">v1.2.0-active</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Branding credits */}
      <footer className="border-t border-[#181b28]/30 py-4 text-center text-gray-600 font-mono text-[10px] px-4">
        <p>{t.credits}</p>
        <p className="mt-1 opacity-75">© 2026 Cosmic Games Studio • Neon Merge</p>
      </footer>

      {/* FULL-SCREEN PLAYABLE AD OVERLAY */}
      {showAdOverlay && (
        <div id="full-screen-ad-overlay" className="fixed inset-0 z-50 bg-[#06070d]/98 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          
          {/* Sparkly background circles */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header Banner */}
          <div className="w-full max-w-sm flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2.5 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff0000] animate-pulse"></span>
              <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">
                {language === "en" ? "YouTube Playable Ad" : "यूट्यूब प्लेबल विज्ञापन"}
              </span>
            </div>
            
            <div className="text-right">
              {adTimeLeft > 0 ? (
                <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
                  {language === "en" ? `Reward in ${adTimeLeft}s` : `इनाम ${adTimeLeft}s में`}
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {language === "en" ? "Reward Unlocked!" : "इनाम अनलॉक हुआ!"}
                </span>
              )}
            </div>
          </div>

          {/* The Playable Interactive Game Box! */}
          <div className="w-full max-w-sm aspect-square bg-[#0b0c15] border-2 border-dashed border-slate-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 pointer-events-none"></div>

            <div className="relative z-10 text-center pt-2">
              <h4 className="text-sm font-extrabold tracking-tight text-white bg-gradient-to-r from-pink-400 to-indigo-300 bg-clip-text text-transparent">
                {language === "en" ? "🎮 INTERACTIVE MINI-GAME" : "🎮 इंटरएक्टिव मिनी-गेम"}
              </h4>
              <p className="text-[10px] text-gray-400 mt-1">
                {language === "en" ? "Pop all neon balloons to skip countdown!" : "उल्टी गिनती छोड़ने के लिए सभी नियॉन गुब्बारे फोड़ें!"}
              </p>
            </div>

            {/* Playable balloons/orbs zone */}
            <div className="relative flex-1 w-full min-h-[180px]">
              {playableBalloons.map((b) => !b.popped && (
                <button
                  key={b.id}
                  onClick={() => handlePopBalloon(b.id)}
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs text-black cursor-pointer shadow-lg animate-bounce select-none transition-all hover:scale-110 active:scale-90"
                >
                  <div className="absolute inset-0 rounded-full bg-white/20"></div>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: b.color,
                      boxShadow: `0 0 16px ${b.color}`,
                    }}
                  ></div>
                  <span className="relative z-10 text-[10px] font-bold">🎈</span>
                </button>
              ))}

              {/* Success Checkmark when all popped */}
              {playableBalloons.every((b) => b.popped) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 rounded-2xl p-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold mb-2 animate-bounce">
                    ✓
                  </div>
                  <div className="text-xs font-bold text-white">
                    {language === "en" ? "Playable Cleared!" : "प्लेबल गेम पूरा हुआ!"}
                  </div>
                  <div className="text-[9px] text-emerald-400 mt-1 font-semibold uppercase tracking-wider">
                    {language === "en" ? "Instant Skip Granted" : "तुरंत स्किप अनलॉक"}
                  </div>
                </div>
              )}
            </div>

            {/* Reward Summary Footer */}
            <div className="relative z-10 bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <div className="text-left">
                <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none">
                  {language === "en" ? "REWARD TARGET" : "इनाम का लक्ष्य"}
                </div>
                <div className="text-xs font-bold text-white mt-0.5">
                  {adType === "double" && (language === "en" ? "Double Score Multiplier" : "स्कोर डबल बोनस")}
                  {adType === "revive" && (language === "en" ? "Free Game Revive (Extra Life)" : "फ्री गेम रिवाइव")}
                  {adType === "bonus" && (language === "en" ? "Instant +1,000 Points Bonus" : "इंस्टेंट +1000 अंक बोनस")}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button Area */}
          <div className="w-full max-w-sm mt-6">
            <button
              id="claim-ad-reward-btn"
              disabled={adTimeLeft > 0 && !playableBalloons.every((b) => b.popped)}
              onClick={claimAdReward}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all duration-300 shadow-md ${
                adTimeLeft > 0 && !playableBalloons.every((b) => b.popped)
                  ? "bg-slate-800 border border-slate-700 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white active:scale-95 shadow-indigo-500/20"
              }`}
            >
              {adTimeLeft > 0 && !playableBalloons.every((b) => b.popped) ? (
                <span>
                  {language === "en" ? `Watch for ${adTimeLeft}s or Pop All` : `${adTimeLeft}s तक देखें या गुब्बारे फोड़ें`}
                </span>
              ) : (
                <span>{language === "en" ? "CLAIM REWARD & CLOSE" : "इनाम पाएं और बंद करें"}</span>
              )}
            </button>
            
            <p className="text-[10px] text-gray-500 mt-2 font-mono">
              YouTube Playables Ad-SDK Simulation Panel
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
