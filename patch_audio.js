const fs = require('fs');
let code = fs.readFileSync('src/utils/audioSynth.ts', 'utf8');
code = code.replace(
  /export function startAmbientSound\(type: 'rain' \| 'brown' \| 'drone' \| 'off'/g,
  "export function startAmbientSound(type: 'rain' | 'brown' | 'drone' | 'off' | 'white' | 'coffee'"
);

const whiteNoiseStr = `
  } else if (type === 'white') {
    // Generate White Noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
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
      data[i] = Math.random() * 2 - 1;
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(300, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.2, ctx.currentTime);
    
    noiseNode.connect(bandpass);
    bandpass.connect(mainGain);
    noiseNode.start();
    activeSource = noiseNode;
`;

code = code.replace(/} else if \(type === 'drone'\) {/, whiteNoiseStr + "} else if (type === 'drone') {");
fs.writeFileSync('src/utils/audioSynth.ts', code);
