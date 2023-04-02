
uniform vec3 pointLightColor[NUM_POINT_LIGHTS];
uniform vec3 pointLightPosition[NUM_POINT_LIGHTS];
uniform float pointLightDistance[NUM_POINT_LIGHTS];

varying vec2 v_texCoord;

varying vec3 v_normal;
varying float v_lit;

void main() 
{ 
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);

    vec3 m_normal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
    vec3 m_pos = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vec4 addedLights = vec4(0.1, 0.1, 0.1, 1.0);
    for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
        vec3 lightDirection = normalize(m_pos - pointLightPosition[l]);
        addedLights.rgb += clamp(dot(-lightDirection, m_normal), 0.0, 1.0) * pointLightColor[l];
    }

    float intensity = clamp(dot(addedLights.xyz, m_normal), 0.0, 1.0);

    v_texCoord = uv;
    v_normal = m_normal;
    v_lit = intensity < 0.01 ? 0.0 : intensity < 0.17 ? 0.5 : 1.0;
}
