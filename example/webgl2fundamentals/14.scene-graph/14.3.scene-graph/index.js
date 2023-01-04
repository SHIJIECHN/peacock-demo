
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

const TRS = function () {
  this.translation = [0, 0, 0];
  this.rotation = [0, 0, 0];
  this.scale = [1, 1, 1];
};

TRS.prototype.getMatrix = function (dst) {
  dst = dst || new Float32Array(16);
  let t = this.translation;
  let r = this.rotation;
  let s = this.scale;

  m4.translation(t[0], t[1], t[2], dst);
  m4.xRotate(dst, r[0], dst);
  m4.yRotate(dst, r[1], dst);
  m4.zRotate(dst, r[2], dst);
  m4.scale(dst, s[0], s[1], s[2], dst);
  return dst;
}

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
const Node = function (source) {
  this.children = []; // 子节点序列
  this.localMatrix = m4.identity(); // 当前节点的局部矩阵
  this.worldMatrix = m4.identity(); // 当前结点的世界矩阵
  this.source = source;
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
  let source = this.source;
  if (source) {
    source.getMatrix(this.localMatrix);
  }

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
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Tell the twgl to match position with a_position, n
  // normal with a_normal etc..
  twgl.setAttributePrefix("a_");

  var cubeBufferInfo = flattenedPrimitives.createCubeBufferInfo(gl, 1);

  // setup GLSL program
  var programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  var cubeVAO = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);

  var objectsToDraw = [];
  var objects = [];
  var nodeInfosByName = {};

  // Let's make all the nodes
  var blockGuyNodeDescriptions =
  {
    name: "point between feet",
    draw: false,
    children: [
      {
        name: "waist",
        translation: [0, 3, 0],
        children: [
          {
            name: "torso",
            translation: [0, 2, 0],
            children: [
              {
                name: "neck",
                translation: [0, 1, 0],
                children: [
                  {
                    name: "head",
                    translation: [0, 1, 0],
                  },
                ],
              },
              {
                name: "left-arm",
                translation: [-1, 0, 0],
                children: [
                  {
                    name: "left-forearm",
                    translation: [-1, 0, 0],
                    children: [
                      {
                        name: "left-hand",
                        translation: [-1, 0, 0],
                      },
                    ],
                  },
                ],
              },
              {
                name: "right-arm",
                translation: [1, 0, 0],
                children: [
                  {
                    name: "right-forearm",
                    translation: [1, 0, 0],
                    children: [
                      {
                        name: "right-hand",
                        translation: [1, 0, 0],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "left-leg",
            translation: [-1, -1, 0],
            children: [
              {
                name: "left-calf",
                translation: [0, -1, 0],
                children: [
                  {
                    name: "left-foot",
                    translation: [0, -1, 0],
                  },
                ],
              },
            ],
          },
          {
            name: "right-leg",
            translation: [1, -1, 0],
            children: [
              {
                name: "right-calf",
                translation: [0, -1, 0],
                children: [
                  {
                    name: "right-foot",
                    translation: [0, -1, 0],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  function makeNode(nodeDescription) {
    var trs = new TRS();
    var node = new Node(trs);
    nodeInfosByName[nodeDescription.name] = {
      trs: trs,
      node: node,
    };
    trs.translation = nodeDescription.translation || trs.translation;
    if (nodeDescription.draw !== false) {
      node.drawInfo = {
        uniforms: {
          u_colorOffset: [0, 0, 0.6, 0],
          u_colorMult: [0.4, 0.4, 0.4, 1],
        },
        programInfo: programInfo,
        bufferInfo: cubeBufferInfo,
        vertexArray: cubeVAO,
      };
      objectsToDraw.push(node.drawInfo);
      objects.push(node);
    }
    makeNodes(nodeDescription.children).forEach(function (child) {
      child.setParent(node);
    });
    return node;
  }

  function makeNodes(nodeDescriptions) {
    return nodeDescriptions ? nodeDescriptions.map(makeNode) : [];
  }

  var scene = makeNode(blockGuyNodeDescriptions);

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    time *= 0.001;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
      m4.perspective(fieldOfViewRadians, aspect, 1, 200);

    // Compute the camera's matrix using look at.
    var cameraPosition = [4, 3.5, 10];
    var target = [0, 3.5, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    var adjust;
    var speed = 3;
    var c = time * speed;
    adjust = Math.abs(Math.sin(c));
    nodeInfosByName["point between feet"].trs.translation[1] = adjust;
    adjust = Math.sin(c);
    nodeInfosByName["left-leg"].trs.rotation[0] = adjust;
    nodeInfosByName["right-leg"].trs.rotation[0] = -adjust;
    adjust = Math.sin(c + 0.1) * 0.4;
    nodeInfosByName["left-calf"].trs.rotation[0] = -adjust;
    nodeInfosByName["right-calf"].trs.rotation[0] = adjust;
    adjust = Math.sin(c + 0.1) * 0.4;
    nodeInfosByName["left-foot"].trs.rotation[0] = -adjust;
    nodeInfosByName["right-foot"].trs.rotation[0] = adjust;

    adjust = Math.sin(c) * 0.4;
    nodeInfosByName["left-arm"].trs.rotation[2] = adjust;
    nodeInfosByName["right-arm"].trs.rotation[2] = adjust;
    adjust = Math.sin(c + 0.1) * 0.4;
    nodeInfosByName["left-forearm"].trs.rotation[2] = adjust;
    nodeInfosByName["right-forearm"].trs.rotation[2] = adjust;
    adjust = Math.sin(c - 0.1) * 0.4;
    nodeInfosByName["left-hand"].trs.rotation[2] = adjust;
    nodeInfosByName["right-hand"].trs.rotation[2] = adjust;

    adjust = Math.sin(c) * 0.4;
    nodeInfosByName["waist"].trs.rotation[1] = adjust;
    adjust = Math.sin(c) * 0.4;
    nodeInfosByName["torso"].trs.rotation[1] = adjust;
    adjust = Math.sin(c + 0.25) * 0.4;
    nodeInfosByName["neck"].trs.rotation[1] = adjust;
    adjust = Math.sin(c + 0.5) * 0.4;
    nodeInfosByName["head"].trs.rotation[1] = adjust;
    adjust = Math.cos(c * 2) * 0.4;
    nodeInfosByName["head"].trs.rotation[0] = adjust;

    // Update all world matrices in the scene graph
    scene.updateWorldMatrix();

    // Compute all the matrices for rendering
    objects.forEach(function (object) {
      object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
    });

    // ------ Draw the objects --------

    twgl.drawObjectList(gl, objectsToDraw);

    requestAnimationFrame(drawScene);
  }
}

main();

