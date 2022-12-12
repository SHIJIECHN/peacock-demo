#version 300 es
precision highp float;
out vec4 FragColor;

// 存储物体的材质属性
struct Material{
    sampler2D diffuse;
    sampler2D specular;
    float shininess;// 反光度
};

// 光照属性来影响各个光照分量
struct Light{
    // vec3 position;
    vec3 direction;
    
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

uniform vec3 viewPos;
uniform Material material;
uniform Light light;

void main()
{
    // ambient
    vec3 ambient=light.ambient*texture(material.diffuse,TexCoords).rgb;// 环境光的材质颜色设置为漫反射材质颜色
    
    // diffuse
    vec3 norm=normalize(Normal);
    vec3 lightDir=normalize(-light.direction);// 指向光源的方向向量
    float diff=max(dot(norm,lightDir),0.);
    vec3 diffuse=light.diffuse*diff*texture(material.diffuse,TexCoords).rgb;// 从纹理中采样片段的漫反射颜色值
    
    // specular
    vec3 viewDir=normalize(viewPos-FragPos);
    vec3 reflectDir=reflect(-lightDir,norm);
    float spec=pow(max(dot(viewDir,reflectDir),0.),material.shininess);
    vec3 specular=light.specular*spec*vec3(texture(material.diffuse,TexCoords));// 翻转高光贴图的颜色
    
    vec3 result=ambient+diffuse+specular;
    FragColor=vec4(result,1.);
}