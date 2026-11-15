import {readPortableProgress} from './save.js';
let progress;
try{progress=readPortableProgress();}catch{progress=[0,0,0,0,0];}
const count=[1,2,4].filter(bit=>progress[4]&bit).length;
for(const sticker of document.querySelectorAll('[data-stars]')){
 const unlocked=count>=Number(sticker.dataset.stars);
 sticker.querySelector('span').textContent=unlocked?'Collected':'Find '+sticker.dataset.stars+' Coin Dash stars';
}
