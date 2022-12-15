attribute   vec2        a_Position;
attribute   vec2        a_TexCoord;
attribute   vec4        a_Color;
uniform     mat3        u_Matrix;
varying     vec2        v_TexCoord;
varying     vec4        v_Color;

void main() {
  gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
  v_TexCoord = a_TexCoord;
  v_Color = a_Color;
}
