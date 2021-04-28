export function init() {
	// add horizontal lines
	let yval = -1.0;
	let color = [0.1, 0.1, 0.1];
	for (let i = 0; i < GRID_LINE_COUNT; i++) {
		color = [0.1, 0.1, 0.1];
		if (i === GRID_LINE_COUNT / 2) {
			color = [1.0, 1.0, 0.0];
		}
		else if (i % 8 === 0) {
			color = [0.5, 0.5, 0.5];
		}

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
		if (i === GRID_LINE_COUNT / 2) {
			color = [1.0, 1.0, 0.0];
		}
		else if (i % 8 === 0) {
			color = [0.5, 0.5, 0.5];
		}

		grid_lines.push(xval, -1.0); // bottom point
		grid_lines.push(color[0], color[1], color[2], 1.0); // bottom point color
		grid_lines.push(xval, 1.0);  // top point
		grid_lines.push(color[0], color[1], color[2], 1.0); // top point color
		xval += LINE_DIST;
	}
