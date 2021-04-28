
/***************************************************************/
/* SFXDef is a class used to define a sound effect to generate */
/***************************************************************/
class SFXDef {
    public waveType: string = 'square';
    public frequency: number = 0;
    public frequencySlide: number = 0;
    public delayFrequencyStartTimePct: number = 0;
    public delayFrequencyMult: number = 0;

    public vibratoTime: number = 0;
    public vibratoShiftTime: number = 0;
    public vibratoFrequency: number = 0;
    public vibratoWave: string = "sine";
    public lowPassFrequency: number = 0;
    public lowPassFrequencyRamp: number = 0;
    public hiPassFrequency: number = 0;
    public attackTime: number = 0;
    public decayTime: number = 0;
    public sustainTime: number = 0;
    public releaseTime: number = 0;
    public attackPunchVolume: number = 0; // I THINK THIS WILL NEED TO BE CHANGED TO ATTACK PUNCH
    public dutyCycleLength: number = 1;
    public dutyCyclePct: number = 0.5;
    public flangeDelayTime: number = 0.01;
    public flangeFeedbackVolume: number = 0.3;
    public gain: number = 1;
    public distortion: number = 0;
    public noiseDetune: number = 0;
    public noiseDetuneSlide: number = 0;
    public slideType: string = "linear";
}