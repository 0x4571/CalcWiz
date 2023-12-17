const database = require('./database.js')

module.exports = function (uuid, expression) {
    console.log(`Parsing ${expression}...`)

    const settings = database.returnData(uuid, 'settings')
    const variables = database.returnData(uuid, 'variables')
    const functions = settings["functions"]

    const operators = /^[+\-*/^=]$/
    const parenthesis = /^[()]/

    let skipNextIteration = false;

    expression = expression.match(/(\d+\.?\d*|;|π|√|!|[a-zA-Z]+|\w|[+\-*/^()=])/g).flatMap((k, i, arr) => {
        if (skipNextIteration) {
            skipNextIteration = false;
            return [];
        }
    
        if ((k === '-' || k === '+') && (i === 0 || operators.test(arr[i - 1]) || arr[i - 1] === '(')) {
            const nextNumber = arr[i + 1];
            skipNextIteration = true;
    
            return ['(', 0, k, nextNumber, ')'];
        }
    
        if (!isNaN(k)) {
            return Number(k);
        } else if (/[a-zA-Z]/.test(k) || operators.test(k) || parenthesis.test(k) || functions.includes(k) || 
        variables.hasOwnProperty(k) || k === ';') {
            return k;
        }
    });
    

    expression = expression.filter(exp => exp !== undefined);
    
    let openParenthesesCount = 0
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

        if (functions.includes(expression[i]) && functions.includes(expression[i + 1])) {
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

    console.log(`Finished parsing: ${error || expression}`)

    return error || expression
}
