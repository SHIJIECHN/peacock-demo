import Shader from '../../utils/Shader'
import { Camera, CameraMovement } from '../../utils/Camera'
import { vec3, mat4, glMatrix } from 'gl-matrix'
import { vsColor, fsColor } from './1.color'
import { vsCube, fsCube } from './1.light_cube'
import { vertices } from './vertices'
import { resizeCanvas } from '../../utils/index'

export default async function main(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  const camera = new Camera({
    position: [0, 0, 10]
  });

  let lastX = gl.canvas.width,
    lastY = gl.canvas.height;

  let firstMouse = true;

  //timing
  let deltaTime = 0;
  let lastFrame = 0;

  // lighting
  let lightPos: vec3 = [1.2, 1, 2];  // 光源在世界空间中的坐标

  // 我们希望灯颜色不受影响，因此为等创建一套着色器。保证它能够在其他光照着色器发生
  // 改变的时候不受影响。在绘制灯的时候，使用灯着色器，绘制物体的时候使用物体的着色器
  const lightingShader = new Shader(gl, vsColor, fsColor); // 被投光的对象（立方体）
  const lightCubeShader = new Shader(gl, vsCube, fsCube); // 光源(灯立方体)

  const cubeVao = gl.createVertexArray(); // 立方体
  const vbo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindVertexArray(cubeVao);
  const FSIZE = vertices.BYTES_PER_ELEMENT;

  // position attribute
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * FSIZE, 0);
  gl.enableVertexAttribArray(0);

  // second configure the light's VAO.(VBO stays the same; the vertices are same for the light object which is also a 3D cube)
  const lightCubeVao = gl.createVertexArray(); // 灯立方体
  gl.bindVertexArray(lightCubeVao);

  // 只需要绑定VBO不用再次设置VBO的数据，因为立方体的VBO数据中已经包含了正确的立方体顶点数据
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * FSIZE, 0);
  gl.enableVertexAttribArray(0);

  const drawScene = (time: number) => {
    let currentFrame = time;
    deltaTime = currentFrame - lastFrame;
    lastFrame = currentFrame;

    gl.clearColor(0.1, 0.1, 0.1, 1);
    // 开启深度测试

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // be sure to active shader when setting uniform/ drawing objects 绘制物体
    //----------------------------------------------------------------
    lightingShader.use();
    lightingShader.setVec3('objectColor', [1, 0.5, 0.3]); // 物体的颜色
    lightingShader.setVec3('lightColor', [1, 1, 1]); // 光的颜色，设置为白色
    // view/project transform
    const projection = mat4.perspective(mat4.create(), glMatrix.toRadian(camera.zoom), gl.canvas.width / gl.canvas.height, 0.1, 100);
    const view = camera.getViewMatrix();
    lightingShader.setMat4('projection', projection);
    lightingShader.setMat4('view', view);
    // world transformation
    let model = mat4.create();
    lightingShader.setMat4('model', model);
    // render cube 绘制物体
    gl.bindVertexArray(cubeVao);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // 绘制灯。把灯移动到lightPos，然后将它缩小一点
    //---------------------------------------------------------------------
    lightCubeShader.use();
    lightCubeShader.setMat4('projection', projection);
    lightCubeShader.setMat4('view', view);
    model = mat4.translate(mat4.create(), model, lightPos); // 平移
    model = mat4.scale(model, model, [0.2, 0.2, 0.2]); // 缩放
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


