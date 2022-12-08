
const vsColor = `#version 300 es

layout(location = 0) in vec3 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main(){
  gl_Position = projection * view * model * vec4(aPos, 1.0);
}`;

const fsColor = `#version 300 es
precision highp float;
out vec4 FragColor;

uniform vec3 objectColor; // 物体的颜色
uniform vec3 lightColor; // 光的颜色

void main(){
  FragColor = vec4(lightColor * objectColor, 1.0);
}`;

export {
  vsColor, fsColor
}