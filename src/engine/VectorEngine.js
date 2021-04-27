const V_COLOR_LINE_SHADER = /*glsl*/`#version 300 es
  precision highp float;

  uniform uint u_color;
  uniform float u_scale;
  uniform float u_rotation;
  uniform float u_loop_x;
  uniform float u_loop_y;

  in vec2 position;
  out vec4 c;
  
  void main() {
    vec2 pos = (position * u_scale);

    float cosine = cos(u_rotation);
    float sine = sin(u_rotation);
    float x = (cosine * pos.x) + (sine * pos.y);
    float y = (cosine * pos.y) - (sine * pos.x);
    pos.x = x + u_loop_x;
    pos.y = y + u_loop_y;

    gl_Position = vec4( pos, 0.0, 1.0 );
    uint mask = uint(0xff); // byte mask

    // convert 32-bit hexadecimal color to four float color
    uint red = u_color >> 24;
    uint green = (u_color >> 16) & mask;
    uint blue = (u_color >> 8) & mask;
    uint alpha = u_color & mask;

    c = vec4( float(red) / 255.0, 
              float(green) / 255.0,
              float(blue) / 255.0,
              float(alpha) / 255.0 );
  }
`;
// THIS IS THE FRAGMENT SHADER
const F_SHADER = /*glsl*/ `#version 300 es
  precision highp float;

  in vec4 c;
  out vec4 color;

  void main() {
    color = c;
  }
`;

var memory;
var game_loop;
//var pre_update;
//var post_update;
var wasm_obj;
var importObject;
var gl;
var color_line_program;
var color_location;
var scale_location;
var rotation_location;
var offset_x_location;
var offset_y_location;
var buffer;
var position_al;
//var inputHeapPtr;
var keyPtr;

var mouseLeftDownPtr;
var mouseRightDownPtr;
var mouseMiddleDownPtr;

var mouseLeftUpPtr;
var mouseRightUpPtr;
var mouseMiddleUpPtr;

var mouseXPtr;
var mouseYPtr;
var lastTime = 0;
// can use variables below for fps
// var frames = 0;
// var timePassed = 0;


function render() {
	if (game_loop != null) {
		let delta = 0;
		if (lastTime !== 0) {
			delta = (new Date().getTime() - lastTime);
			/*
			timePassed += delta;
			frames++;

			if (timePassed > 1000) {
				frames = 0;
				time_passed = 0;
			}
			*/
		}
		lastTime = new Date().getTime();

		clear();
		//pre_update();
		game_loop(delta);
		//post_update();
	}
	requestAnimationFrame(render);
}

function clear() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

function renderLine(line_data_pointer, len, x, y, rot, scale, color, type) {
	const line_data = new Float32Array(memory.buffer, line_data_pointer, len);
	gl.bufferData(gl.ARRAY_BUFFER, line_data, gl.DYNAMIC_DRAW);

	gl.uniform1ui(color_location, color);
	gl.uniform1f(scale_location, scale);
	gl.uniform1f(rotation_location, rot);
	gl.uniform1f(offset_x_location, x);
	gl.uniform1f(offset_y_location, y);

	gl.vertexAttribPointer(position_al,
		/*dimensions*/2, /*data type*/gl.FLOAT,
		/*normalize*/false, /*stride*/0, /*offset*/0);

	gl.drawArrays(type, 0, line_data.length / 2);
}

var keyDownPos;

function keyDown(event) {
	if (keyPtr == null) {
		return;
	}
	if (keyDownPos == null) {
		keyDownPos = new Uint8Array(memory.buffer, keyPtr, 100)
	}
	keyDownPos[event.keyCode] = true;
	console.log(`
	keyPtr: ${keyPtr}
	code: ${event.keyCode}
	keyDownPos[event.code]: ${keyDownPos[event.keyCode]}
	`);
}

function keyUp(event) {
	if (keyDownPos == null) {
		return;
	}
	keyDownPos[event.keyCode] = false;
}

function mouseMove(event) {
	const mousePos = new Int32Array(memory.buffer, mouseXPtr, 2);
	mousePos[0] = event.offsetX;
	mousePos[1] = event.offsetY;
}

function onContext(event) {
	event.preventDefault();
}

var mousePos;
function mouseDown(event) {
	if (mousePos == null) {
		mousePos = new Uint8Array(memory.buffer, mouseLeftDownPtr, 3);
	}

	mousePos[event.which - 1] = true;
	event.preventDefault();
}

