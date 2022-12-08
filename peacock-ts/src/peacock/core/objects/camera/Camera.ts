import { MathUtil, Matrix, Vector3 } from '@/peacock/math';

// define serveral posible options for camera movement
export enum CameraMovement {
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

export class Camera {
	position: Vector3; // camear world position
	front: Vector3; // camera view direction
	up: Vector3; // camera up direction: the positive direction of camera y axis
	right: Vector3; // camera right direction: the positivew direction of world x axis
	worldUp: Vector3; // up direction of world coordinate

	// 欧拉角
	yaw: number; // yaw angle 偏航角
	pitch: number; // pitch angle 俯仰角

	// 相机参数
	movementSpeed: number = SPEED; // camera move speed
	mouseSensitivity: number = SENSITIVITY; // the sensitivity mouse
	zoom: number = ZOOM;

	/**
	 * 创建一个照相机
	 * @param position position camera world position, the default value is [0,0,0]
	 * @param worldUp worldUp up direction of world, the default value is [0,1,0]
	 * @param yaw yaw angle
	 * @param pitch pitch angle
	 */
	constructor(position = new Vector3(0.0, 0.0, 0.0), worldUp = new Vector3(0.0, 1.0, 0.0), yaw = YAW, pitch = PITCH) {
		this.front = new Vector3(0, 0, -1);
		this.movementSpeed = SPEED;
		this.mouseSensitivity = SENSITIVITY;
		this.zoom = ZOOM;

		this.right = new Vector3();
		this.up = new Vector3();

		// camera attribute
		this.position = position;
		this.worldUp = worldUp;
		// euler angles
		this.yaw = yaw;
		this.pitch = pitch;

		this.updateCameraVectors();
	}

	// returns the view matrix calculated using Euler angles and the lookAt Matrix 获得当前的观察矩阵
	// 计算观察矩阵
	getViewMatrix() {
		let viewMatrix: Matrix = new Matrix();
		let cacheTarget: Vector3 = new Vector3();
		Vector3.add(this.position, this.front, cacheTarget);
		Matrix.lookAt(this.position, cacheTarget, this.up, viewMatrix);
		return viewMatrix;
	}

	/**
	 * 相机移动，可以配合键盘模拟相机移动的效果
	 * @param direction
	 * @param deltaTime
	 */
	processKeyboard(direction: CameraMovement, deltaTime: number) {
		let velocity = this.movementSpeed * deltaTime;
		let movement: Vector3 = new Vector3();
		switch (direction) {
			case CameraMovement.FORWARD:
				Vector3.scale(this.front, velocity, movement);
				Vector3.add(this.position, movement, this.position);
				break;
			case CameraMovement.BACKWARD:
				Vector3.scale(this.front, velocity, movement);
				Vector3.subtract(this.position, movement, this.position);
				break;
			case CameraMovement.LEFT:
				Vector3.scale(this.right, velocity, movement);
				Vector3.subtract(this.position, movement, this.position);
				break;
			case CameraMovement.RIGHT:
				Vector3.scale(this.right, velocity, movement);
				Vector3.add(this.position, movement, this.position);
				break;
		}
	}

	/**
	 * 处理鼠标移动，改变偏航角和俯仰角，模拟摄像机转向动作
	 */
	processMouseMovement(xOffset: number, yOffset: number, constrainPitch: boolean = true) {
		xOffset *= this.mouseSensitivity;
		yOffset *= this.mouseSensitivity;

		this.yaw += xOffset;
		this.pitch += yOffset;
		if (constrainPitch) {
			if (this.pitch > 89) this.pitch = 89;
			if (this.pitch < -89) this.pitch = -89;
		}
		this.updateCameraVectors();
	}

	/**
	 * processes input received from a mouse scroll-wheel event
	 * @param yOffset
	 */
	processMouseScroll(yOffset: number) {
		if (this.zoom >= 1.0 && this.zoom <= 45.0) {
			this.zoom -= yOffset;
		}
		if (this.zoom <= 1) this.zoom = 1;
		if (this.zoom >= 45) this.zoom = 45;

		this.updateCameraVectors();
	}

	// calculates the front vector from Camera's(updated) Enuler Angles
	private updateCameraVectors() {
		let front = new Vector3();
		front[0] = Math.cos(MathUtil.degreeToRadian(this.yaw)) * Math.cos(MathUtil.degreeToRadian(this.pitch));
		front[1] = Math.sin(MathUtil.degreeToRadian(this.pitch));
		front[2] = Math.sin(MathUtil.degreeToRadian(this.yaw)) * Math.cos(MathUtil.degreeToRadian(this.pitch));
		Vector3.normalize(front, this.front);

		Vector3.cross(this.front, this.worldUp, this.right);
		Vector3.normalize(this.right, this.right);

		Vector3.cross(this.right, this.front, this.up);
		Vector3.normalize(this.up, this.up);
		// normalize
	}
}
