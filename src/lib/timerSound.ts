let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** Short chime when a focus or break timer finishes */
export function playTimerEndSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25, 783.99];

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.1;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.22, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
    osc.start(start);
    osc.stop(start + 0.5);
  });
}
