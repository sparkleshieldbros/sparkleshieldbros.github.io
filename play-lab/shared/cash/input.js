export function movementIntent(held, keys, coop=false) {
 const down = (control, ...codes) =>
  !!held[control] || codes.some(code => !!keys[code]?.isDown);
 const left = down('left', ...(coop?['LEFT']:['A','LEFT']));
 const right = down('right', ...(coop?['RIGHT']:['D','RIGHT']));
 const up = down('up', ...(coop?['UP']:['W','UP']));
 const downwards = down('down', ...(coop?['DOWN']:['S','DOWN']));
 return { direction: Number(right) - Number(left), up, down: downwards,
  jump: down('jump', ...(coop?[]:['SPACE'])) || up, fire: down('power', coop?'ENTER':'J') };
}
