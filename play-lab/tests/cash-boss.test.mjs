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
 for(const [chapter,first,second,final] of [[0,0,1,5],[1,3,6,7],[2,2,4,8],[3,27,28,29],[4,9,10,11],[5,12,13,14],[6,15,16,17],[7,18,19,20],[8,21,22,23],[9,24,25,26]]){
  assert.equal(chapterBossPattern(chapter,-1,2,()=>0),first);
  assert.equal(chapterBossPattern(chapter,first,2,()=>0),second);
  assert.equal(chapterBossPattern(chapter,-1,1),final);
  assert.notEqual(chapterBossPattern(chapter,final,1,()=>.99),final);
 }
});

test('Foundry Counter Run clears at twelve damage and honors the guard',()=>{
 assert.deepEqual(bossHit(11,true,false,false,12),{damage:11,energy:9,blocked:true});
 assert.equal(bossHit(11,false,false,false,12).energy,0);
 assert.equal(bossHit(7,true,false,true,12).energy,0);
});

test('expansion and factory boss shots start inside the arena with visible warnings',async()=>{
 const {expansionAttack}=await import('../shared/cash/expansion.js');
 const left=7400;
 const labels=new Set();
 for(let pattern=12;pattern<=29;pattern++){
  for(const playerX of [left+25,left+480,left+935]){
   const {label,origins}=expansionAttack(pattern,left,playerX);
   labels.add(label);
   assert.ok(origins.length>=4);
   for(const {x,y,angle} of origins){
    assert.ok(x>left&&x<left+960&&y>0&&y<540);
    assert.ok(Number.isFinite(angle));
   }
  }
 }
 assert.equal(labels.size,18);
});
