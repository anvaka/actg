import THREE from 'three';
import fly from 'three.fly';
import getNearestIndex from './getNearestIndex.js';
import { encode, decode } from './bijectiveEncode.js';
import createSliceView from './createSliceView.js';
import config from '../../config.js';
import bus from '../bus.js';

export default createStage;

var WIDTH = config.boxSize;

function createStage(model) {
  var camera, renderer, scene, controls, geometry, uniforms;
  var positions, hitTest, sizes, lines;

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

    renderer.setSize(window.innerWidth, window.innerHeight);

    var container = document.getElementById('three-root');
    container.appendChild(renderer.domElement);

    controls = fly(camera, container, THREE);
    camera.position.z = 0;
    camera.position.x = 0;
    camera.position.y = 0;

    adjustMovementSpeed(controls, camera);


    var subtrees = getSubtrees();
    buildCubeFromSubtrees(subtrees);
    listenToHighlightEvents(subtrees);

    window.addEventListener('resize', onWindowResize, false);
  }

  function listenToHighlightEvents(subtrees) {
    bus.on('highlight', updateHighlight);

    function updateHighlight(sequence) {
      subtrees.aView.clearHighlight();
      subtrees.cView.clearHighlight();
      subtrees.tView.clearHighlight();
      subtrees.gView.clearHighlight();

      if (sequence) {
        // route highlight request to proper subtrek
        var treeName = sequence[0].toLowerCase() + 'View';
        subtrees[treeName].highlight(sequence);
      }
    }
  }

  function buildCubeFromSubtrees(subtrees) {
    // We create a box of A, C, T and G slices
    subtrees.aView = createSliceView(subtrees.A, scene, 'A');
    var aView = subtrees.aView.getSlice();
    aView.position.z = WIDTH;
    aView.position.x = -WIDTH / 2;

    subtrees.cView = createSliceView(subtrees.C, scene, 'C');
    var cView = subtrees.cView.getSlice();
    cView.rotation.y = Math.PI / 2;
    cView.position.y = -WIDTH / 2;
    cView.position.x = WIDTH;

    subtrees.gView = createSliceView(subtrees.G, scene, 'G');
    var gView = subtrees.gView.getSlice();
    gView.position.x = WIDTH / 2;
    gView.position.z = -WIDTH;

    subtrees.tView = createSliceView(subtrees.T, scene, 'T');
    var tView = subtrees.tView.getSlice();
    tView.rotation.y = Math.PI / 2;
    tView.position.x = -WIDTH;
    tView.position.y = WIDTH / 2;
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

  function reportMouseOver(e) {
    var nearestIndex = getNearestIndex(positions, e.indexes, e.ray, 30);
    if (lastHovered === nearestIndex) return;
    lastHovered = nearestIndex;
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

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function adjustMovementSpeed(controls, camera) {
    // var absZ = Math.abs(camera.position.z);
    // var z = Math.min(absZ, 5700);
    // var speed = Math.max(0.1, z / 57);
    // controls.movementSpeed = speed;
    controls.movementSpeed = 10;
  }

  function getCameraUniform() {
    return new THREE.Vector3(camera.aspect, window.innerWidth, window.innerHeight);
  }
}

