var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  // gl_Position = vec4(clipSpace, 0, 1);
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

// 片段着色器GLSL代码
var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = vec4(1, 0, 0.5, 1); 
}
`;

const canvas = document.querySelector('#c');
const gl = canvas.getContext('webgl2'); // 创建一个WebGL2RenderingContext
console.log(gl); // WebGL2RenderingContext 对象
if (!gl) {
  // return;
}

// 使用webgl-utils.js，它包含编译和连接着色器的函数
const program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource])
// 返回了给定对象中某一个属性的下标指向位置 positionAttributeLocation = 0
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
// 查看归一化后的位置
const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

const positionBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
var positions = [
  10, 20,
  80, 20,
  10, 30,
  10, 30,
  80, 20,
  80, 30,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const vao = gl.createVertexArray();

gl.bindVertexArray(vao);

gl.enableVertexAttribArray(positionAttributeLocation);

const size = 2;
const type = gl.FLOAT;
const normalize = false;
const stride = 0;
let offset = 0;
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
webglUtils.resizeCanvasToDisplaySize(gl.canvas);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

gl.useProgram(program);

gl.bindVertexArray(vao);
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

const primitiveType = gl.TRIANGLES;
offset = 0;
const count = 6;
gl.drawArrays(primitiveType, offset, count);