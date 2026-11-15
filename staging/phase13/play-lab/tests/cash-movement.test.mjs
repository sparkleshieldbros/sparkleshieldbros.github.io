import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runVelocity,tuning} from '../shared/cash/movement.js';

test('acceleration and braking depend on elapsed time',()=>{
 const run=(step,count)=>Array.from({length:count}).reduce(v=>runVelocity(v,1,step),0);
 assert.equal(run(10,10),run(20,5));
 assert.equal(runVelocity(tuning.run,0,1000),0);
 assert.equal(runVelocity(tuning.run,1,100),tuning.run);
});
