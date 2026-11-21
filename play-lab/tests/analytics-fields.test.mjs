import test from 'node:test';
import assert from 'node:assert/strict';
import {eventFields,campaignFields} from '../shared/cash/analytics-fields.js';
test('only bounded gameplay values are transmitted',()=>{
 assert.deepEqual(eventFields({email:'child@example.com',hero:'cash',score:999999,mode:'unknown',duration_seconds:Infinity}),{hero:'cash',score:32800});
});
test('campaign attribution excludes arbitrary text and identifiers',()=>{
 assert.deepEqual(campaignFields('?utm_source=facebook&utm_medium=organic_social&utm_campaign=coin_dash_high_score_v1&email=secret&utm_content=child-name'),{campaign_source:'facebook',campaign_medium:'organic_social',campaign_name:'coin_dash_high_score_v1'});
 assert.deepEqual(campaignFields('?utm_source=child@example.com'),{});
});
