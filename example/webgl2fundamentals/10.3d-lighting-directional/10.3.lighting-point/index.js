const vertexShaderSource = `#version 300 es
// 属性是顶点着色器的输入（in），它将从缓冲区接收数据
in vec4 a_position;
in vec3 a_normal;

// 用于转换位置的矩阵
uniform mat4 u_worldViewProjection;
uniform mat4 u_world; // 世界矩阵
uniform mat4 u_worldInverseTranspose; // 世界矩阵求逆再转置后的矩阵。用于重定向法向量
uniform vec3 u_lightWorldPosition; // 一个光源的位置

// 定义法向量变量传递给片段着色器
out vec3 v_normal;
out vec3 v_surfaceToLight;

void main(){
  // 将位置乘以矩阵
  gl_Position = u_worldViewProjection * a_position;

  // 重定向法向量并传递给片段着色器
  v_normal = mat3(u_worldInverseTranspose)*a_normal;

  // 计算表面的世界坐标
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;

  // 计算表面到光源的方向。为表面上的每个点都计算了一个方向
  // 传递给片段着色器
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

// 从顶点着色器中传入法向量的值
in vec3 v_normal;
in vec3 v_surfaceToLight;

uniform vec4 u_color;

// 需要为片段着色器声明一个输出
out vec4 outColor;

void main(){
  // 因为v_normal是一个变化的插值所以它不会是一个单位向量。归一化使它称为单位向量
  vec3 normal = normalize(v_normal);

  // 表面到光源的方向进行单位话，虽然我们可以再顶点着色器中传递单位向量，但varying会进行插值再传给片段着色器，所以片段着色器中的向量基本上不是单位向量了
  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);

  // 通过取法线与光线反向的点积计算光
  float light = dot(normal, surfaceToLightDirection);

  outColor = u_color;

  // 让我们只将颜色部分（不是alpha）乘以光
  outColor.rgb *= light;
}
`;

/**
 * 点光源：从三维空间中选一个点当作光源，然后追瑟琪中根据光源和表面位置计算光照方向
 * @returns 
 */

function main() {
  const canvas = document.querySelector('#canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    return;
  }

  // 生成着色器程序
  const program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

  // 查找全局属性和变量
  //----------------------------------------------------------------------------
  // look up where the vertex data needs to go
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position'); // 顶点位置
  const normalAttribLocation = gl.getAttribLocation(program, 'a_normal'); // 法向量

  // lok up uniform locations
  const worldViewProjectionLocation = gl.getUniformLocation(program, 'u_worldViewProjection'); // 变换矩阵
  const worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose"); // 世界矩阵的逆矩阵的转置
  const worldLocation = gl.getUniformLocation(program, 'u_world'); // 世界矩阵
  const colorLocation = gl.getUniformLocation(program, 'u_color'); // 颜色
  const lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition"); // 光照位置

  // create a position buffer
  //------------------------------------------------------------------------------
  const positionBuffer = gl.createBuffer();

  // create a vertex array object
  const vao = gl.createVertexArray();

  gl.bindVertexArray(vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  setGeometry(gl);

  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);

  // create normal buffer
  //-------------------------------------------------------------------------------
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  setNormals(gl);

  gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
  // Turn on the attribute
  gl.enableVertexAttribArray(normalAttribLocation);

  // UI 
  //--------------------------------------------------------------------------------
  function radToDeg(r) {
    return r * 180 / Math.PI;
  }
  function degToRad(d) {
    return d * Math.PI / 180;
  }

  // First let's make some variables
  var fieldOfViewRadians = degToRad(60);
  var fRotationRadians = 0;

  drawScene();

  // Setup a ui.
  webglLessonsUI.setupSlider("#fRotation", { value: radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });

  function updateRotation(event, ui) {
    fRotationRadians = degToRad(ui.value);
    drawScene();
  }

  // Draw the scene
  // ----------------------------------------------------------------------------------
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // trun on depth testing
    gl.enable(gl.DEPTH_TEST);

    // tell webgl to cull faces
    gl.enable(gl.CULL_FACE);

    // Tell it to use our program
    gl.useProgram(program);

    // bind the attribute/buffer set we want
    gl.bindVertexArray(vao);

    // Compute the matrix
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;
    const m4 = new Matrix4();
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Computebd the camera's matrix 计算相机矩阵：代表相机在世界空间中位置的矩阵
    const camera = [100, 150, 200];
    const target = [0, 35, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(camera, target, up);

    // Make a view matrix from the camera matrix 计算视图矩阵
    const viewMatrix = m4.inverse(cameraMatrix);

    // matrix = projection * view * model（world）
    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // Draw a F at the origin with rotation
    const worldMatrix = m4.yRotation(fRotationRadians);
    const worldInverseMatrix = m4.inverse(worldMatrix);
    const worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    const worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);

    // Set the matrices
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix); // 变换矩阵：主要用于顶点位置的变换到裁剪空间中 -> gl_Position
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix); // 世界矩阵：顶点位置表换到世界空间中，便于计算光线的方向
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix); // 主要用于法向量的重定向

    // Set the color to use
    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]);// green

    // set the light direction 灯光的位置
    gl.uniform3fv(lightWorldPositionLocation, [20, 30, 60]);

    // Draw the geometry
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 16 * 6;
    gl.drawArrays(primitiveType, offset, count);
  }

}

// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.
function setGeometry(gl) {
  var positions = new Float32Array([
    // left column front
    0, 0, 0,
    0, 150, 0,
    30, 0, 0,
    0, 150, 0,
    30, 150, 0,
    30, 0, 0,

    // top rung front
    30, 0, 0,
    30, 30, 0,
    100, 0, 0,
    30, 30, 0,
    100, 30, 0,
    100, 0, 0,

    // middle rung front
    30, 60, 0,
    30, 90, 0,
    67, 60, 0,
    30, 90, 0,
    67, 90, 0,
    67, 60, 0,

    // left column back
    0, 0, 30,
    30, 0, 30,
    0, 150, 30,
    0, 150, 30,
    30, 0, 30,
    30, 150, 30,

    // top rung back
    30, 0, 30,
    100, 0, 30,
    30, 30, 30,
    30, 30, 30,
    100, 0, 30,
    100, 30, 30,

    // middle rung back
    30, 60, 30,
    67, 60, 30,
    30, 90, 30,
    30, 90, 30,
    67, 60, 30,
    67, 90, 30,

    // top
    0, 0, 0,
    100, 0, 0,
    100, 0, 30,
    0, 0, 0,
    100, 0, 30,
    0, 0, 30,

    // top rung right
    100, 0, 0,
    100, 30, 0,
    100, 30, 30,
    100, 0, 0,
    100, 30, 30,
    100, 0, 30,

    // under top rung
    30, 30, 0,
    30, 30, 30,
    100, 30, 30,
    30, 30, 0,
    100, 30, 30,
    100, 30, 0,

    // between top rung and middle
    30, 30, 0,
    30, 60, 30,
    30, 30, 30,
    30, 30, 0,
    30, 60, 0,
    30, 60, 30,

    // top of middle rung
    30, 60, 0,
    67, 60, 30,
    30, 60, 30,
    30, 60, 0,
    67, 60, 0,
    67, 60, 30,

    // right of middle rung
    67, 60, 0,
    67, 90, 30,
    67, 60, 30,
    67, 60, 0,
    67, 90, 0,
    67, 90, 30,

    // bottom of middle rung.
    30, 90, 0,
    30, 90, 30,
    67, 90, 30,
    30, 90, 0,
    67, 90, 30,
    67, 90, 0,

    // right of bottom
    30, 90, 0,
    30, 150, 30,
    30, 90, 30,
    30, 90, 0,
    30, 150, 0,
    30, 150, 30,

    // bottom
    0, 150, 0,
    0, 150, 30,
    30, 150, 30,
    0, 150, 0,
    30, 150, 30,
    30, 150, 0,

    // left side
    0, 0, 0,
    0, 0, 30,
    0, 150, 30,
    0, 0, 0,
    0, 150, 30,
    0, 150, 0,
  ]);

  // Center the F around the origin and Flip it around. We do this because
  // we're in 3D now with and +Y is up where as before when we started with 2D
  // we had +Y as down.

  // We could do by changing all the values above but I'm lazy.
  // We could also do it with a matrix at draw time but you should
  // never do stuff at draw time if you can do it at init time.
  const m4 = new Matrix4();
  var matrix = m4.xRotation(Math.PI);
  matrix = m4.translate(matrix, -50, -75, -15);

  for (var ii = 0; ii < positions.length; ii += 3) {
    var vector = m4.transformVector(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
    positions[ii + 0] = vector[0];
    positions[ii + 1] = vector[1];
    positions[ii + 2] = vector[2];
  }

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function setNormals(gl) {
  var normals = new Float32Array([
    // left column front
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // top rung front
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // middle rung front
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // left column back
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    // top rung back
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    // middle rung back
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    // top
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    // top rung right
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // under top rung
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,

    // between top rung and middle
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // top of middle rung
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    // right of middle rung
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // bottom of middle rung.
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,

    // right of bottom
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // bottom
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,

    // left side
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}

main();