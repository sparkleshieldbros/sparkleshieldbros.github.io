import {bossIdentity} from './boss-identity.js';

export const COIN_DASH_URL = 'https://sparkleshieldbros.github.io/play-lab/games/coin-dash/';

function loadImage(url) {
 return new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Score artwork could not be loaded.'));
  image.src = url;
 });
}

function fitText(context, text, x, y, maxWidth, size, color, align = 'left') {
 context.textAlign = align;
 context.fillStyle = color;
 context.font = '800 ' + size + 'px system-ui, sans-serif';
 while (context.measureText(text).width > maxWidth && size > 18) {
  size -= 1;
  context.font = '800 ' + size + 'px system-ui, sans-serif';
 }
 context.fillText(text, x, y);
}

function cover(context, image, x, y, width, height) {
 const scale = Math.max(width / image.width, height / image.height);
 const sourceWidth = width / scale;
 const sourceHeight = height / scale;
 context.drawImage(image, (image.width - sourceWidth) / 2, (image.height - sourceHeight) / 2,
  sourceWidth, sourceHeight, x, y, width, height);
}

function portrait(context, image, x, y, accent) {
 context.save();
 context.beginPath();
 context.arc(x, y, 122, 0, Math.PI * 2);
 context.clip();
 cover(context, image, x - 122, y - 122, 244, 244);
 context.restore();
 context.strokeStyle = accent;
 context.lineWidth = 7;
 context.beginPath();
 context.arc(x, y, 126, 0, Math.PI * 2);
 context.stroke();
}

/** Render original game artwork into a local, square PNG for social sharing. */
export async function createScoreCard({
 chapter = 0, chapterName = '', score = 0, rank = '', difficulty = '', mode = '',
 heroPortrait, heroName = 'Sparkle Shield hero', ranked = true,
} = {}) {
 const asset = name => new URL('../../assets/runtime/' + name, import.meta.url).href;
 const [hero, ogre, scenery, qr] = await Promise.all([
  loadImage(heroPortrait || asset('captain-cash-profile.jpg')),
  loadImage(asset('echo-ogre-profile.jpg')),
  loadImage(asset('maplewood-scenery-3.jpg')),
  loadImage(asset('coin-dash-play-qr.svg')),
 ]);
 await document.fonts?.ready;
 const canvas = document.createElement('canvas');
 canvas.width = canvas.height = 1080;
 const context = canvas.getContext('2d');
 if (!context) throw new Error('Score images are unavailable in this browser.');
 const identity = bossIdentity(chapter);
 const accent = '#' + identity.accent.toString(16).padStart(6, '0');

 cover(context, scenery, 0, 0, 1080, 1080);
 const shade = context.createLinearGradient(0, 0, 0, 1080);
 shade.addColorStop(0, 'rgba(16,20,44,.93)');
 shade.addColorStop(.5, 'rgba(28,20,47,.87)');
 shade.addColorStop(1, 'rgba(10,17,35,.98)');
 context.fillStyle = shade;
 context.fillRect(0, 0, 1080, 1080);
 context.strokeStyle = accent;
 context.lineWidth = 3;
 context.strokeRect(28, 28, 1024, 1024);

 fitText(context, 'SPARKLE SHIELD BROS', 64, 91, 952, 34, accent);
 fitText(context, 'COIN DASH', 64, 171, 952, 67, '#fff0d1');
 fitText(context, 'Chapter ' + (chapter + 1) + ' · ' + chapterName,
  64, 224, 952, 30, '#e5eaf5');

 portrait(context, hero, 194, 411, accent);
 portrait(context, ogre, 886, 411, accent);
 fitText(context, heroName, 194, 579, 290, 26, '#e4f9ef', 'center');
 fitText(context, identity.name, 886, 579, 290, 26, accent, 'center');
 fitText(context, 'CHAPTER SCORE', 540, 326, 340, 23, '#d8e0f0', 'center');
 const formattedScore = Math.max(0, Math.round(Number(score) || 0)).toLocaleString();
 fitText(context, formattedScore, 540, 451, 330, 102, '#ffe391', 'center');
 fitText(context, 'GRADE ' + rank, 540, 509, 300, 30, '#b1ffea', 'center');
 fitText(context, [difficulty, mode].filter(Boolean).join(' · '),
  540, 657, 920, 31, '#e4e9f6', 'center');
 if (!ranked) {
  fitText(context, 'CHECKPOINT PRACTICE', 540, 698, 920, 23, accent, 'center');
 }
 fitText(context, 'Can you beat my score?', 64, 783, 930, 45, '#fff0d1');
 fitText(context, 'PLAY FREE', 64, 864, 660, 25, accent);
 fitText(context, 'SparkleShieldBros.github.io', 64, 912, 710, 34, '#fff0d1');
 fitText(context, 'Scan to play', 896, 1014, 240, 22, '#fff0d1', 'center');

 // White quiet zone is retained when the image is resized by social platforms.
 context.fillStyle = '#ffffff';
 context.fillRect(790, 789, 212, 212);
 context.imageSmoothingEnabled = false;
 context.drawImage(qr, 806, 805, 180, 180);
 context.imageSmoothingEnabled = true;

 const blob = await new Promise((resolve, reject) => canvas.toBlob(value => {
  if (value) resolve(value);
  else reject(new Error('The score image could not be created.'));
 }, 'image/png'));
 return {blob, filename:'coin-dash-chapter-' + (chapter + 1) + '-' + Math.max(0, Math.round(Number(score) || 0)) + '.png'};
}
