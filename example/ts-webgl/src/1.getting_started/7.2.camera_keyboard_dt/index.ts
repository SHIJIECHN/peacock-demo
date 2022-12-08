import { vs, fs } from './7.2.camera_keyboard_dt';
import container from '../../resource/container.jpg';
import awesomeface from '../../resource/awesomeface.png';
import Shader from 'utils/Shader';
import { glMatrix, mat4, vec3 } from 'gl-matrix'
import { vertices, cubePositions } from './vertices'

let g_image1 = false,
  g_image2 = false;

const image1 = new Image();
const image2 = new Image();

export default function main(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  image1.src = container;
  image2.src = awesomeface;

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

  // tell webgl for each sampler to which texture unit it belongs to
  //-----------------------------------------------------------------------
  ourShader.use();
  ourShader.setInt('texture1', 0);
  ourShader.setInt('texture2', 1);

  // pass projection matrix to share
  //-----------------------------------------------------------------------
  let projection = mat4.perspective(mat4.create(), glMatrix.toRadian(45), gl.canvas.width / gl.canvas.height, 0.1, 100);
  ourShader.setMat4('projection', projection);

  let cameraPos: vec3 = [0, 0, 3];
  let cameraFront: vec3 = [0, 0, -1];
  let cameraUp: vec3 = [0, 1, 0];

  let deltaTime = 0; // 当前帧与上一帧的时间差
  let lastFrame = 0; // 上一帧的时间

  function drawScense(time: number) {

    // per-frame time logic
    let currentFrame = time; // 毫秒
    deltaTime = currentFrame - lastFrame;
    lastFrame = currentFrame;

    // render
    //----------------------------------------------------------------------
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.2, 0.3, 0.3, 1);
    // 启用深度测试
    gl.enable(gl.DEPTH_TEST);
    // 清空颜色缓冲和深度缓冲
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //bind textures on corresponding texture units
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);

    ourShader.use();
    // camera/view transform
    // ------------------------------------------------------------
    let view = mat4.create();

    view = mat4.lookAt(view, cameraPos, vec3.add(vec3.create(), cameraPos, cameraFront), cameraUp);
    ourShader.setMat4('view', view);

    gl.bindVertexArray(vao);
    // 10个立方体
    for (let i = 0; i < 10; i++) {
      let model = mat4.create();
      model = mat4.translate(model, model, new Float32Array(cubePositions[i]));
      let angle = 20 * i;
      model = mat4.rotate(model, model, glMatrix.toRadian(angle), [1, 0.3, 0.5]);

      ourShader.setMat4('model', model);

      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    requestAnimationFrame(drawScense)

  }

  document.onkeydown = function (e) {
    let cameraSpeed = 2.5 * (deltaTime / 1000);

    switch (e.key) {
      case 'w':
        cameraPos = vec3.add(vec3.create(), cameraPos, vec3.scale(vec3.create(), cameraFront, cameraSpeed));
        break;
      case 's':
        cameraPos = vec3.sub(vec3.create(), cameraPos, vec3.scale(vec3.create(), cameraFront, cameraSpeed));
        break;
      case 'a':
        cameraPos = vec3.sub(vec3.create(), cameraPos, vec3.scale(vec3.create(), vec3.normalize(vec3.create(), vec3.cross(vec3.create(), cameraFront, cameraUp)), cameraSpeed));
        break;
      case 'd':
        cameraPos = vec3.add(vec3.create(), cameraPos, vec3.scale(vec3.create(), vec3.normalize(vec3.create(), vec3.cross(vec3.create(), cameraFront, cameraUp)), cameraSpeed));
        break;
    }
  }

  requestAnimationFrame(drawScense)

}

