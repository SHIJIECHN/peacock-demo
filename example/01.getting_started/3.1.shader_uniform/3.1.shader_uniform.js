const vertexShaderSource = `#version 300 es
in vec3 aPos;
out vec4 vertexColor;

void main(){
  gl_Position = vec4(aPos, 1.0); // 注意我们如何把一个vec3作为vec4的构造函数的参数
  vertexColor = vec4(0.5, 0, 0, 1); // 把输出变量变为暗红色
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 FragColor;

in vec4 vertexColor; // 从顶点着色器传来的输入变量（名称相同、类型相同）

uniform vec4 outColor; // 在程序代码中设定这个变量


void main(){
  // FragColor = vertexColor;
  FragColor = outColor;
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

  // 指定三角形顶点坐标
  const position = [
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    0.0, 0.5, 0
  ];

  const positionAttributeLocation = gl.getAttribLocation(program, 'aPos');
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);


  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const size = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  let offset = 0;

  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(program);

  const timeValue = new Date().getTime(); // 获取运行的毫秒数 glfwGetTime()
  const greenValue = (Math.sin(timeValue) / 2) + 0.5; // 让颜色在0-1之前改变
  // 查询uniform outColor的位置值
  const vertexColorLocation = gl.getUniformLocation(program, 'outColor');
  /**
   * uniform4f 给outColor 这个值uniform变量赋值值。新的值被用于uniform
   * 参数1：包含了将要修改的uniform属性位置
   * 参数2：浮点值Number（方法名跟'f'）
   * 参数3：浮点数组（如Float32Array)
   * 参数4：整型值Number（方法名跟'i'）
   * 参数5：整型数组Int32Array用于整型向量方法（方法名跟'iv'）
   */
  gl.uniform4f(vertexColorLocation, 0, greenValue, 0, 1)
  gl.bindVertexArray(vao);
  const primitiveType = gl.TRIANGLES; // 画三角形
  offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();