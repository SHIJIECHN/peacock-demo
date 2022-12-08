function main() {
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getAttribLocation(program, 'a_color');

  // uniform
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  setGeometry(gl);

  gl.enableVertexAttribArray(positionLocation);

  let size = 2;
  let type = gl.FLOAT;
  let normalize = false;
  let stride = 0;
  let offset = 0;
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  setColors(gl);

  gl.enableVertexAttribArray(colorLocation);
  size = 4;
  gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);


  let translation = [200, 150];
  let angleInRadians = 0;
  let scale = [1, -1];

  drawScene();

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
  webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
  webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
  webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
  }

  function updateScale(index) {
    return function (event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    const offset = 0;
    const count = 6;
    gl.drawArrays(gl.TRIANGLES, offset, count);
  }
}


main();

// 画三角形
function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -150, -100,
      150, -100,
      -150, 100,
      150, -100,
      -150, 100,
      150, 100,
    ]),
    gl.STATIC_DRAW
  );
}


function setColors(gl) {
  const r1 = Math.random();
  const b1 = Math.random();
  const g1 = Math.random();

  const r2 = Math.random();
  const b2 = Math.random();
  const g2 = Math.random();


  gl.bufferData(
    gl.ARRAY_BUFFER,
    // 三个顶点使用相同的颜色
    // new Float32Array([
    //   r1, b1, g1, 1,
    //   r1, b1, g1, 1,
    //   r1, b1, g1, 1,
    //   r2, b2, g2, 1,
    //   r2, b2, g2, 1,
    //   r2, b2, g2, 1,
    // ]),

    // 顶点使用不同的颜色
    new Float32Array(
      [Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1,
      Math.random(), Math.random(), Math.random(), 1]),
    gl.STATIC_DRAW
  );

}