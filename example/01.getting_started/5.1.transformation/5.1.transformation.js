
const image0 = new Image();
const image1 = new Image();

image0.src = '../../resource/container.jpg';
image1.src = '../../resource/awesomeface.png';

let g_image0 = false,
  g_image1 = false;

image0.onload = function () {
  g_image0 = true;
  render(image0, image1);
}

image1.onload = function () {
  g_image1 = true;
  render(image0, image1);
}

async function render(image0, image1) {
  if (!g_image0 || !g_image1) {
    return;
  }

  const { vs, fs } = await readShaderFile('vertexShaderSource.glsl', 'fragmentShaderSource.glsl');
  const ourShader = new Shader(gl, vs, fs);

  if (!ourShader) {
    console.log('Failed to initialize shader.')
    return;
  }

  // look up uniform 
  const transformLoc = gl.getUniformLocation(ourShader.program, 'transform');
  if (!transformLoc) {
    console.log('Failed to get transform.')
  }

  // set up vertex data
  //--------------------------------------------------------------------------
  const vertices = new Float32Array([
    // position  // texture coords
    0.5, 0.5, 0, 1, 1,
    0.5, -0.5, 0, 1, 0,
    -0.5, -0.5, 0, 0, 0,
    -0.5, 0.5, 0, 0, 1,
  ]);
  const FSIZE = vertices.BYTES_PER_ELEMENT;

  const indices = new Int32Array([
    0, 1, 3,
    1, 2, 3
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  const ebo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // position
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * FSIZE, 0);
  gl.enableVertexAttribArray(0);
  //texture coords
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(1);

  // create a texture
  //-------------------------------------------------------------------------
  const texture0 = gl.createTexture();
  const texture1 = gl.createTexture();
  if (!texture0 || !texture1) {
    console.log('Failed to crate texture.');
    return;
  }
  // texture0
  gl.bindTexture(gl.TEXTURE_2D, texture0);
  // set the texture wrapping parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  // set texture filtering parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // set texture filtering to nearest neighbor to clearly see the texels/pixels
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // flip texture's on the y-axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image0.width, image0.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image0);
  gl.generateMipmap(gl.TEXTURE_2D);

  // texture1
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  // set the texture wrapping parameters
  // gl.REPEAT
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // set texture filtering parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // loaded image and generator mipmaps
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
  gl.generateMipmap(gl.TEXTURE_2D);

  ourShader.use();
  // either set it manually like so:
  gl.uniform1i(gl.getUniformLocation(ourShader.program, 'texture1'), 0);
  // or set it via the texture class
  ourShader.setInt('texture2', 1);

  // render
  //-------------------------------------------------------------------------
  drawScense();

  function drawScense() {

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.2, 0.3, 0.3, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // bind textures on corresponding texture units
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    // 矩阵变换
    // let transform = new Matrix4(); // 4x4 单位矩阵
    // transform = transform.translate(0.5, -0.5, 0); // 平移
    // transform = transform.rotate(new Date().getTime(), 0, 0, 1); // 旋转
    // transform = transform.scale(0.5, 0.5, 0.5); // 缩放

    const { mat4 } = glMatrix;
    let trans = mat4.create();
    mat4.translate(trans, trans, [0.5, -0.5, 0]);
    mat4.rotate(trans, trans, new Date().getTime(), [0, 0, 1]);

    gl.uniformMatrix4fv(transformLoc, false, trans);

    // render container
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);

  }
}