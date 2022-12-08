const vertexShaderSource = `#version 300 es
in vec3 aPos;
void main(){
  gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 FragColor;
void main(){
  FragColor = vec4(1.0, 0.5, 0.2, 1.0);
}
`;

// 顶点着色器
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const vertexShaderSuccess = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
if (!vertexShaderSuccess) {
  console.log('vertex shader compile failed.');
}

// 片段着色器
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
const fragmentSuccess = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
if (!fragmentSuccess) {
  console.log('fragment shader compile failed.')
}

// 程序
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
const programSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
if (!programSuccess) {
  console.log('program link failed');
}
// 顶点数据
const positionAttributeLocation = gl.getAttribLocation(program, 'aPos');

const firstTriangle = [
  -0.9, -0.5, 0,
  0, -0.5, 0,
  -0.45, 0.5, 0
];

const secondTriangle = [
  0, -0.5, 0,
  0.9, -0.5, 0,
  0.45, 0.5, 0
];

// 分别创建两个VAO和VBO
const vao1 = gl.createVertexArray();
const vao2 = gl.createVertexArray();
const buffer1 = gl.createBuffer();
const buffer2 = gl.createBuffer();

// 第一个三角形
//---------------------------------------------------------------------

// 绑定顶点数据对象
gl.bindVertexArray(vao1);
// 将创建的缓冲绑定到gl.ARRAY_BUFFER中
gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
// 把顶点数据复制到缓冲对象中
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(firstTriangle), gl.STATIC_DRAW);
// 链接顶点属性
const size = 3;
const type = gl.FLOAT;
const normalize = false;
const stride = 0;
const offset = 0;
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
// 启用顶点属性
gl.enableVertexAttribArray(positionAttributeLocation);


// 第二个三角形
//---------------------------------------------------------------------
gl.bindVertexArray(vao2);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(secondTriangle), gl.STATIC_DRAW);
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
gl.enableVertexAttribArray(positionAttributeLocation);

// 绘制
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
const primitiveType = gl.TRIANGLES;
const count = 3;

// 绘制第一个三角形
gl.useProgram(program);
gl.bindVertexArray(vao1);
gl.drawArrays(primitiveType, offset, count);

// 绘制第二个三角形
gl.useProgram(program);
gl.bindVertexArray(vao2);
gl.drawArrays(primitiveType, offset, count);

