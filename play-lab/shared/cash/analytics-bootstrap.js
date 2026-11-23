// Load measurement independently from Phaser and the gameplay module graph.
import {installAnalytics} from './analytics.js';
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',installAnalytics,{once:true});
}else installAnalytics();
