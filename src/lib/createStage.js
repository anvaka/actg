import THREE from 'three';
import fly from 'three.fly';
import {VertexShader, FragmentShader} from './shaders/particle.js';
import createHitTest from './hit-test.js';
import getNearestIndex from './getNearestIndex.js';
import {encode, decode} from './bijectiveEncode.js';
export default createStage;

function createStage(model) {
  var camera, renderer, scene, controls, geometry, uniforms;
  var positions, colors, hitTest, sizes, lines;

  var lastLineIndex = 0;
  var lastHovered;
  init();
  requestAnimationFrame(render);

  var api = {};

  return api;

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    hitTest.update(scene, camera);
    controls.update(1);
    adjustMovementSpeed(controls, camera);
  }

  function init() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000);
    scene = new THREE.Scene();

    uniforms = {
      size: {
        type: 'f',
        value: null
      },
    };

    var shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    var particles = model.getCount();

    // Nodes
    geometry = new THREE.BufferGeometry();
    positions = new Float32Array(particles * 3);
    colors = new Float32Array(particles * 3);
    sizes = new Float32Array(particles);

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

    var particleSystem = new THREE.Points(geometry, shaderMaterial);
    particleSystem.frustumCulled = false;

    // Lines
    lines = new Float32Array(2 * 6 * (particles - 1));
    var linesGeometry = new THREE.BufferGeometry();
    var lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    });

    linesGeometry.addAttribute('position', new THREE.BufferAttribute(lines, 3));
    var edgeMesh = new THREE.Line(linesGeometry, lineMaterial, THREE.LinePieces);
    edgeMesh.frustumCulled = false;
    scene.add(edgeMesh);
    scene.add(particleSystem);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);

    var container = document.getElementById('three-root');
    container.appendChild(renderer.domElement);
    controls = fly(camera, container, THREE);
    camera.position.z = 5700;
    camera.position.x = 1700;
    camera.position.y = 1800;
    adjustMovementSpeed(controls, camera);
    hitTest = createHitTest(particleSystem, container, controls);
    hitTest.on('over', reportMouseOver);

    window.addEventListener('resize', onWindowResize, false);
    addParticles();
    addConnections();
  }

  function addParticles() {
    model.forEach(setNode);
  }

  function addConnections() {
    //model.forEach(setConnection);
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


  function setNode(node, i) {
    var idx = i * 3;
    positions[idx] = node.x;
    positions[idx + 1] = node.y;
    positions[idx + 2] = node.z;
    sizes[i] = node.size;
    var c = node.sequence[node.sequence.length - 1]
    switch (c) {
      case 'A': setColor(idx, 0xFF, 0x6B, 0x6B); break;
      case 'C': setColor(idx, 0xFF, 0xAE, 0x6B); break;
      case 'G': setColor(idx, 0x4E, 0xBA, 0xBA); break;
      case 'T': setColor(idx, 0x5C, 0xDD, 0x5C); break;
    }
  }

  function setColor(idx, r, g, b) {
    colors[idx] = r;
    colors[idx + 1] = g;
    colors[idx + 2] = b;
  }

  function reportMouseOver(e) {
    var nearestIndex = getNearestIndex(positions, e.indexes, e.ray, 30);
    if (lastHovered === nearestIndex) return;
    lastHovered = nearestIndex;
    // each node has three coordinages.
    var modelIndex = lastHovered === undefined ? undefined: lastHovered/3;

    dispatch({
      type: 'hover',
      data: {
        index: modelIndex,
        x: e.x,
        y: e.y
      }
    });
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function adjustMovementSpeed(controls, camera) {
    // var absZ = Math.abs(camera.position.z);
    // var z = Math.min(absZ, 5700);
    // var speed = Math.max(0.1, z / 57);
    controls.movementSpeed = 100;
  }
}
