export const SCORE_VERSION = 1;
const STORAGE_PREFIX = 'sparkle-play-lab:cash-scores';
const MAX_ENTRIES = 5;

function count(value, maximum) {
 return Math.min(maximum, Math.max(0, Math.floor(Number(value) || 0)));
}

/** Use unique defeated scouts and collected items from this chapter attempt. */
export function calculateChapterScore(stats = {}) {
 const cleared = stats.cleared === true;
 const breakdown = {
  clear: cleared ? 5000 : 0,
  scouts: count(stats.scouts, 200) * 100,
  collectibles: count(stats.collectibles, 12) * 250,
  dodgeCounters: count(stats.dodgeCounters, 20) * 150,
  time: cleared ? Math.max(0, 1800 - count(stats.elapsedSeconds, 86400) * 3) : 0,
  recovery: -((count(stats.lifeLosses, 1000) + count(stats.partnerFalls, 1000)) * 200 + count(stats.retries, 1000) * 500),
 };
 const total = Math.max(0, Object.values(breakdown).reduce((sum, value) => sum + value, 0));
 const grade = total >= 14000 ? 'S' : total >= 10000 ? 'A' : total >= 7000 ? 'B' : total >= 4000 ? 'C' : 'D';
 return {version: SCORE_VERSION, cleared, total, grade, breakdown};
}

function scoreKey(context) {
 const {chapter, difficulty, mode} = context || {};
 if (!Number.isInteger(chapter) || chapter < 1 || chapter > 10 ||
     !['practice', 'adventurer', 'challenge'].includes(difficulty) ||
     !['solo', 'co-op'].includes(mode)) return null;
 return [STORAGE_PREFIX, SCORE_VERSION, chapter, difficulty, mode].join(':');
}

function validEntry(entry) {
 return entry && entry.version === SCORE_VERSION && entry.cleared === true &&
  Number.isSafeInteger(entry.total) && entry.total >= 0 && entry.total <= 32800 &&
  ['S', 'A', 'B', 'C', 'D'].includes(entry.grade) &&
  typeof entry.runId === 'string' && entry.runId.length > 0 && entry.runId.length <= 128;
}

export function readChapterScores(storage, context) {
 const key = scoreKey(context);
 if (!key) return [];
 try {
  const entries = JSON.parse(storage.getItem(key) || '[]');
  if (!Array.isArray(entries)) return [];
  return entries.filter(validEntry).sort((a, b) => b.total - a.total).slice(0, MAX_ENTRIES);
 } catch {
  return [];
 }
}

/** Only full, cleared chapters qualify. A repeated run ID never adds an entry. */
export function recordChapterScore(storage, context, result, options = {}) {
 const entries = readChapterScores(storage, context);
 const key = scoreKey(context);
 const runId = options.runId || globalThis.crypto?.randomUUID?.() ||
  Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
 const entry = {version: result?.version, cleared: result?.cleared,
  total: result?.total, grade: result?.grade, runId};
 if (!key || options.eligible === false || !validEntry(entry) || entries.some(item => item.runId === runId)) {
  return {saved: false, isBest: false, rank: null, entries};
 }
 const isBest = entries.length === 0 || entry.total > entries[0].total;
 const next = [...entries, entry].sort((a, b) => b.total - a.total).slice(0, MAX_ENTRIES);
 const rank = next.findIndex(item => item.runId === runId) + 1;
 if (rank === 0) return {saved: false, isBest: false, rank: null, entries};
 try {
  storage.setItem(key, JSON.stringify(next));
  return {saved: true, isBest, rank, entries: next};
 } catch {
  return {saved: false, isBest: false, rank: null, entries, storageFailed: true};
 }
}
