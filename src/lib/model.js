module.exports = createModel;

var boxWidth = 1024;
var b = require('./bijectiveEncode.js');
var encode = b.encode;
var decode = b.decode;

function createModel(array) {
  var api = {
    getCount,
    forEach,
    nodeAt
  }

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
    var model = getNodeModel(frequency, index, boxWidth);
    nodes.push(model);
  }

  /**
  * Converts chain frequency into graph node with position on the screen
  *
  * @param {Number} frequency of the chain occurrence
  * @param {Number} index of the frequency in the encoded file
  */
  function getNodeModel(frequency, index, boxWidth) {
    var sequence = encode(index + 1); // it's 1 based, not 0
    var level = sequence.length;
    var dx = 0, dy = 0, dz = 0;
    var r = boxWidth / Math.pow(2, level);
    var parentIdx = getParentIndex(sequence);
    var parent;
    if (parentIdx < 0) {
      parent = { x: 0, y: 0, z: 0 };
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

    return {
      x: parent.x + dx,
      y: parent.y + dy,
      z: parent.z + dz,
      sequence: sequence,
      value: frequency,
      size: Math.min(32, 32 * frequency/954951)
    };
  }

  function getParentIndex(sequence) {
    if (sequence.length <= 1) {
      return -1;
    }
    return decode(sequence.substr(0, sequence.length - 1)) - 1;
  }
}

