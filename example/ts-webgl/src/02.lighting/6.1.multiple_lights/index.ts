import lightCubeFs from './6.1.light_cube.fs'
import lightCubeVs from './6.1.light_cube.vs'
import lightFs from './6.1.multiple_lights.fs'
import lightVs from './6.1.multiple_lights.vs'
import container from '../../resource/container.jpg';
import { vertices, cubePositions, pointLightPositions } from './vertices'
import container2 from '../../resource/container2.png'
import container2_specular from '../../resource/container2_specular.png'
import { loadTexture } from '../../utils/index'
import Shader from 'utils/Shader';
import { Camera, CameraMovement } from 'utils/Camera';
import { glMatrix, mat4, vec3 } from 'gl-matrix';

let g_image1 = false,
  g_image2 = false;
const image1 = new Image();
const image2 = new Image();
image1.src = container2;
image2.src = container2_specular;
export default function main(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  image1.onload = function () {
    g_image1 = true;
    render(gl, canvas)
  }

  image2.onload = function () {
    g_image2 = true;
    render(gl, canvas);
  }
}


function render(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  if (!g_image1 || !g_image2) {
    return;
  }
  const camera = new Camera({
    position: vec3.fromValues(0.0, 0.0, 3.0)
  })
  let lastX = gl.canvas.width / 2.0;
  let lastY = gl.canvas.height / 2.0;
  let firstMouse = true;

  // timing
  let deltaTime = 0.0;
  let lastFrame = 0.0;

  // lighting
  const lightPos: vec3 = [1.2, 1.0, 2.0];

  const lightingShader = new Shader(gl, lightVs, lightFs);
  const lampShader = new Shader(gl, lightCubeVs, lightCubeFs);

  const vbo = gl.createBuffer();
  const cubeVao = gl.createVertexArray();

  const FSIZE = Float32Array.BYTES_PER_ELEMENT;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindVertexArray(cubeVao);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * FSIZE, 0);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * FSIZE, 6 * FSIZE);
  gl.enableVertexAttribArray(2);

  // light
  //-------------------------------------------------------------------
  const lightVao = gl.createVertexArray();
  gl.bindVertexArray(lightVao);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * FSIZE, 0);
  gl.enableVertexAttribArray(0);

  // load Texture
  //------------------------------------------------------------------
  const diffuseMap = loadTexture(gl, image1, gl.RGB);
  const specularMap = loadTexture(gl, image2, gl.RGB);

  // shader configuration
  // ------------------------------------------------
  lightingShader.use();
  lightingShader.setInt('material.diffuse', 0);
  lightingShader.setInt('material.specular', 1);

  gl.enable(gl.DEPTH_TEST);

  requestAnimationFrame(drawScence);


  function drawScence(time: number) {
    time = time / 1000;
    const currentFrame = time;
    deltaTime = currentFrame - lastFrame;
    lastFrame = currentFrame;

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    lightingShader.use();
    lightingShader.setVec3("viewPos", camera.position);
    lightingShader.setFloat("material.shininess", 32.0);


    // directional light
    lightingShader.setVec3("dirLight.direction", [-0.2, -1.0, -0.3]);
    lightingShader.setVec3("dirLight.ambient", [0.05, 0.05, 0.05]);
    lightingShader.setVec3("dirLight.diffuse", [0.4, 0.4, 0.4]);
    lightingShader.setVec3("dirLight.specular", [0.5, 0.5, 0.5]);
    // point light 1
    lightingShader.setVec3("pointLights[0].position", pointLightPositions[0] as vec3);
    lightingShader.setVec3("pointLights[0].ambient", [0.05, 0.05, 0.05]);
    lightingShader.setVec3("pointLights[0].diffuse", [0.8, 0.8, 0.8]);
    lightingShader.setVec3("pointLights[0].specular", [1.0, 1.0, 1.0]);
    lightingShader.setFloat("pointLights[0].constant", 1.0);
    lightingShader.setFloat("pointLights[0].linear", 0.09);
    lightingShader.setFloat("pointLights[0].quadratic", 0.032);
    // point light 2
    lightingShader.setVec3("pointLights[1].position", pointLightPositions[1] as vec3);
    lightingShader.setVec3("pointLights[1].ambient", [0.05, 0.05, 0.05]);
    lightingShader.setVec3("pointLights[1].diffuse", [0.8, 0.8, 0.8]);
    lightingShader.setVec3("pointLights[1].specular", [1.0, 1.0, 1.0]);
    lightingShader.setFloat("pointLights[1].constant", 1.0);
    lightingShader.setFloat("pointLights[1].linear", 0.09);
    lightingShader.setFloat("pointLights[1].quadratic", 0.032);
    // point light 3
    lightingShader.setVec3("pointLights[2].position", pointLightPositions[2] as vec3);
    lightingShader.setVec3("pointLights[2].ambient", [0.05, 0.05, 0.05]);
    lightingShader.setVec3("pointLights[2].diffuse", [0.8, 0.8, 0.8]);
    lightingShader.setVec3("pointLights[2].specular", [1.0, 1.0, 1.0]);
    lightingShader.setFloat("pointLights[2].constant", 1.0);
    lightingShader.setFloat("pointLights[2].linear", 0.09);
    lightingShader.setFloat("pointLights[2].quadratic", 0.032);
    // point light 4
    lightingShader.setVec3("pointLights[3].position", pointLightPositions[3] as vec3);
    lightingShader.setVec3("pointLights[3].ambient", [0.05, 0.05, 0.05]);
    lightingShader.setVec3("pointLights[3].diffuse", [0.8, 0.8, 0.8]);
    lightingShader.setVec3("pointLights[3].specular", [1.0, 1.0, 1.0]);
    lightingShader.setFloat("pointLights[3].constant", 1.0);
    lightingShader.setFloat("pointLights[3].linear", 0.09);
    lightingShader.setFloat("pointLights[3].quadratic", 0.032);
    // spotLight
    lightingShader.setVec3("spotLight.position", camera.position);
    lightingShader.setVec3("spotLight.direction", camera.front);
    lightingShader.setVec3("spotLight.ambient", [0.0, 0.0, 0.0]);
    lightingShader.setVec3("spotLight.diffuse", [1.0, 1.0, 1.0]);
    lightingShader.setVec3("spotLight.specular", [1.0, 1.0, 1.0]);
    lightingShader.setFloat("spotLight.constant", 1.0);
    lightingShader.setFloat("spotLight.linear", 0.09);
    lightingShader.setFloat("spotLight.quadratic", 0.032);
    lightingShader.setFloat("spotLight.cutOff", Math.cos(glMatrix.toRadian(12.5)));
    lightingShader.setFloat("spotLight.outerCutOff", Math.cos(glMatrix.toRadian(15.0)));

    const projection = mat4.perspective(mat4.create(), glMatrix.toRadian(camera.zoom), gl.canvas.width / gl.canvas.height, 0.1, 100);
    let view = camera.getViewMatrix();
    lightingShader.setMat4('projection', projection);
    lightingShader.setMat4('view', view);

    //world trandformation
    let model = mat4.create();
    lightingShader.setMat4('model', model);

    // bind diffuse map
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, diffuseMap);
    // bind specular map
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, specularMap);

    // render containers
    gl.bindVertexArray(cubeVao);
    for (let i = 0; i < 10; i++) {
      // calculate the model matrix for each object and pass it to shader before drawing
      let model = mat4.create();
      model = mat4.translate(model, model, cubePositions[i] as vec3);
      let angle = 20.0 * i;
      model = mat4.rotate(model, model, glMatrix.toRadian(angle), [1.0, 0.3, 0.5]);
      lightingShader.setMat4("model", model);

      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    // also draw the lamp object(s)
    lampShader.use();
    lampShader.setMat4("projection", projection);
    lampShader.setMat4("view", view);

    // we now draw as many light bulbs as we have point lights.
    gl.bindVertexArray(lightVao);
    for (let i = 0; i < 4; i++) {
      model = mat4.create();
      model = mat4.translate(model, model, pointLightPositions[i] as vec3);
      model = mat4.scale(model, model, [0.2, 0.2, 0.2]); // Make it a smaller cube
      lampShader.setMat4("model", model);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
    requestAnimationFrame(drawScence);
  }

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