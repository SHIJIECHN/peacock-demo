import Shader from '../../utils/Shader'
import { Camera, CameraMovement } from '../../utils/Camera'
import { vec3, mat4, glMatrix } from 'gl-matrix'
import lightCubeVs from './4.4.light_cube.vs'
import lightCubeFs from './4.4.light_cube.fs'
import materialsVs from './4.4.light_maps.vs'
import materialsFs from './4.4.light_maps.fs'
import { vertices } from './vertices'
import container2 from '../../resource/container2.png'
import container2_specular from '../../resource/container2_specular.png'
import emissive from '../../resource/matrix.jpg'

let g_image = false, g_image1 = false, g_imag2 = false;
const image = new Image();
const image1 = new Image();
const image2 = new Image();

export default function main(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  image.src = container2;
  image1.src = container2_specular;
  image2.src = emissive;
  image.onload = function () {
    g_image = true;
    render(gl, canvas);
  }
  image1.onload = function () {
    g_image1 = true;
    render(gl, canvas);
  }
  image2.onload = function () {
    g_imag2 = true;
    render(gl, canvas);
  }

}

function render(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  if (!g_image || !g_image1) {
    return;
  }

  const camera = new Camera({
    position: [0, 0, 6]
  });

  let lastX = gl.canvas.width / 2.0;
  let lastY = gl.canvas.height / 2.0;
  let firstMouse = true;

  //timing
  let deltaTime = 0;
  let lastFrame = 0;

  // lighting
  let lightPos: vec3 = [1.2, 1, 2];

  const lightingShader = new Shader(gl, materialsVs, materialsFs);
  const lightCubeShader = new Shader(gl, lightCubeVs, lightCubeFs);

  const cubeVao = gl.createVertexArray();
  const vbo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindVertexArray(cubeVao);
  const FSIZE = vertices.BYTES_PER_ELEMENT;

  // position attribute
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * FSIZE, 0);
  gl.enableVertexAttribArray(0);
  // normal attribute
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(1);
  //texture
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * FSIZE, 6 * FSIZE);
  gl.enableVertexAttribArray(2);

  // second configure the light's VAO.(VBO stays the same; the vertices are same for the light object which is also a 3D cube)
  const lightCubeVao = gl.createVertexArray();
  gl.bindVertexArray(lightCubeVao);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * FSIZE, 0);
  gl.enableVertexAttribArray(0);

  // texture
  //------------------------------------------------------
  const diffuseMap = loadTexture(gl, image);
  const specularMap = loadTexture(gl, image1);
  const emissionMap = loadTexture(gl, image2);

  // shader configuration
  lightingShader.use();
  lightingShader.setInt('material.diffuse', 0);
  lightingShader.setInt('material.specular', 1);
  lightingShader.setInt('material.emission', 2);


  const drawScene = (time: number) => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    let currentFrame = time;
    deltaTime = currentFrame - lastFrame;
    lastFrame = currentFrame;

    gl.enable(gl.DEPTH_TEST); // 激活深度比较，并且更新深度缓冲区
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // be sure to active shader when setting uniform/ drawing objects
    lightingShader.use();

    lightingShader.setVec3('light.position', lightPos);
    lightingShader.setVec3('viewPos', camera.position);

    // light properties 将所有光照强度都设置为1
    lightingShader.setVec3('light.ambient', [0.2, 0.2, 0.2]); // 环境光照通常设置为一个比较低的强度
    lightingShader.setVec3('light.diffuse', [0.5, 0.5, 0.5]); // 光源的漫反射分量通常设置为希望光所具有的那个颜色。通常是比较亮的白色
    lightingShader.setVec3('light.specular', [1, 1, 1]); // 镜面反射通常保持为1，以最大强度反光

    // material properties 将环境光和漫反射分量设置为我们想要让物体所拥有的颜色，将镜面分量设置为一个一个中等亮度的颜色
    lightingShader.setFloat("material.shininess", 64);

    // view/project transform
    const projection = mat4.perspective(mat4.create(), glMatrix.toRadian(camera.zoom), gl.canvas.width / gl.canvas.height, 0.1, 100);
    const view = camera.getViewMatrix();
    lightingShader.setMat4('projection', projection);
    lightingShader.setMat4('view', view);

    // world transformation
    let model = mat4.create();
    lightingShader.setMat4('model', model);

    // bind diffuse map
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, diffuseMap);
    // bind specular map
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, specularMap);
    // bind emission map
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, emissionMap);

    // render cube 绘制立方体
    gl.bindVertexArray(cubeVao);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // alse draw the lamp object 把顶移动到lightPos，然后将它缩小一点
    lightCubeShader.use();
    lightCubeShader.setMat4('projection', projection);
    lightCubeShader.setMat4('view', view);
    model = mat4.translate(mat4.create(), model, lightPos);
    model = mat4.scale(model, model, [0.2, 0.2, 0.2]);
    lightCubeShader.setMat4('model', model);

    // 绘制灯
    gl.bindVertexArray(lightCubeVao);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    requestAnimationFrame(drawScene);
  }

  function loadTexture(gl: WebGL2RenderingContext, image: HTMLImageElement) {
    const texture = gl.createTexture();
    if (!texture) {
      console.log('Failed to create texture.');
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
  }

  // keydown
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    switch (event.key) {
      case 'w':
        camera.processKeyboard(CameraMovement.FORWARD, deltaTime * 0.001);
        break;
      case "s":
        camera.processKeyboard(CameraMovement.BACKWARD, deltaTime * 0.001);
        break;
      case "a":
        camera.processKeyboard(CameraMovement.LEFT, deltaTime * 0.001);
        break;
      case "d":
        camera.processKeyboard(CameraMovement.RIGHT, deltaTime * 0.001);
        break;
      default:
        break;
    }
  })

  // mouse wheel
  window.addEventListener('wheel', (event: WheelEvent) => {
    camera.processMouseScroll(event.deltaY * 0.001);
  });

  // mouse move
  window.addEventListener('mousemove', (event: MouseEvent) => {
    // camera.processMouseMovement(event.movementX, event.movementY);
    let xpos = event.x;
    let ypos = event.y;
    if (firstMouse) {
      lastX = xpos;
      lastY = ypos;
      firstMouse = false;
    }

    let xOffset = xpos - lastX;
    let yOffset = ypos - lastY;

    lastX = xpos;
    lastY = ypos;
    camera.processMouseMovement(xOffset, yOffset);
  })

  requestAnimationFrame(drawScene);
}


