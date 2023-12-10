const operatorOrders = {
    PEMDAS: {
        1: ['sin', 'cos', 'tan'],
        2: ["(", ")"],
        3: ["^"],
        4: ["*"],
        5: ["/"],
        6: ["+"],
        7: ["-"]
    }
};

const { orderMode } = require('../settings.json');

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
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
        '^': (a, b) => Math.pow(a, b),
    };
    return operators[operator](a, b);
};

module.exports = function(expression) {
    let stack = [];
    let output = [];

    console.log('Solving...')

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

    console.log('Solved.')

    return resultStack[0];
}