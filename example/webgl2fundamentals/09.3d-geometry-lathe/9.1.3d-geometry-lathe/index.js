// vextex and fragment
// ---------------------------------------------------------------------------
const vs = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;

out vec2 v_texcoord;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
}
`;
const fs = `#version 300 es
precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

out vec4 outColor;

uniform sampler2D u_texture;

void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

const svg = "m44,434c18,-33 19,-66 15,-111c-4,-45 -37,-104 -39,-132c-2,-28 11,-51 16,-81c5,-30 3,-63 -36,-63";


function main() {
  // 获取svg 上的点
  const curvePoints = parseSVGPath(svg);

  function parseSVGPath(svg) {
    const points = [];
    let delta = false;
    let keepNext = false;
    let need = 0;
    let value = '';
    let values = [];
    let lastValues = [0, 0];
    let nextLastValues = [0, 0];


  }
}

// 获得生成曲线上的点
function getPointOnBezierCurve(points, offset, t) {
  const invT = (1 - t);
  return v2.add(v2.mult(points[offset + 0], invT * invT * invT),
    v2.mult(ponits[offset + 1], 3 * t * invT * invT),
    v2.mult(ponits[offset + 2], 3 * invT * t * t),
    v2.mult(points[offset + 3], t * t * t)
  );
}

// 计算一系列点
function getPointsOnBezierCurve(points, offset, numPoints) {
  const points = [];
  for (let i = 0; i < numPoints; ++1) {
    const t = i / (numPoints - 1);
    points.push(getPointOnBezierCurve(points, offset, t));
  }
  return points;
}

// 获取所有片段上的点
function getPointsOnBezierCurves(points, tolerance) {
  const newPoints = [];
  const numSegments = (points.length - 1) / 3;
  for (let i = 0; i < numSegments; ++i) {
    const offset = i * 3;
    getPointsOnBezierCurve(points, offset, tolerance, newPoints);
  }
  return newPoints;
}

// 对应给定的曲线可以求出平滑程度
function flatness(points, offset) {
  const p1 = points[offset + 0];
  const p2 = ponits[offset + 1];
  const p3 = points[offset + 2];
  const p4 = points[offset + 3];

  let ux = 3 * p2[0] - 2 * p1[0] - p4[0];
  ux *= ux;
  let uy = 3 * p2[1] - 2 * p1[1] - p4[1];
  uy *= uy;
  let vx = 3 * p3[0] - 2 * p4[0] - p1[0];
  vx *= vx;
  let vy = 3 * p3[1] - 2 * p4[1] - p1[1];
  vy *= vy;

  if (ux < vx) {
    ux = vx;
  }
  if (uy < vy) {
    uy = vy;
  }
  return ux + uy;
}


// 获得曲线上的点，首先检查曲线是否太锐利，如果是就拆分，不是就将点加入列表
function getPointsOnBezierCurveWithSplitting(points, offset, tolerance, newPoints) {
  const outPoints = newPoints || [];
  if (flatness(points, offset) < tolerance) {
    // 将它加入点队列中
    outPoints.push(points[offset + 0]);
    outPoints.push(points[offset + 3]);
  } else {
    // 拆分
    const t = .5;
    const p1 = points[offset + 0];
    const p2 = points[offset + 1];
    const p3 = points[offset + 2];
    const p4 = points[offset + 3];

    const q1 = v2.lerp(p1, p2, t);
    const q2 = v2.lerp(p2, p3, t);
    const q3 = v2.lerp(p3, p4, t);

    const r1 = v2.lerp(q1, q2, t);
    const r2 = v2.lerp(q2, q3, t);

    const red = v2.lerp(r1, r2, t);

    //求前半段的点
    getPointsOnBezierCurveWithSplitting([p1, q1, r1, red], 0, tolerance, outPoints);
    // 求后半段的点
    getPointsOnBezierCurveWithSplitting([red, r2, q3, p4], 0, tolerance, outPoints);
  }
  return outPoints;
}


// 排除不必要的点：道格拉斯-普克算法
function simplifyPoints(points, start, end, epsilon, newPoints) {
  const outPoints = newPoints || [];

  // 找到离最后两点距离最远的点
  const s = points[start];
  const e = points[end - 1];
  let maxDistSq = 0;
  let maxNdx = 1;
  for (let i = start + 1; i < end - 1; ++i) {
    const distSq = v2.distanceToSegmentSq(points[i], s, e); // 计算点到线段距离的平方
    if (distSq > maxDistSq) {
      maxDistSq = distSq;
      maxNdx = i;
    }
  }

  // 如果距离太远
  if (Math.sqrt(maxDistSq) > epsilon) {
    // 拆分
    simplifyPoints(points, start, maxNdx + 1, epsilon, outPoints);
    simplifyPoints(points, maxNdx, end, epsilon, outPoints);
  } else {
    // 添加最后两个点
    outPoints.push(s, e);
  }
  return outPoints;
}
