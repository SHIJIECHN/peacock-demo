const vertexShaderSource = `#version 300 es
in vec3 aPos;
void main(){
  gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 FragColor;
void main(){
  FragColor = vec4(1.0, 0.5, 0.2, 1.0);
}
`;

function main() {
  // 着色器与着色器程序
  //--------------------------------------------------------------
  // 顶点着色器
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  let vertexShaderSuccess = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!vertexShaderSuccess) {
    console.log('vertexShader compiled failed.');
    return;
  }

  // 片段着色器
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const fragmentShaderSuccess = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!fragmentShaderSuccess) {
    console.log('fragmentShader compiled failed.');
    return;
  }

  // 着色器程序
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const programSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!programSuccess) {
    console.log('link program failed.');
    // return;
  }

  // 注意：需要先绑定VAO，然后再绑定VBO和EBO

  // VAO 顶点数组对象
  // -------------------------------------------------------------
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // VBO 顶点缓冲对象
  //--------------------------------------------------------------
  const position = [
    0.5, 0.5, 0,
    0.5, -0.5, 0,
    -0.5, -0.5, 0,
    -0.5, 0.5, 0
  ];
  const data = new Float32Array(position);
  const positionAttributeLocation = gl.getAttribLocation(program, 'aPos');
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // EBO 元素缓冲对象。属性为：gl.ELEMENT_ARRAY_BUFFER，传入的数据类型为Int32Array
  //---------------------------------------------------------------
  const indices = [
    0, 1, 3,
    1, 2, 3
  ];
  const ebo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(indices), gl.STATIC_DRAW);

  // 链接顶点属性
  //----------------------------------------------------------------
  const size = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  let offset = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(positionAttributeLocation);

  // draw
  //----------------------------------------------------------------
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  // 画回路，收尾相连接
  const primitiveType = gl.LINE_LOOP;
  // 画两个三角形
  // const primitiveType = gl.TRIANGLES;
  offset = 0;
  const count = 6;
  // 使用drawElements方法
  gl.drawElements(primitiveType, count, gl.UNSIGNED_INT, offset)
}

main();
