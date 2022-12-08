const vertexShaderSource = `#version 300 es
in vec3 aPos;
void main(){
  gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1);
}
`;

const fragmentShader1Source = `#version 300 es
precision highp float;
out vec4 FragColor;
void main(){
  FragColor = vec4(1.0, 0.5, 0.2, 1.0);
}
`;

const fragmentShader2Source = `#version 300 es
precision highp float;
out vec4 FragColor;
void main(){
  FragColor = vec4(1.0, 1, 0, 1.0);
}
`;

// 顶点着色器
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShaderOrange = gl.createShader(gl.FRAGMENT_SHADER);
const fragmentShaderYellow = gl.createShader(gl.FRAGMENT_SHADER);

const programOrange = gl.createProgram();
const programYellow = gl.createProgram();

gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
gl.shaderSource(fragmentShaderOrange, fragmentShader1Source);
gl.compileShader(fragmentShaderOrange);
gl.shaderSource(fragmentShaderYellow, fragmentShader2Source);
gl.compileShader(fragmentShaderYellow);

gl.attachShader(programOrange, vertexShader);
gl.attachShader(programOrange, fragmentShaderOrange);
gl.linkProgram(programOrange);

gl.attachShader(programYellow, vertexShader);
gl.attachShader(programYellow, fragmentShaderYellow);
gl.linkProgram(programYellow);


const firstTriangle = [
  -0.9, -0.5, 0,
  0, -0.5, 0,
  -0.45, 0.5, 0
]

const secondTriangle = [
  0, -0.5, 0,
  0.9, -0.5, 0,
  0.45, 0.5, 0
];

const vao1 = gl.createVertexArray();
const vao2 = gl.createVertexArray();
const buffer1 = gl.createBuffer();
const buffer2 = gl.createBuffer();

gl.bindVertexArray(vao1);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(firstTriangle), gl.STATIC_DRAW);

const size = 3;
const type = gl.FLOAT;
const normalize = false;
const stride = 0;
const offset = 0;
gl.vertexAttribPointer(0, size, type, normalize, stride, offset);
gl.enableVertexAttribArray(0);


gl.bindVertexArray(vao2);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(secondTriangle), gl.STATIC_DRAW);
gl.vertexAttribPointer(0, size, type, normalize, stride, offset);
gl.enableVertexAttribArray(0);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
const primitiveType = gl.TRIANGLES;
const count = 3;

gl.useProgram(programOrange);
gl.bindVertexArray(vao1);
gl.drawArrays(primitiveType, offset, count);

gl.useProgram(programYellow);
gl.bindVertexArray(vao2);
gl.drawArrays(primitiveType, offset, count);