import { vs, fs } from './6.1.coordinate_systems';
import container from '../../resource/container.jpg';
import awesomeface from '../../resource/awesomeface.png';
import Shader from 'utils/Shader';
import { glMatrix, mat4 } from 'gl-matrix'

let g_image1 = false,
  g_image2 = false;

const image1 = new Image();
const image2 = new Image();



export default function main(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  image1.src = container;
  image2.src = awesomeface;
  console.log(container)

  image1.onload = function () {
    g_image1 = true;
    render(gl);
  }
  image2.onload = function () {
    g_image2 = true;
    render(gl);
  }
}

function render(gl: WebGL2RenderingContext) {
  if (!g_image1 || !g_image2) {
    return;
  }

  const ourShader = new Shader(gl, vs, fs);

  const vertices = new Float32Array([
    // positions          // texture coords
    0.5, 0.5, 0.0, 1.0, 1.0, // top right
    0.5, -0.5, 0.0, 1.0, 0.0, // bottom right
    -0.5, -0.5, 0.0, 0.0, 0.0, // bottom left
    -0.5, 0.5, 0.0, 0.0, 1.0  // top left 
  ]);

  const indices = new Int32Array([
    0, 1, 3, // first triangle
    1, 2, 3  // second triangle
  ]);

  const vbo = gl.createBuffer();
  const vao = gl.createVertexArray();
  const ebo = gl.createBuffer();

  gl.bindVertexArray(vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const FSIZE = vertices.BYTES_PER_ELEMENT;

  // position attribute
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * FSIZE, 0);
  gl.enableVertexAttribArray(0);
  // texture coord attribute
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(1);

  // load and create a texture
  const texture1 = gl.createTexture();
  const texture2 = gl.createTexture();

  // texture1
  //----------------------------------------------------------
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  // set the texture wrapping parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // set texture filtering parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // flip texture's on the y-axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
  gl.generateMipmap(gl.TEXTURE_2D);

  // texture2
  //----------------------------------------------------------
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  // set the texture wrapping parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // set texture filtering parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // load image, create  texture and generate mipmaps
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);
  gl.generateMipmap(gl.TEXTURE_2D);

  ourShader.use();
  ourShader.setInt('texture1', 0);
  ourShader.setInt('texture2', 1);

  // render
  //----------------------------------------------------------------------
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.2, 0.3, 0.3, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //bind textures on corresponding texture units
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture2);

  ourShader.use();

  let model = mat4.create();
  let view = mat4.create();
  let projection = mat4.create();

  model = mat4.rotate(model, model, glMatrix.toRadian(-55), [1, 0, 0]); // 沿着X轴 旋转55度
  view = mat4.translate(view, view, [0, 0, -3]); // 沿着-Z 平移3
  projection = mat4.perspective(projection, glMatrix.toRadian(45), gl.canvas.width / gl.canvas.height, 0.1, 100);

  // retrieve the matrix uniform location
  ourShader.setMat4('model', model);
  ourShader.setMat4('view', view);
  ourShader.setMat4('projection', projection);

  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
}

