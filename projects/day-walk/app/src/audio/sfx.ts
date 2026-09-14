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
  tone(523, 0.12);
  tone(659, 0.12, 0.13);
  tone(784, 0.18, 0.26);
}
