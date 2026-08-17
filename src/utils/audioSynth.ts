// Web Audio API Synthesizer for self-contained, high-fidelity focus sounds.
let audioCtx: AudioContext | null = null;
let activeSource: AudioNode | null = null;
let activeOscillators: OscillatorNode[] = [];
let mainGain: GainNode | null = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAmbientSound() {
  if (activeSource) {
    try {
      (activeSource as any).stop?.();
    } catch (e) {}
    activeSource = null;
  }
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch (e) {}
  });
  activeOscillators = [];
  if (mainGain) {
    try {
      mainGain.disconnect();
    } catch (e) {}
    mainGain = null;
  }
}

export function startAmbientSound(type: 'rain' | 'brown' | 'drone' | 'off' | 'white' | 'coffee', volume: number = 0.5) {
  stopAmbientSound();
  if (type === 'off') return;

  const ctx = initAudio();
  mainGain = ctx.createGain();
  mainGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  mainGain.connect(ctx.destination);

  const bufferSize = ctx.sampleRate * 2; // 2 seconds of sound

  if (type === 'brown') {
    // Generate Brown Noise (deeper, softer than white noise)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // compensation gain
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(400, ctx.currentTime);

    noiseNode.connect(lowpass);
    lowpass.connect(mainGain);
    
    noiseNode.start();
    activeSource = noiseNode;

  } else if (type === 'rain') {
    // Generate Rain: Brown/pink noise with high-frequency crackles
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.12 * white)) / 1.12;
      lastOut = data[i];
      data[i] *= 2.0;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, ctx.currentTime);

    // Rain crackle nodes (low volume, highpass clicks)
    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.015, ctx.currentTime);

    // Let's create an LFO to modulate rain density
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // very slow cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(200, ctx.currentTime);

    const biquad = ctx.createBiquadFilter();
    biquad.type = 'lowpass';
    biquad.frequency.setValueAtTime(700, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(biquad.frequency);

    noiseNode.connect(biquad);
    biquad.connect(mainGain);
    lfo.start();
    noiseNode.start();

    activeSource = noiseNode;
    activeOscillators.push(lfo);

  
    } else if (type === 'white') {
    // Generate White Noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    noiseNode.connect(mainGain);
    noiseNode.start();
    activeSource = noiseNode;
  } else if (type === 'coffee') {
    // Generate Coffee Shop murmur simulation
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(300, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.2, ctx.currentTime);
    
    // Low frequency LFO to create "chatter" modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.5, ctx.currentTime);
    
    lfo.connect(lfoGain);
    
    const outGain = ctx.createGain();
    outGain.gain.setValueAtTime(0.6, ctx.currentTime);
    
    noiseNode.connect(bandpass);
    bandpass.connect(outGain);
    outGain.connect(mainGain);
    noiseNode.start();
    activeSource = noiseNode;
} else if (type === 'drone') {
    // Generate Deep Cosmic Drone: Detuned oscillators combined with a resonant filter
    const freqs = [110, 110.5, 165, 220, 220.8]; // Harmonic minor intervals (A2, A2 detuned, E3, A3, A3 detuned)
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime);
    filter.Q.setValueAtTime(5, ctx.currentTime);
    filter.connect(mainGain);

    // Slow filter modulation (LFO)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12.5 seconds per sweep
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(80, ctx.currentTime); // modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    activeOscillators.push(lfo);

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.12, ctx.currentTime); // prevent clipping

      osc.connect(oscGain);
      oscGain.connect(filter);
      
      osc.start();
      activeOscillators.push(osc);
    });
  }
}

// Play a friendly success tune
export function playCompletionSound() {
  try {
    const ctx = initAudio();
    const now = ctx.currentTime;
    
    const melody = [
      { note: 523.25, time: 0 },    // C5
      { note: 659.25, time: 0.15 }, // E5
      { note: 783.99, time: 0.3 },  // G5
      { note: 1046.50, time: 0.45 } // C6
    ];

    melody.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.note, now + item.time);
      
      gain.gain.setValueAtTime(0, now + item.time);
      gain.gain.linearRampToValueAtTime(0.15, now + item.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + item.time + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + item.time);
      osc.stop(now + item.time + 0.5);
    });
  } catch (e) {
    console.error("Audio completion play failed", e);
  }
}

export function setAmbientVolume(volume: number) {
  if (mainGain) {
    try {
      mainGain.gain.setTargetAtTime(volume * 0.4, audioCtx!.currentTime, 0.1);
    } catch (e) {}
  }
}
