#version 300 es
precision highp float;
out vec4 FragColor;

in vec2 TexCoord;

uniform sampler2D texturel;

void main(){
  FragColor = vec4(texture(texturel, TexCoord).rgb, 1);
}
