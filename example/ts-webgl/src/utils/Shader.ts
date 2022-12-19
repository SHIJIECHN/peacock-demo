import { mat4, mat3, mat2, vec3 } from 'gl-matrix'

const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type) as WebGLShader;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // 检测是否着色器是否编译成功
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success) {
    throw "colud not compile shader: " + gl.getShaderInfoLog(shader);
  }

  return shader;
}

const createProgram = (gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
  const program = gl.createProgram() as WebGLProgram;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    throw 'could not link shader: ' + gl.getProgramInfoLog(program);
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

/**
 * gl：canvas上下文
 * 着色器
 */
class Shader {
  public gl: WebGL2RenderingContext;
  public program: WebGLProgram;
  constructor(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    this.gl = gl; // canvas上下文
    // 顶点着色器
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    // 片段着色器
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    // 着色器程序
    this.program = createProgram(gl, vertexShader, fragmentShader);
  }

  // 激活着色器程序
  use(): void {
    this.gl.useProgram(this.program);
  }

  getID() {
    return this.program;
  }

  getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }

  /**
   * set...方法能够查询unifrom的位置值并设置它的值
   * @param {*} name uniform变量名称
   * @param {*} value  uniform的值
   */
  // #region uniform工具函数  https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glUniform.xml
  setFloat(name: string, value: number) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform1f(location, value);
  }

  setFloat2(name: string, x: number, y: number) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform2f(location, x, y);
  }

  setFloat3(name: string, x: number, y: number, z: number) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform3f(location, x, y, z);
  }

  setFloat4(name: string, x: number, y: number, z: number, w: number) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform4f(location, x, y, z, w);
  }

  setInt(name: string, value: number) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform1i(location, value);
  }

  setVec2(name: string, value: vec3) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform2fv(location, value)
  }

  setVec3(name: string, value: vec3) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform3fv(location, value)
  }
  // setVec3(name: string, x: number, y: number, z: number): void;
  // setVec3(name: string, x: Float32Array): void;
  // setVec3(name: string, x: Float32Array | number, y?: number, z?: number) {
  //   if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number')
  //     this.gl.uniform3fv(this.gl.getUniformLocation(this.program, name), [x, y, z]);
  //   else
  //     this.gl.uniform3fv(this.gl.getUniformLocation(this.program, name), x as Float32Array);
  // }

  public setVec4(name: string, value: vec3) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniform4fv(location, value)
  }

  public setMat2(name: string, mat: mat2) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.uniformMatrix2fv(location, false, mat)
  }

  public setMat3(name: string, mat: mat3) {
    this.gl.uniformMatrix3fv(this.gl.getUniformLocation(this.program, name), false, mat)
  }

  public setMat4(name: string, mat: mat4) {
    this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, name), false, mat)
  }
  // #endregion
}

export default Shader;