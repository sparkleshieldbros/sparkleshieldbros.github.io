import test from 'node:test';
import assert from 'node:assert/strict';
import {bossIdentity,advanceEdgePressure,takeEdgePressure} from '../shared/cash/boss-identity.js';
test('all ten chapters have distinct identities and book Ogre starts unchanged',()=>{
 assert.equal(new Set(Array.from({length:10},(_,i)=>bossIdentity(i).name)).size,10);
 assert.equal(bossIdentity(0).tint,0xffffff);
});
test('edge camping adds a locked falling shot after a full warned windup',()=>{
 const state={};
 advanceEdgePressure(state,1000,[{x:10025}],10000);
 assert.deepEqual(takeEdgePressure(state),[]);
 advanceEdgePressure(state,400,[{x:10025},{x:10935}],10000);
 assert.deepEqual(takeEdgePressure(state),[{x:10028,y:65,angle:Math.PI/2,edgePressure:true},{x:10932,y:65,angle:Math.PI/2,edgePressure:true}]);
 assert.deepEqual(takeEdgePressure(state),[]);
});
test('leaving the edge clears dwell and does not punish a brief visit',()=>{
 const state={};
 advanceEdgePressure(state,1300,[{x:30}],0);
 advanceEdgePressure(state,100,[{x:480}],0);
 advanceEdgePressure(state,200,[{x:30}],0);
 assert.deepEqual(takeEdgePressure(state),[]);
});
