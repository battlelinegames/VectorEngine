var hover_flag = false;
var hover_point = [0.0, 0.0, 1.0, 1.0, 0.0, 1.0];
var hover_index = 0;

let red = 1.0;
let green = 1.0;
let blue = 1.0;

var select_flag = false;
var select_point = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0];
var select_index = 0;

var grid_lines = [];
var point_verts = [];
var line_loop = [];
var canvas = document.getElementById('cnvs');
var gl = canvas.getContext('webgl2');
var scale = 1.0;
var translate_x = 0.0;
var translate_y = 0.0;
var line_vertex_shader;
var point_vertex_shader;
var fragment_shader;
var line_program;
var point_program;

// FROM OG CODE
var layer_map = new Map();
var selected_layer = 'default';
//layer_map[selected_layer] = line_loop;
layer_map.set(selected_layer, line_loop);
var point_map = new Map();
point_map.set(selected_layer, point_verts);

var color_map = new Map();
color_map.set(selected_layer, '#ffffff');
// END OG CODE

const canvas_size = canvas.width;
const MAX_ZOOM = 4.0;
const MIN_ZOOM = 1.0;
const GRID_LINE_COUNT = 128;
const LINE_DIST = 2.0 / GRID_LINE_COUNT;
//const HOVER_COLOR = new Float32Array([1.0, 1.0, 0.0, 1.0]);
//const SELECT_COLOR = new Float32Array([1.0, 0.0, 0.0, 1.0]);

const LINE_SHADER = /*glsl*/ `#version 300 es
	precision mediump float;
	uniform vec2 translate;
	uniform float scale;
	in vec2 position;
	in vec4 color;
	out vec4 c;

	void main() {
		float pos_x = position.x + translate.x;
		float pos_y = position.y + translate.y;

		gl_Position = vec4( pos_x * scale, pos_y * scale, 0.0, 1.0 );
		c = color;
	}
`; // end glsl

const POINT_SHADER = /*glsl*/ `#version 300 es
	precision mediump float;
	uniform vec2 translate;
	uniform float scale;
	in vec2 position;
	in vec4 color;
	out vec4 c;

	void main() {
		float pos_x = position.x + translate.x;
		float pos_y = position.y + translate.y;

		gl_Position = vec4( pos_x * scale, pos_y * scale, 0.0, 1.0 );
		gl_PointSize = 8.0 * scale;
		c = color;
	}
`; // end glsl

const FRAGMENT_SHADER = /*glsl*/`#version 300 es
	precision mediump float;

	in vec4 c;
	out vec4 color;

	void main() {
		color = c;
	}
`; // end glsl

export function createOutputText(object_name) {
	object_name = object_name.replace(' ', '_');
	object_name = object_name.replace("'", '');
	let loop_count = 0;
	let out_text = `var ${object_name}_color:u32 = `;

	for (let [key, value] of color_map) {
		loop_count++;
		let hex_string = '0xff_';
		hex_string += value.substring(5, 7) + "_";
		hex_string += value.substring(3, 5) + "_";
		hex_string += value.substring(1, 3);

		out_text += ` ${hex_string}; // ${key} layer color`;
	}
	out_text += `

`;

	for (let [key, value] of layer_map) {
		out_text += `var ${key}_layer:StaticArray<f32>=[`;
		for (var i = 0; i < value.length; i += 6) {
			out_text +=
				`${value[i]}, ${value[i + 1]}, `;
		}
		out_text += "];\n";
	}
	return out_text;
}

