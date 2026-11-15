const limits=[4,3,3,3,7,2,1];
function checksum(text){
 let hash=2166136261;
 for(const char of text)hash=Math.imul(hash^char.charCodeAt(0),16777619);
 return (hash>>>0).toString(16).padStart(8,'0');
}
export function encodeProgress(values){
 if(!Array.isArray(values)||values.length!==limits.length||
  !limits.every((max,i)=>Number.isInteger(values[i])&&values[i]>=0&&values[i]<=max))throw new Error('Invalid progress');
 const payload='SSB1-'+values.join('');
 return payload+'-'+checksum(payload);
}
export function decodeProgress(code){
 if(typeof code!=='string'||code.length!==21||!/^SSB1-[0-9]{7}-[0-9a-f]{8}$/.test(code))return null;
 const values=Array.from(code.slice(5,12),Number);
 try{return encodeProgress(values)===code?values:null;}catch{return null;}
}
