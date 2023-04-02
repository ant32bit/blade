precision highp float;

varying vec2 v_texCoord;
uniform sampler2D u_texture;

void main(void) {
    vec2 texCoord = fract(v_texCoord);
    
    vec4 color = texture2D(u_texture, texCoord);
    gl_FragColor = color;
}