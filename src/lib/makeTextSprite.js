var THREE = require('three');
var fontUtils = require('./fontUtils.js');
var typeface = require('three.regular.helvetiker');
fontUtils.loadFace(typeface);

module.exports = makeTextSprite;

function makeTextSprite(message, color) {
  var textMaterial = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
    wireframe: false
  });

  var options = {
    size: 180,
    height: 20,
    curveSegments: 2,
    font: 'helvetiker',
    bevelEnabled: false
  }

  var textShapes = THREE.FontUtils.generateShapes(message, options);

  var text3d = new THREE.ShapeGeometry(textShapes);
  text3d.computeBoundingBox();

  return new THREE.Mesh(text3d, textMaterial);
}
