export enum EulerOrder {
	XYZ,
	YZX,
	ZXY,
	XZY,
	YXZ,
	ZYX,
	default = EulerOrder.XYZ
}

export class Euler {
	x: number;
	y: number;
	z: number;
	order: EulerOrder;

	constructor(x: number = 0, y: number = 0, z: number = 0, order: EulerOrder = EulerOrder.default) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.order = order;
	}

	/**
	 * copy from another euler
	 * @param euler
	 */
	copyFrom(euler: Euler): Euler {
		this.x = euler.x;
		this.y = euler.y;
		this.z = euler.z;
		this.order = euler.order;
		return this;
	}

	/**
	 * set value of thiss euler
	 * @param x
	 * @param y
	 * @param z
	 */
	set(x: number = 0, y: number = 0, z: number = 0, order: EulerOrder = EulerOrder.default): Euler {
		this.x = x;
		this.y = y;
		this.z = z;
		this.order = order;
		return this;
	}

	copy(e: Euler): Euler {
		return this.set(e.x, e.y, e.z, e.order);
	}

	clone;
}
