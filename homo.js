const generateNums = (key) => {
    const Nums = {}; // Used to store generated numbers and their corresponding expressions
    const digits = key.split(''); // Split the key into individual digits
    const operators = ['+', '-', '*', '/']; // Define the set of operators
    const results = []; // Store all possible expressions
    const maxDepth = digits.length * 4; // Increased recursion depth to accommodate parentheses

    // Function to determine if the operator at position 'pos' is unary
    const isUnaryOperator = (expr, pos) => {
        if (pos === 0) return true;
        const prev = expr[pos - 1];
        // If previous character is an operator or '(', it's unary
        if (['+', '-', '*', '/', '('].includes(prev)) return true;
        return false;
    };

    // Function to add parentheses around binary '+' and '-' operators
    const addParentheses = (expr) => {
        const expressionsWithParentheses = new Set();
        const exprLength = expr.length;

        for (let pos = 0; pos < exprLength; pos++) {
            const char = expr[pos];
            if (char === '+' || char === '-') {
                // Check if it's a binary operator
                if (!isUnaryOperator(expr, pos)) {
                    // Find the start of the left operand
                    let leftStart = pos - 1;
                    let parenthesesLeft = false;
                    let stack = 0;
                    while (leftStart >= 0) {
                        if (expr[leftStart] === ')') {
                            stack++;
                        } else if (expr[leftStart] === '(') {
                            stack--;
                            if (stack === 0) break;
                        } else if (['+', '-', '*', '/'].includes(expr[leftStart]) && stack === 0) {
                            break;
                        }
                        leftStart--;
                    }
                    leftStart = leftStart >= 0 ? leftStart + 1 : 0;

                    // Find the end of the right operand
                    let rightEnd = pos + 1;
                    stack = 0;
                    while (rightEnd < exprLength) {
                        if (expr[rightEnd] === '(') {
                            stack++;
                        } else if (expr[rightEnd] === ')') {
                            stack--;
                            if (stack === 0) break;
                        } else if (['+', '-', '*', '/'].includes(expr[rightEnd]) && stack === 0) {
                            break;
                        }
                        rightEnd++;
                    }

                    // Extract operands
                    const leftOperand = expr.slice(leftStart, pos);
                    const rightOperand = expr.slice(pos + 1, rightEnd);

                    // Form the new expression with parentheses
                    const newExpr = expr.slice(0, leftStart) + '(' + leftOperand + char + rightOperand + ')' + expr.slice(rightEnd);

                    expressionsWithParentheses.add(newExpr);
                }
            }
        }

        return Array.from(expressionsWithParentheses);
    };

    // Improved DFS to generate all possible expressions
    const dfs = (i, expr, canAddOperator, depth) => {
        if (depth > maxDepth) return; // Terminate if maximum depth is exceeded
        if (i === digits.length) {
            results.push(expr); // Record the complete expression
            return;
        }

        if (!canAddOperator) {
            // Continue adding digits
            dfs(i + 1, expr + digits[i], true, depth + 1);
        } else {
            // Option to add an operator before the next digit
            for (const op of operators) {
                // Avoid starting the expression with a binary operator
                if (!(i === 0 && (op === '+' || op === '-'))) {
                    dfs(i, expr + op, false, depth + 1);
                }
            }
            // Option to add the next digit without adding an operator
            dfs(i + 1, expr + digits[i], true, depth + 1);
        }
    };

    // Start the DFS from the initial state
    dfs(0, "", false, 0);

    // Generate expressions with parentheses
    const expressionsWithParentheses = [];
    for (const expr of results) {
        const parenthesized = addParentheses(expr);
        expressionsWithParentheses.push(...parenthesized);
    }

    // Merge original expressions and parenthesized expressions
    const allExpressions = new Set([...results, ...expressionsWithParentheses]);

    // Function to evaluate expressions safely
    const calculator = (expr) => {
        try {
            // Replace '**' with '^' if necessary or adjust based on the environment
            const value = Function(`'use strict'; return (${expr})`)();
            if (Number.isFinite(value) && Number.isInteger(value) && value >= -1) {
                if (value === -1) {
                    Nums["⑨"] = expr; // Special handling for -1
                } else {
                    // Avoid overwriting existing expressions for the same value
                    if (!Nums[value]) {
                        Nums[value] = expr;
                    }
                }
            }
        } catch (e) {
            // Ignore invalid expressions
        }
    };

    // Evaluate all generated expressions
    allExpressions.forEach((expr) => calculator(expr));

    return Nums;
};

