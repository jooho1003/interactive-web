let context: AudioContext | null = null;

export function primeAudio() {
  if (!context) context = new AudioContext();
  void context.resume();
}

function tone(frequency: number, duration: number, delay = 0) {
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.08, context.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + delay + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(context.currentTime + delay);
  oscillator.stop(context.currentTime + delay + duration);
}

export function playDone() {
  tone(880, 0.12);
}

export function playFlag() {
  tone(440, 0.06);
}

export function playCelebration() {
  if (!context) return;
  for (let index = 0; index < 12; index++) {
    const start = context.currentTime + index * .32;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.setValueAtTime(1500 + index % 3 * 220, start);
    oscillator.frequency.exponentialRampToValueAtTime(3200, start + .06);
    oscillator.frequency.exponentialRampToValueAtTime(1800, start + .15);
    gain.gain.setValueAtTime(.001, start);
    gain.gain.exponentialRampToValueAtTime(.035, start + .02);
    gain.gain.exponentialRampToValueAtTime(.001, start + .17);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + .18);
  }
}
