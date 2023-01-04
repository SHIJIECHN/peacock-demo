
const vs = `#version 300 es
in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main(){
  gl_Position = u_matrix * a_position;

  v_color = a_color;
}
`;
const fs = `#version 300 es
precision highp float;

in vec4 v_color;

uniform vec4 u_colorMult;
uniform vec4 u_colorOffset;

out vec4 outColor;

void main(){
  outColor = v_color * u_colorMult + u_colorOffset;
}
`;

function computeWorldMatrix(currentNode, parentWroldMatrix) {
  // 通过把我们的父节点的世界矩阵和当前结点的局部矩阵相乘
  // 计算出当前节点的世界矩阵
  const worldMatrix = m4.multiply(parentWroldMatrix, currentNode.localMatrix);

  // 让子节点做同样的事
  currentNode.children.forEach(child => {
    computeWorldMatrix(child, worldMatrix)
  })
}

// 节点类
const Node = function () {
  this.children = []; // 子节点序列
  this.localMatrix = m4.identity(); // 当前节点的局部矩阵
  this.worldMatrix = m4.identity(); // 当前结点的世界矩阵
}

// 设定节点父节点的方式
// 将节点的父节点设置为parent
Node.prototype.setParent = function (parent) {
  // 从父节点中移除
  if (this.parent) {
    let ndx = this.parent.children.indexOf(this);
    if (ndx >= 0) {
      this.parent.children.splice(ndx, 1);
    }
  }

  // 添加到新的父节点上
  if (parent) {
    parent.children.push(this);
  }
  this.parent = parent;
}

/**
 * 根据父子节点关系和局部矩阵计算世界矩阵。如果我们从父节点调用，它将会递归的计算出子节点的世界矩阵
 * @param {*} parentWorldMatrix 
 */
Node.prototype.updateWorldMatrix = function (parentWorldMatrix) {
  if (parentWorldMatrix) {
    // 传入一个矩阵计算出世界矩阵并存入 'this.worldMatrix'
    m4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
  } else {
    // 没有矩阵传入，直接将局部矩阵拷贝到世界矩阵
    m4.copy(this.localMatrix, this.worldMatrix);
  }

  // 计算所有的子节点
  let worldMatrix = this.worldMatrix;
  this.children.forEach(child => {
    child.updateWorldMatrix(worldMatrix)
  })
}

function main() {
  const canvas = document.querySelector('#canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    return;
  }

  twgl.setAttributePrefix('a_');

  const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);

  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  const fieldViewRadians = degToRad(60);

  // 定义所有的节点
  const sunNode = new Node();
  sunNode.localMatrix = m4.translation(0, 0, 0); // 太阳在中心
  sunNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.6, 0.6, 0, 1], // 黄色
      u_colorMult: [0.4, 0.4, 0, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  }

  const earthNode = new Node();
  earthNode.localMatrix = m4.translation(100, 0, 0); // 地球离太阳 100 个单位距离
  // 让地球变为两倍大小
  earthNode.localMatrix = m4.scale(earthNode.localMatrix, 2, 2, 2);
  earthNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.2, 0.5, 0.8, 1], // 蓝绿色
      u_colorMult: [0.8, 0.5, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO
  };

  const moonNode = new Node();
  moonNode.localMatrix = m4.translation(20, 0, 0); // 月亮离地球 20 个单位距离
  moonNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.6, 0.6, 0.6, 1], // 灰色
      u_colorMult: [0.1, 0.1, 0.1, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO
  }

  // 将它们关联起来
  moonNode.setParent(earthNode);
  earthNode.setParent(sunNode);

  // 创建一个物体列表和一个将要绘制的物体列表
  const objects = [
    sunNode, earthNode, moonNode
  ];

  const objectsToDraw = [
    sunNode.drawInfo, earthNode.drawInfo, moonNode.drawInfo
  ]

  requestAnimationFrame(drawScene);

  function drawScene(time) {
    time *= 0.001;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = m4.perspective(fieldViewRadians, aspect, 1, 2000);

    const cameraPosition = [0, -200, 0];
    const target = [0, 0, 0];
    const up = [0, 0, 1];
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);

    const viewMatrix = m4.inverse(cameraMatrix);

    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // update the local matrices for each object
    m4.multiply(m4.yRotation(0.01), sunNode.localMatrix, sunNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), earthNode.localMatrix, earthNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), moonNode.localMatrix, moonNode.localMatrix);

    // update all world matrices om  the scene graph
    sunNode.updateWorldMatrix();

    // compute all the matrices for rendering
    objects.forEach(object => {
      object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
    });

    // Draw the objects
    twgl.drawObjectList(gl, objectsToDraw);

    requestAnimationFrame(drawScene)

  }

}

main();

