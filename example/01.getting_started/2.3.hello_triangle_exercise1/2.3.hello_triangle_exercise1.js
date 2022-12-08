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
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const vertexShaderSuccess = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!vertexShaderSuccess) {
    console.log('vertexShader failed');
    return;
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const fragmentShaderSuccess = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!fragmentShaderSuccess) {
    console.log('fragmentShader failed.');
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  const linkSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linkSuccess) {
    console.log('link program failed.')
  }

  // VAO
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // VBO
  const position = [
    -0.9, -0.5, 0,
    0, -0.5, 0,
    -0.45, 0.5, 0,
    0, -0.5, 0,
    0.9, -0.5, 0,
    0.45, 0.5, 0
  ];
  const positionAttributeLocation = gl.getAttribLocation(program, 'aPos');
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

  const size = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  let offset = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(positionAttributeLocation);


  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  const primitiveType = gl.TRIANGLES;
  const count = 6;
  offset = 0;
  gl.drawArrays(primitiveType, offset, count);
}

main();