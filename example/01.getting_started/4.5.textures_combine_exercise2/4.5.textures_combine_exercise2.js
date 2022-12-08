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

  // set up vertex data
  //--------------------------------------------------------------------------
  const vertices = new Float32Array([
    // position // coolor // texture coords
    0.5, 0.5, 0, 1, 0, 0, 2, 2,
    0.5, -0.5, 0, 0, 1, 0, 2, 0,
    -0.5, -0.5, 0, 0, 0, 1, 0, 0,
    -0.5, 0.5, 0, 1, 1, 0, 0, 2,
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
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * FSIZE, 0);
  gl.enableVertexAttribArray(0);
  // color
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(1);
  //texture coords
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * FSIZE, 6 * FSIZE);
  gl.enableVertexAttribArray(2);

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
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER);

  const borderColor = [1, 1, 0, 1];
  console.log(gl)
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_BORDER_COLOR, borderColor);

  // set texture filtering parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
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
  // gl.MIRRORED_REPEAT 镜像放置
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  // gl.CLAMP_TO_EDGE
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // set texture filtering parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // loaded image and generator mipmaps
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
  gl.generateMipmap(gl.TEXTURE_2D);

  // either set it manually like so:
  gl.uniform1i(gl.getUniformLocation(ourShader.program, 'texture1'), 0);
  // or set it via the texture class
  ourShader.setInt('texture2', 1);

  // render
  //-------------------------------------------------------------------------
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.2, 0.3, 0.3, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind textures on corresponding texture units
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture0);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);

  // render container
  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);

}