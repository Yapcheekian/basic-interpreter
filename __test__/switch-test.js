const { test } = require('./test-util');

module.exports = eva => {
    test(eva, `
        (begin
            (var x 100)
            (switch
                ((= x 100) 100)
                ((> x 100) 200)
                (else 300)
            )    
        )
    `, 100)
}