import { Logger } from '@/peacock/core/base/Logger';
import { Matrix, Vector2 } from '@/peacock/math';

/**
 * gl：canvas上下文
 * 着色器
 */
class ShaderProgram {
	private readonly _program: WebGLProgram;
	private readonly _gl: WebGLRenderingContext;
	private _vertexShader: WebGLShader;
	private _fragmentShader: WebGLShader;

	constructor(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
		this._gl = gl; // canvas上下文

		// 着色器程序
		this._program = this._createProgram(vertexSource, fragmentSource);
	}

	// 激活着色器程序
	use(): void {
		this._gl.useProgram(this._program);
	}

	/**
	 * set...方法能够查询uniform的位置值并设置它的值
	 * @param {*} name uniform变量名称
	 * @param {*} value  uniform的值
	 */
	// #region uniform工具函数  https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glUniform.xml
	setFloat(name: string, value: number) {
		const location = this._gl.getUniformLocation(this._program, name);
		this._gl.uniform1f(location, value);
	}

	setFloat2(name: string, x: number, y: number) {
		const location = this._gl.getUniformLocation(this._program, name);
		this._gl.uniform2f(location, x, y);
	}

	setFloat3(name: string, x: number, y: number, z: number) {
		this._gl.uniform3f(location, x, y, z);
	}

	setFloat4(name: string, x: number, y: number, z: number, w: number) {
		const location = this._gl.getUniformLocation(this._program, name);
		this._gl.uniform4f(location, x, y, z, w);
	}

	setInt(name: string, value: number) {
		const location = this._gl.getUniformLocation(this._program, name);
		this._gl.uniform1i(location, value);
	}

	setVec2(name: string, value: Float32Array) {
		const location = this._gl.getUniformLocation(this._program, name);
		this._gl.uniform2fv(location, value);
	}

	setVec3(name: string, x: number, y: number, z: number): void;
	setVec3(name: string, x: Float32Array): void;
	setVec3(name: string, x: Float32Array | number, y?: number, z?: number) {
		if (typeof x === 'number') this._gl.uniform3fv(this._gl.getUniformLocation(this._program, name), [x, y, z]);
		else {
			this._gl.uniform3fv(this._gl.getUniformLocation(this._program, name), x);
		}
	}

	public setVec4(name: string, value: Float32Array) {
		const location = this._gl.getUniformLocation(this._program, name);
		this._gl.uniform4fv(location, value);
	}

	public setMat2(name: string, mat: Matrix) {
		const location = this._gl.getUniformLocation(this._program, name);
		this._gl.uniformMatrix2fv(location, false, mat.elements);
	}

	public setMat3(name: string, mat: Matrix) {
		this._gl.uniformMatrix3fv(this._gl.getUniformLocation(this._program, name), false, mat.elements);
	}

	public setMat4(name: string, mat: Matrix) {
		this._gl.uniformMatrix4fv(this._gl.getUniformLocation(this._program, name), false, mat.elements);
	}
	// #endregion

	/**
	 * init and link program with shader
	 * @param vertexSource
	 * @param fragmentSource
	 * @private
	 */
	private _createProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
		const gl = this._gl;

		// 顶点着色器
		const vertexShader = this._createShader(gl.VERTEX_SHADER, vertexSource);
		if (!vertexShader) {
			return null;
		}

		// 片段着色器
		const fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fragmentSource);
		if (!fragmentShader) {
			return null;
		}

		// link program and shader
		const program = gl.createProgram();
		if (!program) {
			Logger.error('WebGL createProgram or createShader failed.');
			return null;
		}
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (gl.isContextLost()) {
			Logger.error('Context lost while linking program.');
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			return null;
		}
		const success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!success) {
			Logger.error(`Could not conpile WebGL shader. \n ${gl.getProgramInfoLog(program)}`);
		}

		if (!vertexShader || !fragmentShader) {
			Logger.error('WebGl createShader failed.');
			return null;
		}

		this._vertexShader = vertexShader;
		this._fragmentShader = fragmentShader;
		return program;
	}
	private _createShader(shaderType: number, shaderSource: string): WebGLShader | null {
		const gl = this._gl;
		const shader = gl.createShader(shaderType);

		if (!shader) {
			Logger.error('Context lost while create shader.');
			return null;
		}
		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);

		if (gl.isContextLost()) {
			Logger.error('Context lost while compiling shader.');
			gl.deleteShader(shader);
			return null;
		}
		// 检测是否着色器是否编译成功
		let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!success) {
			Logger.error(`Could not compile shader. \n${gl.getShaderInfoLog(shader)}`, ShaderProgram._addLineNum(shaderSource));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	private static _addLineNum(str: string) {
		const lines = str.split('\n');
		const limitLength = (lines.length + 1).toString().length + 6;
		let prefix;
		return lines
			.map((line, index) => {
				prefix = `0: ${index + 1}`;
				if (prefix.length >= limitLength) return prefix.substring(0, limitLength) + line;
				for (let i = 0; i < limitLength - prefix.length; i++) prefix += ' ';
				return prefix + line;
			})
			.join('\n');
	}
}

export default ShaderProgram;
