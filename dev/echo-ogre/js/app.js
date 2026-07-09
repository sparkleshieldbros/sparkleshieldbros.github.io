const state = {
  calm: 0,
  kindness: 0,
  courage: 0,
  repair: 0,
  impulse: 0,
  awareness: 0,
  currentPath: null,
  pathHistory: [],
  endingsUnlocked: []
};

let lastStoryScene = 'start-screen';
const storyScenes = new Set([
  'start-screen', 'opening',
  'scene-rush-consequence', 'scene-rush-realization',
  'scene-pause-consequence', 'scene-pause-realization',
  'scene-dad-consequence', 'scene-dad-realization',
  'ending-fast-hands', 'ending-bubble-pause', 'ending-sparkle-shield'
]);

/* ============================================================
   AI-SAFE CONTENT SECTION START — character data lives here.
   ============================================================ */
const characters = {
  kairo: {
    name: "Bubble Boy Kairo",
    eyebrow: "Hero File \u00b7 The Observer",
    image: "bubble-boy.webp",
    fallbackIcon: iconKairo,
    power: "Bubble Shields, Bubble Bridges, Bubble Creativity",
    want: "To protect the people he loves",
    fear: "Making the wrong choice when someone needs him",
    lesson: "Thinking first can be brave",
    phrase: "\u201cBubble up!\u201d"
  },
  cash: {
    name: "Captain Cash",
    eyebrow: "Hero File \u00b7 The Rescuer",
    image: "captain-cash.webp",
    fallbackIcon: iconCash,
    power: "Golden rescue energy, quick thinking, teamwork, repair",
    want: "To help quickly and prove he is brave",
    fear: "Being too little or too late",
    lesson: "Power works best when it slows down enough to choose wisely",
    phrase: "\u201cCaptain Cash is on the case!\u201d"
  },
  nugs: {
    /* PLACEHOLDER LORE -- Ninja Nugs now appears in the scene art, so a
       card and profile are wired up here to match. Swap in real
       power/want/fear/lesson/phrase whenever you have them. */
    name: "Ninja Nugs",
    eyebrow: "Hero File \u00b7 The Sidekick",
    image: "ninja-nugs.webp",
    fallbackIcon: iconNugs,
    power: "Quick reflexes and a knack for sneaking in at just the right moment",
    want: "To back up the team and never miss the action",
    fear: "Being left behind",
    lesson: "Small and quick can still make a big difference",
    phrase: "\u201cNugs is on it!\u201d"
  },
  dad: {
    name: "Dad",
    eyebrow: "Hero File \u00b7 The Model",
    image: "dad.webp",
    fallbackIcon: iconDad,
    power: "Calm, accountability, apology, and repair",
    want: "To help his children become kind and strong",
    fear: "Teaching the wrong lesson through his own actions",
    lesson: "A real hero can say, \u201cI was wrong. Let me try again.\u201d",
    phrase: "\u201cLet me try that again.\u201d"
  },
  mom: {
    name: "Mom",
    eyebrow: "Hero File \u00b7 The Noticer",
    image: "mom.webp",
    fallbackIcon: iconMom,
    power: "Super intuition and pattern recognition",
    want: "To help her family notice what matters",
    fear: "Missing a pattern that could protect someone",
    lesson: "A calm mind can notice what a worried mind misses",
    phrase: "\u201cLook for the pattern.\u201d"
  },
  ogre: {
    name: "Echo Ogre",
    eyebrow: "Hero File \u00b7 The Mystery",
    image: "echo-ogre.webp",
    fallbackIcon: iconOgre,
    power: "Echoes actions and feelings ten times bigger",
    want: "To feel every strong feeling around him",
    fear: "Being ignored or misunderstood",
    lesson: "The world echoes what we practice",
    phrase: "\u201cI become what I see.\u201d"
  }
};
/* ============================================================
   AI-SAFE CONTENT SECTION END
   ============================================================ */

function heroIconMarkup(c){
  return '<img src="images/' + c.image + '" alt="' + c.name + '" loading="lazy" class="icon-img" ' +
    'onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">' +
    '<span class="icon-fallback">' + c.fallbackIcon() + '</span>';
}

