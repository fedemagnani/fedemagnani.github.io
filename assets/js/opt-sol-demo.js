import init, { OptimizationSolver, log } from '../opt-sol-pkg/optimization_solvers.js';

let wasmModule = null;
let optimizationHistory = [];

// Initialize WASM module
async function initWasm() {
    const runBtn = document.getElementById('run-btn');
    const resultDiv = document.getElementById('result');

    try {
        // Show loading state
        runBtn.disabled = true;
        runBtn.textContent = '🔄 Loading WASM module...';

        // Debug: Log the current URL and module path
        console.log('Current URL:', window.location.href);
        console.log('Attempting to load module from:', '../opt-sol-pkg/optimization_solvers.js');

        // Load the WASM module
        wasmModule = await init();
        console.log('WASM module loaded successfully');

        // Enable the button
        runBtn.disabled = false;
        runBtn.textContent = '🚀 Run Optimization';

        // Show success message
        resultDiv.style.display = 'block';
        resultDiv.className = 'result success';
        resultDiv.innerHTML = `
            <h3>✅ WASM Module Loaded Successfully!</h3>
            <p>The optimization solvers are ready to use.</p>
        `;

        // Hide success message after 3 seconds
        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 3000);

    } catch (error) {
        console.error('Failed to load WASM module:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        // Show error state
        runBtn.disabled = true;
        runBtn.textContent = '❌ Failed to Load';

        resultDiv.style.display = 'block';
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
            <h3>❌ Failed to Load WASM Module</h3>
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>URL:</strong> ${window.location.href}</p>
            <p><strong>Module Path:</strong> ../opt-sol-pkg/optimization_solvers.js</p>
            <p>Please check your internet connection and try refreshing the page.</p>
            <p>If the problem persists, the WASM module might not be available on this server.</p>
        `;
    }
}

// Initialize on page load
initWasm();

// Solver information
const solverInfo = {
    gradient_descent: {
        name: "Gradient Descent",
        type: "First-order method",
        requirements: "Function value and gradient",
        bestFor: "Simple problems, when Hessian is expensive",
        description: "Uses gradient information to find the direction of steepest descent."
    },
    bfgs: {
        name: "BFGS Quasi-Newton",
        type: "Quasi-Newton method",
        requirements: "Function value and gradient",
        bestFor: "Medium-scale problems, good convergence",
        description: "Approximates the Hessian using gradient information."
    },
    newton: {
        name: "Newton's Method",
        type: "Second-order method",
        requirements: "Function value, gradient, and Hessian",
        bestFor: "Small problems, fast convergence when Hessian is available",
        description: "Uses exact Hessian information for optimal step direction."
    }
};

// Function templates
const functionTemplates = {
    quadratic: {
        name: "Quadratic Function",
        description: "f(x,y) = x² + 2y²",
        code: `function objective(x) {
const x1 = x[0];
const x2 = x[1];

// f(x,y) = x² + 2y²
const f = x1 * x1 + 2 * x2 * x2;

// Gradient: [2x, 4y]
const g1 = 2 * x1;
const g2 = 4 * x2;

return [f, g1, g2];
}`,
        newtonCode: `function objective(x) {
const x1 = x[0];
const x2 = x[1];

// f(x,y) = x² + 2y²
const f = x1 * x1 + 2 * x2 * x2;

// Gradient: [2x, 4y]
const g1 = 2 * x1;
const g2 = 4 * x2;

// Hessian: [[2, 0], [0, 4]]
const h11 = 2;
const h12 = 0;
const h21 = 0;
const h22 = 4;

return [f, g1, g2, h11, h12, h21, h22];
}`
    },
    rosenbrock: {
        name: "Rosenbrock Function",
        description: "f(x,y) = (1-x)² + 100(y-x²)²",
        code: `function objective(x) {
const x1 = x[0];
const x2 = x[1];

// f(x,y) = (1-x)² + 100(y-x²)²
const f = Math.pow(1 - x1, 2) + 100 * Math.pow(x2 - x1 * x1, 2);

// Gradient: [-2(1-x) - 400x(y-x²), 200(y-x²)]
const g1 = -2 * (1 - x1) - 400 * x1 * (x2 - x1 * x1);
const g2 = 200 * (x2 - x1 * x1);

return [f, g1, g2];
}`,
        newtonCode: `function objective(x) {
const x1 = x[0];
const x2 = x[1];

// f(x,y) = (1-x)² + 100(y-x²)²
const f = Math.pow(1 - x1, 2) + 100 * Math.pow(x2 - x1 * x1, 2);

// Gradient: [-2(1-x) - 400x(y-x²), 200(y-x²)]
const g1 = -2 * (1 - x1) - 400 * x1 * (x2 - x1 * x1);
const g2 = 200 * (x2 - x1 * x1);

// Hessian components
const h11 = 2 + 1200 * x1 * x1 - 400 * x2;
const h12 = -400 * x1;
const h21 = -400 * x1;
const h22 = 200;

return [f, g1, g2, h11, h12, h21, h22];
}`
    },
    ackley: {
        name: "Ackley Function",
        description: "f(x,y) = -20*exp(-0.2*sqrt(0.5*(x²+y²))) - exp(0.5*(cos(2πx)+cos(2πy))) + e + 20",
        code: `function objective(x) {
const x1 = x[0];
const x2 = x[1];

// f(x,y) = -20*exp(-0.2*sqrt(0.5*(x²+y²))) - exp(0.5*(cos(2πx)+cos(2πy))) + e + 20
const a = 20;
const b = 0.2;
const c = 2 * Math.PI;

const term1 = -a * Math.exp(-b * Math.sqrt(0.5 * (x1 * x1 + x2 * x2)));
const term2 = -Math.exp(0.5 * (Math.cos(c * x1) + Math.cos(c * x2)));
const f = term1 + term2 + Math.E + a;

// Gradient (simplified approximation)
const g1 = -term1 * b * x1 / Math.sqrt(0.5 * (x1 * x1 + x2 * x2)) + 
       term2 * 0.5 * c * Math.sin(c * x1);
const g2 = -term1 * b * x2 / Math.sqrt(0.5 * (x1 * x1 + x2 * x2)) + 
       term2 * 0.5 * c * Math.sin(c * x2);

return [f, g1, g2];
}`,
        newtonCode: `function objective(x) {
const x1 = x[0];
const x2 = x[1];

// f(x,y) = -20*exp(-0.2*sqrt(0.5*(x²+y²))) - exp(0.5*(cos(2πx)+cos(2πy))) + e + 20
const a = 20;
const b = 0.2;
const c = 2 * Math.PI;

const term1 = -a * Math.exp(-b * Math.sqrt(0.5 * (x1 * x1 + x2 * x2)));
const term2 = -Math.exp(0.5 * (Math.cos(c * x1) + Math.cos(c * x2)));
const f = term1 + term2 + Math.E + a;

// Gradient (simplified approximation)
const g1 = -term1 * b * x1 / Math.sqrt(0.5 * (x1 * x1 + x2 * x2)) + 
       term2 * 0.5 * c * Math.sin(c * x1);
const g2 = -term1 * b * x2 / Math.sqrt(0.5 * (x1 * x1 + x2 * x2)) + 
       term2 * 0.5 * c * Math.sin(c * x2);

// Hessian (simplified approximation)
const h11 = 0.1; // Simplified
const h12 = 0;
const h21 = 0;
const h22 = 0.1; // Simplified

return [f, g1, g2, h11, h12, h21, h22];
}`
    },
    sphere: {
        name: "Sphere Function",
        description: "f(x,y) = x² + y²",
        code: `function objective(x) {
const x1 = x[0];
const x2 = x[1];

// f(x,y) = x² + y²
const f = x1 * x1 + x2 * x2;

// Gradient: [2x, 2y]
const g1 = 2 * x1;
const g2 = 2 * x2;

return [f, g1, g2];
}`,
        newtonCode: `function objective(x) {
const x1 = x[0];
const x2 = x[1];

// f(x,y) = x² + y²
const f = x1 * x1 + x2 * x2;

// Gradient: [2x, 2y]
const g1 = 2 * x1;
const g2 = 2 * x2;

// Hessian: [[2, 0], [0, 2]]
const h11 = 2;
const h12 = 0;
const h21 = 0;
const h22 = 2;

return [f, g1, g2, h11, h12, h21, h22];
}`
    }
};

// Update solver info when selection changes
document.getElementById('solver-select').addEventListener('change', function () {
    updateDimensionInfo();

    // Update function template if one is currently loaded
    const currentFunction = document.getElementById('objective-function').value;
    if (currentFunction.includes('function objective')) {
        // Try to detect which template is currently loaded
        if (currentFunction.includes('x1 * x1 + 2 * x2 * x2')) {
            loadTemplate('quadratic');
        } else if (currentFunction.includes('Math.pow(1 - x1, 2)')) {
            loadTemplate('rosenbrock');
        } else if (currentFunction.includes('Math.exp(-b * Math.sqrt')) {
            loadTemplate('ackley');
        } else if (currentFunction.includes('x1 * x1 + x2 * x2') && !currentFunction.includes('2 * x2 * x2')) {
            loadTemplate('sphere');
        }
    }
});

// Update initial point dimension info
document.getElementById('initial-point').addEventListener('input', function () {
    updateDimensionInfo();
});



function updateDimensionInfo() {
    const initialPoint = document.getElementById('initial-point').value;
    const dimensions = initialPoint.split(',').filter(x => x.trim() !== '').length;
    const infoDiv = document.getElementById('dimension-info');

    if (dimensions > 0) {
        infoDiv.innerHTML = `
            <strong>Note:</strong> Detected ${dimensions} dimension${dimensions > 1 ? 's' : ''}. 
            Make sure your function handles this many variables (x[0], x[1], ..., x[${dimensions - 1}]).
        `;
    } else {
        infoDiv.innerHTML = `
            <strong>Note:</strong> Please enter a valid initial point.
        `;
    }
}

// Load function template
window.loadTemplate = function (templateName) {
    const template = functionTemplates[templateName];
    if (!template) return;

    const solver = document.getElementById('solver-select').value;
    const code = solver === 'newton' ? template.newtonCode : template.code;

    document.getElementById('objective-function').value = code;

    // Update initial point for the template
    if (templateName === 'rosenbrock') {
        document.getElementById('initial-point').value = '-1,1';
    } else if (templateName === 'ackley') {
        document.getElementById('initial-point').value = '1,1';
    } else {
        document.getElementById('initial-point').value = '2,1';
    }

    updateDimensionInfo();
};

// Parse input point
function parseInput(input) {
    return input.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
}

// Format execution time with appropriate unit
function formatExecutionTime(timeMs) {
    if (timeMs < 1) {
        return `${(timeMs * 1000).toFixed(2)} μs`;
    } else if (timeMs < 1000) {
        return `${timeMs.toFixed(2)} ms`;
    } else {
        return `${(timeMs / 1000).toFixed(2)} s`;
    }
}

// Display results
function displayResult(result, solverName, functionName, executionTime) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    if (result.get_success()) {
        resultDiv.className = 'result success';
        const x = result.get_x();
        const xArray = Array.from(x);
        resultDiv.innerHTML = `
            <h3>✅ ${solverName} completed successfully!</h3>
            <p><strong>Function:</strong> ${functionName}</p>
            <p><strong>Final iterate:</strong> [${xArray.map(x => x.toFixed(6)).join(', ')}]</p>
            <p><strong>Function value:</strong> ${result.get_f_value().toFixed(6)}</p>
            <p><strong>Gradient norm:</strong> ${result.get_gradient_norm().toFixed(6)}</p>
            <p><strong>Iterations:</strong> ${result.get_iterations()}</p>
            <p><strong>Execution time:</strong> ${formatExecutionTime(executionTime)}</p>
        `;
    } else {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
            <h3>❌ ${solverName} failed</h3>
            <p><strong>Function:</strong> ${functionName}</p>
            <p><strong>Error:</strong> ${result.get_error_message()}</p>
            <p><strong>Execution time:</strong> ${formatExecutionTime(executionTime)}</p>
        `;
    }
}

