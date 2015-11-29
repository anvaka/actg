import THREE from 'three';
import fly from 'three.fly';
import getNearestIndex from './getNearestIndex.js';
import {encode, decode} from './bijectiveEncode.js';
import createSliceView from './createSliceView.js';

export default createStage;

function createStage(model) {
  var camera, renderer, scene, controls, geometry, uniforms;
  var positions, hitTest, sizes, lines;

  var lastLineIndex = 0;
  var lastHovered;
  init();
  requestAnimationFrame(render);

  var api = {};

  return api;

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    //hitTest.update(scene, camera);
    controls.update(1);
    adjustMovementSpeed(controls, camera);
  }

  function init() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);

    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);

    var container = document.getElementById('three-root');
    container.appendChild(renderer.domElement);

    controls = fly(camera, container, THREE);
    camera.position.z = 1500;
    camera.position.x = 200;
    camera.position.y = 200;

    adjustMovementSpeed(controls, camera);


    var subtrees = getSubtrees();
    var ASlice = createSliceView(subtrees.A);
    scene.add(ASlice);

    var CSlice = createSliceView(subtrees.C);
    scene.add(CSlice);

    var GSlice = createSliceView(subtrees.G);
    scene.add(GSlice);

    var TSlice = createSliceView(subtrees.T);
    scene.add(TSlice);
    window.A = ASlice;
    window.C = CSlice;
    window.G = GSlice;
    window.T = TSlice;
    window.addEventListener('resize', onWindowResize, false);
  }

  function getSubtrees() {
    var subtrees = {
      A: [],
      C: [],
      G: [],
      T: []
    };

    model.reduce((prevValue, current) => {
      var sequenceStart = current.sequence[0];
      prevValue[sequenceStart].push(current)

      return prevValue;
    }, subtrees);

    return subtrees;
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
    var absZ = Math.abs(camera.position.z);
    var z = Math.min(absZ, 5700);
    var speed = Math.max(0.1, z / 57);
    controls.movementSpeed = speed;
  }

  function getCameraUniform() {
    return new THREE.Vector3(camera.aspect, window.innerWidth, window.innerHeight);
  }
}
