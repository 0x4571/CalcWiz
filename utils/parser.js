module.exports = function(expression) {
    console.log(`Parsing ${expression}...`)

    const operators = /^[+\-*/^]$/

    expression = expression.match(/(\d+\.?\d*|[a-zA-Z]+\b|[+\-*/^()=])/g).map(k => {
        return isNaN(k) ? k : Number(k);
    });
    
    let openParenthesesCount = 0;
    let error = undefined

    for (let i = 0; i < expression.length - 1; i++) {
        if (operators.test(expression[i]) && operators.test(expression[i + 1])) {
            error = "Error: Consecutive operators."
            break
        }

        if (expression[i] === "(") {
            openParenthesesCount++
        } else if (expression[i + 1] === ")") {
            openParenthesesCount--
        }

        if (expression[i] === '(' && operators.test(expression[i + 1])) {
            error = "Error: Invalid sequence."
            break
        }

        if (expression[i + 1] === ')' && operators.test(expression[i])) {
            error = "Error: Invalid sequence."
            break
        }
    }

    if (openParenthesesCount !== 0) {
        error = "Error: Unmatched open parenthesis."
    }

    console.log('Finished parsing.')

    return error || expression
}