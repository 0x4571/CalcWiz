const operatorOrders = {
    PEMDAS: {
        1: ['sin', 'cos', 'tan', 'e', 'sqrt', 'log', 'ln', '!', 'cot', 'sec', 'csc', 'asin', 'acos', 'atan', 'acot', 'asec',
    'acsc', 'sinh', 'cosh', 'tanh', 'coth', 'sech', 'csch'],
        //2: ["\(", "\)"],
        2: ["\^"],
        3: ["\*", "\/"],
        4: ["\+", "\-"],
    }
};

const parser = require('./parser.js')
const { orderMode, functions } = require('../settings.json');
const variables = {
    "x": ["cos(90) + 2"],
    "myFunction": ["2 + 3 * x + y"]
  }

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
    'tan': { [0]: 0, [Math.PI / 6]: Math.sqrt(3) / 3, [Math.PI / 4]: 1, [Math.PI / 3]: Math.sqrt(3)},
};

const applyOperator = (operator, a, b) => {
    const operators = {
        'sin': (a, b) => knownValues['sin'][b] !== undefined ? knownValues['sin'][b] : Math.sin(b),
        'cos': (a, b) => knownValues['cos'][b] !== undefined ? knownValues['cos'][b] : Math.cos(b),
        'tan': (a, b) => knownValues['tan'][b] !== undefined ? knownValues['tan'][b] : Math.tan(b),
        'cot': (a, b) => knownValues['tan'][b] !== undefined ? 1 / knownValues['tan'][b] : 1 / Math.tan(b),
        'sec': (a, b) => knownValues['cos'][b] !== undefined ? 1 / knownValues['cos'][b] : 1 / Math.cos(b),
        'csc': (a, b) => knownValues['sin'][b] !== undefined ? 1 / knownValues['sin'][b] : 1 / Math.sin(b),
        'asin': (a, b) => Math.asin(b),
        'acos': (a, b) => Math.acos(b),
        'atan': (a, b) => Math.atan(b),
        'acot': (a, b) => Math.atan(1 / b),
        'asec': (a, b) => Math.acos(1 / b),
        'acsc': (a, b) => Math.asin(1 / b),
        'sinh': (a, b) => Math.sinh(b),
        'cosh': (a, b) => Math.cosh(b),
        'tanh': (a, b) => Math.tanh(b),
        'coth': (a, b) => Math.coth(1 / b),
        'sech': (a, b) => Math.sech(1 / b),
        'csch': (a, b) => Math.csch(1 / b),
        'log': (a, b) => Math.log(b),
        'ln': (a, b) => Math.log(b),
        '\+': (a, b) => a + b,
        '\-': (a, b) => a - b,
        '\*': (a, b) => a * b,
        '\/': (a, b) => a / b,
        '\^': (a, b) => Math.pow(a, b),
        'e': (a, b) => a * Math.pow(10, b),
        '!': (a, b) => function() {
            let fact = 1;
            for (let i = 1; i <= b; i++) {
                fact *= i;
            }
        
            return fact;
        }()
    };

    a = parseFloat(a);
    b = parseFloat(b);

    if (operators.hasOwnProperty(operator)) {
        if (operator == "/" && b == 0) return 'undefined'
        if (operator == 'tan' && b == (Math.PI / 2)) return 'undefined'

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

    for (let i = 0; i < expression.length; i++) {
        const token = expression[i];

        if (variables[token]) {
            const parsedValue = parser(variables[token][0]);
            expression.splice(i, 1, ...parsedValue);

            let vars = []

            for (let j = 0; j < parsedValue.length; j++) {
                const innerToken = parsedValue[j];

                if (!/^[a-zA-Z]$/.test(innerToken)) continue

                vars.push(innerToken)
            }

            if (vars.length > 0 && expression[i + parsedValue.length] !== '(') return `Error: Variables not assigned properly in function ${token} (${variables[token]})`
            
            let endParenthesesIndex = 0
            let openParenthesesCount = 0

            for (let k = i + parsedValue.length; k <= expression.length; k++) {
                if (expression[k] === "(") {
                    openParenthesesCount++
                } else if (expression[k] === ")") {
                    openParenthesesCount--
                }

                if (openParenthesesCount === 0) {
                    endParenthesesIndex = k
                    break
                }
            }

            const parentheses = [...expression].splice(i + parsedValue.length, endParenthesesIndex - (i + parsedValue.length))
            parentheses.shift()

            expression.splice(i + parsedValue.length)

            vars = {}

            parentheses.join('').split(';').forEach(function(exp) {
                const variable = exp.split('=')[0]
                exp = parser(exp.split('=')[1])

                let modifiedExp = [...exp]

                while (modifiedExp.includes('(')) {
                    let openIndex = modifiedExp.lastIndexOf('(');
                    let closeIndex = modifiedExp.indexOf(')', openIndex);
            
                    if (openIndex === -1 || closeIndex === -1) {
                        throw new Error('Mismatched parentheses.');
                    }
            
                    let subExpression = modifiedExp.slice(openIndex + 1, closeIndex);
            
                    for (let order in operatorOrders[orderMode]) {
                        const operators = operatorOrders[orderMode][order];
                
                        while (operators.some(op => subExp.includes(op))) {
                            const index = subExp.findIndex(token => operators.includes(token));
                
                            if (!isNaN(subExpression[0])) {
                                const precedingOperator = subExp[index - 2];
                
                                sign = (precedingOperator === '-') ? -1 : 1;
                            }
                
                                let result = solveExpression(subExpression);
                                if (subExp[index - 2] === '-' && subExp[index] === '+') {
                                    result = sign * result;
                                }
                                subExp.splice(index - 1, 3, result);
                
                            sign = 1;
                        }
                    }
            
                    modifiedExp.splice(openIndex, closeIndex - openIndex + 1, ...subExpression);
                }
            
                subExp = modifiedExp;
            
                for (let order in operatorOrders[orderMode]) {
                    const operators = operatorOrders[orderMode][order];
            
                    while (operators.some(op => subExp.includes(op))) {
                        const index = subExp.findIndex(token => operators.includes(token));
                        const subExpression = subExp.slice(index - 1, index + 2);
            
                        if (!isNaN(subExpression[0])) {
                            const precedingOperator = subExp[index - 2];
            
                            sign = (precedingOperator === '-') ? -1 : 1;
                        }
            
                            let result = solveExpression(subExpression);
                            if (subExp[index - 2] === '-' && subExp[index] === '+') {
                                result = sign * result;
                            }
                            subExp.splice(index - 1, 3, result);
            
                        sign = 1;
                    }
                }

                vars[variable] = subExp

                if (parsedValue.includes(variable) && expression.includes(variable)) {
                    for (let k = i - parsedValue.length; k <= i + parsedValue.length; k++) {
                        if (expression[k] === variable) {
                            expression[k] = subExp[0];  
                        }
                    }
                }
            });

            expression.splice(i + parsedValue.length, endParenthesesIndex - (i + parsedValue.length) + 1)
        }
    }

    //expression = expression.filter(token => token !== ';');
  
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

        /*for (let order in operatorOrders[orderMode]) {
            const operators = operatorOrders[orderMode][order];

            while (operators.some(op => subExpression.includes(op))) {
                const index = subExpression.findIndex(token => operators.includes(token));

                let result = solveExpression(subExpression.slice(index - 1, index + 2));

                subExpression.splice(index - 1, 3, result);

                console.log(`${subExpression.join(' ')} = ${result}`);
            }
        }*/

        for (let order in operatorOrders[orderMode]) {
            const operators = operatorOrders[orderMode][order];
    
            while (operators.some(op => expression.includes(op))) {
                const index = expression.findIndex(token => operators.includes(token));
    
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