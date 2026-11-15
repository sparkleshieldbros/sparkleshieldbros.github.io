import {test} from 'node:test';
import assert from 'node:assert/strict';
import {movementIntent} from '../shared/cash/input.js';

test('keyboard and touch yield the same movement and fire intent', () => {
 assert.deepEqual(movementIntent({right:true,jump:true,power:true},{}),
  movementIntent({}, {D:{isDown:true},SPACE:{isDown:true},J:{isDown:true}}));
});
test('opposing directions cancel without dropping jump', () => {
 assert.equal(movementIntent({left:true,right:true},{}).direction,0);
 assert.equal(movementIntent({}, {UP:{isDown:true}}).jump,true);
});
