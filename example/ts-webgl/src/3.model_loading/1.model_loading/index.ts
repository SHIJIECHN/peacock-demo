import { vec3 } from "gl-matrix";
import { Camera, CameraMovement } from "utils/Camera";
import Shader from "utils/Shader";
import modelFs from './model_loading.fs'
import modelVs from './model_loading.vs'

export default function main(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
  const SCR_WIDTH = canvas.width;
  const SCR_HEIGHT = canvas.height;
  let camera = new Camera({ position: vec3.fromValues(0.0, 0.0, 3.0) });
  let lastX = SCR_WIDTH / 2.0;
  let lastY = SCR_HEIGHT / 2.0;
  let firstMouse = true;

  let deltaTime = 0.0;
  let lastFrame = 0.0;

  let lightPos = vec3.fromValues(1.2, 1.0, 2.0);

  let modelingShader = new Shader(gl, modelVs, modelFs);
  // let modeling = new


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