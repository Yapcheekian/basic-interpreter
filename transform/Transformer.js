class Transformer {
    transformDeftoLambda(defExp) {
        const [_tag, name, params, body] = defExp;
        // JIT-transpiled to a variable declaration
        return ['var', name, ['lambda', params, body]];
    }
}

module.exports = Transformer;
