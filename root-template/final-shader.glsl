
uniform sampler2D u_color;
uniform sampler2D u_light;
uniform sampler2D u_normals;
uniform sampler2D u_depths;

uniform vec2 u_pixelSize;
uniform float u_normalsAA;
uniform float u_depthsAA;

varying vec2 v_pixel;

const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 ); // y direction kernel

const float shadow = 0.35;
const float glare = 0.99;

vec3 normal(vec2 coords) 
{
    vec3 n = texture2D(u_normals, coords).xyz;
    return normalize(n * 2.0 - 1.0);
}

float depth(vec2 coords)
{
    return texture2D(u_depths, coords).x;
}

float light(vec2 coords)
{
    return texture2D(u_light, coords).x;
}

vec4 color(vec2 coords)
{
    return texture2D(u_color, coords);
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 darken(vec4 color)
{
    vec3 hsv = rgb2hsv(color.rgb);
    float hueshift = hsv[0] < 0.25 ? 0.2 : hsv[0] < 0.5 ? 0.7 : 1.2;
    hsv = clamp(vec3(hueshift, 0.9, 0.8) * hsv, 0.0, 1.0);
    return vec4(hsv2rgb(hsv), color.a);
}

vec4 brighten(vec4 color)
{
    vec3 hsv = rgb2hsv(color.rgb);
    float hueshift = hsv[0] < 0.25 ? 1.1 : hsv[0] < 0.66 ? 0.9 : 0.5;
    hsv = clamp(vec3(hueshift, 0.9, 1.1) * hsv, 0.0, 1.0);
    return vec4(hsv2rgb(hsv), color.a);
}

float edginess(vec3 normalA, vec3 normalB)
{
    return clamp(
        abs(
            dot(normalA,normalB) - 1.0
        ), 
    0.0, 1.0);
}

bool isEdge(vec2 coords) 
{
    float centreDepth = depth(coords);
    vec3 centreNormal = normal(coords);
    vec2 d = u_pixelSize;
    
    float threshold = 0.6;

    vec2 testCoords = vec2(coords.x, coords.y + d.y);
    if (depth(testCoords) < centreDepth && edginess(centreNormal, normal(testCoords)) > threshold)
        return true;
    testCoords = vec2(coords.x + d.x, coords.y);
    if (depth(testCoords) < centreDepth && edginess(centreNormal, normal(testCoords)) > threshold)
        return true;
    testCoords = vec2(coords.x, coords.y - d.y);
    if (depth(testCoords) < centreDepth && edginess(centreNormal, normal(testCoords)) > threshold)
        return true;
    testCoords = vec2(coords.x - d.x, coords.y);
    if (depth(testCoords) < centreDepth && edginess(centreNormal, normal(testCoords)) > threshold)
        return true;

    return false;
}

void main(void) 
{
    vec4 c = color(v_pixel); // color value

    bool d = false; // darken
    bool b = false; // brighten

    if (isEdge(v_pixel)) 
    {
        d = true;
    }
    else 
    {
        float l = light(v_pixel); // light value

        if (l > 0.0)
        {
            d = l < shadow;
            b = l > glare;
        }
    }

    gl_FragColor = d ? darken(c) : b ? brighten(c) : c;
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

void test(void)
{
    vec3 a = normalize(normal(v_pixel));
    vec3 b = normalize(normal(v_pixel + u_pixelSize));
    gl_FragColor = isEdge(v_pixel) ? vec4(0.0, 0.0, 0.0, 1.0) : brighten(color(v_pixel));
    // float threshold = 0.1;
	// float gDepth = sobel(u_depths, v_pixel).x;
    // vec3 gNormals = clamp(sobel(u_normals, v_pixel), 0.0, threshold);

	// gl_FragColor = vec4(1.0 - gNormals.x, 1.0 - gNormals.y, 1.0 - gDepth, 1.0);
}
