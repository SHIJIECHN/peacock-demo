function main() {
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

  // 找到顶点坐标中的属性
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');

  const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
  const textureLocation = gl.getUniformLocation(program, 'u_texture');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // 位置
  //-------------------------------------------------------------------
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Set Geometry.
  setGeometry(gl);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  // 纹理
  //-------------------------------------------------------------------
  // 创建一个纹理坐标缓冲，使其成为当前的ARRAY_BUFFER并复制纹理坐标值
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);

  // 启用属性
  gl.enableVertexAttribArray(texcoordAttributeLocation);

  // 告诉属性如何从 纹理坐标缓冲（ARRAY_BUFFER）中获取数据
  size = 2; // 每次迭代运行提取两个单位数据
  type = gl.FLOAT;  //每个单位的数据类型是32位浮点型
  normalize = true; // 装维0-255 为 0.0-1.0
  stride = 0; // 0 = 移动单位量 * 每个单位占用内存（sizeof(type)）每次迭代获取下一个纹理
  offset = 0;  // 从缓冲起始位置开始读取
  gl.vertexAttribPointer(
    texcoordAttributeLocation, size, type, normalize, stride, offset);

  // Create a texture
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Fill texture with 3x2 pixels
  {
    const level = 0;
    const internalFormat = gl.R8;
    const width = 3;
    const height = 2;
    const border = 0;
    const format = gl.RED;
    const type = gl.UNSIGNED_BYTE;
    const data = new Uint8Array([
      128, 64, 128,
      0, 192, 0,
    ]);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
      format, type, data);

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  // First let's make some variables
  // to hold the translation,
  const fieldOfViewRadians = degToRad(60);
  let modelXRotationRadians = degToRad(0);
  let modelYRotationRadians = degToRad(0);

  let then = 0;

  requestAnimationFrame(drawScene)

  // Draw the scene.
  function drawScene(time) {
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);

    // tell webgl to cull faces
    gl.enable(gl.CULL_FACE);

    // Animate the rotation
    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
      m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    var cameraPosition = [0, 0, 2];
    var up = [0, 1, 0];
    var target = [0, 0, 0];

    // Compute the camera's matrix using look at.
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.setGeometry
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    var matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians);
    matrix = m4.yRotate(matrix, modelYRotationRadians);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(textureLocation, 0);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6 * 6;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(drawScene);
  }
}

// Fill the buffer with the values that define a cube.
function setGeometry(gl) {
  var positions = new Float32Array(
    [
      -0.5, -0.5, -0.5,
      -0.5, 0.5, -0.5,
      0.5, -0.5, -0.5,
      -0.5, 0.5, -0.5,
      0.5, 0.5, -0.5,
      0.5, -0.5, -0.5,

      -0.5, -0.5, 0.5,
      0.5, -0.5, 0.5,
      -0.5, 0.5, 0.5,
      -0.5, 0.5, 0.5,
      0.5, -0.5, 0.5,
      0.5, 0.5, 0.5,

      -0.5, 0.5, -0.5,
      -0.5, 0.5, 0.5,
      0.5, 0.5, -0.5,
      -0.5, 0.5, 0.5,
      0.5, 0.5, 0.5,
      0.5, 0.5, -0.5,

      -0.5, -0.5, -0.5,
      0.5, -0.5, -0.5,
      -0.5, -0.5, 0.5,
      -0.5, -0.5, 0.5,
      0.5, -0.5, -0.5,
      0.5, -0.5, 0.5,

      -0.5, -0.5, -0.5,
      -0.5, -0.5, 0.5,
      -0.5, 0.5, -0.5,
      -0.5, -0.5, 0.5,
      -0.5, 0.5, 0.5,
      -0.5, 0.5, -0.5,

      0.5, -0.5, -0.5,
      0.5, 0.5, -0.5,
      0.5, -0.5, 0.5,
      0.5, -0.5, 0.5,
      0.5, 0.5, -0.5,
      0.5, 0.5, 0.5,

    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Fill the buffer with texture coordinates the cube.
function setTexcoords(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(
      [
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,

        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,

        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        0, 0,
        0, 1,
        1, 0,
        1, 0,
        0, 1,
        1, 1,

      ]),
    gl.STATIC_DRAW);
}
main();