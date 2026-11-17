import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {expansion} from '../shared/cash/expansion.js';
import {chapterNames,levels} from '../shared/levels.js';

test('all campaign chapters have maps and a newly introduced scout',()=>{
 assert.equal(chapterNames.cash.length,10);
 assert.equal(levels.cash.length,10);
 const expected=['scout','rift-wing','kiln-runner','forge-scout','prism-scout',...expansion.map(chapter=>chapter.scout)];
 const introduced=new Set();
 for(const [index,scout] of expected.entries()){
  const name=index?'cash-chapter-'+index:'cash-showcase';
  const map=JSON.parse(readFileSync(new URL('../assets/levels/'+name+'.json',import.meta.url),'utf8'));
  const markers=map.layers.find(layer=>layer.name==='Markers').objects;
  const scouts=markers.filter(marker=>marker.name==='scout').map(marker=>marker.type||'scout');
  assert.ok(scouts.includes(scout),name);
  assert.ok(!introduced.has(scout),scout);
  scouts.forEach(type=>introduced.add(type));
 }
});

test('the offline cache includes the expansion maps, scenery and scout art',()=>{
 const manifest=readFileSync(new URL('../offline-files.js',import.meta.url),'utf8');
 const paths=new Set(JSON.parse(/^self\.OFFLINE_FILES=(.*);$/m.exec(manifest)[1]));
 for(const [index,chapter] of expansion.entries()){
  assert.ok(paths.has('assets/levels/cash-chapter-'+(index+5)+'.json'));
  assert.ok(paths.has('assets/runtime/'+chapter.scout+'.svg'));
  for(const page of chapter.pages)assert.ok(paths.has('assets/runtime/maplewood-scenery-'+page+'.jpg'));
 }
 assert.ok(paths.has('books.html'));
});
