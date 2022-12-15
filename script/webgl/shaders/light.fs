precision   highp       float;
const       float       PI = 3.1415926536;
varying     vec2        v_LightCoord;
uniform     int         u_LightMode;
uniform     vec4        u_LightColor;
uniform     sampler2D   u_LightSampler;

vec3 computeLightColor() {
  if (u_LightMode == 0) {
    float dist = length(vec2(
      (v_LightCoord.x - 0.5),
      (v_LightCoord.y - 0.5)
    ));
    if (dist > 0.5) {
      discard;
    }
    float angle = dist * PI;
    float factor = mix(1.0 - sin(angle), cos(angle), u_LightColor.a);
    return u_LightColor.rgb * factor;
  }
  if (u_LightMode == 1) {
    vec4 lightColor = texture2D(u_LightSampler, v_LightCoord);
    if (lightColor.a == 0.0) {
      discard;
    }
    return u_LightColor.rgb * lightColor.rgb * lightColor.a;
  }
  if (u_LightMode == 2) {
    return u_LightColor.rgb;
  }
}

void main() {
  gl_FragColor = vec4(computeLightColor(), 1.0);
}
