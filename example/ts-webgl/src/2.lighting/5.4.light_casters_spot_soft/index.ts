import Shader from '../../utils/Shader'
import { Camera, CameraMovement } from '../../utils/Camera'
import { vec3, mat4, glMatrix } from 'gl-matrix'
import lightCubeVs from './5.4.light_cube.vs'
import lightCubeFs from './5.4.light_cube.fs'
import materialsVs from './5.4.light_casters.vs'
import materialsFs from './5.4.light_casters.fs'
import { vertices, cubePositions } from './vertices'
import container2 from '../../resource/container2.png'
import container2_specular from '../../resource/container2_specular.png'
import { loadTexture } from '../../utils/index'


let g_image = false, g_image1 = false;
const image = new Image();
const image1 = new Image();

export default function main(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  image.src = container2;
  image1.src = container2_specular;
  image.onload = function () {
    g_image = true;
    render(gl, canvas);
  }
  image1.onload = function () {
    g_image1 = true;
    render(gl, canvas);
  }
}

function render(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  if (!g_image || !g_image1) {
    return;
  }

  const camera = new Camera({
    position: vec3.fromValues(0, 0, 3.0)
  });
  // const camera = new Camera(vec3.fromValues(0, 0, 3.0));

  let lastX = gl.canvas.width / 2.0;
  let lastY = gl.canvas.height / 2.0;
  let firstMouse = true;

  //timing
  let deltaTime = 0;
  let lastFrame = 0;

  // lighting
  const lightPos: vec3 = [1.2, 1.0, 2.0];

  const lightingShader = new Shader(gl, materialsVs, materialsFs);
  const lampShader = new Shader(gl, lightCubeVs, lightCubeFs);

  const vbo = gl.createBuffer();
  if (!vbo) {
    console.error('Frailed to create the buffer object');
    return;
  }

  const cubeVao = gl.createVertexArray();
  if (!cubeVao) {
    console.error('Failed tor create the VAO');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindVertexArray(cubeVao);

  lightingShader.use();
  const FSIZE = Float32Array.BYTES_PER_ELEMENT;
  // position attribute
  let aPos = gl.getAttribLocation(lightingShader.program, 'aPos');
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 8 * FSIZE, 0);
  gl.enableVertexAttribArray(aPos);
  // normal attribute
  let aNormal = gl.getAttribLocation(lightingShader.program, 'aNormal');
  gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 8 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(aNormal);
  //texture
  let aTexCoords = gl.getAttribLocation(lightingShader.program, 'aTexCoords');
  gl.vertexAttribPointer(aTexCoords, 2, gl.FLOAT, false, 8 * FSIZE, 6 * FSIZE);
  gl.enableVertexAttribArray(aTexCoords);

  // second configure the light's VAO.(VBO stays the same; the vertices are same for the light object which is also a 3D cube)
  const lightVao = gl.createVertexArray();
  if (!lightVao) {
    console.error('Failed to create the VAO');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bindVertexArray(lightVao);

  lampShader.use();
  aPos = gl.getAttribLocation(lampShader.program, 'aPos');
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 8 * FSIZE, 0);
  gl.enableVertexAttribArray(aPos);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindVertexArray(null);

  // texture
  //------------------------------------------------------
  const diffuseMap = loadTexture(gl, image, gl.RGBA);
  const specularMap = loadTexture(gl, image1, gl.RGBA);

  // shader configuration
  lightingShader.use();
  lightingShader.setInt('material.diffuse', 0);
  lightingShader.setInt('material.specular', 1);

  // 激活深度比较，并且更新深度缓冲区
  gl.enable(gl.DEPTH_TEST);

  function drawScene() {
    let currentFrame = (new Date).getTime() / 1000;
    deltaTime = currentFrame - lastFrame;
    lastFrame = currentFrame;

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // be sure to active shader when setting uniform/ drawing objects
    lightingShader.use();
    lightingShader.setVec3('light.position', camera.position);
    lightingShader.setVec3('light.direction', camera.front);
    lightingShader.setFloat('light.cutOff', Math.cos(glMatrix.toRadian(12.5))); // 为什么传入cos值？为什么是12.5？
    lightingShader.setFloat('light.outerCutOff', Math.cos(glMatrix.toRadian(17.5))); // 为什么传入cos值？为什么是12.5？
    lightingShader.setVec3('viewPos', camera.position);

    // light properties 将所有光照强度都设置为1
    lightingShader.setVec3('light.ambient', [0.1, 0.1, 0.1]); // 环境光照通常设置为一个比较低的强度
    lightingShader.setVec3('light.diffuse', [0.8, 0.8, 0.8]); // 光源的漫反射分量通常设置为希望光所具有的那个颜色。通常是比较亮的白色
    lightingShader.setVec3('light.specular', [1, 1, 1]); // 镜面反射通常保持为1，以最大强度反光
    lightingShader.setFloat('light.constant', 1);
    lightingShader.setFloat('light.linear', 0.09);
    lightingShader.setFloat('light.quadratic', 0.032);

    // material properties 将环境光和漫反射分量设置为我们想要让物体所拥有的颜色，将镜面分量设置为一个一个中等亮度的颜色
    lightingShader.setFloat("material.shininess", 32);

    // view/project transform
    const projection = mat4.perspective(mat4.create(), glMatrix.toRadian(camera.zoom), gl.canvas.width / gl.canvas.height, 0.1, 100);
    const view = camera.getViewMatrix();

    lightingShader.setMat4('projection', projection);
    lightingShader.setMat4('view', view);

    let model = mat4.create();
    lightingShader.setMat4('model', model);

    // bind diffuse map
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, diffuseMap);
    // bind specular map
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, specularMap);

    let changeMat4 = mat4.create();
    mat4.multiply(changeMat4, view, model);
    mat4.invert(changeMat4, changeMat4);
    mat4.transpose(changeMat4, changeMat4);
    lightingShader.setMat4("changeMat", changeMat4);

    // world transformation
    gl.bindVertexArray(cubeVao);
    for (let i = 0; i < 10; i++) {
      let model = mat4.create();
      mat4.translate(model, model, cubePositions[i] as vec3);
      let angle = 20 * i;
      mat4.rotate(model, model, glMatrix.toRadian(angle), vec3.fromValues(1.0, 0.3, 0.5));
      lightingShader.setMat4('model', model);

      // render cube 绘制立方体
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }


    // also draw the lamp object
    // lampShader.use();
    // lampShader.setMat4('projection', projection);
    // lampShader.setMat4('view', view);
    // let model = mat4.create();
    // model = mat4.translate(model, model, lightPos);
    // model = mat4.scale(model, model, [0.2, 0.2, 0.2]);
    // lampShader.setMat4('model', model);

    // gl.bindVertexArray(lightVao);
    // gl.drawArrays(gl.TRIANGLES, 0, 36);

    requestAnimationFrame(drawScene);
  }

  drawScene();

  // 鼠标键盘事件
  //----------------------------------------------------------------------------------------
  function keyDown(ev: KeyboardEvent) {
    switch (ev.key) {
      case 'w':
        camera.processKeyboard(CameraMovement.FORWARD, deltaTime);
        break;
      case "s":
        camera.processKeyboard(CameraMovement.BACKWARD, deltaTime);
        break;
      case "a":
        camera.processKeyboard(CameraMovement.LEFT, deltaTime);
        break;
      case "d":
        camera.processKeyboard(CameraMovement.RIGHT, deltaTime);
        break;
      default:
        break;
    }
    // switch (ev.key) {
    //   case 'w':
    //     camera.ProcessKeyboard(CameraMovement.FORWARD, deltaTime);
    //     break;
    //   case "s":
    //     camera.ProcessKeyboard(CameraMovement.BACKWARD, deltaTime);
    //     break;
    //   case "a":
    //     camera.ProcessKeyboard(CameraMovement.LEFT, deltaTime);
    //     break;
    //   case "d":
    //     camera.ProcessKeyboard(CameraMovement.RIGHT, deltaTime);
    //     break;
    //   default:
    //     break;
    // }
  }

  function scroll(ev: WheelEvent) {
    camera.processMouseScroll(ev.deltaY / 100);  //网页滚轮变化幅度很大，所以除以一个系数100
  }

  function mouseMove(ev: MouseEvent) {
    if (firstMouse) {
      lastX = ev.clientX;
      lastY = ev.clientY;
      firstMouse = false;
    }

    let xoffset = ev.clientX - lastX;
    let yoffset = lastY - ev.clientY;

    lastX = ev.clientX;
    lastY = ev.clientY;

    camera.processMouseMovement(xoffset, yoffset);
  }

  canvas.addEventListener('keydown', keyDown);
  canvas.addEventListener('wheel', scroll);
  canvas.addEventListener('mousemove', mouseMove);

  canvas.setAttribute('tabindex', '0'); // 让canvas获取焦点从而响应事件
  canvas.addEventListener('click', function () {
    canvas.focus();
  });
}



