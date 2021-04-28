/***************************************************************/
/* Created by Rick Battagline at embed limited.  www.embed.com */
/***************************************************************/
(<any>window).AudioContext = (<any>window).AudioContext ||
    (<any>window).webkitAudioContext ||
    (<any>window).mozAudioContext ||
    (<any>window).oAudioContext ||
    (<any>window).msAudioContext;

/*************************************************************/
/* SFXWeb is a class used to generate sound effects in       */
/* during game play                                          */
/*************************************************************/
class SFXWeb {
    public static SN: SFXWeb;
    public static TWO_PI: number = Math.PI * 2;

    public static ACTX: AudioContext;

    public def: SFXDef;
    public masterVolume: number = 1;

    constructor() {
        if (SFXWeb.SN != null) {
            return;
        }
        SFXWeb.SN = this;
        SFXWeb.ACTX = new AudioContext();
    }

    public SetDef = (def: SFXDef): void => {
        this.def = def;
    }

    /*************************************************************/
    /* Play a sound based on the definition, or if no definition */
    /* is passed in, play the last definition used.              */
    /*************************************************************/
    public PlaySound = (def: SFXDef = null): void => {
        if (def != null) {
            this.def = def;
        }

        var context: AudioContext = SFXWeb.ACTX;
        var time: number = this.def.attackTime + this.def.decayTime + this.def.sustainTime + this.def.releaseTime;

        // noise waveType does not use a oscillator, but generates random noise in a sound buffer.
        if (this.def.waveType == 'noise') {
            var noise_buffer: AudioBufferSourceNode = this.Noise();

            noise_buffer.detune.setValueAtTime(this.def.noiseDetune * 100, context.currentTime);
            noise_buffer.detune.linearRampToValueAtTime(this.def.noiseDetuneSlide * 100, context.currentTime + time);
            var gain_node: GainNode = context.createGain();
            gain_node.gain.setValueAtTime(this.def.gain, context.currentTime);
            noise_buffer.connect(gain_node);
            var audio: AudioNode = gain_node;

            if (this.def.hiPassFrequency > 0) {
                audio = this.HighPassFilter(this.def.hiPassFrequency, time, audio);
            }

            if (this.def.lowPassFrequency > 0) {
                audio = this.LowPassFilter(this.def.lowPassFrequency, time, audio, this.def.lowPassFrequencyRamp);
            }

            if (this.def.dutyCycleLength > 0) {
                var duty_cycle: GainNode = this.DutyCycle(this.def.dutyCycleLength, this.def.dutyCyclePct, time);
                audio.connect(duty_cycle);
                audio = duty_cycle;
            }

            var flange: AudioNode = null;
            if (this.def.flangeDelayTime > 0) {
                flange = this.Flange(this.def.flangeDelayTime, this.def.flangeFeedbackVolume, audio);
                flange.connect(audio);
                //  NOT SURE THIS IS RIGHT... THIS WASN'T HERE
                audio = flange;
            }

            if (this.def.vibratoTime > 0) {
                var vibrato_gain: GainNode = this.Vibrato(SFXWeb.GET_OSC_FROM_STRING(this.def.vibratoWave),
                    this.def.vibratoFrequency, this.def.vibratoShiftTime * time,
                    this.def.vibratoTime * time);
                audio.connect(vibrato_gain);
                audio = vibrato_gain;
            }

            var envelope: GainNode = this.Envelope(this.def.attackTime, this.def.decayTime,
                this.def.sustainTime, this.def.releaseTime,
                this.def.attackPunchVolume);

            audio.connect(envelope);

            var master_volume_gain: GainNode = context.createGain();
            master_volume_gain.gain.value = this.masterVolume;
            envelope.connect(master_volume_gain);

            master_volume_gain.connect(context.destination);

            noise_buffer.start();
            noise_buffer.stop(context.currentTime + time)

            return;
        }

        var osc_type: OscillatorType = SFXWeb.GET_OSC_FROM_STRING(this.def.waveType);

        var tone: OscillatorNode = this.OscillatorTone(this.def.frequency, osc_type);

        var audio: AudioNode = tone;

        if (this.def.frequencySlide != 0) {
            if (this.def.delayFrequencyStartTimePct != 0) {
                this.FrequencySlide(this.def.frequencySlide, this.def.delayFrequencyStartTimePct, tone);
                this.DelayedFrequencySlide(this.def.frequencySlide, this.def.delayFrequencyMult,
                    this.def.delayFrequencyStartTimePct, time, tone);
            }
            else {
                this.FrequencySlide(this.def.frequencySlide, time, tone);
            }
        }
        else if (this.def.delayFrequencyStartTimePct != 0) {
            this.DelayedFrequencySlide(this.def.frequency, this.def.delayFrequencyMult,
                this.def.delayFrequencyStartTimePct, time, tone);
        }

        if (this.def.hiPassFrequency > 0) {
            audio = this.HighPassFilter(this.def.hiPassFrequency, time, tone);
        }

        if (this.def.lowPassFrequency > 0) {
            audio = this.LowPassFilter(this.def.lowPassFrequency, time, tone, this.def.lowPassFrequencyRamp);
        }

        var gain_node: GainNode = context.createGain();
        gain_node.gain.value = this.def.gain;
        audio.connect(gain_node);
        audio = gain_node;

        var envelope: GainNode = this.Envelope(this.def.attackTime, this.def.decayTime,
            this.def.sustainTime, this.def.releaseTime,
            this.def.attackPunchVolume);

        audio.connect(envelope);
        audio = envelope;

        if (this.def.dutyCycleLength > 0) {
            var duty_cycle: GainNode = this.DutyCycle(this.def.dutyCycleLength, this.def.dutyCyclePct, time);
            audio.connect(duty_cycle);
            audio = duty_cycle;
        }

        var flange: AudioNode = null;
        if (this.def.flangeDelayTime > 0) {
            flange = this.Flange(this.def.flangeDelayTime, this.def.flangeFeedbackVolume, audio);
            flange.connect(audio);
        }

        if (this.def.vibratoTime > 0) {
            var vibrato_gain: GainNode = this.Vibrato(SFXWeb.GET_OSC_FROM_STRING(this.def.vibratoWave),
                this.def.vibratoFrequency, this.def.vibratoShiftTime * time,
                this.def.vibratoTime * time);

            audio.connect(vibrato_gain);
            audio = vibrato_gain;
        }

        var master_volume_gain: GainNode = context.createGain();
        master_volume_gain.gain.value = this.masterVolume;
        audio.connect(master_volume_gain);

        master_volume_gain.connect(context.destination);

        tone.start();
        tone.stop(context.currentTime + time);
    }

