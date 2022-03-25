const Environment = require('./Environment');
const Transformer = require('./transform/Transformer');

class Eva {
    /*
    Create an eva instance with a global environment
    */
    constructor(global = GlobalEnvironment) {
        this.global = global;
        this._transformer = new Transformer();
    }

    eval(exp, env = this.global) {
        if (this._isNumber(exp)) {
            return exp;
        }

        if (this._isString(exp)) {
            return exp.slice(1,-1); 
        }

        // ---------------------------------
        // Class declaration: (class <Name> <Parent> <Body>)
        if (exp[0] === 'class') {
            const [_tag, name, parent, body] = exp;

            const parentEnv = this.eval(parent, env) || env;

            const classEnv = new Environment({}, parentEnv);

            this._evalBody(body, classEnv)

            return env.define(name, classEnv);
        }

        // ---------------------------------
        // Class instatiation: (new <Class> <Arguments>...)
        if (exp[0] === 'new') {
            const classEnv = this.eval(exp[1], env);

            const instanceEnv = new Environment({}, classEnv);

            const args = exp.slice(2).map(arg => this.eval(arg, env));

            this._callUserDefinedFunction(
                classEnv.lookup('constructor'),
                [instanceEnv, ...args]
            )

            return instanceEnv;
        }

        // ---------------------------------
        // Property access: (prop <instance> <name>)
        if (exp[0] === 'prop') {
            const [_tag, instance, name] = exp;

            const instanceEnv = this.eval(instance, env);

            return instanceEnv.lookup(name);
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
            const [_, ref, value] = exp;

            // Assignment to property
            if (ref[0] === 'prop') {
                const [_tag, instance, propName] = ref;
                const instanceEnv = this.eval(instance, env);

                return instanceEnv.define(
                    propName,
                    this.eval(value, env)
                );
            }

            // Simple assignment
            return env.assign(ref, this.eval(value, env));
        }

        // ---------------------------------
        // Variable access:
        if (this._isVariableName(exp)) {
            return env.lookup(exp);
        }

        // ---------------------------------
        // Block: sequence of expressions
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        // ---------------------------------
        // if expression:
        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if (this.eval(condition, env)) {
                return this.eval(consequent, env);
            }
            return this.eval(alternate, env);
        }

        // ---------------------------------
        // switch expression:
        // syntactic sugar for nested if-expressions
        if (exp[0] === 'switch') {
            const ifExp = this._transformer.transformSwtichToIf(exp);

            return this.eval(ifExp, env);
        }

        // ---------------------------------
        // while expression:
        if (exp[0] === 'while') {
            const [_tag, condition, body] = exp;

            let result;
            while (this.eval(condition, env)) {
                result = this.eval(body, env);
            }

            return result;
        }

        // ---------------------------------
        // function declarations:
        // Syntactic sugar for: (var square (lambda (x) (* x x)))
        // if (exp[0] === 'def') {
        //     const [_tag, name, params, body] = exp;
        //     const fn = {
        //         params,
        //         body,
        //         env // Closure!
        //     };

        //     return env.define(name, fn);
        // }
        if (exp[0] === 'def') {
            const varExp = this._transformer.transformDeftoLambda(exp);

            return this.eval(varExp, env);
        }


        // ---------------------------------
        // lambda function:
        if (exp[0] === 'lambda') {
            const [_tag, params, body] = exp;
            return {
                params,
                body,
                env // Closure!
            }
        }

        // ---------------------------------
        // function calls:
        if (Array.isArray(exp)) {
            const fn = this.eval(exp[0], env);
            const args = exp.slice(1).map(arg => this.eval(arg, env));

            // Native function
            if (typeof fn === 'function') {
                return fn(...args);
            }

            // User-defined function
            return this._callUserDefinedFunction(fn, args);
        }

        throw `Unimplemented ${JSON.stringify(exp)}`;
    }

    _callUserDefinedFunction(fn, args) {
        const activationRecord = {};
        fn.params.forEach((param, index) => {
            activationRecord[param] = args[index];
        });

        const activationEnvironment = new Environment(activationRecord, fn.env);

        return this._evalBody(fn.body, activationEnvironment);
    }

    _evalBody(body, env) {
        if (body[0] === 'begin') {
            return this._evalBlock(body, env);
        }
        return this.eval(body, env);
    }

    _evalBlock(exp, env) {
        let result;

        const [_tag, ...expressions] = exp;

        expressions.forEach(exp => {
            result = this.eval(exp, env)
        });

        return result;
    }

    _isNumber(exp) {
        return typeof exp === 'number';
    }
    
    _isString(exp) {
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }
    
    _isVariableName(exp) {
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]*$/.test(exp)
    }
}

/*
 * Default Global Environment
 */

const GlobalEnvironment = new Environment({
    null: null,

    true: true,
    false: false,

    VERSION: '0.1',

    // Math:
    '+'(op1, op2) {
        return op1 + op2;
    },

    '*'(op1, op2) {
        return op1 * op2;
    },

    '-'(op1, op2 = null) {
        if (op2 == null) {
            return -op1;
        }
        return op1 - op2;
    },

    '/'(op1, op2) {
        return op1 / op2;
    },

    // Comparison:
    '>'(op1, op2) {
        return op1 > op2;
    },

    '>='(op1, op2) {
        return op1 >= op2;
    },

    '<'(op1, op2) {
        return op1 < op2;
    },

    '<='(op1, op2) {
        return op1 <= op2;
    },

    '='(op1, op2) {
        return op1 === op2;
    },

    print(...args) {
        console.log(...args);
    },
})

module.exports = Eva;
