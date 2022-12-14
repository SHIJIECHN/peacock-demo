// 解析obj文件
function parseOBJ(text) {
  // 因为索引是从1开始的，所以填充索引为0的位置
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // f 1/2/3 4/5/6 7/8/9
  // 和‘f'一样的索引顺序。保存从object文件中解析出来的顶点位置v、纹理坐标vt和法线vn
  const objVertexData = [objPositions, objTexcoords, objNormals];

  // 和‘f'一样的索引顺序。保存webGL的顶点。根据f信息，得到对应的顶点数据
  let webglVertexData = [
    [], // position
    [], // texcoords
    [], // normals
  ];

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      // parts: [ "1/1/1", "5/2/1", "7/3/1", "3/4/1" ]
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    }
  };

  const keywordRE = /(\w*)(?: )*(.*)/; // 匹配每行的信息
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim(); // 去掉首尾空格 
    // line = 'v 1.000000 1.000000 -1.000000'
    if (line === '' || line.startsWith('#')) { // 去掉注释行
      continue;
    }
    const m = keywordRE.exec(line);
    /**
     * m = [
     *  0: v 1.000000 1.000000 -1.000000"
     *  1: "v"
     *  2: "1.000000 1.000000 -1.000000"
     *  groups: undefined
     *  index: 0
     *  input: "v 1.000000 1.000000 -1.000000"
     * ]
     */
    if (!m) {
      continue;
    }
    // console.log(m)

    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1); // 按空格分割，并去掉第一个空格之前的内容
    // keyword: "v"
    // unparsedArgs: "1.000000 1.000000 -1.000000"
    // parts : ['1.000000', '1.000000', '-1.000000']

    /**
     * 将每行的第一部分作为keyword，然后找到对应的函数调用，并将keyword后面的data传给该函数
     */
    const handler = keywords[keyword];

    if (!handler) {
      console.warn('unhandled keyword: ', keyword, 'at line', lineNo + 1);
      continue;
    }
    handler(parts, unparsedArgs);
  }

  return {
    position: webglVertexData[0],
    texcoord: webglVertexData[1],
    normal: webglVertexData[2]
  }
}

const vs = `#version 300 es
in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

out vec3 v_normal;

void main(){
  gl_Position = u_projection * u_view * u_world * a_position;
  v_normal = mat3(u_world) * a_normal;
}
`;

const fs = `#version 300 es
precision highp float;

in vec3 v_normal;

uniform vec4 u_diffuse;
uniform vec3 u_lightDirection;

out vec4 outColor;

void main(){
  vec3 normal = normalize(v_normal);
  float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
  outColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
}
`;

async function main() {
  /**
   * @type { HTMLCanvasElement}
   */
  const canvas = document.querySelector('#canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.error('Could not find canvas');
    return;
  }

  twgl.setAttributePrefix('a_');

  // compile and link the shaders, looks up attributes and uniform locations
  /**
   * {
   *  attribSetters: {
   *    a_normal: { loaction: 1, ...}
   *    a_position: { location: 0, ...},
   *  },
   *  program: WebGLProgram{},
   *  transformFeedbackInfo: {},
   *  uniformBlockSpec: {
   *    blockSpecs: {},
   *    uniformData: [
   *      { blockNdx: -1, name: "u_projection", ...},
   *      { blockNdx: -1, name: "u_view", ...},
   *      { blockNdx: -1, name: "u_world", ...},
   *      { blockNdx: -1, name: "u_diffuse", ...},
   *      { blockNdx: -1, name: "u_lightDirection", ...},
   *    ]
   *  },
   *  uniformSetters: {
   *    u_diffuse: {location: WebGLUniformLocation{}},
   *    u_lightDirection: {location: WebGLUniformLocation{}},
   *    u_projection: {location: WebGLUniformLocation{}},
   *    u_view: {location: WebGLUniformLocation{}},
   *    u_world: {location: WebGLUniformLocation{}},
   *  }
   * }
   */
  const meshProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);


  const response = await fetch('https://webgl2fundamentals.org/webgl/resources/models/cube/cube.obj');
  const text = await response.text();
  console.log(text)
  const data = parseOBJ(text);
  /**
   * Because data is just naned arrays like this:
   * {
   *  position: [...],
   *  texcoords: [...],
   *  normal: [...]
   * }
   * 
   * 因为这些数组的名称和顶点着色器中的属性对应，所以我们可以将数据直接传进去
   * 使用方法“createBufferInfoFromArrays”
   */

  // 通过调用gl.createBuffer、gl.bindBuffer、gl.bufferData为每个数组创建缓冲
  /**
   * bufferInfo: {
   *  a_normal : {
   *    buffer: WebGLBuffer {},
   *    divisor: undefined,
   *    drawType: undefined,
   *    normalize: false,
   *    numComponents: 3,
   *    offset: 0,
   *    stride: 0,
   *    type: 5126
   *  },
   *  a_position: {...},
   *  a_texcoords: {...}
   * }
   */
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
  // 通过调用gl.createVertexArray, gl.bindVertexArray填充顶点数组
  // 然后为每个属性调用gl.bindBuffer，gl.enableVertexAttribArray和gl.vertexAttribPointer
  const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);

  const cameraTarget = [0, 0, 0];
  const cameraPosition = [0, 0, 4];
  const zNear = 0.1;
  const zFar = 50;

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  function render(time) {
    time *= 0.001; // 转换为秒

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    const up = [0, 1, 0];
    // Computed the camera's matrix using look at.
    const camera = m4.lookAt(cameraPosition, cameraTarget, up);

    // Make a view matrix from the camera matrix
    const view = m4.inverse(camera);

    const sharedUniforms = {
      u_lightDirection: m4.normalize([-1, 3, 5]),
      u_view: view,
      u_projection: projection,
    };

    gl.useProgram(meshProgramInfo.program);

    // calls gl.uniform
    twgl.setUniforms(meshProgramInfo, sharedUniforms);

    // set the attributes for this part
    gl.bindVertexArray(vao);

    // calls gl.uniform
    twgl.setUniforms(meshProgramInfo, {
      u_world: m4.yRotation(time),
      u_diffuse: [1, 0.7, 0.5, 1],
    })

    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
main();