export function setLayer(layer_name) {
	selected_layer = layer_name;
	var color_value = "#ffffff";
	line_loop = layer_map.get(selected_layer);
	point_verts = point_map.get(selected_layer);

	var return_string = "";

	// THIS SHOULD RETURN A STRING
	for (let [key, value] of layer_map) {
		console.log(`setLayer key=${key}`);

		if (key === selected_layer) {
			layer_map.set(selected_layer, line_loop);
			point_map.set(selected_layer, point_verts);

			return_string += `<div class="currentLayer">${key} 
				<input type="color" onchange="setColorCallback(this.value);" value="${color_value}"></div>
				<br/><br/>`;
		}
		else {
			return_string += `
			<button class="layerButton" onmousedown="setLayerCallback('${key}')">
			${key}</button><br/><br/>
			`;
		}
	}
	return return_string;
}

export function setColor(color_string) {
	color_map.set(selected_layer, color_string);
	red = parseInt(color_string.substr(1, 2), 16) / 255.0;
	green = parseInt(color_string.substr(3, 2), 16) / 255.0;
	blue = parseInt(color_string.substr(5, 2), 16) / 255.0;

	for (let i = 0; i < line_loop.length; i += 6) {
		line_loop[i + 2] = red;
		line_loop[i + 3] = green;
		line_loop[i + 4] = blue;
	}
}

export function deletePoint() {
	if (hover_flag === true) {
		point_verts.splice(hover_index, 6);
		line_loop.splice(hover_index, 6);
		hover_flag = false;
	}
}

export function deleteLayer() {
	let return_string = "";

	if (selected_layer !== 'default') {
		point_map.delete(selected_layer);
		layer_map.delete(selected_layer);
		color_map.delete(selected_layer);
	}
	else {
		alert("You can't delete the default layer");
		return return_string;
	}
	selected_layer = 'default';
	line_loop = layer_map.get(selected_layer);
	point_verts = point_map.get(selected_layer);

	// FIGURE OUT HOW TO SET THE COLOR
	//setColor(selected_layer, "#ffffff");
	for (let [key, value] of layer_map) {
		if (key === selected_layer) {
			//point_map.set(selected_layer, point_verts);
			//layer_map.set(selected_layer, line_loop);
			let color_string = color_map.get(selected_layer);

			return_string += `
				<div class="currentLayer">${key}
					<input type="color" onchange="setColorCallback(this.value);" value="${color_string}">
				</div>
				<br/><br/>
				`;
		}
		else {
			return_string += `
				<button class="layerButton" onmousedown="setLayerCallback('${key}')">
				${key}</button><br/><br/>
				`;
		}
	}
	return return_string;
}

var unnamed_layer_number = 0;

export function addLayer() {
	var return_string = "Unnamed Layer";
	var new_layer_name = prompt('Create a new layer',
		'Layer Name');
	var color_string = "#ffffff";
	red = green = blue = 1.0;
	if (new_layer_name == null || new_layer_name == '' || new_layer_name.indexOf(' ') != -1) {
		alert('You need a better name (no spaces please)');
	}
	else {
		return_string = "";
		selected_layer = new_layer_name;
		point_map.set(selected_layer, point_verts);
		point_verts = [];
		layer_map.set(selected_layer, line_loop);
		line_loop = [];
		color_map.set(selected_layer, '#ffffff');

		// FIGURE OUT HOW TO SET THE COLOR
		//setColor(selected_layer, "#ffffff");
		for (let [key, value] of layer_map) {
			console.log(`key=${key}`);
			if (key === selected_layer) {
				point_map.set(selected_layer, point_verts);
				layer_map.set(selected_layer, line_loop);
				return_string += `
				<div class="currentLayer">${key}
					<input type="color" onchange="setColorCallback(this.value);" value="${color_string}">
				</div>
				<br/><br/>
				`;
			}
			else {
				return_string += `
				<button class="layerButton" onmousedown="setLayerCallback('${key}')">
				${key}</button><br/><br/>
				`;
			}
		}
	}

	if (return_string === "Unnamed Layer") {
		unnamed_layer_number++;
		return_string += ` ${unnamed_layer_number}`;
	}
	return return_string;
}

