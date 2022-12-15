precision   highp       float;
const       float       REPEAT = 4.0;
varying     float       v_Distance;
uniform     float       u_Alpha;
uniform     vec4        u_Color;

void main() {
  float alpha = floor(2.0 * fract(v_Distance / REPEAT));
  gl_FragColor.rgb = u_Color.rgb;
  gl_FragColor.a = u_Color.a * alpha * u_Alpha;
}
