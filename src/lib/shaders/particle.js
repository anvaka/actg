let FragmentShader = `

varying vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor, 1.0);
}`;


let VertexShader = `
attribute vec3 color;
attribute float size;
varying vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = size * ( 351.0 / length( mvPosition.xyz ) );
  gl_Position = projectionMatrix * mvPosition;
}`;

export default {
  VertexShader,
  FragmentShader
};
