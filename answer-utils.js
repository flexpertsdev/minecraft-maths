// Universal Answer Checking Utilities
// Handles various answer formats to prevent frustrating formatting errors

class AnswerChecker {
    // Normalize answers for comparison
    static normalize(answer) {
        if (typeof answer !== 'string') {
            answer = String(answer);
        }
        
        // Convert to lowercase and trim
        answer = answer.toLowerCase().trim();
        
        // Remove all spaces
        answer = answer.replace(/\s+/g, '');
        
        // Normalize mathematical symbols
        answer = answer
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/²/g, '^2')
            .replace(/³/g, '^3')
            .replace(/√/g, 'sqrt')
            .replace(/≈/g, '~')
            .replace(/≤/g, '<=')
            .replace(/≥/g, '>=')
            .replace(/≠/g, '!=')
            .replace(/π/g, 'pi');
        
        return answer;
    }
    
    // Check if answers match with flexible formatting
    static matches(userAnswer, correctAnswer, options = {}) {
        // Normalize both answers
        const normalizedUser = this.normalize(userAnswer);
        const normalizedCorrect = this.normalize(correctAnswer);
        
        // Direct match
        if (normalizedUser === normalizedCorrect) {
            return true;
        }
        
        // Check alternate answers if provided
        if (options.alternates) {
            for (const alt of options.alternates) {
                if (this.normalize(alt) === normalizedUser) {
                    return true;
                }
            }
        }
        
        // Special checks based on answer type
        const answerType = this.detectAnswerType(correctAnswer);
        
        switch (answerType) {
            case 'list':
                return this.checkListAnswer(userAnswer, correctAnswer);
            case 'ratio':
                return this.checkRatioAnswer(userAnswer, correctAnswer);
            case 'coordinate':
                return this.checkCoordinateAnswer(userAnswer, correctAnswer);
            case 'decimal':
                return this.checkDecimalAnswer(userAnswer, correctAnswer);
            case 'fraction':
                return this.checkFractionAnswer(userAnswer, correctAnswer);
            case 'algebraic':
                return this.checkAlgebraicAnswer(userAnswer, correctAnswer);
            default:
                return false;
        }
    }
    
    // Detect answer type
    static detectAnswerType(answer) {
        const normalized = answer.toString().toLowerCase();
        
        if (normalized.includes(',') || /\s+/.test(normalized.trim())) {
            return 'list';
        }
        if (normalized.includes(':')) {
            return 'ratio';
        }
        if (normalized.includes('(') && normalized.includes(')') && normalized.includes(',')) {
            return 'coordinate';
        }
        if (normalized.includes('.')) {
            return 'decimal';
        }
        if (normalized.includes('/') && !/[a-z]/.test(normalized)) {
            return 'fraction';
        }
        if (/[a-z]/.test(normalized) || normalized.includes('+') || normalized.includes('-')) {
            return 'algebraic';
        }
        return 'number';
    }
    
    // Check list answers (e.g., "1,2,4,8" or "1 2 4 8")
    static checkListAnswer(userAnswer, correctAnswer) {
        // Extract numbers from both answers
        const userNumbers = this.extractNumbers(userAnswer);
        const correctNumbers = this.extractNumbers(correctAnswer);
        
        // Check if arrays match (order matters)
        if (userNumbers.length !== correctNumbers.length) {
            return false;
        }
        
        return userNumbers.every((num, index) => {
            return Math.abs(num - correctNumbers[index]) < 0.0001;
        });
    }
    
    // Extract numbers from a string
    static extractNumbers(str) {
        // Match numbers including decimals and negatives
        const matches = str.match(/-?\d+\.?\d*/g);
        return matches ? matches.map(Number) : [];
    }
    
    // Check ratio answers (e.g., "2:3" or "2 : 3")
    static checkRatioAnswer(userAnswer, correctAnswer) {
        const userParts = this.extractNumbers(userAnswer);
        const correctParts = this.extractNumbers(correctAnswer);
        
        if (userParts.length !== correctParts.length) {
            return false;
        }
        
        // Check if ratios are equivalent
        if (userParts.length === 2 && correctParts.length === 2) {
            // Check if ratios are proportional
            const ratio1 = userParts[0] / userParts[1];
            const ratio2 = correctParts[0] / correctParts[1];
            return Math.abs(ratio1 - ratio2) < 0.0001;
        }
        
        // For multi-part ratios, check exact match
        return userParts.every((num, index) => {
            return num === correctParts[index];
        });
    }
    
    // Check coordinate answers (e.g., "(3,4)" or "3,4" or "3 4")
    static checkCoordinateAnswer(userAnswer, correctAnswer) {
        const userCoords = this.extractNumbers(userAnswer);
        const correctCoords = this.extractNumbers(correctAnswer);
        
        if (userCoords.length !== correctCoords.length) {
            return false;
        }
        
        return userCoords.every((coord, index) => {
            return Math.abs(coord - correctCoords[index]) < 0.0001;
        });
    }
    
    // Check decimal answers with tolerance
    static checkDecimalAnswer(userAnswer, correctAnswer, tolerance = 0.01) {
        const userNum = parseFloat(userAnswer);
        const correctNum = parseFloat(correctAnswer);
        
        if (isNaN(userNum) || isNaN(correctNum)) {
            return false;
        }
        
        return Math.abs(userNum - correctNum) <= tolerance;
    }
    
    // Check fraction answers
    static checkFractionAnswer(userAnswer, correctAnswer) {
        // Convert fractions to decimals for comparison
        const userValue = this.evaluateFraction(userAnswer);
        const correctValue = this.evaluateFraction(correctAnswer);
        
        if (userValue === null || correctValue === null) {
            return false;
        }
        
        return Math.abs(userValue - correctValue) < 0.0001;
    }
    
    // Evaluate a fraction string
    static evaluateFraction(fraction) {
        const parts = fraction.split('/');
        if (parts.length !== 2) {
            return parseFloat(fraction);
        }
        
        const numerator = parseFloat(parts[0]);
        const denominator = parseFloat(parts[1]);
        
        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
            return null;
        }
        
        return numerator / denominator;
    }
    
    // Check algebraic answers
    static checkAlgebraicAnswer(userAnswer, correctAnswer) {
        // Normalize algebraic expressions
        let normalizedUser = this.normalizeAlgebra(userAnswer);
        let normalizedCorrect = this.normalizeAlgebra(correctAnswer);
        
        // Direct match after normalization
        if (normalizedUser === normalizedCorrect) {
            return true;
        }
        
        // Try commutative property for addition/multiplication
        if (this.checkCommutative(normalizedUser, normalizedCorrect)) {
            return true;
        }
        
        return false;
    }
    
    // Normalize algebraic expressions
    static normalizeAlgebra(expr) {
        return expr
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/\*/g, '')
            .replace(/×/g, '')
            .replace(/\^/g, '**')
            .replace(/²/g, '**2')
            .replace(/³/g, '**3');
    }
    
    // Check if expressions are equivalent considering commutative property
    static checkCommutative(expr1, expr2) {
        // Simple check for addition/multiplication commutativity
        // This is a basic implementation - could be expanded
        
        // Sort terms for comparison
        const terms1 = expr1.split(/[+*]/).sort().join('');
        const terms2 = expr2.split(/[+*]/).sort().join('');
        
        return terms1 === terms2;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnswerChecker;
}