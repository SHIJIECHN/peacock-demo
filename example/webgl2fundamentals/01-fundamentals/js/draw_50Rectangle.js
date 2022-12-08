const vertexShaderSource = `#version 300 es

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
const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec4 u_color; // 声明表示颜色的uniform

out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor = u_color; 
}
`;

function main() {
  const canvas = document.querySelector("#c");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  const program = webglUtils.createProgramFromSources(gl,
    [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // look up uniform locations
  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  const colorLocation = gl.getUniformLocation(program, "u_color");

  const positionBuffer = gl.createBuffer();
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);



  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  gl.bindVertexArray(vao);

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  for (let i = 0; i < 50; i++) {
    setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

    const primitiveType = gl.TRIANGLES;
    const count = 6;

    gl.drawArrays(primitiveType, offset, count)
  }

}

main();
// 随机生成数
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

// 画正方形
function setRectangle(gl, x, y, width, height) {
  const x1 = x,
    x2 = x + width,
    y1 = y,
    y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2
  ]), gl.STATIC_DRAW);
}




