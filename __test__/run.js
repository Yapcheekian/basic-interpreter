const Eva = require('../eva');
const Environment = require('../Environment');

const tests = [
    require('./self-eval-test.js'),
    require('./math-test.js'),
    require('./variables-test.js'),
    require('./block-test.js'),
    require('./if-test.js'),
    require('./while-test.js'),
    require('./built-in-function-test.js'),
    require('./user-defined-function-test.js'),
    require('./lambda-function-test.js'),
    require('./switch-test.js'),
    require('./class-test.js')
];

const eva = new Eva();

tests.forEach(test => { test(eva) });

eva.eval(['print', '"hello"', '"world"']);

console.log('All assertions passed!')
