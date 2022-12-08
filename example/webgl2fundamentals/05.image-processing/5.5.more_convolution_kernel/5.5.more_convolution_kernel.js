function main() {
  const image = new Image();
  image.src = './container.jpg';
  image.onload = function () {
    render(image);
  }
}

function render(image) {
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);;

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');

  // uniform
  const imageLocation = gl.getUniformLocation(program, 'u_image');
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]');
  const kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");
  const flipYLocation = gl.getUniformLocation(program, "u_flipY");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  let size = 2;
  let type = gl.FLOAT;
  let normalize = false;
  let stride = 0;
  let offset = 0;
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0, 1.0,
    0, 1.0,
    1.0, 0,
    1.0, 1.0
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordAttributeLocation);
  size = 2;
  type = gl.FLOAT;
  normalize = false;
  stride = 0;
  offset = 0;
  gl.vertexAttribPointer(texCoordAttributeLocation, size, type, normalize, stride, offset);

  // 创建纹理
  function createAndSetupTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 设置材质
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  }

  // 创建一个纹理并写入图像
  const originalImageTexture = createAndSetupTexture(gl);
  // 上传图片到纹理中
  const mipLevel = 0;
  const internalFormat = gl.RGBA;;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE; // 指定纹理的类型
  gl.texImage2D(
    gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    image
  );

  // 创建两个纹理绑定到帧缓冲
  const textures = [];
  const framebuffers = [];
  for (let ii = 0; ii < 2; ii++) {
    // 创建一个纹理并写入图像
    const texture = createAndSetupTexture(gl);
    textures.push(texture);
    // 设置纹理大小和图片大小一致
    const mipLevel = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE; // 指定纹理的类型
    const data = null; // data没有值意味着创建一个空白的纹理
    gl.texImage2D(
      gl.TEXTURE_2D,
      mipLevel,
      internalFormat,
      image.width,
      image.height,
      border,
      srcFormat,
      srcType,
      data
    );

    // 创建一个帧缓冲
    const fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // 绑定纹理到帧缓冲
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, mipLevel
    );
  }

  // 画两个三角形
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, image.width, image.height);

  // 定义一些卷积核
  const kernels = {
    normal: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0,
    ],
    gaussianBlur: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045,
    ],
    gaussianBlur2: [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1,
    ],
    gaussianBlur3: [
      0, 1, 0,
      1, 1, 1,
      0, 1, 0,
    ],
    unsharpen: [
      -1, -1, -1,
      -1, 9, -1,
      -1, -1, -1,
    ],
    sharpness: [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0,
    ],
    sharpen: [
      -1, -1, -1,
      -1, 16, -1,
      -1, -1, -1,
    ],
    edgeDetect: [
      -0.125, -0.125, -0.125,
      -0.125, 1, -0.125,
      -0.125, -0.125, -0.125,
    ],
    edgeDetect2: [
      -1, -1, -1,
      -1, 8, -1,
      -1, -1, -1,
    ],
    edgeDetect3: [
      -5, 0, 0,
      0, 0, 0,
      0, 0, 5,
    ],
    edgeDetect4: [
      -1, -1, -1,
      0, 0, 0,
      1, 1, 1,
    ],
    edgeDetect5: [
      -1, -1, -1,
      2, 2, 2,
      -1, -1, -1,
    ],
    edgeDetect6: [
      -5, -5, -5,
      -5, 39, -5,
      -5, -5, -5,
    ],
    sobelHorizontal: [
      1, 2, 1,
      0, 0, 0,
      -1, -2, -1,
    ],
    sobelVertical: [
      1, 0, -1,
      2, 0, -2,
      1, 0, -1,
    ],
    previtHorizontal: [
      1, 1, 1,
      0, 0, 0,
      -1, -1, -1,
    ],
    previtVertical: [
      1, 0, -1,
      1, 0, -1,
      1, 0, -1,
    ],
    boxBlur: [
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111,
      0.111, 0.111, 0.111,
    ],
    triangleBlur: [
      0.0625, 0.125, 0.0625,
      0.125, 0.25, 0.125,
      0.0625, 0.125, 0.0625,
    ],
    emboss: [
      -2, -1, 0,
      -1, 1, 1,
      0, 1, 2,
    ],
  };
  // 将要使用的效果列表
  var effects = [
    { name: "normal", on: true },
    { name: "gaussianBlur", },
    { name: "gaussianBlur2", on: true },
    { name: "gaussianBlur3", on: true },
    { name: "unsharpen", },
    { name: "sharpness", },
    { name: "sharpen", },
    { name: "edgeDetect", },
    { name: "edgeDetect2", },
    { name: "edgeDetect3", },
    { name: "edgeDetect4", },
    { name: "edgeDetect5", },
    { name: "edgeDetect6", },
    { name: "sobelHorizontal", },
    { name: "sobelVertical", },
    { name: "previtHorizontal", },
    { name: "previtVertical", },
    { name: "boxBlur", },
    { name: "triangleBlur", },
    { name: "emboss", },
  ];

  const ui = document.querySelector('#ui');
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  for (let ii = 0; ii < effects.length; ii++) {
    const effect = effects[ii];
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    const chk = document.createElement('input');
    chk.value = effect.name;
    chk.type = 'checkbox';
    if (effect.on) {
      chk.checked = 'true';
    }
    chk.onchange = drawEffects;
    td.appendChild(chk);
    td.appendChild(document.createTextNode(effect.name));
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  ui.appendChild(table);
  $("ui table").tableDnD({ onDrop: drawEffects });

  drawEffects();

  function drawEffects() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.widht, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

    gl.uniform1i(imageLocation, 0);

    gl.uniform1f(flipYLocation, 1);

    let count = 0;
    for (let ii = 0; ii < tbody.rows.length; ii++) {
      const checkbox = tbody.rows[ii].firstChild.firstChild;
      if (checkbox.checked) {
        setFramebuffer(framebuffers[count % 2], image.width, image.height);

        drawWithKernel(checkbox.value);

        gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);

        ++count;
      }
    }
    gl.uniform1f(flipYLocation, -1);
    setFramebuffer(null, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawWithKernel('normal');
  }

  function setFramebuffer(fbo, width, height) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.uniform2f(resolutionLocation, width, height);
    gl.viewport(0, 0, width, height);
  }

  function drawWithKernel(name) {
    // set the kernel and it's weight
    gl.uniform1fv(kernelLocation, kernels[name]);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]));

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }


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

function computeKernelWeight(kernel) {
  const weight = kernel.reduce((prev, curr) => {
    return prev + curr;
  }, 0);
  return weight <= 0 ? 1 : weight;
}


main();
