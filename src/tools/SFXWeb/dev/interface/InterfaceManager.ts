class InterfaceManager {
    public def: SFXDef;

    public static SN: InterfaceManager = null;

    public htmlWaveType: HTMLInputElement;
    public htmlFrequency: HTMLInputElement;
    public htmlFrequencySlider: HTMLInputElement;

    public htmlDelayFrequencyStartTimePct: HTMLInputElement;
    public htmlDelayFrequencyMult: HTMLInputElement;

    //    public htmlFrequencyEasing: HTMLInputElement;
    public htmlVibratoTime: HTMLInputElement;
    public htmlVibratoShiftTime: HTMLInputElement;
    public htmlVibratoFrequency: HTMLInputElement;
    public htmlVibratoWave: HTMLInputElement;
    public htmlLowPassFrequency: HTMLInputElement;
    public htmlLowPassFrequencyRamp: HTMLInputElement;
    public htmlHiPassFrequency: HTMLInputElement;
    public htmlAttackTime: HTMLInputElement;
    public htmlDecayTime: HTMLInputElement;
    public htmlSustainTime: HTMLInputElement;
    public htmlReleaseTime: HTMLInputElement;
    public htmlAttackPunchVolume: HTMLInputElement; // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
    public htmlDutyCycleLength: HTMLInputElement;
    public htmlDutyCyclePct: HTMLInputElement;
    public htmlFlangeDelayTime: HTMLInputElement;
    public htmlFlangeFeedbackVolume: HTMLInputElement;
    public htmlGain: HTMLInputElement;
    public htmlDistortion: HTMLInputElement;
    public htmlNoiseDetune: HTMLInputElement;
    public htmlNoiseDetuneSlide: HTMLInputElement;
    public htmlSlideType: HTMLInputElement;
    public htmlCodeArea: HTMLTextAreaElement;

    public htmlFrequencySlide: HTMLInputElement;
    public htmlFrequencySlideSlider: HTMLInputElement;
    public htmlDelayFrequencyStartTimePctSlider: HTMLInputElement;
    public htmlDelayFrequencyMultSlider: HTMLInputElement;
    public htmlVibratoTimeSlider: HTMLInputElement;
    public htmlVibratoFrequencySlider: HTMLInputElement;
    public htmlVibratoShiftTimeSlider: HTMLInputElement;
    public htmlLowPassFrequencySlider: HTMLInputElement;
    public htmlLowPassFrequencyRampSlider: HTMLInputElement;
    public htmlHiPassFrequencySlider: HTMLInputElement;
    public htmlAttackTimeSlider: HTMLInputElement;
    public htmlDecayTimeSlider: HTMLInputElement;
    public htmlSustainTimeSlider: HTMLInputElement;
    public htmlReleaseTimeSlider: HTMLInputElement;
    public htmlAttackPunchVolumeSlider: HTMLInputElement;
    public htmlFlangeDelayTimeSlider: HTMLInputElement;
    public htmlFlangeFeedbackVolumeSlider: HTMLInputElement;
    public htmlDutyCycleLengthSlider: HTMLInputElement;
    public htmlDutyCyclePctSlider: HTMLInputElement;
    public htmlNoiseDetuneSlider: HTMLInputElement;
    public htmlNoiseDetuneSlideSlider: HTMLInputElement;
    public htmlGainSlider: HTMLInputElement;

    public mouseDown: boolean = false;

    constructor() {
        if (InterfaceManager.SN != null) {
            console.log("returning");
            return;
        }
        InterfaceManager.SN = this;
        this.def = new SFXDef();

        this.htmlWaveType = <HTMLInputElement>document.getElementById("waveType");
        this.htmlFrequency = <HTMLInputElement>document.getElementById("frequency");
        this.htmlFrequencySlider = <HTMLInputElement>document.getElementById("frequencySlider");

        this.htmlDelayFrequencyStartTimePct = <HTMLInputElement>document.getElementById("delayFrequencyStartTimePct");
        this.htmlDelayFrequencyMult = <HTMLInputElement>document.getElementById("delayFrequencyMult");

        this.htmlVibratoTime = <HTMLInputElement>document.getElementById("vibratoTime");
        this.htmlVibratoShiftTime = <HTMLInputElement>document.getElementById("vibratoShiftTime");
        this.htmlVibratoFrequency = <HTMLInputElement>document.getElementById("vibratoFrequency");
        this.htmlVibratoWave = <HTMLInputElement>document.getElementById("vibratoWave");
        this.htmlLowPassFrequency = <HTMLInputElement>document.getElementById("lowPassFrequency");
        this.htmlLowPassFrequencyRamp = <HTMLInputElement>document.getElementById("lowPassFrequencyRamp");
        this.htmlHiPassFrequency = <HTMLInputElement>document.getElementById("hiPassFrequency");
        this.htmlAttackTime = <HTMLInputElement>document.getElementById("attackTime");
        this.htmlDecayTime = <HTMLInputElement>document.getElementById("decayTime");
        this.htmlSustainTime = <HTMLInputElement>document.getElementById("sustainTime");
        this.htmlReleaseTime = <HTMLInputElement>document.getElementById("releaseTime");
        this.htmlAttackPunchVolume = <HTMLInputElement>document.getElementById("attackPunchVolume"); // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
        this.htmlDutyCycleLength = <HTMLInputElement>document.getElementById("dutyCycleLength");
        this.htmlDutyCyclePct = <HTMLInputElement>document.getElementById("dutyCyclePct");
        this.htmlFlangeDelayTime = <HTMLInputElement>document.getElementById("flangeDelayTime");
        this.htmlFlangeFeedbackVolume = <HTMLInputElement>document.getElementById("flangeFeedbackVolume");
        this.htmlGain = <HTMLInputElement>document.getElementById("gain");
        this.htmlDistortion = <HTMLInputElement>document.getElementById("distortion");
        this.htmlNoiseDetune = <HTMLInputElement>document.getElementById("noiseDetune");
        this.htmlNoiseDetuneSlide = <HTMLInputElement>document.getElementById("noiseDetuneSlide");
        this.htmlSlideType = <HTMLInputElement>document.getElementById("slideType");

        this.htmlFrequencySlide = <HTMLInputElement>document.getElementById("frequencySlide");
        this.htmlFrequencySlideSlider = <HTMLInputElement>document.getElementById("frequencySlideSlider");
        this.htmlDelayFrequencyStartTimePctSlider = <HTMLInputElement>document.getElementById("delayFrequencyStartTimePctSlider");
        this.htmlDelayFrequencyMultSlider = <HTMLInputElement>document.getElementById("delayFrequencyMultSlider");
        this.htmlVibratoTimeSlider = <HTMLInputElement>document.getElementById("vibratoTimeSlider");
        this.htmlVibratoFrequencySlider = <HTMLInputElement>document.getElementById("vibratoFrequencySlider");
        this.htmlVibratoShiftTimeSlider = <HTMLInputElement>document.getElementById("vibratoShiftTimeSlider");
        this.htmlLowPassFrequencySlider = <HTMLInputElement>document.getElementById("lowPassFrequencySlider");
        this.htmlLowPassFrequencyRampSlider = <HTMLInputElement>document.getElementById("lowPassFrequencyRampSlider");
        this.htmlHiPassFrequencySlider = <HTMLInputElement>document.getElementById("hiPassFrequencySlider");
        this.htmlAttackTimeSlider = <HTMLInputElement>document.getElementById("attackTimeSlider");
        this.htmlDecayTimeSlider = <HTMLInputElement>document.getElementById("decayTimeSlider");
        this.htmlSustainTimeSlider = <HTMLInputElement>document.getElementById("sustainTimeSlider");
        this.htmlReleaseTimeSlider = <HTMLInputElement>document.getElementById("releaseTimeSlider");
        this.htmlAttackPunchVolumeSlider = <HTMLInputElement>document.getElementById("attackPunchVolumeSlider");
        this.htmlFlangeDelayTimeSlider = <HTMLInputElement>document.getElementById("flangeDelayTimeSlider");
        this.htmlFlangeFeedbackVolumeSlider = <HTMLInputElement>document.getElementById("flangeFeedbackVolumeSlider");
        this.htmlDutyCycleLengthSlider = <HTMLInputElement>document.getElementById("dutyCycleLengthSlider");
        this.htmlDutyCyclePctSlider = <HTMLInputElement>document.getElementById("dutyCyclePctSlider");
        this.htmlNoiseDetuneSlider = <HTMLInputElement>document.getElementById("noiseDetuneSlider");
        this.htmlNoiseDetuneSlideSlider = <HTMLInputElement>document.getElementById("noiseDetuneSlideSlider");
        this.htmlGainSlider = <HTMLInputElement>document.getElementById("gainSlider");

        this.htmlCodeArea = <HTMLTextAreaElement>document.getElementById("codearea");

        this.ResetValues();
        this.UpdateLoop();

    }

    public MouseDown = (): void => {
        this.mouseDown = true;
    }

    public MouseUp = (): void => {
        this.mouseDown = false;
    }

    public ResetValues = (): void => {
        this.def.waveType = this.htmlWaveType.value;
        this.def.frequency = parseInt(this.htmlFrequency.value);
        this.def.frequencySlide = parseInt(this.htmlFrequencySlide.value);

        this.def.delayFrequencyStartTimePct = parseFloat(this.htmlDelayFrequencyStartTimePct.value);
        this.def.delayFrequencyMult = parseFloat(this.htmlDelayFrequencyMult.value);

        this.def.vibratoTime = parseFloat(this.htmlVibratoTime.value);
        this.def.vibratoShiftTime = parseFloat(this.htmlVibratoShiftTime.value);
        this.def.vibratoFrequency = parseInt(this.htmlVibratoFrequency.value);
        this.def.vibratoWave = this.htmlVibratoWave.value;

        this.def.lowPassFrequency = parseInt(this.htmlLowPassFrequency.value);
        this.def.lowPassFrequencyRamp = parseInt(this.htmlLowPassFrequencyRamp.value);
        this.def.hiPassFrequency = parseInt(this.htmlHiPassFrequency.value);

        this.def.attackTime = parseFloat(this.htmlAttackTime.value);
        this.def.decayTime = parseFloat(this.htmlDecayTime.value);
        this.def.sustainTime = parseFloat(this.htmlSustainTime.value);
        this.def.releaseTime = parseFloat(this.htmlReleaseTime.value);
        this.def.attackPunchVolume = parseFloat(this.htmlAttackPunchVolume.value); // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH

        this.def.dutyCycleLength = parseFloat(this.htmlDutyCycleLength.value);
        this.def.dutyCyclePct = parseFloat(this.htmlDutyCyclePct.value);

        this.def.flangeDelayTime = parseFloat(this.htmlFlangeDelayTime.value);
        this.def.flangeFeedbackVolume = parseFloat(this.htmlFlangeFeedbackVolume.value);
        this.def.gain = parseFloat(this.htmlGain.value);

        this.def.noiseDetune = parseInt(this.htmlNoiseDetune.value);
        this.def.noiseDetuneSlide = parseInt(this.htmlNoiseDetuneSlide.value);
        this.def.slideType = this.htmlSlideType.value;

        let wave_type = 0;
        if (this.def.waveType === 'square') {
            wave_type = 0;
        }
        else if (this.def.waveType === 'triangle') {
            wave_type = 1;
        }
        else if (this.def.waveType === 'sine') {
            wave_type = 3;
        }
        else if (this.def.waveType === 'sawtooth') {
            wave_type = 2;
        }
        else if (this.def.waveType === 'noise') {
            wave_type = 4;
        }

        let vibrato_wave_type = 0;
        if (this.def.vibratoWave == 'square') {
            vibrato_wave_type = 0;
        }
        else if (this.def.vibratoWave === 'triangle') {
            vibrato_wave_type = 1;
        }
        else if (this.def.vibratoWave === 'sine') {
            vibrato_wave_type = 3;
        }
        else if (this.def.vibratoWave === 'sawtooth') {
            vibrato_wave_type = 2;
        }
        else if (this.def.vibratoWave === 'noise') {
            vibrato_wave_type = 4;
        }

        var slide_type = 0;

        if (this.def.slideType === 'linear') {
            slide_type = 1;
        }
        else if (this.def.slideType === 'exp') {
            slide_type = 2;
        }

        //this.htmlCodeArea.value = JSON.stringify(this.def, null, '\t');
        this.htmlCodeArea.value = `
        playSFX(${wave_type}, // wave type
            ${this.def.frequency}, // freq
            ${this.def.frequencySlide}, // freq slide
            ${this.def.delayFrequencyStartTimePct}, // delay freq start
            ${this.def.delayFrequencyMult}, // delay freq mult
            ${this.def.vibratoTime}, // vibrato time
            ${this.def.vibratoShiftTime}, // vibrato shift
            ${this.def.vibratoFrequency}, // vibrato freq
            ${vibrato_wave_type}, // vibrato type
            ${this.def.lowPassFrequency},  // low pass
            ${this.def.lowPassFrequencyRamp}, // low ramp
            ${this.def.hiPassFrequency}, // hi pass
            ${this.def.attackTime}, // attack
            ${this.def.decayTime}, // decay
            ${this.def.sustainTime}, // sustain
            ${this.def.releaseTime}, // release
            ${this.def.attackPunchVolume}, // punch
            ${this.def.dutyCycleLength}, // duty len
            ${this.def.dutyCyclePct}, // duty pct
            ${this.def.flangeDelayTime}, // flange delay
            ${this.def.flangeFeedbackVolume}, // flange feedback
            ${this.def.gain}, // gain
            ${this.def.noiseDetune}, // noise detune 
            ${this.def.noiseDetuneSlide}, // detune slide
            ${slide_type}); // slide type
          
        `;
        this.htmlCodeArea.rows = 30;

    }

    public SyncSliders = (): void => {
        this.htmlVibratoTimeSlider.value = this.htmlVibratoTime.value;
        this.htmlVibratoShiftTimeSlider.value = this.htmlVibratoShiftTime.value;
        this.htmlVibratoFrequencySlider.value = this.htmlVibratoFrequency.value;
        // CHANGE VISIBLE
        //this.htmlVibratoWave.value = this.htmlVibratoWave.value;
        this.htmlLowPassFrequencySlider.value = this.htmlLowPassFrequency.value;
        this.htmlLowPassFrequencyRampSlider.value = this.htmlLowPassFrequencyRamp.value;
        this.htmlHiPassFrequencySlider.value = this.htmlHiPassFrequency.value;
        this.htmlAttackTimeSlider.value = this.htmlAttackTime.value;
        this.htmlDecayTimeSlider.value = this.htmlDecayTime.value;
        this.htmlSustainTimeSlider.value = this.htmlSustainTime.value;
        this.htmlReleaseTimeSlider.value = this.htmlReleaseTime.value;
        this.htmlAttackPunchVolumeSlider.value = this.htmlAttackPunchVolume.value; // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
        this.htmlDutyCycleLengthSlider.value = this.htmlDutyCycleLength.value;
        this.htmlDutyCyclePctSlider.value = this.htmlDutyCyclePct.value;
        this.htmlFlangeDelayTimeSlider.value = this.htmlFlangeDelayTime.value;
        this.htmlFlangeFeedbackVolumeSlider.value = this.htmlFlangeFeedbackVolume.value;
        this.htmlGainSlider.value = this.htmlGain.value;
        this.htmlNoiseDetuneSlider.value = this.htmlNoiseDetune.value;
        this.htmlNoiseDetuneSlideSlider.value = this.htmlNoiseDetuneSlide.value;
        this.htmlFrequencySlideSlider.value = this.htmlFrequencySlide.value;
        this.htmlFrequencySlider.value = this.htmlFrequency.value;

        this.htmlDelayFrequencyStartTimePctSlider.value = this.htmlDelayFrequencyStartTimePct.value;
        this.htmlDelayFrequencyMultSlider.value = this.htmlDelayFrequencyMult.value;

        // CHANGE VISIBLE
        //this.htmlSlideType.value = this.htmlSlideTypeSlider.value;

        //        this.ResetValues();
    }

    public SyncValues = (): void => {
        this.htmlVibratoTime.value = this.htmlVibratoTimeSlider.value;
        this.htmlVibratoShiftTime.value = this.htmlVibratoShiftTimeSlider.value;
        this.htmlVibratoFrequency.value = this.htmlVibratoFrequencySlider.value;
        // CHANGE VISIBLE
        //this.htmlVibratoWave.value = this.htmlVibratoWave.value;
        this.htmlLowPassFrequency.value = this.htmlLowPassFrequencySlider.value;
        this.htmlLowPassFrequencyRamp.value = this.htmlLowPassFrequencyRampSlider.value;
        this.htmlHiPassFrequency.value = this.htmlHiPassFrequencySlider.value;
        this.htmlAttackTime.value = this.htmlAttackTimeSlider.value;
        this.htmlDecayTime.value = this.htmlDecayTimeSlider.value;
        this.htmlSustainTime.value = this.htmlSustainTimeSlider.value;
        this.htmlReleaseTime.value = this.htmlReleaseTimeSlider.value;
        this.htmlAttackPunchVolume.value = this.htmlAttackPunchVolumeSlider.value; // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
        this.htmlDutyCycleLength.value = this.htmlDutyCycleLengthSlider.value;
        this.htmlDutyCyclePct.value = this.htmlDutyCyclePctSlider.value;
        this.htmlFlangeDelayTime.value = this.htmlFlangeDelayTimeSlider.value;
        this.htmlFlangeFeedbackVolume.value = this.htmlFlangeFeedbackVolumeSlider.value;
        this.htmlGain.value = this.htmlGainSlider.value;
        this.htmlNoiseDetune.value = this.htmlNoiseDetuneSlider.value;
        this.htmlNoiseDetuneSlide.value = this.htmlNoiseDetuneSlideSlider.value;
        this.htmlFrequencySlide.value = this.htmlFrequencySlideSlider.value;
        this.htmlFrequency.value = this.htmlFrequencySlider.value;

        this.htmlDelayFrequencyStartTimePct.value = this.htmlDelayFrequencyStartTimePctSlider.value;
        this.htmlDelayFrequencyMult.value = this.htmlDelayFrequencyMultSlider.value;

        // CHANGE VISIBLE
        //this.htmlSlideType.value = this.htmlSlideTypeSlider.value;

        //        this.ResetValues();
    }

    public rand = (low: number, high: number = 0): number => {
        if (high == 0) {
            high = low;
            low = 0;
        }

        var range: number = high - low;
        range *= Math.random();
        return low + range;
    }
    public ArrRand = (arr: any[]): any => {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    public getNote = (min_hz: number = 0, max_hz: number = 20000): number => {
        var hz: number = -999999;
        while (hz < min_hz || hz > max_hz) {
            hz = this.notes[Math.floor(Math.random() * this.notes.length)];
        }
        return hz;
    }

    public getHigherNote = (hz: number, higher_count: number = 1): number => {
        var count: number = 0;

        for (var i: number = this.notes.length - 1; i >= 0; i--) {
            if (this.notes[i] > hz) {
                hz = this.notes[i];

                if (++count >= higher_count) {
                    break;
                }
            }
        }
        return hz;
    }

    public getLowerNote = (hz: number, lower_count: number = 1): number => {
        var count: number = 0;
        for (var i: number = 0; i < this.notes.length; i++) {
            if (this.notes[i] < hz) {
                hz = this.notes[i];

                if (++count >= lower_count) {
                    break;
                }
            }
        }
        return hz;
    }

    public LaserShot = (): void => {
        this.htmlWaveType.value = this.ArrRand(['square', 'sawtooth', 'triangle']); //this.randWave();
        this.htmlSlideType.value = "linear";

        this.htmlNoiseDetune.value = "0";
        this.htmlNoiseDetuneSlide.value = "0";

        var freq: number = this.getNote(300, 1200);
        this.htmlFrequency.value = freq.toString();
        var freq_change: number = Math.floor(this.rand(4, 20))
        freq = this.getLowerNote(freq, freq_change);
        this.htmlFrequencySlide.value = freq.toString();

        this.htmlAttackTime.value = "0.001";
        this.htmlDecayTime.value = "0.001";
        var sustain: number = (0.1 + this.rand(0.2));
        this.htmlSustainTime.value = sustain.toString();
        var release: number = (0.1 + this.rand(0.35));
        this.htmlReleaseTime.value = release.toString();
        this.htmlAttackPunchVolume.value = "1";

        var time: number = 0.002 + sustain + release;

        this.htmlDelayFrequencyStartTimePct.value = "0";
        this.htmlDelayFrequencyMult.value = "0";

        if (this.rand(3) > 2) {
            var vibrato_shift: number = this.rand(0.25);
            this.htmlVibratoTime.value = (1 - vibrato_shift).toString();
            this.htmlVibratoShiftTime.value = vibrato_shift.toString()
            this.htmlVibratoFrequency.value = Math.floor(this.rand(2, 21)).toString()
            this.htmlVibratoWave.value = this.ArrRand(['sawtooth',
                'triangle',
                'sine',
                'square']);
        }
        else {
            this.htmlVibratoTime.value = "0";
            this.htmlVibratoShiftTime.value = "0";
            this.htmlVibratoFrequency.value = "0";
            this.htmlVibratoWave.value = "sine";
        }

        this.htmlLowPassFrequency.value = "0";
        this.htmlHiPassFrequency.value = "0";

        var rval: number = this.rand(3);

        if (rval > 2) {
            freq = this.getHigherNote(freq, Math.floor(freq_change / 2));
            this.htmlLowPassFrequency.value = freq.toString();
        }
        else if (rval > 1) {
            freq = this.getHigherNote(freq, freq_change);
            this.htmlHiPassFrequency.value = freq.toString();
        }

        this.htmlFlangeDelayTime.value = "0";
        this.htmlFlangeFeedbackVolume.value = "0";

        var rand_duty: number = this.rand(3);

        if (rand_duty > 2) {
            this.htmlDutyCycleLength.value = this.rand(0.05, time / 5).toString();
            this.htmlDutyCyclePct.value = this.rand(0.25).toString();
        }
        else {
            this.htmlDutyCycleLength.value = "0";
            this.htmlDutyCyclePct.value = "0";
        }


        rval = this.rand(3);

        if (rval > 2) {
            this.htmlFlangeDelayTime.value = this.rand(0.3).toString();
            this.htmlFlangeFeedbackVolume.value = this.rand(0.5).toString();
        }
        this.play();
    }

    public Hit = (): void => {
        if (this.rand(3) < 1) {
            this.htmlWaveType.value = 'noise';
            var detune: number = -(this.rand(20));
            this.htmlNoiseDetune.value = detune.toString();
            detune -= 40 + this.rand(40);
            this.htmlNoiseDetuneSlide.value = detune.toString();
        }
        else {
            this.htmlNoiseDetune.value = "0";
            this.htmlNoiseDetuneSlide.value = "0";

            this.htmlWaveType.value = this.ArrRand(['square', 'sawtooth', 'triangle']);
            this.htmlFrequency.value = this.getNote(400, 600).toString();
            this.htmlFrequencySlide.value = this.getNote(1, 80).toString();
        }

        this.htmlAttackTime.value = "0.001";
        this.htmlDecayTime.value = "0.001";
        this.htmlSustainTime.value = (0.001 + this.rand(0.01)).toString();
        this.htmlReleaseTime.value = (0.05 + this.rand(0.15)).toString();
        this.htmlAttackPunchVolume.value = "1";

        this.htmlDelayFrequencyMult.value = "0";
        this.htmlDelayFrequencyStartTimePct.value = "0";

        this.htmlVibratoFrequency.value = "0";
        this.htmlVibratoFrequency.value = "0";
        this.htmlVibratoShiftTime.value = "0";

        this.htmlHiPassFrequency.value = "0";
        this.htmlLowPassFrequency.value = "0";
        this.htmlLowPassFrequencyRamp.value = "0";

        this.htmlFlangeDelayTime.value = "0";
        this.htmlFlangeFeedbackVolume.value = "0";

        this.htmlDutyCycleLength.value = "0";
        this.htmlDutyCyclePct.value = "0";

        this.htmlGain.value = "1";
        this.play();
    }

    public Explosion = (): void => {
        this.htmlWaveType.value = 'noise';
        this.htmlSlideType.value = "linear";

        var detune: number = -(this.rand(20));
        this.htmlNoiseDetune.value = detune.toString();
        detune -= this.rand(40);
        this.htmlNoiseDetuneSlide.value = detune.toString();

        if (this.rand(2) > 1) {
            this.htmlDutyCycleLength.value = "0";
            this.htmlDutyCyclePct.value = "0";
        }
        else {
            this.htmlDutyCycleLength.value = (0.01 + this.rand(0.04)).toString();
            this.htmlDutyCyclePct.value = (0.1 + this.rand(0.4)).toString();
        }

        this.htmlAttackTime.value = "0.001";
        this.htmlDecayTime.value = (0.01 + this.rand(0.08)).toString();
        this.htmlSustainTime.value = (0.05 + this.rand(0.2)).toString();
        this.htmlReleaseTime.value = (0.2 + this.rand(0.35)).toString();
        this.htmlAttackPunchVolume.value = this.rand(1, 6).toString();

        this.htmlFlangeDelayTime.value = this.rand(0.6).toString();
        this.htmlFlangeFeedbackVolume.value = this.rand(0.3).toString();

        this.htmlDelayFrequencyStartTimePct.value = "0";
        this.htmlDelayFrequencyMult.value = "0";


        this.htmlVibratoTime.value = "0";
        this.htmlVibratoShiftTime.value = "0";
        this.htmlVibratoFrequency.value = "0";
        this.htmlVibratoWave.value = "sine";

        this.htmlLowPassFrequency.value = "0";
        this.htmlLowPassFrequencyRamp.value = "0";
        this.htmlHiPassFrequency.value = "0";

        var rval: number = this.rand(3);

        if (rval > 2) {
            this.htmlLowPassFrequency.value = this.rand(1000, 2000).toString();
            this.htmlLowPassFrequencyRamp.value = this.rand(500, 1000).toString();
        }
        this.htmlFlangeDelayTime.value = "0";
        this.htmlFlangeFeedbackVolume.value = "0";
        this.play();
    }
    public Pickup = (): void => {
        this.htmlWaveType.value = 'square';
        this.htmlFrequency.value = this.getNote(400, 1200).toString();
        this.htmlFrequencySlide.value = "0"
        this.htmlSlideType.value = "none";

        this.htmlAttackTime.value = "0.001";
        var decay: number = (0.001 + this.rand(0.02));
        this.htmlDecayTime.value = decay.toString();
        var sustain: number = (0.05 + this.rand(0.1));
        this.htmlSustainTime.value = sustain.toString();
        var release: number = sustain * this.rand(2.5, 4.0);
        this.htmlReleaseTime.value = release.toString();
        this.htmlAttackPunchVolume.value = this.rand(1, 2).toString();

        this.htmlNoiseDetune.value = "0";
        this.htmlNoiseDetuneSlide.value = "0";

        //        var time = 0.001 + decay + sustain + release;

        this.htmlDelayFrequencyStartTimePct.value = this.rand(0.15, 0.2).toString();
        this.htmlDelayFrequencyMult.value = "2";

        this.htmlVibratoFrequency.value = "0";
        this.htmlVibratoFrequency.value = "0";
        this.htmlVibratoShiftTime.value = "0";

        this.htmlFlangeDelayTime.value = "0";
        this.htmlFlangeFeedbackVolume.value = "0";

        this.htmlDutyCycleLength.value = "0";
        this.htmlDutyCyclePct.value = "0";

        this.play();
    }

    public Jump = (): void => {
        this.htmlWaveType.value = 'square';

        var freq: number = this.getNote(400, 600);
        this.htmlFrequency.value = freq.toString();
        this.htmlHiPassFrequency.value = this.getLowerNote(freq).toString();
        freq = this.getHigherNote(freq, 4);
        this.htmlFrequencySlide.value = freq.toString();

        this.htmlLowPassFrequency.value = "0";
        this.htmlLowPassFrequencyRamp.value = "0";

        var rand: number = this.rand(3);
        if (rand < 1) {
            this.htmlHiPassFrequency.value = "0";
        }

        this.htmlNoiseDetune.value = "0";
        this.htmlNoiseDetuneSlide.value = "0";

        this.htmlAttackTime.value = "0.001";
        this.htmlDecayTime.value = "0.001";
        this.htmlSustainTime.value = (0.01 + this.rand(0.1)).toString();
        this.htmlReleaseTime.value = (0.2 + this.rand(0.25)).toString();
        this.htmlAttackPunchVolume.value = (1.1 + Math.random()).toString();

        this.htmlDelayFrequencyMult.value = "0";
        this.htmlDelayFrequencyStartTimePct.value = "0";

        this.htmlVibratoFrequency.value = "0";
        this.htmlVibratoFrequency.value = "0";
        this.htmlVibratoShiftTime.value = "0";

        this.htmlFlangeDelayTime.value = "0";
        this.htmlFlangeFeedbackVolume.value = "0";

        this.htmlDutyCycleLength.value = "0";
        this.htmlDutyCyclePct.value = "0";

        this.htmlGain.value = "1";
        //        this.htmlDistortion.value = "0";
        this.play();
    }

    public PowerUp = (): void => {
        this.htmlWaveType.value = this.ArrRand(['square', 'sawtooth']);

        var freq: number = this.getNote(400, 1200);
        this.htmlFrequency.value = freq.toString();
        this.htmlHiPassFrequency.value = this.getLowerNote(freq).toString();
        var freq_change: number = Math.floor(this.rand(2, 6))
        freq = this.getHigherNote(freq, freq_change);
        this.htmlFrequencySlide.value = freq.toString();

        this.htmlLowPassFrequency.value = "0";
        this.htmlLowPassFrequencyRamp.value = "0";

        this.htmlNoiseDetune.value = "0";
        this.htmlNoiseDetuneSlide.value = "0";

        this.htmlAttackTime.value = "0.001";
        this.htmlDecayTime.value = "0.001";
        var sustain: number = this.rand(0.25);
        this.htmlSustainTime.value = sustain.toString();
        var release: number = (0.3 + this.rand(0.4));
        this.htmlReleaseTime.value = release.toString();
        this.htmlAttackPunchVolume.value = (1.1 + Math.random()).toString();
        var time: number = sustain + release - 0.002;

        this.htmlDelayFrequencyMult.value = "0";
        this.htmlDelayFrequencyStartTimePct.value = "0";

        if (this.rand(3) > 1) {
            this.htmlVibratoFrequency.value = Math.floor(this.rand(2, 25)).toString();
            this.htmlVibratoTime.value = time.toString();
            this.htmlVibratoShiftTime.value = "0";
            this.htmlVibratoWave.value = this.ArrRand(['sawtooth',
                'triangle',
                'sine',
                'square']);

            this.htmlDutyCycleLength.value = "0";
            this.htmlDutyCyclePct.value = "0";
        }
        else {
            this.htmlVibratoFrequency.value = '0';
            this.htmlVibratoTime.value = "0";
            this.htmlVibratoShiftTime.value = "0";
            this.htmlVibratoWave.value = 'square';

            this.htmlDutyCycleLength.value = this.rand(time / 10).toString();
            this.htmlDutyCyclePct.value = this.rand(0.1, 0.2).toString();;
        }

        this.htmlFlangeDelayTime.value = "0";
        this.htmlFlangeFeedbackVolume.value = "0";

        this.htmlGain.value = "1";
        this.play();
        //        this.htmlDistortion.value = "0";
    }

    public PowerDown = (): void => {
        this.htmlWaveType.value = this.ArrRand(['square', 'sawtooth']);

        var freq: number = this.getNote(600, 1200);
        this.htmlFrequency.value = freq.toString();
        this.htmlHiPassFrequency.value = this.getLowerNote(freq).toString();
        var freq_change: number = Math.floor(this.rand(4, 13))
        freq = this.getLowerNote(freq, freq_change);
        this.htmlFrequencySlide.value = freq.toString();

        this.htmlLowPassFrequency.value = "0";
        this.htmlLowPassFrequencyRamp.value = "0";

        this.htmlNoiseDetune.value = "0";
        this.htmlNoiseDetuneSlide.value = "0";

        this.htmlAttackTime.value = "0.001";
        this.htmlDecayTime.value = "0.001";
        var sustain: number = this.rand(0.2);
        this.htmlSustainTime.value = sustain.toString();
        var release: number = (0.4 + this.rand(0.8));
        this.htmlReleaseTime.value = release.toString();
        this.htmlAttackPunchVolume.value = (1.1 + Math.random()).toString();
        var time: number = sustain + release - 0.002;

        this.htmlDelayFrequencyMult.value = "0";
        this.htmlDelayFrequencyStartTimePct.value = "0";

        if (this.rand(3) > 1) {
            this.htmlVibratoFrequency.value = Math.floor(this.rand(2, 25)).toString();
            this.htmlVibratoTime.value = "1";
            this.htmlVibratoShiftTime.value = "0";
            this.htmlVibratoWave.value = this.ArrRand(['sawtooth',
                'triangle',
                'sine',
                'square']);

            this.htmlDutyCycleLength.value = "0";
            this.htmlDutyCyclePct.value = "0";
        }
        else {
            this.htmlVibratoFrequency.value = '0';
            this.htmlVibratoTime.value = "0";
            this.htmlVibratoShiftTime.value = "0";
            this.htmlVibratoWave.value = 'square';

            this.htmlDutyCycleLength.value = this.rand(time / 10).toString();
            this.htmlDutyCyclePct.value = this.rand(0.1, 0.2).toString();;
        }

        this.htmlFlangeDelayTime.value = "0";
        this.htmlFlangeFeedbackVolume.value = "0";

        this.htmlGain.value = "1";
        this.play();
        //        this.htmlDistortion.value = "0";
    }

    public notes: Array<number> = [7902.13, 7458.62, 7040.00, 6644.88, 6271.93, 5919.91,
        5587.65, 5274.04, 4978.03, 4698.64, 4434.92, 4186.01,
        3951.07, 3729.31, 3520.00, 3322.44, 3135.96, 2959.96,
        2793.83, 2637.02, 2489.02, 2349.32, 2217.46, 2093.00,
        1975.53, 1864.66, 1760.00, 1661.22, 1567.98, 1479.98,
        1396.91, 1318.51, 1244.51, 1174.66, 1108.73, 1046.50,
        987.767, 932.328, 880.000, 830.609, 783.991,
        698.456, 659.255, 622.254, 587.330, 554.365, 523.251,
        493.883, 466.164, 440.000, 415.305, 391.995, 369.994,
        349.228, 329.628, 311.127, 293.665, 277.183, 261.626,
        246.942, 233.082, 220.000, 207.652, 195.998, 184.997,//--ciub
        174.614, 164.814, 155.563, 146.832, 138.591, 130.813,
        123.471, 116.541, 110.000, 103.826, 97.9989, 92.4986,
        87.3071, 82.4069, 77.7817, 73.4162, 69.2957, 65.4064,
        61.7354, 58.2705, 55.0000, 51.9131, 48.9994, 46.2493,
        43.6535, 41.2034, 38.8909, 36.7081, 34.6478, 32.7032];

    public GetElement = (id: string): any => {
        return document.getElementById(id);
    }

    public UpdateLoop = () => {
        setTimeout(this.UpdateLoop, 100);

        if (this.mouseDown == true) {
            return;
        }

        var wave_type: any = document.getElementById("waveType");
        var wave_select: any = document.getElementById("waveTypeVisual");

        for (var i: number = 0; i < wave_select.childNodes.length; i++) {
            wave_select.childNodes[i].style = "";

            if (wave_select.childNodes[i].id === wave_type.value) {
                wave_select.childNodes[i].style = "background-color: orangered";
            }
        }

        var slide_type: any = document.getElementById("slideType");

        var slide_select: any = document.getElementById("slideTypeVisual");
        for (i = 0; i < slide_select.childNodes.length; i++) {
            slide_select.childNodes[i].style = "";

            if (slide_select.childNodes[i].id === slide_type.value) {
                slide_select.childNodes[i].style = "background-color: orangered";
            }
        }

        var vibrato_type: any = document.getElementById("vibratoWave");

        var vibrato_select: any = document.getElementById("vibratoWaveVisual");
        for (i = 0; i < vibrato_select.childNodes.length; i++) {
            vibrato_select.childNodes[i].style = "";

            if (vibrato_select.childNodes[i].id === "v" + vibrato_type.value) {
                vibrato_select.childNodes[i].style = "background-color: orangered";
            }
        }

        this.SyncSliders();
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
    }
    /*
            public SyncElements = ( element: any, id: string ): void => {
                var element_2: any = this.GetElement(id);
                if( element.value !== element_2.value ) {
                    element_2.value = element.value;
                }
            }
    */
    public SlideClick = (slide: any): void => {
        var slide_select: any = document.getElementById("slideTypeVisual");
        for (var i: number = 0; i < slide_select.childNodes.length; i++) {
            slide_select.childNodes[i].style = "";
        }
        slide.style = "background-color: orangered";

        var slide_type: any = document.getElementById("slideType");
        for (i = 0; i < slide_type.childNodes.length; i++) {
            if (slide_type.childNodes[i].value === slide.id) {
                slide_type.childNodes[i].selected = true;
            }
            else {
                slide_type.childNodes[i].selected = false;
            }
        }
    }

    public WaveClick(wave: any) {
        var wave_select: any = document.getElementById("waveTypeVisual");
        for (var i: number = 0; i < wave_select.childNodes.length; i++) {
            wave_select.childNodes[i].style = "";
        }
        wave.style = "background-color: orangered";

        var wave_type: any = document.getElementById("waveType");
        for (i = 0; i < wave_type.childNodes.length; i++) {
            if (wave_type.childNodes[i].value === wave.id) {
                wave_type.childNodes[i].selected = true;
            }
            else {
                wave_type.childNodes[i].selected = false;
            }
        }

    }

    public VibratoWaveClick = (wave: any): void => {
        var wave_select: any = document.getElementById("vibratoWaveVisual");
        for (var i: number = 0; i < wave_select.childNodes.length; i++) {
            wave_select.childNodes[i].style = "";
        }
        wave.style = "background-color: orangered";

        var wave_type: any = document.getElementById("vibratoWave");
        for (i = 0; i < wave_type.childNodes.length; i++) {
            if ("v" + wave_type.childNodes[i].value === wave.id) {
                wave_type.childNodes[i].selected = true;
            }
            else {
                wave_type.childNodes[i].selected = false;
            }
        }

    }

    public play = (): void => {
        this.ResetValues();
        SFXWeb.SN.PlaySound();

        this.htmlCodeArea.select();
        document.execCommand("Copy");
    }


}

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