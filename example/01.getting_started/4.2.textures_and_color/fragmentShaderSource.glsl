#version 300 es
precision highp float;
out vec4 FragColor;

in vec2 TexCoord;
in vec3 ourColor;

uniform sampler2D texturel;

void main(){
  FragColor = texture(texturel, TexCoord)*vec4(ourColor, 1);
}
