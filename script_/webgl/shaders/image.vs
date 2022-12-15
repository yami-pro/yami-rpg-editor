attribute   vec2        a_Position;
attribute   vec2        a_TexCoord;
uniform     float       u_Flip;
uniform     mat3        u_Matrix;
uniform     vec3        u_Ambient;
uniform     float       u_Contrast;
uniform     int         u_LightMode;
uniform     vec2        u_LightCoord;
uniform     vec4        u_LightTexSize;
uniform     sampler2D   u_LightSampler;
varying     vec2        v_TexCoord;
varying     vec3        v_LightColor;

vec3 getLightColor() {
  if (u_LightMode == 0) {
    return vec3(1.0, 1.0, 1.0);
  }
  if (u_LightMode == 1) {
    return vec3(
      gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
      gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
      -1.0
    );
  }
  if (u_LightMode == 2) {
    vec2 anchorCoord = (u_Matrix * vec3(u_LightCoord, 1.0)).xy;
    vec2 lightCoord = vec2(
      anchorCoord.x / u_LightTexSize.x + u_LightTexSize.z,
      anchorCoord.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w
    );
    return texture2D(u_LightSampler, lightCoord).rgb * u_Contrast;
  }
  if (u_LightMode == 3) {
    return u_Ambient * u_Contrast;
  }
}

void main() {
  gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
  v_TexCoord = a_TexCoord;
  v_LightColor = getLightColor();
}
