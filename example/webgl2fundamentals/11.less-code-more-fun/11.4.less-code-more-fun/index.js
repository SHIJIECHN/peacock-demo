var vs = `#version 300 es
uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;

in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

out vec4 v_position;
out vec2 v_texCoord;
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

void main() {
  v_texCoord = a_texcoord;
  v_position = (u_worldViewProjection * a_position);
  v_normal = (u_worldInverseTranspose * vec4(a_normal, 0)).xyz;
  v_surfaceToLight = u_lightWorldPos - (u_world * a_position).xyz;
  v_surfaceToView = (u_viewInverse[3] - (u_world * a_position)).xyz;
  gl_Position = v_position;
}
`;

var fs = `#version 300 es
precision highp float;

in vec4 v_position;
in vec2 v_texCoord;
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform vec4 u_lightColor;
uniform vec4 u_colorMult;
uniform sampler2D u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;

out vec4 outColor;

vec4 lit(float l ,float h, float m) {
  return vec4(1.0,
              abs(l),
              (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
              1.0);
}

void main() {
  vec4 diffuseColor = texture(u_diffuse, v_texCoord);
  vec3 a_normal = normalize(v_normal);
  vec3 surfaceToLight = normalize(v_surfaceToLight);
  vec3 surfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLight + surfaceToView);
  vec4 litR = lit(dot(a_normal, surfaceToLight),
                    dot(a_normal, halfVector), u_shininess);
  outColor = vec4((
    u_lightColor * (diffuseColor * litR.y * u_colorMult +
                u_specular * litR.z * u_specularFactor)).rgb,
      diffuseColor.a);
}
`;

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Tell the webgl to match position with a_position, normal with a_normal etx...
  twgl.setAttributePrefix('a_');

  // a sigle triangle
  const arrays = {
    position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
    texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
    normal: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    indices: [0, 1, 2, 1, 2, 3],
  };
  /**
   * 为属性创建对应buffer
   * 遍历arrays，将属性名变成a_position, 数据变成Float32Array，
   *    buffer = gl.createBuffer()
   *    gl.bindBuffer(type, buffer);
   *    gl.bufferData(type, array, gl.STATIC_DRAW);
   * 
   * 返回bufferInfo ={ 
   *  a_position: {
   *    buffer： webGLBuffer,
   *    numComponents: 3,
   *    type: 5126(gl.FLOAT),
   *    normalize: false,
   *    stride: 0,
   *    offset: 0
   *  },
   *  a_texcoord: {...}
   * }
   * 
   */
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  // setup GLSL program
  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  // 创建vao，并将数据传给缓冲
  const vao = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  const fieldOfViewRadians = degToRad(60);

  const uniformsThatAreTheSameForAllObjects = {
    u_lightWorldPos: [-50, 30, 100],
    u_viewInverse: m4.identity(),
    u_lightColor: [1, 1, 1, 1]
  }

  const uniformsThatAreComputedForEachObject = {
    u_worldViewProjection: m4.identity(),
    u_world: m4.identity(),
    u_worldInverseTranspose: m4.identity()
  }

  var rand = function (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.random() * (max - min);
  };

  var randInt = function (range) {
    return Math.floor(Math.random() * range);
  };

  var textures = [
    textureUtils.makeStripeTexture(gl, { color1: "#FFF", color2: "#CCC", }),
    textureUtils.makeCheckerTexture(gl, { color1: "#FFF", color2: "#CCC", }),
    textureUtils.makeCircleTexture(gl, { color1: "#FFF", color2: "#CCC", }),
  ];

  const objects = [];
  const numObjects = 300;
  const baseColor = rand(240);
  for (var ii = 0; ii < numObjects; ++ii) {
    objects.push({
      radius: rand(150),
      xRotation: rand(Math.PI * 2),
      yRotation: rand(Math.PI),
      materialUniforms: {
        u_colorMult: chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
        u_diffuse: textures[randInt(textures.length)],
        u_specular: [1, 1, 1, 1],
        u_shininess: rand(500),
        u_specularFactor: rand(1),
      },
    });
  }

  requestAnimationFrame(drawScene);

  // Draw the scene
  function drawScene(time) {
    time = 5 + time * 0.0001;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
      m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, 100];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up, uniformsThatAreTheSameForAllObjects.u_viewInverse);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.useProgram(programInfo.program);

    // Setup all the needed attributes.
    gl.bindVertexArray(vao);

    // Set the uniforms that are the same for all objects.
    twgl.setUniforms(programInfo, uniformsThatAreTheSameForAllObjects);

    // Draw objects
    objects.forEach(function (object) {

      // Compute a position for this object based on the time.
      var worldMatrix = m4.identity();
      worldMatrix = m4.yRotate(worldMatrix, object.yRotation * time);
      worldMatrix = m4.xRotate(worldMatrix, object.xRotation * time);
      worldMatrix = m4.translate(worldMatrix, 0, 0, object.radius,
        uniformsThatAreComputedForEachObject.u_world);

      // Multiply the matrices.
      m4.multiply(viewProjectionMatrix, worldMatrix, uniformsThatAreComputedForEachObject.u_worldViewProjection);
      m4.transpose(m4.inverse(worldMatrix), uniformsThatAreComputedForEachObject.u_worldInverseTranspose);

      // Set the uniforms we just computed
      twgl.setUniforms(programInfo, uniformsThatAreComputedForEachObject);

      // Set the uniforms that are specific to the this object.
      twgl.setUniforms(programInfo, object.materialUniforms);

      // Draw the geometry.
      gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    });

    requestAnimationFrame(drawScene);
  }
}

main();