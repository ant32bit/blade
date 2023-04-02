varying vec3 v_center;

void main() {

    float thickness = 1.0;

    vec3 afwidth = fwidth( v_center.xyz );
    vec3 edge3 = smoothstep( ( thickness - 1.0 ) * afwidth, thickness * afwidth, v_center.xyz );
    float edge = min( min( edge3.x, edge3.y ), edge3.z );

    gl_FragColor = vec4( edge, edge, edge, 1.0 );
}