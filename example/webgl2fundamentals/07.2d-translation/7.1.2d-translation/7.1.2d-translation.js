function main() {
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

  // look up where the  vertex data needs to go
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  if (positionAttributeLocation < 0) {
    console.log('Failed to get the storage attribute a_position.');
    return;
  }

  // look up uniform
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  if (!resolutionUniformLocation) {
    console.log('Failed to get the storage attribute u_resolution');
    return;
  }
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  if (!colorLocation) {
    console.log('Failed to get the storage attribute u_color');
    return;
  }

  // creat buffer
  //----------------------------------------------------------------------
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  let translation = [0, 0];
  let width = 100;
  let height = 30;
  let color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

  webglLessonsUI.setupSlider('#x', { slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider('#y', { slide: updatePosition(1), max: gl.canvas.height });

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      // 每次都重新绘制
      drawScene();
    }
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    gl.bindVertexArray(vao);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setRectangle(gl, translation[0], translation[1], width, height);

    // set a random color
    gl.uniform4fv(colorLocation, color);

    // draw th rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6)

  }

}

// Fill the buffer with the values that define a rectangle.
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