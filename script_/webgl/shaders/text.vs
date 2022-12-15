attribute   vec2        a_Position;
attribute   vec2        a_TexCoord;
attribute   vec4        a_TextColor;
varying     vec2        v_TexCoord;
varying     vec4        v_TextColor;

void main() {
  gl_Position.xyw = vec3(a_Position, 1.0);
  v_TexCoord = a_TexCoord;
  v_TextColor = a_TextColor;
}
