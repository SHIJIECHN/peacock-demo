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
  // 变换矩阵
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

  // creat buffer
  //----------------------------------------------------------------------
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  // set Geometry 不妨在drawScene内部
  setGeometry(gl);

  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  let color = [Math.random(), Math.random(), Math.random(), 1];
  // 平移
  let translation = [0, 0];
  // 旋转
  let rotationInRadians = 0;
  // 缩放
  let scale = [1, 1];

  drawScene();

  // setup a ui
  webglLessonsUI.setupSlider('#x', { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider('#y', { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
  webglLessonsUI.setupSlider('#angle', { value: rotationInRadians * 180 / Math.PI, slide: updateAngle, max: 360 });
  webglLessonsUI.setupSlider('#scaleX', { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
  webglLessonsUI.setupSlider('#scaleY', { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });

  // 平移
  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      // 每次都重新绘制
      drawScene();
    }
  }

  // 旋转
  function updateAngle(event, ui) {
    let angleInDegrees = 360 - ui.value;
    rotationInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
  }

  // 缩放
  function updateScale(index) {
    return function (event, ui) {
      scale[index] = ui.value;
      drawScene();
    }
  }

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // 告诉WebGL如何从裁剪空间对应到像素
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 清空画布
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 使用我们的程序
    gl.useProgram(program);

    // 绑定属性/缓冲
    gl.bindVertexArray(vao);

    // 在着实中通过画布分辨率转换像素坐标为裁剪空间坐标
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // set a random color 设置颜色
    gl.uniform4fv(colorLocation, color);

    // 矩阵相乘
    const m3 = new Matrix3();
    const translationMatrix = m3.translation(translation[0], translation[1]);
    const rotationMatrix = m3.rotation(rotationInRadians);
    const scaleMatrix = m3.scaling(scale[0], scale[1]);

    // Multiply the matrices 改变矩阵执行顺序
    let matrix = m3.multiply(scaleMatrix, rotationMatrix);
    matrix = m3.multiply(matrix, translationMatrix);

    // set the matrix
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // draw th rectangle 绘制矩形
    gl.drawArrays(gl.TRIANGLES, 0, 18)

  }

}

// Fill the buffer with the values that define a rectangle.
// with the values that define a letter 'F'.
function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // left column
      0, 0,
      30, 0,
      0, 150,
      0, 150,
      30, 0,
      30, 150,

      // top rung
      30, 0,
      100, 0,
      30, 30,
      30, 30,
      100, 0,
      100, 30,

      // middle rung
      30, 60,
      67, 60,
      30, 90,
      30, 90,
      67, 60,
      67, 90,
    ]),
    gl.STATIC_DRAW);
}

main();