const assert = require('assert');

module.exports = eva => {
    assert.strictEqual(eva.eval(['+', 5, 5]), 10)
    assert.strictEqual(eva.eval(['+', ['+', 5, 5], 5]), 15)
    assert.strictEqual(eva.eval(['+', ['*', 5, 5], 5]), 30)
};