let currentNums = {};
const homo = ((Nums) => {
    const numsReversed = Object.keys(Nums).map(x => +x).filter(x => x > 0); // 提取有效数字

    // 获取数字的最大除数
    const getMinDiv = (num) => {
        for (let i = numsReversed.length; i >= 0; i--)
            if (num >= numsReversed[i])
                return numsReversed[i];
    };

    const isDotRegex = /\.(\d+?)0{0,}$/; // 匹配小数部分正则

    // 分解数字为表达式
    const demolish = (num) => {
        if (typeof num !== "number") throw new Error("Invalid input");
        if (num === Infinity || Number.isNaN(num)) throw new Error("无法生成如此恶臭的数字！");
        if (num < 0)
            return `(⑨)*(${demolish(num * -1)})`.replace(/\*\(1\)/g, "");
        if (!Number.isInteger(num)) {
            const n = num.toFixed(16).match(isDotRegex)[1].length;
            return `(${demolish(num * Math.pow(10, n))})/(10)^(${n})`;
        }
        if (Nums[num])
            return String(num);
        const div = getMinDiv(num);
        if (!div) throw new Error("无法生成如此恶臭的数字！");
        return (`${div}*(${demolish(Math.floor(num / div))})+` +
            `(${demolish(num % div)})`).replace(/\*\(1\)|\+\(0\)$/g, "");
    };

    // 优化表达式的格式
    const finisher = (expr) => {
        expr = expr.replace(/\d+|⑨/g, (n) => Nums[n]).replace("^", "**");
        while (expr.match(/[*/]-?\([^+\-()]+\)/))
            expr = expr.replace(/([*/])-?\(([^+\-()]+)\)/, (m, $1, $2) => $1 + $2);
        while (expr.match(/[+\-]\([^()]+\)[+\-)]/))
            expr = expr.replace(/([+\-])\(([^()]+)\)([+\-)])/, (m, $1, $2, $3) => $1 + $2 + $3);
        while (expr.match(/[+\-]\([^()]+\)$/))
            expr = expr.replace(/([+\-])\(([^()]+)\)$/, (m, $1, $2) => $1 + $2);
        if (expr.match(/^\([^()]+?\)$/))
            expr = expr.replace(/^\(([^()]+)\)$/, "$1");

        return expr.replace(/\+-/g, '-');
    };

    return (num) => finisher(demolish(num)); // 返回最终生成的表达式
});

document.getElementById('submit').onclick = () => {
    const key = document.getElementById('num').value; // 获取用户输入的密钥
    const result = document.getElementById('result'); // 获取结果显示区域
    if (!key || key.length !== 6) {
        result.innerHTML = '请输入有效的6位数字'; // 校验输入的密钥
        currentNums = {}; // 清空当前规则
        return;
    }
    currentNums = generateNums(key); // 根据新输入生成规则
    result.innerHTML = '请开始生成善香的数字吧！'; // 更新提示信息
    document.getElementById('query').value = ''; // 清空目标数值输入框
};

document.getElementById('query').addEventListener('input', () => {
    const target = document.getElementById('query').value.trim(); // 获取目标数值
    const container = document.documentElement;

    if (target === '') {
        container.style.backgroundColor = '#b3d0d0'; // 重置背景颜色
        result.innerHTML = '';
        return;
    } else {
        container.style.backgroundColor = '#3eeedd'; // 改变背景颜色
    }

    try {
        const expression = homo(currentNums)(parseInt(target)); // 生成表达式
        if (!expression) throw new Error("无法生成如此恶臭的数字！");
        result.innerHTML = `${target} = ${expression}`; // 显示生成结果
    } catch (error) {
        result.innerHTML = error.message; // 显示错误信息
    }
});
