// Milliseconds for windup, release hold, and recovery, plus the shot origin.
const motions={
 cash:[40,48,68,26,25],
 kairo:[58,52,76,28,-7],
 ninja:[35,44,58,25,-8],
 mom:[48,47,74,28,-10],
 dad:[64,54,88,32,-6]
};

export function attackMotion(hero){
 const [windup,hold,recovery,x,y]=motions[hero];
 return {windup,hold,recovery,x,y};
}

export function attackFrame(elapsed,motion){
 if(elapsed<motion.windup)return 0;
 if(elapsed<motion.windup+motion.hold)return 1;
 return 2;
}
