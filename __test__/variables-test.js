const assert = require('assert');

module.exports = eva => {
    assert.strictEqual(eva.eval(['var', 'x', 5]), 5)
    assert.strictEqual(eva.eval('x'), 5)
    assert.strictEqual(eva.eval('VERSION'), '0.1')
    assert.strictEqual(eva.eval(['var', 'isUser', 'true']), true)
};