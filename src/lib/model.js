export default createModel;
import {encode, decode} from './bijectiveEncode.js';

function createModel(array) {
  var api = {
    getCount,
    forEach,
    nodeAt
  }
  var boxWidth = 30 * 1024;
  var nodes = [];
  array.forEach(addNodeModel);

  return api;

  function nodeAt(idx) {
    return nodes[idx];
  }

  function getCount() {
    return array.length;
  }

  function forEach(cb) {
    nodes.forEach(cb);
  }

  function addNodeModel(frequency, index) {
    // Each point in the array represent a sequence of nucleobases as seen in the DNA
    // An ordinal index in the base 10 can be uniquely mapped to actual sequence
    // using bijective numeric system with base 4. This system doesn't have 0. Only
    // possible digits are A, C, G, T.
    // To summarize: Value represents counts of sequence appearance, index represents chain
    // case i % 4: 0 -> A, 1 -> C, 2 -> G, 3 -> T

    var sequence = encode(index + 1); // it's 1 based, not 0
    var level = sequence.length;
    var dx = 0, dy = 0, dz = 0;
    var r = boxWidth / Math.pow(2, level);
    var parentIdx = getParentIndex(sequence);
    var parent;
    if (parentIdx < 0) {
      parent = { x: 0, y: 0, z: 0 }
    } else {
      parent = nodes[parentIdx];
    }
    var angle = (index % 4) * Math.PI/2;
    dx = r * Math.cos(angle);
    dy = r * Math.sin(angle);

    var dimensionSwitch = level % 2;
    if (dimensionSwitch === 1) {
      dz = dy;
      dy = 0;
    }

    // var idxSwitch = index % 4;
    // if (idxSwitch === 0 || idxSwitch === 2) {
    //   dy = dx;
    //   dx = 0
    // }

    nodes.push({
      x: parent.x + dx,
      y: parent.y + dy,
      z: parent.z + dz,
      sequence,
      value: frequency,
      size: 512 * frequency/27954951
    });
  }
}

function getVerticalOffset(boxWidth, level) {
    var verticalOffset = 0;
    for (var i = 0; i < level; ++i) {
      var dx = boxWidth/Math.pow(4, i + 1);
      if (i % 2 === 0) {
        verticalOffset += dx;
      } else {
        verticalOffset -= dx;
      }
    }
    return verticalOffset
}

function getParentIndex(sequence) {
  if (sequence.length <= 1) {
    return -1;
  }
  return decode(sequence.substr(0, sequence.length - 1)) - 1;
}