// Add to history
function addToHistory(solverName, functionName, result, initialPoint, executionTime) {
    const historyItem = {
        id: Date.now(),
        solverName,
        functionName,
        result,
        initialPoint,
        executionTime,
        timestamp: new Date().toLocaleString()
    };

    optimizationHistory.unshift(historyItem);
    if (optimizationHistory.length > 10) {
        optimizationHistory.pop();
    }

    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '';

    optimizationHistory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        itemDiv.onclick = () => loadFromHistory(item);

        const success = item.result.get_success();
        const status = success ? '✅' : '❌';
        const x = success ? Array.from(item.result.get_x()).map(x => x.toFixed(4)).join(', ') : 'N/A';

        itemDiv.innerHTML = `
            <h4>${status} ${item.solverName}</h4>
            <p><strong>Function:</strong> ${item.functionName}</p>
            <p><strong>Initial:</strong> [${item.initialPoint.join(', ')}]</p>
            <p><strong>Result:</strong> [${x}]</p>
            <p><strong>Execution:</strong> ${item.executionTime ? formatExecutionTime(item.executionTime) : 'N/A'}</p>
            <p><strong>Time:</strong> ${item.timestamp}</p>
        `;

        historyDiv.appendChild(itemDiv);
    });
}

// Load from history
function loadFromHistory(item) {
    document.getElementById('solver-select').value =
        item.solverName === 'Gradient Descent' ? 'gradient_descent' :
            item.solverName === 'BFGS Quasi-Newton' ? 'bfgs' : 'newton';

    document.getElementById('initial-point').value = item.initialPoint.join(',');
    updateDimensionInfo();
}

