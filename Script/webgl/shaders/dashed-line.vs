attribute   vec2        a_Position;
attribute   float       a_Distance;
uniform     mat3        u_Matrix;
varying     float       v_Distance;

void main() {
  gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
  v_Distance = a_Distance;
}
