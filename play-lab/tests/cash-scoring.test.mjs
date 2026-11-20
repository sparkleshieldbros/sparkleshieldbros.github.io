import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateChapterScore, readChapterScores, recordChapterScore} from '../shared/cash/scoring.js';

const context = {chapter: 1, difficulty: 'adventurer', mode: 'solo'};
const storage = () => {
 const values = new Map();
 return {getItem: key => values.get(key), setItem: (key, value) => values.set(key, value)};
};
const clear = stats => calculateChapterScore({cleared: true, ...stats});

test('score rewards clears, skilled actions and speed while limiting farming', () => {
 assert.equal(clear({scouts: 5, collectibles: 2, dodgeCounters: 3, elapsedSeconds: 120}).total, 7890);
 assert.equal(clear({lifeLosses: 2, retries: 1}).total, 5900);
 assert.equal(clear({partnerFalls: 2}).total, clear({lifeLosses: 2}).total);
 assert.equal(clear({elapsedSeconds: 10000}).breakdown.time, 0);
 assert.equal(clear({dodgeCounters: 1000}).breakdown.dodgeCounters, 3000);
 assert.equal(calculateChapterScore({lifeLosses: 100}).total, 0);
});

test('only eligible full clears rank and a run is saved once', () => {
 const store = storage();
 assert.equal(recordChapterScore(store, context, clear(), {eligible: false}).saved, false);
 assert.equal(recordChapterScore(store, context, calculateChapterScore(), {runId: 'incomplete'}).saved, false);
 assert.equal(recordChapterScore(store, context, clear(), {runId: 'one'}).isBest, true);
 assert.equal(recordChapterScore(store, context, clear(), {runId: 'one'}).saved, false);
 assert.equal(readChapterScores(store, context).length, 1);
});

test('top five persist separately for chapter, difficulty and player mode', () => {
 const store = storage();
 for (let index = 0; index < 8; index++) {
  recordChapterScore(store, context, clear({scouts: index}), {runId: String(index)});
 }
 assert.deepEqual(readChapterScores(store, context).map(entry => entry.total), [7500, 7400, 7300, 7200, 7100]);
 assert.deepEqual(readChapterScores(store, {...context, mode: 'co-op'}), []);
 assert.deepEqual(readChapterScores(store, {...context, difficulty: 'challenge'}), []);
 assert.deepEqual(readChapterScores(store, {...context, chapter: 2}), []);
});

test('unavailable or malformed browser storage does not break chapter completion', () => {
 const unavailable = {getItem() { throw Error(); }, setItem() { throw Error(); }};
 assert.deepEqual(readChapterScores(unavailable, context), []);
 assert.equal(recordChapterScore(unavailable, context, clear()).saved, false);
 assert.equal(recordChapterScore(unavailable, context, clear()).storageFailed, true);
 assert.deepEqual(readChapterScores({getItem: () => '{broken'}, context), []);
 assert.deepEqual(readChapterScores({getItem: () => '[{"total":99999999}]'}, context), []);
 assert.equal(recordChapterScore(storage(), {...context, chapter: 11}, clear()).saved, false);
});
