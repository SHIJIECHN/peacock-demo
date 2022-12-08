// define serveral posible options for camera movement
const CameraMovement = {
  FORWARD,
  BACKWARD,
  LEFT,
  RIGHT
}

// default camera value
const YAW = -90;
const PITCH = 0;
const SPEED = 2.5;
const SENSITIVITY = 0.1;
const ZOOM = 45;
const defaultPosition = [0, 0, 0, 0];
const defaultFront = [0, 0, -1];
const defaultWorldup = [0, 1, 0];

class Camera {
  constructor(options) {
    if (!glMatrix) {
      console.log('Failed to load glMatrix. You should load glMatrix before new Camera.');
      return;
    }
    // camera attrbute
    this.position = options.position || defaultPosition;
    this.front = options.front || defaultFront;
    this.worldUp = options.worldUp || defaultWorldup;
    this.up = null;
    this.right = null;

    // euler angles
    this.yaw = options.yaw || YAW;
    this.pitch = options.pitch || PITCH;

    // camera options
    this.MovementSpeed = options.MovementSpeed || SPEED;
    this.MouseSensitivity = options.MouseSensitivity || SENSITIVITY;
    this.zoom = options.zoom || ZOOM;

    this.updateCameraVectors();
  }

  // returns the view matrxi calculated using Enuler angles and the lookAt Matrix
  getViewMatrix() {
    let view = glMatrix.mat4.create();
    // this.position + this.front
    let res = this.position.map((item, index) => item + this.front[index]);
    glMatrix.mat4.lookAt(view, this.position, res, this.up);
  }

  // processes input received from any keyboard-like input system.
  processKeyboard(direction, deltaTime) {
    let velocity = this.MovementSpeed * deltaTime;
    if (direction == CameraMovement.FORWARD) {
      this.position = this.position.map((item, index) => item + this.front[index] * velocity);
    }

    if (direction == CameraMovement.BACKWARD) {
      this.position = this.position.map((item, index) => item - this.front[index] * velocity);
    }

    if (direction == CameraMovement.LEFT) {
      this.position = this.position.map((item, index) => item - this.right[index] * velocity);
    }

    if (direction == CameraMovement.RIGHT) {
      this.position = this.position.map((item, index) => item + this.right[index] * velocity);
    }
  }

  processMouseMovement() {

  }

  // calculates the front vector from Camera's(updated) Enuler Angles
  updateCameraVectors() {
    let radians = glMatrix.glMatrix.toRadian;
    let normalize = glMatrix.vec3.normalize;
    let cross = glMatrix.vec3.cross;
    // calculate the new this.front vector
    let front = [];
    front[0] = Math.cos(radians(this.yaw)) * Math.cos(radians(this.pitch));
    front[1] = Math.sin(radians(this.pitch));
    front[2] = Math.sin(radians(this.yaw)) * Math.cos(radians(this.pitch));
    normalize(this.front, front);

    // also re-calculate the this.right and this.up vector
    let right = [];
    cross(right, this.front, this.worldUp);
    normalize(this.right, right);

    let up = [];
    cross(up, this.right, this.front);
    normalize(this.up, up);
  }

}