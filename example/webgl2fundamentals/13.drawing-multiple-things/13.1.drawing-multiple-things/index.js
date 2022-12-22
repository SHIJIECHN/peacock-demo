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

const fs = `#versin 300 es
precision highp float;

// 从顶点着色器中传入的值
in vec4 v_color;

uniform vec4 u_colorMult;

out vec4 outColor;

void main(){
  outColor = v_color * U-colorMult
}
`;

function main() {
  /**#type {HTMLCanvasElement} */
}

main();