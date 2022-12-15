precision   highp       float;
varying     float       v_TexIndex;
varying     vec2        v_TexCoord;
varying     vec3        v_LightColor;
uniform     float       u_Alpha;
uniform     int         u_TintMode;
uniform     vec4        u_Tint;
uniform     float       u_Contrast;
uniform     sampler2D   u_Samplers[15];
uniform     sampler2D   u_LightSampler;

vec4 sampler(int index, vec2 uv) {
  for (int i = 0; i < 15; i++) {
    if (i == index) {
      return texture2D(u_Samplers[i], uv);
    }
  }
}

vec3 getLightColor() {
  if (v_LightColor.z != -1.0) return v_LightColor;
  return texture2D(u_LightSampler, v_LightColor.xy).rgb * u_Contrast;
}

void main() {
  gl_FragColor = sampler(int(v_TexIndex), v_TexCoord);
  if (gl_FragColor.a == 0.0) {
    discard;
  }
  if (u_TintMode == 1) {
    gl_FragColor.rgb = gl_FragColor.rgb * (1.0 - u_Tint.a) + u_Tint.rgb +
    dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)) * u_Tint.a;
  }
  gl_FragColor.rgb *= getLightColor();
  gl_FragColor.a *= u_Alpha;
}
