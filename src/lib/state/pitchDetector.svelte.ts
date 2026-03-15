import workletUrl from './worklet?worker&url';

type Session = {
  setWindow(value: number): void;
  destroy(): void;
};

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
  #initialized: boolean = false;
  #session?: Session;

  get active(): boolean {
    return this.#active;
  }

  get window(): number {
    return this.#window;
  }

  set window(value: number) {
    this.#window = value;
    this.#session?.setWindow(value);
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

    const [stream] = await Promise.all([this.#createMediaStream(), this.#ctx.resume()]);

    if (!this.#initialized) {
      await this.#ctx.audioWorklet.addModule(workletUrl);
      this.#initialized = true;
    }

    this.#session = this.#createSession(stream);
  }

  async stop(): Promise<void> {
    if (!this.#active) {
      return;
    }

    this.#active = false;
    this.#session?.destroy();
    this.#session = undefined;
  }

  #createSession(mediaStream: MediaStream): Session {
    const src = new MediaStreamAudioSourceNode(this.#ctx, { mediaStream });
    const [chain, detector] = this.#buildChain(
      src,
      this.#createHpf(80),
      this.#createLpf(1000),
      this.#createDetector(),
    );

    detector.port.addEventListener('message', this.#handleMessage);
    detector.port.start();

    const win = detector.parameters.get('window');

    if (!win) {
      throw new Error('Internal error: cannot get AudioWorklet param "window"');
    }

    return {
      setWindow: (value: number): void => {
        win.value = value;
      },
      destroy: (): void => {
        for (const track of mediaStream.getAudioTracks()) {
          track.stop();
        }

        for (const node of chain) {
          node.disconnect();
        }

        detector.port.removeEventListener('message', this.#handleMessage);
        detector.port.close();
      },
    };
  }

  readonly #handleMessage = (evt: MessageEvent): void => {
    this.#average = evt.data.average;
  };

  async #createMediaStream(): Promise<MediaStream> {
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

  #buildChain<E extends AudioNode>(...nodes: [...AudioNode[], E]): [AudioNode[], E] {
    const end = nodes.reduce((node, next) => node.connect(next)) as E;
    return [nodes, end];
  }
}
