import {tone} from '../audio.js';

const cues={
 defeat:[[294,.49,.035,'triangle'],[196,.57,.035,'sine']],
 victory:[[523,.27,.03,'triangle'],[659,.34,.023,'sine'],[784,.48,.028,'triangle'],[1047,.6,.018,'sine']],
 coin:[[880,.08,.035,'triangle'],[1320,.11,.017,'sine']],
 charge:[[440,.18,.045,'triangle'],[880,.2,.023,'sine']],
 impact:[[330,.12,.038,'triangle'],[660,.1,.022,'sine']],
 land:[[125,.065,.025,'triangle']],
 dash:[[205,.16,.037,'triangle'],[410,.12,.014,'sine']]
};
export function cashCue(scene,name){
 if(name==='victory'||name==='defeat'){
  for(const [index,voice] of cues[name].entries()){
   scene.time.delayedCall(index*115,()=>tone(scene,...voice));
  }
 }else for(const voice of cues[name]||[])tone(scene,...voice);
}
