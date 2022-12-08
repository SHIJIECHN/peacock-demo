const vertexShaderSource = `#version 300 es
in vec3 aPos;

void main(){
  // 每个向量有4个分量，每个分量值代表空间中的一个坐标vec.x, vec.y, vec.z, vec.w
  // vec.w 用在透视除法上，
  // 必须把位置数据复制给预定义的 gl_Position变量
  gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 FragColor;

void main(){
  FragColor = vec4(1.0, 0.5, 0.2, 1.0);
}
`;

function main() {

  // 着色器与程序
  //-------------------------------------------------------------

  // vertex shader 顶点着色器
  // 创建一个着色器对象，顶点着色器参数为 gl.VERTEX_SHADER
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  // 着色器源码附加到着色器对象上，然后编译
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  // 检测编译是否成功
  let success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)
  if (!success) {
    console.log('vertextShader compiled failed.')
    return;
  }

  // fragment shader 片段着色器
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!success) {
    console.log('fragmentShader compiled failed.');
    return;
  }

  // shader program 着色器程序
  // 创建一个程序对象
  const program = gl.createProgram();
  // 把着色器对象附加到程序上，然后用连接它们
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  // 检测链接着色器程序是否成功
  success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.log('link program failed.');
    return;
  }


  // 把顶点数据储存在显卡的内存中，用VBO这个顶点缓冲对象管理
  //--------------------------------------------------------------

  // 指定三角形顶点坐标
  const position = [
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    0.0, 0.5, 0
  ];
  // 顶点数据
  const positionAttributeLocation = gl.getAttribLocation(program, 'aPos');
  // 创建顶点缓冲对象（VBO），在GPU内存中储存大量顶点
  const positionBuffer = gl.createBuffer();
  // 把新创建的缓冲绑定到gl.ARRAY_BUFFER目标上。
  // 顶点缓冲对象的缓冲类型是：gl.ARRAY_BUFFER。
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  /**
   * 把顶点数据复制到缓冲的内存中。
   * 参数1：目标缓冲的类型。顶点缓冲对象当前绑定到gl.ARRAY_BUFFER目标上
   * 参数2：希望发送的实际数据
   * 参数3：希望显卡如何管理给定的数据。
   * gl.STATIC_DRAW： 数据不会或几乎不会改变
   * gl.DYNAMIC_DRAW：数据会被改变很多
   * gl.STREAM_DRAW：数据每次绘制时都会改变
   */
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

  // 顶点数据对象（VAO）存储顶点属性
  //---------------------------------------------------------------------
  // 创建VAO
  const vao = gl.createVertexArray();
  // 绑定VAO
  gl.bindVertexArray(vao);

  const size = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  let offset = 0;
  /**
   * 链接顶点属性。告诉webGL该如何解析顶点数据（应用到逐个顶点属性上）。
   * 每个顶点属性从一个VBO管理的内存中获得它的数据，而具体从哪一个VBO获取则是通过调用
   * 该函数时绑定到GL_ARRAY_BUFFER的VBO决定的。
   * 参数1：要配置的顶点属性
   * 参数2：顶点属性的大小。顶点属性是一个vec3，由3个值组成，所以大小是3
   * 参数3：指定数据的类型。
   * 参数4：数据是否被标准化。
   * 参数5：步长。连续的顶点属性之间的间隔。
   * 参数6：表示位置数据在缓冲中起始位置的偏移量。
   */
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
  // 以顶点属性位置值作为参数，启用顶点属性
  gl.enableVertexAttribArray(positionAttributeLocation);

  // 图形绘制
  //---------------------------------------------------------------------
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // 渲染一个物体时要使用着色器程序
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  const primitiveType = gl.TRIANGLES; // 画三角形
  offset = 0;
  const count = 3;
  /**
   * 绘制物体。它要使用当前激活的着色器，之前定义的顶点属性配置，
   * 和VBO的顶点数据（通过VAO间接绑定）来绘制图元。
   * 参数1：打算绘制的图元的类型
   * 参数2：指定顶点数据的起始索引
   * 参数3：打算绘制多少个顶点
   */
  gl.drawArrays(primitiveType, offset, count);

}

main();