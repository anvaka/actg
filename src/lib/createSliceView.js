/**
 * Represents one of the four trees.
 */
export default createSliceView;

import legend from './legend.js';
import THREE from 'three';
import {VertexShader, FragmentShader} from './shaders/particle.js';
import createHitTest from './hit-test.js';

function createSliceView(nodes) {
  var uniforms = {
    size: {
      type: 'f',
      value: null
    }
  };

  var shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
  });

  var particlesCount = nodes.length;
  var geometry = new THREE.BufferGeometry();
  var positions = new Float32Array(particlesCount * 3);
  var colors = new Float32Array(particlesCount * 3);
  var sizes = new Float32Array(particlesCount);

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

  var particleSystem = new THREE.Points(geometry, shaderMaterial);
  particleSystem.frustumCulled = false;

  setNodes();

    // hitTest = createHitTest(particleSystem, container, controls);
    // hitTest.on('over', reportMouseOver);

  return particleSystem;

  function setNodes() {
    var i = 0;
    nodes.forEach(setNode);

    function setNode(node) {
      var idx = i * 3;
      positions[idx] = node.x;
      positions[idx + 1] = node.y;
      positions[idx + 2] = node.z;
      sizes[i] = node.size;
      var c = node.sequence[node.sequence.length - 1];
      var color = legend[c];
      setColor(idx, color.r, color.g, color.b);
      i += 1;
    }
  }

  function setColor(idx, r, g, b) {
    colors[idx] = r;
    colors[idx + 1] = g;
    colors[idx + 2] = b;
  }

}
