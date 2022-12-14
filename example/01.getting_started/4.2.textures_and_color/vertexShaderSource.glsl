#version 300 es
layout (location = 0) in vec3 aPos; 
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aColor;

out vec2 TexCoord;
out vec3 ourColor;

void main(){
  gl_Position = vec4(aPos, 1.0);
  ourColor = aColor;
  TexCoord = vec2(aTexCoord.x, aTexCoord.y);
}