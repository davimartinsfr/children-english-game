/*
 * Voz (pronúncia em inglês usando a voz do próprio computador) e efeitos sonoros.
 * Nada é baixado da internet. Se o computador não tiver voz em inglês,
 * o jogo continua funcionando, só sem a fala.
 */
window.WR = window.WR || {};

WR.Audio = (function () {
  var ctx = null;
  var voice = null;
  var synth = window.speechSynthesis || null;

  function chooseVoice() {
    if (!synth) return;
    var voices = synth.getVoices();
    voice = voices.filter(function (v) { return /^en[-_]GB/i.test(v.lang); })[0] ||
      voices.filter(function (v) { return /^en[-_]US/i.test(v.lang); })[0] ||
      voices.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
  }
  if (synth) {
    chooseVoice();
    if ('onvoiceschanged' in synth) synth.onvoiceschanged = chooseVoice;
  }

  function tone(freq, start, dur, type, vol) {
    if (!ctx) return;
    var t = ctx.currentTime + start;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol || 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  return {
    voiceOn: true,
    rate: 0.9,

    // Precisa ser chamado depois de um clique/tecla (regra dos navegadores).
    unlock: function () {
      try {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) { ctx = null; }
    },

    speak: function (text) {
      if (!synth || !this.voiceOn) return;
      try {
        synth.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = voice ? voice.lang : 'en-GB';
        if (voice) u.voice = voice;
        u.rate = this.rate;
        synth.speak(u);
      } catch (e) { /* sem voz: segue o jogo */ }
    },

    stopSpeech: function () { try { if (synth) synth.cancel(); } catch (e) { /* ignore */ } },

    jump: function () { tone(520, 0, 0.12, 'square', 0.04); },
    good: function () { tone(660, 0, 0.12); tone(880, 0.1, 0.12); tone(1320, 0.2, 0.25); },
    bad: function () { tone(220, 0, 0.2, 'sawtooth', 0.07); tone(160, 0.15, 0.3, 'sawtooth', 0.07); },
    pop: function () { tone(900, 0, 0.06, 'triangle', 0.05); },
    bump: function () { tone(300, 0, 0.08, 'square', 0.06); },
    end: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.12, 0.2, 'triangle', 0.08); }); }
  };
})();