// Clear history
window.clearHistory = function () {
    optimizationHistory = [];
    updateHistoryDisplay();
};

// Main optimization function
window.runOptimization = function () {
    if (!wasmModule) {
        alert('WASM module not loaded yet. Please wait.');
        return;
    }

    try {
        // Get inputs
        const solverType = document.getElementById('solver-select').value;
        const initialPoint = parseInput(document.getElementById('initial-point').value);
        const tolerance = parseFloat(document.getElementById('tolerance').value);
        const maxIter = parseInt(document.getElementById('max-iterations').value);
        const functionCode = document.getElementById('objective-function').value;

        // Validate inputs
        if (initialPoint.length === 0) {
            alert('Please enter a valid initial point.');
            return;
        }

        if (!functionCode.trim()) {
            alert('Please enter an objective function.');
            return;
        }

        // Create objective function
        let objectiveFunction;
        try {
            // Create a new function from the code
            const functionBody = functionCode.replace(/^function\s+\w+\s*\([^)]*\)\s*{/, '')
                .replace(/}$/, '')
                .trim();
            objectiveFunction = new Function('x', functionBody + '\nreturn objective(x);');

            // Test the function
            const testResult = objectiveFunction(initialPoint);
            if (!Array.isArray(testResult)) {
                throw new Error('Function must return an array');
            }

            // Validate function output based on solver type
            const n = initialPoint.length;
            const expectedGradientSize = n;
            const expectedHessianSize = n * n;

            if (solverType === 'newton') {
                const expectedSize = 1 + expectedGradientSize + expectedHessianSize;
                if (testResult.length !== expectedSize) {
                    throw new Error(`Newton's method requires ${expectedSize} values: [f, ${expectedGradientSize} gradient components, ${expectedHessianSize} Hessian components]. Got ${testResult.length} values.`);
                }
            } else {
                const expectedSize = 1 + expectedGradientSize;
                if (testResult.length !== expectedSize) {
                    throw new Error(`Gradient methods require ${expectedSize} values: [f, ${expectedGradientSize} gradient components]. Got ${testResult.length} values.`);
                }
            }
        } catch (error) {
            alert('Error in objective function: ' + error.message);
            return;
        }

        // Create solver
        const solver = OptimizationSolver.new(tolerance, maxIter);

        // Run optimization based on solver type
        let result;
        const solverName = solverInfo[solverType].name;
        const functionName = "Custom Function";

        // Measure execution time
        const startTime = performance.now();

        switch (solverType) {
            case 'gradient_descent':
                result = solver.solve_gradient_descent(initialPoint, objectiveFunction);
                break;
            case 'bfgs':
                result = solver.solve_bfgs(initialPoint, objectiveFunction);
                break;
            case 'newton':
                result = solver.solve_newton(initialPoint, objectiveFunction);
                break;
            default:
                throw new Error('Unknown solver type');
        }

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // Display results
        displayResult(result, solverName, functionName, executionTime);

        // Add to history
        addToHistory(solverName, functionName, result, initialPoint, executionTime);

    } catch (error) {
        console.error('Error in runOptimization:', error);
        alert('Error: ' + error.message);
    }
};

// Initialize display
updateDimensionInfo();