function iconKairo(){
  return '<svg viewBox="0 0 88 88"><circle cx="44" cy="44" r="42" fill="#1b4167"/><circle cx="44" cy="38" r="16" fill="#fff6df"/><rect x="24" y="54" width="40" height="22" rx="8" fill="#2f8f83"/></svg>';
}
function iconCash(){
  return '<svg viewBox="0 0 88 88"><circle cx="44" cy="44" r="42" fill="#5d2a86"/><circle cx="44" cy="38" r="16" fill="#f3c568"/><rect x="24" y="54" width="40" height="22" rx="8" fill="#c9647a"/></svg>';
}
function iconDad(){
  return '<svg viewBox="0 0 88 88"><circle cx="44" cy="44" r="42" fill="#1b2e5a"/><circle cx="44" cy="36" r="17" fill="#d79a23"/><rect x="22" y="54" width="44" height="24" rx="8" fill="#160c25"/></svg>';
}
function iconMom(){
  return '<svg viewBox="0 0 88 88"><circle cx="44" cy="44" r="42" fill="#1b2e5a"/><circle cx="44" cy="36" r="17" fill="#f3c568"/><rect x="22" y="54" width="44" height="24" rx="8" fill="#c9647a"/></svg>';
}
function iconOgre(){
  return '<svg viewBox="0 0 88 88"><circle cx="44" cy="44" r="42" fill="#160c25"/><circle cx="44" cy="44" r="26" fill="#5d2a86"/><circle cx="44" cy="44" r="12" fill="#8d5cc2"/><circle cx="38" cy="40" r="3" fill="#fff6df"/><circle cx="50" cy="40" r="3" fill="#fff6df"/></svg>';
}
function iconNugs(){
  return '<svg viewBox="0 0 88 88"><circle cx="44" cy="44" r="42" fill="#1b4167"/><circle cx="44" cy="40" r="16" fill="#f3c568"/><rect x="26" y="56" width="36" height="20" rx="8" fill="#160c25"/></svg>';
}

function showScene(id){
  document.querySelectorAll('section.screen').forEach(function(s){ s.classList.remove('active'); });
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add('active');
  if (storyScenes.has(id)) lastStoryScene = id;

  const meterEl = document.getElementById('sparkle-meter');
  meterEl.style.display = storyScenes.has(id) && id !== 'start-screen' ? 'grid' : 'none';

  if (id.startsWith('ending-')) unlockEnding(id);

  announceScene(target);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function announceScene(target){
  const heading = target.querySelector('h1, h2');
  const announcer = document.getElementById('sr-announcer');
  if (heading && announcer) announcer.textContent = 'Now showing: ' + heading.textContent;
}

function choosePath(path){
  state.currentPath = path;
  state.pathHistory.push(path);

  if (path === 'rush'){
    state.impulse += 1;
    state.courage += 1;
    showScene('scene-rush-consequence');
  } else if (path === 'pause'){
    state.calm += 1;
    state.awareness += 1;
    state.kindness += 1;
    showScene('scene-pause-consequence');
  } else if (path === 'dad'){
    state.repair += 1;
    state.calm += 1;
    state.kindness += 1;
    showScene('scene-dad-consequence');
  }
  updateMeter();
}

function playAgain(){ showScene('opening'); }

function returnToAdventure(){ showScene(lastStoryScene || 'start-screen'); }

function updateMeter(){
  const max = 5;
  setBar('meter-calm', state.calm, max);
  setBar('meter-kindness', state.kindness, max);
  setBar('meter-courage', state.courage, max);
  setBar('meter-repair', state.repair, max);
}
function setBar(elId, value, max){
  const pct = Math.min(100, Math.round((value / max) * 100));
  document.getElementById(elId).style.width = pct + '%';
}

const badgeLabels = {
  'ending-fast-hands': 'Fast Hands',
  'ending-bubble-pause': 'Bubble Pause',
  'ending-sparkle-shield': 'Sparkle Shield'
};

function unlockEnding(endingId){
  const alreadyUnlocked = state.endingsUnlocked.includes(endingId);
  if (!alreadyUnlocked){
    state.endingsUnlocked.push(endingId);
    if (endingId === 'ending-sparkle-shield'){
      state.kindness += 1;
      state.repair += 1;
      updateMeter();
    }
    saveProgress();
  }
  updateUnlockBanner(endingId, alreadyUnlocked);
  renderBadges();
}

function updateUnlockBanner(endingId, wasAlreadyUnlocked){
  const bannerIdMap = {
    'ending-fast-hands': 'unlock-banner-fast',
    'ending-bubble-pause': 'unlock-banner-bubble',
    'ending-sparkle-shield': 'unlock-banner-sparkle'
  };
  const banner = document.getElementById(bannerIdMap[endingId]);
  if (!banner) return;
  banner.textContent = wasAlreadyUnlocked
    ? 'Welcome back to the ' + badgeLabels[endingId] + ' ending!'
    : '\u2728 New ending unlocked: ' + badgeLabels[endingId] + '!';
}

function saveProgress(){
  try{
    localStorage.setItem('sparkleEndingsUnlocked', JSON.stringify(state.endingsUnlocked));
    localStorage.setItem('sparkleMeterState', JSON.stringify({
      calm: state.calm, kindness: state.kindness, courage: state.courage, repair: state.repair
    }));
  }catch(e){ }
}

function loadProgress(){
  try{
    const endings = localStorage.getItem('sparkleEndingsUnlocked');
    const meter = localStorage.getItem('sparkleMeterState');
    if (endings) state.endingsUnlocked = JSON.parse(endings);
    if (meter){
      const m = JSON.parse(meter);
      state.calm = m.calm || 0;
      state.kindness = m.kindness || 0;
      state.courage = m.courage || 0;
      state.repair = m.repair || 0;
    }
  }catch(e){ }
}

function resetProgress(){
  const confirmed = window.confirm('This will erase saved endings and Sparkle Meter progress on this device. Continue?');
  if (!confirmed) return;

  state.calm = 0; state.kindness = 0; state.courage = 0; state.repair = 0;
  state.impulse = 0; state.awareness = 0;
  state.currentPath = null; state.pathHistory = [];
  state.endingsUnlocked = [];

  try{
    localStorage.removeItem('sparkleEndingsUnlocked');
    localStorage.removeItem('sparkleMeterState');
  }catch(e){ }

  updateMeter();
  renderBadges();
  showToast('Progress reset. Ready for a fresh adventure!');
  showScene('start-screen');
}

function renderBadges(){
  const targets = {
    'badge-row-fast': document.getElementById('badge-row-fast'),
    'badge-row-bubble': document.getElementById('badge-row-bubble'),
    'badge-row-sparkle': document.getElementById('badge-row-sparkle')
  };
  Object.values(targets).forEach(function(row){
    if (!row) return;
    row.innerHTML = '';
    Object.keys(badgeLabels).forEach(function(key){
      const unlocked = state.endingsUnlocked.includes(key);
      const pill = document.createElement('span');
      pill.className = 'badge-pill' + (unlocked ? '' : ' locked');
      pill.textContent = (unlocked ? '\u2728 ' : '\ud83d\udd12 ') + badgeLabels[key];
      row.appendChild(pill);
    });
  });
}

let toastTimer = null;
function showToast(message){
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 2800);
}