export function mouseDown(x, y) {
	if (hover_flag === true) {
		select_flag = true;
		select_index = hover_index;
		select_point[0] = hover_point[0];
		select_point[1] = hover_point[1];
	}
	else {
		let glc2 = GRID_LINE_COUNT / 2;
		let glx = xPixelToGL(x) / scale - translate_x;
		let gly = yPixelToGL(y) / scale - translate_y;

		glx = Math.round(glc2 * glx) / glc2 - LINE_DIST / 2;
		gly = Math.round(glc2 * gly) / glc2 + LINE_DIST / 2;

		select_flag = false;

		for (let i = 0; i < point_verts.length; i += 6) {
			if (select_index === i) {
				continue;
			}

			let x_eq = (Math.abs(glx - point_verts[i]) <= LINE_DIST * 2);
			let y_eq = (Math.abs(gly - point_verts[i + 1]) <= LINE_DIST * 2);
			if (x_eq && y_eq) {
				select_point[0] = point_verts[i];
				select_point[1] = point_verts[i + 1];

				select_flag = true;
				break;
			}
		}

		if (select_flag === true) {
			return;
		}

		// ADD A POINT
		point_verts.push(glx, gly);
		point_verts.push(0.6, 0.6, 1.0, 1.0)
		line_loop.push(glx, gly);
		line_loop.push(red, green, blue, 1.0)

	}
}

export function mouseUp() {
	select_flag = false;
}

export function mouseMove(x, y) {
	let glc2 = GRID_LINE_COUNT / 2;
	let glx = xPixelToGL(x) / scale - translate_x;
	let gly = yPixelToGL(y) / scale - translate_y;

	glx = Math.round(glc2 * glx) / glc2 - LINE_DIST;
	gly = Math.round(glc2 * gly) / glc2 + LINE_DIST;
	hover_flag = false;

	if (select_flag === false) {
		for (let i = 0; i < point_verts.length; i += 6) {
			let x_eq = (Math.abs(glx - point_verts[i]) <= LINE_DIST * 2);
			let y_eq = (Math.abs(gly - point_verts[i + 1]) <= LINE_DIST * 2);
			if (x_eq && y_eq) {
				hover_index = i;
				hover_point[0] = point_verts[i];
				hover_point[1] = point_verts[i + 1];

				hover_flag = true;
				break;
			}
		}

	}
	else {
		line_loop[select_index] = glx;
		line_loop[select_index + 1] = gly;
		point_verts[select_index] = glx;
		point_verts[select_index + 1] = gly;
		select_point[0] = glx;
		select_point[1] = gly;
	}
}

export function moveX(x) {
	translate_x += x;
}

export function moveY(y) {
	translate_y += y;
}

export function zoomIn(x, y) {
	scale *= 2.0;
	if (scale > MAX_ZOOM) {
		scale = MAX_ZOOM;
		return;
	}

	let glc2 = GRID_LINE_COUNT / 2;
	let glx = (xPixelToGL(x) - translate_x) / scale;
	let gly = (yPixelToGL(y) - translate_y) / scale;

	glx = Math.round(glc2 * glx) / glc2;
	gly = Math.round(glc2 * gly) / glc2;

	translate_x = -glx;
	translate_y = -gly;
}

export function zoomOut(x, y) {
	scale /= 2.0;
	if (scale < MIN_ZOOM) {
		scale = MIN_ZOOM;
		return;
	}

	let glc2 = GRID_LINE_COUNT / 2;

	let glx = (xPixelToGL(x) - translate_x) / scale;
	let gly = (yPixelToGL(y) - translate_y) / scale;

	glx = Math.round(glc2 * glx) / glc2;
	gly = Math.round(glc2 * gly) / glc2;

	translate_x = -glx;
	translate_y = -gly;

	if (scale === 1.0) {
		translate_x = 0.0;
		translate_y = 0.0;
	}
}

