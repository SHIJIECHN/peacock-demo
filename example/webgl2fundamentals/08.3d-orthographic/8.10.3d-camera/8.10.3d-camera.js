function main() {
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

  // look up where the  vertex data needs to go
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  if (positionAttributeLocation < 0) {
    console.log('Failed to get the storage attribute a_position.');
    return;
  }

  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
  if (colorAttributeLocation < 0) {
    console.log('Failed to get the storage atteibute a_color');
    return;
  }

  // look up uniform
  // 变换矩阵
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
  const fudgeLocation = gl.getUniformLocation(program, 'u_fudgeFactor');

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

  // create the color buffer, make it the current ARRAY_BUFFER
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  setColors(gl);

  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

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

  let fieldOfViewRadians = degToRad(60);
  let cameraAngleRadians = degToRad(0);

  drawScene();

  // setup a ui
  webglLessonsUI.setupSlider("#cameraAngle", { value: radToDeg(cameraAngleRadians), slide: updateCameraAngle, min: -360, max: 360 });

  // 修改因子
  function updateCameraAngle(event, ui) {
    cameraAngleRadians = degToRad(ui.value);
    drawScene();
  }

  function drawScene() {
    let numFs = 5;
    let radius = 200;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // 告诉WebGL如何从裁剪空间对应到像素
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 清空画布
    gl.clearColor(0, 0, 0, 0);
    // 清空画布和深度缓冲
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);

    // tell webgl to cull faces 只对正面的三角形进行绘制，背面三角形不绘制
    gl.enable(gl.CULL_FACE);

    // 使用我们的程序
    gl.useProgram(program);

    // 绑定属性/缓冲
    gl.bindVertexArray(vao);

    // // set a random color 设置颜色
    // gl.uniform4fv(colorLocation, color);

    // 计算矩阵
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;
    const m4 = new Matrix4();
    let projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // 计算相机矩阵。相机矩阵是指原点处的相机到某个位置上，需要进行的变换。此时相机是在原点处的。
    /**
     * 相机矩阵：
     * +----+----+----+----
     * | Xx | Xy | Xz | 0 |  <- x axis
     * +----+----+----+----
     * | Yx | Yx | Yz | 0 |  <- y axis
     * +----+----+----+----
     * | Zx | Zy | Zz | 0 |  <- z axis
     * +----+----+----+----
     * | Tx | Ty | Tz | 1 |  <- 相机位置
     * +----+----+----+----
     */
    let cameraMatrix = m4.yRotation(cameraAngleRadians);
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);

    // Make a view matrix from the camera matrix 
    // 通过相机矩阵（相机进行的变换）计算“视图矩阵”，视图矩阵是将所有物体以相反于相机的方向运动，就好像相机位于原点(0,0,0)
    let viewMatrix = m4.inverse(cameraMatrix);

    // create a viewProjection matrix. This will both apply perspective 
    // and move the world so that the camera is effectively the origin.
    // 将投影空间移动到视图空间
    // 创建一个组合投影矩阵，这将应用于透视和以相机为原点中心进行运动
    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    for (let i = 0; i < numFs; i++) {
      let angle = i * Math.PI * 2 / numFs;

      let x = Math.cos(angle) * radius;
      let z = Math.sin(angle) * radius;
      // 从视图投影矩阵开始，计算F的矩阵
      let matrix = m4.translate(viewProjectionMatrix, x, 0, z);

      // set the matrix
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      // 绘制图形
      gl.drawArrays(gl.TRIANGLES, 0, 16 * 6)
    }
  }
}