    /*************************************************************/
    /* This static method converts a string to an OscillatorType */
    /*************************************************************/
    public static GET_OSC_FROM_STRING(wave_type: string): OscillatorType {
        if (wave_type == 'square') {
            return 'square';
        }
        else if (wave_type == 'sine') {
            return 'sine';
        }
        else if (wave_type == 'triangle') {
            return 'triangle';
        }
        else if (wave_type == 'sawtooth') {
            return 'sawtooth';
        }
        return 'square';
    }

    /*************************************************************/
    /* OscillatorTone creates the oscillator node that is the starting */
    /* point for all sounds not based on noise                   */
    /*************************************************************/
    public OscillatorTone = (frequency: number, wave: OscillatorType): OscillatorNode => {
        var context: AudioContext = SFXWeb.ACTX;
        var tone: OscillatorNode = context.createOscillator();
        tone.type = wave;
        tone.frequency.setValueAtTime(frequency, context.currentTime); // value in hertz

        return tone;
    }

    /*************************************************************/
    /* DutyCycle creates a GainNode that drops the volume to 0   */
    /* in cycles                                                 */
    /*************************************************************/
    private DutyCycle = (cycle_length: number, cycle_pct: number, total_time: number): GainNode => {
        var context: AudioContext = SFXWeb.ACTX;

        var t: number = 0;

        var start_mute: number = (1.0 - cycle_pct) * cycle_length;
        var duty_cycle_node: GainNode = context.createGain();
        duty_cycle_node.gain.setValueAtTime(1, context.currentTime);

        while (t < total_time) {
            duty_cycle_node.gain.setValueAtTime(1, context.currentTime + t + start_mute * 0.98);// + start_mute
            duty_cycle_node.gain.linearRampToValueAtTime(0, context.currentTime + t + start_mute);// + start_mute
            duty_cycle_node.gain.setValueAtTime(0, context.currentTime + t + cycle_length * 0.98);
            duty_cycle_node.gain.linearRampToValueAtTime(1, context.currentTime + t + cycle_length);
            t += cycle_length; //cycle_length;
        }

        return duty_cycle_node;
    }

    /*************************************************************/
    /* HighPassFilter allows all frequencies above a certain     */
    /* value to pass and filters out all lower frequencies       */
    /*************************************************************/
    private HighPassFilter = (hpf_frequency: number, time: number,
        input_node: AudioNode): AudioNode => {
        var context: AudioContext = SFXWeb.ACTX;

        var highPassFilter: BiquadFilterNode = context.createBiquadFilter();
        highPassFilter.type = "highpass";
        highPassFilter.frequency.value = hpf_frequency;

        input_node.connect(highPassFilter);
        return highPassFilter;
    }

    /*************************************************************/
    /* LowPassFilter allows all frequencies below a certain      */
    /* value to pass and filters out all higher frequencies      */
    /*************************************************************/
    private LowPassFilter = (lpf_frequency: number, time: number,
        input_node: AudioNode, ramp_frequency: number = 0): AudioNode => {
        var context: AudioContext = SFXWeb.ACTX;

        var lowPassFilter: BiquadFilterNode = context.createBiquadFilter();
        lowPassFilter.type = "lowpass";
        lowPassFilter.frequency.value = lpf_frequency;

        if (ramp_frequency != 0) {
            lowPassFilter.frequency.linearRampToValueAtTime(ramp_frequency, context.currentTime + time);
        }

        input_node.connect(lowPassFilter);
        return lowPassFilter;
    }

