import { Euler, Matrix, Quaternion, Vector3 } from '@/peacock/math';

export class Object3D {
	name: string = '';
	type: string = '';

	position: Vector3 = new Vector3();
	scale: Vector3 = new Vector3();
	euler: Euler = new Euler();
	quaternion: Quaternion = new Quaternion();

	matrix: Matrix = new Matrix();
	worldMatrix = new Matrix();

	children = [];
	parent = null;
}
