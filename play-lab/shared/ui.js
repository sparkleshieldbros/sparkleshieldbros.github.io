/** Bind controls shared by each Phaser game. */
export function bindGameUI({pause, resume, restart, resetProgress, getDashCharge}) {
 const byId = id => document.getElementById(id);
 const dialog = byId('pause-panel');
 const pauseButton = byId('pause-game');
 const help = byId('help');
 const helpPanel = byId('help-panel');
 const reset = byId('reset-progress');
 const resetPanel = byId('reset-panel');
 const arena = document.querySelector('.arcade-frame');
 const fullscreen = byId('fullscreen');
 const status = byId('display-status');

 function disclosure(button, panel, open) {
  panel.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
 }
 pauseButton.addEventListener('click', () => {
  if (dialog.open) return;
  dialog.showModal();
  pause();
 });
 byId('resume-game').addEventListener('click', () => dialog.close());
 dialog.addEventListener('close', () => {
  disclosure(help, helpPanel, false);
  disclosure(reset, resetPanel, false);
  resume();
  pauseButton.focus();
 });
 byId('restart').addEventListener('click', () => {
  restart();
  dialog.close();
 });
 help.addEventListener('click', () => disclosure(help, helpPanel, helpPanel.hidden));
 reset.addEventListener('click', () => {
  disclosure(reset, resetPanel, resetPanel.hidden);
  if (!resetPanel.hidden) byId('cancel-reset').focus();
 });
 byId('cancel-reset').addEventListener('click', () => {
  disclosure(reset, resetPanel, false);
  reset.focus();
 });
 byId('confirm-reset').addEventListener('click', () => {
  resetProgress();
  dialog.close();
 });
 if (!arena.requestFullscreen || !document.fullscreenEnabled) {
  const setExpanded = expanded => {
   arena.classList.toggle('arena-expanded', expanded);
   document.body.classList.toggle('arena-fullscreen', expanded);
   fullscreen.textContent = expanded ? 'Exit fullscreen' : 'Fullscreen';
   fullscreen.setAttribute('aria-pressed', String(expanded));
  };
  fullscreen.addEventListener('click', () => setExpanded(!arena.classList.contains('arena-expanded')));
  document.addEventListener('keydown', event => {
   if (event.key === 'Escape' && !dialog.open) setExpanded(false);
  });
 } else {
  fullscreen.addEventListener('click', async () => {
   try {
    if (document.fullscreenElement === arena) await document.exitFullscreen();
    else await arena.requestFullscreen();
    status.textContent = '';
   } catch {
    status.textContent = 'Fullscreen is unavailable.';
   }
  });
  document.addEventListener('fullscreenchange', () => {
   const expanded = document.fullscreenElement === arena;
   fullscreen.textContent = expanded ? 'Exit fullscreen' : 'Fullscreen';
   fullscreen.setAttribute('aria-pressed', String(expanded));
  });
 }
 const meter = byId('dash-charge');
 if (meter) {
  const ready = byId('dash-ready');
  let last = -1;
  window.setInterval(() => {
   const charge = getDashCharge();
   meter.parentElement.hidden = charge == null;
   if (charge == null || Math.round(charge) === last) return;
   last = Math.round(charge);
   meter.value = charge;
   const message = charge >= 30 ? 'Ready' : 'Recharging';
   if (ready.textContent !== message) ready.textContent = message;
  }, 100);
 }
}
