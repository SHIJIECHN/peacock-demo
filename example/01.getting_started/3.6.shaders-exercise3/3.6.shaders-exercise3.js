
function main() {
  // 引入init.js 封装工具
  const ourShader = new Shader(gl);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // 位置  
  const vertices = new Float32Array([
    0.5, -0.5, 0.0,    // 右下
    -0.5, -0.5, 0.0,   // 左下
    0.0, 0.5, 0.0,   // 顶部
  ]);

  const size = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  let offset = 0;

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  // 位置属性
  const positionAttributeLocation = gl.getAttribLocation(ourShader.program, 'aPos');
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  ourShader.use();
  gl.bindVertexArray(vao);
  const primitiveType = gl.TRIANGLES; // 画三角形
  offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();