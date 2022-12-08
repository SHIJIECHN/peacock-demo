var image = new Image();
if (!image) {
  console.log('Failed to create the image object.');
}
image.onload = async function () {
  render(image);
}

image.src = '../../resource/container.jpg';

async function render(image) {
  // 从本地加载着色器文件
  const { vs, fs } = await readShaderFile('vertexShaderSource.glsl', 'fragmentShaderSource.glsl');
  // 初始化着色器
  const ourShader = new Shader(gl, vs, fs);
  if (!ourShader) {
    console.log('Failed to initialize shaders.');
    return;
  }

  // 获取属性位置
  const positionAttributeLocation = gl.getAttribLocation(ourShader.program, 'aPos');
  if (positionAttributeLocation < 0) {
    console.log('Failed to get the storage location of aPos.');
    return;
  }
  const texCoordAttributeLocation = gl.getAttribLocation(ourShader.program, 'aTexCoord');
  if (texCoordAttributeLocation < 0) {
    console.log('Failed to get the storage location of aTexCoord.');
    return;
  }
  const colorAttributeLocation = gl.getAttribLocation(ourShader.program, 'aColor');
  if (colorAttributeLocation < 0) {
    console.log('Failed to get the storage location of aColor.');
    return;
  }

  // uniforms
  const imageLocation = gl.getUniformLocation(ourShader.program, 'texturel');
  if (imageLocation < 0) {
    console.log('Failed to get the storage location of texturel');
    return;
  }
  // 顶点位置与纹理坐标
  const vertices = new Float32Array([
    // position  //texcoord // color
    0.5, 0.5, 0, 1, 1, 1, 0, 0,// 上右
    0.5, -0.5, 0, 1, 0, 0, 1, 0,// 下右
    -0.5, -0.5, 0, 0, 0, 0, 0, 1,// 下左
    -0.5, 0.5, 0, 0, 1, 1, 1, 0 // 上左
  ]);
  // 索引
  const indices = new Int32Array([
    0, 1, 3,
    1, 2, 3
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const type = gl.FLOAT;
  const normalize = false;
  const FSIZE = vertices.BYTES_PER_ELEMENT;
  // 位置
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionAttributeLocation, 3, type, normalize, 8 * FSIZE, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);
  // 纹理坐标
  gl.vertexAttribPointer(texCoordAttributeLocation, 2, type, normalize, 8 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(texCoordAttributeLocation);
  // 颜色
  gl.vertexAttribPointer(colorAttributeLocation, 3, type, normalize, 8 * FSIZE, 5 * FSIZE);
  gl.enableVertexAttribArray(colorAttributeLocation);
  // 索引
  const ebo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // 创建纹理
  const texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object.');
    return;
  }
  // 将纹理绑定到纹理单元中
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const mipLevel = 0;
  const internalFormat = gl.RGB;
  const srcFormat = gl.RGB;
  const srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    image
  );
  gl.generateMipmap(gl.TEXTURE_2D);


  gl.uniform1i(imageLocation, 0);
  gl.clearColor(0.2, .3, .3, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0)
}
