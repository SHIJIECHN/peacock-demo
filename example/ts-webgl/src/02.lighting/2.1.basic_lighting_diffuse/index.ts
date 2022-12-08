import Shader from '../../utils/Shader'
import { Camera, CameraMovement } from '../../utils/Camera'
import { vec3, mat4, glMatrix } from 'gl-matrix'
import { vsColor, fsColor } from './2.1.basic_lighting'
import { vsCube, fsCube } from './2.1.light_cube'
import { vertices } from './vertices'

export default async function main(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
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

  const lightingShader: Shader = new Shader(gl, vsColor, fsColor);
  const lightCubeShader: Shader = new Shader(gl, vsCube, fsCube);

  const cubeVao = gl.createVertexArray();
  const vbo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindVertexArray(cubeVao);
  const FSIZE = vertices.BYTES_PER_ELEMENT;

  // position attribute
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * FSIZE, 0);
  gl.enableVertexAttribArray(0);
  // normal attribute
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(1);

  // second configure the light's VAO.(VBO stays the same; the vertices are same for the light object which is also a 3D cube)
  const lightCubeVao = gl.createVertexArray();
  gl.bindVertexArray(lightCubeVao);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * FSIZE, 0);
  gl.enableVertexAttribArray(0);

  const drawScene = (time: number) => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // resizeCanvas(gl);
    let currentFrame = time;
    deltaTime = currentFrame - lastFrame;
    lastFrame = currentFrame;

    gl.enable(gl.DEPTH_TEST); // 激活深度比较，并且更新深度缓冲区

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // be sure to active shader when setting uniform/ drawing objects
    lightingShader.use();
    lightingShader.setVec3('objectColor', [1, 0.5, 0.31]);
    lightingShader.setVec3('lightColor', [1, 1, 1]);
    lightingShader.setVec3('lightPos', lightPos);

    // view/project transform
    const projection = mat4.perspective(mat4.create(), glMatrix.toRadian(camera.zoom), gl.canvas.width / gl.canvas.height, 0.1, 100);
    const view = camera.getViewMatrix();
    lightingShader.setMat4('projection', projection);
    lightingShader.setMat4('view', view);

    // world transformation
    let model = mat4.create();
    lightingShader.setMat4('model', model);

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

    requestAnimationFrame(drawScene)
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

  requestAnimationFrame(drawScene)
}


