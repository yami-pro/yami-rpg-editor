precision   highp       float;
varying     vec2        v_TexCoord;
varying     vec4        v_TextColor;
uniform     float       u_Alpha;
uniform     float       u_Threshold;
uniform     sampler2D   u_Sampler;

void main() {
  float texAlpha = texture2D(u_Sampler, v_TexCoord).a;
  if (texAlpha == 0.0 || texAlpha < u_Threshold) {
    discard;
  }
  gl_FragColor.rgb = v_TextColor.rgb;
  gl_FragColor.a = u_Threshold == 0.0
  ? v_TextColor.a * u_Alpha * texAlpha
  : v_TextColor.a * u_Alpha;
}
