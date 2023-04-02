
uniform sampler2D u_color;
uniform sampler2D u_normals;
uniform sampler2D u_depths;
uniform vec2 u_pixelSize;
uniform float u_normalsAA;

varying vec2 v_texCoords;

const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 ); // y direction kernel


vec3 textureNrml(sampler2D normalMap, vec2 coords) 
{
    vec3 n = texture2D(normalMap, coords).rgb;
    return normalize(n * 2.0 - 1.0);
}

float textureDepth(sampler2D depthMap, vec2 coords)
{
    return texture2D(depthMap, coords).x;
}

vec3 sobel(sampler2D map, vec2 coords) 
{
    float w = u_pixelSize.x;
    float h = u_pixelSize.y;

    vec4 n[9];
	n[0] = texture2D(map, coords + vec2( -w, -h));
	n[1] = texture2D(map, coords + vec2(0.0, -h));
	n[2] = texture2D(map, coords + vec2(  w, -h));
	n[3] = texture2D(map, coords + vec2( -w, 0.0));
	n[4] = texture2D(map, coords);
	n[5] = texture2D(map, coords + vec2(  w, 0.0));
	n[6] = texture2D(map, coords + vec2( -w, h));
	n[7] = texture2D(map, coords + vec2(0.0, h));
	n[8] = texture2D(map, coords + vec2(  w, h));

	vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
  	vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
	vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));

    return 1.0 - sobel.xyz;
}

void main(void) 
{
    float threshold = 0.1;
	float gDepth = sobel(u_depths, v_texCoords).x;
    vec3 gNormals = clamp(sobel(u_normals, v_texCoords), 0.0, threshold);

	gl_FragColor = vec4(1.0 - gNormals.x, 1.0 - gNormals.y, 1.0 - gDepth, 1.0);
}
