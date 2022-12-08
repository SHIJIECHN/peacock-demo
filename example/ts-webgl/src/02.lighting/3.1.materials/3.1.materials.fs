#version 300 es
precision highp float;
out vec4 FragColor;

// 存储物体的材质属性
struct Material{
    vec3 ambient;// 环境关照
    vec3 diffuse;// 漫反射光照
    vec3 specular;// 镜面关照
    float shininess;// 反光度
};

// 光照属性对各个光照分量的影响
struct Light{
    vec3 position;
    
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

in vec3 FragPos;
in vec3 Normal;

uniform vec3 viewPos;
uniform Material material;
uniform Light light;

void main()
{
    // 将强度值改为每个光照分量指定一个强度向量。
    // ambient
    vec3 ambient=light.ambient*material.ambient;
    
    // diffuse
    vec3 norm=normalize(Normal);
    vec3 lightDir=normalize(light.position-FragPos);
    float diff=max(dot(norm,lightDir),0.);
    vec3 diffuse=light.diffuse*(diff*material.diffuse);
    
    // specular
    vec3 viewDir=normalize(viewPos-FragPos);
    vec3 reflectDir=reflect(-lightDir,norm);
    float spec=pow(max(dot(viewDir,reflectDir),0.),material.shininess);
    vec3 specular=light.specular*(spec*material.specular);
    
    vec3 result=ambient+diffuse+specular;
    FragColor=vec4(result,1.);
}