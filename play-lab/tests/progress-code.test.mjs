import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decodeProgress,encodeProgress} from '../shared/progress-code.js';

test('progress codes preserve Echo Factory completion and older chapter counts',()=>{
 for(const completed of [3,4]){
  const progress=[0,completed,0,0,0,0,0];
  assert.deepEqual(decodeProgress(encodeProgress(progress)),progress);
 }
 assert.throws(()=>encodeProgress([0,5,0,0,0,0,0]),/Invalid progress/);
});
