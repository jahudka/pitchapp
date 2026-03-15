import workletUrl from './worklet?worker&url';

export class PitchDetector {
  readonly #ctx: AudioContext = new AudioContext({
    latencyHint: 'interactive',
  });

  #active: boolean = $state(false);
  #window: number = $state(3);
  #threshold: number = $state(150);
  #average?: number = $state();
  #aboveThreshold?: boolean = $derived(
    this.#average !== undefined ? this.#average >= this.#threshold : undefined,
  );
  #stream?: Promise<MediaStream>;
  #initialized: boolean = false;
  #detector?: AudioWorkletNode;

  get active(): boolean {
    return this.#active;
  }

  get window(): number {
    return this.#window;
  }

  set window(value: number) {
    this.#window = value;

    const win = this.#detector?.parameters.get('window');

    if (win) {
      win.value = value;
    }
  }

  get threshold(): number {
    return this.#threshold;
  }

  set threshold(value: number) {
    this.#threshold = value;
  }

  get average(): number | undefined {
    return this.#average;
  }

  get aboveThreshold(): boolean | undefined {
    return this.#aboveThreshold;
  }

  async start(): Promise<void> {
    if (this.#active) {
      return;
    }

    this.#active = true;

    const [, stream] = await Promise.all([
      this.#ctx.resume(),
      (this.#stream ??= this.#getMediaStream()),
    ]);

    if (!this.#initialized) {
      this.#initialized = true;
      await this.#init(stream);
    }
  }

  async stop(): Promise<void> {
    if (!this.#active) {
      return;
    }

    this.#active = false;
    await this.#ctx.suspend();
  }

  async #init(mediaStream: MediaStream): Promise<void> {
    await this.#ctx.audioWorklet.addModule(workletUrl);

    const src = new MediaStreamAudioSourceNode(this.#ctx, { mediaStream });
    this.#detector = this.#createDetector();
    src.connect(this.#createHpf(80)).connect(this.#createLpf(1000)).connect(this.#detector);

    this.#detector.port.addEventListener('message', (msg) => {
      this.#average = msg.data.average;
    });

    this.#detector.port.start();
  }

  async #getMediaStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: false,
        // noiseSuppression: true,
      },
      video: false,
    });
  }

  #createBiquad(options: BiquadFilterOptions): BiquadFilterNode {
    return new BiquadFilterNode(this.#ctx, options);
  }

  #createHpf(frequency: number): BiquadFilterNode {
    return this.#createBiquad({ type: 'highpass', frequency });
  }

  #createLpf(frequency: number): BiquadFilterNode {
    return this.#createBiquad({ type: 'lowpass', frequency });
  }

  #createDetector(): AudioWorkletNode {
    return new AudioWorkletNode(this.#ctx, 'pitch-detector', {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      parameterData: {
        window: this.#window,
      },
    });
  }
}
