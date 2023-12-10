const operatorOrders = {
    PEMDAS: {
        1: ['sin', 'cos', 'tan'],
        2: ["\(", "\)"],
        3: ["\^"],
        4: ["\*", "\/"],
        5: ["\+", "\-"],
    }
};

const { Console } = require('console');
const { orderMode, functions } = require('../settings.json');
const exp = require('constants');

const precedence = (operator) => {
    for (let order in operatorOrders[orderMode]) {
        if (operatorOrders[orderMode][order].includes(operator)) {
            return parseFloat(order);
        }
    }
    return 0;
};

const applyOperator = (operator, a, b) => {
    const operators = {
        '\+': (a, b) => a + b,
        '\-': (a, b) => a - b,
        '\*': (a, b) => a * b,
        '\/': (a, b) => a / b,
        '\^': (a, b) => Math.pow(a, b)
    };

    a = parseFloat(a);
    b = parseFloat(b);

    if (operators.hasOwnProperty(operator)) {
        return operators[operator](a, b);
    } else {
        return a || b;
    }

};

const solveExpression = (expression) => {
    let stack = [];
    let output = [];

    for (let token of expression) {
        if (!isNaN(token)) {
            output.push(parseFloat(token));
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop();
        } else {
            while (
                stack.length > 0 &&
                precedence(stack[stack.length - 1]) >= precedence(token)
            ) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    }

    while (stack.length > 0) {
        output.push(stack.pop());
    }

    let resultStack = [];

    for (let token of output) {
        if (!isNaN(token)) {
            resultStack.push(token);
        } else {
            let b = resultStack.pop();
            let a = resultStack.pop();
            resultStack.push(applyOperator(token, a, b));
        }
    }

    return resultStack[0];
};

module.exports = function (expression) {
    let sign = 1; 

    let modifiedExpression = [...expression];

    while (modifiedExpression.includes('(')) {
        let openIndex = modifiedExpression.lastIndexOf('(');
        let closeIndex = modifiedExpression.indexOf(')', openIndex);

        if (openIndex === -1 || closeIndex === -1) {
            throw new Error('Mismatched parentheses.');
        }

        let subExpression = modifiedExpression.slice(openIndex + 1, closeIndex);

        for (let order in operatorOrders[orderMode]) {
            const operators = operatorOrders[orderMode][order];
    
            while (operators.some(op => subExpression.includes(op))) {
                const index = subExpression.findIndex(token => operators.includes(token));
    
                if (!isNaN(subExpression[0])) {
                    const precedingOperator = subExpression[index - 2];
    
                    sign = (precedingOperator === '-') ? -1 : 1;
                }
    
                let result = solveExpression(subExpression);
    
                if (subExpression[index - 2] === '-' && subExpression[index] === '+') {
                    result = sign * result;
                }
    
                subExpression.splice(index - 1, 3, result);
    
                console.log(`${subExpression} = ${result}`);
    
                sign = 1;
            }
        }

        const result = solveExpression(subExpression);
        modifiedExpression.splice(openIndex, closeIndex - openIndex + 1, result);

        console.log(`${modifiedExpression.join(' ')} = ${result}`);
    }

    expression = modifiedExpression

    console.log(`Main exp: ${expression.join(' ')}`);

    for (let order in operatorOrders[orderMode]) {
        const operators = operatorOrders[orderMode][order];

        while (operators.some(op => expression.includes(op))) {
            const index = expression.findIndex(token => operators.includes(token));
            const subExpression = expression.slice(index - 1, index + 2);

            if (!isNaN(subExpression[0])) {
                const precedingOperator = expression[index - 2];

                sign = (precedingOperator === '-') ? -1 : 1;
            }

            let result = solveExpression(subExpression);

            if (expression[index - 2] === '-' && expression[index] === '+') {
                result = sign * result;
            }

            expression.splice(index - 1, 3, result);

            console.log(`${expression} = ${result}`);

            sign = 1;
        }
    }

    return expression[0];
};