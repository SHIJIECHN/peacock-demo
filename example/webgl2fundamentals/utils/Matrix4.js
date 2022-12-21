/**
 * 矩阵 4x4 
 * Matrix4类与OpenGL提供的方法功能相同
 * 
 * Matrix4 类
 * 初始化如果传入opt_src参数，则初始化矩阵根据opt_src生成
 * 如果没有传入参数，则生成单位矩阵
 */
class Matrix4 {
  constructor() {
  }


  /**
   * 矩阵 4x4 相乘
   * @param {*} a Matrix4 矩阵
   * @param {*} b Matrix4 矩阵
   * @returns Matrix4 4x4矩阵
   */
  multiply(a, b) {
    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];

    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  }

  /**
   * 平移矩阵
   * @param {*} tx 
   * @param {*} ty 
   * @param {*} tz 
   * @returns 
   */
  translation(tx, ty, tz) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1,
    ];
  }

  /**
   * 矩阵平移
   * @param {Matrix4} m 需要平移的矩阵
   * @param {*} tx 
   * @param {*} ty 
   * @param {*} tz 
   * @returns 平移后的矩阵
   */
  translate(m, tx, ty, tz) {
    return this.multiply(m, this.translation(tx, ty, tz))
  }

  /**
   * 沿着 X 轴旋转
   * @param {*} angleInRadians 旋转的弧度
   * @returns 
   */
  xRotation(angleInRadians) {
    const c = Math.cos(angleInRadians),
      s = Math.sin(angleInRadians);
    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  }

  /**
   * 矩阵沿 X 轴旋转
   * @param {Matrix4} m 需要旋转的矩阵
   * @param {*} angleInRadians 旋转的弧度
   * @returns 沿 X 轴旋转后的矩阵
   */
  xRotate(m, angleInRadians) {
    return this.multiply(m, this.xRotation(angleInRadians));
  }

  /**
   * 沿着 Y 轴旋转
   * @param {*} angleInRadians 旋转的弧度
   * @returns 
   */
  yRotation(angleInRadians) {
    const c = Math.cos(angleInRadians),
      s = Math.sin(angleInRadians);
    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  }

  /**
   * 矩阵沿着 Y 轴旋转
   * @param {Matrix4} m 需要旋转的矩阵
   * @param {0~2*PI} angleInRadians 旋转的弧度
   * @returns 沿 Y 轴旋转后的矩阵
   */
  yRotate(m, angleInRadians) {
    return this.multiply(m, this.yRotation(angleInRadians));
  }

  /**
   * 沿着 Z 轴旋转
   * @param {*} angleInRadians 旋转的弧度
   * @returns 
   */
  zRotation(angleInRadians) {
    const c = Math.cos(angleInRadians),
      s = Math.sin(angleInRadians);
    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  }

  /**
 * 矩阵沿着 Z 轴旋转
 * @param {Matrix4} m 需要旋转的矩阵
 * @param {0~2*PI} angleInRadians 旋转的弧度
 * @returns 沿 Z 轴旋转后的矩阵
 */
  zRotate(m, angleInRadians) {
    return this.multiply(m, this.zRotation(angleInRadians));
  }

  /**
   * 缩放矩阵
   * @param {*} sx 
   * @param {*} sy 
   * @param {*} sz 
   * @returns 缩放矩阵
   */
  scaling(sx, sy, sz) {
    return [
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1,
    ]
  }

  /**
   * 矩阵缩放
   * @param {Matrix4} m 需要缩放的矩阵
   * @param {*} sx 
   * @param {*} sy 
   * @param {*} sz 
   * @returns 缩放后的矩阵
   */
  scale(m, sx, sy, sz) {
    return this.multiply(m, this.scaling(sx, sy, sz));
  }

  /**
   * 投影
   * @param {*} width 
   * @param {*} height 
   * @param {*} depth 
   * @returns 
   */
  projection(width, height, depth) {
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  }

  /**
   * 正交投影
   * @param {*} left 
   * @param {*} right 
   * @param {*} bottom 
   * @param {*} top 
   * @param {*} near 
   * @param {*} far 
   */
  orthographic(left, right, bottom, top, near, far) {
    return [
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, 2 / (near - far), 0,

      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1,
    ];
  }

  /**
   * 透视投影转正交投影
   * @param {*} fieldOfViewInRadians 视角
   * @param {*} aspect width/height 屏幕的宽高比
   * @param {*} near 近平面
   * @param {*} far 远平面
   * @returns 
   */
  perspective(fieldOfViewInRadians, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    const rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0,
    ]
  }

  /**
   * 矩阵的逆
   * @param {*} m 原始矩阵
   * @returns Matrix4 逆矩阵
   */
  inverse(m) {
    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m03 = m[0 * 4 + 3];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m13 = m[1 * 4 + 3];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];
    const m23 = m[2 * 4 + 3];
    const m30 = m[3 * 4 + 0];
    const m31 = m[3 * 4 + 1];
    const m32 = m[3 * 4 + 2];
    const m33 = m[3 * 4 + 3];
    const tmp_0 = m22 * m33;
    const tmp_1 = m32 * m23;
    const tmp_2 = m12 * m33;
    const tmp_3 = m32 * m13;
    const tmp_4 = m12 * m23;
    const tmp_5 = m22 * m13;
    const tmp_6 = m02 * m33;
    const tmp_7 = m32 * m03;
    const tmp_8 = m02 * m23;
    const tmp_9 = m22 * m03;
    const tmp_10 = m02 * m13;
    const tmp_11 = m12 * m03;
    const tmp_12 = m20 * m31;
    const tmp_13 = m30 * m21;
    const tmp_14 = m10 * m31;
    const tmp_15 = m30 * m11;
    const tmp_16 = m10 * m21;
    const tmp_17 = m20 * m11;
    const tmp_18 = m00 * m31;
    const tmp_19 = m30 * m01;
    const tmp_20 = m00 * m21;
    const tmp_21 = m20 * m01;
    const tmp_22 = m00 * m11;
    const tmp_23 = m10 * m01;

    const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
      (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
      (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
      (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
      (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
        (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
        (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
        (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
        (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
        (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
        (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
        (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
        (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
        (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
        (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
        (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
        (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
    ];
  }

  /**
   * 四维矩阵与向量相乘，得到一个向量
   * @param {*} m 
   * @param {*} v 
   * @returns 
   */
  transformVector(m, v) {
    var dst = [];
    for (var i = 0; i < 4; ++i) {
      dst[i] = 0.0;
      for (var j = 0; j < 4; ++j) {
        dst[i] += v[j] * m[j * 4 + i];
      }
    }
    return dst;
  }

  /**
   * 向量交乘
   * @param {*} a 
   * @param {*} b 
   * @returns 
   */
  cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }

  /**
   * 向量相减
   * @param {*} a 
   * @param {*} b 
   * @returns 
   */
  subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  /**
   * 单位化向量 
   * @param {*} v 
   * @returns 
   */
  normalize(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
      return [v[0] / length, v[1] / length, v[2] / length];
    } else {
      return [0, 0, 0];
    }
  }

  /**
   * 计算“朝向”矩阵
   * @param {*} cameraPosition 相机的位置
   * @param {*} target 目标
   * @param {*} up 向上方向
   * @returns 
   */
  lookAt(cameraPosition, target, up) {
    var zAxis = this.normalize(
      this.subtractVectors(cameraPosition, target));
    var xAxis = this.normalize(this.cross(up, zAxis));
    var yAxis = this.normalize(this.cross(zAxis, xAxis));

    return [
      xAxis[0], xAxis[1], xAxis[2], 0,
      yAxis[0], yAxis[1], yAxis[2], 0,
      zAxis[0], zAxis[1], zAxis[2], 0,
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2],
      1,
    ];
  }

  /**
   * 矩阵的转置
   * @param {*} m 
   * @returns 
   */
  transpose(m) {
    return [
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15],
    ];
  }
}