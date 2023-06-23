#version 330

// Directional light
struct DirLight {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform DirLight dirLight;

struct Lamp {
    vec3 position;

    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

#define NR_LAMPS 4
uniform Lamp lamps[NR_LAMPS];

uniform vec4 uni_color;
out vec4 frag_color;


in vec3 Normal;
in vec3 FragPos;

vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir) {
    vec3 lightDir = normalize(-light.direction);

    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);

    // Specular
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);

    vec3 ambient = light.ambient;
    vec3 diffuse = light.diffuse * diff;
    vec3 specular = light.specular * spec;
    return (ambient + diffuse + specular);
}

vec3 CalcLamp(Lamp lamp, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(lamp.position - fragPos);

    // Diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);

    // Specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 3072.0);

    // Attenuation
    float distance = length(lamp.position - fragPos);
    float attenuation = 1.0 / (lamp.constant + lamp.linear * distance +
    lamp.quadratic * (distance * distance));

    // Combine results
    vec3 ambient = lamp.ambient;
    vec3 diffuse = lamp.diffuse * diff;
    vec3 specular = lamp.specular * spec;
    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}

void main() {
    // Properties
    vec3 normal = normalize(Normal);
    vec3 viewDir = normalize(-FragPos); // Assuming the camera is at the origin (0, 0, 0)

    // Directional Light
    vec3 result = CalcDirLight(dirLight, normal, viewDir);

    // Lamps
    for (int i = 0; i < NR_LAMPS; i++) {
        result += CalcLamp(lamps[i], normal, FragPos, viewDir);
    }

    frag_color = vec4(result * vec3(uni_color), 1.0);
}
