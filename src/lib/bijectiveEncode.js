var ALPHABET = "ACGT";
var base = ALPHABET.length;

export {
  encode,
  decode
}

function encode(i) {
    if (i === 0) return '';
    var s = '';

    while (i > 0) {
      var q1 = Math.ceil(i/base) - 1;
      s = ALPHABET[(i - base * q1) - 1] + s;
      i = q1;
    }

    return s;
}

function decode(s) {
  if (!s) return 0;
  var number = 0;
  var k = 1;
  for (var i = s.length; i > -1; --i) {
    var dx = ALPHABET.indexOf(s[i - 1]) + 1;
    number += dx * k;
    k *= base;
  }
  return number;
}
