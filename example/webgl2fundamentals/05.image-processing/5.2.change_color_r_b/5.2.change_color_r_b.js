function main() {
  const image = new Image();
  image.src = './container.jpg';
  image.onload = function () {
    render(image);
  }
}

function render(image) {
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);;

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');

  // uniform
  const imageLocation = gl.getUniformLocation(program, 'u_image');
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  let size = 2;
  let type = gl.FLOAT;
  let normalize = false;
  let stride = 0;
  let offset = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0, 1.0,
    0, 1.0,
    1.0, 0,
    1.0, 1.0
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordAttributeLocation);
  size = 2;
  type = gl.FLOAT;
  normalize = false;
  stride = 0;
  offset = 0;
  gl.vertexAttribPointer(texCoordAttributeLocation, size, type, normalize, stride, offset);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const mipLevel = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(
    gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    image
  );

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform1i(imageLocation, 0);
  // 画两个三角形
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, image.width, image.height);
  var primitiveType = gl.TRIANGLES;
  const count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}


main();
