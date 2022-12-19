import { gl } from "./Global";
import Shader from "./Shader";

export class Vertex {
  position = new Array<number>(3); // 3
  normal = new Array<number>(3); //3
  texCoords = new Array<number>(2);

  static sizeof() {
    return Float32Array.BYTES_PER_ELEMENT * 8;
  }

  // 连续数据
  data() {
    let ret = new Array<number>();
    ret = ret.concat(this.position);
    ret = ret.concat(this.normal);
    ret = ret.concat(this.texCoords);
    return ret;
  }
}

export class Texture {
  id: WebGLTexture;
  type: string;
  path: string;
}

export class Mesh {
  vertices: Vertex[];
  indices: Uint16Array;
  textures: Texture[];
  VAO: WebGLVertexArrayObject;

  private VBO: WebGLBuffer;
  private EBO: WebGLBuffer;

  constructor(vertices: Vertex[], indices: number[], textures: Texture[]) {
    this.vertices = vertices;
    this.indices = new Uint16Array(indices);
    this.textures = textures;
  }

  Draw(shader: Shader): void {
    let diffuseNr = 1;
    let specularNr = 1;
    let normalNr = 1;
    let heightNr = 1;
    for (let i = 0; i < this.textures.length; i++) {
      gl.activeTexture(gl.TEXTURE0 + i); // 激活相应的纹理单元

      /**
       * 1. 计算每个纹理类型的N分量，并将其拼接到纹理类型字符串上，来获取对应的uniform名称。
       * 2. 查找对应的采样器，将它的位置值设置为当前激活的纹理单元，并绑定纹理。
       */
      let number: string = ''; // 获取纹理序号（diffuse_textureN中的N）
      let name = this.textures[i].type;
      if (name === 'texture_diffuse') {
        number = (diffuseNr++).toString();
      } else if (name === 'texture_specular') {
        number = (specularNr++).toString();
      } else if (name === 'texture_normal') {
        number = (normalNr++).toString();
      } else if (name === 'texture_height') {
        number = (heightNr++).toString();
      }

      gl.uniform1f(gl.getUniformLocation(shader.getID(), (name + number)), i);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i].id);
    }
  }
  setupMesh(shader: Shader) {
    let VAO = gl.createVertexArray();
    let VBO = gl.createBuffer();
    let EBO = gl.createBuffer();
    if (!VAO) {
      console.error('Failed to create VAO.');
      return null;
    }
    if (!VBO) {
      console.error('Failed to create VBO.');
      return null;
    }
    if (!EBO) {
      console.error('Failed to create EBO.');
      return null;
    }

    this.VAO = VAO;
    this.VBO = VBO;
    this.EBO = EBO;

    gl.bindVertexArray(this.VAO);

    // 合并数据
    let tmpVec = new Array<number>();
    for (let i = 0; i < this.vertices.length; i++) {
      tmpVec = tmpVec.concat(this.vertices[i].data())
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tmpVec), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.EBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    shader.use();

    // vertex position
    let aPos = shader.getAttribLocation('aPos');
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, Vertex.sizeof(), 0);
    gl.enableVertexAttribArray(aPos);
    // vertex normals
    let aNormal = shader.getAttribLocation('aNormal');
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, Vertex.sizeof(), 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aNormal);
    // vertex texture coords
    let aTexCoords = shader.getAttribLocation('aTexCoords');
    gl.vertexAttribPointer(aTexCoords, 2, gl.FLOAT, false, Vertex.sizeof(), 6 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aTexCoords);

    gl.bindVertexArray(null);
  }
}