    /*************************************************************/
    /* DelayedFrequencySlide waits a certain period of time and  */
    /* then slides the frequency of the oscilltor to a different */
    /* value                                                     */
    /*************************************************************/
    private DelayedFrequencySlide = (frequency: number, frequency_mult: number, delay_start: number, end_time: number,
        input_node: OscillatorNode): OscillatorNode => {
        var context: AudioContext = SFXWeb.ACTX;

        input_node.frequency.setValueAtTime(frequency, context.currentTime + delay_start);
        if (this.def.slideType == 'linear') {
            input_node.frequency.linearRampToValueAtTime(frequency * frequency_mult, context.currentTime + end_time);
        }
        else if (this.def.slideType == 'none') {
            input_node.frequency.setValueAtTime(frequency * frequency_mult, context.currentTime + delay_start);
        }
        else if (this.def.slideType == 'exp') {
            input_node.frequency.exponentialRampToValueAtTime(frequency * frequency_mult, context.currentTime + end_time);
        }
        return input_node;
    }

    /*************************************************************/
    /* FrequencySlide creates an oscillator that slides it's     */
    /* frequency from one value to a different value over a      */
    /* period of time                                            */
    /*************************************************************/
    private FrequencySlide = (frequency: number, time: number,
        input_node: OscillatorNode): OscillatorNode => {
        var context: AudioContext = SFXWeb.ACTX;

        input_node.frequency.linearRampToValueAtTime(frequency, context.currentTime + time); // value in hertz

        return input_node;
    }

    /*************************************************************/
    /* Vibrato creates a GainNode that moves the volume up and   */
    /* down in a wave pattern                                    */
    /*************************************************************/
    private Vibrato = (wave_type: OscillatorType, vibrato_frequency: number,
        shift_time: number, time: number): GainNode => {
        var context: AudioContext = SFXWeb.ACTX;

        var gainNode: GainNode = context.createGain();

        var osc: OscillatorNode = context.createOscillator();
        osc.type = wave_type;
        osc.frequency.setValueAtTime(vibrato_frequency, context.currentTime); // value in hertz
        osc.connect(gainNode);

        osc.start(context.currentTime + shift_time);
        osc.stop(context.currentTime + time);

        return gainNode; //input_node;
    }

    private noiseData: Float32Array = new Float32Array(16384);
    private noiseInit: boolean = false;

    /*************************************************************/
    /* Noise is an alternative starting point for a sound        */
    /* effects such as explosions                                */
    /*************************************************************/
    private Noise = (): AudioBufferSourceNode => {
        var context: AudioContext = SFXWeb.ACTX;

        var noise_node: AudioBufferSourceNode = context.createBufferSource();
        var buffer: AudioBuffer = context.createBuffer(1, 16384, context.sampleRate);
        if (this.noiseInit == false) {
            for (var i = 0; i < 16384; i += 10) {
                this.noiseData[i] = Math.random() * 2 - 1;

                for (var j: number = 1; j < 10; j++) {
                    this.noiseData[i + j] = this.noiseData[i];
                }
            }
        }

        var data: Float32Array = buffer.getChannelData(0);
        data.set(this.noiseData);

        noise_node.buffer = buffer;
        noise_node.loop = true;
        return noise_node;
    }

    /*************************************************************/
    /* Envelope creates a GainNode that ramps up the volume and  */
    /* back down again when the effect is ending                 */
    /*************************************************************/
    private Envelope = (attack_time: number, decay_time: number, sustain_time: number, release_time: number,
        attack_punch: number): GainNode => {
        var context: AudioContext = SFXWeb.ACTX;


        var envelope: GainNode = context.createGain();

        envelope.gain.setValueAtTime(0.0, context.currentTime);
        envelope.gain.linearRampToValueAtTime(attack_punch, context.currentTime + attack_time);
        envelope.gain.linearRampToValueAtTime(1, context.currentTime + attack_time + decay_time);
        envelope.gain.setValueAtTime(1,
            context.currentTime + attack_time + decay_time + sustain_time);
        envelope.gain.linearRampToValueAtTime(0.0,
            context.currentTime + attack_time + decay_time + sustain_time + release_time);

        return envelope;
    }

    /*************************************************************/
    /* Flange is a feedback effect                               */
    /*************************************************************/
    private Flange = (delay_time: number, feedback_volume: number, input: AudioNode): GainNode => {
        var context: AudioContext = SFXWeb.ACTX;

        var delayNode: DelayNode = context.createDelay();
        delayNode.delayTime.value = delay_time;

        var feedback: GainNode = context.createGain();
        feedback.gain.value = feedback_volume

        input.connect(delayNode);
        delayNode.connect(feedback);
        return feedback;
    }
}