// Fill the buffer with the values that define a rectangle.
// with the values that define a letter 'F'.
function setGeometry(gl) {
  const position = new Float32Array([
    // left column front
    0, 0, 0,
    0, 150, 0,
    30, 0, 0,
    0, 150, 0,
    30, 150, 0,
    30, 0, 0,

    // top rung front
    30, 0, 0,
    30, 30, 0,
    100, 0, 0,
    30, 30, 0,
    100, 30, 0,
    100, 0, 0,

    // middle rung front
    30, 60, 0,
    30, 90, 0,
    67, 60, 0,
    30, 90, 0,
    67, 90, 0,
    67, 60, 0,

    // left column back
    0, 0, 30,
    30, 0, 30,
    0, 150, 30,
    0, 150, 30,
    30, 0, 30,
    30, 150, 30,

    // top rung back
    30, 0, 30,
    100, 0, 30,
    30, 30, 30,
    30, 30, 30,
    100, 0, 30,
    100, 30, 30,

    // middle rung back
    30, 60, 30,
    67, 60, 30,
    30, 90, 30,
    30, 90, 30,
    67, 60, 30,
    67, 90, 30,

    // top
    0, 0, 0,
    100, 0, 0,
    100, 0, 30,
    0, 0, 0,
    100, 0, 30,
    0, 0, 30,

    // top rung right
    100, 0, 0,
    100, 30, 0,
    100, 30, 30,
    100, 0, 0,
    100, 30, 30,
    100, 0, 30,

    // under top rung
    30, 30, 0,
    30, 30, 30,
    100, 30, 30,
    30, 30, 0,
    100, 30, 30,
    100, 30, 0,

    // between top rung and middle
    30, 30, 0,
    30, 60, 30,
    30, 30, 30,
    30, 30, 0,
    30, 60, 0,
    30, 60, 30,

    // top of middle rung
    30, 60, 0,
    67, 60, 30,
    30, 60, 30,
    30, 60, 0,
    67, 60, 0,
    67, 60, 30,

    // right of middle rung
    67, 60, 0,
    67, 90, 30,
    67, 60, 30,
    67, 60, 0,
    67, 90, 0,
    67, 90, 30,

    // bottom of middle rung.
    30, 90, 0,
    30, 90, 30,
    67, 90, 30,
    30, 90, 0,
    67, 90, 30,
    67, 90, 0,

    // right of bottom
    30, 90, 0,
    30, 150, 30,
    30, 90, 30,
    30, 90, 0,
    30, 150, 0,
    30, 150, 30,

    // bottom
    0, 150, 0,
    0, 150, 30,
    30, 150, 30,
    0, 150, 0,
    30, 150, 30,
    30, 150, 0,

    // left side
    0, 0, 0,
    0, 0, 30,
    0, 150, 30,
    0, 0, 0,
    0, 150, 30,
    0, 150, 0,
  ]);

  // Center the F around the origin and Flip it around. We do this because 
  // We're in 3D now with and +Y is up where as before when we started with 2D
  // We had +Y as down.

  // We could do by changing all the values above but I'm lazy.
  // We could also do it with a matrix at draw time but you should
  // never do stuff at draw time if you can do it at init time.
  const m4 = new Matrix4();
  let matrix = m4.xRotation(Math.PI);
  matrix = m4.translate(matrix, -50, -75, -15);

  for (let i = 0; i < position.length; i += 3) {
    // matrix 与向量相乘，得到一个向量
    const vector = m4.transformVector(matrix, [position[i + 0], position[i + 1], position[i + 2], 1]);
    position[i + 0] = vector[0];
    position[i + 1] = vector[1];
    position[i + 2] = vector[2];

  };

  gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
}

function setColors(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Uint8Array([
      // left column front
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,

      // top rung front
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,

      // middle rung front
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,
      200, 70, 120,

      // left column back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

      // top rung back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

      // middle rung back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

      // top
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,

      // top rung right
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,

      // under top rung
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,

      // between top rung and middle
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,

      // top of middle rung
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,

      // right of middle rung
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,

      // bottom of middle rung.
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,

      // right of bottom
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,

      // bottom
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,

      // left side
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
    ]),
    gl.STATIC_DRAW);
}

main();
