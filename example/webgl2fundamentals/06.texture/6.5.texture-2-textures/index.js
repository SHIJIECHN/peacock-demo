/**加载单个图像。先创建一个新的Image对象，设置加载的url，然后设置回调函数载图像加载完成后调用 */
// function loadImage(url, callback) {
//   let image = new Image();
//   image.src = url;
//   image.onload = callback;
//   return image;
// }

// /** 创建一个方法加载URL序列，并创建一个图像序列 */
// function loadImages(urls, callback) {
//   let images = [];
//   let iamgesToLoad = urls.legth;

//   // 每个图像加载完成后调用一次
//   const onImageLoad = function () {
//     --iamgesToLoad;
//     // 如果所有图像都加载完成就调用回调函数
//     if (iamgesToLoad === 0) {
//       callback(images);
//     }
//   }

//   for (let i = 0; i < iamgesToLoad; i++) {
//     let image = loadImage(urls[i], onImageLoad);
//     images.push(image);
//   }
// }

function loadImage(url, callback) {
  var image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(urls, callback) {
  var images = [];
  var imagesToLoad = urls.length;

  // Called each time an image finished
  // loading.
  var onImageLoad = function () {
    --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad === 0) {
      callback(images);
    }
  };

  for (var ii = 0; ii < imagesToLoad; ++ii) {
    var image = loadImage(urls[ii], onImageLoad);
    images.push(image);
  }
}

function main() {
  loadImages([
    "../../resource/leaves.jpg",
    "../../resource/star.jpg"
  ], render)
}

function render(images) {
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

  // 找到顶点坐标中的属性
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');

  // look up uniform 
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const u_image0Location = gl.getUniformLocation(program, 'u_image0');
  const u_image1Location = gl.getUniformLocation(program, 'u_image1');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // 位置
  //-------------------------------------------------------------------
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  let offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  // 纹理坐标
  //-------------------------------------------------------------------
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
  ]), gl.STATIC_DRAW);

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

  // 纹理
  // ---------------------------------------------------------------------
  const targetTexture = gl.createTexture();
  // 创建两个纹理
  const textures = [];
  for (let i = 0; i < 2; i++) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 设置筛选器，不需要使用贴图

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const mipLevel = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, images[i]);
    textures.push(texture);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  setRectangle(gl, 0, 0, images[0].width, images[0].height);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  gl.bindVertexArray(vao);

  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  gl.uniform1i(u_image0Location, 0);
  gl.uniform1i(u_image1Location, 1);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);

  const primitiveType = gl.TRIANGLES;
  offset = 0;
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