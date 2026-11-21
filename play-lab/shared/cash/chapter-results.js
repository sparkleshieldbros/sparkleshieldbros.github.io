import {track} from './analytics.js';
import {createScoreCard,COIN_DASH_URL} from './score-card.js';

const congratulations = Object.freeze([
 'Maplewood is cheering for you!',
 'You brought the sparkle back to the garden!',
 'You cooled the Echo Furnace!',
 'The factory is humming in harmony!',
 'You made the stars shine brighter!',
 'The trellis trails are safe again!',
 'Your courage lit up the murals!',
 'You outshone the storm!',
 'The whole courtyard is celebrating!',
 'Welcome home, Maplewood heroes!',
]);

function element(tag, className, text) {
 const node = document.createElement(tag);
 if (className) node.className = className;
 if (text !== undefined) node.textContent = String(text);
 return node;
}

function points(value) {
 return Math.max(0, Math.round(Number(value) || 0)).toLocaleString();
}

/** Present one completed chapter. Scores and persistence belong to the caller. */
export function showChapterResults({
 chapter = 0, chapterName = '', score = 0, breakdown = [], rank = '', best = 0,
 leaderboard = [], newBest = false, ranked = true, saved = true, difficulty = '', mode = '',
 portrait, heroName, accent = '#f2ce83', onContinue = () => {}, onReplay = () => {},
 parent = document.fullscreenElement || document.body,
} = {}) {
 if (!document.querySelector('link[data-cash-results-style]')) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('./chapter-results.css', import.meta.url).href;
  style.dataset.cashResultsStyle = '';
  document.head.append(style);
 }
 const previousFocus = document.activeElement;
 let closed = false;
 let imageUrl;
 let scoreFile;
 const dialog = element('dialog', 'cash-chapter-results');
 const titleId = 'cash-results-title';
 dialog.setAttribute('aria-labelledby', titleId);
 dialog.style.setProperty('--results-accent',accent);
 const content = element('section', 'cash-results-content');
 const header = element('header', 'cash-results-heading');
 header.append(element('p', 'cash-results-chapter', chapterName || 'Chapter ' + (chapter + 1)));
 const title = element('h2', '', congratulations[chapter] || 'You did it, Sparkle Shield heroes!');
 title.id = titleId;
 header.append(title);
 if (portrait) {
  const image = element('img', 'cash-results-portrait');
  image.src = portrait;
  image.alt = '';
  header.prepend(image);
 }
 content.append(header);
 const scoreCard = element('div', 'cash-results-score');
 scoreCard.append(element('span', '', 'Chapter score'), element('strong', '', points(score)));
 if (rank) scoreCard.append(element('span', 'cash-results-rank', rank));
 content.append(scoreCard);
 const context = [difficulty, mode].filter(Boolean).join(' · ');
 if (context) content.append(element('p', 'cash-results-context', context));
 if (breakdown.length) {
  const tally = element('dl', 'cash-results-tally');
  for (const item of breakdown) {
   const row = element('div');
   const amount = Math.round(Number(item.points) || 0);
   row.append(element('dt', '', item.label), element('dd', '', (amount < 0 ? '−' : '+') + points(Math.abs(amount))));
   tally.append(row);
  }
  content.append(tally);
 }
 if (ranked) {
  content.append(element('p', 'cash-results-best', saved
   ? (newBest ? 'New personal best!' : 'Personal best · ' + points(best))
   : 'This score could not be saved on this device. You can still share it.'));
  if (leaderboard.length) {
   const board = element('details', 'cash-results-board');
   board.append(element('summary', '', 'Your top scores on this device'));
   const list = element('ol');
   for (const entry of leaderboard.slice(0, 5)) {
    const row = element('li');
    row.append(element('strong', '', points(entry.score)));
    if (entry.rank) row.append(element('span', '', entry.rank));
    list.append(row);
   }
   board.append(list);
   content.append(board);
  }
 } else {
  content.append(element('p', 'cash-results-context', 'Practice clear · Start the chapter fresh to set a high score.'));
 }
 const actions = element('div', 'cash-results-actions');
 const next = element('button', 'cash-results-next', chapter === 9 ? 'Celebrate!' : 'Next chapter');
 next.type = 'button';
 next.autofocus = true;
 const replay = element('button', '', 'Replay chapter');
 replay.type = 'button';
 const share = element('button', 'cash-results-share', 'Share score');
 share.type = 'button';
 share.disabled = true;
 const save = element('a', 'cash-results-save', 'Save image');
 save.hidden = true;
 save.addEventListener('click',()=>track('score_image_saved',{chapter:chapter+1,score}));
 save.target = '_blank';
 save.rel = 'noopener';
 actions.append(next, replay, share, save);
 content.append(actions);
 const feedback = element('p', 'cash-results-share-status');
 feedback.setAttribute('role', 'status');
 content.append(feedback);
 const cardPreview = element('details', 'cash-results-image-preview');
 cardPreview.hidden = true;
 cardPreview.append(element('summary', '', 'Preview score image'));
 const previewImage = element('img');
 previewImage.alt = 'Shareable Coin Dash score card with hero artwork, chapter score and QR code to play';
 cardPreview.append(previewImage);
 const copyCaption = element('button', '', 'Copy challenge text');
 copyCaption.type = 'button';
 cardPreview.append(copyCaption);
 content.append(cardPreview);
 const shareText = 'I scored ' + points(score) + ' in ' +
  (chapterName || 'Coin Dash Chapter ' + (chapter + 1)) +
  (context ? ' (' + context + ')' : '') +
  (ranked ? '' : ' — checkpoint practice') + '. Can you beat my score?';
 const caption = shareText + '\n' + COIN_DASH_URL;
 let copyField;

 copyCaption.addEventListener('click', async () => {
  try {
   await navigator.clipboard.writeText(caption);
   if (!closed) feedback.textContent = 'Challenge copied. Paste it with your score image.';
  } catch {
   if (closed) return;
   if (!copyField) {
    copyField = element('textarea', 'cash-results-copy');
    copyField.readOnly = true;
    copyField.setAttribute('aria-label', 'Your score challenge to copy');
    cardPreview.append(copyField);
   }
   copyField.value = caption;
   copyField.focus();
   copyField.select();
   feedback.textContent = 'Copy this text to post with your image.';
  }
 });

 async function prepareImage() {
  share.disabled = true;
  feedback.textContent = 'Preparing score image…';
  try {
   const card = await createScoreCard({
    chapter, chapterName, score, rank, difficulty, mode,
    heroPortrait:portrait, heroName, ranked,
   });
   if (closed) return;
   imageUrl = URL.createObjectURL(card.blob);
   if (typeof File !== 'undefined') {
    scoreFile = new File([card.blob], card.filename, {type:'image/png'});
   }
   previewImage.src = imageUrl;
   save.href = imageUrl;
   save.download = card.filename;
   save.hidden = false;
   cardPreview.hidden = false;
   feedback.textContent = '';
  } catch {
   if (closed) return;
   feedback.textContent = 'Artwork could not load. Tap Share score to try again.';
  } finally {
   if (!closed) share.disabled = false;
  }
 }

 share.addEventListener('click', async () => {
  track('share_clicked',{chapter:chapter+1,score});
  if (!imageUrl) {
   await prepareImage();
   return;
  }
  try {
   if (scoreFile && navigator.share && navigator.canShare?.({files:[scoreFile]})) {
    // The file is already prepared, preserving the tap required by Safari.
    await navigator.share({
     files:[scoreFile], title:'Sparkle Shield Bros · Coin Dash',
     text:shareText, url:COIN_DASH_URL,
    });
    track('share_completed',{chapter:chapter+1,score});
    if (!closed) feedback.textContent = 'Score image shared!';
    return;
   }
  } catch (error) {
   if (closed || error.name === 'AbortError') return;
  }
  cardPreview.open = true;
  feedback.textContent = 'Save the image, then add it to your post. Copy challenge text to include the game link.';
  save.focus();
 });
 function close() {
  if (closed) return;
  closed = true;
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  if (dialog.open) dialog.close();
  dialog.remove();
  if (previousFocus?.isConnected) previousFocus.focus();
 }
 function choose(callback) {
  close();
  callback();
 }
 next.addEventListener('click', () => choose(onContinue));
 replay.addEventListener('click', () => choose(onReplay));
 dialog.addEventListener('cancel', event => {
  event.preventDefault();
  choose(onContinue);
 });
 dialog.append(content);
 parent.append(dialog);
 dialog.showModal();
 next.focus();
 prepareImage();
 return { close };
}
