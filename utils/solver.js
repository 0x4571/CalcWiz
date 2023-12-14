const operatorOrders = {
    PEMDAS: {
        1: ['sin', 'cos', 'tan', 'e', 'sqrt'],
        2: ["\(", "\)"],
        3: ["\^"],
        4: ["\*", "\/"],
        5: ["\+", "\-"],
    }
};

const { orderMode, functions } = require('../settings.json');

const precedence = (operator) => {
    for (let order in operatorOrders[orderMode]) {
        if (operatorOrders[orderMode][order].includes(operator)) {
            return parseFloat(order);
        }
    }
    return 0;
};

const knownValues = {
    'sin': { [0]: 0, [Math.PI / 6]: 1 / 2, [Math.PI / 4]: Math.sqrt(2) / 2, [Math.PI / 3]: Math.sqrt(3) / 2, [Math.PI / 2]: 1},
    'cos': { [0]: 1, [Math.PI / 6]: Math.sqrt(3) / 2, [Math.PI / 4]: Math.sqrt(2) / 2, [Math.PI / 3]: 1/ 2, [Math.PI / 2]: 0},
    'tan': { [0]: 0, [Math.PI / 6]: Math.sqrt(3) / 3, [Math.PI / 4]: 1, [Math.PI / 3]: Math.sqrt(3), [Math.PI / 2]: undefined},
};

const applyOperator = (operator, a, b) => {
    const operators = {
        'sin': (a, b) => knownValues['sin'][b] !== null ? knownValues['sin'][b] : Math.sin(b),
        'cos': (a, b) => knownValues['cos'][b] !== null ? knownValues['cos'][b] : Math.cos(b),
        'tan': (a, b) => knownValues['tan'][b] !== null ? knownValues['tan'][b] : Math.tan(b),
        'sqrt': (a, b) => Math.sqrt(b),
        '\+': (a, b) => a + b,
        '\-': (a, b) => a - b,
        '\*': (a, b) => a * b,
        '\/': (a, b) => a / b,
        '\^': (a, b) => Math.pow(a, b),
        'e': (a, b) => a * Math.pow(10, b),
    };

    a = parseFloat(a);
    b = parseFloat(b);

    if (operators.hasOwnProperty(operator)) {
        if (operator == "/" && b == 0) {
            return 'undefined'
        }

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

    for (let i in expression) {
        if (expression[i] === "pi" || expression[i] === 'π') {
            expression[i] = Math.PI
        } else if (expression[i] === '√') {
            expression[i] = 'sqrt'
        }
    }

    if (operatorOrders[orderMode][1].includes(expression[0])) {
        //expression.unshift('+')
        expression.unshift(0)
    }

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

                let result = solveExpression(subExpression.slice(index - 1, index + 2));

                subExpression.splice(index - 1, 3, result);

                console.log(`${subExpression.join(' ')} = ${result}`);
            }
        }

        modifiedExpression.splice(openIndex, closeIndex - openIndex + 1, ...subExpression);
    }

    expression = modifiedExpression;

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

            //console.log(`${expression.join(' ')} = ${result}`);

            sign = 1;
        }
    }

    return expression[0];
};