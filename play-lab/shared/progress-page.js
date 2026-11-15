import {decodeProgress,encodeProgress} from './progress-code.js';
import {readPortableProgress,writePortableProgress} from './save.js';
const field=document.querySelector('#code');
const status=document.querySelector('#result');
document.querySelector('#export').addEventListener('click',()=>{
 try{field.value=encodeProgress(readPortableProgress());field.focus();field.select();status.textContent='Copy this code to keep your progress.';}
 catch{status.textContent='Progress is unavailable in this browser.';}
});
document.querySelector('#import').addEventListener('click',()=>{
 const values=decodeProgress(field.value.trim());
 if(!values){status.textContent='That code could not be read. Your progress is unchanged.';return;}
 try{writePortableProgress(values);status.textContent='Progress imported. Return to Play Lab to play.';}
 catch{status.textContent='This browser could not save the code.';}
});
