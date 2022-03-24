const assert = require('assert');
const Environment = require('./Environment');

class Eva {
    /*
    Create an eva instance with a global environment
    */
    constructor(global = new Environment()) {
        this.global = global;
    }

    eval(exp, env = this.global) {
        if (isNumber(exp)) {
            return exp;
        }

        if (isString(exp)) {
            return exp.slice(1,-1); 
        }

        // ---------------------------------
        // Math operations:
        if (exp[0] === '+') {
            return this.eval(exp[1], env) + this.eval(exp[2], env);
        }

        if (exp[0] === '*') {
            return this.eval(exp[1], env) * this.eval(exp[2], env);
        }

        // ---------------------------------
        // Variable declaration:
        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }

        // ---------------------------------
        // Variable update:
        if (exp[0] === 'set') {
            const [_, name, value] = exp;
            return env.assign(name, this.eval(value, env));
        }

        // ---------------------------------
        // Variable access:
        if (isVariableName(exp)) {
            return env.lookup(exp);
        }

        // ---------------------------------
        // Block: sequence of expressions
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        throw `Unimplemented ${JSON.stringify(exp)}`;
    }

    _evalBlock(exp, env) {
        let result;

        const [_tag, ...expressions] = exp;

        expressions.forEach(exp => {
            result = this.eval(exp, env)
        });

        return result;
    }
}

function isNumber(exp) {
    return typeof exp === 'number';
}

function isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

function isVariableName(exp) {
    return typeof exp === 'string' && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(exp)
}

// --------------------
// Tests
const eva = new Eva(new Environment({
    null: null,

    true: true,
    false: false,

    VERSION: '0.1'
}));

assert.strictEqual(eva.eval(1), 1)
assert.strictEqual(eva.eval('"hello"'), 'hello')

// Math:
assert.strictEqual(eva.eval(['+', 5, 5]), 10)
assert.strictEqual(eva.eval(['+', ['+', 5, 5], 5]), 15)
assert.strictEqual(eva.eval(['+', ['*', 5, 5], 5]), 30)

// Variables:
assert.strictEqual(eva.eval(['var', 'x', 5]), 5)
assert.strictEqual(eva.eval('x'), 5)
assert.strictEqual(eva.eval('VERSION'), '0.1')
assert.strictEqual(eva.eval(['var', 'isUser', 'true']), true)

// Blocks:
assert.strictEqual(eva.eval(
    ['begin',
        ['var', 'x', 10],
        ['var', 'y', 20],
        ['+', ['*', 'x', 'y'], 30]
    ]
), 230)

assert.strictEqual(eva.eval(
    ['begin',

        ['var', 'x', 10],

        ['begin',
            ['var', 'x', 20],
            'x'
        ],

        'x'
    ]
), 10)

assert.strictEqual(eva.eval(
    ['begin',

        ['var', 'value', 10],

        ['var', 'result', ['begin',
            ['var', 'x', ['+', 'value', 10]],
            'x'
        ]],

        'result'
    ]
), 20)

assert.strictEqual(eva.eval(
    ['begin',

        ['var', 'data', 10],

        ['begin',
            ['set', 'data', 20],
            'x'
        ],

        'data'
    ]
), 20)

console.log('All assertions passed!')