function mouseUp(event) {
	if (mousePos == null) {
		mousePos = new Uint8Array(memory.buffer, mouseLeftDownPtr, 3);
	}
	mousePos[event.which - 1] = false;
	event.preventDefault();
}
function getString(string_index) {
	const buffer = memory.buffer;
	const U32 = new Uint32Array(buffer);
	const id_addr = string_index / 4 - 2;
	const id = U32[id_addr];
	if (id !== 0x01) throw Error(`not a string index=${string_index} id=${id}`);
	const len = U32[id_addr + 1];
	const str = new TextDecoder('utf-16').decode(buffer.slice(string_index, string_index + len));
	return str;
}

// AUDIO STUFF
const SQUARE_WAVE = 0;
const TRIANGLE_WAVE = 1;
const SAW_WAVE = 2;
const SIN_WAVE = 3;
const NOISE_WAVE = 4; // I KNOW NOISE ISN'T A WAVE, BUT IT'S IN THIS GROUP

const SLIDE_NONE = 0;
const SLIDE_LIN = 1;
const SLIDE_EXP = 2;

var ACTX;

var noise_init = false;
var noise_data = new Float32Array(16384);
var master_volume = 1.0;

function envelope(attack_time, decay_time, sustain_time, release_time,
	attack_punch, input_node) {
	let envelope_node = ACTX.createGain();

	envelope_node.gain.setValueAtTime(0.0, ACTX.currentTime);
	envelope_node.gain.linearRampToValueAtTime(attack_punch, ACTX.currentTime + attack_time);
	envelope_node.gain.linearRampToValueAtTime(1, ACTX.currentTime + attack_time + decay_time);
	envelope_node.gain.setValueAtTime(1, ACTX.currentTime + attack_time + decay_time + sustain_time);
	envelope_node.gain.linearRampToValueAtTime(0.0,
		ACTX.currentTime + attack_time + decay_time + sustain_time + release_time);
	input_node.connect(envelope_node);
	return envelope_node;
}

function noiseNode() {
	let noise_node = ACTX.createBufferSource();
	let buffer = ACTX.createBuffer(1, 16384, ACTX.sampleRate);

	if (noise_init === false) {
		for (var i = 0; i < 16384; i += 10) {
			noise_data[i] = Math.random() * 2 - 1;

			for (var j = 1; j < 10; j++) {
				noise_data[i + j] = noise_data[i];
			}
		}
		noise_init = true;
	}

	let data = buffer.getChannelData(0);
	data.set(noise_data);

	noise_node.buffer = buffer;
	noise_node.loop = true;
	return noise_node;
}

function dutyCycle(cycle_len, cycle_pct, total_time, input_node) {
	let t = 0;

	let start_mute = (1.0 - cycle_pct) * cycle_len;
	let duty_cycle_node = ACTX.createGain();
	duty_cycle_node.gain.setValueAtTime(1, ACTX.currentTime);

	while (t < total_time) {
		duty_cycle_node.gain.setValueAtTime(1, ACTX.currentTime + t + start_mute * 0.98);// + start_mute
		duty_cycle_node.gain.linearRampToValueAtTime(0, ACTX.currentTime + t + start_mute);// + start_mute
		duty_cycle_node.gain.setValueAtTime(0, ACTX.currentTime + t + cycle_len * 0.98);
		duty_cycle_node.gain.linearRampToValueAtTime(1, ACTX.currentTime + t + cycle_len);
		t += cycle_len; // cycle_length;
	}

	input_node.connect(duty_cycle_node);
	return duty_cycle_node;
}

function getOscType(wave_type) {
	if (wave_type === SQUARE_WAVE) {
		return "square";
	}
	else if (wave_type === TRIANGLE_WAVE) {
		return "triangle";
	}
	else if (wave_type === SAW_WAVE) {
		return "sawtooth";
	}
	else if (wave_type === SIN_WAVE) {
		return "sine";
	}
	alert('invalid wave type');
	return "square";
}

function frequencySlide(frequency, time, input_node) {
	input_node.frequency.linearRampToValueAtTime(frequency, ACTX.currentTime + time); // value in hertz
	return input_node;

}

function delayedFrequencySlide(frequency, frequency_mult, delay_start, end_time, slide_type, input_node) {
	input_node.frequency.setValueAtTime(frequency, ACTX.currentTime + delay_start);
	if (slide_type === SLIDE_LIN) {
		input_node.frequency.linearRampToValueAtTime(frequency * frequency_mult,
			ACTX.currentTime + end_time);
	}
	else if (slide_type === SLIDE_NONE) {
		input_node.frequency.setValueAtTime(frequency * frequency_mult,
			ACTX.currentTime + delay_start);
	}
	else if (slide_type === SLIDE_EXP) {
		input_node.frequency.exponentialRampToValueAtTime(frequency * frequency_mult,
			ACTX.currentTime + end_time);
	}
	return input_node;
}

