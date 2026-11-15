export function createProgressStore(kind, chapterCount) {
 const key='sparkle-play-lab:'+kind;
 const read=()=>{
  try{return Math.min(chapterCount,Math.max(0,parseInt(localStorage.getItem(key),10)||0));}
  catch{return 0;}
 };
 return {
  read,
  save(count){try{localStorage.setItem(key,String(Math.max(read(),count)));}catch{}},
  reset(){try{localStorage.removeItem(key);}catch{}}
 };
}

const portableKeys=['bubble','cash','ninja','echo','cash-stars','cash:tier','echo:tier'];
const tierValues=['practice','adventurer','challenge'];
export function readPortableProgress(){
 return portableKeys.map((key,index)=>{
  const value=localStorage.getItem('sparkle-play-lab:'+key);
  if(index===5)return Math.max(0,tierValues.indexOf(value));
  if(index===6)return value==='challenge'?1:0;
  return Math.min([4,3,3,3,7][index],Math.max(0,parseInt(value,10)||0));
 });
}
export function writePortableProgress(values){
 const keys=portableKeys.map(key=>'sparkle-play-lab:'+key);
 const prior=keys.map(key=>localStorage.getItem(key));
 let written=0;
 try{
  keys.forEach((key,index)=>{
   const value=index===5?tierValues[values[index]]:index===6?(values[index]?'challenge':'practice'):String(values[index]);
   localStorage.setItem(key,value);
   written++;
  });
 }catch(error){
  for(let i=0;i<written;i++){
   if(prior[i]===null)localStorage.removeItem(keys[i]);
   else localStorage.setItem(keys[i],prior[i]);
  }
  throw error;
 }
}
