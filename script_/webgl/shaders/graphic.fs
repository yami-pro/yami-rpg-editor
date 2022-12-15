precision   highp       float;
varying     vec4        v_Color;
uniform     float       u_Alpha;

void main() {
  gl_FragColor.rgb = v_Color.rgb;
  gl_FragColor.a = v_Color.a * u_Alpha;
}
