/**
 * Represents one of the four trees.
 */
export default createSliceView;

import legend from './legend.js';
import THREE from 'three';
import {VertexShader, FragmentShader} from './shaders/particle.js';
import createHitTest from './createHitTest.js';
import getNearestIndex from './getNearestIndex.js';
import makeTextSprite from './makeTextSprite.js';

function createSliceView(nodes, scene, controls, name) {
  var uniforms = {
    size: {
      type: 'f',
      value: null
    }
  };

  var lastHovered;
  var edgeMesh;
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

  var hitTest = createHitTest(particleSystem, controls);
  hitTest.on('over', reportMouseOver);

  var slice = new THREE.Group();
  slice.add(makeTextSprite(name, legend[name]));
  slice.add(particleSystem);
  scene.add(slice);

  return {
    getSlice,
    clearHighlight,
    highlight,
    hit
  };

  function getSlice() {
    return slice;
  }

  function clearHighlight() {
    if (edgeMesh) {
      slice.remove(edgeMesh);
      edgeMesh = null
    }
  }

  function highlight(sequence) {
    clearHighlight();
    if (sequence.length < 2) return;

    var lines = new Float32Array(2 * 6 * (sequence.length - 1));
    var linesGeometry = new THREE.BufferGeometry();
    var lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    });

    linesGeometry.addAttribute('position', new THREE.BufferAttribute(lines, 3));
    edgeMesh = new THREE.Line(linesGeometry, lineMaterial, THREE.LinePieces);
    edgeMesh.frustumCulled = false;
    slice.add(edgeMesh);

    var lastLineIndex = 0;
    var fromIndex = 0;
    for (var i = 1; i < sequence.length; ++i) {
      var to = getChildIndex(fromIndex, sequence[i]);
      if (!to) break;
      var fromNode = nodes[fromIndex];
      var toNode = nodes[to];
      fromIndex = to;
      drawLine(fromNode, toNode);
    }

    function drawLine(from, to) {
      var idx = lastLineIndex;
      lines[idx] = from.x;
      lines[idx + 1] = from.y;
      lines[idx + 2] = 0;

      lines[idx + 3] = to.x;
      lines[idx + 4] = to.y;
      lines[idx + 5] = 0;
      lastLineIndex = idx + 6;
    }
  }

  function getChildIndex(from, letter) {
    var pattern = nodes[from].sequence + letter;
    for (var i = from + 1; i < nodes.length; ++i) {
      if (nodes[i].sequence === pattern) {
        return i;
      }
    }
  }

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

  function setConnection(node, i) {
    var sequence = node.sequence;
    var childIndex = decode(sequence + 'A') - 1;
    if (childIndex >= model.getCount()) {
      return;
    }
    var idx = lastLineIndex;
    for (var i = 0; i < 4; ++i) {
      lines[idx] = node.x;
      lines[idx + 1] = node.y;
      lines[idx + 2] = node.z;

      var childNode = model.nodeAt(childIndex);
      lines[idx + 3] = childNode.x;
      lines[idx + 4] = childNode.y;
      lines[idx + 5] = childNode.z;
      idx += 6;
      childIndex += 1;
    }
    lastLineIndex = idx;
  }

  function hit(scene, camera) {
    hitTest.update(scene, camera);
  }

  function reportMouseOver(e) {
    var nearestIndex = getNearestIndex(positions, e.indexes, e.ray, 30);
    if (lastHovered === nearestIndex) return;
    lastHovered = nearestIndex;
    debugger;
    // each node has three coordinages.
    var modelIndex = lastHovered === undefined ? undefined : lastHovered / 3;

    dispatch({
      type: 'hover',
      data: {
        index: modelIndex,
        x: e.x,
        y: e.y
      }
    });
  }
}
