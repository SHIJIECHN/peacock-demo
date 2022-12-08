function main() {
  const image = new Image();
  image.src = './container.jpg';
  image.onload = function () {
    render(image);
  }
}

function render(image) {
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

  // 找到顶点坐标中的属性
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordAttributeLocation = gl.getAttribLocation(program, 'a_texcoord');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // 位置
  //-------------------------------------------------------------------
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);


  // 纹理
  //-------------------------------------------------------------------
  // 创建一个纹理坐标缓冲，使其成为当前的ARRAY_BUFFER并复制纹理坐标值
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);

  // 启用属性
  gl.enableVertexAttribArray(texcoordAttributeLocation);

  // 告诉属性如何从 纹理坐标缓冲（ARRAY_BUFFER）中获取数据
  const size = 2; // 每次迭代运行提取两个单位数据
  const type = gl.FLOAT;  //每个单位的数据类型是32位浮点型
  const normalize = true; // 装维0-255 为 0.0-1.0
  const stride = 0; // 0 = 移动单位量 * 每个单位占用内存（sizeof(type)）每次迭代获取下一个纹理
  const offset = 0;  // 从缓冲起始位置开始读取
  gl.vertextAttrbPointer(
    texcoordAttributeLocation, size, type, normalize, stride, offset);

  // 为 F 设置纹理坐标缓冲
  function setTexcoords(gl) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // 正面
      ]),
      gl.STATIC_DRAW
    )
  }
}