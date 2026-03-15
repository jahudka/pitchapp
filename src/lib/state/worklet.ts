import { FMAX, FMIN } from './common';

// declare const currentFrame: number;
// declare const currentTime: number;

declare const sampleRate: number;

declare abstract class AudioWorkletProcessor {
  readonly port: MessagePort;

  abstract process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean;
}

declare interface AudioParamDescriptor {
  name: string;
  automationRate?: 'a-rate' | 'k-rate';
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
}

declare interface AudioWorkletProcessorConstructor {
  readonly parameterDescriptors?: AudioParamDescriptor[];
  new (options: any): AudioWorkletProcessor;
}

declare function registerProcessor(
  name: string,
  processorCtor: AudioWorkletProcessorConstructor,
): void;

/**
 *
 */

class YinPitchDetector {
  readonly #sampleRate: number;
  readonly #threshold: number;
  readonly #tauMin: number;
  readonly #tauMax: number;
  readonly #yin: Float32Array;

  constructor(sampleRate: number, fmin: number, fmax: number, threshold: number = 0.15) {
    this.#sampleRate = sampleRate;
    this.#threshold = threshold;
    this.#tauMax = Math.floor(sampleRate / fmin);
    this.#tauMin = Math.floor(sampleRate / fmax);
    this.#yin = new Float32Array(this.#tauMax);
  }

  detect(buffer: Float32Array): number | null {
    // Step 1: difference function
    for (let tau = 1; tau < this.#tauMax; tau++) {
      let sum = 0;

      for (let i = 0; i < buffer.length - tau; i++) {
        const d = buffer[i] - buffer[i + tau];
        sum += d * d;
      }

      this.#yin[tau] = sum;
    }

    // Step 2: cumulative mean normalized difference
    this.#yin[0] = 1;
    let runningSum = 0;

    for (let tau = 1; tau < this.#tauMax; tau++) {
      runningSum += this.#yin[tau];
      this.#yin[tau] *= tau / runningSum;
    }

    // Step 3: absolute threshold
    let tauEstimate = -1;

    for (let tau = this.#tauMin; tau < this.#tauMax; tau++) {
      if (this.#yin[tau] < this.#threshold) {
        while (tau + 1 < this.#tauMax && this.#yin[tau + 1] < this.#yin[tau]) {
          tau++;
        }

        tauEstimate = tau;
        break;
      }
    }

    if (tauEstimate < 0) {
      return null;
    }

    // Step 4: convert to frequency
    return this.#sampleRate / tauEstimate;
  }
}

class PitchAverager {
  readonly #buffer: number[];
  #pointer: number = -1;
  #sum: number = 0;
  readonly #length: number;

  constructor(sampleRate: number, hopSize: number, seconds: number = 2) {
    const framesPerSecond = sampleRate / hopSize;
    this.#buffer = new Array(Math.floor(framesPerSecond * seconds)).fill(0);
    this.#length = seconds;
  }

  get length(): number {
    return this.#length;
  }

  push(pitch: number): number {
    pitch = Math.log2(pitch);

    if (++this.#pointer >= this.#buffer.length) {
      this.#pointer = 0;
    }

    this.#sum -= this.#buffer[this.#pointer];
    this.#sum += pitch;
    this.#buffer[this.#pointer] = pitch;

    return 2 ** (this.#sum / this.#buffer.length);
  }
}

class Accumulator {
  readonly #buffer: Float32Array;
  readonly #output: Float32Array;
  #offset: number = 0;

  constructor(size: number) {
    this.#buffer = new Float32Array(size);
    this.#output = new Float32Array(size);
  }

  push(chunk: Float32Array): Float32Array {
    this.#buffer.set(chunk, this.#offset);

    if (this.#offset + chunk.length < this.#buffer.length) {
      this.#output.set(this.#buffer.subarray(this.#offset + chunk.length), 0);
    }

    this.#output.set(
      this.#buffer.subarray(0, this.#offset + chunk.length),
      this.#buffer.length - (this.#offset + chunk.length),
    );

    this.#offset += chunk.length;

    if (this.#offset >= this.#buffer.length) {
      this.#offset = 0;
    }

    return this.#output;
  }
}

class PitchDetectorProcessor extends AudioWorkletProcessor {
  readonly #buffer = new Accumulator(2048);
  readonly #detector: YinPitchDetector;
  #averager?: PitchAverager;
  #current: number = 0;

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      {
        name: 'window',
        automationRate: 'k-rate',
        minValue: 1,
        maxValue: 10,
        defaultValue: 3,
      },
    ];
  }

  constructor() {
    super();

    this.#detector = new YinPitchDetector(sampleRate, FMIN, FMAX, 0.15);
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    if (!inputs?.[0]?.[0]) {
      return true;
    }

    const buffer = this.#buffer.push(inputs[0][0]);
    const pitch = this.#detector.detect(buffer);

    if (pitch === null) {
      return true;
    }

    if (this.#averager?.length !== parameters.window[0]) {
      this.#averager = new PitchAverager(sampleRate, 512, parameters.window[0]);
    }

    const average = Math.round(this.#averager.push(pitch));

    if (average !== this.#current) {
      this.#current = average;

      if (average >= FMIN && average <= FMAX) {
        this.port.postMessage({ average });
      }
    }

    return true;
  }
}

registerProcessor('pitch-detector', PitchDetectorProcessor);
