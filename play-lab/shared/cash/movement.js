export const tuning = Object.freeze({
 run:320, acceleration:2500, braking:4200, dashSpeed:620,
 dashMs:240, recoveryMs:150, dashCost:30, jumpSpeed:460,
 jumpCut:190, coyoteMs:110, bufferMs:130
});
export function runVelocity(current, direction, dt) {
 const target=direction*tuning.run;
 const step=(direction?tuning.acceleration:tuning.braking)*dt/1000;
 return current+Math.sign(target-current)*Math.min(Math.abs(target-current),step);
}
