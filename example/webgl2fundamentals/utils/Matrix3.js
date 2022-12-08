class Matrix3 {
  constructor() {

  }
  /**
   * 矩阵相乘 b · a
   * @param {Matrix3} a 矩阵
   * @param {Matrix3} b 矩阵
   * @returns 
   */
  multiply(a, b) {
    const a00 = a[0 * 3 + 0],
      a01 = a[0 * 3 + 1],
      a02 = a[0 * 3 + 2],
      a10 = a[1 * 3 + 0],
      a11 = a[1 * 3 + 1],
      a12 = a[1 * 3 + 2],
      a20 = a[2 * 3 + 0],
      a21 = a[2 * 3 + 1],
      a22 = a[2 * 3 + 2],
      b00 = b[0 * 3 + 0],
      b01 = b[0 * 3 + 1],
      b02 = b[0 * 3 + 2],
      b10 = b[1 * 3 + 0],
      b11 = b[1 * 3 + 1],
      b12 = b[1 * 3 + 2],
      b20 = b[2 * 3 + 0],
      b21 = b[2 * 3 + 1],
      b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22
    ];
  }

  /**
   * 平移矩阵
   * @param {*} tx x轴平移量
   * @param {*} ty y轴平移量
   * @returns Matrix3 平移矩阵
   */
  translation(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ]
  }

  /**
   * 旋转矩阵
   * @param {0~2*PI} angleInRadians 旋转的弧度
   * @returns Matrix3
   */
  rotation(angleInRadians) {
    const c = Math.cos(angleInRadians),
      s = Math.sin(angleInRadians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1,
    ]
  }

  /**
   * 缩放矩阵
   * @param {*} sx x轴缩放
   * @param {*} sy y轴缩放
   * @returns Matrix3
   */
  scaling(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1
    ]
  }

  /**
   * 创建 3x3 的单位矩阵
   * @returns Matrix3
   */
  identity() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]
  }

  /**
   * 根据像素，生成裁剪空间坐标
   * [1/width, 0,  0]    [2, 0, 0]   [1, 0, -1]   [1,  0, 0]
   * [0, 1/height, 0]  · [0, 2, 0] · [0, 1, -1] · [0, -1, 0]
   * [0,    0,     1]    [0, 0, 1]   [0, 0,  1]   [0,  0, 1]
   * @param {*} width 宽度
   * @param {*} height 高度
   * @returns 
   */
  projection(width, height) {
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1,
    ]
  }

  /**
   * 矩阵平移
   * @param {*} m 原矩阵
   * @param {*} tx 
   * @param {*} ty 
   * @returns 平移后的矩阵
   */
  translate(m, tx, ty) {
    return this.multiply(m, this.translation(tx, ty));
  }

  /**
   * 矩阵旋转
   * @param {*} m 原矩阵
   * @param {*} angleInRadians 旋转的弧度
   * @returns 旋转后的矩阵
   */
  rotate(m, angleInRadians) {
    return this.multiply(m, this.rotation(angleInRadians));
  }

  /**
   * 矩阵缩放
   * @param {*} m 原矩阵
   * @param {*} sx 
   * @param {*} sy 
   * @returns 缩放后的矩阵
   */
  scale(m, sx, sy) {
    return this.multiply(m, this.scaling(sx, sy));
  }
}