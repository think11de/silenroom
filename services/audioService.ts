// This service uses the Web Audio API to generate procedural sounds
// and mix in sampled ambience for realistic textures.

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.5;
  private readonly think11SampleUrl = 'https://think11.de/wp-content/uploads/2026/01/07048123.wav';
  
  // Active Sound Nodes (WebAudio)
  private nodes: {
    source: AudioScheduledSourceNode;
    gain: GainNode;
  }[] = [];

  // Active Sample (HTML5 Audio for MP3)
  private activeSample: HTMLAudioElement | null = null;

  // Initialize the Audio Context
  async init() {
    if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = this.currentVolume; 
    }
    
    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
    }
  }

  setVolume(val: number) {
    this.currentVolume = val;
    // 1. Web Audio Volume
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.2);
    }
    // 2. HTML5 Audio Volume
    if (this.activeSample) {
        this.activeSample.volume = val;
    }
  }

  // --- Procedural Generators ---

  private createBuffer(type: 'brown' | 'pink'): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = 4 * this.ctx.sampleRate; // 4 seconds loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    if (type === 'brown') {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; 
        }
    } else { // Pink
        let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; 
            b6 = white * 0.115926;
        }
    }
    return buffer;
  }

  private createNoiseLayer(buffer: AudioBuffer, filterType: BiquadFilterType, freq: number, initialVol: number) {
    if (!this.ctx || !this.masterGain) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;

    const gain = this.ctx.createGain();
    gain.gain.value = 0; // Start silent for fade-in

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start();
    
    // Fade in
    gain.gain.linearRampToValueAtTime(initialVol, this.ctx.currentTime + 2);
    
    this.nodes.push({ source, gain });
    return { filter, gain };
  }

  // --- MP3 Player Logic ---
  private playSample(url: string) {
    const audioEl = new Audio(url);
    audioEl.loop = true;
    audioEl.crossOrigin = "anonymous"; 
    audioEl.volume = this.currentVolume; 
    
    this.activeSample = audioEl;

    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {});
    }
  }

  // --- Main Logic ---

  async startAmbience(mode: 'think11' | 'rain' | 'library' | 'cafe') {
    if (!this.ctx) await this.init(); 
    
    this.stopAmbience();

    if (mode === 'think11') {
        this.playSample(this.think11SampleUrl);
        return;
    }

    const brown = this.createBuffer('brown');
    const pink = this.createBuffer('pink');

    if (mode === 'cafe' && brown && pink) {
        // Cafe ambience: warm brown noise + subtle chatter-like pink noise
        this.createNoiseLayer(brown, 'lowpass', 300, 0.35);
        this.createNoiseLayer(pink, 'bandpass', 1500, 0.08);
        this.createNoiseLayer(pink, 'highpass', 3000, 0.02);
        return;
    }

    if (mode === 'rain' && brown && pink) {
        this.createNoiseLayer(brown, 'lowpass', 400, 0.4);
        this.createNoiseLayer(pink, 'highpass', 800, 0.05);
    
    } else if (mode === 'library' && brown) {
        this.createNoiseLayer(brown, 'lowpass', 150, 0.6);
        if (pink) this.createNoiseLayer(pink, 'bandpass', 2000, 0.02);
    }
  }

  stopAmbience() {
    // Stop WebAudio Nodes
    if (this.ctx) {
        const t = this.ctx.currentTime;
        this.nodes.forEach(({ source, gain }) => {
            try {
                gain.gain.cancelScheduledValues(t);
                gain.gain.setValueAtTime(gain.gain.value, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                source.stop(t + 0.5);
                setTimeout(() => {
                    try { source.disconnect(); gain.disconnect(); } catch(e){}
                }, 600);
            } catch(e){}
        });
    }
    this.nodes = [];

    // Stop HTML5 Audio (MP3)
    if (this.activeSample) {
        this.activeSample.pause();
        this.activeSample.src = "";
        this.activeSample = null;
    }
  }

  // --- SFX ---

  async playAlert() {
    if (!this.ctx) await this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = 440;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.7);
  }

  async playClick() {
    if (!this.ctx) await this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Softer "Biieb"
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  async playJoin() {
      if (!this.ctx) await this.init();
      if (!this.ctx || !this.masterGain) return;

      // Two-tone rising chime (gentle)
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.setValueAtTime(554.37, t + 0.15); // C#
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
      gain.gain.setValueAtTime(0.1, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(t + 0.7);
  }
  
  async playLeave() {
      if (!this.ctx) await this.init();
      if (!this.ctx || !this.masterGain) return;

      // Descending soft tone
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(t + 0.5);
  }

  async playSoftPing() {
    if (!this.ctx) await this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.frequency.value = 720;
    osc.type = 'sine';
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.03, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  async playSoftExit() {
    if (!this.ctx) await this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.value = 520;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.02, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }
}

export const audioService = new AudioService();