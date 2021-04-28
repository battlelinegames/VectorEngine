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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRldi9TRlhEZWYudHMiLCJkZXYvU0ZYV2ViLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLGlFQUFpRTtBQUNqRSxpRUFBaUU7QUFDakUsaUVBQWlFO0FBQ2pFO0lBQUE7UUFDVyxhQUFRLEdBQVcsUUFBUSxDQUFDO1FBQzVCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFDM0IsK0JBQTBCLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZDLHVCQUFrQixHQUFXLENBQUMsQ0FBQztRQUUvQixnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUFDN0IscUJBQWdCLEdBQVcsQ0FBQyxDQUFDO1FBQzdCLGdCQUFXLEdBQVcsTUFBTSxDQUFDO1FBQzdCLHFCQUFnQixHQUFXLENBQUMsQ0FBQztRQUM3Qix5QkFBb0IsR0FBVyxDQUFDLENBQUM7UUFDakMsb0JBQWUsR0FBVyxDQUFDLENBQUM7UUFDNUIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLHNCQUFpQixHQUFXLENBQUMsQ0FBQyxDQUFDLHVEQUF1RDtRQUN0RixvQkFBZSxHQUFXLENBQUMsQ0FBQztRQUM1QixpQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixvQkFBZSxHQUFXLElBQUksQ0FBQztRQUMvQix5QkFBb0IsR0FBVyxHQUFHLENBQUM7UUFDbkMsU0FBSSxHQUFXLENBQUMsQ0FBQztRQUNqQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLHFCQUFnQixHQUFXLENBQUMsQ0FBQztRQUM3QixjQUFTLEdBQVcsUUFBUSxDQUFDO0lBQ3hDLENBQUM7SUFBRCxhQUFDO0FBQUQsQ0E1QkEsQUE0QkMsSUFBQTtBQ2hDRCxpRUFBaUU7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QyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3RCLENBQUM7UUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUN0QixDQUFDO1FBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBbkxhLGFBQU0sR0FBVyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQTJYL0MsYUFBQztDQTdYRCxBQTZYQyxJQUFBIiwiZmlsZSI6InNvdW5kc3ludGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuLyogU0ZYRGVmIGlzIGEgY2xhc3MgdXNlZCB0byBkZWZpbmUgYSBzb3VuZCBlZmZlY3QgdG8gZ2VuZXJhdGUgKi9cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuY2xhc3MgU0ZYRGVmIHtcclxuICAgIHB1YmxpYyB3YXZlVHlwZTogc3RyaW5nID0gJ3NxdWFyZSc7XHJcbiAgICBwdWJsaWMgZnJlcXVlbmN5OiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIGZyZXF1ZW5jeVNsaWRlOiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIGRlbGF5RnJlcXVlbmN5U3RhcnRUaW1lUGN0OiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIGRlbGF5RnJlcXVlbmN5TXVsdDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwdWJsaWMgdmlicmF0b1RpbWU6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgdmlicmF0b1NoaWZ0VGltZTogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyB2aWJyYXRvRnJlcXVlbmN5OiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIHZpYnJhdG9XYXZlOiBzdHJpbmcgPSBcInNpbmVcIjtcclxuICAgIHB1YmxpYyBsb3dQYXNzRnJlcXVlbmN5OiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIGxvd1Bhc3NGcmVxdWVuY3lSYW1wOiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIGhpUGFzc0ZyZXF1ZW5jeTogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBhdHRhY2tUaW1lOiBudW1iZXIgPSAwO1xyXG4gICAgcHVibGljIGRlY2F5VGltZTogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBzdXN0YWluVGltZTogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyByZWxlYXNlVGltZTogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBhdHRhY2tQdW5jaFZvbHVtZTogbnVtYmVyID0gMDsgLy8gSSBUSElOSyBUSElTIFdJTEwgTkVFRCBUTyBCRSBDSEFOR0VEIFRPIEFUVEFDSyBQVU5DSFxyXG4gICAgcHVibGljIGR1dHlDeWNsZUxlbmd0aDogbnVtYmVyID0gMTtcclxuICAgIHB1YmxpYyBkdXR5Q3ljbGVQY3Q6IG51bWJlciA9IDAuNTtcclxuICAgIHB1YmxpYyBmbGFuZ2VEZWxheVRpbWU6IG51bWJlciA9IDAuMDE7XHJcbiAgICBwdWJsaWMgZmxhbmdlRmVlZGJhY2tWb2x1bWU6IG51bWJlciA9IDAuMztcclxuICAgIHB1YmxpYyBnYWluOiBudW1iZXIgPSAxO1xyXG4gICAgcHVibGljIGRpc3RvcnRpb246IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgbm9pc2VEZXR1bmU6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgbm9pc2VEZXR1bmVTbGlkZTogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBzbGlkZVR5cGU6IHN0cmluZyA9IFwibGluZWFyXCI7XHJcbn0iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiBDcmVhdGVkIGJ5IFJpY2sgQmF0dGFnbGluZSBhdCBlbWJlZCBsaW1pdGVkLiAgd3d3LmVtYmVkLmNvbSAqL1xyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4oPGFueT53aW5kb3cpLkF1ZGlvQ29udGV4dCA9ICg8YW55PndpbmRvdykuQXVkaW9Db250ZXh0IHx8XHJcbiAgICAoPGFueT53aW5kb3cpLndlYmtpdEF1ZGlvQ29udGV4dCB8fFxyXG4gICAgKDxhbnk+d2luZG93KS5tb3pBdWRpb0NvbnRleHQgfHxcclxuICAgICg8YW55PndpbmRvdykub0F1ZGlvQ29udGV4dCB8fFxyXG4gICAgKDxhbnk+d2luZG93KS5tc0F1ZGlvQ29udGV4dDtcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4vKiBTRlhXZWIgaXMgYSBjbGFzcyB1c2VkIHRvIGdlbmVyYXRlIHNvdW5kIGVmZmVjdHMgaW4gICAgICAgKi9cclxuLyogZHVyaW5nIGdhbWUgcGxheSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5jbGFzcyBTRlhXZWIge1xyXG4gICAgcHVibGljIHN0YXRpYyBTTjogU0ZYV2ViO1xyXG4gICAgcHVibGljIHN0YXRpYyBUV09fUEk6IG51bWJlciA9IE1hdGguUEkgKiAyO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgQUNUWDogQXVkaW9Db250ZXh0O1xyXG5cclxuICAgIHB1YmxpYyBkZWY6IFNGWERlZjtcclxuICAgIHB1YmxpYyBtYXN0ZXJWb2x1bWU6IG51bWJlciA9IDE7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgaWYgKFNGWFdlYi5TTiAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgU0ZYV2ViLlNOID0gdGhpcztcclxuICAgICAgICBTRlhXZWIuQUNUWCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgU2V0RGVmID0gKGRlZjogU0ZYRGVmKTogdm9pZCA9PiB7XHJcbiAgICAgICAgdGhpcy5kZWYgPSBkZWY7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiBQbGF5IGEgc291bmQgYmFzZWQgb24gdGhlIGRlZmluaXRpb24sIG9yIGlmIG5vIGRlZmluaXRpb24gKi9cclxuICAgIC8qIGlzIHBhc3NlZCBpbiwgcGxheSB0aGUgbGFzdCBkZWZpbml0aW9uIHVzZWQuICAgICAgICAgICAgICAqL1xyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICBwdWJsaWMgUGxheVNvdW5kID0gKGRlZjogU0ZYRGVmID0gbnVsbCk6IHZvaWQgPT4ge1xyXG4gICAgICAgIGlmIChkZWYgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlZiA9IGRlZjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuICAgICAgICB2YXIgdGltZTogbnVtYmVyID0gdGhpcy5kZWYuYXR0YWNrVGltZSArIHRoaXMuZGVmLmRlY2F5VGltZSArIHRoaXMuZGVmLnN1c3RhaW5UaW1lICsgdGhpcy5kZWYucmVsZWFzZVRpbWU7XHJcblxyXG4gICAgICAgIC8vIG5vaXNlIHdhdmVUeXBlIGRvZXMgbm90IHVzZSBhIG9zY2lsbGF0b3IsIGJ1dCBnZW5lcmF0ZXMgcmFuZG9tIG5vaXNlIGluIGEgc291bmQgYnVmZmVyLlxyXG4gICAgICAgIGlmICh0aGlzLmRlZi53YXZlVHlwZSA9PSAnbm9pc2UnKSB7XHJcbiAgICAgICAgICAgIHZhciBub2lzZV9idWZmZXI6IEF1ZGlvQnVmZmVyU291cmNlTm9kZSA9IHRoaXMuTm9pc2UoKTtcclxuXHJcbiAgICAgICAgICAgIG5vaXNlX2J1ZmZlci5kZXR1bmUuc2V0VmFsdWVBdFRpbWUodGhpcy5kZWYubm9pc2VEZXR1bmUgKiAxMDAsIGNvbnRleHQuY3VycmVudFRpbWUpO1xyXG4gICAgICAgICAgICBub2lzZV9idWZmZXIuZGV0dW5lLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZGVmLm5vaXNlRGV0dW5lU2xpZGUgKiAxMDAsIGNvbnRleHQuY3VycmVudFRpbWUgKyB0aW1lKTtcclxuICAgICAgICAgICAgdmFyIGdhaW5fbm9kZTogR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgICAgICAgICAgZ2Fpbl9ub2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5kZWYuZ2FpbiwgY29udGV4dC5jdXJyZW50VGltZSk7XHJcbiAgICAgICAgICAgIG5vaXNlX2J1ZmZlci5jb25uZWN0KGdhaW5fbm9kZSk7XHJcbiAgICAgICAgICAgIHZhciBhdWRpbzogQXVkaW9Ob2RlID0gZ2Fpbl9ub2RlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVmLmhpUGFzc0ZyZXF1ZW5jeSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGF1ZGlvID0gdGhpcy5IaWdoUGFzc0ZpbHRlcih0aGlzLmRlZi5oaVBhc3NGcmVxdWVuY3ksIHRpbWUsIGF1ZGlvKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVmLmxvd1Bhc3NGcmVxdWVuY3kgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBhdWRpbyA9IHRoaXMuTG93UGFzc0ZpbHRlcih0aGlzLmRlZi5sb3dQYXNzRnJlcXVlbmN5LCB0aW1lLCBhdWRpbywgdGhpcy5kZWYubG93UGFzc0ZyZXF1ZW5jeVJhbXApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWYuZHV0eUN5Y2xlTGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGR1dHlfY3ljbGU6IEdhaW5Ob2RlID0gdGhpcy5EdXR5Q3ljbGUodGhpcy5kZWYuZHV0eUN5Y2xlTGVuZ3RoLCB0aGlzLmRlZi5kdXR5Q3ljbGVQY3QsIHRpbWUpO1xyXG4gICAgICAgICAgICAgICAgYXVkaW8uY29ubmVjdChkdXR5X2N5Y2xlKTtcclxuICAgICAgICAgICAgICAgIGF1ZGlvID0gZHV0eV9jeWNsZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGZsYW5nZTogQXVkaW9Ob2RlID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVmLmZsYW5nZURlbGF5VGltZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGZsYW5nZSA9IHRoaXMuRmxhbmdlKHRoaXMuZGVmLmZsYW5nZURlbGF5VGltZSwgdGhpcy5kZWYuZmxhbmdlRmVlZGJhY2tWb2x1bWUsIGF1ZGlvKTtcclxuICAgICAgICAgICAgICAgIGZsYW5nZS5jb25uZWN0KGF1ZGlvKTtcclxuICAgICAgICAgICAgICAgIC8vICBOT1QgU1VSRSBUSElTIElTIFJJR0hULi4uIFRISVMgV0FTTidUIEhFUkVcclxuICAgICAgICAgICAgICAgIGF1ZGlvID0gZmxhbmdlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWYudmlicmF0b1RpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmlicmF0b19nYWluOiBHYWluTm9kZSA9IHRoaXMuVmlicmF0byhTRlhXZWIuR0VUX09TQ19GUk9NX1NUUklORyh0aGlzLmRlZi52aWJyYXRvV2F2ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWYudmlicmF0b0ZyZXF1ZW5jeSwgdGhpcy5kZWYudmlicmF0b1NoaWZ0VGltZSAqIHRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWYudmlicmF0b1RpbWUgKiB0aW1lKTtcclxuICAgICAgICAgICAgICAgIGF1ZGlvLmNvbm5lY3QodmlicmF0b19nYWluKTtcclxuICAgICAgICAgICAgICAgIGF1ZGlvID0gdmlicmF0b19nYWluO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZW52ZWxvcGU6IEdhaW5Ob2RlID0gdGhpcy5FbnZlbG9wZSh0aGlzLmRlZi5hdHRhY2tUaW1lLCB0aGlzLmRlZi5kZWNheVRpbWUsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZi5zdXN0YWluVGltZSwgdGhpcy5kZWYucmVsZWFzZVRpbWUsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZi5hdHRhY2tQdW5jaFZvbHVtZSk7XHJcblxyXG4gICAgICAgICAgICBhdWRpby5jb25uZWN0KGVudmVsb3BlKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBtYXN0ZXJfdm9sdW1lX2dhaW46IEdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICAgICAgICAgIG1hc3Rlcl92b2x1bWVfZ2Fpbi5nYWluLnZhbHVlID0gdGhpcy5tYXN0ZXJWb2x1bWU7XHJcbiAgICAgICAgICAgIGVudmVsb3BlLmNvbm5lY3QobWFzdGVyX3ZvbHVtZV9nYWluKTtcclxuXHJcbiAgICAgICAgICAgIG1hc3Rlcl92b2x1bWVfZ2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xyXG5cclxuICAgICAgICAgICAgbm9pc2VfYnVmZmVyLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIG5vaXNlX2J1ZmZlci5zdG9wKGNvbnRleHQuY3VycmVudFRpbWUgKyB0aW1lKVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG9zY190eXBlOiBPc2NpbGxhdG9yVHlwZSA9IFNGWFdlYi5HRVRfT1NDX0ZST01fU1RSSU5HKHRoaXMuZGVmLndhdmVUeXBlKTtcclxuXHJcbiAgICAgICAgdmFyIHRvbmU6IE9zY2lsbGF0b3JOb2RlID0gdGhpcy5Pc2NpbGxhdG9yVG9uZSh0aGlzLmRlZi5mcmVxdWVuY3ksIG9zY190eXBlKTtcclxuXHJcbiAgICAgICAgdmFyIGF1ZGlvOiBBdWRpb05vZGUgPSB0b25lO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kZWYuZnJlcXVlbmN5U2xpZGUgIT0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWYuZGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3QgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5GcmVxdWVuY3lTbGlkZSh0aGlzLmRlZi5mcmVxdWVuY3lTbGlkZSwgdGhpcy5kZWYuZGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3QsIHRvbmUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5EZWxheWVkRnJlcXVlbmN5U2xpZGUodGhpcy5kZWYuZnJlcXVlbmN5U2xpZGUsIHRoaXMuZGVmLmRlbGF5RnJlcXVlbmN5TXVsdCxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZi5kZWxheUZyZXF1ZW5jeVN0YXJ0VGltZVBjdCwgdGltZSwgdG9uZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkZyZXF1ZW5jeVNsaWRlKHRoaXMuZGVmLmZyZXF1ZW5jeVNsaWRlLCB0aW1lLCB0b25lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmRlZi5kZWxheUZyZXF1ZW5jeVN0YXJ0VGltZVBjdCAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuRGVsYXllZEZyZXF1ZW5jeVNsaWRlKHRoaXMuZGVmLmZyZXF1ZW5jeSwgdGhpcy5kZWYuZGVsYXlGcmVxdWVuY3lNdWx0LFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWYuZGVsYXlGcmVxdWVuY3lTdGFydFRpbWVQY3QsIHRpbWUsIHRvbmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVmLmhpUGFzc0ZyZXF1ZW5jeSA+IDApIHtcclxuICAgICAgICAgICAgYXVkaW8gPSB0aGlzLkhpZ2hQYXNzRmlsdGVyKHRoaXMuZGVmLmhpUGFzc0ZyZXF1ZW5jeSwgdGltZSwgdG9uZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kZWYubG93UGFzc0ZyZXF1ZW5jeSA+IDApIHtcclxuICAgICAgICAgICAgYXVkaW8gPSB0aGlzLkxvd1Bhc3NGaWx0ZXIodGhpcy5kZWYubG93UGFzc0ZyZXF1ZW5jeSwgdGltZSwgdG9uZSwgdGhpcy5kZWYubG93UGFzc0ZyZXF1ZW5jeVJhbXApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGdhaW5fbm9kZTogR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgICAgICBnYWluX25vZGUuZ2Fpbi52YWx1ZSA9IHRoaXMuZGVmLmdhaW47XHJcbiAgICAgICAgYXVkaW8uY29ubmVjdChnYWluX25vZGUpO1xyXG4gICAgICAgIGF1ZGlvID0gZ2Fpbl9ub2RlO1xyXG5cclxuICAgICAgICB2YXIgZW52ZWxvcGU6IEdhaW5Ob2RlID0gdGhpcy5FbnZlbG9wZSh0aGlzLmRlZi5hdHRhY2tUaW1lLCB0aGlzLmRlZi5kZWNheVRpbWUsXHJcbiAgICAgICAgICAgIHRoaXMuZGVmLnN1c3RhaW5UaW1lLCB0aGlzLmRlZi5yZWxlYXNlVGltZSxcclxuICAgICAgICAgICAgdGhpcy5kZWYuYXR0YWNrUHVuY2hWb2x1bWUpO1xyXG5cclxuICAgICAgICBhdWRpby5jb25uZWN0KGVudmVsb3BlKTtcclxuICAgICAgICBhdWRpbyA9IGVudmVsb3BlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kZWYuZHV0eUN5Y2xlTGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgZHV0eV9jeWNsZTogR2Fpbk5vZGUgPSB0aGlzLkR1dHlDeWNsZSh0aGlzLmRlZi5kdXR5Q3ljbGVMZW5ndGgsIHRoaXMuZGVmLmR1dHlDeWNsZVBjdCwgdGltZSk7XHJcbiAgICAgICAgICAgIGF1ZGlvLmNvbm5lY3QoZHV0eV9jeWNsZSk7XHJcbiAgICAgICAgICAgIGF1ZGlvID0gZHV0eV9jeWNsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBmbGFuZ2U6IEF1ZGlvTm9kZSA9IG51bGw7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVmLmZsYW5nZURlbGF5VGltZSA+IDApIHtcclxuICAgICAgICAgICAgZmxhbmdlID0gdGhpcy5GbGFuZ2UodGhpcy5kZWYuZmxhbmdlRGVsYXlUaW1lLCB0aGlzLmRlZi5mbGFuZ2VGZWVkYmFja1ZvbHVtZSwgYXVkaW8pO1xyXG4gICAgICAgICAgICBmbGFuZ2UuY29ubmVjdChhdWRpbyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kZWYudmlicmF0b1RpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciB2aWJyYXRvX2dhaW46IEdhaW5Ob2RlID0gdGhpcy5WaWJyYXRvKFNGWFdlYi5HRVRfT1NDX0ZST01fU1RSSU5HKHRoaXMuZGVmLnZpYnJhdG9XYXZlKSxcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmLnZpYnJhdG9GcmVxdWVuY3ksIHRoaXMuZGVmLnZpYnJhdG9TaGlmdFRpbWUgKiB0aW1lLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWYudmlicmF0b1RpbWUgKiB0aW1lKTtcclxuXHJcbiAgICAgICAgICAgIGF1ZGlvLmNvbm5lY3QodmlicmF0b19nYWluKTtcclxuICAgICAgICAgICAgYXVkaW8gPSB2aWJyYXRvX2dhaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbWFzdGVyX3ZvbHVtZV9nYWluOiBHYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgICAgIG1hc3Rlcl92b2x1bWVfZ2Fpbi5nYWluLnZhbHVlID0gdGhpcy5tYXN0ZXJWb2x1bWU7XHJcbiAgICAgICAgYXVkaW8uY29ubmVjdChtYXN0ZXJfdm9sdW1lX2dhaW4pO1xyXG5cclxuICAgICAgICBtYXN0ZXJfdm9sdW1lX2dhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcclxuXHJcbiAgICAgICAgdG9uZS5zdGFydCgpO1xyXG4gICAgICAgIHRvbmUuc3RvcChjb250ZXh0LmN1cnJlbnRUaW1lICsgdGltZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiBUaGlzIHN0YXRpYyBtZXRob2QgY29udmVydHMgYSBzdHJpbmcgdG8gYW4gT3NjaWxsYXRvclR5cGUgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHVibGljIHN0YXRpYyBHRVRfT1NDX0ZST01fU1RSSU5HKHdhdmVfdHlwZTogc3RyaW5nKTogT3NjaWxsYXRvclR5cGUge1xyXG4gICAgICAgIGlmICh3YXZlX3R5cGUgPT0gJ3NxdWFyZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdzcXVhcmUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh3YXZlX3R5cGUgPT0gJ3NpbmUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnc2luZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHdhdmVfdHlwZSA9PSAndHJpYW5nbGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndHJpYW5nbGUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh3YXZlX3R5cGUgPT0gJ3Nhd3Rvb3RoJykge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3Nhd3Rvb3RoJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICdzcXVhcmUnO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogT3NjaWxsYXRvclRvbmUgY3JlYXRlcyB0aGUgb3NjaWxsYXRvciBub2RlIHRoYXQgaXMgdGhlIHN0YXJ0aW5nICovXHJcbiAgICAvKiBwb2ludCBmb3IgYWxsIHNvdW5kcyBub3QgYmFzZWQgb24gbm9pc2UgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHVibGljIE9zY2lsbGF0b3JUb25lID0gKGZyZXF1ZW5jeTogbnVtYmVyLCB3YXZlOiBPc2NpbGxhdG9yVHlwZSk6IE9zY2lsbGF0b3JOb2RlID0+IHtcclxuICAgICAgICB2YXIgY29udGV4dDogQXVkaW9Db250ZXh0ID0gU0ZYV2ViLkFDVFg7XHJcbiAgICAgICAgdmFyIHRvbmU6IE9zY2lsbGF0b3JOb2RlID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XHJcbiAgICAgICAgdG9uZS50eXBlID0gd2F2ZTtcclxuICAgICAgICB0b25lLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZShmcmVxdWVuY3ksIGNvbnRleHQuY3VycmVudFRpbWUpOyAvLyB2YWx1ZSBpbiBoZXJ0elxyXG5cclxuICAgICAgICByZXR1cm4gdG9uZTtcclxuICAgIH1cclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qIER1dHlDeWNsZSBjcmVhdGVzIGEgR2Fpbk5vZGUgdGhhdCBkcm9wcyB0aGUgdm9sdW1lIHRvIDAgICAqL1xyXG4gICAgLyogaW4gY3ljbGVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIHByaXZhdGUgRHV0eUN5Y2xlID0gKGN5Y2xlX2xlbmd0aDogbnVtYmVyLCBjeWNsZV9wY3Q6IG51bWJlciwgdG90YWxfdGltZTogbnVtYmVyKTogR2Fpbk5vZGUgPT4ge1xyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuXHJcbiAgICAgICAgdmFyIHQ6IG51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHZhciBzdGFydF9tdXRlOiBudW1iZXIgPSAoMS4wIC0gY3ljbGVfcGN0KSAqIGN5Y2xlX2xlbmd0aDtcclxuICAgICAgICB2YXIgZHV0eV9jeWNsZV9ub2RlOiBHYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgICAgIGR1dHlfY3ljbGVfbm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDEsIGNvbnRleHQuY3VycmVudFRpbWUpO1xyXG5cclxuICAgICAgICB3aGlsZSAodCA8IHRvdGFsX3RpbWUpIHtcclxuICAgICAgICAgICAgZHV0eV9jeWNsZV9ub2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMSwgY29udGV4dC5jdXJyZW50VGltZSArIHQgKyBzdGFydF9tdXRlICogMC45OCk7Ly8gKyBzdGFydF9tdXRlXHJcbiAgICAgICAgICAgIGR1dHlfY3ljbGVfbm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGNvbnRleHQuY3VycmVudFRpbWUgKyB0ICsgc3RhcnRfbXV0ZSk7Ly8gKyBzdGFydF9tdXRlXHJcbiAgICAgICAgICAgIGR1dHlfY3ljbGVfbm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAsIGNvbnRleHQuY3VycmVudFRpbWUgKyB0ICsgY3ljbGVfbGVuZ3RoICogMC45OCk7XHJcbiAgICAgICAgICAgIGR1dHlfY3ljbGVfbm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEsIGNvbnRleHQuY3VycmVudFRpbWUgKyB0ICsgY3ljbGVfbGVuZ3RoKTtcclxuICAgICAgICAgICAgdCArPSBjeWNsZV9sZW5ndGg7IC8vY3ljbGVfbGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGR1dHlfY3ljbGVfbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qIEhpZ2hQYXNzRmlsdGVyIGFsbG93cyBhbGwgZnJlcXVlbmNpZXMgYWJvdmUgYSBjZXJ0YWluICAgICAqL1xyXG4gICAgLyogdmFsdWUgdG8gcGFzcyBhbmQgZmlsdGVycyBvdXQgYWxsIGxvd2VyIGZyZXF1ZW5jaWVzICAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIHByaXZhdGUgSGlnaFBhc3NGaWx0ZXIgPSAoaHBmX2ZyZXF1ZW5jeTogbnVtYmVyLCB0aW1lOiBudW1iZXIsXHJcbiAgICAgICAgaW5wdXRfbm9kZTogQXVkaW9Ob2RlKTogQXVkaW9Ob2RlID0+IHtcclxuICAgICAgICB2YXIgY29udGV4dDogQXVkaW9Db250ZXh0ID0gU0ZYV2ViLkFDVFg7XHJcblxyXG4gICAgICAgIHZhciBoaWdoUGFzc0ZpbHRlcjogQmlxdWFkRmlsdGVyTm9kZSA9IGNvbnRleHQuY3JlYXRlQmlxdWFkRmlsdGVyKCk7XHJcbiAgICAgICAgaGlnaFBhc3NGaWx0ZXIudHlwZSA9IFwiaGlnaHBhc3NcIjtcclxuICAgICAgICBoaWdoUGFzc0ZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSBocGZfZnJlcXVlbmN5O1xyXG5cclxuICAgICAgICBpbnB1dF9ub2RlLmNvbm5lY3QoaGlnaFBhc3NGaWx0ZXIpO1xyXG4gICAgICAgIHJldHVybiBoaWdoUGFzc0ZpbHRlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qIExvd1Bhc3NGaWx0ZXIgYWxsb3dzIGFsbCBmcmVxdWVuY2llcyBiZWxvdyBhIGNlcnRhaW4gICAgICAqL1xyXG4gICAgLyogdmFsdWUgdG8gcGFzcyBhbmQgZmlsdGVycyBvdXQgYWxsIGhpZ2hlciBmcmVxdWVuY2llcyAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIHByaXZhdGUgTG93UGFzc0ZpbHRlciA9IChscGZfZnJlcXVlbmN5OiBudW1iZXIsIHRpbWU6IG51bWJlcixcclxuICAgICAgICBpbnB1dF9ub2RlOiBBdWRpb05vZGUsIHJhbXBfZnJlcXVlbmN5OiBudW1iZXIgPSAwKTogQXVkaW9Ob2RlID0+IHtcclxuICAgICAgICB2YXIgY29udGV4dDogQXVkaW9Db250ZXh0ID0gU0ZYV2ViLkFDVFg7XHJcblxyXG4gICAgICAgIHZhciBsb3dQYXNzRmlsdGVyOiBCaXF1YWRGaWx0ZXJOb2RlID0gY29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcclxuICAgICAgICBsb3dQYXNzRmlsdGVyLnR5cGUgPSBcImxvd3Bhc3NcIjtcclxuICAgICAgICBsb3dQYXNzRmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IGxwZl9mcmVxdWVuY3k7XHJcblxyXG4gICAgICAgIGlmIChyYW1wX2ZyZXF1ZW5jeSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGxvd1Bhc3NGaWx0ZXIuZnJlcXVlbmN5LmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHJhbXBfZnJlcXVlbmN5LCBjb250ZXh0LmN1cnJlbnRUaW1lICsgdGltZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbnB1dF9ub2RlLmNvbm5lY3QobG93UGFzc0ZpbHRlcik7XHJcbiAgICAgICAgcmV0dXJuIGxvd1Bhc3NGaWx0ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiBEZWxheWVkRnJlcXVlbmN5U2xpZGUgd2FpdHMgYSBjZXJ0YWluIHBlcmlvZCBvZiB0aW1lIGFuZCAgKi9cclxuICAgIC8qIHRoZW4gc2xpZGVzIHRoZSBmcmVxdWVuY3kgb2YgdGhlIG9zY2lsbHRvciB0byBhIGRpZmZlcmVudCAqL1xyXG4gICAgLyogdmFsdWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIHByaXZhdGUgRGVsYXllZEZyZXF1ZW5jeVNsaWRlID0gKGZyZXF1ZW5jeTogbnVtYmVyLCBmcmVxdWVuY3lfbXVsdDogbnVtYmVyLCBkZWxheV9zdGFydDogbnVtYmVyLCBlbmRfdGltZTogbnVtYmVyLFxyXG4gICAgICAgIGlucHV0X25vZGU6IE9zY2lsbGF0b3JOb2RlKTogT3NjaWxsYXRvck5vZGUgPT4ge1xyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuXHJcbiAgICAgICAgaW5wdXRfbm9kZS5mcmVxdWVuY3kuc2V0VmFsdWVBdFRpbWUoZnJlcXVlbmN5LCBjb250ZXh0LmN1cnJlbnRUaW1lICsgZGVsYXlfc3RhcnQpO1xyXG4gICAgICAgIGlmICh0aGlzLmRlZi5zbGlkZVR5cGUgPT0gJ2xpbmVhcicpIHtcclxuICAgICAgICAgICAgaW5wdXRfbm9kZS5mcmVxdWVuY3kubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZnJlcXVlbmN5ICogZnJlcXVlbmN5X211bHQsIGNvbnRleHQuY3VycmVudFRpbWUgKyBlbmRfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZGVmLnNsaWRlVHlwZSA9PSAnbm9uZScpIHtcclxuICAgICAgICAgICAgaW5wdXRfbm9kZS5mcmVxdWVuY3kuc2V0VmFsdWVBdFRpbWUoZnJlcXVlbmN5ICogZnJlcXVlbmN5X211bHQsIGNvbnRleHQuY3VycmVudFRpbWUgKyBkZWxheV9zdGFydCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZGVmLnNsaWRlVHlwZSA9PSAnZXhwJykge1xyXG4gICAgICAgICAgICBpbnB1dF9ub2RlLmZyZXF1ZW5jeS5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKGZyZXF1ZW5jeSAqIGZyZXF1ZW5jeV9tdWx0LCBjb250ZXh0LmN1cnJlbnRUaW1lICsgZW5kX3RpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5wdXRfbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qIEZyZXF1ZW5jeVNsaWRlIGNyZWF0ZXMgYW4gb3NjaWxsYXRvciB0aGF0IHNsaWRlcyBpdCdzICAgICAqL1xyXG4gICAgLyogZnJlcXVlbmN5IGZyb20gb25lIHZhbHVlIHRvIGEgZGlmZmVyZW50IHZhbHVlIG92ZXIgYSAgICAgICovXHJcbiAgICAvKiBwZXJpb2Qgb2YgdGltZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHJpdmF0ZSBGcmVxdWVuY3lTbGlkZSA9IChmcmVxdWVuY3k6IG51bWJlciwgdGltZTogbnVtYmVyLFxyXG4gICAgICAgIGlucHV0X25vZGU6IE9zY2lsbGF0b3JOb2RlKTogT3NjaWxsYXRvck5vZGUgPT4ge1xyXG4gICAgICAgIHZhciBjb250ZXh0OiBBdWRpb0NvbnRleHQgPSBTRlhXZWIuQUNUWDtcclxuXHJcbiAgICAgICAgaW5wdXRfbm9kZS5mcmVxdWVuY3kubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZnJlcXVlbmN5LCBjb250ZXh0LmN1cnJlbnRUaW1lICsgdGltZSk7IC8vIHZhbHVlIGluIGhlcnR6XHJcblxyXG4gICAgICAgIHJldHVybiBpbnB1dF9ub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogVmlicmF0byBjcmVhdGVzIGEgR2Fpbk5vZGUgdGhhdCBtb3ZlcyB0aGUgdm9sdW1lIHVwIGFuZCAgICovXHJcbiAgICAvKiBkb3duIGluIGEgd2F2ZSBwYXR0ZXJuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHJpdmF0ZSBWaWJyYXRvID0gKHdhdmVfdHlwZTogT3NjaWxsYXRvclR5cGUsIHZpYnJhdG9fZnJlcXVlbmN5OiBudW1iZXIsXHJcbiAgICAgICAgc2hpZnRfdGltZTogbnVtYmVyLCB0aW1lOiBudW1iZXIpOiBHYWluTm9kZSA9PiB7XHJcbiAgICAgICAgdmFyIGNvbnRleHQ6IEF1ZGlvQ29udGV4dCA9IFNGWFdlYi5BQ1RYO1xyXG5cclxuICAgICAgICB2YXIgZ2Fpbk5vZGU6IEdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluKCk7XHJcblxyXG4gICAgICAgIHZhciBvc2M6IE9zY2lsbGF0b3JOb2RlID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XHJcbiAgICAgICAgb3NjLnR5cGUgPSB3YXZlX3R5cGU7XHJcbiAgICAgICAgb3NjLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZSh2aWJyYXRvX2ZyZXF1ZW5jeSwgY29udGV4dC5jdXJyZW50VGltZSk7IC8vIHZhbHVlIGluIGhlcnR6XHJcbiAgICAgICAgb3NjLmNvbm5lY3QoZ2Fpbk5vZGUpO1xyXG5cclxuICAgICAgICBvc2Muc3RhcnQoY29udGV4dC5jdXJyZW50VGltZSArIHNoaWZ0X3RpbWUpO1xyXG4gICAgICAgIG9zYy5zdG9wKGNvbnRleHQuY3VycmVudFRpbWUgKyB0aW1lKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdhaW5Ob2RlOyAvL2lucHV0X25vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBub2lzZURhdGE6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoMTYzODQpO1xyXG4gICAgcHJpdmF0ZSBub2lzZUluaXQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIC8qIE5vaXNlIGlzIGFuIGFsdGVybmF0aXZlIHN0YXJ0aW5nIHBvaW50IGZvciBhIHNvdW5kICAgICAgICAqL1xyXG4gICAgLyogZWZmZWN0cyBzdWNoIGFzIGV4cGxvc2lvbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIHByaXZhdGUgTm9pc2UgPSAoKTogQXVkaW9CdWZmZXJTb3VyY2VOb2RlID0+IHtcclxuICAgICAgICB2YXIgY29udGV4dDogQXVkaW9Db250ZXh0ID0gU0ZYV2ViLkFDVFg7XHJcblxyXG4gICAgICAgIHZhciBub2lzZV9ub2RlOiBBdWRpb0J1ZmZlclNvdXJjZU5vZGUgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG4gICAgICAgIHZhciBidWZmZXI6IEF1ZGlvQnVmZmVyID0gY29udGV4dC5jcmVhdGVCdWZmZXIoMSwgMTYzODQsIGNvbnRleHQuc2FtcGxlUmF0ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMubm9pc2VJbml0ID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTYzODQ7IGkgKz0gMTApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubm9pc2VEYXRhW2ldID0gTWF0aC5yYW5kb20oKSAqIDIgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGo6IG51bWJlciA9IDE7IGogPCAxMDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2lzZURhdGFbaSArIGpdID0gdGhpcy5ub2lzZURhdGFbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkYXRhOiBGbG9hdDMyQXJyYXkgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XHJcbiAgICAgICAgZGF0YS5zZXQodGhpcy5ub2lzZURhdGEpO1xyXG5cclxuICAgICAgICBub2lzZV9ub2RlLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuICAgICAgICBub2lzZV9ub2RlLmxvb3AgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiBub2lzZV9ub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLyogRW52ZWxvcGUgY3JlYXRlcyBhIEdhaW5Ob2RlIHRoYXQgcmFtcHMgdXAgdGhlIHZvbHVtZSBhbmQgICovXHJcbiAgICAvKiBiYWNrIGRvd24gYWdhaW4gd2hlbiB0aGUgZWZmZWN0IGlzIGVuZGluZyAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHJpdmF0ZSBFbnZlbG9wZSA9IChhdHRhY2tfdGltZTogbnVtYmVyLCBkZWNheV90aW1lOiBudW1iZXIsIHN1c3RhaW5fdGltZTogbnVtYmVyLCByZWxlYXNlX3RpbWU6IG51bWJlcixcclxuICAgICAgICBhdHRhY2tfcHVuY2g6IG51bWJlcik6IEdhaW5Ob2RlID0+IHtcclxuICAgICAgICB2YXIgY29udGV4dDogQXVkaW9Db250ZXh0ID0gU0ZYV2ViLkFDVFg7XHJcblxyXG5cclxuICAgICAgICB2YXIgZW52ZWxvcGU6IEdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluKCk7XHJcblxyXG4gICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLCBjb250ZXh0LmN1cnJlbnRUaW1lKTtcclxuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGF0dGFja19wdW5jaCwgY29udGV4dC5jdXJyZW50VGltZSArIGF0dGFja190aW1lKTtcclxuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEsIGNvbnRleHQuY3VycmVudFRpbWUgKyBhdHRhY2tfdGltZSArIGRlY2F5X3RpbWUpO1xyXG4gICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMSxcclxuICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGltZSArIGF0dGFja190aW1lICsgZGVjYXlfdGltZSArIHN1c3RhaW5fdGltZSk7XHJcbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAsXHJcbiAgICAgICAgICAgIGNvbnRleHQuY3VycmVudFRpbWUgKyBhdHRhY2tfdGltZSArIGRlY2F5X3RpbWUgKyBzdXN0YWluX3RpbWUgKyByZWxlYXNlX3RpbWUpO1xyXG5cclxuICAgICAgICByZXR1cm4gZW52ZWxvcGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAvKiBGbGFuZ2UgaXMgYSBmZWVkYmFjayBlZmZlY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgcHJpdmF0ZSBGbGFuZ2UgPSAoZGVsYXlfdGltZTogbnVtYmVyLCBmZWVkYmFja192b2x1bWU6IG51bWJlciwgaW5wdXQ6IEF1ZGlvTm9kZSk6IEdhaW5Ob2RlID0+IHtcclxuICAgICAgICB2YXIgY29udGV4dDogQXVkaW9Db250ZXh0ID0gU0ZYV2ViLkFDVFg7XHJcblxyXG4gICAgICAgIHZhciBkZWxheU5vZGU6IERlbGF5Tm9kZSA9IGNvbnRleHQuY3JlYXRlRGVsYXkoKTtcclxuICAgICAgICBkZWxheU5vZGUuZGVsYXlUaW1lLnZhbHVlID0gZGVsYXlfdGltZTtcclxuXHJcbiAgICAgICAgdmFyIGZlZWRiYWNrOiBHYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgICAgIGZlZWRiYWNrLmdhaW4udmFsdWUgPSBmZWVkYmFja192b2x1bWVcclxuXHJcbiAgICAgICAgaW5wdXQuY29ubmVjdChkZWxheU5vZGUpO1xyXG4gICAgICAgIGRlbGF5Tm9kZS5jb25uZWN0KGZlZWRiYWNrKTtcclxuICAgICAgICByZXR1cm4gZmVlZGJhY2s7XHJcbiAgICB9XHJcbn0iXX0=
