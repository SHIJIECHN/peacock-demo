#version 300 es
precision highp float;
out vec4 FragColor;

in vec2 TexCoord;
in vec3 ourColor;

uniform sampler2D texture1;
uniform sampler2D texture2;

void main(){
  // 线性采样texture1* 80% 与texture2 * 20%
  FragColor = mix(texture(texture1, TexCoord), texture(texture2, vec2(1.0 - TexCoord.x, TexCoord.y)), 0.2);
}
