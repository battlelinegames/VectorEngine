/***************************************************************/
/* SFXDef is a class used to define a sound effect to generate */
/***************************************************************/
var SFXDef = /** @class */ (function () {
    function SFXDef() {
        this.waveType = 'square';
        this.frequency = 0;
        this.frequencySlide = 0;
        this.delayFrequencyStartTimePct = 0;
        this.delayFrequencyMult = 0;
        this.vibratoTime = 0;
        this.vibratoShiftTime = 0;
        this.vibratoFrequency = 0;
        this.vibratoWave = "sine";
        this.lowPassFrequency = 0;
        this.lowPassFrequencyRamp = 0;
        this.hiPassFrequency = 0;
        this.attackTime = 0;
        this.decayTime = 0;
        this.sustainTime = 0;
        this.releaseTime = 0;
        this.attackPunchVolume = 0; // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
        this.dutyCycleLength = 1;
        this.dutyCyclePct = 0.5;
        this.flangeDelayTime = 0.01;
        this.flangeFeedbackVolume = 0.3;
        this.gain = 1;
        this.distortion = 0;
        this.noiseDetune = 0;
        this.noiseDetuneSlide = 0;
        this.slideType = "linear";
    }
    return SFXDef;
}());
/***************************************************************/
/* Created by Rick Battagline at embed limited.  www.embed.com */
/***************************************************************/
window.AudioContext = window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.oAudioContext ||
    window.msAudioContext;
