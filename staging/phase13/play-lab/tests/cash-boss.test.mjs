import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceBossClock,bossHit,nextBossPattern} from '../shared/cash/boss.js';

test('windup becomes a shot and opens the guard',()=>{
 const state={clock:1,warning:false,ogreLives:2};
 assert.equal(advanceBossClock(state,1,'practice'), 'windup');
 assert.equal(state.warning,true);
 assert.equal(advanceBossClock(state,1149,'practice'),null);
 assert.equal(advanceBossClock(state,1,'practice',()=>0),'fire');
 assert.deepEqual([state.warning,state.clock],[false,1250]);
});
test('attack draws do not repeat and phase two adds patterns',()=>{
 assert.equal(nextBossPattern(0,2,()=>0),1);
 assert.equal(nextBossPattern(0,1,()=>.99),4);
});
test('guard blocks ordinary coins and charged coins count as four',()=>{
 assert.deepEqual(bossHit(0,true,false),{damage:0,energy:100,blocked:true});
 assert.equal(bossHit(0,true,true).damage,4);
 assert.equal(bossHit(48,false,false).energy>0,true);
 assert.equal(bossHit(49,false,false).energy,0);
 assert.deepEqual(bossHit(48,true,true,true),{damage:53,energy:0,blocked:false});
});

test('each chapter has a distinct arsenal and a second-life opener',async()=>{
 const {chapterBossPattern}=await import('../shared/cash/boss.js');
 for(const [chapter,first,second,final] of [[0,0,1,5],[1,3,6,7],[2,2,4,8]]){
  assert.equal(chapterBossPattern(chapter,-1,2,()=>0),first);
  assert.equal(chapterBossPattern(chapter,first,2,()=>0),second);
  assert.equal(chapterBossPattern(chapter,-1,1),final);
  assert.notEqual(chapterBossPattern(chapter,final,1,()=>.99),final);
 }
});
