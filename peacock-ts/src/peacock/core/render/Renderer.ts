import { Logger } from '@/peacock/core/base/Logger';

const positions = new Float32Array([1.0, -1.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0]);

const colors = new Float32Array([
	1.0,
	0.0,
	0.0, // 🔴
	0.0,
	1.0,
	0.0, // 🟢
	0.0,
	0.0,
	1.0 // 🔵
]);

// 🗄️ Index Buffer Data
const indices = new Uint16Array([0, 1, 2]);

// 🕸️ Vertex Shader Source
const vertShaderCode = `#version 300 es
in vec3 inPosition;
in vec3 inColor;
out vec3 vColor;
void main()
{
    vColor = inColor;
    gl_Position = vec4(inPosition, 1.0);
}
`;

// 🟦 Fragment Shader Source
const fragShaderCode = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 FragColor;
void main()
{
    FragColor = vec4(vColor, 1.0);
}
`;

/*************************************************************/

export default class Renderer {
	// canvas
	canvas: HTMLCanvasElement;
	gl: WebGL2RenderingContext;
	animationHandler: number;
	// Resource
	positionBuffer: WebGLBuffer;
	colorBuffer: WebGLBuffer;
	indexBuffer: WebGLBuffer;
	vertModule: WebGLShader;
	fragModule: WebGLShader;
	program: WebGLProgram;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
	}

	start() {
		this.initializeAPI();
		this.initialResource();
		this.render();
	}
	// init WebGL canvas
	initializeAPI() {
		const gl: WebGL2RenderingContext = this.canvas.getContext('webgl2');
		if (!gl) {
			Logger.error('WebGL failed to initialize.');
		}
		this.gl = gl;

		// Most WebGl Apps will want to enable these settings

		// Set the default clear color when calling 'gl.clear'
		// gl.clearColor(0.1, 0.1, 0.1, 1);
		// Write to all channels during a clear
		gl.colorMask(true, true, true, true);
		// Test if when something is drawn
		gl.enable(gl.DEPTH_TEST);
	}

	initialResource() {
		const gl = this.gl;

		let createBuffer = arr => {
			// create buffer
			let buf = gl.createBuffer();
			let bufType = arr instanceof Uint16Array || arr instanceof Uint32Array ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
			// bind buffer
			gl.bindBuffer(bufType, buf);
			// push the buffer to VBO
			gl.bufferData(bufType, arr, gl.STATIC_DRAW);
			return buf;
		};

		this.positionBuffer = createBuffer(positions);
		this.colorBuffer = createBuffer(colors);
		this.indexBuffer = createBuffer(indices);
		// Helper function for creating WebGLShader out of strings
		let createShader = (source: string, stage) => {
			// create Shader
			let s = gl.createShader(stage);
			// Pass Vertex Shader string
			gl.shaderSource(s, source);
			// Compile Vertex Shader
			gl.compileShader(s);
			// Check if shader compiled status
			// @ts-ignore
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
				Logger.error(`An error occurred compiling the shader: ${gl.getShaderInfoLog(s)}`);
			}
			return s;
		};
		this.vertModule = createShader(vertShaderCode, gl.VERTEX_SHADER);
		this.fragModule = createShader(fragShaderCode, gl.FRAGMENT_SHADER);

		// Helper function for creating WebGLProgram out of WebGLShader
		let createProgram = (stages: WebGLShader[]) => {
			let p = gl.createProgram();
			if (!p) {
				Logger.error('WebGL createProgram or createShader failed.');
				return null;
			}
			for (let stage of stages) {
				gl.attachShader(p, stage);
			}
			gl.linkProgram(p);
			const success = gl.getProgramParameter(p, gl.LINK_STATUS);
			if (!success) {
				Logger.error(`Could not compile WebGL shader. \n ${gl.getProgramInfoLog(p)}`);
			}
			return p;
		};

		this.program = createProgram([this.vertModule, this.fragModule]);
	}

	// Render triangle
	render = () => {
		const gl = this.gl;

		// Encode drawing commands
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(this.program);
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		// bind Vertex Layout
		let setVertexBuffer = (buf: WebGLBuffer, name: string) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);
			let loc = gl.getAttribLocation(this.program, name);
			gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 4 * 3, 0);
			gl.enableVertexAttribArray(loc);
		};
		setVertexBuffer(this.positionBuffer, 'inPosition');
		setVertexBuffer(this.colorBuffer, 'inColor');

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

		// Refresh canvas
		this.animationHandler = requestAnimationFrame(this.render);
	};
	// Destroy Buffer, Shader, Program
	destroyResource() {
		const gl = this.gl;
		gl.deleteBuffer(this.positionBuffer);
		gl.deleteBuffer(this.colorBuffer);
		gl.deleteBuffer(this.indexBuffer);
		gl.deleteShader(this.vertModule);
		gl.deleteShader(this.fragModule);
		gl.deleteProgram(this.program);
	}

	// Stop the rendered from refreshing, destroy resources
	stop() {
		cancelAnimationFrame(this.animationHandler);
		this.destroyResource();
	}
}