function oscillatorTone(frequency, wave_type) {
	var tone = ACTX.createOscillator();
	tone.type = getOscType(wave_type);
	tone.frequency.setValueAtTime(frequency, ACTX.currentTime); // value in hertz
	return tone;
}

function vibrato(wave_type, vibrato_freq, shift_time, time, input_node) {
	let gain_node = ACTX.createGain();
	let osc = ACTX.createOscillator();

	osc.type = getOscType(wave_type);
	osc.frequency.setValueAtTime(vibrato_freq, ACTX.currentTime); // value in hertz
	osc.connect(gain_node);

	osc.start(ACTX.currentTime + shift_time);
	osc.stop(ACTX.currentTime + time);

	input_node.connect(gain_node);
	return gain_node;
}

function flange(delay_time, feedback_volume, input_node) {
	let delay_node = ACTX.createDelay();
	delay_node.delayTime.value = delay_time;

	let feeback = ACTX.createGain();
	feedback_volume.gain.value = feedback_volume;

	input_node.connect(delay_node);
	delay_node.connect(feedback)
	feedback.connect(input_node);
	return feedback;

}

function highPassFilter(hpf_freq, time, input_node) {
	let high_pass_filter = ACTX.createBiquadFilter();
	high_pass_filter.type = "highpass";
	high_pass_filter.frequency.value = hpf_freq;

	input_node.connect(high_pass_filter);
	return high_pass_filter;
}

function lowPassFilter(lpf_freq, time, input_node, ramp_freq = 0) {
	let low_pass_filter = ACTX.createBiquadFilter();
	low_pass_filter.type = "lowpass";
	low_pass_filter.frequency.value = lpf_freq;

	if (ramp_freq !== 0) {
		low_pass_filter.frequency.linearRampToValueAtTime(ramp_freq, ACTX.currentTime + time);
	}

	input_node.connect(low_pass_filter);
	return low_pass_filter;
}

function playSFX(wave_type, freq, freq_slide,
	delay_freq_start_time_pct, delay_freq_mult, vibrato_time, vibrato_shift_time,
	vibrato_freq, vibrato_wave_type, low_pass_freq, low_pass_freq_ramp,
	high_pass_freq, attack_time, decay_time, sustain_time, release_time,
	attack_punch_volume, duty_cycle_len, duty_cycle_pct, flange_delay_time,
	flange_feedback_volume, gain, noise_detune, noise_detune_slide,
	slide_type) {

	if (ACTX == null) {
		ACTX = new AudioContext()
	}
	const time = attack_time + decay_time + sustain_time + release_time;

	if (wave_type === NOISE_WAVE) {
		let noise_buffer = noiseNode();
		noise_buffer.detune.setValueAtTime(noise_detune * 100, ACTX.currentTime);
		noise_buffer.detune.linearRampToValueAtTime(noise_detune_slide * 100,
			ACTX.currentTime + time);
		let gain_node = ACTX.createGain();
		gain_node.gain.setValueAtTime(gain, ACTX.currentTime);
		noise_buffer.connect(gain_node);
		let audio = gain_node;

		if (high_pass_freq > 0) {
			audio = highPassFilter(high_pass_freq, time, audio);
		}

		if (low_pass_freq > 0) {
			audio = lowPassFilter(low_pass_freq, time, audio, low_pass_freq_ramp);
		}

		if (duty_cycle_len > 0) {
			audio = dutyCycle(duty_cycle_len, duty_cycle_pct, time, audio);
		}

		if (flange_delay_time > 0) {
			audio = flange(flange_delay_time, flange_feedback_volume, audio);
		}

		if (vibrato_time > 0) {
			audio = vibrato(vibrato_wave_type, vibrato_freq, vibrato_shift_time, time, audio);
		}

		audio = envelope(attack_time, decay_time, sustain_time, release_time, attack_punch_volume, audio);

		let master_volume_gain = ACTX.createGain();
		master_volume_gain.value = master_volume;
		audio.connect(master_volume_gain);
		master_volume_gain.connect(ACTX.destination);

		noise_buffer.start();
		noise_buffer.stop(ACTX.currentTime + time);

		return;
	}

	let tone = oscillatorTone(freq, wave_type);
	let audio = tone;

	if (freq_slide != 0) {
		if (delay_freq_start_time_pct != 0) {
			audio = frequencySlide(freq_slide, delay_freq_start_time_pct, audio);
			audio = delayedFrequencySlide(freq_slide, delay_freq_mult, delay_freq_start_time_pct,
				time, slide_type, audio);

		}
		else {
			audio = frequencySlide(freq_slide, time, audio);
		}
	}
	else if (delay_freq_start_time_pct != 0) {
		audio = delayedFrequencySlide(freq, delay_freq_mult,
			delay_freq_start_time_pct, time, slide_type, audio);
	}

	if (high_pass_freq > 0) {
		audio = highPassFilter(high_pass_freq, time, audio);
	}

	if (low_pass_freq > 0) {
		audio = lowPassFilter(low_pass_freq, time, audio, low_pass_freq_ramp);
	}

	let gain_node = ACTX.createGain();
	gain_node.gain.value = gain;
	audio.connect(gain_node);
	audio = gain_node;

	audio = envelope(attack_time, decay_time, sustain_time, release_time, attack_punch_volume, audio);

	if (duty_cycle_len > 0) {
		audio = dutyCycle(duty_cycle_len, duty_cycle_pct, time, audio);
	}

	if (flange_delay_time > 0) {
		audio = flange(flange_delay_time, flange_feedback_volume, audio);
	}

	if (vibrato_time > 0) {
		audio = vibrato(vibrato_wave_type, vibrato_freq, vibrato_shift_time, time, audio);
	}

	let master_volume_gain = ACTX.createGain();
	master_volume_gain.value = master_volume;
	audio.connect(master_volume_gain);
	master_volume_gain.connect(ACTX.destination);
	//audio.connect(ACTX.destination);

	tone.start();
	tone.stop(ACTX.currentTime + time);

}

