const vertexShaderSource = `#version 300 es
layout (location = 0) in vec3 aPos; // 位置变量的属性位置为0
layout (location = 1) in vec3 aColor; // 颜色变量的属性位置为1
out vec3 ourColor; // 向片段着色器输出一个颜色

void main(){
  gl_Position = vec4(aPos, 1.0); 
  ourColor = aColor; // 将ourColor设置为我们从顶点数据那里得到的输入颜色
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 FragColor;
in vec3 ourColor; // 从顶点着色器传来的输入变量（名称相同、类型相同）

void main(){
  FragColor = vec4(ourColor, 1);
}
`;

function main() {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  let success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)
  if (!success) {
    console.log('vertextShader compiled failed.')
    return;
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!success) {
    console.log('fragmentShader compiled failed.');
    return;
  }

  // shader program 着色器程序
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.log('link program failed.');
    return;
  }
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // 颜色
  const colorData = [
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0
  ];

  // 位置  
  const vertices = [
    0.5, -0.5, 0.0,    // 右下
    -0.5, -0.5, 0.0,   // 左下
    0.0, 0.5, 0.0,   // 顶部
  ];

  const size = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  let offset = 0;

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // 位置属性
  const positionAttributeLocation = gl.getAttribLocation(program, 'aPos');
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
  // 颜色属性
  const colorPostionAttributeLocation = gl.getAttribLocation(program, 'aColor');
  gl.vertexAttribPointer(colorPostionAttributeLocation, size, type, normalize, stride, offset)
  gl.enableVertexAttribArray(colorPostionAttributeLocation);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  const primitiveType = gl.TRIANGLES; // 画三角形
  offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();