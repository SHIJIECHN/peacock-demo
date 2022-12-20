// 解析obj文件
function parseOBJ(text) {
  // 因为索引是从1开始的，所以填充索引为0的位置
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];
  const objColors = [[0, 0, 0]];

  // f 1/2/3 4/5/6 7/8/9
  // 和‘f'一样的索引顺序。保存从object文件中解析出来的顶点位置v、纹理坐标vt和法线vn
  const objVertexData = [objPositions, objTexcoords, objNormals, objColors];

  // 和‘f'一样的索引顺序。保存webGL的顶点。根据f信息，得到对应的顶点数据
  let webglVertexData = [
    [], // position
    [], // texcoords
    [], // normals
    [], // color
  ];


  function newGeometry() {
    // 如果有存在的几何体并且不是空的，销毁
    if (geometry && geometry.data.position.length) {
      geometry = undefined
    }
  }

  function setGeometry() {
    if (!geometry) {
      const position = [];
      const texcoord = [];
      const normal = [];
      const color = [];
      webglVertexData = [
        position,
        texcoord,
        normal,
        color
      ];
      geometry = {
        object,
        groups,
        material,
        data: {
          position,
          texcoord,
          normal,
          color
        }
      }
    };
    geometries.push(geometry);
  }

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
      // 如果这是位置索引并且解析到了颜色值，将顶点的颜色值渎职到webgl顶点的颜色中
      if (i === 0 && objColors.length > 1) {
        geometry.data.color.push(...objColors[index]);
      }
    });
  }

  const materialLibs = [];
  const geometries = [];
  let geometry;
  let material = 'default';
  let object = 'default';
  let groups = ['default'];

  const noop = () => { };

  const keywords = {
    v(parts) {
      //  if there are more than 3 values here they are vertex colors
      if (parts.length > 3) {
        objPositions.push(parts.slice(0, 3).map(parseFloat));
        objColors.push(parts.slice(3).map(parseFloat));
      } else {
        objPositions.push(parts.map(parseFloat));
      }
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      // 如果在文件中没有usemtl，我们使用默认的几何体，使用setGeometry来创建
      setGeometry();
      // parts: [ "1/1/1", "5/2/1", "7/3/1", "3/4/1" ]
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
    // usemtl指明了后面出现的所有几何体都需要使用指定的材质
    usemtl(parts, unparsedArgs) {
      material = unparsedArgs;
      newGeometry();
    },
    // matlib 指定了包含材质信息的独立的一个或多个文件
    mtllib(parts, unparsedArgs) {
      materialLibs.push(unparsedArgs)
    },
    // o 指定表明了接下来的条目命名为“object”的对象
    o(parts, unparsedArgs) {
      object = unparsedArgs;
      newGeometry();
    },
    // 指定了一个smoothing group
    s: noop,
    // g 代表组（group）。通常它只是一些元数据。
    g(parts) {
      groups = parts;
      newGeometry();
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

  // 移除空数组
  for (const geometry of geometries) {
    geometry.data = Object.fromEntries(
      Object.entries(geometry.data).filter(([, array]) => array.length > 0)
    )
  }

  return {
    materialLibs,
    geometries, // 每个对象包含name和data
  }
}

// 计算给定多个位置中的最小和最大位置
function getExtents(positions) {
  const min = positions.slice(0, 3);
  const max = positions.slice(0, 3);
  for (let i = 3; i < positions.length; i += 3) {
    for (let j = 0; j < 3; ++j) {
      const v = positions[i + j];
      min[j] = Math.min(v, min[j]);
      max[j] = Math.max(v, max[j]);
    }
  }
  return { min, max };
}
// 遍历集合体的每个部分，得到范围
function getGeometriesExtents(geometries) {
  return geometries.reduce(({ min, max }, { data }) => {
    const minMax = getExtents(data.position);
    return {
      min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
      max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
    };
  }, {
    min: Array(3).fill(Number.POSITIVE_INFINITY),
    max: Array(3).fill(Number.NEGATIVE_INFINITY),
  });
}

const vs = `#version 300 es
in vec4 a_position;
in vec3 a_normal;
in vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

out vec3 v_normal;
out vec4 v_color;

void main(){
  gl_Position = u_projection * u_view * u_world * a_position;
  v_normal = mat3(u_world) * a_normal;
  v_color = a_color;
}
`;

const fs = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec4 v_color;

uniform vec4 u_diffuse;
uniform vec3 u_lightDirection;

out vec4 outColor;

void main(){
  vec3 normal = normalize(v_normal);
  float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
  vec4 diffuse = u_diffuse * v_color;
  outColor = vec4(diffuse.rgb * fakeLight, diffuse.a);
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


  const response = await fetch('https://webgl2fundamentals.org/webgl/resources/models/book-vertex-chameleon-study/book.obj');
  const text = await response.text();
  const obj = parseOBJ(text);
  console.log(obj)


  const parts = obj.geometries.map(({ data }) => {
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
   * */
    if (data.color) {
      if (data.position.length === data.color.length) {
        // 是 3，helper library默认是 4 所以我们需要告诉程序只有 3 个
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      // 没有顶点颜色，使用白色
      data.color = { value: [1, 1, 1, 1] }
    }

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
    return {
      material: {
        u_diffuse: [1, 1, 1, 1]
      },
      bufferInfo,
      vao
    }
  });

  // 计算物体的平移距离，一边能将它的中心放在原点，同时计算原点和camera的距离没保证能完全看到物体
  const extents = getGeometriesExtents(obj.geometries);
  const range = m4.subtractVectors(extents.max, extents.min);
  // 移动物体的距离，使得其中心在原点
  const objOffset = m4.scaleVector(
    m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
    -1
  );

  const cameraTarget = [0, 0, 0];
  // 计算移动camera的距离，以便我们能完全看到物体
  const radius = m4.length(range) * 1.2;
  const cameraPosition = m4.addVectors(cameraTarget, [0, 0, radius]);
  // 设置合适于物体的大小zNear和zFar值
  const zNear = radius / 100;
  const zFar = radius * 3;

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  function render(time) {
    time *= 0.001; // 转换为秒

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

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

    let u_world = m4.yRotation(time);
    u_world = m4.translate(u_world, ...objOffset);

    for (const { bufferInfo, vao, material } of parts) {
      // set the attributes for this part
      gl.bindVertexArray(vao);

      // calls gl.uniform
      twgl.setUniforms(meshProgramInfo, {
        u_world,
        u_diffuse: material.u_diffuse,
      })

      // calls gl.drawArrays or gl.drawElements
      twgl.drawBufferInfo(gl, bufferInfo);
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
main();