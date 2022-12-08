#version 300 es
precision highp float;

out vec4 FragColor;

// 材质
struct Material{
  sampler2D diffuse;
  sampler2D specular;
  float shininess;
};

// 定向光
struct DirLight{
  vec3 direction;
  
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

// 点光源
struct PointLight{
  vec3 position;
  // 衰减
  float constant;
  float linear;
  float quadratic;
  
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

// 聚光
struct SpotLight{
  vec3 position;
  vec3 direction;
  float cutOff;
  float outerCutOff;
  
  float constant;
  float linear;
  float quadratic;
  
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

// 预处理命令定义场景中点光源的数量
#define NR_POINT_LIGHTS 4

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

uniform vec3 viewPos;
uniform DirLight dirLight;
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform SpotLight spotLight;
uniform Material material;

// function prototypes
// vec3 CalcDirLight(DirLight light,vec3 normal,vec3 viewDir);
// vec3 CalcPointLight(PointLight light,vec3 normal,vec3 fragPos,vec3 viewDir);
// vec3 CalcSpotLight(SpotLight light,vec3 normal,vec3 fragPos,vec3 viewDir);
// function prototypes
vec3 CalcDirLight(DirLight light,vec3 normal,vec3 viewDir);
vec3 CalcPointLight(PointLight light,vec3 normal,vec3 fragPos,vec3 viewDir);
vec3 CalcSpotLight(SpotLight light,vec3 normal,vec3 fragPos,vec3 viewDir);

void main(){
  vec3 norm=normalize(Normal);
  vec3 viewDir=normalize(viewPos-FragPos);
  
  // 1. directional lighting
  vec3 result=CalcDirLight(dirLight,norm,viewDir);
  // 2. point lights
  for(int i=0;i<NR_POINT_LIGHTS;i++){
    result+=CalcPointLight(pointLights[i],norm,FragPos,viewDir);
    // 3. spot light
    result+=CalcSpotLight(spotLight,norm,FragPos,viewDir);
    
    FragColor=vec4(result,1.);
  }
}

// 定向光
//-----------------------------------------------------------------------
vec3 CalcDirLight(DirLight light,vec3 normal,vec3 viewDir){
  vec3 lightDir=normalize(-light.direction);
  // 漫反射着色
  float diff=max(dot(normal,lightDir),0.);
  // 镜面光着色
  vec3 reflectDir=reflect(-lightDir,normal);
  float spec=pow(max(dot(viewDir,reflectDir),0.),material.shininess);
  // 合并结果
  vec3 ambient=light.ambient*vec3(texture(material.diffuse,TexCoords));
  vec3 diffuse=light.diffuse*diff*vec3(texture(material.diffuse,TexCoords));
  vec3 specular=light.specular*spec*vec3(texture(material.specular,TexCoords));
  return(ambient+diffuse+specular);
}

// 点光源
//----------------------------------------------------------------------
vec3 CalcPointLight(PointLight light,vec3 normal,vec3 fragPos,vec3 viewDir){
  vec3 lightDir=normalize(light.position-fragPos);
  // 漫反射着色
  float diff=max(dot(normal,lightDir),0.);
  // 镜面光着色
  vec3 reflectDir=reflect(-lightDir,normal);
  float spec=pow(max(dot(viewDir,reflectDir),0.),material.shininess);
  // 衰减
  float distance=length(light.position-fragPos);
  float attenuation=1./(light.constant+light.linear*distance+light.quadratic*(distance*distance));
  // 合并结果
  vec3 ambient=light.ambient*vec3(texture(material.diffuse,TexCoords));
  vec3 diffuse=light.diffuse*diff*vec3(texture(material.diffuse,TexCoords));
  vec3 specular=light.specular*spec*vec3(texture(material.specular,TexCoords));
  ambient*=attenuation;
  diffuse*=attenuation;
  specular*=attenuation;
  return(ambient+diffuse+specular);
}

// 聚光
vec3 CalcSpotLight(SpotLight light,vec3 normal,vec3 fragPos,vec3 viewDir){
  vec3 lightDir=normalize(light.position-fragPos);
  // diffuse shading
  float diff=max(dot(normal,lightDir),0.);
  // specualr
  vec3 reflectDir=reflect(-lightDir,normal);
  float spec=pow(max(dot(viewDir,reflectDir),0.),material.shininess);
  // attenuation
  float distance=length(light.position-fragPos);
  float attenuation=1./(light.constant+light.linear*distance+light.quadratic*(distance*distance));
  // spotlight intensity
  float theta=dot(lightDir,normalize(-light.direction));
  float epsilon=light.cutOff-light.outerCutOff;
  float intensity=clamp((theta-light.outerCutOff)/epsilon,0.,1.);
  // combine results
  vec3 ambient=light.ambient*vec3(texture(material.diffuse,TexCoords));
  vec3 diffuse=light.diffuse*diff*vec3(texture(material.diffuse,TexCoords));
  vec3 specular=light.specular*spec*vec3(texture(material.specular,TexCoords));
  ambient*=attenuation*intensity;
  diffuse*=attenuation*intensity;
  specular*=attenuation*intensity;
  return(ambient+diffuse+specular);
}