function shareEnding(endingName){
  const message = 'I just unlocked the "' + endingName + '" ending in Sparkle Shield Bros: The Echo Ogre Choice Path! \u2728';
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(message)
      .then(function(){ showToast('Copied! Paste it anywhere to share your ending.'); })
      .catch(function(){ showToast(message); });
  } else {
    showToast(message);
  }
}

function openCharacterHub(){
  buildCharacterGrid();
  showScene('characters');
}

function buildCharacterGrid(){
  const grid = document.getElementById('character-hub-grid');
  grid.innerHTML = '';
  const order = ['kairo', 'cash', 'nugs', 'dad', 'mom', 'ogre'];
  order.forEach(function(key){
    const c = characters[key];
    const card = document.createElement('button');
    card.className = 'char-card';
    card.setAttribute('type', 'button');
    card.innerHTML =
      '<div class="icon">' + heroIconMarkup(c) + '</div>' +
      '<h3>' + c.name + '</h3>' +
      '<p>' + c.lesson + '</p>';
    card.addEventListener('click', function(){ showProfile(key); });
    grid.appendChild(card);
  });
}

function showProfile(characterId){
  const c = characters[characterId];
  if (!c) return;
  document.getElementById('profile-icon').innerHTML = heroIconMarkup(c);
  document.getElementById('profile-eyebrow').textContent = c.eyebrow;
  document.getElementById('profile-name').textContent = c.name;
  document.getElementById('profile-phrase').textContent = c.phrase;
  document.getElementById('profile-stats').innerHTML =
    '<li><span class="stat-label">Power:</span>' + c.power + '</li>' +
    '<li><span class="stat-label">Want:</span>' + c.want + '</li>' +
    '<li><span class="stat-label">Fear:</span>' + c.fear + '</li>' +
    '<li><span class="stat-label">Lesson:</span>' + c.lesson + '</li>';
  showScene('profile');
}

function openParentGuide(){ showScene('parent-guide'); }

loadProgress();
updateMeter();
renderBadges();
document.getElementById('sparkle-meter').style.display = 'none';
