const vsCube = `#version 300 es
layout (location = 0) in vec3 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main(){
  gl_Position = projection * view * model * vec4(aPos, 1.0);
}`;

const fsCube = `#version 300 es
precision highp float;
out vec4 FragColor;

void main(){
  FragColor = vec4(1.0); // set alle 4 vector values to 1.0
}`;

export {
  vsCube, fsCube
}