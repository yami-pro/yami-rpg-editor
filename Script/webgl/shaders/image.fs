precision   highp       float;
varying     vec2        v_TexCoord;
varying     vec3        v_LightColor;
uniform     vec2        u_Viewport;
uniform     int         u_Masking;
uniform     float       u_Alpha;
uniform     int         u_ColorMode;
uniform     vec4        u_Color;
uniform     vec4        u_Tint;
uniform     vec4        u_Repeat;
uniform     float       u_Contrast;
uniform     sampler2D   u_Sampler;
uniform     sampler2D   u_MaskSampler;
uniform     sampler2D   u_LightSampler;

vec3 getLightColor() {
  if (v_LightColor.z != -1.0) return v_LightColor;
  return texture2D(u_LightSampler, v_LightColor.xy).rgb * u_Contrast;
}

void main() {
  if (u_ColorMode == 0) {
    gl_FragColor = texture2D(u_Sampler, fract(v_TexCoord));
    if (gl_FragColor.a == 0.0) discard;
    gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
    dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
  } else if (u_ColorMode == 1) {
    float alpha = texture2D(u_Sampler, v_TexCoord).a;
    if (alpha == 0.0) discard;
    gl_FragColor = vec4(u_Color.rgb, u_Color.a * alpha);
  } else if (u_ColorMode == 2) {
    vec2 uv = vec2(
      mod(v_TexCoord.x - u_Repeat.x, u_Repeat.z) + u_Repeat.x,
      mod(v_TexCoord.y - u_Repeat.y, u_Repeat.w) + u_Repeat.y
    );
    gl_FragColor = texture2D(u_Sampler, uv);
    if (gl_FragColor.a == 0.0) discard;
    gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
    dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
  }
  gl_FragColor.rgb *= getLightColor();
  gl_FragColor.a *= u_Alpha;
  if (u_Masking == 1) {
    vec2 fragCoord = vec2(gl_FragCoord.x, (u_Viewport.y - gl_FragCoord.y));
    gl_FragColor.a *= texture2D(u_MaskSampler, fragCoord / u_Viewport).a;
  }
}
