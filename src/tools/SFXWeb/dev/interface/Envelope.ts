class Envelope {
    public attackTime: number = 0.1;
    public decayTime: number = 0.1;
    public sustainTime: number = 0.3;
    public sustainVolume: number = 0.8;
    public releaseTime: number = 0.1;

    public setGain = ( g: GainNode, ctx: AudioContext ): void => {
        var now: number = ctx.currentTime;
        g.gain.value = 0;
        g.gain.linearRampToValueAtTime(1, now + this.attackTime);
        g.gain.linearRampToValueAtTime(this.sustainVolume, now + this.attackTime + this.decayTime);
        g.gain.linearRampToValueAtTime(this.sustainVolume, 
                                        now + this.attackTime + this.decayTime + this.sustainTime);
        g.gain.linearRampToValueAtTime(this.sustainVolume, 
                                        now + this.attackTime + this.decayTime + this.sustainTime);
        g.gain.linearRampToValueAtTime(0, 
                                    now + this.attackTime + this.decayTime + this.sustainTime + this.releaseTime );
    }
}

