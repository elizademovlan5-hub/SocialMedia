let audioContext = null;

export function unlockMessageSound() {
  try {
    if (!audioContext) {
      audioContext =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();
    }

    if (
      audioContext.state ===
      'suspended'
    ) {
      audioContext.resume();
    }
  } catch {
    // Browser audio support yoxdursa
    // səssiz davam et.
  }
}

export function playMessageSound() {
  try {
    unlockMessageSound();

    if (!audioContext) {
      return;
    }

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = 'sine';

    oscillator.frequency
      .setValueAtTime(
        720,
        audioContext.currentTime
      );

    oscillator.frequency
      .exponentialRampToValueAtTime(
        920,
        audioContext.currentTime +
          0.08
      );

    gain.gain.setValueAtTime(
      0.0001,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.12,
      audioContext.currentTime +
        0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime +
        0.18
    );

    oscillator.connect(gain);

    gain.connect(
      audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime +
        0.2
    );
  } catch {
    // sound failure messaging-i
    // pozmamalıdır.
  }
}