export function init() {
	// add horizontal lines
	let yval = -1.0;
	let color = [0.1, 0.1, 0.1];
	for (let i = 0; i < GRID_LINE_COUNT; i++) {
		color = [0.1, 0.1, 0.1];

		grid_lines.push(-1.0, yval); // left point
		grid_lines.push(color[0], color[1], color[2], 1.0); // left point color
		grid_lines.push(1.0, yval);  // right point
		grid_lines.push(color[0], color[1], color[2], 1.0); // right point color
		yval += LINE_DIST;
	}

	// add vertical lines
	let xval = -1.0;
	for (let i = 0; i < GRID_LINE_COUNT; i++) {
		color = [0.1, 0.1, 0.1];

		grid_lines.push(xval, -1.0); // bottom point
		grid_lines.push(color[0], color[1], color[2], 1.0); // bottom point color
		grid_lines.push(xval, 1.0);  // top point
		grid_lines.push(color[0], color[1], color[2], 1.0); // top point color
		xval += LINE_DIST;
	}


	xval = -1.0;
	yval = -1.0;

	for (let i = 0; i < GRID_LINE_COUNT / 8 + 1; i++) {
		color = [0.4, 0.4, 0.4];

		grid_lines.push(-1.0, yval); // left point
		grid_lines.push(color[0], color[1], color[2], 1.0); // left point color
		grid_lines.push(1.0, yval);  // right point
		grid_lines.push(color[0], color[1], color[2], 1.0); // right point color
		yval += LINE_DIST * 8;
	}

	// add vertical lines
	for (let i = 0; i < GRID_LINE_COUNT / 8 + 1; i++) {
		color = [0.4, 0.4, 0.4];

		grid_lines.push(xval, -1.0); // bottom point
		grid_lines.push(color[0], color[1], color[2], 1.0); // bottom point color
		grid_lines.push(xval, 1.0);  // top point
		grid_lines.push(color[0], color[1], color[2], 1.0); // top point color
		xval += LINE_DIST * 8;
	}

	grid_lines.push(-1.0, 0.0); // left point
	grid_lines.push(1.0, 0.5, 0.0, 1.0); // left point color
	grid_lines.push(1.0, 0.0);  // right point
	grid_lines.push(1.0, 0.5, 0.0, 1.0); // right point color

	grid_lines.push(0.0, -1.0); // left point
	grid_lines.push(1.0, 0.6, 0.0, 1.0); // left point color
	grid_lines.push(0.0, 1.0);  // right point
	grid_lines.push(1.0, 0.6, 0.0, 1.0); // right point color

	// CREATE THE LINE SHADER
	line_vertex_shader = gl.createShader(gl.VERTEX_SHADER)
	gl.shaderSource(line_vertex_shader, LINE_SHADER);
	gl.compileShader(line_vertex_shader);

	if (!gl.getShaderParameter(line_vertex_shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(line_vertex_shader));
	}

	// CREATE THE POINT SHADER
	point_vertex_shader = gl.createShader(gl.VERTEX_SHADER)
	gl.shaderSource(point_vertex_shader, POINT_SHADER);
	gl.compileShader(point_vertex_shader);

	if (!gl.getShaderParameter(point_vertex_shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(point_vertex_shader));
	}

	// CREATE FRAGMENT SHADER
	fragment_shader = gl.createShader(gl.FRAGMENT_SHADER)
	gl.shaderSource(fragment_shader, FRAGMENT_SHADER);
	gl.compileShader(fragment_shader);

	if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(fragment_shader));
	}

	// CREATE COLOR LINE RENDERING PROGRAM
	line_program = gl.createProgram();

	gl.attachShader(line_program, line_vertex_shader);
	gl.attachShader(line_program, fragment_shader);

	gl.linkProgram(line_program);
	if (!gl.getProgramParameter(line_program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(line_program));
	}

	// CREATE POINT RENDERING PROGRAM
	point_program = gl.createProgram();

	gl.attachShader(point_program, point_vertex_shader);
	gl.attachShader(point_program, fragment_shader);

	gl.linkProgram(point_program);
	if (!gl.getProgramParameter(point_program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(point_program));
	}
}

