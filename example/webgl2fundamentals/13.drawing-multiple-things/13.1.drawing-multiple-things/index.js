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

  const sphereVAO = twgl.createVAOFromBUfferInfo(gl, programInfo, sphereBufferInfo);
  const cubeVAO = twgl.createVAOFromBUfferInfo(gl, programInfo, cubeBufferInfo);
  const coneVAO = twgl.createVAOFromBUfferInfo(gl, programInfo, coneBufferInfo);

}

main();