/*************************************************************/
/* SFXWeb is a class used to generate sound effects in       */
/* during game play                                          */
/*************************************************************/
var SFXWeb = /** @class */ (function () {
    function SFXWeb() {
        var _this = this;
        this.masterVolume = 1;
        this.SetDef = function (def) {
            _this.def = def;
        };
        /*************************************************************/
        /* Play a sound based on the definition, or if no definition */
        /* is passed in, play the last definition used.              */
        /*************************************************************/
        this.PlaySound = function (def) {
            if (def === void 0) { def = null; }
            if (def != null) {
                _this.def = def;
            }
            var context = SFXWeb.ACTX;
            var time = _this.def.attackTime + _this.def.decayTime + _this.def.sustainTime + _this.def.releaseTime;
            // noise waveType does not use a oscillator, but generates random noise in a sound buffer.
            if (_this.def.waveType == 'noise') {
                var noise_buffer = _this.Noise();
                noise_buffer.detune.setValueAtTime(_this.def.noiseDetune * 100, context.currentTime);
                noise_buffer.detune.linearRampToValueAtTime(_this.def.noiseDetuneSlide * 100, context.currentTime + time);
                var gain_node = context.createGain();
                gain_node.gain.setValueAtTime(_this.def.gain, context.currentTime);
                noise_buffer.connect(gain_node);
                var audio = gain_node;
                if (_this.def.hiPassFrequency > 0) {
                    audio = _this.HighPassFilter(_this.def.hiPassFrequency, time, audio);
                }
                if (_this.def.lowPassFrequency > 0) {
                    audio = _this.LowPassFilter(_this.def.lowPassFrequency, time, audio, _this.def.lowPassFrequencyRamp);
                }
                if (_this.def.dutyCycleLength > 0) {
                    var duty_cycle = _this.DutyCycle(_this.def.dutyCycleLength, _this.def.dutyCyclePct, time);
                    audio.connect(duty_cycle);
                    audio = duty_cycle;
                }
                var flange = null;
                if (_this.def.flangeDelayTime > 0) {
                    flange = _this.Flange(_this.def.flangeDelayTime, _this.def.flangeFeedbackVolume, audio);
                    flange.connect(audio);
                    //  NOT SURE THIS IS RIGHT... THIS WASN'T HERE
                    audio = flange;
                }
                if (_this.def.vibratoTime > 0) {
                    var vibrato_gain = _this.Vibrato(SFXWeb.GET_OSC_FROM_STRING(_this.def.vibratoWave), _this.def.vibratoFrequency, _this.def.vibratoShiftTime * time, _this.def.vibratoTime * time);
                    audio.connect(vibrato_gain);
                    audio = vibrato_gain;
                }
                var envelope = _this.Envelope(_this.def.attackTime, _this.def.decayTime, _this.def.sustainTime, _this.def.releaseTime, _this.def.attackPunchVolume);
                audio.connect(envelope);
                var master_volume_gain = context.createGain();
                master_volume_gain.gain.value = _this.masterVolume;
                envelope.connect(master_volume_gain);
                master_volume_gain.connect(context.destination);
                noise_buffer.start();
                noise_buffer.stop(context.currentTime + time);
                return;
            }
            var osc_type = SFXWeb.GET_OSC_FROM_STRING(_this.def.waveType);
            var tone = _this.OscillatorTone(_this.def.frequency, osc_type);
            var audio = tone;
            if (_this.def.frequencySlide != 0) {
                if (_this.def.delayFrequencyStartTimePct != 0) {
                    _this.FrequencySlide(_this.def.frequencySlide, _this.def.delayFrequencyStartTimePct, tone);
                    _this.DelayedFrequencySlide(_this.def.frequencySlide, _this.def.delayFrequencyMult, _this.def.delayFrequencyStartTimePct, time, tone);
                }
                else {
                    _this.FrequencySlide(_this.def.frequencySlide, time, tone);
                }
            }
            else if (_this.def.delayFrequencyStartTimePct != 0) {
                _this.DelayedFrequencySlide(_this.def.frequency, _this.def.delayFrequencyMult, _this.def.delayFrequencyStartTimePct, time, tone);
            }
            if (_this.def.hiPassFrequency > 0) {
                audio = _this.HighPassFilter(_this.def.hiPassFrequency, time, tone);
            }
            if (_this.def.lowPassFrequency > 0) {
                audio = _this.LowPassFilter(_this.def.lowPassFrequency, time, tone, _this.def.lowPassFrequencyRamp);
            }
            var gain_node = context.createGain();
            gain_node.gain.value = _this.def.gain;
            audio.connect(gain_node);
            audio = gain_node;
            var envelope = _this.Envelope(_this.def.attackTime, _this.def.decayTime, _this.def.sustainTime, _this.def.releaseTime, _this.def.attackPunchVolume);
            audio.connect(envelope);
            audio = envelope;
            if (_this.def.dutyCycleLength > 0) {
                var duty_cycle = _this.DutyCycle(_this.def.dutyCycleLength, _this.def.dutyCyclePct, time);
                audio.connect(duty_cycle);
                audio = duty_cycle;
            }
            var flange = null;
            if (_this.def.flangeDelayTime > 0) {
                flange = _this.Flange(_this.def.flangeDelayTime, _this.def.flangeFeedbackVolume, audio);
                flange.connect(audio);
            }
            if (_this.def.vibratoTime > 0) {
                var vibrato_gain = _this.Vibrato(SFXWeb.GET_OSC_FROM_STRING(_this.def.vibratoWave), _this.def.vibratoFrequency, _this.def.vibratoShiftTime * time, _this.def.vibratoTime * time);
                audio.connect(vibrato_gain);
                audio = vibrato_gain;
            }
            var master_volume_gain = context.createGain();
            master_volume_gain.gain.value = _this.masterVolume;
            audio.connect(master_volume_gain);
            master_volume_gain.connect(context.destination);
            tone.start();
            tone.stop(context.currentTime + time);
        };
        /*************************************************************/
        /* OscillatorTone creates the oscillator node that is the starting */
        /* point for all sounds not based on noise                   */
        /*************************************************************/
        this.OscillatorTone = function (frequency, wave) {
            var context = SFXWeb.ACTX;
            var tone = context.createOscillator();
            tone.type = wave;
            tone.frequency.setValueAtTime(frequency, context.currentTime); // value in hertz
            return tone;
        };
        /*************************************************************/
        /* DutyCycle creates a GainNode that drops the volume to 0   */
        /* in cycles                                                 */
        /*************************************************************/
        this.DutyCycle = function (cycle_length, cycle_pct, total_time) {
            var context = SFXWeb.ACTX;
            var t = 0;
            var start_mute = (1.0 - cycle_pct) * cycle_length;
            var duty_cycle_node = context.createGain();
            duty_cycle_node.gain.setValueAtTime(1, context.currentTime);
            while (t < total_time) {
                duty_cycle_node.gain.setValueAtTime(1, context.currentTime + t + start_mute * 0.98); // + start_mute
                duty_cycle_node.gain.linearRampToValueAtTime(0, context.currentTime + t + start_mute); // + start_mute
                duty_cycle_node.gain.setValueAtTime(0, context.currentTime + t + cycle_length * 0.98);
                duty_cycle_node.gain.linearRampToValueAtTime(1, context.currentTime + t + cycle_length);
                t += cycle_length; //cycle_length;
            }
            return duty_cycle_node;
        };
        /*************************************************************/
        /* HighPassFilter allows all frequencies above a certain     */
        /* value to pass and filters out all lower frequencies       */
        /*************************************************************/
        this.HighPassFilter = function (hpf_frequency, time, input_node) {
            var context = SFXWeb.ACTX;
            var highPassFilter = context.createBiquadFilter();
            highPassFilter.type = "highpass";
            highPassFilter.frequency.value = hpf_frequency;
            input_node.connect(highPassFilter);
            return highPassFilter;
        };
        /*************************************************************/
        /* LowPassFilter allows all frequencies below a certain      */
        /* value to pass and filters out all higher frequencies      */
        /*************************************************************/
        this.LowPassFilter = function (lpf_frequency, time, input_node, ramp_frequency) {
            if (ramp_frequency === void 0) { ramp_frequency = 0; }
            var context = SFXWeb.ACTX;
            var lowPassFilter = context.createBiquadFilter();
            lowPassFilter.type = "lowpass";
            lowPassFilter.frequency.value = lpf_frequency;
            if (ramp_frequency != 0) {
                lowPassFilter.frequency.linearRampToValueAtTime(ramp_frequency, context.currentTime + time);
            }
            input_node.connect(lowPassFilter);
            return lowPassFilter;
        };
        /*************************************************************/
        /* DelayedFrequencySlide waits a certain period of time and  */
        /* then slides the frequency of the oscilltor to a different */
        /* value                                                     */
        /*************************************************************/
        this.DelayedFrequencySlide = function (frequency, frequency_mult, delay_start, end_time, input_node) {
            var context = SFXWeb.ACTX;
            input_node.frequency.setValueAtTime(frequency, context.currentTime + delay_start);
            if (_this.def.slideType == 'linear') {
                input_node.frequency.linearRampToValueAtTime(frequency * frequency_mult, context.currentTime + end_time);
            }
            else if (_this.def.slideType == 'none') {
                input_node.frequency.setValueAtTime(frequency * frequency_mult, context.currentTime + delay_start);
            }
            else if (_this.def.slideType == 'exp') {
                input_node.frequency.exponentialRampToValueAtTime(frequency * frequency_mult, context.currentTime + end_time);
            }
            return input_node;
        };
        /*************************************************************/
        /* FrequencySlide creates an oscillator that slides it's     */
        /* frequency from one value to a different value over a      */
        /* period of time                                            */
        /*************************************************************/
        this.FrequencySlide = function (frequency, time, input_node) {
            var context = SFXWeb.ACTX;
            input_node.frequency.linearRampToValueAtTime(frequency, context.currentTime + time); // value in hertz
            return input_node;
        };
        /*************************************************************/
        /* Vibrato creates a GainNode that moves the volume up and   */
        /* down in a wave pattern                                    */
        /*************************************************************/
        this.Vibrato = function (wave_type, vibrato_frequency, shift_time, time) {
            var context = SFXWeb.ACTX;
            var gainNode = context.createGain();
            var osc = context.createOscillator();
            osc.type = wave_type;
            osc.frequency.setValueAtTime(vibrato_frequency, context.currentTime); // value in hertz
            osc.connect(gainNode);
            osc.start(context.currentTime + shift_time);
            osc.stop(context.currentTime + time);
            return gainNode; //input_node;
        };
        this.noiseData = new Float32Array(16384);
        this.noiseInit = false;
        /*************************************************************/
        /* Noise is an alternative starting point for a sound        */
        /* effects such as explosions                                */
        /*************************************************************/
        this.Noise = function () {
            var context = SFXWeb.ACTX;
            var noise_node = context.createBufferSource();
            var buffer = context.createBuffer(1, 16384, context.sampleRate);
            if (_this.noiseInit == false) {
                for (var i = 0; i < 16384; i += 10) {
                    _this.noiseData[i] = Math.random() * 2 - 1;
                    for (var j = 1; j < 10; j++) {
                        _this.noiseData[i + j] = _this.noiseData[i];
                    }
                }
            }
            var data = buffer.getChannelData(0);
            data.set(_this.noiseData);
            noise_node.buffer = buffer;
            noise_node.loop = true;
            return noise_node;
        };
        /*************************************************************/
        /* Envelope creates a GainNode that ramps up the volume and  */
        /* back down again when the effect is ending                 */
        /*************************************************************/
        this.Envelope = function (attack_time, decay_time, sustain_time, release_time, attack_punch) {
            var context = SFXWeb.ACTX;
            var envelope = context.createGain();
            envelope.gain.setValueAtTime(0.0, context.currentTime);
            envelope.gain.linearRampToValueAtTime(attack_punch, context.currentTime + attack_time);
            envelope.gain.linearRampToValueAtTime(1, context.currentTime + attack_time + decay_time);
            envelope.gain.setValueAtTime(1, context.currentTime + attack_time + decay_time + sustain_time);
            envelope.gain.linearRampToValueAtTime(0.0, context.currentTime + attack_time + decay_time + sustain_time + release_time);
            return envelope;
        };
        /*************************************************************/
        /* Flange is a feedback effect                               */
        /*************************************************************/
        this.Flange = function (delay_time, feedback_volume, input) {
            var context = SFXWeb.ACTX;
            var delayNode = context.createDelay();
            delayNode.delayTime.value = delay_time;
            var feedback = context.createGain();
            feedback.gain.value = feedback_volume;
            input.connect(delayNode);
            delayNode.connect(feedback);
            return feedback;
        };
        if (SFXWeb.SN != null) {
            return;
        }
        SFXWeb.SN = this;
        SFXWeb.ACTX = new AudioContext();
    }
    /*************************************************************/
    /* This static method converts a string to an OscillatorType */
    /*************************************************************/
    SFXWeb.GET_OSC_FROM_STRING = function (wave_type) {
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
    };
    SFXWeb.TWO_PI = Math.PI * 2;
    return SFXWeb;
}());
var Envelope = /** @class */ (function () {
    function Envelope() {
        var _this = this;
        this.attackTime = 0.1;
        this.decayTime = 0.1;
        this.sustainTime = 0.3;
        this.sustainVolume = 0.8;
        this.releaseTime = 0.1;
        this.setGain = function (g, ctx) {
            var now = ctx.currentTime;
            g.gain.value = 0;
            g.gain.linearRampToValueAtTime(1, now + _this.attackTime);
            g.gain.linearRampToValueAtTime(_this.sustainVolume, now + _this.attackTime + _this.decayTime);
            g.gain.linearRampToValueAtTime(_this.sustainVolume, now + _this.attackTime + _this.decayTime + _this.sustainTime);
            g.gain.linearRampToValueAtTime(_this.sustainVolume, now + _this.attackTime + _this.decayTime + _this.sustainTime);
            g.gain.linearRampToValueAtTime(0, now + _this.attackTime + _this.decayTime + _this.sustainTime + _this.releaseTime);
        };
    }
    return Envelope;
}());
var InterfaceManager = /** @class */ (function () {
    function InterfaceManager() {
        var _this = this;
        this.mouseDown = false;
        this.MouseDown = function () {
            _this.mouseDown = true;
        };
        this.MouseUp = function () {
            _this.mouseDown = false;
        };
        this.ResetValues = function () {
            _this.def.waveType = _this.htmlWaveType.value;
            _this.def.frequency = parseInt(_this.htmlFrequency.value);
            _this.def.frequencySlide = parseInt(_this.htmlFrequencySlide.value);
            _this.def.delayFrequencyStartTimePct = parseFloat(_this.htmlDelayFrequencyStartTimePct.value);
            _this.def.delayFrequencyMult = parseFloat(_this.htmlDelayFrequencyMult.value);
            _this.def.vibratoTime = parseFloat(_this.htmlVibratoTime.value);
            _this.def.vibratoShiftTime = parseFloat(_this.htmlVibratoShiftTime.value);
            _this.def.vibratoFrequency = parseInt(_this.htmlVibratoFrequency.value);
            _this.def.vibratoWave = _this.htmlVibratoWave.value;
            _this.def.lowPassFrequency = parseInt(_this.htmlLowPassFrequency.value);
            _this.def.lowPassFrequencyRamp = parseInt(_this.htmlLowPassFrequencyRamp.value);
            _this.def.hiPassFrequency = parseInt(_this.htmlHiPassFrequency.value);
            _this.def.attackTime = parseFloat(_this.htmlAttackTime.value);
            _this.def.decayTime = parseFloat(_this.htmlDecayTime.value);
            _this.def.sustainTime = parseFloat(_this.htmlSustainTime.value);
            _this.def.releaseTime = parseFloat(_this.htmlReleaseTime.value);
            _this.def.attackPunchVolume = parseFloat(_this.htmlAttackPunchVolume.value); // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
            _this.def.dutyCycleLength = parseFloat(_this.htmlDutyCycleLength.value);
            _this.def.dutyCyclePct = parseFloat(_this.htmlDutyCyclePct.value);
            _this.def.flangeDelayTime = parseFloat(_this.htmlFlangeDelayTime.value);
            _this.def.flangeFeedbackVolume = parseFloat(_this.htmlFlangeFeedbackVolume.value);
            _this.def.gain = parseFloat(_this.htmlGain.value);
            _this.def.noiseDetune = parseInt(_this.htmlNoiseDetune.value);
            _this.def.noiseDetuneSlide = parseInt(_this.htmlNoiseDetuneSlide.value);
            _this.def.slideType = _this.htmlSlideType.value;
            var wave_type = 0;
            if (_this.def.waveType === 'square') {
                wave_type = 0;
            }
            else if (_this.def.waveType === 'triangle') {
                wave_type = 1;
            }
            else if (_this.def.waveType === 'sine') {
                wave_type = 3;
            }
            else if (_this.def.waveType === 'sawtooth') {
                wave_type = 2;
            }
            else if (_this.def.waveType === 'noise') {
                wave_type = 4;
            }
            var vibrato_wave_type = 0;
            if (_this.def.vibratoWave == 'square') {
                vibrato_wave_type = 0;
            }
            else if (_this.def.vibratoWave === 'triangle') {
                vibrato_wave_type = 1;
            }
            else if (_this.def.vibratoWave === 'sine') {
                vibrato_wave_type = 3;
            }
            else if (_this.def.vibratoWave === 'sawtooth') {
                vibrato_wave_type = 2;
            }
            else if (_this.def.vibratoWave === 'noise') {
                vibrato_wave_type = 4;
            }
            var slide_type = 0;
            if (_this.def.slideType === 'linear') {
                slide_type = 1;
            }
            else if (_this.def.slideType === 'exp') {
                slide_type = 2;
            }
            //this.htmlCodeArea.value = JSON.stringify(this.def, null, '\t');
            _this.htmlCodeArea.value = "\n        playSFX(" + wave_type + ", // wave type\n            " + _this.def.frequency + ", // freq\n            " + _this.def.frequencySlide + ", // freq slide\n            " + _this.def.delayFrequencyStartTimePct + ", // delay freq start\n            " + _this.def.delayFrequencyMult + ", // delay freq mult\n            " + _this.def.vibratoTime + ", // vibrato time\n            " + _this.def.vibratoShiftTime + ", // vibrato shift\n            " + _this.def.vibratoFrequency + ", // vibrato freq\n            " + vibrato_wave_type + ", // vibrato type\n            " + _this.def.lowPassFrequency + ",  // low pass\n            " + _this.def.lowPassFrequencyRamp + ", // low ramp\n            " + _this.def.hiPassFrequency + ", // hi pass\n            " + _this.def.attackTime + ", // attack\n            " + _this.def.decayTime + ", // decay\n            " + _this.def.sustainTime + ", // sustain\n            " + _this.def.releaseTime + ", // release\n            " + _this.def.attackPunchVolume + ", // punch\n            " + _this.def.dutyCycleLength + ", // duty len\n            " + _this.def.dutyCyclePct + ", // duty pct\n            " + _this.def.flangeDelayTime + ", // flange delay\n            " + _this.def.flangeFeedbackVolume + ", // flange feedback\n            " + _this.def.gain + ", // gain\n            " + _this.def.noiseDetune + ", // noise detune \n            " + _this.def.noiseDetuneSlide + ", // detune slide\n            " + slide_type + "); // slide type\n          \n        ";
            _this.htmlCodeArea.rows = 30;
        };
        this.SyncSliders = function () {
            _this.htmlVibratoTimeSlider.value = _this.htmlVibratoTime.value;
            _this.htmlVibratoShiftTimeSlider.value = _this.htmlVibratoShiftTime.value;
            _this.htmlVibratoFrequencySlider.value = _this.htmlVibratoFrequency.value;
            // CHANGE VISIBLE
            //this.htmlVibratoWave.value = this.htmlVibratoWave.value;
            _this.htmlLowPassFrequencySlider.value = _this.htmlLowPassFrequency.value;
            _this.htmlLowPassFrequencyRampSlider.value = _this.htmlLowPassFrequencyRamp.value;
            _this.htmlHiPassFrequencySlider.value = _this.htmlHiPassFrequency.value;
            _this.htmlAttackTimeSlider.value = _this.htmlAttackTime.value;
            _this.htmlDecayTimeSlider.value = _this.htmlDecayTime.value;
            _this.htmlSustainTimeSlider.value = _this.htmlSustainTime.value;
            _this.htmlReleaseTimeSlider.value = _this.htmlReleaseTime.value;
            _this.htmlAttackPunchVolumeSlider.value = _this.htmlAttackPunchVolume.value; // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
            _this.htmlDutyCycleLengthSlider.value = _this.htmlDutyCycleLength.value;
            _this.htmlDutyCyclePctSlider.value = _this.htmlDutyCyclePct.value;
            _this.htmlFlangeDelayTimeSlider.value = _this.htmlFlangeDelayTime.value;
            _this.htmlFlangeFeedbackVolumeSlider.value = _this.htmlFlangeFeedbackVolume.value;
            _this.htmlGainSlider.value = _this.htmlGain.value;
            _this.htmlNoiseDetuneSlider.value = _this.htmlNoiseDetune.value;
            _this.htmlNoiseDetuneSlideSlider.value = _this.htmlNoiseDetuneSlide.value;
            _this.htmlFrequencySlideSlider.value = _this.htmlFrequencySlide.value;
            _this.htmlFrequencySlider.value = _this.htmlFrequency.value;
            _this.htmlDelayFrequencyStartTimePctSlider.value = _this.htmlDelayFrequencyStartTimePct.value;
            _this.htmlDelayFrequencyMultSlider.value = _this.htmlDelayFrequencyMult.value;
            // CHANGE VISIBLE
            //this.htmlSlideType.value = this.htmlSlideTypeSlider.value;
            //        this.ResetValues();
        };
        this.SyncValues = function () {
            _this.htmlVibratoTime.value = _this.htmlVibratoTimeSlider.value;
            _this.htmlVibratoShiftTime.value = _this.htmlVibratoShiftTimeSlider.value;
            _this.htmlVibratoFrequency.value = _this.htmlVibratoFrequencySlider.value;
            // CHANGE VISIBLE
            //this.htmlVibratoWave.value = this.htmlVibratoWave.value;
            _this.htmlLowPassFrequency.value = _this.htmlLowPassFrequencySlider.value;
            _this.htmlLowPassFrequencyRamp.value = _this.htmlLowPassFrequencyRampSlider.value;
            _this.htmlHiPassFrequency.value = _this.htmlHiPassFrequencySlider.value;
            _this.htmlAttackTime.value = _this.htmlAttackTimeSlider.value;
            _this.htmlDecayTime.value = _this.htmlDecayTimeSlider.value;
            _this.htmlSustainTime.value = _this.htmlSustainTimeSlider.value;
            _this.htmlReleaseTime.value = _this.htmlReleaseTimeSlider.value;
            _this.htmlAttackPunchVolume.value = _this.htmlAttackPunchVolumeSlider.value; // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
            _this.htmlDutyCycleLength.value = _this.htmlDutyCycleLengthSlider.value;
            _this.htmlDutyCyclePct.value = _this.htmlDutyCyclePctSlider.value;
            _this.htmlFlangeDelayTime.value = _this.htmlFlangeDelayTimeSlider.value;
            _this.htmlFlangeFeedbackVolume.value = _this.htmlFlangeFeedbackVolumeSlider.value;
            _this.htmlGain.value = _this.htmlGainSlider.value;
            _this.htmlNoiseDetune.value = _this.htmlNoiseDetuneSlider.value;
            _this.htmlNoiseDetuneSlide.value = _this.htmlNoiseDetuneSlideSlider.value;
            _this.htmlFrequencySlide.value = _this.htmlFrequencySlideSlider.value;
            _this.htmlFrequency.value = _this.htmlFrequencySlider.value;
            _this.htmlDelayFrequencyStartTimePct.value = _this.htmlDelayFrequencyStartTimePctSlider.value;
            _this.htmlDelayFrequencyMult.value = _this.htmlDelayFrequencyMultSlider.value;
            // CHANGE VISIBLE
            //this.htmlSlideType.value = this.htmlSlideTypeSlider.value;
            //        this.ResetValues();
        };
        this.rand = function (low, high) {
            if (high === void 0) { high = 0; }
            if (high == 0) {
                high = low;
                low = 0;
            }
            var range = high - low;
            range *= Math.random();
            return low + range;
        };
        this.ArrRand = function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        };
        this.getNote = function (min_hz, max_hz) {
            if (min_hz === void 0) { min_hz = 0; }
            if (max_hz === void 0) { max_hz = 20000; }
            var hz = -999999;
            while (hz < min_hz || hz > max_hz) {
                hz = _this.notes[Math.floor(Math.random() * _this.notes.length)];
            }
            return hz;
        };
        this.getHigherNote = function (hz, higher_count) {
            if (higher_count === void 0) { higher_count = 1; }
            var count = 0;
            for (var i = _this.notes.length - 1; i >= 0; i--) {
                if (_this.notes[i] > hz) {
                    hz = _this.notes[i];
                    if (++count >= higher_count) {
                        break;
                    }
                }
            }
            return hz;
        };
        this.getLowerNote = function (hz, lower_count) {
            if (lower_count === void 0) { lower_count = 1; }
            var count = 0;
            for (var i = 0; i < _this.notes.length; i++) {
                if (_this.notes[i] < hz) {
                    hz = _this.notes[i];
                    if (++count >= lower_count) {
                        break;
                    }
                }
            }
            return hz;
        };
        this.LaserShot = function () {
            _this.htmlWaveType.value = _this.ArrRand(['square', 'sawtooth', 'triangle']); //this.randWave();
            _this.htmlSlideType.value = "linear";
            _this.htmlNoiseDetune.value = "0";
            _this.htmlNoiseDetuneSlide.value = "0";
            var freq = _this.getNote(300, 1200);
            _this.htmlFrequency.value = freq.toString();
            var freq_change = Math.floor(_this.rand(4, 20));
            freq = _this.getLowerNote(freq, freq_change);
            _this.htmlFrequencySlide.value = freq.toString();
            _this.htmlAttackTime.value = "0.001";
            _this.htmlDecayTime.value = "0.001";
            var sustain = (0.1 + _this.rand(0.2));
            _this.htmlSustainTime.value = sustain.toString();
            var release = (0.1 + _this.rand(0.35));
            _this.htmlReleaseTime.value = release.toString();
            _this.htmlAttackPunchVolume.value = "1";
            var time = 0.002 + sustain + release;
            _this.htmlDelayFrequencyStartTimePct.value = "0";
            _this.htmlDelayFrequencyMult.value = "0";
            if (_this.rand(3) > 2) {
                var vibrato_shift = _this.rand(0.25);
                _this.htmlVibratoTime.value = (1 - vibrato_shift).toString();
                _this.htmlVibratoShiftTime.value = vibrato_shift.toString();
                _this.htmlVibratoFrequency.value = Math.floor(_this.rand(2, 21)).toString();
                _this.htmlVibratoWave.value = _this.ArrRand(['sawtooth',
                    'triangle',
                    'sine',
                    'square']);
            }
            else {
                _this.htmlVibratoTime.value = "0";
                _this.htmlVibratoShiftTime.value = "0";
                _this.htmlVibratoFrequency.value = "0";
                _this.htmlVibratoWave.value = "sine";
            }
            _this.htmlLowPassFrequency.value = "0";
            _this.htmlHiPassFrequency.value = "0";
            var rval = _this.rand(3);
            if (rval > 2) {
                freq = _this.getHigherNote(freq, Math.floor(freq_change / 2));
                _this.htmlLowPassFrequency.value = freq.toString();
            }
            else if (rval > 1) {
                freq = _this.getHigherNote(freq, freq_change);
                _this.htmlHiPassFrequency.value = freq.toString();
            }
            _this.htmlFlangeDelayTime.value = "0";
            _this.htmlFlangeFeedbackVolume.value = "0";
            var rand_duty = _this.rand(3);
            if (rand_duty > 2) {
                _this.htmlDutyCycleLength.value = _this.rand(0.05, time / 5).toString();
                _this.htmlDutyCyclePct.value = _this.rand(0.25).toString();
            }
            else {
                _this.htmlDutyCycleLength.value = "0";
                _this.htmlDutyCyclePct.value = "0";
            }
            rval = _this.rand(3);
            if (rval > 2) {
                _this.htmlFlangeDelayTime.value = _this.rand(0.3).toString();
                _this.htmlFlangeFeedbackVolume.value = _this.rand(0.5).toString();
            }
            _this.play();
        };
        this.Hit = function () {
            if (_this.rand(3) < 1) {
                _this.htmlWaveType.value = 'noise';
                var detune = -(_this.rand(20));
                _this.htmlNoiseDetune.value = detune.toString();
                detune -= 40 + _this.rand(40);
                _this.htmlNoiseDetuneSlide.value = detune.toString();
            }
            else {
                _this.htmlNoiseDetune.value = "0";
                _this.htmlNoiseDetuneSlide.value = "0";
                _this.htmlWaveType.value = _this.ArrRand(['square', 'sawtooth', 'triangle']);
                _this.htmlFrequency.value = _this.getNote(400, 600).toString();
                _this.htmlFrequencySlide.value = _this.getNote(1, 80).toString();
            }
            _this.htmlAttackTime.value = "0.001";
            _this.htmlDecayTime.value = "0.001";
            _this.htmlSustainTime.value = (0.001 + _this.rand(0.01)).toString();
            _this.htmlReleaseTime.value = (0.05 + _this.rand(0.15)).toString();
            _this.htmlAttackPunchVolume.value = "1";
            _this.htmlDelayFrequencyMult.value = "0";
            _this.htmlDelayFrequencyStartTimePct.value = "0";
            _this.htmlVibratoFrequency.value = "0";
            _this.htmlVibratoFrequency.value = "0";
            _this.htmlVibratoShiftTime.value = "0";
            _this.htmlHiPassFrequency.value = "0";
            _this.htmlLowPassFrequency.value = "0";
            _this.htmlLowPassFrequencyRamp.value = "0";
            _this.htmlFlangeDelayTime.value = "0";
            _this.htmlFlangeFeedbackVolume.value = "0";
            _this.htmlDutyCycleLength.value = "0";
            _this.htmlDutyCyclePct.value = "0";
            _this.htmlGain.value = "1";
            _this.play();
        };
        this.Explosion = function () {
            _this.htmlWaveType.value = 'noise';
            _this.htmlSlideType.value = "linear";
            var detune = -(_this.rand(20));
            _this.htmlNoiseDetune.value = detune.toString();
            detune -= _this.rand(40);
            _this.htmlNoiseDetuneSlide.value = detune.toString();
            if (_this.rand(2) > 1) {
                _this.htmlDutyCycleLength.value = "0";
                _this.htmlDutyCyclePct.value = "0";
            }
            else {
                _this.htmlDutyCycleLength.value = (0.01 + _this.rand(0.04)).toString();
                _this.htmlDutyCyclePct.value = (0.1 + _this.rand(0.4)).toString();
            }
            _this.htmlAttackTime.value = "0.001";
            _this.htmlDecayTime.value = (0.01 + _this.rand(0.08)).toString();
            _this.htmlSustainTime.value = (0.05 + _this.rand(0.2)).toString();
            _this.htmlReleaseTime.value = (0.2 + _this.rand(0.35)).toString();
            _this.htmlAttackPunchVolume.value = _this.rand(1, 6).toString();
            _this.htmlFlangeDelayTime.value = _this.rand(0.6).toString();
            _this.htmlFlangeFeedbackVolume.value = _this.rand(0.3).toString();
            _this.htmlDelayFrequencyStartTimePct.value = "0";
            _this.htmlDelayFrequencyMult.value = "0";
            _this.htmlVibratoTime.value = "0";
            _this.htmlVibratoShiftTime.value = "0";
            _this.htmlVibratoFrequency.value = "0";
            _this.htmlVibratoWave.value = "sine";
            _this.htmlLowPassFrequency.value = "0";
            _this.htmlLowPassFrequencyRamp.value = "0";
            _this.htmlHiPassFrequency.value = "0";
            var rval = _this.rand(3);
            if (rval > 2) {
                _this.htmlLowPassFrequency.value = _this.rand(1000, 2000).toString();
                _this.htmlLowPassFrequencyRamp.value = _this.rand(500, 1000).toString();
            }
            _this.htmlFlangeDelayTime.value = "0";
            _this.htmlFlangeFeedbackVolume.value = "0";
            _this.play();
        };
        this.Pickup = function () {
            _this.htmlWaveType.value = 'square';
            _this.htmlFrequency.value = _this.getNote(400, 1200).toString();
            _this.htmlFrequencySlide.value = "0";
            _this.htmlSlideType.value = "none";
            _this.htmlAttackTime.value = "0.001";
            var decay = (0.001 + _this.rand(0.02));
            _this.htmlDecayTime.value = decay.toString();
            var sustain = (0.05 + _this.rand(0.1));
            _this.htmlSustainTime.value = sustain.toString();
            var release = sustain * _this.rand(2.5, 4.0);
            _this.htmlReleaseTime.value = release.toString();
            _this.htmlAttackPunchVolume.value = _this.rand(1, 2).toString();
            _this.htmlNoiseDetune.value = "0";
            _this.htmlNoiseDetuneSlide.value = "0";
            //        var time = 0.001 + decay + sustain + release;
            _this.htmlDelayFrequencyStartTimePct.value = _this.rand(0.15, 0.2).toString();
            _this.htmlDelayFrequencyMult.value = "2";
            _this.htmlVibratoFrequency.value = "0";
            _this.htmlVibratoFrequency.value = "0";
            _this.htmlVibratoShiftTime.value = "0";
            _this.htmlFlangeDelayTime.value = "0";
            _this.htmlFlangeFeedbackVolume.value = "0";
            _this.htmlDutyCycleLength.value = "0";
            _this.htmlDutyCyclePct.value = "0";
            _this.play();
        };
        this.Jump = function () {
            _this.htmlWaveType.value = 'square';
            var freq = _this.getNote(400, 600);
            _this.htmlFrequency.value = freq.toString();
            _this.htmlHiPassFrequency.value = _this.getLowerNote(freq).toString();
            freq = _this.getHigherNote(freq, 4);
            _this.htmlFrequencySlide.value = freq.toString();
            _this.htmlLowPassFrequency.value = "0";
            _this.htmlLowPassFrequencyRamp.value = "0";
            var rand = _this.rand(3);
            if (rand < 1) {
                _this.htmlHiPassFrequency.value = "0";
            }
            _this.htmlNoiseDetune.value = "0";
            _this.htmlNoiseDetuneSlide.value = "0";
            _this.htmlAttackTime.value = "0.001";
            _this.htmlDecayTime.value = "0.001";
            _this.htmlSustainTime.value = (0.01 + _this.rand(0.1)).toString();
            _this.htmlReleaseTime.value = (0.2 + _this.rand(0.25)).toString();
            _this.htmlAttackPunchVolume.value = (1.1 + Math.random()).toString();
            _this.htmlDelayFrequencyMult.value = "0";
            _this.htmlDelayFrequencyStartTimePct.value = "0";
            _this.htmlVibratoFrequency.value = "0";
            _this.htmlVibratoFrequency.value = "0";
            _this.htmlVibratoShiftTime.value = "0";
            _this.htmlFlangeDelayTime.value = "0";
            _this.htmlFlangeFeedbackVolume.value = "0";
            _this.htmlDutyCycleLength.value = "0";
            _this.htmlDutyCyclePct.value = "0";
            _this.htmlGain.value = "1";
            //        this.htmlDistortion.value = "0";
            _this.play();
        };
        this.PowerUp = function () {
            _this.htmlWaveType.value = _this.ArrRand(['square', 'sawtooth']);
            var freq = _this.getNote(400, 1200);
            _this.htmlFrequency.value = freq.toString();
            _this.htmlHiPassFrequency.value = _this.getLowerNote(freq).toString();
            var freq_change = Math.floor(_this.rand(2, 6));
            freq = _this.getHigherNote(freq, freq_change);
            _this.htmlFrequencySlide.value = freq.toString();
            _this.htmlLowPassFrequency.value = "0";
            _this.htmlLowPassFrequencyRamp.value = "0";
            _this.htmlNoiseDetune.value = "0";
            _this.htmlNoiseDetuneSlide.value = "0";
            _this.htmlAttackTime.value = "0.001";
            _this.htmlDecayTime.value = "0.001";
            var sustain = _this.rand(0.25);
            _this.htmlSustainTime.value = sustain.toString();
            var release = (0.3 + _this.rand(0.4));
            _this.htmlReleaseTime.value = release.toString();
            _this.htmlAttackPunchVolume.value = (1.1 + Math.random()).toString();
            var time = sustain + release - 0.002;
            _this.htmlDelayFrequencyMult.value = "0";
            _this.htmlDelayFrequencyStartTimePct.value = "0";
            if (_this.rand(3) > 1) {
                _this.htmlVibratoFrequency.value = Math.floor(_this.rand(2, 25)).toString();
                _this.htmlVibratoTime.value = time.toString();
                _this.htmlVibratoShiftTime.value = "0";
                _this.htmlVibratoWave.value = _this.ArrRand(['sawtooth',
                    'triangle',
                    'sine',
                    'square']);
                _this.htmlDutyCycleLength.value = "0";
                _this.htmlDutyCyclePct.value = "0";
            }
            else {
                _this.htmlVibratoFrequency.value = '0';
                _this.htmlVibratoTime.value = "0";
                _this.htmlVibratoShiftTime.value = "0";
                _this.htmlVibratoWave.value = 'square';
                _this.htmlDutyCycleLength.value = _this.rand(time / 10).toString();
                _this.htmlDutyCyclePct.value = _this.rand(0.1, 0.2).toString();
                ;
            }
            _this.htmlFlangeDelayTime.value = "0";
            _this.htmlFlangeFeedbackVolume.value = "0";
            _this.htmlGain.value = "1";
            _this.play();
            //        this.htmlDistortion.value = "0";
        };
        this.PowerDown = function () {
            _this.htmlWaveType.value = _this.ArrRand(['square', 'sawtooth']);
            var freq = _this.getNote(600, 1200);
            _this.htmlFrequency.value = freq.toString();
            _this.htmlHiPassFrequency.value = _this.getLowerNote(freq).toString();
            var freq_change = Math.floor(_this.rand(4, 13));
            freq = _this.getLowerNote(freq, freq_change);
            _this.htmlFrequencySlide.value = freq.toString();
            _this.htmlLowPassFrequency.value = "0";
            _this.htmlLowPassFrequencyRamp.value = "0";
            _this.htmlNoiseDetune.value = "0";
            _this.htmlNoiseDetuneSlide.value = "0";
            _this.htmlAttackTime.value = "0.001";
            _this.htmlDecayTime.value = "0.001";
            var sustain = _this.rand(0.2);
            _this.htmlSustainTime.value = sustain.toString();
            var release = (0.4 + _this.rand(0.8));
            _this.htmlReleaseTime.value = release.toString();
            _this.htmlAttackPunchVolume.value = (1.1 + Math.random()).toString();
            var time = sustain + release - 0.002;
            _this.htmlDelayFrequencyMult.value = "0";
            _this.htmlDelayFrequencyStartTimePct.value = "0";
            if (_this.rand(3) > 1) {
                _this.htmlVibratoFrequency.value = Math.floor(_this.rand(2, 25)).toString();
                _this.htmlVibratoTime.value = "1";
                _this.htmlVibratoShiftTime.value = "0";
                _this.htmlVibratoWave.value = _this.ArrRand(['sawtooth',
                    'triangle',
                    'sine',
                    'square']);
                _this.htmlDutyCycleLength.value = "0";
                _this.htmlDutyCyclePct.value = "0";
            }
            else {
                _this.htmlVibratoFrequency.value = '0';
                _this.htmlVibratoTime.value = "0";
                _this.htmlVibratoShiftTime.value = "0";
                _this.htmlVibratoWave.value = 'square';
                _this.htmlDutyCycleLength.value = _this.rand(time / 10).toString();
                _this.htmlDutyCyclePct.value = _this.rand(0.1, 0.2).toString();
                ;
            }
            _this.htmlFlangeDelayTime.value = "0";
            _this.htmlFlangeFeedbackVolume.value = "0";
            _this.htmlGain.value = "1";
            _this.play();
            //        this.htmlDistortion.value = "0";
        };
        this.notes = [7902.13, 7458.62, 7040.00, 6644.88, 6271.93, 5919.91,
            5587.65, 5274.04, 4978.03, 4698.64, 4434.92, 4186.01,
            3951.07, 3729.31, 3520.00, 3322.44, 3135.96, 2959.96,
            2793.83, 2637.02, 2489.02, 2349.32, 2217.46, 2093.00,
            1975.53, 1864.66, 1760.00, 1661.22, 1567.98, 1479.98,
            1396.91, 1318.51, 1244.51, 1174.66, 1108.73, 1046.50,
            987.767, 932.328, 880.000, 830.609, 783.991,
            698.456, 659.255, 622.254, 587.330, 554.365, 523.251,
            493.883, 466.164, 440.000, 415.305, 391.995, 369.994,
            349.228, 329.628, 311.127, 293.665, 277.183, 261.626,
            246.942, 233.082, 220.000, 207.652, 195.998, 184.997,
            174.614, 164.814, 155.563, 146.832, 138.591, 130.813,
            123.471, 116.541, 110.000, 103.826, 97.9989, 92.4986,
            87.3071, 82.4069, 77.7817, 73.4162, 69.2957, 65.4064,
            61.7354, 58.2705, 55.0000, 51.9131, 48.9994, 46.2493,
            43.6535, 41.2034, 38.8909, 36.7081, 34.6478, 32.7032];
        this.GetElement = function (id) {
            return document.getElementById(id);
        };
        this.UpdateLoop = function () {
            setTimeout(_this.UpdateLoop, 100);
            if (_this.mouseDown == true) {
                return;
            }
            var wave_type = document.getElementById("waveType");
            var wave_select = document.getElementById("waveTypeVisual");
            for (var i = 0; i < wave_select.childNodes.length; i++) {
                wave_select.childNodes[i].style = "";
                if (wave_select.childNodes[i].id === wave_type.value) {
                    wave_select.childNodes[i].style = "background-color: orangered";
                }
            }
            var slide_type = document.getElementById("slideType");
            var slide_select = document.getElementById("slideTypeVisual");
            for (i = 0; i < slide_select.childNodes.length; i++) {
                slide_select.childNodes[i].style = "";
                if (slide_select.childNodes[i].id === slide_type.value) {
                    slide_select.childNodes[i].style = "background-color: orangered";
                }
            }
            var vibrato_type = document.getElementById("vibratoWave");
            var vibrato_select = document.getElementById("vibratoWaveVisual");
            for (i = 0; i < vibrato_select.childNodes.length; i++) {
                vibrato_select.childNodes[i].style = "";
                if (vibrato_select.childNodes[i].id === "v" + vibrato_type.value) {
                    vibrato_select.childNodes[i].style = "background-color: orangered";
                }
            }
            _this.SyncSliders();
            /*
                        this.GetElement("frequencySlider").value = this.GetElement("frequency").value;
                        this.GetElement("frequencySlideSlider").value = this.GetElement("frequencySlide").value;
                        this.GetElement("delayFrequencyStartTimePctSlider").value = this.GetElement("delayFrequencyStartTimePct").value;
                        this.GetElement("delayFrequencyMultSlider").value = this.GetElement("delayFrequencyMult").value;
                        this.GetElement("vibratoTimeSlider").value = this.GetElement("vibratoTime").value;
                        this.GetElement("vibratoTimeSlider").value = this.GetElement("vibratoTime").value;
                        this.GetElement("vibratoFrequencySlider").value = this.GetElement("vibratoFrequency").value;
                        this.GetElement("vibratoShiftTimeSlider").value = this.GetElement("vibratoShiftTime").value;
                        this.GetElement("lowPassFrequencySlider").value = this.GetElement("lowPassFrequency").value;
                        this.GetElement("lowPassFrequencyRampSlider").value = this.GetElement("lowPassFrequencyRamp").value;
                        this.GetElement("hiPassFrequencySlider").value = this.GetElement("hiPassFrequency").value;
                        this.GetElement("attackTimeSlider").value = this.GetElement("attackTime").value;
                        this.GetElement("decayTimeSlider").value = this.GetElement("decayTime").value;
                        this.GetElement("sustainTimeSlider").value = this.GetElement("sustainTime").value;
                        this.GetElement("releaseTimeSlider").value = this.GetElement("releaseTime").value;
                        this.GetElement("attackPunchVolumeSlider").value = this.GetElement("attackPunchVolume").value;
                        this.GetElement("flangeDelayTimeSlider").value = this.GetElement("flangeDelayTime").value;
                        this.GetElement("flangeFeedbackVolumeSlider").value = this.GetElement("flangeFeedbackVolume").value;
                        this.GetElement("dutyCycleLengthSlider").value = this.GetElement("dutyCycleLength").value;
                        this.GetElement("dutyCyclePctSlider").value = this.GetElement("dutyCyclePct").value;
                        this.GetElement("noiseDetuneSlider").value = this.GetElement("noiseDetune").value;
                        this.GetElement("noiseDetuneSlideSlider").value = this.GetElement("noiseDetuneSlide").value;
                        this.GetElement("gainSlider").value = this.GetElement("gain").value;
              */
        };
        /*
                public SyncElements = ( element: any, id: string ): void => {
                    var element_2: any = this.GetElement(id);
                    if( element.value !== element_2.value ) {
                        element_2.value = element.value;
                    }
                }
        */
        this.SlideClick = function (slide) {
            var slide_select = document.getElementById("slideTypeVisual");
            for (var i = 0; i < slide_select.childNodes.length; i++) {
                slide_select.childNodes[i].style = "";
            }
            slide.style = "background-color: orangered";
            var slide_type = document.getElementById("slideType");
            for (i = 0; i < slide_type.childNodes.length; i++) {
                if (slide_type.childNodes[i].value === slide.id) {
                    slide_type.childNodes[i].selected = true;
                }
                else {
                    slide_type.childNodes[i].selected = false;
                }
            }
        };
        this.VibratoWaveClick = function (wave) {
            var wave_select = document.getElementById("vibratoWaveVisual");
            for (var i = 0; i < wave_select.childNodes.length; i++) {
                wave_select.childNodes[i].style = "";
            }
            wave.style = "background-color: orangered";
            var wave_type = document.getElementById("vibratoWave");
            for (i = 0; i < wave_type.childNodes.length; i++) {
                if ("v" + wave_type.childNodes[i].value === wave.id) {
                    wave_type.childNodes[i].selected = true;
                }
                else {
                    wave_type.childNodes[i].selected = false;
                }
            }
        };
        this.play = function () {
            _this.ResetValues();
            SFXWeb.SN.PlaySound();
            _this.htmlCodeArea.select();
            document.execCommand("Copy");
        };
        if (InterfaceManager.SN != null) {
            console.log("returning");
            return;
        }
        InterfaceManager.SN = this;
        this.def = new SFXDef();
        this.htmlWaveType = document.getElementById("waveType");
        this.htmlFrequency = document.getElementById("frequency");
        this.htmlFrequencySlider = document.getElementById("frequencySlider");
        this.htmlDelayFrequencyStartTimePct = document.getElementById("delayFrequencyStartTimePct");
        this.htmlDelayFrequencyMult = document.getElementById("delayFrequencyMult");
        this.htmlVibratoTime = document.getElementById("vibratoTime");
        this.htmlVibratoShiftTime = document.getElementById("vibratoShiftTime");
        this.htmlVibratoFrequency = document.getElementById("vibratoFrequency");
        this.htmlVibratoWave = document.getElementById("vibratoWave");
        this.htmlLowPassFrequency = document.getElementById("lowPassFrequency");
        this.htmlLowPassFrequencyRamp = document.getElementById("lowPassFrequencyRamp");
        this.htmlHiPassFrequency = document.getElementById("hiPassFrequency");
        this.htmlAttackTime = document.getElementById("attackTime");
        this.htmlDecayTime = document.getElementById("decayTime");
        this.htmlSustainTime = document.getElementById("sustainTime");
        this.htmlReleaseTime = document.getElementById("releaseTime");
        this.htmlAttackPunchVolume = document.getElementById("attackPunchVolume"); // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
        this.htmlDutyCycleLength = document.getElementById("dutyCycleLength");
        this.htmlDutyCyclePct = document.getElementById("dutyCyclePct");
        this.htmlFlangeDelayTime = document.getElementById("flangeDelayTime");
        this.htmlFlangeFeedbackVolume = document.getElementById("flangeFeedbackVolume");
        this.htmlGain = document.getElementById("gain");
        this.htmlDistortion = document.getElementById("distortion");
        this.htmlNoiseDetune = document.getElementById("noiseDetune");
        this.htmlNoiseDetuneSlide = document.getElementById("noiseDetuneSlide");
        this.htmlSlideType = document.getElementById("slideType");
        this.htmlFrequencySlide = document.getElementById("frequencySlide");
        this.htmlFrequencySlideSlider = document.getElementById("frequencySlideSlider");
        this.htmlDelayFrequencyStartTimePctSlider = document.getElementById("delayFrequencyStartTimePctSlider");
        this.htmlDelayFrequencyMultSlider = document.getElementById("delayFrequencyMultSlider");
        this.htmlVibratoTimeSlider = document.getElementById("vibratoTimeSlider");
        this.htmlVibratoFrequencySlider = document.getElementById("vibratoFrequencySlider");
        this.htmlVibratoShiftTimeSlider = document.getElementById("vibratoShiftTimeSlider");
        this.htmlLowPassFrequencySlider = document.getElementById("lowPassFrequencySlider");
        this.htmlLowPassFrequencyRampSlider = document.getElementById("lowPassFrequencyRampSlider");
        this.htmlHiPassFrequencySlider = document.getElementById("hiPassFrequencySlider");
        this.htmlAttackTimeSlider = document.getElementById("attackTimeSlider");
        this.htmlDecayTimeSlider = document.getElementById("decayTimeSlider");
        this.htmlSustainTimeSlider = document.getElementById("sustainTimeSlider");
        this.htmlReleaseTimeSlider = document.getElementById("releaseTimeSlider");
        this.htmlAttackPunchVolumeSlider = document.getElementById("attackPunchVolumeSlider");
        this.htmlFlangeDelayTimeSlider = document.getElementById("flangeDelayTimeSlider");
        this.htmlFlangeFeedbackVolumeSlider = document.getElementById("flangeFeedbackVolumeSlider");
        this.htmlDutyCycleLengthSlider = document.getElementById("dutyCycleLengthSlider");
        this.htmlDutyCyclePctSlider = document.getElementById("dutyCyclePctSlider");
        this.htmlNoiseDetuneSlider = document.getElementById("noiseDetuneSlider");
        this.htmlNoiseDetuneSlideSlider = document.getElementById("noiseDetuneSlideSlider");
        this.htmlGainSlider = document.getElementById("gainSlider");
        this.htmlCodeArea = document.getElementById("codearea");
        this.ResetValues();
        this.UpdateLoop();
    }
    InterfaceManager.prototype.WaveClick = function (wave) {
        var wave_select = document.getElementById("waveTypeVisual");
        for (var i = 0; i < wave_select.childNodes.length; i++) {
            wave_select.childNodes[i].style = "";
        }
        wave.style = "background-color: orangered";
        var wave_type = document.getElementById("waveType");
        for (i = 0; i < wave_type.childNodes.length; i++) {
            if (wave_type.childNodes[i].value === wave.id) {
                wave_type.childNodes[i].selected = true;
            }
            else {
                wave_type.childNodes[i].selected = false;
            }
        }
    };
    InterfaceManager.SN = null;
    return InterfaceManager;
}());
/*
JSON.parse(`
            {
                "waveType": "noise",
                "frequency": 440,
                "frequencySlide": 0,
                "delayFrequencyStartTimePct": 0,
                "delayFrequencyMult": 0,
                "vibratoTime": 0,
                "vibratoShiftTime": 0,
                "vibratoFrequency": 0,
                "vibratoWave": "sine",
                "lowPassFrequency": 1958,
                "lowPassFrequencyRamp": 868,
                "hiPassFrequency": 0,
                "attackTime": 0.001,
                "decayTime": 0.03807236877997555,
                "sustainTime": 0.06833384273389372,
                "releaseTime": 0.5009375917961456,
                "attackPunchVolume": 2.087807113875796,
                "dutyCycleLength": 0.01835841355003912,
                "dutyCyclePct": 0.43791962064478795,
                "flangeDelayTime": 0,
                "flangeFeedbackVolume": 0,
                "gain": 1,
                "distortion": 0,
                "noiseDetune": -14,
                "noiseDetuneSlide": -18,
                "slideType": "linear"
            }
            `)
*/ 

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRldi9TRlhEZWYudHMiLCJkZXYvU0ZYV2ViLnRzIiwiZGV2L2ludGVyZmFjZS9FbnZlbG9wZS50cyIsImRldi9pbnRlcmZhY2UvSW50ZXJmYWNlTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxpRUFBaUU7QUFDakUsaUVBQWlFO0FBQ2pFLGlFQUFpRTtBQUNqRTtJQUFBO1FBQ1csYUFBUSxHQUFXLFFBQVEsQ0FBQztRQUM1QixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBQzNCLCtCQUEwQixHQUFXLENBQUMsQ0FBQztRQUN2Qyx1QkFBa0IsR0FBVyxDQUFDLENBQUM7UUFFL0IsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFDeEIscUJBQWdCLEdBQVcsQ0FBQyxDQUFDO1FBQzdCLHFCQUFnQixHQUFXLENBQUMsQ0FBQztRQUM3QixnQkFBVyxHQUFXLE1BQU0sQ0FBQztRQUM3QixxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUFDN0IseUJBQW9CLEdBQVcsQ0FBQyxDQUFDO1FBQ2pDLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBQzVCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFDdkIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixzQkFBaUIsR0FBVyxDQUFDLENBQUMsQ0FBQyx1REFBdUQ7UUFDdEYsb0JBQWUsR0FBVyxDQUFDLENBQUM7UUFDNUIsaUJBQVksR0FBVyxHQUFHLENBQUM7UUFDM0Isb0JBQWUsR0FBVyxJQUFJLENBQUM7UUFDL0IseUJBQW9CLEdBQVcsR0FBRyxDQUFDO1FBQ25DLFNBQUksR0FBVyxDQUFDLENBQUM7UUFDakIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUFDN0IsY0FBUyxHQUFXLFFB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USxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQywwQkFBMEIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyw4QkFBOEIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQzlHLElBQUksQ0FBQyx5QkFBeUIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3BHLElBQUksQ0FBQyxvQkFBb0IsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxtQkFBbUIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3hGLElBQUksQ0FBQyxxQkFBcUIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzVGLElBQUksQ0FBQyxxQkFBcUIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzVGLElBQUksQ0FBQywyQkFBMkIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3hHLElBQUksQ0FBQyx5QkFBeUIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3BHLElBQUksQ0FBQyw4QkFBOEIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQzlHLElBQUksQ0FBQyx5QkFBeUIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3BHLElBQUksQ0FBQyxzQkFBc0IsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzlGLElBQUksQ0FBQyxxQkFBcUIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzVGLElBQUksQ0FBQywwQkFBMEIsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxjQUFjLEdBQXFCLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFOUUsSUFBSSxDQUFDLFlBQVksR0FBd0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU3RSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBRXRCLENBQUM7SUFrdEJNLG9DQUFTLEdBQWhCLFVBQWlCLElBQVM7UUFDdEIsSUFBSSxXQUFXLEdBQVEsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM3RCxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDekMsQ0FBQztRQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsNkJBQTZCLENBQUM7UUFFM0MsSUFBSSxTQUFTLEdBQVEsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9DLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDNUMsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNGLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUM3QyxDQUFDO1FBQ0wsQ0FBQztJQUVMLENBQUM7SUE5MUJhLG1CQUFFLEdBQXFCLElBQUksQ0FBQztJQTQzQjlDLHVCQUFDO0NBLzNCRCxBQSszQkMsSUFBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBK0JFIiwiZmlsZSI6ImludGVyZmFjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiBTRlhEZWYgaXMgYSBjbGFzcyB1c2VkIHRvIGRlZmluZSBhIHNvdW5kIGVmZmVjdCB0byBnZW5lcmF0ZSAqL1xyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5jbGFzcyBTRlhEZWYge1xyXG4gICAgcHVibGljIHdhdmVUeXBlOiBzdHJpbmcgPSAnc3F1YXJlJztcclxuICAgIHB1YmxpYyBmcmVxdWVuY3k6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgZnJlcXVlbmN5U2xpZGU6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgZGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3Q6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgZGVsYXlGcmVxdWVuY3lNdWx0OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyB2aWJyYXRvVGltZTogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyB2aWJyYXRvU2hpZnRUaW1lOiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIHZpYnJhdG9GcmVxdWVuY3k6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgdmlicmF0b1dhdmU6IHN0cmluZyA9IFwic2luZVwiO1xyXG4gICAgcHVibGljIGxvd1Bhc3NGcmVxdWVuY3k6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgbG93UGFzc0ZyZXF1ZW5jeVJhbXA6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgaGlQYXNzRnJlcXVlbmN5OiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIGF0dGFja1RpbWU6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgZGVjYXlUaW1lOiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIHN1c3RhaW5UaW1lOiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIHJlbGVhc2VUaW1lOiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIGF0dGFja1B1bmNoVm9sdW1lOiBudW1iZXIgPSAwOyAvLyBJIFRISU5LIFRISVMgV0lMTCBORUVEIFRPIEJFIENIQU5HRUQgVE8gQVRUQUNLIFBVTkNIXHJcbiAgICBwdWJsaWMgZHV0eUN5Y2xlTGVuZ3RoOiBudW1iZXIgPSAxO1xyXG4gICAgcHVibGljIGR1dHlDeWNsZVBjdDogbnVtYmVyID0gMC41O1xyXG4gICAgcHVibGljIGZsYW5nZURlbGF5VGltZTogbnVtYmVyID0gMC4wMTtcclxuICAgIHB1YmxpYyBmbGFuZ2VGZWVkYmFja1ZvbHVtZTogbnVtYmVyID0gMC4zO1xyXG4gICAgcHVibGljIGdhaW46IG51bWJlciA9IDE7XHJcbiAgICBwdWJsaWMgZGlzdG9ydGlvbjogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBub2lzZURldHVuZTogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBub2lzZURldHVuZVNsaWRlOiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIHNsaWRlVHlwZTogc3RyaW5nID0gXCJsaW5lYXJcIjtcclxufSIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbi8qIENyZWF0ZWQgYnkgUmljayBCYXR0YWdsaW5lIGF0IGVtYmVkIGxpbWl0ZWQuICB3d3cuZW1iZWQuY29tICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbig8YW55PndpbmRvdykuQXVkaW9Db250ZXh0ID0gKDxhbnk+d2luZG93KS5BdWRpb0NvbnRleHQgfHxcclxuICAgICg8YW55PndpbmRvdykud2Via2l0QXVkaW9Db250ZXh0IHx8XHJcbiAgICAoPGFueT53aW5kb3cpLm1vekF1ZGlvQ29udGV4dCB8fFxyXG4gICAgKDxhbnk+d2luZG93KS5vQXVkaW9Db250ZXh0IHx8XHJcbiAgICAoPGFueT53aW5kb3cpLm1zQXVkaW9Db250ZXh0O1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbi8qIFNGWFdlYiBpcyBhIGNsYXNzIHVzZWQgdG8gZ2VuZXJhdGUgc291bmQgZWZmZWN0cyBpbiAgICAgICAqL1xyXG4vKiBkdXJpbmcgZ2FtZSBwbGF5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbmNsYXNzIFNGWFdlYiB7XHJcbiAgICBwdWJsaWMgc3RhdGljIFNOOiBTRlhXZWI7XHJcbiAgICBwdWJsaWMgc3RhdGljIFRXT19QSTogbnVtYmVyID0gTWF0aC5QSSAqIDI7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBBQ1RYOiBBdWRpb0NvbnRleHQ7XHJcblxyXG4gICAgcHVibGljIGRlZjogU0ZYRGVmO1xyXG4gICAgcHVibGljIG1hc3RlclZvbHVtZTogbnVtYmVyID0gMTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBpZiAoU0ZYV2ViLlNOICE9IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBTRlhXZWIuU04gPSB0aGlzO1xyXG4gICAgICAgIFNGWFdlYi5BQ1RYID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBTZXREZWYgPSAoZGVmOiBTRlhEZWYpOiB2b2lkID0+IHtcclxuICAgICAgICB0aGlzLmRlZiA9IGRlZjtcclxuICAgIH1cclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qIFBsYXkgYSBzb3VuZCBiYXNlZCBvbiB0aGUgZGVmaW5pdGlvbiwgb3IgaWYgbm8gZGVmaW5pdGlvbiAqL1xyXG4gICAgLyogaXMgcGFzc2VkIGluLCBwbGF5IHRoZSBsYXN0IGRlZmluaXRpb24gdXNlZC4gICAgICAgICAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIHB1YmxpYyBQbGF5U291bmQgPSAoZGVmOiBTRlhEZWYgPSBudWxsKTogdm9pZCA9PiB7XHJcbiAgICAgICAgaWYgKGRlZiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVmID0gZGVmO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGNvbnRleHQ6IEF1ZGlvQ29udGV4dCA9IFNGWFdlYi5BQ1RYO1xyXG4gICAgICAgIHZhciB0aW1lOiBudW1iZXIgPSB0aGlzLmRlZi5hdHRhY2tUaW1lICsgdGhpcy5kZWYuZGVjYXlUaW1lICsgdGhpcy5kZWYuc3VzdGFpblRpbWUgKyB0aGlzLmRlZi5yZWxlYXNlVGltZTtcclxuXHJcbiAgICAgICAgLy8gbm9pc2Ugd2F2ZVR5cGUgZG9lcyBub3QgdXNlIGEgb3NjaWxsYXRvciwgYnV0IGdlbmVyYXRlcyByYW5kb20gbm9pc2UgaW4gYSBzb3VuZCBidWZmZXIuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVmLndhdmVUeXBlID09ICdub2lzZScpIHtcclxuICAgICAgICAgICAgdmFyIG5vaXNlX2J1ZmZlcjogQXVkaW9CdWZmZXJTb3VyY2VOb2RlID0gdGhpcy5Ob2lzZSgpO1xyXG5cclxuICAgICAgICAgICAgbm9pc2VfYnVmZmVyLmRldHVuZS5zZXRWYWx1ZUF0VGltZSh0aGlzLmRlZi5ub2lzZURldHVuZSAqIDEwMCwgY29udGV4dC5jdXJyZW50VGltZSk7XHJcbiAgICAgICAgICAgIG5vaXNlX2J1ZmZlci5kZXR1bmUubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5kZWYubm9pc2VEZXR1bmVTbGlkZSAqIDEwMCwgY29udGV4dC5jdXJyZW50VGltZSArIHRpbWUpO1xyXG4gICAgICAgICAgICB2YXIgZ2Fpbl9ub2RlOiBHYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgICAgICAgICBnYWluX25vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmRlZi5nYWluLCBjb250ZXh0LmN1cnJlbnRUaW1lKTtcclxuICAgICAgICAgICAgbm9pc2VfYnVmZmVyLmNvbm5lY3QoZ2Fpbl9ub2RlKTtcclxuICAgICAgICAgICAgdmFyIGF1ZGlvOiBBdWRpb05vZGUgPSBnYWluX25vZGU7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWYuaGlQYXNzRnJlcXVlbmN5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYXVkaW8gPSB0aGlzLkhpZ2hQYXNzRmlsdGVyKHRoaXMuZGVmLmhpUGFzc0ZyZXF1ZW5jeSwgdGltZSwgYXVkaW8pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWYubG93UGFzc0ZyZXF1ZW5jeSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGF1ZGlvID0gdGhpcy5Mb3dQYXNzRmlsdGVyKHRoaXMuZGVmLmxvd1Bhc3NGcmVxdWVuY3ksIHRpbWUsIGF1ZGlvLCB0aGlzLmRlZi5sb3dQYXNzRnJlcXVlbmN5UmFtcCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZi5kdXR5Q3ljbGVMZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHV0eV9jeWNsZTogR2Fpbk5vZGUgPSB0aGlzLkR1dHlDeWNsZSh0aGlzLmRlZi5kdXR5Q3ljbGVMZW5ndGgsIHRoaXMuZGVmLmR1dHlDeWNsZVBjdCwgdGltZSk7XHJcbiAgICAgICAgICAgICAgICBhdWRpby5jb25uZWN0KGR1dHlfY3ljbGUpO1xyXG4gICAgICAgICAgICAgICAgYXVkaW8gPSBkdXR5X2N5Y2xlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZmxhbmdlOiBBdWRpb05vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWYuZmxhbmdlRGVsYXlUaW1lID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZmxhbmdlID0gdGhpcy5GbGFuZ2UodGhpcy5kZWYuZmxhbmdlRGVsYXlUaW1lLCB0aGlzLmRlZi5mbGFuZ2VGZWVkYmFja1ZvbHVtZSwgYXVkaW8pO1xyXG4gICAgICAgICAgICAgICAgZmxhbmdlLmNvbm5lY3QoYXVkaW8pO1xyXG4gICAgICAgICAgICAgICAgLy8gIE5PVCBTVVJFIFRISVMgSVMgUklHSFQuLi4gVEhJUyBXQVNOJ1QgSEVSRVxyXG4gICAgICAgICAgICAgICAgYXVkaW8gPSBmbGFuZ2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZi52aWJyYXRvVGltZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciB2aWJyYXRvX2dhaW46IEdhaW5Ob2RlID0gdGhpcy5WaWJyYXRvKFNGWFdlYi5HRVRfT1NDX0ZST01fU1RSSU5HKHRoaXMuZGVmLnZpYnJhdG9XYXZlKSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZi52aWJyYXRvRnJlcXVlbmN5LCB0aGlzLmRlZi52aWJyYXRvU2hpZnRUaW1lICogdGltZSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZi52aWJyYXRvVGltZSAqIHRpbWUpO1xyXG4gICAgICAgICAgICAgICAgYXVkaW8uY29ubmVjdCh2aWJyYXRvX2dhaW4pO1xyXG4gICAgICAgICAgICAgICAgYXVkaW8gPSB2aWJyYXRvX2dhaW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBlbnZlbG9wZTogR2Fpbk5vZGUgPSB0aGlzLkVudmVsb3BlKHRoaXMuZGVmLmF0dGFja1RpbWUsIHRoaXMuZGVmLmRlY2F5VGltZSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmLnN1c3RhaW5UaW1lLCB0aGlzLmRlZi5yZWxlYXNlVGltZSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmLmF0dGFja1B1bmNoVm9sdW1lKTtcclxuXHJcbiAgICAgICAgICAgIGF1ZGlvLmNvbm5lY3QoZW52ZWxvcGUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1hc3Rlcl92b2x1bWVfZ2FpbjogR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgICAgICAgICAgbWFzdGVyX3ZvbHVtZV9nYWluLmdhaW4udmFsdWUgPSB0aGlzLm1hc3RlclZvbHVtZTtcclxuICAgICAgICAgICAgZW52ZWxvcGUuY29ubmVjdChtYXN0ZXJfdm9sdW1lX2dhaW4pO1xyXG5cclxuICAgICAgICAgICAgbWFzdGVyX3ZvbHVtZV9nYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XHJcblxyXG4gICAgICAgICAgICBub2lzZV9idWZmZXIuc3RhcnQoKTtcclxuICAgICAgICAgICAgbm9pc2VfYnVmZmVyLnN0b3AoY29udGV4dC5jdXJyZW50VGltZSArIHRpbWUpXHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgb3NjX3R5cGU6IE9zY2lsbGF0b3JUeXBlID0gU0ZYV2ViLkdFVF9PU0NfRlJPTV9TVFJJTkcodGhpcy5kZWYud2F2ZVR5cGUpO1xyXG5cclxuICAgICAgICB2YXIgdG9uZTogT3NjaWxsYXRvck5vZGUgPSB0aGlzLk9zY2lsbGF0b3JUb25lKHRoaXMuZGVmLmZyZXF1ZW5jeSwgb3NjX3R5cGUpO1xyXG5cclxuICAgICAgICB2YXIgYXVkaW86IEF1ZGlvTm9kZSA9IHRvbmU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRlZi5mcmVxdWVuY3lTbGlkZSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZi5kZWxheUZyZXF1ZW5jeVN0YXJ0VGltZVBjdCAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkZyZXF1ZW5jeVNsaWRlKHRoaXMuZGVmLmZyZXF1ZW5jeVNsaWRlLCB0aGlzLmRlZi5kZWxheUZyZXF1ZW5jeVN0YXJ0VGltZVBjdCwgdG9uZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkRlbGF5ZWRGcmVxdWVuY3lTbGlkZSh0aGlzLmRlZi5mcmVxdWVuY3lTbGlkZSwgdGhpcy5kZWYuZGVsYXlGcmVxdWVuY3lNdWx0LFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmLmRlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0LCB0aW1lLCB0b25lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuRnJlcXVlbmN5U2xpZGUodGhpcy5kZWYuZnJlcXVlbmN5U2xpZGUsIHRpbWUsIHRvbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZGVmLmRlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0ICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5EZWxheWVkRnJlcXVlbmN5U2xpZGUodGhpcy5kZWYuZnJlcXVlbmN5LCB0aGlzLmRlZi5kZWxheUZyZXF1ZW5jeU11bHQsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZi5kZWxheUZyZXF1ZW5jeVN0YXJ0VGltZVBjdCwgdGltZSwgdG9uZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kZWYuaGlQYXNzRnJlcXVlbmN5ID4gMCkge1xyXG4gICAgICAgICAgICBhdWRpbyA9IHRoaXMuSGlnaFBhc3NGaWx0ZXIodGhpcy5kZWYuaGlQYXNzRnJlcXVlbmN5LCB0aW1lLCB0b25lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRlZi5sb3dQYXNzRnJlcXVlbmN5ID4gMCkge1xyXG4gICAgICAgICAgICBhdWRpbyA9IHRoaXMuTG93UGFzc0ZpbHRlcih0aGlzLmRlZi5sb3dQYXNzRnJlcXVlbmN5LCB0aW1lLCB0b25lLCB0aGlzLmRlZi5sb3dQYXNzRnJlcXVlbmN5UmFtcCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZ2Fpbl9ub2RlOiBHYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgICAgIGdhaW5fbm9kZS5nYWluLnZhbHVlID0gdGhpcy5kZWYuZ2FpbjtcclxuICAgICAgICBhdWRpby5jb25uZWN0KGdhaW5fbm9kZSk7XHJcbiAgICAgICAgYXVkaW8gPSBnYWluX25vZGU7XHJcblxyXG4gICAgICAgIHZhciBlbnZlbG9wZTogR2Fpbk5vZGUgPSB0aGlzLkVudmVsb3BlKHRoaXMuZGVmLmF0dGFja1RpbWUsIHRoaXMuZGVmLmRlY2F5VGltZSxcclxuICAgICAgICAgICAgdGhpcy5kZWYuc3VzdGFpblRpbWUsIHRoaXMuZGVmLnJlbGVhc2VUaW1lLFxyXG4gICAgICAgICAgICB0aGlzLmRlZi5hdHRhY2tQdW5jaFZvbHVtZSk7XHJcblxyXG4gICAgICAgIGF1ZGlvLmNvbm5lY3QoZW52ZWxvcGUpO1xyXG4gICAgICAgIGF1ZGlvID0gZW52ZWxvcGU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRlZi5kdXR5Q3ljbGVMZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBkdXR5X2N5Y2xlOiBHYWluTm9kZSA9IHRoaXMuRHV0eUN5Y2xlKHRoaXMuZGVmLmR1dHlDeWNsZUxlbmd0aCwgdGhpcy5kZWYuZHV0eUN5Y2xlUGN0LCB0aW1lKTtcclxuICAgICAgICAgICAgYXVkaW8uY29ubmVjdChkdXR5X2N5Y2xlKTtcclxuICAgICAgICAgICAgYXVkaW8gPSBkdXR5X2N5Y2xlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGZsYW5nZTogQXVkaW9Ob2RlID0gbnVsbDtcclxuICAgICAgICBpZiAodGhpcy5kZWYuZmxhbmdlRGVsYXlUaW1lID4gMCkge1xyXG4gICAgICAgICAgICBmbGFuZ2UgPSB0aGlzLkZsYW5nZSh0aGlzLmRlZi5mbGFuZ2VEZWxheVRpbWUsIHRoaXMuZGVmLmZsYW5nZUZlZWRiYWNrVm9sdW1lLCBhdWRpbyk7XHJcbiAgICAgICAgICAgIGZsYW5nZS5jb25uZWN0KGF1ZGlvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRlZi52aWJyYXRvVGltZSA+IDApIHtcclxuICAgICAgICAgICAgdmFyIHZpYnJhdG9fZ2FpbjogR2Fpbk5vZGUgPSB0aGlzLlZpYnJhdG8oU0ZYV2ViLkdFVF9PU0NfRlJPTV9TVFJJTkcodGhpcy5kZWYudmlicmF0b1dhdmUpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWYudmlicmF0b0ZyZXF1ZW5jeSwgdGhpcy5kZWYudmlicmF0b1NoaWZ0VGltZSAqIHRpbWUsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZi52aWJyYXRvVGltZSAqIHRpbWUpO1xyXG5cclxuICAgICAgICAgICAgYXVkaW8uY29ubmVjdCh2aWJyYXRvX2dhaW4pO1xyXG4gICAgICAgICAgICBhdWRpbyA9IHZpYnJhdG9fZ2FpbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBtYXN0ZXJfdm9sdW1lX2dhaW46IEdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICAgICAgbWFzdGVyX3ZvbHVtZV9nYWluLmdhaW4udmFsdWUgPSB0aGlzLm1hc3RlclZvbHVtZTtcclxuICAgICAgICBhdWRpby5jb25uZWN0KG1hc3Rlcl92b2x1bWVfZ2Fpbik7XHJcblxyXG4gICAgICAgIG1hc3Rlcl92b2x1bWVfZ2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xyXG5cclxuICAgICAgICB0b25lLnN0YXJ0KCk7XHJcbiAgICAgICAgdG9uZS5zdG9wKGNvbnRleHQuY3VycmVudFRpbWUgKyB0aW1lKTtcclxuICAgIH1cclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qIFRoaXMgc3RhdGljIG1ldGhvZCBjb252ZXJ0cyBhIHN0cmluZyB0byBhbiBPc2NpbGxhdG9yVHlwZSAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICBwdWJsaWMgc3RhdGljIEdFVF9PU0NfRlJPTV9TVFJJTkcod2F2ZV90eXBlOiBzdHJpbmcpOiBPc2NpbGxhdG9yVHlwZSB7XHJcbiAgICAgICAgaWYgKHdhdmVfdHlwZSA9PSAnc3F1YXJlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3NxdWFyZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHdhdmVfdHlwZSA9PSAnc2luZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdzaW5lJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAod2F2ZV90eXBlID09ICd0cmlhbmdsZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd0cmlhbmdsZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHdhdmVfdHlwZSA9PSAnc2F3dG9vdGgnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnc2F3dG9vdGgnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJ3NxdWFyZSc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiBPc2NpbGxhdG9yVG9uZSBjcmVhdGVzIHRoZSBvc2NpbGxhdG9yIG5vZGUgdGhhdCBpcyB0aGUgc3RhcnRpbmcgKi9cclxuICAgIC8qIHBvaW50IGZvciBhbGwgc291bmRzIG5vdCBiYXNlZCBvbiBub2lzZSAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICBwdWJsaWMgT3NjaWxsYXRvclRvbmUgPSAoZnJlcXVlbmN5OiBudW1iZXIsIHdhdmU6IE9zY2lsbGF0b3JUeXBlKTogT3NjaWxsYXRvck5vZGUgPT4ge1xyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuICAgICAgICB2YXIgdG9uZTogT3NjaWxsYXRvck5vZGUgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcclxuICAgICAgICB0b25lLnR5cGUgPSB3YXZlO1xyXG4gICAgICAgIHRvbmUuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKGZyZXF1ZW5jeSwgY29udGV4dC5jdXJyZW50VGltZSk7IC8vIHZhbHVlIGluIGhlcnR6XHJcblxyXG4gICAgICAgIHJldHVybiB0b25lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogRHV0eUN5Y2xlIGNyZWF0ZXMgYSBHYWluTm9kZSB0aGF0IGRyb3BzIHRoZSB2b2x1bWUgdG8gMCAgICovXHJcbiAgICAvKiBpbiBjeWNsZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHJpdmF0ZSBEdXR5Q3ljbGUgPSAoY3ljbGVfbGVuZ3RoOiBudW1iZXIsIGN5Y2xlX3BjdDogbnVtYmVyLCB0b3RhbF90aW1lOiBudW1iZXIpOiBHYWluTm9kZSA9PiB7XHJcbiAgICAgICAgdmFyIGNvbnRleHQ6IEF1ZGlvQ29udGV4dCA9IFNGWFdlYi5BQ1RYO1xyXG5cclxuICAgICAgICB2YXIgdDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgdmFyIHN0YXJ0X211dGU6IG51bWJlciA9ICgxLjAgLSBjeWNsZV9wY3QpICogY3ljbGVfbGVuZ3RoO1xyXG4gICAgICAgIHZhciBkdXR5X2N5Y2xlX25vZGU6IEdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICAgICAgZHV0eV9jeWNsZV9ub2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMSwgY29udGV4dC5jdXJyZW50VGltZSk7XHJcblxyXG4gICAgICAgIHdoaWxlICh0IDwgdG90YWxfdGltZSkge1xyXG4gICAgICAgICAgICBkdXR5X2N5Y2xlX25vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgxLCBjb250ZXh0LmN1cnJlbnRUaW1lICsgdCArIHN0YXJ0X211dGUgKiAwLjk4KTsvLyArIHN0YXJ0X211dGVcclxuICAgICAgICAgICAgZHV0eV9jeWNsZV9ub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgY29udGV4dC5jdXJyZW50VGltZSArIHQgKyBzdGFydF9tdXRlKTsvLyArIHN0YXJ0X211dGVcclxuICAgICAgICAgICAgZHV0eV9jeWNsZV9ub2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgY29udGV4dC5jdXJyZW50VGltZSArIHQgKyBjeWNsZV9sZW5ndGggKiAwLjk4KTtcclxuICAgICAgICAgICAgZHV0eV9jeWNsZV9ub2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMSwgY29udGV4dC5jdXJyZW50VGltZSArIHQgKyBjeWNsZV9sZW5ndGgpO1xyXG4gICAgICAgICAgICB0ICs9IGN5Y2xlX2xlbmd0aDsgLy9jeWNsZV9sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZHV0eV9jeWNsZV9ub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogSGlnaFBhc3NGaWx0ZXIgYWxsb3dzIGFsbCBmcmVxdWVuY2llcyBhYm92ZSBhIGNlcnRhaW4gICAgICovXHJcbiAgICAvKiB2YWx1ZSB0byBwYXNzIGFuZCBmaWx0ZXJzIG91dCBhbGwgbG93ZXIgZnJlcXVlbmNpZXMgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHJpdmF0ZSBIaWdoUGFzc0ZpbHRlciA9IChocGZfZnJlcXVlbmN5OiBudW1iZXIsIHRpbWU6IG51bWJlcixcclxuICAgICAgICBpbnB1dF9ub2RlOiBBdWRpb05vZGUpOiBBdWRpb05vZGUgPT4ge1xyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuXHJcbiAgICAgICAgdmFyIGhpZ2hQYXNzRmlsdGVyOiBCaXF1YWRGaWx0ZXJOb2RlID0gY29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcclxuICAgICAgICBoaWdoUGFzc0ZpbHRlci50eXBlID0gXCJoaWdocGFzc1wiO1xyXG4gICAgICAgIGhpZ2hQYXNzRmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IGhwZl9mcmVxdWVuY3k7XHJcblxyXG4gICAgICAgIGlucHV0X25vZGUuY29ubmVjdChoaWdoUGFzc0ZpbHRlcik7XHJcbiAgICAgICAgcmV0dXJuIGhpZ2hQYXNzRmlsdGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogTG93UGFzc0ZpbHRlciBhbGxvd3MgYWxsIGZyZXF1ZW5jaWVzIGJlbG93IGEgY2VydGFpbiAgICAgICovXHJcbiAgICAvKiB2YWx1ZSB0byBwYXNzIGFuZCBmaWx0ZXJzIG91dCBhbGwgaGlnaGVyIGZyZXF1ZW5jaWVzICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHJpdmF0ZSBMb3dQYXNzRmlsdGVyID0gKGxwZl9mcmVxdWVuY3k6IG51bWJlciwgdGltZTogbnVtYmVyLFxyXG4gICAgICAgIGlucHV0X25vZGU6IEF1ZGlvTm9kZSwgcmFtcF9mcmVxdWVuY3k6IG51bWJlciA9IDApOiBBdWRpb05vZGUgPT4ge1xyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuXHJcbiAgICAgICAgdmFyIGxvd1Bhc3NGaWx0ZXI6IEJpcXVhZEZpbHRlck5vZGUgPSBjb250ZXh0LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgICAgIGxvd1Bhc3NGaWx0ZXIudHlwZSA9IFwibG93cGFzc1wiO1xyXG4gICAgICAgIGxvd1Bhc3NGaWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gbHBmX2ZyZXF1ZW5jeTtcclxuXHJcbiAgICAgICAgaWYgKHJhbXBfZnJlcXVlbmN5ICE9IDApIHtcclxuICAgICAgICAgICAgbG93UGFzc0ZpbHRlci5mcmVxdWVuY3kubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUocmFtcF9mcmVxdWVuY3ksIGNvbnRleHQuY3VycmVudFRpbWUgKyB0aW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlucHV0X25vZGUuY29ubmVjdChsb3dQYXNzRmlsdGVyKTtcclxuICAgICAgICByZXR1cm4gbG93UGFzc0ZpbHRlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qIERlbGF5ZWRGcmVxdWVuY3lTbGlkZSB3YWl0cyBhIGNlcnRhaW4gcGVyaW9kIG9mIHRpbWUgYW5kICAqL1xyXG4gICAgLyogdGhlbiBzbGlkZXMgdGhlIGZyZXF1ZW5jeSBvZiB0aGUgb3NjaWxsdG9yIHRvIGEgZGlmZmVyZW50ICovXHJcbiAgICAvKiB2YWx1ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHJpdmF0ZSBEZWxheWVkRnJlcXVlbmN5U2xpZGUgPSAoZnJlcXVlbmN5OiBudW1iZXIsIGZyZXF1ZW5jeV9tdWx0OiBudW1iZXIsIGRlbGF5X3N0YXJ0OiBudW1iZXIsIGVuZF90aW1lOiBudW1iZXIsXHJcbiAgICAgICAgaW5wdXRfbm9kZTogT3NjaWxsYXRvck5vZGUpOiBPc2NpbGxhdG9yTm9kZSA9PiB7XHJcbiAgICAgICAgdmFyIGNvbnRleHQ6IEF1ZGlvQ29udGV4dCA9IFNGWFdlYi5BQ1RYO1xyXG5cclxuICAgICAgICBpbnB1dF9ub2RlLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZShmcmVxdWVuY3ksIGNvbnRleHQuY3VycmVudFRpbWUgKyBkZWxheV9zdGFydCk7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVmLnNsaWRlVHlwZSA9PSAnbGluZWFyJykge1xyXG4gICAgICAgICAgICBpbnB1dF9ub2RlLmZyZXF1ZW5jeS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShmcmVxdWVuY3kgKiBmcmVxdWVuY3lfbXVsdCwgY29udGV4dC5jdXJyZW50VGltZSArIGVuZF90aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5kZWYuc2xpZGVUeXBlID09ICdub25lJykge1xyXG4gICAgICAgICAgICBpbnB1dF9ub2RlLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZShmcmVxdWVuY3kgKiBmcmVxdWVuY3lfbXVsdCwgY29udGV4dC5jdXJyZW50VGltZSArIGRlbGF5X3N0YXJ0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5kZWYuc2xpZGVUeXBlID09ICdleHAnKSB7XHJcbiAgICAgICAgICAgIGlucHV0X25vZGUuZnJlcXVlbmN5LmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUoZnJlcXVlbmN5ICogZnJlcXVlbmN5X211bHQsIGNvbnRleHQuY3VycmVudFRpbWUgKyBlbmRfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnB1dF9ub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogRnJlcXVlbmN5U2xpZGUgY3JlYXRlcyBhbiBvc2NpbGxhdG9yIHRoYXQgc2xpZGVzIGl0J3MgICAgICovXHJcbiAgICAvKiBmcmVxdWVuY3kgZnJvbSBvbmUgdmFsdWUgdG8gYSBkaWZmZXJlbnQgdmFsdWUgb3ZlciBhICAgICAgKi9cclxuICAgIC8qIHBlcmlvZCBvZiB0aW1lICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICBwcml2YXRlIEZyZXF1ZW5jeVNsaWRlID0gKGZyZXF1ZW5jeTogbnVtYmVyLCB0aW1lOiBudW1iZXIsXHJcbiAgICAgICAgaW5wdXRfbm9kZTogT3NjaWxsYXRvck5vZGUpOiBPc2NpbGxhdG9yTm9kZSA9PiB7XHJcbiAgICAgICAgdmFyIGNvbnRleHQ6IEF1ZGlvQ29udGV4dCA9IFNGWFdlYi5BQ1RYO1xyXG5cclxuICAgICAgICBpbnB1dF9ub2RlLmZyZXF1ZW5jeS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShmcmVxdWVuY3ksIGNvbnRleHQuY3VycmVudFRpbWUgKyB0aW1lKTsgLy8gdmFsdWUgaW4gaGVydHpcclxuXHJcbiAgICAgICAgcmV0dXJuIGlucHV0X25vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiBWaWJyYXRvIGNyZWF0ZXMgYSBHYWluTm9kZSB0aGF0IG1vdmVzIHRoZSB2b2x1bWUgdXAgYW5kICAgKi9cclxuICAgIC8qIGRvd24gaW4gYSB3YXZlIHBhdHRlcm4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICBwcml2YXRlIFZpYnJhdG8gPSAod2F2ZV90eXBlOiBPc2NpbGxhdG9yVHlwZSwgdmlicmF0b19mcmVxdWVuY3k6IG51bWJlcixcclxuICAgICAgICBzaGlmdF90aW1lOiBudW1iZXIsIHRpbWU6IG51bWJlcik6IEdhaW5Ob2RlID0+IHtcclxuICAgICAgICB2YXIgY29udGV4dDogQXVkaW9Db250ZXh0ID0gU0ZYV2ViLkFDVFg7XHJcblxyXG4gICAgICAgIHZhciBnYWluTm9kZTogR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuXHJcbiAgICAgICAgdmFyIG9zYzogT3NjaWxsYXRvck5vZGUgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcclxuICAgICAgICBvc2MudHlwZSA9IHdhdmVfdHlwZTtcclxuICAgICAgICBvc2MuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKHZpYnJhdG9fZnJlcXVlbmN5LCBjb250ZXh0LmN1cnJlbnRUaW1lKTsgLy8gdmFsdWUgaW4gaGVydHpcclxuICAgICAgICBvc2MuY29ubmVjdChnYWluTm9kZSk7XHJcblxyXG4gICAgICAgIG9zYy5zdGFydChjb250ZXh0LmN1cnJlbnRUaW1lICsgc2hpZnRfdGltZSk7XHJcbiAgICAgICAgb3NjLnN0b3AoY29udGV4dC5jdXJyZW50VGltZSArIHRpbWUpO1xyXG5cclxuICAgICAgICByZXR1cm4gZ2Fpbk5vZGU7IC8vaW5wdXRfbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG5vaXNlRGF0YTogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSgxNjM4NCk7XHJcbiAgICBwcml2YXRlIG5vaXNlSW5pdDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogTm9pc2UgaXMgYW4gYWx0ZXJuYXRpdmUgc3RhcnRpbmcgcG9pbnQgZm9yIGEgc291bmQgICAgICAgICovXHJcbiAgICAvKiBlZmZlY3RzIHN1Y2ggYXMgZXhwbG9zaW9ucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHJpdmF0ZSBOb2lzZSA9ICgpOiBBdWRpb0J1ZmZlclNvdXJjZU5vZGUgPT4ge1xyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuXHJcbiAgICAgICAgdmFyIG5vaXNlX25vZGU6IEF1ZGlvQnVmZmVyU291cmNlTm9kZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcbiAgICAgICAgdmFyIGJ1ZmZlcjogQXVkaW9CdWZmZXIgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlcigxLCAxNjM4NCwgY29udGV4dC5zYW1wbGVSYXRlKTtcclxuICAgICAgICBpZiAodGhpcy5ub2lzZUluaXQgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjM4NDsgaSArPSAxMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2lzZURhdGFbaV0gPSBNYXRoLnJhbmRvbSgpICogMiAtIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgajogbnVtYmVyID0gMTsgaiA8IDEwOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vaXNlRGF0YVtpICsgal0gPSB0aGlzLm5vaXNlRGF0YVtpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGRhdGE6IEZsb2F0MzJBcnJheSA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTtcclxuICAgICAgICBkYXRhLnNldCh0aGlzLm5vaXNlRGF0YSk7XHJcblxyXG4gICAgICAgIG5vaXNlX25vZGUuYnVmZmVyID0gYnVmZmVyO1xyXG4gICAgICAgIG5vaXNlX25vZGUubG9vcCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIG5vaXNlX25vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiBFbnZlbG9wZSBjcmVhdGVzIGEgR2Fpbk5vZGUgdGhhdCByYW1wcyB1cCB0aGUgdm9sdW1lIGFuZCAgKi9cclxuICAgIC8qIGJhY2sgZG93biBhZ2FpbiB3aGVuIHRoZSBlZmZlY3QgaXMgZW5kaW5nICAgICAgICAgICAgICAgICAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICBwcml2YXRlIEVudmVsb3BlID0gKGF0dGFja190aW1lOiBudW1iZXIsIGRlY2F5X3RpbWU6IG51bWJlciwgc3VzdGFpbl90aW1lOiBudW1iZXIsIHJlbGVhc2VfdGltZTogbnVtYmVyLFxyXG4gICAgICAgIGF0dGFja19wdW5jaDogbnVtYmVyKTogR2Fpbk5vZGUgPT4ge1xyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuXHJcblxyXG4gICAgICAgIHZhciBlbnZlbG9wZTogR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuXHJcbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjAsIGNvbnRleHQuY3VycmVudFRpbWUpO1xyXG4gICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoYXR0YWNrX3B1bmNoLCBjb250ZXh0LmN1cnJlbnRUaW1lICsgYXR0YWNrX3RpbWUpO1xyXG4gICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMSwgY29udGV4dC5jdXJyZW50VGltZSArIGF0dGFja190aW1lICsgZGVjYXlfdGltZSk7XHJcbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgxLFxyXG4gICAgICAgICAgICBjb250ZXh0LmN1cnJlbnRUaW1lICsgYXR0YWNrX3RpbWUgKyBkZWNheV90aW1lICsgc3VzdGFpbl90aW1lKTtcclxuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCxcclxuICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGltZSArIGF0dGFja190aW1lICsgZGVjYXlfdGltZSArIHN1c3RhaW5fdGltZSArIHJlbGVhc2VfdGltZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBlbnZlbG9wZTtcclxuICAgIH1cclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qIEZsYW5nZSBpcyBhIGZlZWRiYWNrIGVmZmVjdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICBwcml2YXRlIEZsYW5nZSA9IChkZWxheV90aW1lOiBudW1iZXIsIGZlZWRiYWNrX3ZvbHVtZTogbnVtYmVyLCBpbnB1dDogQXVkaW9Ob2RlKTogR2Fpbk5vZGUgPT4ge1xyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuXHJcbiAgICAgICAgdmFyIGRlbGF5Tm9kZTogRGVsYXlOb2RlID0gY29udGV4dC5jcmVhdGVEZWxheSgpO1xyXG4gICAgICAgIGRlbGF5Tm9kZS5kZWxheVRpbWUudmFsdWUgPSBkZWxheV90aW1lO1xyXG5cclxuICAgICAgICB2YXIgZmVlZGJhY2s6IEdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICAgICAgZmVlZGJhY2suZ2Fpbi52YWx1ZSA9IGZlZWRiYWNrX3ZvbHVtZVxyXG5cclxuICAgICAgICBpbnB1dC5jb25uZWN0KGRlbGF5Tm9kZSk7XHJcbiAgICAgICAgZGVsYXlOb2RlLmNvbm5lY3QoZmVlZGJhY2spO1xyXG4gICAgICAgIHJldHVybiBmZWVkYmFjaztcclxuICAgIH1cclxufSIsImNsYXNzIEVudmVsb3BlIHtcclxuICAgIHB1YmxpYyBhdHRhY2tUaW1lOiBudW1iZXIgPSAwLjE7XHJcbiAgICBwdWJsaWMgZGVjYXlUaW1lOiBudW1iZXIgPSAwLjE7XHJcbiAgICBwdWJsaWMgc3VzdGFpblRpbWU6IG51bWJlciA9IDAuMztcclxuICAgIHB1YmxpYyBzdXN0YWluVm9sdW1lOiBudW1iZXIgPSAwLjg7XHJcbiAgICBwdWJsaWMgcmVsZWFzZVRpbWU6IG51bWJlciA9IDAuMTtcclxuXHJcbiAgICBwdWJsaWMgc2V0R2FpbiA9ICggZzogR2Fpbk5vZGUsIGN0eDogQXVkaW9Db250ZXh0ICk6IHZvaWQgPT4ge1xyXG4gICAgICAgIHZhciBub3c6IG51bWJlciA9IGN0eC5jdXJyZW50VGltZTtcclxuICAgICAgICBnLmdhaW4udmFsdWUgPSAwO1xyXG4gICAgICAgIGcuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCBub3cgKyB0aGlzLmF0dGFja1RpbWUpO1xyXG4gICAgICAgIGcuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW5Wb2x1bWUsIG5vdyArIHRoaXMuYXR0YWNrVGltZSArIHRoaXMuZGVjYXlUaW1lKTtcclxuICAgICAgICBnLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluVm9sdW1lLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyArIHRoaXMuYXR0YWNrVGltZSArIHRoaXMuZGVjYXlUaW1lICsgdGhpcy5zdXN0YWluVGltZSk7XHJcbiAgICAgICAgZy5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpblZvbHVtZSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyB0aGlzLmF0dGFja1RpbWUgKyB0aGlzLmRlY2F5VGltZSArIHRoaXMuc3VzdGFpblRpbWUpO1xyXG4gICAgICAgIGcuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ICsgdGhpcy5hdHRhY2tUaW1lICsgdGhpcy5kZWNheVRpbWUgKyB0aGlzLnN1c3RhaW5UaW1lICsgdGhpcy5yZWxlYXNlVGltZSApO1xyXG4gICAgfVxyXG59XHJcblxyXG4iLCJjbGFzcyBJbnRlcmZhY2VNYW5hZ2VyIHtcclxuICAgIHB1YmxpYyBkZWY6IFNGWERlZjtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIFNOOiBJbnRlcmZhY2VNYW5hZ2VyID0gbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgaHRtbFdhdmVUeXBlOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxGcmVxdWVuY3k6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbEZyZXF1ZW5jeVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICBwdWJsaWMgaHRtbERlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0OiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxEZWxheUZyZXF1ZW5jeU11bHQ6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcblxyXG4gICAgLy8gICAgcHVibGljIGh0bWxGcmVxdWVuY3lFYXNpbmc6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbFZpYnJhdG9UaW1lOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxWaWJyYXRvU2hpZnRUaW1lOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxWaWJyYXRvRnJlcXVlbmN5OiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxWaWJyYXRvV2F2ZTogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sTG93UGFzc0ZyZXF1ZW5jeTogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sTG93UGFzc0ZyZXF1ZW5jeVJhbXA6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbEhpUGFzc0ZyZXF1ZW5jeTogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sQXR0YWNrVGltZTogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sRGVjYXlUaW1lOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxTdXN0YWluVGltZTogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sUmVsZWFzZVRpbWU6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbEF0dGFja1B1bmNoVm9sdW1lOiBIVE1MSW5wdXRFbGVtZW50OyAvLyBJIFRISU5LIFRISVMgV0lMTCBORUVEIFRPIEJFIENIQU5HRUQgVE8gQVRUQUNLIFBVTkNIXHJcbiAgICBwdWJsaWMgaHRtbER1dHlDeWNsZUxlbmd0aDogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sRHV0eUN5Y2xlUGN0OiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxGbGFuZ2VEZWxheVRpbWU6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbEZsYW5nZUZlZWRiYWNrVm9sdW1lOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxHYWluOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxEaXN0b3J0aW9uOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxOb2lzZURldHVuZTogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sTm9pc2VEZXR1bmVTbGlkZTogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sU2xpZGVUeXBlOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxDb2RlQXJlYTogSFRNTFRleHRBcmVhRWxlbWVudDtcclxuXHJcbiAgICBwdWJsaWMgaHRtbEZyZXF1ZW5jeVNsaWRlOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxGcmVxdWVuY3lTbGlkZVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sRGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3RTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbERlbGF5RnJlcXVlbmN5TXVsdFNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sVmlicmF0b1RpbWVTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbFZpYnJhdG9GcmVxdWVuY3lTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbFZpYnJhdG9TaGlmdFRpbWVTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbExvd1Bhc3NGcmVxdWVuY3lTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbExvd1Bhc3NGcmVxdWVuY3lSYW1wU2xpZGVyOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxIaVBhc3NGcmVxdWVuY3lTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbEF0dGFja1RpbWVTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbERlY2F5VGltZVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sU3VzdGFpblRpbWVTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbFJlbGVhc2VUaW1lU2xpZGVyOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxBdHRhY2tQdW5jaFZvbHVtZVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sRmxhbmdlRGVsYXlUaW1lU2xpZGVyOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxGbGFuZ2VGZWVkYmFja1ZvbHVtZVNsaWRlcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgIHB1YmxpYyBodG1sRHV0eUN5Y2xlTGVuZ3RoU2xpZGVyOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxEdXR5Q3ljbGVQY3RTbGlkZXI6IEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgaHRtbE5vaXNlRGV0dW5lU2xpZGVyOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxOb2lzZURldHVuZVNsaWRlU2xpZGVyOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHVibGljIGh0bWxHYWluU2xpZGVyOiBIVE1MSW5wdXRFbGVtZW50O1xyXG5cclxuICAgIHB1YmxpYyBtb3VzZURvd246IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBpZiAoSW50ZXJmYWNlTWFuYWdlci5TTiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmV0dXJuaW5nXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEludGVyZmFjZU1hbmFnZXIuU04gPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuZGVmID0gbmV3IFNGWERlZigpO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxXYXZlVHlwZSA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2F2ZVR5cGVcIik7XHJcbiAgICAgICAgdGhpcy5odG1sRnJlcXVlbmN5ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcmVxdWVuY3lcIik7XHJcbiAgICAgICAgdGhpcy5odG1sRnJlcXVlbmN5U2xpZGVyID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcmVxdWVuY3lTbGlkZXJcIik7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxheUZyZXF1ZW5jeVN0YXJ0VGltZVBjdFwiKTtcclxuICAgICAgICB0aGlzLmh0bWxEZWxheUZyZXF1ZW5jeU11bHQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGF5RnJlcXVlbmN5TXVsdFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sVmlicmF0b1RpbWUgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpYnJhdG9UaW1lXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9TaGlmdFRpbWUgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpYnJhdG9TaGlmdFRpbWVcIik7XHJcbiAgICAgICAgdGhpcy5odG1sVmlicmF0b0ZyZXF1ZW5jeSA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlicmF0b0ZyZXF1ZW5jeVwiKTtcclxuICAgICAgICB0aGlzLmh0bWxWaWJyYXRvV2F2ZSA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlicmF0b1dhdmVcIik7XHJcbiAgICAgICAgdGhpcy5odG1sTG93UGFzc0ZyZXF1ZW5jeSA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG93UGFzc0ZyZXF1ZW5jeVwiKTtcclxuICAgICAgICB0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5UmFtcCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG93UGFzc0ZyZXF1ZW5jeVJhbXBcIik7XHJcbiAgICAgICAgdGhpcy5odG1sSGlQYXNzRnJlcXVlbmN5ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoaVBhc3NGcmVxdWVuY3lcIik7XHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrVGltZSA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXR0YWNrVGltZVwiKTtcclxuICAgICAgICB0aGlzLmh0bWxEZWNheVRpbWUgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlY2F5VGltZVwiKTtcclxuICAgICAgICB0aGlzLmh0bWxTdXN0YWluVGltZSA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VzdGFpblRpbWVcIik7XHJcbiAgICAgICAgdGhpcy5odG1sUmVsZWFzZVRpbWUgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlbGVhc2VUaW1lXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbEF0dGFja1B1bmNoVm9sdW1lID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdHRhY2tQdW5jaFZvbHVtZVwiKTsgLy8gSSBUSElOSyBUSElTIFdJTEwgTkVFRCBUTyBCRSBDSEFOR0VEIFRPIEFUVEFDSyBQVU5DSFxyXG4gICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZUxlbmd0aCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHV0eUN5Y2xlTGVuZ3RoXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZVBjdCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHV0eUN5Y2xlUGN0XCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbEZsYW5nZURlbGF5VGltZSA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmxhbmdlRGVsYXlUaW1lXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbEZsYW5nZUZlZWRiYWNrVm9sdW1lID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmbGFuZ2VGZWVkYmFja1ZvbHVtZVwiKTtcclxuICAgICAgICB0aGlzLmh0bWxHYWluID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYWluXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbERpc3RvcnRpb24gPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpc3RvcnRpb25cIik7XHJcbiAgICAgICAgdGhpcy5odG1sTm9pc2VEZXR1bmUgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vaXNlRGV0dW5lXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbE5vaXNlRGV0dW5lU2xpZGUgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vaXNlRGV0dW5lU2xpZGVcIik7XHJcbiAgICAgICAgdGhpcy5odG1sU2xpZGVUeXBlID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzbGlkZVR5cGVcIik7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbEZyZXF1ZW5jeVNsaWRlID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcmVxdWVuY3lTbGlkZVwiKTtcclxuICAgICAgICB0aGlzLmh0bWxGcmVxdWVuY3lTbGlkZVNsaWRlciA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnJlcXVlbmN5U2xpZGVTbGlkZXJcIik7XHJcbiAgICAgICAgdGhpcy5odG1sRGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3RTbGlkZXIgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0U2xpZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5TXVsdFNsaWRlciA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsYXlGcmVxdWVuY3lNdWx0U2xpZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9UaW1lU2xpZGVyID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2aWJyYXRvVGltZVNsaWRlclwiKTtcclxuICAgICAgICB0aGlzLmh0bWxWaWJyYXRvRnJlcXVlbmN5U2xpZGVyID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2aWJyYXRvRnJlcXVlbmN5U2xpZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9TaGlmdFRpbWVTbGlkZXIgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpYnJhdG9TaGlmdFRpbWVTbGlkZXJcIik7XHJcbiAgICAgICAgdGhpcy5odG1sTG93UGFzc0ZyZXF1ZW5jeVNsaWRlciA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG93UGFzc0ZyZXF1ZW5jeVNsaWRlclwiKTtcclxuICAgICAgICB0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5UmFtcFNsaWRlciA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG93UGFzc0ZyZXF1ZW5jeVJhbXBTbGlkZXJcIik7XHJcbiAgICAgICAgdGhpcy5odG1sSGlQYXNzRnJlcXVlbmN5U2xpZGVyID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoaVBhc3NGcmVxdWVuY3lTbGlkZXJcIik7XHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrVGltZVNsaWRlciA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXR0YWNrVGltZVNsaWRlclwiKTtcclxuICAgICAgICB0aGlzLmh0bWxEZWNheVRpbWVTbGlkZXIgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlY2F5VGltZVNsaWRlclwiKTtcclxuICAgICAgICB0aGlzLmh0bWxTdXN0YWluVGltZVNsaWRlciA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VzdGFpblRpbWVTbGlkZXJcIik7XHJcbiAgICAgICAgdGhpcy5odG1sUmVsZWFzZVRpbWVTbGlkZXIgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlbGVhc2VUaW1lU2xpZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbEF0dGFja1B1bmNoVm9sdW1lU2xpZGVyID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdHRhY2tQdW5jaFZvbHVtZVNsaWRlclwiKTtcclxuICAgICAgICB0aGlzLmh0bWxGbGFuZ2VEZWxheVRpbWVTbGlkZXIgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZsYW5nZURlbGF5VGltZVNsaWRlclwiKTtcclxuICAgICAgICB0aGlzLmh0bWxGbGFuZ2VGZWVkYmFja1ZvbHVtZVNsaWRlciA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmxhbmdlRmVlZGJhY2tWb2x1bWVTbGlkZXJcIik7XHJcbiAgICAgICAgdGhpcy5odG1sRHV0eUN5Y2xlTGVuZ3RoU2xpZGVyID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkdXR5Q3ljbGVMZW5ndGhTbGlkZXJcIik7XHJcbiAgICAgICAgdGhpcy5odG1sRHV0eUN5Y2xlUGN0U2xpZGVyID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkdXR5Q3ljbGVQY3RTbGlkZXJcIik7XHJcbiAgICAgICAgdGhpcy5odG1sTm9pc2VEZXR1bmVTbGlkZXIgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vaXNlRGV0dW5lU2xpZGVyXCIpO1xyXG4gICAgICAgIHRoaXMuaHRtbE5vaXNlRGV0dW5lU2xpZGVTbGlkZXIgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vaXNlRGV0dW5lU2xpZGVTbGlkZXJcIik7XHJcbiAgICAgICAgdGhpcy5odG1sR2FpblNsaWRlciA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FpblNsaWRlclwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sQ29kZUFyZWEgPSA8SFRNTFRleHRBcmVhRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvZGVhcmVhXCIpO1xyXG5cclxuICAgICAgICB0aGlzLlJlc2V0VmFsdWVzKCk7XHJcbiAgICAgICAgdGhpcy5VcGRhdGVMb29wKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBNb3VzZURvd24gPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgdGhpcy5tb3VzZURvd24gPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBNb3VzZVVwID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgICAgIHRoaXMubW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIFJlc2V0VmFsdWVzID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgICAgIHRoaXMuZGVmLndhdmVUeXBlID0gdGhpcy5odG1sV2F2ZVR5cGUudmFsdWU7XHJcbiAgICAgICAgdGhpcy5kZWYuZnJlcXVlbmN5ID0gcGFyc2VJbnQodGhpcy5odG1sRnJlcXVlbmN5LnZhbHVlKTtcclxuICAgICAgICB0aGlzLmRlZi5mcmVxdWVuY3lTbGlkZSA9IHBhcnNlSW50KHRoaXMuaHRtbEZyZXF1ZW5jeVNsaWRlLnZhbHVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5kZWYuZGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3QgPSBwYXJzZUZsb2F0KHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0LnZhbHVlKTtcclxuICAgICAgICB0aGlzLmRlZi5kZWxheUZyZXF1ZW5jeU11bHQgPSBwYXJzZUZsb2F0KHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5TXVsdC52YWx1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGVmLnZpYnJhdG9UaW1lID0gcGFyc2VGbG9hdCh0aGlzLmh0bWxWaWJyYXRvVGltZS52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5kZWYudmlicmF0b1NoaWZ0VGltZSA9IHBhcnNlRmxvYXQodGhpcy5odG1sVmlicmF0b1NoaWZ0VGltZS52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5kZWYudmlicmF0b0ZyZXF1ZW5jeSA9IHBhcnNlSW50KHRoaXMuaHRtbFZpYnJhdG9GcmVxdWVuY3kudmFsdWUpO1xyXG4gICAgICAgIHRoaXMuZGVmLnZpYnJhdG9XYXZlID0gdGhpcy5odG1sVmlicmF0b1dhdmUudmFsdWU7XHJcblxyXG4gICAgICAgIHRoaXMuZGVmLmxvd1Bhc3NGcmVxdWVuY3kgPSBwYXJzZUludCh0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5LnZhbHVlKTtcclxuICAgICAgICB0aGlzLmRlZi5sb3dQYXNzRnJlcXVlbmN5UmFtcCA9IHBhcnNlSW50KHRoaXMuaHRtbExvd1Bhc3NGcmVxdWVuY3lSYW1wLnZhbHVlKTtcclxuICAgICAgICB0aGlzLmRlZi5oaVBhc3NGcmVxdWVuY3kgPSBwYXJzZUludCh0aGlzLmh0bWxIaVBhc3NGcmVxdWVuY3kudmFsdWUpO1xyXG5cclxuICAgICAgICB0aGlzLmRlZi5hdHRhY2tUaW1lID0gcGFyc2VGbG9hdCh0aGlzLmh0bWxBdHRhY2tUaW1lLnZhbHVlKTtcclxuICAgICAgICB0aGlzLmRlZi5kZWNheVRpbWUgPSBwYXJzZUZsb2F0KHRoaXMuaHRtbERlY2F5VGltZS52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5kZWYuc3VzdGFpblRpbWUgPSBwYXJzZUZsb2F0KHRoaXMuaHRtbFN1c3RhaW5UaW1lLnZhbHVlKTtcclxuICAgICAgICB0aGlzLmRlZi5yZWxlYXNlVGltZSA9IHBhcnNlRmxvYXQodGhpcy5odG1sUmVsZWFzZVRpbWUudmFsdWUpO1xyXG4gICAgICAgIHRoaXMuZGVmLmF0dGFja1B1bmNoVm9sdW1lID0gcGFyc2VGbG9hdCh0aGlzLmh0bWxBdHRhY2tQdW5jaFZvbHVtZS52YWx1ZSk7IC8vIEkgVEhJTksgVEhJUyBXSUxMIE5FRUQgVE8gQkUgQ0hBTkdFRCBUTyBBVFRBQ0sgUFVOQ0hcclxuXHJcbiAgICAgICAgdGhpcy5kZWYuZHV0eUN5Y2xlTGVuZ3RoID0gcGFyc2VGbG9hdCh0aGlzLmh0bWxEdXR5Q3ljbGVMZW5ndGgudmFsdWUpO1xyXG4gICAgICAgIHRoaXMuZGVmLmR1dHlDeWNsZVBjdCA9IHBhcnNlRmxvYXQodGhpcy5odG1sRHV0eUN5Y2xlUGN0LnZhbHVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5kZWYuZmxhbmdlRGVsYXlUaW1lID0gcGFyc2VGbG9hdCh0aGlzLmh0bWxGbGFuZ2VEZWxheVRpbWUudmFsdWUpO1xyXG4gICAgICAgIHRoaXMuZGVmLmZsYW5nZUZlZWRiYWNrVm9sdW1lID0gcGFyc2VGbG9hdCh0aGlzLmh0bWxGbGFuZ2VGZWVkYmFja1ZvbHVtZS52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5kZWYuZ2FpbiA9IHBhcnNlRmxvYXQodGhpcy5odG1sR2Fpbi52YWx1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGVmLm5vaXNlRGV0dW5lID0gcGFyc2VJbnQodGhpcy5odG1sTm9pc2VEZXR1bmUudmFsdWUpO1xyXG4gICAgICAgIHRoaXMuZGVmLm5vaXNlRGV0dW5lU2xpZGUgPSBwYXJzZUludCh0aGlzLmh0bWxOb2lzZURldHVuZVNsaWRlLnZhbHVlKTtcclxuICAgICAgICB0aGlzLmRlZi5zbGlkZVR5cGUgPSB0aGlzLmh0bWxTbGlkZVR5cGUudmFsdWU7XHJcblxyXG4gICAgICAgIGxldCB3YXZlX3R5cGUgPSAwO1xyXG4gICAgICAgIGlmICh0aGlzLmRlZi53YXZlVHlwZSA9PT0gJ3NxdWFyZScpIHtcclxuICAgICAgICAgICAgd2F2ZV90eXBlID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5kZWYud2F2ZVR5cGUgPT09ICd0cmlhbmdsZScpIHtcclxuICAgICAgICAgICAgd2F2ZV90eXBlID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5kZWYud2F2ZVR5cGUgPT09ICdzaW5lJykge1xyXG4gICAgICAgICAgICB3YXZlX3R5cGUgPSAzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmRlZi53YXZlVHlwZSA9PT0gJ3Nhd3Rvb3RoJykge1xyXG4gICAgICAgICAgICB3YXZlX3R5cGUgPSAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmRlZi53YXZlVHlwZSA9PT0gJ25vaXNlJykge1xyXG4gICAgICAgICAgICB3YXZlX3R5cGUgPSA0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHZpYnJhdG9fd2F2ZV90eXBlID0gMDtcclxuICAgICAgICBpZiAodGhpcy5kZWYudmlicmF0b1dhdmUgPT0gJ3NxdWFyZScpIHtcclxuICAgICAgICAgICAgdmlicmF0b193YXZlX3R5cGUgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmRlZi52aWJyYXRvV2F2ZSA9PT0gJ3RyaWFuZ2xlJykge1xyXG4gICAgICAgICAgICB2aWJyYXRvX3dhdmVfdHlwZSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZGVmLnZpYnJhdG9XYXZlID09PSAnc2luZScpIHtcclxuICAgICAgICAgICAgdmlicmF0b193YXZlX3R5cGUgPSAzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmRlZi52aWJyYXRvV2F2ZSA9PT0gJ3Nhd3Rvb3RoJykge1xyXG4gICAgICAgICAgICB2aWJyYXRvX3dhdmVfdHlwZSA9IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZGVmLnZpYnJhdG9XYXZlID09PSAnbm9pc2UnKSB7XHJcbiAgICAgICAgICAgIHZpYnJhdG9fd2F2ZV90eXBlID0gNDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzbGlkZV90eXBlID0gMDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVmLnNsaWRlVHlwZSA9PT0gJ2xpbmVhcicpIHtcclxuICAgICAgICAgICAgc2xpZGVfdHlwZSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZGVmLnNsaWRlVHlwZSA9PT0gJ2V4cCcpIHtcclxuICAgICAgICAgICAgc2xpZGVfdHlwZSA9IDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RoaXMuaHRtbENvZGVBcmVhLnZhbHVlID0gSlNPTi5zdHJpbmdpZnkodGhpcy5kZWYsIG51bGwsICdcXHQnKTtcclxuICAgICAgICB0aGlzLmh0bWxDb2RlQXJlYS52YWx1ZSA9IGBcclxuICAgICAgICBwbGF5U0ZYKCR7d2F2ZV90eXBlfSwgLy8gd2F2ZSB0eXBlXHJcbiAgICAgICAgICAgICR7dGhpcy5kZWYuZnJlcXVlbmN5fSwgLy8gZnJlcVxyXG4gICAgICAgICAgICAke3RoaXMuZGVmLmZyZXF1ZW5jeVNsaWRlfSwgLy8gZnJlcSBzbGlkZVxyXG4gICAgICAgICAgICAke3RoaXMuZGVmLmRlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0fSwgLy8gZGVsYXkgZnJlcSBzdGFydFxyXG4gICAgICAgICAgICAke3RoaXMuZGVmLmRlbGF5RnJlcXVlbmN5TXVsdH0sIC8vIGRlbGF5IGZyZXEgbXVsdFxyXG4gICAgICAgICAgICAke3RoaXMuZGVmLnZpYnJhdG9UaW1lfSwgLy8gdmlicmF0byB0aW1lXHJcbiAgICAgICAgICAgICR7dGhpcy5kZWYudmlicmF0b1NoaWZ0VGltZX0sIC8vIHZpYnJhdG8gc2hpZnRcclxuICAgICAgICAgICAgJHt0aGlzLmRlZi52aWJyYXRvRnJlcXVlbmN5fSwgLy8gdmlicmF0byBmcmVxXHJcbiAgICAgICAgICAgICR7dmlicmF0b193YXZlX3R5cGV9LCAvLyB2aWJyYXRvIHR5cGVcclxuICAgICAgICAgICAgJHt0aGlzLmRlZi5sb3dQYXNzRnJlcXVlbmN5fSwgIC8vIGxvdyBwYXNzXHJcbiAgICAgICAgICAgICR7dGhpcy5kZWYubG93UGFzc0ZyZXF1ZW5jeVJhbXB9LCAvLyBsb3cgcmFtcFxyXG4gICAgICAgICAgICAke3RoaXMuZGVmLmhpUGFzc0ZyZXF1ZW5jeX0sIC8vIGhpIHBhc3NcclxuICAgICAgICAgICAgJHt0aGlzLmRlZi5hdHRhY2tUaW1lfSwgLy8gYXR0YWNrXHJcbiAgICAgICAgICAgICR7dGhpcy5kZWYuZGVjYXlUaW1lfSwgLy8gZGVjYXlcclxuICAgICAgICAgICAgJHt0aGlzLmRlZi5zdXN0YWluVGltZX0sIC8vIHN1c3RhaW5cclxuICAgICAgICAgICAgJHt0aGlzLmRlZi5yZWxlYXNlVGltZX0sIC8vIHJlbGVhc2VcclxuICAgICAgICAgICAgJHt0aGlzLmRlZi5hdHRhY2tQdW5jaFZvbHVtZX0sIC8vIHB1bmNoXHJcbiAgICAgICAgICAgICR7dGhpcy5kZWYuZHV0eUN5Y2xlTGVuZ3RofSwgLy8gZHV0eSBsZW5cclxuICAgICAgICAgICAgJHt0aGlzLmRlZi5kdXR5Q3ljbGVQY3R9LCAvLyBkdXR5IHBjdFxyXG4gICAgICAgICAgICAke3RoaXMuZGVmLmZsYW5nZURlbGF5VGltZX0sIC8vIGZsYW5nZSBkZWxheVxyXG4gICAgICAgICAgICAke3RoaXMuZGVmLmZsYW5nZUZlZWRiYWNrVm9sdW1lfSwgLy8gZmxhbmdlIGZlZWRiYWNrXHJcbiAgICAgICAgICAgICR7dGhpcy5kZWYuZ2Fpbn0sIC8vIGdhaW5cclxuICAgICAgICAgICAgJHt0aGlzLmRlZi5ub2lzZURldHVuZX0sIC8vIG5vaXNlIGRldHVuZSBcclxuICAgICAgICAgICAgJHt0aGlzLmRlZi5ub2lzZURldHVuZVNsaWRlfSwgLy8gZGV0dW5lIHNsaWRlXHJcbiAgICAgICAgICAgICR7c2xpZGVfdHlwZX0pOyAvLyBzbGlkZSB0eXBlXHJcbiAgICAgICAgICBcclxuICAgICAgICBgO1xyXG4gICAgICAgIHRoaXMuaHRtbENvZGVBcmVhLnJvd3MgPSAzMDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIFN5bmNTbGlkZXJzID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9UaW1lU2xpZGVyLnZhbHVlID0gdGhpcy5odG1sVmlicmF0b1RpbWUudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sVmlicmF0b1NoaWZ0VGltZVNsaWRlci52YWx1ZSA9IHRoaXMuaHRtbFZpYnJhdG9TaGlmdFRpbWUudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sVmlicmF0b0ZyZXF1ZW5jeVNsaWRlci52YWx1ZSA9IHRoaXMuaHRtbFZpYnJhdG9GcmVxdWVuY3kudmFsdWU7XHJcbiAgICAgICAgLy8gQ0hBTkdFIFZJU0lCTEVcclxuICAgICAgICAvL3RoaXMuaHRtbFZpYnJhdG9XYXZlLnZhbHVlID0gdGhpcy5odG1sVmlicmF0b1dhdmUudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sTG93UGFzc0ZyZXF1ZW5jeVNsaWRlci52YWx1ZSA9IHRoaXMuaHRtbExvd1Bhc3NGcmVxdWVuY3kudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sTG93UGFzc0ZyZXF1ZW5jeVJhbXBTbGlkZXIudmFsdWUgPSB0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5UmFtcC52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxIaVBhc3NGcmVxdWVuY3lTbGlkZXIudmFsdWUgPSB0aGlzLmh0bWxIaVBhc3NGcmVxdWVuY3kudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrVGltZVNsaWRlci52YWx1ZSA9IHRoaXMuaHRtbEF0dGFja1RpbWUudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sRGVjYXlUaW1lU2xpZGVyLnZhbHVlID0gdGhpcy5odG1sRGVjYXlUaW1lLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbFN1c3RhaW5UaW1lU2xpZGVyLnZhbHVlID0gdGhpcy5odG1sU3VzdGFpblRpbWUudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sUmVsZWFzZVRpbWVTbGlkZXIudmFsdWUgPSB0aGlzLmh0bWxSZWxlYXNlVGltZS52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxBdHRhY2tQdW5jaFZvbHVtZVNsaWRlci52YWx1ZSA9IHRoaXMuaHRtbEF0dGFja1B1bmNoVm9sdW1lLnZhbHVlOyAvLyBJIFRISU5LIFRISVMgV0lMTCBORUVEIFRPIEJFIENIQU5HRUQgVE8gQVRUQUNLIFBVTkNIXHJcbiAgICAgICAgdGhpcy5odG1sRHV0eUN5Y2xlTGVuZ3RoU2xpZGVyLnZhbHVlID0gdGhpcy5odG1sRHV0eUN5Y2xlTGVuZ3RoLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZVBjdFNsaWRlci52YWx1ZSA9IHRoaXMuaHRtbER1dHlDeWNsZVBjdC52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxGbGFuZ2VEZWxheVRpbWVTbGlkZXIudmFsdWUgPSB0aGlzLmh0bWxGbGFuZ2VEZWxheVRpbWUudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRmVlZGJhY2tWb2x1bWVTbGlkZXIudmFsdWUgPSB0aGlzLmh0bWxGbGFuZ2VGZWVkYmFja1ZvbHVtZS52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxHYWluU2xpZGVyLnZhbHVlID0gdGhpcy5odG1sR2Fpbi52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZVNsaWRlci52YWx1ZSA9IHRoaXMuaHRtbE5vaXNlRGV0dW5lLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbE5vaXNlRGV0dW5lU2xpZGVTbGlkZXIudmFsdWUgPSB0aGlzLmh0bWxOb2lzZURldHVuZVNsaWRlLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbEZyZXF1ZW5jeVNsaWRlU2xpZGVyLnZhbHVlID0gdGhpcy5odG1sRnJlcXVlbmN5U2xpZGUudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sRnJlcXVlbmN5U2xpZGVyLnZhbHVlID0gdGhpcy5odG1sRnJlcXVlbmN5LnZhbHVlO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxEZWxheUZyZXF1ZW5jeVN0YXJ0VGltZVBjdFNsaWRlci52YWx1ZSA9IHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0LnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5TXVsdFNsaWRlci52YWx1ZSA9IHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5TXVsdC52YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gQ0hBTkdFIFZJU0lCTEVcclxuICAgICAgICAvL3RoaXMuaHRtbFNsaWRlVHlwZS52YWx1ZSA9IHRoaXMuaHRtbFNsaWRlVHlwZVNsaWRlci52YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gICAgICAgIHRoaXMuUmVzZXRWYWx1ZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgU3luY1ZhbHVlcyA9ICgpOiB2b2lkID0+IHtcclxuICAgICAgICB0aGlzLmh0bWxWaWJyYXRvVGltZS52YWx1ZSA9IHRoaXMuaHRtbFZpYnJhdG9UaW1lU2xpZGVyLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9TaGlmdFRpbWUudmFsdWUgPSB0aGlzLmh0bWxWaWJyYXRvU2hpZnRUaW1lU2xpZGVyLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9GcmVxdWVuY3kudmFsdWUgPSB0aGlzLmh0bWxWaWJyYXRvRnJlcXVlbmN5U2xpZGVyLnZhbHVlO1xyXG4gICAgICAgIC8vIENIQU5HRSBWSVNJQkxFXHJcbiAgICAgICAgLy90aGlzLmh0bWxWaWJyYXRvV2F2ZS52YWx1ZSA9IHRoaXMuaHRtbFZpYnJhdG9XYXZlLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbExvd1Bhc3NGcmVxdWVuY3kudmFsdWUgPSB0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5U2xpZGVyLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbExvd1Bhc3NGcmVxdWVuY3lSYW1wLnZhbHVlID0gdGhpcy5odG1sTG93UGFzc0ZyZXF1ZW5jeVJhbXBTbGlkZXIudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sSGlQYXNzRnJlcXVlbmN5LnZhbHVlID0gdGhpcy5odG1sSGlQYXNzRnJlcXVlbmN5U2xpZGVyLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbEF0dGFja1RpbWUudmFsdWUgPSB0aGlzLmh0bWxBdHRhY2tUaW1lU2xpZGVyLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbERlY2F5VGltZS52YWx1ZSA9IHRoaXMuaHRtbERlY2F5VGltZVNsaWRlci52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxTdXN0YWluVGltZS52YWx1ZSA9IHRoaXMuaHRtbFN1c3RhaW5UaW1lU2xpZGVyLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbFJlbGVhc2VUaW1lLnZhbHVlID0gdGhpcy5odG1sUmVsZWFzZVRpbWVTbGlkZXIudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrUHVuY2hWb2x1bWUudmFsdWUgPSB0aGlzLmh0bWxBdHRhY2tQdW5jaFZvbHVtZVNsaWRlci52YWx1ZTsgLy8gSSBUSElOSyBUSElTIFdJTEwgTkVFRCBUTyBCRSBDSEFOR0VEIFRPIEFUVEFDSyBQVU5DSFxyXG4gICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZUxlbmd0aC52YWx1ZSA9IHRoaXMuaHRtbER1dHlDeWNsZUxlbmd0aFNsaWRlci52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVQY3QudmFsdWUgPSB0aGlzLmh0bWxEdXR5Q3ljbGVQY3RTbGlkZXIudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRGVsYXlUaW1lLnZhbHVlID0gdGhpcy5odG1sRmxhbmdlRGVsYXlUaW1lU2xpZGVyLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbEZsYW5nZUZlZWRiYWNrVm9sdW1lLnZhbHVlID0gdGhpcy5odG1sRmxhbmdlRmVlZGJhY2tWb2x1bWVTbGlkZXIudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sR2Fpbi52YWx1ZSA9IHRoaXMuaHRtbEdhaW5TbGlkZXIudmFsdWU7XHJcbiAgICAgICAgdGhpcy5odG1sTm9pc2VEZXR1bmUudmFsdWUgPSB0aGlzLmh0bWxOb2lzZURldHVuZVNsaWRlci52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZVNsaWRlLnZhbHVlID0gdGhpcy5odG1sTm9pc2VEZXR1bmVTbGlkZVNsaWRlci52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxGcmVxdWVuY3lTbGlkZS52YWx1ZSA9IHRoaXMuaHRtbEZyZXF1ZW5jeVNsaWRlU2xpZGVyLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuaHRtbEZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuaHRtbEZyZXF1ZW5jeVNsaWRlci52YWx1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sRGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3QudmFsdWUgPSB0aGlzLmh0bWxEZWxheUZyZXF1ZW5jeVN0YXJ0VGltZVBjdFNsaWRlci52YWx1ZTtcclxuICAgICAgICB0aGlzLmh0bWxEZWxheUZyZXF1ZW5jeU11bHQudmFsdWUgPSB0aGlzLmh0bWxEZWxheUZyZXF1ZW5jeU11bHRTbGlkZXIudmFsdWU7XHJcblxyXG4gICAgICAgIC8vIENIQU5HRSBWSVNJQkxFXHJcbiAgICAgICAgLy90aGlzLmh0bWxTbGlkZVR5cGUudmFsdWUgPSB0aGlzLmh0bWxTbGlkZVR5cGVTbGlkZXIudmFsdWU7XHJcblxyXG4gICAgICAgIC8vICAgICAgICB0aGlzLlJlc2V0VmFsdWVzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJhbmQgPSAobG93OiBudW1iZXIsIGhpZ2g6IG51bWJlciA9IDApOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIGlmIChoaWdoID09IDApIHtcclxuICAgICAgICAgICAgaGlnaCA9IGxvdztcclxuICAgICAgICAgICAgbG93ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciByYW5nZTogbnVtYmVyID0gaGlnaCAtIGxvdztcclxuICAgICAgICByYW5nZSAqPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgIHJldHVybiBsb3cgKyByYW5nZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBBcnJSYW5kID0gKGFycjogYW55W10pOiBhbnkgPT4ge1xyXG4gICAgICAgIHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXROb3RlID0gKG1pbl9oejogbnVtYmVyID0gMCwgbWF4X2h6OiBudW1iZXIgPSAyMDAwMCk6IG51bWJlciA9PiB7XHJcbiAgICAgICAgdmFyIGh6OiBudW1iZXIgPSAtOTk5OTk5O1xyXG4gICAgICAgIHdoaWxlIChoeiA8IG1pbl9oeiB8fCBoeiA+IG1heF9oeikge1xyXG4gICAgICAgICAgICBoeiA9IHRoaXMubm90ZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5ub3Rlcy5sZW5ndGgpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGh6O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRIaWdoZXJOb3RlID0gKGh6OiBudW1iZXIsIGhpZ2hlcl9jb3VudDogbnVtYmVyID0gMSk6IG51bWJlciA9PiB7XHJcbiAgICAgICAgdmFyIGNvdW50OiBudW1iZXIgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpOiBudW1iZXIgPSB0aGlzLm5vdGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5vdGVzW2ldID4gaHopIHtcclxuICAgICAgICAgICAgICAgIGh6ID0gdGhpcy5ub3Rlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoKytjb3VudCA+PSBoaWdoZXJfY291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaHo7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldExvd2VyTm90ZSA9IChoejogbnVtYmVyLCBsb3dlcl9jb3VudDogbnVtYmVyID0gMSk6IG51bWJlciA9PiB7XHJcbiAgICAgICAgdmFyIGNvdW50OiBudW1iZXIgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLm5vdGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5vdGVzW2ldIDwgaHopIHtcclxuICAgICAgICAgICAgICAgIGh6ID0gdGhpcy5ub3Rlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoKytjb3VudCA+PSBsb3dlcl9jb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoejtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgTGFzZXJTaG90ID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgICAgIHRoaXMuaHRtbFdhdmVUeXBlLnZhbHVlID0gdGhpcy5BcnJSYW5kKFsnc3F1YXJlJywgJ3Nhd3Rvb3RoJywgJ3RyaWFuZ2xlJ10pOyAvL3RoaXMucmFuZFdhdmUoKTtcclxuICAgICAgICB0aGlzLmh0bWxTbGlkZVR5cGUudmFsdWUgPSBcImxpbmVhclwiO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbE5vaXNlRGV0dW5lU2xpZGUudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdmFyIGZyZXE6IG51bWJlciA9IHRoaXMuZ2V0Tm90ZSgzMDAsIDEyMDApO1xyXG4gICAgICAgIHRoaXMuaHRtbEZyZXF1ZW5jeS52YWx1ZSA9IGZyZXEudG9TdHJpbmcoKTtcclxuICAgICAgICB2YXIgZnJlcV9jaGFuZ2U6IG51bWJlciA9IE1hdGguZmxvb3IodGhpcy5yYW5kKDQsIDIwKSlcclxuICAgICAgICBmcmVxID0gdGhpcy5nZXRMb3dlck5vdGUoZnJlcSwgZnJlcV9jaGFuZ2UpO1xyXG4gICAgICAgIHRoaXMuaHRtbEZyZXF1ZW5jeVNsaWRlLnZhbHVlID0gZnJlcS50b1N0cmluZygpO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxBdHRhY2tUaW1lLnZhbHVlID0gXCIwLjAwMVwiO1xyXG4gICAgICAgIHRoaXMuaHRtbERlY2F5VGltZS52YWx1ZSA9IFwiMC4wMDFcIjtcclxuICAgICAgICB2YXIgc3VzdGFpbjogbnVtYmVyID0gKDAuMSArIHRoaXMucmFuZCgwLjIpKTtcclxuICAgICAgICB0aGlzLmh0bWxTdXN0YWluVGltZS52YWx1ZSA9IHN1c3RhaW4udG9TdHJpbmcoKTtcclxuICAgICAgICB2YXIgcmVsZWFzZTogbnVtYmVyID0gKDAuMSArIHRoaXMucmFuZCgwLjM1KSk7XHJcbiAgICAgICAgdGhpcy5odG1sUmVsZWFzZVRpbWUudmFsdWUgPSByZWxlYXNlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrUHVuY2hWb2x1bWUudmFsdWUgPSBcIjFcIjtcclxuXHJcbiAgICAgICAgdmFyIHRpbWU6IG51bWJlciA9IDAuMDAyICsgc3VzdGFpbiArIHJlbGVhc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sRGVsYXlGcmVxdWVuY3lNdWx0LnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJhbmQoMykgPiAyKSB7XHJcbiAgICAgICAgICAgIHZhciB2aWJyYXRvX3NoaWZ0OiBudW1iZXIgPSB0aGlzLnJhbmQoMC4yNSk7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9UaW1lLnZhbHVlID0gKDEgLSB2aWJyYXRvX3NoaWZ0KS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxWaWJyYXRvU2hpZnRUaW1lLnZhbHVlID0gdmlicmF0b19zaGlmdC50b1N0cmluZygpXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9GcmVxdWVuY3kudmFsdWUgPSBNYXRoLmZsb29yKHRoaXMucmFuZCgyLCAyMSkpLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgdGhpcy5odG1sVmlicmF0b1dhdmUudmFsdWUgPSB0aGlzLkFyclJhbmQoWydzYXd0b290aCcsXHJcbiAgICAgICAgICAgICAgICAndHJpYW5nbGUnLFxyXG4gICAgICAgICAgICAgICAgJ3NpbmUnLFxyXG4gICAgICAgICAgICAgICAgJ3NxdWFyZSddKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9UaW1lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9TaGlmdFRpbWUudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5odG1sVmlicmF0b0ZyZXF1ZW5jeS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxWaWJyYXRvV2F2ZS52YWx1ZSA9IFwic2luZVwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5odG1sTG93UGFzc0ZyZXF1ZW5jeS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbEhpUGFzc0ZyZXF1ZW5jeS52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB2YXIgcnZhbDogbnVtYmVyID0gdGhpcy5yYW5kKDMpO1xyXG5cclxuICAgICAgICBpZiAocnZhbCA+IDIpIHtcclxuICAgICAgICAgICAgZnJlcSA9IHRoaXMuZ2V0SGlnaGVyTm90ZShmcmVxLCBNYXRoLmZsb29yKGZyZXFfY2hhbmdlIC8gMikpO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5LnZhbHVlID0gZnJlcS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChydmFsID4gMSkge1xyXG4gICAgICAgICAgICBmcmVxID0gdGhpcy5nZXRIaWdoZXJOb3RlKGZyZXEsIGZyZXFfY2hhbmdlKTtcclxuICAgICAgICAgICAgdGhpcy5odG1sSGlQYXNzRnJlcXVlbmN5LnZhbHVlID0gZnJlcS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRGVsYXlUaW1lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRmVlZGJhY2tWb2x1bWUudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdmFyIHJhbmRfZHV0eTogbnVtYmVyID0gdGhpcy5yYW5kKDMpO1xyXG5cclxuICAgICAgICBpZiAocmFuZF9kdXR5ID4gMikge1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVMZW5ndGgudmFsdWUgPSB0aGlzLnJhbmQoMC4wNSwgdGltZSAvIDUpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZVBjdC52YWx1ZSA9IHRoaXMucmFuZCgwLjI1KS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5odG1sRHV0eUN5Y2xlTGVuZ3RoLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZVBjdC52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHJ2YWwgPSB0aGlzLnJhbmQoMyk7XHJcblxyXG4gICAgICAgIGlmIChydmFsID4gMikge1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxGbGFuZ2VEZWxheVRpbWUudmFsdWUgPSB0aGlzLnJhbmQoMC4zKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxGbGFuZ2VGZWVkYmFja1ZvbHVtZS52YWx1ZSA9IHRoaXMucmFuZCgwLjUpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBIaXQgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMucmFuZCgzKSA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5odG1sV2F2ZVR5cGUudmFsdWUgPSAnbm9pc2UnO1xyXG4gICAgICAgICAgICB2YXIgZGV0dW5lOiBudW1iZXIgPSAtKHRoaXMucmFuZCgyMCkpO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZS52YWx1ZSA9IGRldHVuZS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBkZXR1bmUgLT0gNDAgKyB0aGlzLnJhbmQoNDApO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZVNsaWRlLnZhbHVlID0gZGV0dW5lLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZVNsaWRlLnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmh0bWxXYXZlVHlwZS52YWx1ZSA9IHRoaXMuQXJyUmFuZChbJ3NxdWFyZScsICdzYXd0b290aCcsICd0cmlhbmdsZSddKTtcclxuICAgICAgICAgICAgdGhpcy5odG1sRnJlcXVlbmN5LnZhbHVlID0gdGhpcy5nZXROb3RlKDQwMCwgNjAwKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxGcmVxdWVuY3lTbGlkZS52YWx1ZSA9IHRoaXMuZ2V0Tm90ZSgxLCA4MCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbEF0dGFja1RpbWUudmFsdWUgPSBcIjAuMDAxXCI7XHJcbiAgICAgICAgdGhpcy5odG1sRGVjYXlUaW1lLnZhbHVlID0gXCIwLjAwMVwiO1xyXG4gICAgICAgIHRoaXMuaHRtbFN1c3RhaW5UaW1lLnZhbHVlID0gKDAuMDAxICsgdGhpcy5yYW5kKDAuMDEpKS50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuaHRtbFJlbGVhc2VUaW1lLnZhbHVlID0gKDAuMDUgKyB0aGlzLnJhbmQoMC4xNSkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrUHVuY2hWb2x1bWUudmFsdWUgPSBcIjFcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sRGVsYXlGcmVxdWVuY3lNdWx0LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sRGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3QudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sVmlicmF0b0ZyZXF1ZW5jeS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9GcmVxdWVuY3kudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmh0bWxWaWJyYXRvU2hpZnRUaW1lLnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbEhpUGFzc0ZyZXF1ZW5jeS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbExvd1Bhc3NGcmVxdWVuY3kudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5UmFtcC52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxGbGFuZ2VEZWxheVRpbWUudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmh0bWxGbGFuZ2VGZWVkYmFja1ZvbHVtZS52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVMZW5ndGgudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVQY3QudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sR2Fpbi52YWx1ZSA9IFwiMVwiO1xyXG4gICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBFeHBsb3Npb24gPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgdGhpcy5odG1sV2F2ZVR5cGUudmFsdWUgPSAnbm9pc2UnO1xyXG4gICAgICAgIHRoaXMuaHRtbFNsaWRlVHlwZS52YWx1ZSA9IFwibGluZWFyXCI7XHJcblxyXG4gICAgICAgIHZhciBkZXR1bmU6IG51bWJlciA9IC0odGhpcy5yYW5kKDIwKSk7XHJcbiAgICAgICAgdGhpcy5odG1sTm9pc2VEZXR1bmUudmFsdWUgPSBkZXR1bmUudG9TdHJpbmcoKTtcclxuICAgICAgICBkZXR1bmUgLT0gdGhpcy5yYW5kKDQwKTtcclxuICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZVNsaWRlLnZhbHVlID0gZGV0dW5lLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJhbmQoMikgPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZUxlbmd0aC52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVQY3QudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZUxlbmd0aC52YWx1ZSA9ICgwLjAxICsgdGhpcy5yYW5kKDAuMDQpKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVQY3QudmFsdWUgPSAoMC4xICsgdGhpcy5yYW5kKDAuNCkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmh0bWxBdHRhY2tUaW1lLnZhbHVlID0gXCIwLjAwMVwiO1xyXG4gICAgICAgIHRoaXMuaHRtbERlY2F5VGltZS52YWx1ZSA9ICgwLjAxICsgdGhpcy5yYW5kKDAuMDgpKS50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuaHRtbFN1c3RhaW5UaW1lLnZhbHVlID0gKDAuMDUgKyB0aGlzLnJhbmQoMC4yKSkudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmh0bWxSZWxlYXNlVGltZS52YWx1ZSA9ICgwLjIgKyB0aGlzLnJhbmQoMC4zNSkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrUHVuY2hWb2x1bWUudmFsdWUgPSB0aGlzLnJhbmQoMSwgNikudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRGVsYXlUaW1lLnZhbHVlID0gdGhpcy5yYW5kKDAuNikudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmh0bWxGbGFuZ2VGZWVkYmFja1ZvbHVtZS52YWx1ZSA9IHRoaXMucmFuZCgwLjMpLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sRGVsYXlGcmVxdWVuY3lNdWx0LnZhbHVlID0gXCIwXCI7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmh0bWxWaWJyYXRvVGltZS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9TaGlmdFRpbWUudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmh0bWxWaWJyYXRvRnJlcXVlbmN5LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sVmlicmF0b1dhdmUudmFsdWUgPSBcInNpbmVcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sTG93UGFzc0ZyZXF1ZW5jeS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbExvd1Bhc3NGcmVxdWVuY3lSYW1wLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sSGlQYXNzRnJlcXVlbmN5LnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgIHZhciBydmFsOiBudW1iZXIgPSB0aGlzLnJhbmQoMyk7XHJcblxyXG4gICAgICAgIGlmIChydmFsID4gMikge1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5LnZhbHVlID0gdGhpcy5yYW5kKDEwMDAsIDIwMDApLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbExvd1Bhc3NGcmVxdWVuY3lSYW1wLnZhbHVlID0gdGhpcy5yYW5kKDUwMCwgMTAwMCkudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRGVsYXlUaW1lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRmVlZGJhY2tWb2x1bWUudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBQaWNrdXAgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgdGhpcy5odG1sV2F2ZVR5cGUudmFsdWUgPSAnc3F1YXJlJztcclxuICAgICAgICB0aGlzLmh0bWxGcmVxdWVuY3kudmFsdWUgPSB0aGlzLmdldE5vdGUoNDAwLCAxMjAwKS50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuaHRtbEZyZXF1ZW5jeVNsaWRlLnZhbHVlID0gXCIwXCJcclxuICAgICAgICB0aGlzLmh0bWxTbGlkZVR5cGUudmFsdWUgPSBcIm5vbmVcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrVGltZS52YWx1ZSA9IFwiMC4wMDFcIjtcclxuICAgICAgICB2YXIgZGVjYXk6IG51bWJlciA9ICgwLjAwMSArIHRoaXMucmFuZCgwLjAyKSk7XHJcbiAgICAgICAgdGhpcy5odG1sRGVjYXlUaW1lLnZhbHVlID0gZGVjYXkudG9TdHJpbmcoKTtcclxuICAgICAgICB2YXIgc3VzdGFpbjogbnVtYmVyID0gKDAuMDUgKyB0aGlzLnJhbmQoMC4xKSk7XHJcbiAgICAgICAgdGhpcy5odG1sU3VzdGFpblRpbWUudmFsdWUgPSBzdXN0YWluLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdmFyIHJlbGVhc2U6IG51bWJlciA9IHN1c3RhaW4gKiB0aGlzLnJhbmQoMi41LCA0LjApO1xyXG4gICAgICAgIHRoaXMuaHRtbFJlbGVhc2VUaW1lLnZhbHVlID0gcmVsZWFzZS50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuaHRtbEF0dGFja1B1bmNoVm9sdW1lLnZhbHVlID0gdGhpcy5yYW5kKDEsIDIpLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbE5vaXNlRGV0dW5lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sTm9pc2VEZXR1bmVTbGlkZS52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICAvLyAgICAgICAgdmFyIHRpbWUgPSAwLjAwMSArIGRlY2F5ICsgc3VzdGFpbiArIHJlbGVhc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0LnZhbHVlID0gdGhpcy5yYW5kKDAuMTUsIDAuMikudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmh0bWxEZWxheUZyZXF1ZW5jeU11bHQudmFsdWUgPSBcIjJcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sVmlicmF0b0ZyZXF1ZW5jeS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9GcmVxdWVuY3kudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmh0bWxWaWJyYXRvU2hpZnRUaW1lLnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbEZsYW5nZURlbGF5VGltZS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbEZsYW5nZUZlZWRiYWNrVm9sdW1lLnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZUxlbmd0aC52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZVBjdC52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgSnVtcCA9ICgpOiB2b2lkID0+IHtcclxuICAgICAgICB0aGlzLmh0bWxXYXZlVHlwZS52YWx1ZSA9ICdzcXVhcmUnO1xyXG5cclxuICAgICAgICB2YXIgZnJlcTogbnVtYmVyID0gdGhpcy5nZXROb3RlKDQwMCwgNjAwKTtcclxuICAgICAgICB0aGlzLmh0bWxGcmVxdWVuY3kudmFsdWUgPSBmcmVxLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5odG1sSGlQYXNzRnJlcXVlbmN5LnZhbHVlID0gdGhpcy5nZXRMb3dlck5vdGUoZnJlcSkudG9TdHJpbmcoKTtcclxuICAgICAgICBmcmVxID0gdGhpcy5nZXRIaWdoZXJOb3RlKGZyZXEsIDQpO1xyXG4gICAgICAgIHRoaXMuaHRtbEZyZXF1ZW5jeVNsaWRlLnZhbHVlID0gZnJlcS50b1N0cmluZygpO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sTG93UGFzc0ZyZXF1ZW5jeVJhbXAudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdmFyIHJhbmQ6IG51bWJlciA9IHRoaXMucmFuZCgzKTtcclxuICAgICAgICBpZiAocmFuZCA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5odG1sSGlQYXNzRnJlcXVlbmN5LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbE5vaXNlRGV0dW5lU2xpZGUudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrVGltZS52YWx1ZSA9IFwiMC4wMDFcIjtcclxuICAgICAgICB0aGlzLmh0bWxEZWNheVRpbWUudmFsdWUgPSBcIjAuMDAxXCI7XHJcbiAgICAgICAgdGhpcy5odG1sU3VzdGFpblRpbWUudmFsdWUgPSAoMC4wMSArIHRoaXMucmFuZCgwLjEpKS50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuaHRtbFJlbGVhc2VUaW1lLnZhbHVlID0gKDAuMiArIHRoaXMucmFuZCgwLjI1KSkudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmh0bWxBdHRhY2tQdW5jaFZvbHVtZS52YWx1ZSA9ICgxLjEgKyBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygpO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxEZWxheUZyZXF1ZW5jeU11bHQudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmh0bWxEZWxheUZyZXF1ZW5jeVN0YXJ0VGltZVBjdC52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxWaWJyYXRvRnJlcXVlbmN5LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sVmlicmF0b0ZyZXF1ZW5jeS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbFZpYnJhdG9TaGlmdFRpbWUudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRGVsYXlUaW1lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRmVlZGJhY2tWb2x1bWUudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sRHV0eUN5Y2xlTGVuZ3RoLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sRHV0eUN5Y2xlUGN0LnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbEdhaW4udmFsdWUgPSBcIjFcIjtcclxuICAgICAgICAvLyAgICAgICAgdGhpcy5odG1sRGlzdG9ydGlvbi52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBQb3dlclVwID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgICAgIHRoaXMuaHRtbFdhdmVUeXBlLnZhbHVlID0gdGhpcy5BcnJSYW5kKFsnc3F1YXJlJywgJ3Nhd3Rvb3RoJ10pO1xyXG5cclxuICAgICAgICB2YXIgZnJlcTogbnVtYmVyID0gdGhpcy5nZXROb3RlKDQwMCwgMTIwMCk7XHJcbiAgICAgICAgdGhpcy5odG1sRnJlcXVlbmN5LnZhbHVlID0gZnJlcS50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuaHRtbEhpUGFzc0ZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuZ2V0TG93ZXJOb3RlKGZyZXEpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdmFyIGZyZXFfY2hhbmdlOiBudW1iZXIgPSBNYXRoLmZsb29yKHRoaXMucmFuZCgyLCA2KSlcclxuICAgICAgICBmcmVxID0gdGhpcy5nZXRIaWdoZXJOb3RlKGZyZXEsIGZyZXFfY2hhbmdlKTtcclxuICAgICAgICB0aGlzLmh0bWxGcmVxdWVuY3lTbGlkZS52YWx1ZSA9IGZyZXEudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sTG93UGFzc0ZyZXF1ZW5jeS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbExvd1Bhc3NGcmVxdWVuY3lSYW1wLnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbE5vaXNlRGV0dW5lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sTm9pc2VEZXR1bmVTbGlkZS52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxBdHRhY2tUaW1lLnZhbHVlID0gXCIwLjAwMVwiO1xyXG4gICAgICAgIHRoaXMuaHRtbERlY2F5VGltZS52YWx1ZSA9IFwiMC4wMDFcIjtcclxuICAgICAgICB2YXIgc3VzdGFpbjogbnVtYmVyID0gdGhpcy5yYW5kKDAuMjUpO1xyXG4gICAgICAgIHRoaXMuaHRtbFN1c3RhaW5UaW1lLnZhbHVlID0gc3VzdGFpbi50b1N0cmluZygpO1xyXG4gICAgICAgIHZhciByZWxlYXNlOiBudW1iZXIgPSAoMC4zICsgdGhpcy5yYW5kKDAuNCkpO1xyXG4gICAgICAgIHRoaXMuaHRtbFJlbGVhc2VUaW1lLnZhbHVlID0gcmVsZWFzZS50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuaHRtbEF0dGFja1B1bmNoVm9sdW1lLnZhbHVlID0gKDEuMSArIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdmFyIHRpbWU6IG51bWJlciA9IHN1c3RhaW4gKyByZWxlYXNlIC0gMC4wMDI7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5TXVsdC52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0LnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJhbmQoMykgPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9GcmVxdWVuY3kudmFsdWUgPSBNYXRoLmZsb29yKHRoaXMucmFuZCgyLCAyNSkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9UaW1lLnZhbHVlID0gdGltZS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxWaWJyYXRvU2hpZnRUaW1lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9XYXZlLnZhbHVlID0gdGhpcy5BcnJSYW5kKFsnc2F3dG9vdGgnLFxyXG4gICAgICAgICAgICAgICAgJ3RyaWFuZ2xlJyxcclxuICAgICAgICAgICAgICAgICdzaW5lJyxcclxuICAgICAgICAgICAgICAgICdzcXVhcmUnXSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVMZW5ndGgudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5odG1sRHV0eUN5Y2xlUGN0LnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxWaWJyYXRvRnJlcXVlbmN5LnZhbHVlID0gJzAnO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxWaWJyYXRvVGltZS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxWaWJyYXRvU2hpZnRUaW1lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9XYXZlLnZhbHVlID0gJ3NxdWFyZSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVMZW5ndGgudmFsdWUgPSB0aGlzLnJhbmQodGltZSAvIDEwKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVQY3QudmFsdWUgPSB0aGlzLnJhbmQoMC4xLCAwLjIpLnRvU3RyaW5nKCk7O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRGVsYXlUaW1lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgdGhpcy5odG1sRmxhbmdlRmVlZGJhY2tWb2x1bWUudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sR2Fpbi52YWx1ZSA9IFwiMVwiO1xyXG4gICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgICAgIC8vICAgICAgICB0aGlzLmh0bWxEaXN0b3J0aW9uLnZhbHVlID0gXCIwXCI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIFBvd2VyRG93biA9ICgpOiB2b2lkID0+IHtcclxuICAgICAgICB0aGlzLmh0bWxXYXZlVHlwZS52YWx1ZSA9IHRoaXMuQXJyUmFuZChbJ3NxdWFyZScsICdzYXd0b290aCddKTtcclxuXHJcbiAgICAgICAgdmFyIGZyZXE6IG51bWJlciA9IHRoaXMuZ2V0Tm90ZSg2MDAsIDEyMDApO1xyXG4gICAgICAgIHRoaXMuaHRtbEZyZXF1ZW5jeS52YWx1ZSA9IGZyZXEudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLmh0bWxIaVBhc3NGcmVxdWVuY3kudmFsdWUgPSB0aGlzLmdldExvd2VyTm90ZShmcmVxKS50b1N0cmluZygpO1xyXG4gICAgICAgIHZhciBmcmVxX2NoYW5nZTogbnVtYmVyID0gTWF0aC5mbG9vcih0aGlzLnJhbmQoNCwgMTMpKVxyXG4gICAgICAgIGZyZXEgPSB0aGlzLmdldExvd2VyTm90ZShmcmVxLCBmcmVxX2NoYW5nZSk7XHJcbiAgICAgICAgdGhpcy5odG1sRnJlcXVlbmN5U2xpZGUudmFsdWUgPSBmcmVxLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbExvd1Bhc3NGcmVxdWVuY3kudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmh0bWxMb3dQYXNzRnJlcXVlbmN5UmFtcC52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxOb2lzZURldHVuZS52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbE5vaXNlRGV0dW5lU2xpZGUudmFsdWUgPSBcIjBcIjtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sQXR0YWNrVGltZS52YWx1ZSA9IFwiMC4wMDFcIjtcclxuICAgICAgICB0aGlzLmh0bWxEZWNheVRpbWUudmFsdWUgPSBcIjAuMDAxXCI7XHJcbiAgICAgICAgdmFyIHN1c3RhaW46IG51bWJlciA9IHRoaXMucmFuZCgwLjIpO1xyXG4gICAgICAgIHRoaXMuaHRtbFN1c3RhaW5UaW1lLnZhbHVlID0gc3VzdGFpbi50b1N0cmluZygpO1xyXG4gICAgICAgIHZhciByZWxlYXNlOiBudW1iZXIgPSAoMC40ICsgdGhpcy5yYW5kKDAuOCkpO1xyXG4gICAgICAgIHRoaXMuaHRtbFJlbGVhc2VUaW1lLnZhbHVlID0gcmVsZWFzZS50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMuaHRtbEF0dGFja1B1bmNoVm9sdW1lLnZhbHVlID0gKDEuMSArIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdmFyIHRpbWU6IG51bWJlciA9IHN1c3RhaW4gKyByZWxlYXNlIC0gMC4wMDI7XHJcblxyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5TXVsdC52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgIHRoaXMuaHRtbERlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0LnZhbHVlID0gXCIwXCI7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJhbmQoMykgPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9GcmVxdWVuY3kudmFsdWUgPSBNYXRoLmZsb29yKHRoaXMucmFuZCgyLCAyNSkpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9UaW1lLnZhbHVlID0gXCIxXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9TaGlmdFRpbWUudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5odG1sVmlicmF0b1dhdmUudmFsdWUgPSB0aGlzLkFyclJhbmQoWydzYXd0b290aCcsXHJcbiAgICAgICAgICAgICAgICAndHJpYW5nbGUnLFxyXG4gICAgICAgICAgICAgICAgJ3NpbmUnLFxyXG4gICAgICAgICAgICAgICAgJ3NxdWFyZSddKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZUxlbmd0aC52YWx1ZSA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmh0bWxEdXR5Q3ljbGVQY3QudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9GcmVxdWVuY3kudmFsdWUgPSAnMCc7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9UaW1lLnZhbHVlID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbFZpYnJhdG9TaGlmdFRpbWUudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5odG1sVmlicmF0b1dhdmUudmFsdWUgPSAnc3F1YXJlJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZUxlbmd0aC52YWx1ZSA9IHRoaXMucmFuZCh0aW1lIC8gMTApLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaHRtbER1dHlDeWNsZVBjdC52YWx1ZSA9IHRoaXMucmFuZCgwLjEsIDAuMikudG9TdHJpbmcoKTs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmh0bWxGbGFuZ2VEZWxheVRpbWUudmFsdWUgPSBcIjBcIjtcclxuICAgICAgICB0aGlzLmh0bWxGbGFuZ2VGZWVkYmFja1ZvbHVtZS52YWx1ZSA9IFwiMFwiO1xyXG5cclxuICAgICAgICB0aGlzLmh0bWxHYWluLnZhbHVlID0gXCIxXCI7XHJcbiAgICAgICAgdGhpcy5wbGF5KCk7XHJcbiAgICAgICAgLy8gICAgICAgIHRoaXMuaHRtbERpc3RvcnRpb24udmFsdWUgPSBcIjBcIjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbm90ZXM6IEFycmF5PG51bWJlcj4gPSBbNzkwMi4xMywgNzQ1OC42MiwgNzA0MC4wMCwgNjY0NC44OCwgNjI3MS45MywgNTkxOS45MSxcclxuICAgICAgICA1NTg3LjY1LCA1Mjc0LjA0LCA0OTc4LjAzLCA0Njk4LjY0LCA0NDM0LjkyLCA0MTg2LjAxLFxyXG4gICAgICAgIDM5NTEuMDcsIDM3MjkuMzEsIDM1MjAuMDAsIDMzMjIuNDQsIDMxMzUuOTYsIDI5NTkuOTYsXHJcbiAgICAgICAgMjc5My44MywgMjYzNy4wMiwgMjQ4OS4wMiwgMjM0OS4zMiwgMjIxNy40NiwgMjA5My4wMCxcclxuICAgICAgICAxOTc1LjUzLCAxODY0LjY2LCAxNzYwLjAwLCAxNjYxLjIyLCAxNTY3Ljk4LCAxNDc5Ljk4LFxyXG4gICAgICAgIDEzOTYuOTEsIDEzMTguNTEsIDEyNDQuNTEsIDExNzQuNjYsIDExMDguNzMsIDEwNDYuNTAsXHJcbiAgICAgICAgOTg3Ljc2NywgOTMyLjMyOCwgODgwLjAwMCwgODMwLjYwOSwgNzgzLjk5MSxcclxuICAgICAgICA2OTguNDU2LCA2NTkuMjU1LCA2MjIuMjU0LCA1ODcuMzMwLCA1NTQuMzY1LCA1MjMuMjUxLFxyXG4gICAgICAgIDQ5My44ODMsIDQ2Ni4xNjQsIDQ0MC4wMDAsIDQxNS4zMDUsIDM5MS45OTUsIDM2OS45OTQsXHJcbiAgICAgICAgMzQ5LjIyOCwgMzI5LjYyOCwgMzExLjEyNywgMjkzLjY2NSwgMjc3LjE4MywgMjYxLjYyNixcclxuICAgICAgICAyNDYuOTQyLCAyMzMuMDgyLCAyMjAuMDAwLCAyMDcuNjUyLCAxOTUuOTk4LCAxODQuOTk3LC8vLS1jaXViXHJcbiAgICAgICAgMTc0LjYxNCwgMTY0LjgxNCwgMTU1LjU2MywgMTQ2LjgzMiwgMTM4LjU5MSwgMTMwLjgxMyxcclxuICAgICAgICAxMjMuNDcxLCAxMTYuNTQxLCAxMTAuMDAwLCAxMDMuODI2LCA5Ny45OTg5LCA5Mi40OTg2LFxyXG4gICAgICAgIDg3LjMwNzEsIDgyLjQwNjksIDc3Ljc4MTcsIDczLjQxNjIsIDY5LjI5NTcsIDY1LjQwNjQsXHJcbiAgICAgICAgNjEuNzM1NCwgNTguMjcwNSwgNTUuMDAwMCwgNTEuOTEzMSwgNDguOTk5NCwgNDYuMjQ5MyxcclxuICAgICAgICA0My42NTM1LCA0MS4yMDM0LCAzOC44OTA5LCAzNi43MDgxLCAzNC42NDc4LCAzMi43MDMyXTtcclxuXHJcbiAgICBwdWJsaWMgR2V0RWxlbWVudCA9IChpZDogc3RyaW5nKTogYW55ID0+IHtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBVcGRhdGVMb29wID0gKCkgPT4ge1xyXG4gICAgICAgIHNldFRpbWVvdXQodGhpcy5VcGRhdGVMb29wLCAxMDApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tb3VzZURvd24gPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgd2F2ZV90eXBlOiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndhdmVUeXBlXCIpO1xyXG4gICAgICAgIHZhciB3YXZlX3NlbGVjdDogYW55ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3YXZlVHlwZVZpc3VhbFwiKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaTogbnVtYmVyID0gMDsgaSA8IHdhdmVfc2VsZWN0LmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgd2F2ZV9zZWxlY3QuY2hpbGROb2Rlc1tpXS5zdHlsZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICBpZiAod2F2ZV9zZWxlY3QuY2hpbGROb2Rlc1tpXS5pZCA9PT0gd2F2ZV90eXBlLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB3YXZlX3NlbGVjdC5jaGlsZE5vZGVzW2ldLnN0eWxlID0gXCJiYWNrZ3JvdW5kLWNvbG9yOiBvcmFuZ2VyZWRcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHNsaWRlX3R5cGU6IGFueSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2xpZGVUeXBlXCIpO1xyXG5cclxuICAgICAgICB2YXIgc2xpZGVfc2VsZWN0OiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNsaWRlVHlwZVZpc3VhbFwiKTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc2xpZGVfc2VsZWN0LmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgc2xpZGVfc2VsZWN0LmNoaWxkTm9kZXNbaV0uc3R5bGUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNsaWRlX3NlbGVjdC5jaGlsZE5vZGVzW2ldLmlkID09PSBzbGlkZV90eXBlLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBzbGlkZV9zZWxlY3QuY2hpbGROb2Rlc1tpXS5zdHlsZSA9IFwiYmFja2dyb3VuZC1jb2xvcjogb3JhbmdlcmVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB2aWJyYXRvX3R5cGU6IGFueSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlicmF0b1dhdmVcIik7XHJcblxyXG4gICAgICAgIHZhciB2aWJyYXRvX3NlbGVjdDogYW55ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2aWJyYXRvV2F2ZVZpc3VhbFwiKTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdmlicmF0b19zZWxlY3QuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2aWJyYXRvX3NlbGVjdC5jaGlsZE5vZGVzW2ldLnN0eWxlID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgIGlmICh2aWJyYXRvX3NlbGVjdC5jaGlsZE5vZGVzW2ldLmlkID09PSBcInZcIiArIHZpYnJhdG9fdHlwZS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmlicmF0b19zZWxlY3QuY2hpbGROb2Rlc1tpXS5zdHlsZSA9IFwiYmFja2dyb3VuZC1jb2xvcjogb3JhbmdlcmVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuU3luY1NsaWRlcnMoKTtcclxuICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuR2V0RWxlbWVudChcImZyZXF1ZW5jeVNsaWRlclwiKS52YWx1ZSA9IHRoaXMuR2V0RWxlbWVudChcImZyZXF1ZW5jeVwiKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkdldEVsZW1lbnQoXCJmcmVxdWVuY3lTbGlkZVNsaWRlclwiKS52YWx1ZSA9IHRoaXMuR2V0RWxlbWVudChcImZyZXF1ZW5jeVNsaWRlXCIpLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuR2V0RWxlbWVudChcImRlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0U2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwiZGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3RcIikudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5HZXRFbGVtZW50KFwiZGVsYXlGcmVxdWVuY3lNdWx0U2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwiZGVsYXlGcmVxdWVuY3lNdWx0XCIpLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuR2V0RWxlbWVudChcInZpYnJhdG9UaW1lU2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwidmlicmF0b1RpbWVcIikudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5HZXRFbGVtZW50KFwidmlicmF0b1RpbWVTbGlkZXJcIikudmFsdWUgPSB0aGlzLkdldEVsZW1lbnQoXCJ2aWJyYXRvVGltZVwiKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkdldEVsZW1lbnQoXCJ2aWJyYXRvRnJlcXVlbmN5U2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwidmlicmF0b0ZyZXF1ZW5jeVwiKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkdldEVsZW1lbnQoXCJ2aWJyYXRvU2hpZnRUaW1lU2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwidmlicmF0b1NoaWZ0VGltZVwiKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkdldEVsZW1lbnQoXCJsb3dQYXNzRnJlcXVlbmN5U2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwibG93UGFzc0ZyZXF1ZW5jeVwiKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkdldEVsZW1lbnQoXCJsb3dQYXNzRnJlcXVlbmN5UmFtcFNsaWRlclwiKS52YWx1ZSA9IHRoaXMuR2V0RWxlbWVudChcImxvd1Bhc3NGcmVxdWVuY3lSYW1wXCIpLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuR2V0RWxlbWVudChcImhpUGFzc0ZyZXF1ZW5jeVNsaWRlclwiKS52YWx1ZSA9IHRoaXMuR2V0RWxlbWVudChcImhpUGFzc0ZyZXF1ZW5jeVwiKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkdldEVsZW1lbnQoXCJhdHRhY2tUaW1lU2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwiYXR0YWNrVGltZVwiKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkdldEVsZW1lbnQoXCJkZWNheVRpbWVTbGlkZXJcIikudmFsdWUgPSB0aGlzLkdldEVsZW1lbnQoXCJkZWNheVRpbWVcIikudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5HZXRFbGVtZW50KFwic3VzdGFpblRpbWVTbGlkZXJcIikudmFsdWUgPSB0aGlzLkdldEVsZW1lbnQoXCJzdXN0YWluVGltZVwiKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkdldEVsZW1lbnQoXCJyZWxlYXNlVGltZVNsaWRlclwiKS52YWx1ZSA9IHRoaXMuR2V0RWxlbWVudChcInJlbGVhc2VUaW1lXCIpLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuR2V0RWxlbWVudChcImF0dGFja1B1bmNoVm9sdW1lU2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwiYXR0YWNrUHVuY2hWb2x1bWVcIikudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5HZXRFbGVtZW50KFwiZmxhbmdlRGVsYXlUaW1lU2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwiZmxhbmdlRGVsYXlUaW1lXCIpLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuR2V0RWxlbWVudChcImZsYW5nZUZlZWRiYWNrVm9sdW1lU2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwiZmxhbmdlRmVlZGJhY2tWb2x1bWVcIikudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5HZXRFbGVtZW50KFwiZHV0eUN5Y2xlTGVuZ3RoU2xpZGVyXCIpLnZhbHVlID0gdGhpcy5HZXRFbGVtZW50KFwiZHV0eUN5Y2xlTGVuZ3RoXCIpLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuR2V0RWxlbWVudChcImR1dHlDeWNsZVBjdFNsaWRlclwiKS52YWx1ZSA9IHRoaXMuR2V0RWxlbWVudChcImR1dHlDeWNsZVBjdFwiKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLkdldEVsZW1lbnQoXCJub2lzZURldHVuZVNsaWRlclwiKS52YWx1ZSA9IHRoaXMuR2V0RWxlbWVudChcIm5vaXNlRGV0dW5lXCIpLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuR2V0RWxlbWVudChcIm5vaXNlRGV0dW5lU2xpZGVTbGlkZXJcIikudmFsdWUgPSB0aGlzLkdldEVsZW1lbnQoXCJub2lzZURldHVuZVNsaWRlXCIpLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuR2V0RWxlbWVudChcImdhaW5TbGlkZXJcIikudmFsdWUgPSB0aGlzLkdldEVsZW1lbnQoXCJnYWluXCIpLnZhbHVlO1xyXG4gICAgICAgICAgKi9cclxuICAgIH1cclxuICAgIC8qXHJcbiAgICAgICAgICAgIHB1YmxpYyBTeW5jRWxlbWVudHMgPSAoIGVsZW1lbnQ6IGFueSwgaWQ6IHN0cmluZyApOiB2b2lkID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50XzI6IGFueSA9IHRoaXMuR2V0RWxlbWVudChpZCk7XHJcbiAgICAgICAgICAgICAgICBpZiggZWxlbWVudC52YWx1ZSAhPT0gZWxlbWVudF8yLnZhbHVlICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRfMi52YWx1ZSA9IGVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICovXHJcbiAgICBwdWJsaWMgU2xpZGVDbGljayA9IChzbGlkZTogYW55KTogdm9pZCA9PiB7XHJcbiAgICAgICAgdmFyIHNsaWRlX3NlbGVjdDogYW55ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzbGlkZVR5cGVWaXN1YWxcIik7XHJcbiAgICAgICAgZm9yICh2YXIgaTogbnVtYmVyID0gMDsgaSA8IHNsaWRlX3NlbGVjdC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHNsaWRlX3NlbGVjdC5jaGlsZE5vZGVzW2ldLnN0eWxlID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2xpZGUuc3R5bGUgPSBcImJhY2tncm91bmQtY29sb3I6IG9yYW5nZXJlZFwiO1xyXG5cclxuICAgICAgICB2YXIgc2xpZGVfdHlwZTogYW55ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzbGlkZVR5cGVcIik7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNsaWRlX3R5cGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoc2xpZGVfdHlwZS5jaGlsZE5vZGVzW2ldLnZhbHVlID09PSBzbGlkZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgc2xpZGVfdHlwZS5jaGlsZE5vZGVzW2ldLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNsaWRlX3R5cGUuY2hpbGROb2Rlc1tpXS5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBXYXZlQ2xpY2sod2F2ZTogYW55KSB7XHJcbiAgICAgICAgdmFyIHdhdmVfc2VsZWN0OiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndhdmVUeXBlVmlzdWFsXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGk6IG51bWJlciA9IDA7IGkgPCB3YXZlX3NlbGVjdC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHdhdmVfc2VsZWN0LmNoaWxkTm9kZXNbaV0uc3R5bGUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3YXZlLnN0eWxlID0gXCJiYWNrZ3JvdW5kLWNvbG9yOiBvcmFuZ2VyZWRcIjtcclxuXHJcbiAgICAgICAgdmFyIHdhdmVfdHlwZTogYW55ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3YXZlVHlwZVwiKTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgd2F2ZV90eXBlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHdhdmVfdHlwZS5jaGlsZE5vZGVzW2ldLnZhbHVlID09PSB3YXZlLmlkKSB7XHJcbiAgICAgICAgICAgICAgICB3YXZlX3R5cGUuY2hpbGROb2Rlc1tpXS5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3YXZlX3R5cGUuY2hpbGROb2Rlc1tpXS5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgVmlicmF0b1dhdmVDbGljayA9ICh3YXZlOiBhbnkpOiB2b2lkID0+IHtcclxuICAgICAgICB2YXIgd2F2ZV9zZWxlY3Q6IGFueSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlicmF0b1dhdmVWaXN1YWxcIik7XHJcbiAgICAgICAgZm9yICh2YXIgaTogbnVtYmVyID0gMDsgaSA8IHdhdmVfc2VsZWN0LmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgd2F2ZV9zZWxlY3QuY2hpbGROb2Rlc1tpXS5zdHlsZSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdhdmUuc3R5bGUgPSBcImJhY2tncm91bmQtY29sb3I6IG9yYW5nZXJlZFwiO1xyXG5cclxuICAgICAgICB2YXIgd2F2ZV90eXBlOiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpYnJhdG9XYXZlXCIpO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB3YXZlX3R5cGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoXCJ2XCIgKyB3YXZlX3R5cGUuY2hpbGROb2Rlc1tpXS52YWx1ZSA9PT0gd2F2ZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgd2F2ZV90eXBlLmNoaWxkTm9kZXNbaV0uc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2F2ZV90eXBlLmNoaWxkTm9kZXNbaV0uc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBsYXkgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgdGhpcy5SZXNldFZhbHVlcygpO1xyXG4gICAgICAgIFNGWFdlYi5TTi5QbGF5U291bmQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5odG1sQ29kZUFyZWEuc2VsZWN0KCk7XHJcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJDb3B5XCIpO1xyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuXHJcbi8qXHJcbkpTT04ucGFyc2UoYFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBcIndhdmVUeXBlXCI6IFwibm9pc2VcIixcclxuICAgICAgICAgICAgICAgIFwiZnJlcXVlbmN5XCI6IDQ0MCxcclxuICAgICAgICAgICAgICAgIFwiZnJlcXVlbmN5U2xpZGVcIjogMCxcclxuICAgICAgICAgICAgICAgIFwiZGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3RcIjogMCxcclxuICAgICAgICAgICAgICAgIFwiZGVsYXlGcmVxdWVuY3lNdWx0XCI6IDAsXHJcbiAgICAgICAgICAgICAgICBcInZpYnJhdG9UaW1lXCI6IDAsXHJcbiAgICAgICAgICAgICAgICBcInZpYnJhdG9TaGlmdFRpbWVcIjogMCxcclxuICAgICAgICAgICAgICAgIFwidmlicmF0b0ZyZXF1ZW5jeVwiOiAwLFxyXG4gICAgICAgICAgICAgICAgXCJ2aWJyYXRvV2F2ZVwiOiBcInNpbmVcIixcclxuICAgICAgICAgICAgICAgIFwibG93UGFzc0ZyZXF1ZW5jeVwiOiAxOTU4LFxyXG4gICAgICAgICAgICAgICAgXCJsb3dQYXNzRnJlcXVlbmN5UmFtcFwiOiA4NjgsXHJcbiAgICAgICAgICAgICAgICBcImhpUGFzc0ZyZXF1ZW5jeVwiOiAwLFxyXG4gICAgICAgICAgICAgICAgXCJhdHRhY2tUaW1lXCI6IDAuMDAxLFxyXG4gICAgICAgICAgICAgICAgXCJkZWNheVRpbWVcIjogMC4wMzgwNzIzNjg3Nzk5NzU1NSxcclxuICAgICAgICAgICAgICAgIFwic3VzdGFpblRpbWVcIjogMC4wNjgzMzM4NDI3MzM4OTM3MixcclxuICAgICAgICAgICAgICAgIFwicmVsZWFzZVRpbWVcIjogMC41MDA5Mzc1OTE3OTYxNDU2LFxyXG4gICAgICAgICAgICAgICAgXCJhdHRhY2tQdW5jaFZvbHVtZVwiOiAyLjA4NzgwNzExMzg3NTc5NixcclxuICAgICAgICAgICAgICAgIFwiZHV0eUN5Y2xlTGVuZ3RoXCI6IDAuMDE4MzU4NDEzNTUwMDM5MTIsXHJcbiAgICAgICAgICAgICAgICBcImR1dHlDeWNsZVBjdFwiOiAwLjQzNzkxOTYyMDY0NDc4Nzk1LFxyXG4gICAgICAgICAgICAgICAgXCJmbGFuZ2VEZWxheVRpbWVcIjogMCxcclxuICAgICAgICAgICAgICAgIFwiZmxhbmdlRmVlZGJhY2tWb2x1bWVcIjogMCxcclxuICAgICAgICAgICAgICAgIFwiZ2FpblwiOiAxLFxyXG4gICAgICAgICAgICAgICAgXCJkaXN0b3J0aW9uXCI6IDAsXHJcbiAgICAgICAgICAgICAgICBcIm5vaXNlRGV0dW5lXCI6IC0xNCxcclxuICAgICAgICAgICAgICAgIFwibm9pc2VEZXR1bmVTbGlkZVwiOiAtMTgsXHJcbiAgICAgICAgICAgICAgICBcInNsaWRlVHlwZVwiOiBcImxpbmVhclwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYClcclxuKi8iXX0=