export function runVectorGame(canvas_id, wasm_file, game_loop_name, memory_pages = 100) {
	const canvas = document.getElementById(canvas_id);

	memory = new WebAssembly.Memory({ initial: memory_pages });
	importObject = {
		env: {
			abort: (msg, file, line, colm) => {
				console.log(`${line}:${colm}`);
				console.log(`msg: ${getString(msg)}`);
				console.log(`file: ${getString(file)}`);
			},
			memory: memory,
			seed: Date.now,
		},
		VectorEngine: {
			renderLineData: renderLine,
			canvasWidth: canvas.width,
			canvasHeight: canvas.height,
			playSFX: playSFX,
			setInputPtrs: (k_ptr,
				mld_ptr, mrd_ptr, mmd_ptr,
				mlu_ptr, mru_ptr, mmu_ptr,
				mx_ptr, my_ptr) => {
				keyPtr = k_ptr;

				mouseLeftDownPtr = mld_ptr;
				mouseRightDownPtr = mrd_ptr;
				mouseMiddleDownPtr = mmd_ptr;

				mouseLeftUpPtr = mlu_ptr;
				mouseRightUpPtr = mru_ptr;
				mouseMiddleUpPtr = mmu_ptr;

				mouseXPtr = mx_ptr;
				mouseYPtr = my_ptr;
			},
			logf32: (f) => console.log(`f32: ${f}`),
			logi32: (i) => console.log(`i32: ${i}`),
		}
	};

	(async () => {
		console.log(`wasm_file=${wasm_file}`);
		wasm_obj = await WebAssembly.instantiateStreaming(fetch(wasm_file),
			importObject);
		game_loop = wasm_obj.instance.exports[game_loop_name];
		//pre_update = wasm_obj.instance.exports.preUpdate;
		//post_update = wasm_obj.instance.exports.postUpdate;
		requestAnimationFrame(render);
		canvas.addEventListener('mousemove', mouseMove);
		canvas.addEventListener('mousedown', mouseDown);
		canvas.addEventListener('mouseup', mouseUp);
		canvas.oncontextmenu = onContext;

		document.addEventListener('keyup', keyUp);
		document.addEventListener('keydown', keyDown);

	})();

	gl = canvas.getContext('webgl2');

	const color_line_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(color_line_vertex_shader, V_COLOR_LINE_SHADER);
	gl.compileShader(color_line_vertex_shader);

	const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragment_shader, F_SHADER);
	gl.compileShader(fragment_shader);

	color_line_program = gl.createProgram();

	gl.attachShader(color_line_program, color_line_vertex_shader);
	gl.attachShader(color_line_program, fragment_shader);

	gl.linkProgram(color_line_program);

	gl.useProgram(color_line_program);

	color_location = gl.getUniformLocation(color_line_program, "u_color");
	scale_location = gl.getUniformLocation(color_line_program, "u_scale");
	rotation_location = gl.getUniformLocation(color_line_program, "u_rotation");
	offset_x_location = gl.getUniformLocation(color_line_program, "u_loop_x");
	offset_y_location = gl.getUniformLocation(color_line_program, "u_loop_y");

	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	position_al = gl.getAttribLocation(color_line_program, 'position');
	gl.enableVertexAttribArray(position_al);
}
