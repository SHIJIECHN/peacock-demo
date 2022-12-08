import { Camera } from '@/peacock/core/objects/camera/Camera';

export class Renderer {
	private readonly gl: WebGL2RenderingContext;
	private width: number = 0;
	private height: number = 0;
	// array buffer
	private vertices: Float32Array;
	private vertexBuffer: WebGLBuffer;
	private indices: Uint16Array;
	// light
	private light: Object;
	// camera
	private camera: Camera = null;

	constructor(view: HTMLCanvasElement) {
		const gl = (this.gl = view.getContext('webgl2'));
		if (!this.gl) {
			console.error('Failed to get webgl2');
			return;
		}
		// width and height, same with the canvas
		this.width = view.clientWidth;
		this.height = view.clientHeight;

		// array buffer
		this.vertices = new Float32Array(2000 * 4 * 5);
		this.vertexBuffer = gl.createBuffer();
		this.indices = new Uint16Array(2000 * 6);

		// init webgl
		gl.enable(gl.DEPTH_TEST);

		// light
		this.light = {
			directLights: [],
			ambientLights: [],
			pointLights: []
		};

		// render list

		// camera
		this.camera = null;
	}
	renderer(scene, camera: Camera) {}
}
