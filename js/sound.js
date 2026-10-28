/* ==========================================================
   Assignment #5 — Play Sounds
   Author: Nursultan Rassulov
   Pages: every page (loaded before the other scripts).

   Sound effects are generated with the Web Audio API, so no audio
   files are needed and nothing has to be downloaded.

   SoundFX is an OBJECT with METHODS:
     SoundFX.play('add')   – plays a named effect
     SoundFX.toggle()      – mute / unmute (remembered in localStorage)
     SoundFX.isMuted()     – true / false

   No overlapping: before a new effect starts, the previous one is
   stopped, so fast clicking never piles sounds on top of each other.
   ========================================================== */

const SoundFX = {
  ctx: null,
  current: [],          // oscillators that are playing right now
  muted: false,
  KEY: 'nbn-muted',

  // Each effect = list of notes: [frequency in Hz, start time, length] (seconds)
  effects: {
    click:   { wave: 'triangle', notes: [[660, 0, 0.06]] },
    add:     { wave: 'square',   notes: [[523, 0, 0.08], [784, 0.08, 0.12]] },
    star:    { wave: 'sine',     notes: [[880, 0, 0.07], [1175, 0.07, 0.1]] },
    success: { wave: 'triangle', notes: [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.18]] },
    error:   { wave: 'sawtooth', notes: [[220, 0, 0.12], [175, 0.12, 0.18]] },
    toggle:  { wave: 'sine',     notes: [[440, 0, 0.05], [550, 0.05, 0.06]] },
    whoosh:  { wave: 'sine',     notes: [[300, 0, 0.05], [600, 0.05, 0.05], [900, 0.1, 0.06]] }
  },

  init() {
    try { this.muted = localStorage.getItem(this.KEY) === '1'; } catch (e) { /* storage blocked */ }
  },

  stopAll() {
    this.current.forEach(osc => { try { osc.stop(); } catch (e) { /* already stopped */ } });
    this.current = [];
  },

  play(name) {
    if (this.muted) return;
    const effect = this.effects[name];
    if (!effect) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;                       // very old browser — stay silent
    if (!this.ctx) this.ctx = new AudioCtx();    // created on the first user click
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.stopAll();                              // no overlapping sounds
    const now = this.ctx.currentTime;

    effect.notes.forEach(([freq, start, length]) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = effect.wave;
      osc.frequency.value = freq;
      // short fade in / fade out so there is no "click" noise
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.12, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + length + 0.02);
      this.current.push(osc);
    });
  },

  isMuted() { return this.muted; },

  toggle() {
    this.muted = !this.muted;
    try { localStorage.setItem(this.KEY, this.muted ? '1' : '0'); } catch (e) { /* ignore */ }
    if (!this.muted) this.play('toggle');
    return this.muted;
  }
};

SoundFX.init();

/* The 🔊 / 🔇 button in the navbar */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-sound-toggle]').forEach(btn => {
    const paint = () => {
      btn.textContent = SoundFX.isMuted() ? '🔇' : '🔊';
      btn.setAttribute('aria-pressed', String(!SoundFX.isMuted()));
      btn.setAttribute('aria-label', SoundFX.isMuted() ? 'Sound is off — turn on' : 'Sound is on — turn off');
    };
    paint();
    btn.addEventListener('click', () => {
      SoundFX.toggle();
      paint();
      if (window.showToast) showToast(SoundFX.isMuted() ? 'Sound off 🔇' : 'Sound on 🔊');
    });
  });
});
