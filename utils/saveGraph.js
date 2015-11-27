/**
 * This file reads file from a file created by dumpValueFile.py into ngraph.binary format
 * and initializes first level of positions for ngraph.offline.layout
 */
var saveGraph = require('ngraph.tobinary');
var fs = require('fs');
var path = require('path');
var outDir = path.join(__dirname, '..', 'data');
var buf = fs.readFileSync(path.join(__dirname, '..', 'out.count'));

var i = 0;
var graph = require('ngraph.graph')({uniqueLinkId: false});
var createModel = require('../src/lib/model.js');
var b = require('../src/lib/bijectiveEncode.js');
var encode = b.encode;
var decode = b.decode;
var arr = []

while (i < buf.length) {
  var x = buf.readInt32LE(i);
  i += 4;
  graph.addNode(i);
  arr.push(x);
}

var count = buf.length/4;
var model = createModel(arr);

var i = 0;
while (i < count) {
  var sequence = encode(i);
  var childIndex = decode(sequence + 'A') - 1;
  if (childIndex >= count) continue;

  graph.addLink(i, childIndex);
  graph.addLink(i, childIndex + 1);
  graph.addLink(i, childIndex + 2);
  graph.addLink(i, childIndex + 3);

  ++i;
}

saveInitialPositions();
saveGraph(graph, {outDir: outDir});

function saveInitialPositions() {
  var fname = path.join(outDir, '0.bin');
  var intSize = 4;
  var coordinatesPerRecord = 3;

  console.log("Saving: ", fname);
  var nodesLength = graph.getNodesCount();
  var buf = new Buffer(nodesLength * intSize * coordinatesPerRecord);
  var i = 0;

  graph.forEachNode(saveNode);

  fs.writeFileSync(fname, buf);

  function saveNode(node) {
      var idx = i * intSize * coordinatesPerRecord;
      var pos = model.nodeAt(i);

      buf.writeInt32LE(pos.x, idx);
      buf.writeInt32LE(pos.y, idx + 4);
      buf.writeInt32LE(pos.z, idx + 8);
      i++;
  }
}
