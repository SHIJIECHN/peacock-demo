/**
 * 步骤一：在GPU上创建一个GLSL程序
 */

// 通过字符串连接的方式把GLSL代码片段作为JS的string
// 顶点着色器GLSL代码
var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
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
  return;
}

/**
 * 创建着色器实例、上传GLSL源码和编译着色器
 * @param {*} gl 
 * @param {*} type 着色器类型 VERTEX_SHADER 或者 FRAGMENT_SHADER
 * @param {*} source GLSL源码
 * @returns 
 */

function createShader(gl, type, source) {
  // 1. 创建着色器
  const shader = gl.createShader(type);
  // 2. 连接GLSL源代码
  gl.shaderSource(shader, source);
  // 3. 编译一个GLSL着色器，使其成为二进制数据，然后可以被WebGLProgram对象所使用
  gl.compileShader(shader);
  // 添加到WebGLProgram里
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderParameter(shader)); // eslint-disable-line
  gl.deleteShader(shader);
  return undefined;
}

/**
 * 创建程序（program）链接两个着色器
 * @param {*} gl 
 * @param {*} vertexShader 点着色器
 * @param {*} fragmentShader 片段着色器
 * @returns 
 */
function createProgram(gl, vertexShader, fragmentShader) {
  // 1. 创建和初始化一个WebGLProgram对象
  const program = gl.createProgram();
  // 2. 预先定义好的点着色器和片段着色器
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // 连接给定的WebGLProgram，从而完成程序的片段和点着色器准备GPU代码的过程
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramParameter(program));
  gl.deleteProgram(program);
}

// 创建点着色器对象
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
// 创建片段着色器对象
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource); // WebGLShader {}
// 创建WebGLProgram对象
const program = createProgram(gl, vertexShader, fragmentShader); // WebGLProgram {}


/**
 * 步骤二：通过设置有关状态给GLSL程序提供数据
 */

/**
 * 2.1 数据存放到缓冲区 VBO
 */
// 查找属性的位置
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
// 创建缓冲区 VBO
const positionBuffer = gl.createBuffer();
// 绑定缓冲区。将缓冲区绑定到某个点上，这个缓存区中的资源就可以通过这个点来访问
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [
  0, 0,
  0, 0.5,
  0.7, 0
];

/**
 * 功能：将数组数据拷贝到GPU上的positionBuffer里面
 * new Float32Array(positions)创建32位的浮点数数组
 * gl.STATIC_DRAW提示WebGL如何使用数据
 */
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

/**
 * 2.2 从缓冲区取出数据
 */

// 创建属性状态集合：顶点数组对象(Vertex Array Object)
const vao = gl.createVertexArray();
// 绑定顶点数组到WebGL里。
gl.bindVertexArray(vao);
// 以顶点属性位置作为参数，启用属性。如果没有开启这个属性，这个属性值会是一个常量
gl.enableVertexAttribArray(positionAttributeLocation);
// 设置值如何从缓冲区读取数据
const size = 2; // 顶点属性的大小
const type = gl.FLOAT; // 数据类型
const normalize = false; // 数据是否被标准化
const stride = 0; // 步长
let offset = 0; // 位置数据在缓冲中起始位置的偏移量

// 如何解析顶点数据（应用到逐个顶点属性上）
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

/**
 * 步骤三：
 */

// 画布尽量扩展到可用的空间
webglUtils.resizeCanvasToDisplaySize(gl.canvas);
// 告诉WebGL将裁剪空间的-1~+1映射到x轴0~gl.canvas.width，y轴0~gl.canvas.height
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
// 告诉WebGL运行着色器程序
gl.useProgram(program);
// 告诉WebGL用哪个缓冲区和如何从缓冲区取出数据给到属性
gl.bindVertexArray(vao);
// 告诉WebGL运行我们的GLSL程序
const primitiveType = gl.TRIANGLES; // 画三角形
offset = 0;
const count = 3; // 顶点着色器运行3次
gl.drawArrays(primitiveType, offset, count);
