const assert = require('assert');
const evaParser = require('../parser/evalParser.js');

function test(eva, code, expected) {
    const exp = evaParser.parse(code);
    assert.strictEqual(eva.eval(exp), expected)
};

module.exports = {
    test,
};
