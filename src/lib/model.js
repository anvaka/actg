module.exports = createModel;

var boxWidth = 1024;
var b = require('./bijectiveEncode.js');
var encode = b.encode;
var decode = b.decode;

function createModel(array) {
  var api = {
    getCount,
    forEach,
    reduce
  }

  var tree = new Map();
  array.forEach(addNodeModel);

  return api;

  function reduce(reducer, initialValue) {
    tree.forEach(visit);

    function visit(v, k) {
      initialValue = reducer(initialValue, v);
    }
  }

  function getCount() {
    return tree.size;
  }

  function forEach(cb) {
    tree.forEach(function (v, k) {
      cb(v);
    })
  }

  function addNodeModel(frequency, index) {
    var model = getNodeModel(frequency, index, boxWidth);
    if (model) {
      tree.set(model.sequence, model);
    }
  }

  /**
  * Converts chain frequency into graph node with position on the screen
  *
  * @param {Number} frequency of the chain occurrence
  * @param {Number} index of the frequency in the encoded file
  */
  function getNodeModel(frequency, index, boxWidth) {
    if (frequency === 0) return;

    var sequence = encode(index + 1); // it's 1 based, not 0

    var level = sequence.length;
    var dx = 0, dy = 0, dz = 0;
    var r = boxWidth / Math.pow(2, level);
    var parent;
    if (level === 1) { // we are at the root
      parent = { x: 0, y: 0 };
    } else {
      parent = tree.get(sequence.substr(0, sequence.length - 1));
    }

    var angle = (index % 4) * Math.PI/2;
    dx = r * Math.cos(angle);
    dy = r * Math.sin(angle);

    return {
      x: parent.x + dx,
      y: parent.y + dy,
      z: 0,
      sequence: sequence,
      value: frequency,
      size: Math.min(32, 32 * frequency/954951)
    };
  }
}

