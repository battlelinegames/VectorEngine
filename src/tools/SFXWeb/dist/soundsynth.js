var SFXDef=function(){this.waveType="square",this.frequency=0,this.frequencySlide=0,this.delayFrequencyStartTimePct=0,this.delayFrequencyMult=0,this.vibratoTime=0,this.vibratoShiftTime=0,this.vibratoFrequency=0,this.vibratoWave="sine",this.lowPassFrequency=0,this.lowPassFrequencyRamp=0,this.hiPassFrequency=0,this.attackTime=0,this.decayTime=0,this.sustainTime=0,this.releaseTime=0,this.attackPunchVolume=0,this.dutyCycleLength=1,this.dutyCyclePct=.5,this.flangeDelayTime=.01,this.flangeFeedbackVolume=.3,this.gain=1,this.distortion=0,this.noiseDetune=0,this.noiseDetuneSlide=0,this.slideType="linear"};window.AudioContext=window.AudioContext||window.webkitAudioContext||window.mozAudioContext||window.oAudioContext||window.msAudioContext;var SFXWeb=function(){function m(){var T=this;this.masterVolume=1,this.SetDef=function(e){T.def=e},this.PlaySound=function(e){void 0===e&&(e=null),null!=e&&(T.def=e);var t=m.ACTX,i=T.def.attackTime+T.def.decayTime+T.def.sustainTime+T.def.releaseTime;if("noise"==T.def.waveType){var n=T.Noise();n.detune.setValueAtTime(100*T.def.noiseDetune,t.currentTime),n.detune.linearRampToValueAtTime(100*T.def.noiseDetuneSlide,t.currentTime+i),(s=t.createGain()).gain.setValueAtTime(T.def.gain,t.currentTime),n.connect(s);var a=s;if(0<T.def.hiPassFrequency&&(a=T.HighPassFilter(T.def.hiPassFrequency,i,a)),0<T.def.lowPassFrequency&&(a=T.LowPassFilter(T.def.lowPassFrequency,i,a,T.def.lowPassFrequencyRamp)),0<T.def.dutyCycleLength){var r=T.DutyCycle(T.def.dutyCycleLength,T.def.dutyCyclePct,i);a.connect(r),a=r}var u=null;if(0<T.def.flangeDelayTime&&((u=T.Flange(T.def.flangeDelayTime,T.def.flangeFeedbackVolume,a)).connect(a),a=u),0<T.def.vibratoTime){var c=T.Vibrato(m.GET_OSC_FROM_STRING(T.def.vibratoWave),T.def.vibratoFrequency,T.def.vibratoShiftTime*i,T.def.vibratoTime*i);a.connect(c),a=c}var l=T.Envelope(T.def.attackTime,T.def.decayTime,T.def.sustainTime,T.def.releaseTime,T.def.attackPunchVolume);return a.connect(l),(f=t.createGain()).gain.value=T.masterVolume,l.connect(f),f.connect(t.destination),n.start(),void n.stop(t.currentTime+i)}var s,o=m.GET_OSC_FROM_STRING(T.def.waveType),d=T.OscillatorTone(T.def.frequency,o);a=d;0!=T.def.frequencySlide?0!=T.def.delayFrequencyStartTimePct?(T.FrequencySlide(T.def.frequencySlide,T.def.delayFrequencyStartTimePct,d),T.DelayedFrequencySlide(T.def.frequencySlide,T.def.delayFrequencyMult,T.def.delayFrequencyStartTimePct,i,d)):T.FrequencySlide(T.def.frequencySlide,i,d):0!=T.def.delayFrequencyStartTimePct&&T.DelayedFrequencySlide(T.def.frequency,T.def.delayFrequencyMult,T.def.delayFrequencyStartTimePct,i,d),0<T.def.hiPassFrequency&&(a=T.HighPassFilter(T.def.hiPassFrequency,i,d)),0<T.def.lowPassFrequency&&(a=T.LowPassFilter(T.def.lowPassFrequency,i,d,T.def.lowPassFrequencyRamp)),(s=t.createGain()).gain.value=T.def.gain,a.connect(s),a=s;l=T.Envelope(T.def.attackTime,T.def.decayTime,T.def.sustainTime,T.def.releaseTime,T.def.attackPunchVolume);if(a.connect(l),a=l,0<T.def.dutyCycleLength){r=T.DutyCycle(T.def.dutyCycleLength,T.def.dutyCyclePct,i);a.connect(r),a=r}var f;u=null;if(0<T.def.flangeDelayTime&&(u=T.Flange(T.def.flangeDelayTime,T.def.flangeFeedbackVolume,a)).connect(a),0<T.def.vibratoTime){c=T.Vibrato(m.GET_OSC_FROM_STRING(T.def.vibratoWave),T.def.vibratoFrequency,T.def.vibratoShiftTime*i,T.def.vibratoTime*i);a.connect(c),a=c}(f=t.createGain()).gain.value=T.masterVolume,a.connect(f),f.connect(t.destination),d.start(),d.stop(t.currentTime+i)},this.OscillatorTone=function(e,t){var i=m.ACTX,n=i.createOscillator();return n.type=t,n.frequency.setValueAtTime(e,i.currentTime),n},this.DutyCycle=function(e,t,i){var n=m.ACTX,a=0,r=(1-t)*e,u=n.createGain();for(u.gain.setValueAtTime(1,n.currentTime);a<i;)u.gain.setValueAtTime(1,n.currentTime+a+.98*r),u.gain.linearRampToValueAtTime(0,n.currentTime+a+r),u.gain.setValueAtTime(0,n.currentTime+a+.98*e),u.gain.linearRampToValueAtTime(1,n.currentTime+a+e),a+=e;return u},this.HighPassFilter=function(e,t,i){var n=m.ACTX.createBiquadFilter();return n.type="highpass",n.frequency.value=e,i.connect(n),n},this.LowPassFilter=function(e,t,i,n){void 0===n&&(n=0);var a=m.ACTX,r=a.createBiquadFilter();return r.type="lowpass",r.frequency.value=e,0!=n&&r.frequency.linearRampToValueAtTime(n,a.currentTime+t),i.connect(r),r},this.DelayedFrequencySlide=function(e,t,i,n,a){var r=m.ACTX;return a.frequency.setValueAtTime(e,r.currentTime+i),"linear"==T.def.slideType?a.frequency.linearRampToValueAtTime(e*t,r.currentTime+n):"none"==T.def.slideType?a.frequency.setValueAtTime(e*t,r.currentTime+i):"exp"==T.def.slideType&&a.frequency.exponentialRampToValueAtTime(e*t,r.currentTime+n),a},this.FrequencySlide=function(e,t,i){var n=m.ACTX;return i.frequency.linearRampToValueAtTime(e,n.currentTime+t),i},this.Vibrato=function(e,t,i,n){var a=m.ACTX,r=a.createGain(),u=a.createOscillator();return u.type=e,u.frequency.setValueAtTime(t,a.currentTime),u.connect(r),u.start(a.currentTime+i),u.stop(a.currentTime+n),r},this.noiseData=new Float32Array(16384),this.noiseInit=!1,this.Noise=function(){var e=m.ACTX,t=e.createBufferSource(),i=e.createBuffer(1,16384,e.sampleRate);if(0==T.noiseInit)for(var n=0;n<16384;n+=10){T.noiseData[n]=2*Math.random()-1;for(var a=1;a<10;a++)T.noiseData[n+a]=T.noiseData[n]}return i.getChannelData(0).set(T.noiseData),t.buffer=i,t.loop=!0,t},this.Envelope=function(e,t,i,n,a){var r=m.ACTX,u=r.createGain();return u.gain.setValueAtTime(0,r.currentTime),u.gain.linearRampToValueAtTime(a,r.currentTime+e),u.gain.linearRampToValueAtTime(1,r.currentTime+e+t),u.gain.setValueAtTime(1,r.currentTime+e+t+i),u.gain.linearRampToValueAtTime(0,r.currentTime+e+t+i+n),u},this.Flange=function(e,t,i){var n=m.ACTX,a=n.createDelay();a.delayTime.value=e;var r=n.createGain();return r.gain.value=t,i.connect(a),a.connect(r),r},null==m.SN&&(m.SN=this,m.ACTX=new AudioContext)}return m.GET_OSC_FROM_STRING=function(e){return"square"==e?"square":"sine"==e?"sine":"triangle"==e?"triangle":"sawtooth"==e?"sawtooth":"square"},m.TWO_PI=2*Math.PI,m}();