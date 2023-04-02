uniform sampler2D u_texture;
varying vec2 v_texCoord;

varying vec3 v_normal;
varying float v_lit;


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
    hsv = clamp(vec3(hueshift, 1.2, 0.8) * hsv, 0.0, 1.0);
    return vec4(hsv2rgb(hsv), color.a);
}

vec4 lighten(vec4 color)
{
    vec3 hsv = rgb2hsv(color.rgb);
    float hueshift = hsv[0] < 0.25 ? 1.1 : hsv[0] < 0.66 ? 0.9 : 0.5;
    hsv = clamp(vec3(hueshift, 0.9, 1.1) * hsv, 0.0, 1.0);
    return vec4(hsv2rgb(hsv), color.a);
}

void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    if (v_lit < 0.5) {
        color = darken(color);
    }
    if (v_lit > 0.5) {
        color = lighten(color);
    }
    gl_FragColor = color; //mix(color, light, 0.5);
}