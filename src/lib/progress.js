export const STORAGE_KEY = 'poker-genie-progress';

const DEFAULT_PROGRESS = {
  xp: 0,
  totalHands: 0,
  totalCorrect: 0,
  bestStreak: 0,
  handsWithoutBlunder: 0,
  perfectDrill: false,
  drillsAttempted: 0,
  drillsCompleted: {},
  exploitWins: 0,
  unlockedAchievements: [],
};

export function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
  } catch {
    // localStorage unavailable or corrupted; fall through to defaults
  }
  return { ...DEFAULT_PROGRESS };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage unavailable; ignore
  }
}
