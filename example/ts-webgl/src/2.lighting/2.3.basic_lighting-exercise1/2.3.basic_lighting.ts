
const vsColor = `#version 300 es

layout(location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal; // 每一个顶点的法向量

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 Normal;
out vec3 FragPos; // 世界空间坐标

void main(){
  gl_Position = projection * view * vec4(aPos, 1.0);
  FragPos = vec3(model * vec4(aPos, 1.0)); // 因为是在世界空间中进行所有光照的计算，因此需要一个在世界空间中的顶点位置
  Normal = mat3(transpose(inverse(model))) * aNormal; // mat3(transpose(inverse(model))) 生成法线矩阵
}`;

const fsColor = `#version 300 es
precision highp float;
out vec4 FragColor;

in vec3 Normal;
in vec3 FragPos;

uniform vec3 objectColor;
uniform vec3 lightColor;
uniform vec3 lightPos; // 光源的位置
uniform vec3 viewPos; // 摄像机的位置

void main(){
  // 环境光 ambient。用光的颜色乘以一个很小的常量环境因子，再乘以物体的颜色，然后将最终结果作为片段的颜色
  float ambientStrength = 0.1;
  vec3 ambient = ambientStrength * lightColor;

  // 计算漫反射 diffuse
  vec3 norm = normalize(Normal); // 法线单位向量
  vec3 lightDir = normalize(lightPos - FragPos); // 光的方向单位向量 = normalize(光源位置 - 片段位置)
  float diff = max(dot(norm, lightDir), 0.0); // 光源对当前片段实际的漫反射的影响
  vec3 diffuse = diff * lightColor; // 乘以光的颜色，得到漫反射分量

  // 镜面光照 specular
  float specularStrength = 0.5; // 镜面强度变量
  vec3 viewDir = normalize(viewPos - FragPos); // 视线的法线向量
  vec3 reflectDir = reflect(-lightDir, norm); // 沿着法线轴的反射向量。reflect函数要求第一个向量是从光线指向片段位置的向量，lightDir是从片段指向光源。
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // 32是高光的反光度。dot(viewDir, reflectDir)视线方向与反射方向的点乘， max确保它不是负值
  vec3 specalar = specularStrength * spec * lightColor; // 镜面分量

  vec3 result = (ambient + diffuse + specalar) * objectColor; // 环境光分量、漫反射分量和镜面光照相加，再乘以物体的颜色，得到最后的输出颜色

  FragColor = vec4(result, 1.0);
}`;

export {
  vsColor, fsColor
}