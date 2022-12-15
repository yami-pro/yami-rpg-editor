attribute   vec2        a_Position;
attribute   vec4        a_Color;
uniform     mat3        u_Matrix;
varying     vec4        v_Color;

void main() {
  gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
  v_Color = a_Color;
}