// pixel coordinates to webgl coordinates
function yPixelToGL(py) {
	return 1 - (py / canvas_size) * 2;
}

// pixel coordinates to webgl coordinates
function xPixelToGL(px) {
	return (px / canvas_size) * 2 - 1;
}

export function renderHover() {
	// var hover_flag = false;
	// var hover_point = [0, 0];
	if (select_flag === true) {
		renderPoints(select_point);
	}
	else if (hover_flag === true) {
		renderPoints(hover_point);
	}

}

function renderLines(line_array, draw_type = gl.LINES) {
	let line_data = new Float32Array(line_array);

	gl.useProgram(line_program);

	let translate_location = gl.getUniformLocation(line_program, "translate");
	gl.uniform2f(translate_location, translate_x, translate_y);

	let scale_location = gl.getUniformLocation(line_program, "scale");
	gl.uniform1f(scale_location, scale);

	// FIND OUT IF YOU CAN REUSE THE BUFFER
	let buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, line_data, gl.STATIC_DRAW);

	let position_al = gl.getAttribLocation(line_program, 'position');
	gl.enableVertexAttribArray(position_al);

	let color_al = gl.getAttribLocation(line_program, 'color');
	gl.enableVertexAttribArray(color_al);

	let dimensions = 2;
	const data_type = gl.FLOAT;
	const normalize = gl.FALSE;
	let stride = 24; // 24 byte stride
	let offset = 0;
	gl.vertexAttribPointer(position_al, dimensions, data_type, normalize, stride, offset);

	dimensions = 4;
	stride = 24;  // 24 byte stride
	offset = 8;  // color values 8 bytes into the stride
	gl.vertexAttribPointer(color_al, dimensions, data_type, normalize, stride, offset);

	// ADD COLORS INTO THE line_point_array
	gl.drawArrays(draw_type, 0, line_array.length / 6);
}

export function renderGrid() {
	renderLines(grid_lines);
}

export function renderLoop(render_lines = false) {
	let temp_line_loop;

	if (render_lines === false) {
		for (let [key, value] of layer_map) {
			temp_line_loop = layer_map.get(key);
			renderLines(temp_line_loop, gl.LINE_LOOP);
		}
		renderLines(line_loop, gl.LINE_LOOP);
	}
	else {
		for (let [key, value] of layer_map) {
			temp_line_loop = layer_map.get(key);
			renderLines(temp_line_loop, gl.LINE_STRIP);
		}
		renderLines(line_loop, gl.LINE_STRIP);
	}
}

export function renderVerts() {
	renderPoints(point_verts);
}

function renderPoints(point_array) {
	let point_data = new Float32Array(point_array);
	gl.useProgram(point_program);

	let translate_location = gl.getUniformLocation(point_program, "translate");
	gl.uniform2f(translate_location, translate_x, translate_y);

	let scale_location = gl.getUniformLocation(point_program, "scale");
	gl.uniform1f(scale_location, scale);

	let buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, point_data, gl.STATIC_DRAW);

	let position_al = gl.getAttribLocation(point_program, 'position');
	gl.enableVertexAttribArray(position_al);

	let color_al = gl.getAttribLocation(line_program, 'color');
	gl.enableVertexAttribArray(color_al);


	let dimensions = 2;
	const data_type = gl.FLOAT;
	const normalize = gl.FALSE;
	let stride = 24; // 24 byte stride
	let offset = 0;
	gl.vertexAttribPointer(position_al, dimensions, data_type, normalize, stride, offset);

	dimensions = 4;
	stride = 24;  // 24 byte stride
	offset = 8;  // color values 8 bytes into the stride
	gl.vertexAttribPointer(color_al, dimensions, data_type, normalize, stride, offset);

	gl.drawArrays(gl.POINTS, 0, point_array.length / 6);
}

export function clear() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}
