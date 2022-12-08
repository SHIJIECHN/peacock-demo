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

  const edgeDetectKernel = [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1
  ];

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

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const mipLevel = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(
    gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    image
  );

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform1i(imageLocation, 0);
  // set the kernel and it's weight
  gl.uniform1fv(kernelLocation, edgeDetectKernel);
  gl.uniform1f(kernelWeightLocation, computeKernelWeight(edgeDetectKernel));
  // 画两个三角形
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, image.width, image.height);

  // define serveral convolution kernels
  const kernels = {
    nornal: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ],
    gaussianBlur: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.145
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
  }
  const initialSelection = 'edgeDetect2';
  // Setup UI to pick kernels.
  const ui = document.querySelector('#ui');
  let select = document.createElement('select');
  for (let name in kernels) {
    let option = document.createElement('option');
    option.value = name;
    if (name === initialSelection) {
      option.selected = true;
    }
    option.appendChild(document.createTextNode(name));
    select.appendChild(option);
  }
  select.onchange = function () {
    drawWithKernel(this.options[this.selectedIndex].value);
  };
  ui.appendChild(select);
  drawWithKernel(initialSelection);

  function drawWithKernel(name) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(imageLocation, 0);

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
