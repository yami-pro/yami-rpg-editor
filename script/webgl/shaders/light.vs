attribute   vec2        a_Position;
attribute   vec2        a_LightCoord;
uniform     mat3        u_Matrix;
varying     vec2        v_LightCoord;

void main() {
  gl_Position.xyw = u_Matrix * vec3(a_Position, 1.0);
  v_LightCoord = a_LightCoord;
}
