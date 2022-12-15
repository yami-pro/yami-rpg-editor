precision   highp       float;
varying     vec2        v_TexCoord;
varying     vec4        v_Color;
uniform     float       u_Alpha;
uniform     int         u_Mode;
uniform     vec4        u_Tint;
uniform     sampler2D   u_Sampler;

void main() {
  if (u_Mode == 0) {
    float alpha = texture2D(u_Sampler, v_TexCoord).a;
    gl_FragColor.a = alpha * v_Color.a * u_Alpha;
    if (gl_FragColor.a == 0.0) {
      discard;
    }
    gl_FragColor.rgb = v_Color.rgb;
    return;
  }
  if (u_Mode == 1) {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    gl_FragColor.a *= v_Color.a * u_Alpha;
    if (gl_FragColor.a == 0.0) {
      discard;
    }
    gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
    dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
    return;
  }
}
