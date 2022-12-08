const vs = `#version 300 es
in vec2 a_position;
uniform mat3 u_matrix;
void main(){
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
`;

const fs = `#version 300 es
precision highp float;
uniform vec4 u_color;
out vec4 outColor;
void main(){
  outColor = u_color;
}
`;

function main() {
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.log('gl error')
    return;
  }

  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

  // look up uniform
  // 获取u_color统一变量的位置
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  // 获取u_matrix统一变量的位置
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const position = [
    -1, -2,
    2, 2,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);


  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  // 执行一个动画，并要求浏览器在下次重绘之前调用指定的回调函数更新动画，
  // 回调函数会在浏览器下一次重绘之前执行
  requestAnimationFrame(drawScene);

  // 绘制场景
  function drawScene(now) {
    now *= 0.001; // 转为秒
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    const matrix = m3.rotation(now); // 计算动画矩阵
    gl.uniformMatrix3fv(matrixLocation, false, matrix); // 给matrixLocation赋值
    gl.uniform4fv(colorLocation, [1, 0, 0, 1]); // 给colorLocation赋值，画红色
    // 画线
    const primitiveType = gl.LINES;
    const offset = 0;
    const count = 2;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(drawScene);
  }
}

main();