function main() {
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

  // look up where the  vertex data needs to go
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  if (positionAttributeLocation < 0) {
    console.log('Failed to get the storage attribute a_position.');
    return;
  }

  // look up uniform
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

  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  /**
   * 弧度转角度
   * @param {*} r 
   */
  function radToDeg(r) {
    return r * 180 / Math.PI;
  }
  /**
   * 角度转弧度
   * @param {*} d 
   */
  function degToRad(d) {
    return d * Math.PI / 180;
  }

  let color = [Math.random(), Math.random(), Math.random(), 1];
  // 平移
  let translation = [45, 150, 0];
  // 旋转
  let rotation = [degToRad(40), degToRad(25), degToRad(325)];
  // 缩放
  let scale = [1, 1, 1];

  drawScene();

  // setup a ui
  webglLessonsUI.setupSlider('#x', { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider('#y', { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
  webglLessonsUI.setupSlider("#angleX", { value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360 });
  webglLessonsUI.setupSlider("#angleY", { value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360 });
  webglLessonsUI.setupSlider("#angleZ", { value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360 });
  webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
  webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });
  webglLessonsUI.setupSlider("#scaleZ", { value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2 });

  // 平移
  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      // 每次都重新绘制
      drawScene();
    }
  }

  // 旋转
  function updateRotation(index) {
    return function (event, ui) {
      let angleInDegrees = ui.value;
      let angleInRadians = degToRad(angleInDegrees);
      rotation[index] = angleInRadians;
      drawScene();
    }
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

    // set a random color 设置颜色
    gl.uniform4fv(colorLocation, color);

    // 计算矩阵
    const m4 = new Matrix4();
    let matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    // 设置矩阵
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // 绘制图形
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
      0, 0, 0,
      30, 0, 0,
      0, 150, 0,
      0, 150, 0,
      30, 0, 0,
      30, 150, 0,

      // top rung
      30, 0, 0,
      100, 0, 0,
      30, 30, 0,
      30, 30, 0,
      100, 0, 0,
      100, 30, 0,

      // middle rung
      30, 60, 0,
      67, 60, 0,
      30, 90, 0,
      30, 90, 0,
      67, 60, 0,
      67, 90, 0,
    ]),
    gl.STATIC_DRAW);
}

main();
