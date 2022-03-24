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

module.exports = Eva;
