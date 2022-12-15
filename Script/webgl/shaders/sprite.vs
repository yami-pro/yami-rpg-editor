attribute   vec2        a_Position;
attribute   vec2        a_TexCoord;
attribute   vec3        a_TexParam;
attribute   vec4        a_Tint;
attribute   vec2        a_LightCoord;
uniform     float       u_Flip;
uniform     mat3        u_Matrix;
uniform     float       u_Contrast;
uniform     vec4        u_LightTexSize;
uniform     sampler2D   u_LightSampler;
varying     float       v_TexIndex;
varying     float       v_Opacity;
varying     vec4        v_Tint;
varying     vec2        v_TexCoord;
varying     vec3        v_LightColor;

vec3 getLightColor() {
  if (a_TexParam.z == 0.0) {
    return vec3(1.0, 1.0, 1.0);
  }
  if (a_TexParam.z == 1.0) {
    return vec3(
      gl_Position.x / u_LightTexSize.x + u_LightTexSize.z,
      gl_Position.y / u_LightTexSize.y * u_Flip + u_LightTexSize.w,
      -1.0
    );
  }
  if (a_TexParam.z == 2.0) {
    return texture2D(u_LightSampler, a_LightCoord).rgb * u_Contrast;
  }
}

void main() {
  gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
  v_TexIndex = a_TexParam.x;
  v_Opacity = a_TexParam.y / 255.0;
  v_Tint = a_Tint / 255.0 - 1.0;
  v_TexCoord = a_TexCoord;
  v_LightColor = getLightColor();
}
