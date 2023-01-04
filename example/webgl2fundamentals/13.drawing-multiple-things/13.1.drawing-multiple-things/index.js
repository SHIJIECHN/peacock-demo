/**
 * 初始化阶段：
 * 1. 创建所有着色器和程序并寻找参数位置
 * 2. 创建缓冲并上传顶点数据
 * 3. 为您要绘制的每个事物创建一个顶点数组
 *    1）为每个属性调用gl.bindBuffer, gl.vertexAttribPointer, gl.enableVertexAttribArray
 *    2）绑定索引到gl.ELEMENT_ARRAY_BUFFER
 * 4. 创建纹理并上传纹理数据
 * 
 * 渲染阶段
 * 1. 清空并设置视图和其他全局状态（开启深度检测，剔除等等）
 * 2. 对于想要绘制的每个物体
 *    1）调用gl.useProgram使用需要的程序
 *    2）为物体绑定顶点数组
 *        a. 调用gl.bindVertexArray
 *    3）设置物体的全局变量
 *        a. 为每个全局变量调用gl.uniformXXX
 *        b. 调用gl.activeTexture和gl.bindTexture设置纹理到纹理单元
 *    4）调用gl.drawArrays或gl.drawElements
 */

const vs = `#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
 `;

const fs = `#version 300 es
precision highp float;

// 从顶点着色器中传入的值
in vec4 v_color;

uniform vec4 u_colorMult;

out vec4 outColor;

void main(){
  outColor = v_color * u_colorMult;
}
`;

function main() {
  /**#type {HTMLCanvasElement} */
  const canvas = document.querySelector('#canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.error('Failed to get context.');
    return;
  }

  twgl.setAttributePrefix('a_');

  /**
   * 初始化buffer
   * cubeBufferInfo = {
      "attribs": {
          "a_position": {
              "buffer": {},
              "numComponents": 3,
              "type": 5126,
              "normalize": false,
              "stride": 0,
              "offset": 0
          },
          "a_normal": {...},
          "a_texcoord": {...},
          "a_color": {...}
      },
      "numElements": 36
    }
   */
  const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6); // 球体
  const cubeBufferInfo = flattenedPrimitives.createCubeBufferInfo(gl, 20); // 正方体
  const coneBufferInfo = flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false); // 三菱锥

  // setup GLSL program
  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
  /**
   * programInfo = 
    {
      "program": {},
      "uniformSetters": {},
      "attribSetters": {},
      "uniformBlockSpec": {
          "blockSpecs": {},
          "uniformData": [
              {
                  "name": "u_matrix",
                  "type": 35676,
                  "size": 1,
                  "blockNdx": -1,
                  "offset": -1
              },
              {
                  "name": "u_colorMult",
                  "type": 35666,
                  "size": 1,
                  "blockNdx": -1,
                  "offset": -1
              }
          ]
      },
      "transformFeedbackInfo": {}
    }
   */

  const sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);
  const cubeVAO = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo);
  const coneVAO = twgl.createVAOFromBufferInfo(gl, programInfo, coneBufferInfo);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  const fieldOfViewRadians = degToRad(60);

  // Uniform for each object
  const sphereUniforms = {
    u_colorMult: [0.5, 1, 0.5, 1],
    u_matrix: m4.identity()
  }
  const cubeUniforms = {
    u_colorMult: [1, 0.5, 0.5, 1],
    u_matrix: m4.identity()
  }
  const coneUniforms = {
    u_colorMult: [0.5, 0.5, 1, 1],
    u_matrix: m4.identity()
  };
  const sphereTranslation = [0, 0, 0];
  const cubeTranslation = [-40, 0, 0];
  const coneTranslation = [40, 0, 0];

  function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
    let matrix = m4.translate(viewProjectionMatrix,
      translation[0],
      translation[1],
      translation[2]);

    matrix = m4.xRotate(matrix, xRotation);
    return m4.yRotate(matrix, yRotation);
  }

  requestAnimationFrame(drawScene);

  function drawScene(time) {
    time = time * 0.0005;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);


    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    const cameraPosition = [0, 0, 100];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);

    const viewMatrix = m4.inverse(cameraMatrix);

    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    const sphereXRotation = time;
    const sphereYRotation = time;
    const cubeXRotation = -time;
    const cubeYRotation = time;
    const coneXRotation = time;
    const coneYRotation = -time;

    gl.useProgram(programInfo.program);

    // Draw the sphere
    //-----------------------------------------------
    gl.bindVertexArray(sphereVAO);
    sphereUniforms.u_matrix = computeMatrix(
      viewProjectionMatrix,
      sphereTranslation,
      sphereXRotation,
      sphereYRotation);

    twgl.setUniforms(programInfo, sphereUniforms);

    twgl.drawBufferInfo(gl, sphereBufferInfo);

    // Draw the cube
    //------------------------------------------------
    gl.bindVertexArray(cubeVAO);

    cubeUniforms.u_matrix = computeMatrix(
      viewProjectionMatrix,
      cubeTranslation,
      cubeXRotation,
      cubeYRotation);

    // Set the uniforms we just computed
    twgl.setUniforms(programInfo, cubeUniforms);

    twgl.drawBufferInfo(gl, cubeBufferInfo);

    // Draw the cone
    //-------------------------------------------------
    gl.bindVertexArray(coneVAO);

    coneUniforms.u_matrix = computeMatrix(
      viewProjectionMatrix,
      coneTranslation,
      coneXRotation,
      coneYRotation);

    // Set the uniforms we just computed
    twgl.setUniforms(programInfo, coneUniforms);

    twgl.drawBufferInfo(gl, coneBufferInfo);

    requestAnimationFrame(drawScene);
  }
}

main();