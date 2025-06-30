// Math Input Helper for Mobile Devices
// Provides math symbol buttons and saves work to localStorage

class MathInput {
    constructor() {
        this.currentTextArea = null;
        this.workHistory = JSON.parse(localStorage.getItem('mathWorkHistory') || '{}');
    }

    // Create math symbol keyboard
    createMathKeyboard() {
        const symbols = [
            { symbol: '²', label: 'x²' },
            { symbol: '³', label: 'x³' },
            { symbol: '×', label: '×' },
            { symbol: '÷', label: '÷' },
            { symbol: '±', label: '±' },
            { symbol: '√', label: '√' },
            { symbol: 'π', label: 'π' },
            { symbol: '≈', label: '≈' },
            { symbol: '≤', label: '≤' },
            { symbol: '≥', label: '≥' },
            { symbol: '≠', label: '≠' },
            { symbol: '∞', label: '∞' },
            { symbol: 'Δ', label: 'Δ' },
            { symbol: '∑', label: '∑' },
            { symbol: '¹⁄₂', label: '½' },
            { symbol: '¹⁄₃', label: '⅓' },
            { symbol: '¹⁄₄', label: '¼' },
            { symbol: '³⁄₄', label: '¾' },
            { symbol: 'α', label: 'α' },
            { symbol: 'β', label: 'β' },
            { symbol: 'θ', label: 'θ' },
            { symbol: '°', label: '°' },
            { symbol: '(', label: '(' },
            { symbol: ')', label: ')' }
        ];

        const keyboard = document.createElement('div');
        keyboard.className = 'math-keyboard';
        keyboard.innerHTML = `
            <div class="math-keyboard-header">
                <span>Math Symbols</span>
                <button class="close-keyboard" onclick="mathInput.hideKeyboard()">✕</button>
            </div>
            <div class="math-symbols">
                ${symbols.map(s => `
                    <button class="math-symbol-btn" onclick="mathInput.insertSymbol('${s.symbol}')">
                        ${s.label}
                    </button>
                `).join('')}
            </div>
            <div class="math-keyboard-footer">
                <button class="math-action-btn" onclick="mathInput.insertSymbol('\\n')">New Line</button>
                <button class="math-action-btn" onclick="mathInput.clearWork()">Clear</button>
            </div>
        `;
        
        return keyboard;
    }

    // Show math keyboard
    showKeyboard(textAreaId) {
        this.currentTextArea = document.getElementById(textAreaId);
        const keyboard = document.getElementById('mathKeyboard');
        if (keyboard) {
            keyboard.classList.add('show');
            // Prevent body scroll on mobile when keyboard is open
            document.body.style.overflow = 'hidden';
        }
    }

    // Hide math keyboard
    hideKeyboard() {
        const keyboard = document.getElementById('mathKeyboard');
        if (keyboard) {
            keyboard.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Insert symbol at cursor position
    insertSymbol(symbol) {
        if (!this.currentTextArea) return;
        
        const start = this.currentTextArea.selectionStart;
        const end = this.currentTextArea.selectionEnd;
        const text = this.currentTextArea.value;
        
        const newText = text.substring(0, start) + symbol + text.substring(end);
        this.currentTextArea.value = newText;
        
        // Set cursor position after inserted symbol
        const newPos = start + symbol.length;
        this.currentTextArea.setSelectionRange(newPos, newPos);
        this.currentTextArea.focus();
        
        // Save work automatically
        this.saveWork();
    }

    // Clear work area
    clearWork() {
        if (this.currentTextArea) {
            this.currentTextArea.value = '';
            this.saveWork();
        }
    }

    // Save work to localStorage
    saveWork() {
        if (!this.currentTextArea) return;
        
        const topicId = window.currentTopicId || 'unknown';
        const problemId = window.currentProblem || 0;
        const timestamp = Date.now();
        
        // Initialize topic history if not exists
        if (!this.workHistory[topicId]) {
            this.workHistory[topicId] = {};
        }
        
        // Save work for this problem
        this.workHistory[topicId][problemId] = {
            work: this.currentTextArea.value,
            timestamp: timestamp,
            answer: document.getElementById('answerInput')?.value || ''
        };
        
        localStorage.setItem('mathWorkHistory', JSON.stringify(this.workHistory));
    }

    // Load previous work
    loadWork(topicId, problemId) {
        if (this.workHistory[topicId] && this.workHistory[topicId][problemId]) {
            const savedWork = this.workHistory[topicId][problemId];
            const workArea = document.getElementById('workArea');
            const answerInput = document.getElementById('answerInput');
            
            if (workArea && savedWork.work) {
                workArea.value = savedWork.work;
            }
            if (answerInput && savedWork.answer) {
                answerInput.value = savedWork.answer;
            }
            
            return savedWork;
        }
        return null;
    }

    // Export all work history for teacher review
    exportWorkHistory() {
        const progress = JSON.parse(localStorage.getItem('minecraftMathsProgress') || '{}');
        const exportData = {
            studentWork: this.workHistory,
            progress: progress,
            exportDate: new Date().toISOString(),
            totalProblemsAttempted: Object.keys(this.workHistory).reduce((total, topic) => 
                total + Object.keys(this.workHistory[topic]).length, 0
            )
        };
        
        return exportData;
    }

    // Generate teacher report
    generateTeacherReport() {
        const data = this.exportWorkHistory();
        let report = '# Minecraft Maths - Student Work Report\n\n';
        report += `**Export Date:** ${new Date(data.exportDate).toLocaleString()}\n`;
        report += `**Total XP:** ${data.progress.xp || 0}\n`;
        report += `**Total Emeralds:** ${data.progress.emeralds || 0}\n`;
        report += `**Problems Attempted:** ${data.totalProblemsAttempted}\n\n`;
        
        // Add work history by topic
        for (const [topicId, problems] of Object.entries(data.studentWork)) {
            report += `## Topic: ${topicId}\n\n`;
            
            for (const [problemId, work] of Object.entries(problems)) {
                report += `### Problem ${parseInt(problemId) + 1}\n`;
                report += `**Time:** ${new Date(work.timestamp).toLocaleString()}\n`;
                report += `**Work Shown:**\n\`\`\`\n${work.work || 'No work shown'}\n\`\`\`\n`;
                report += `**Answer Given:** ${work.answer || 'No answer'}\n\n`;
            }
        }
        
        return report;
    }

    // Download report as file
    downloadReport() {
        const report = this.generateTeacherReport();
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `math-work-report-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize math input helper
const mathInput = new MathInput();

// Add CSS for math keyboard
const mathKeyboardStyles = `
    .math-keyboard {
        position: fixed;
        bottom: -100%;
        left: 0;
        right: 0;
        background: var(--mc-dark);
        border-top: 3px solid var(--mc-emerald);
        transition: bottom 0.3s ease;
        z-index: 1000;
        max-height: 50vh;
        overflow-y: auto;
        padding-bottom: env(safe-area-inset-bottom);
    }
    
    .math-keyboard.show {
        bottom: 0;
    }
    
    .math-keyboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        background: var(--mc-stone);
        color: white;
        font-weight: bold;
    }
    
    .close-keyboard {
        background: transparent;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 4px 8px;
    }
    
    .math-symbols {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 8px;
        padding: var(--spacing-md);
    }
    
    @media (max-width: 480px) {
        .math-symbols {
            grid-template-columns: repeat(4, 1fr);
        }
    }
    
    .math-symbol-btn {
        background: var(--bg-card);
        border: 2px solid var(--border-color);
        color: var(--text-primary);
        padding: 12px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        min-height: 48px;
    }
    
    .math-symbol-btn:active {
        background: var(--mc-emerald);
        transform: scale(0.95);
    }
    
    .math-keyboard-footer {
        display: flex;
        gap: 8px;
        padding: 0 var(--spacing-md) var(--spacing-md);
    }
    
    .math-action-btn {
        flex: 1;
        background: var(--mc-diamond);
        color: white;
        border: none;
        padding: 12px;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
    }
    
    .math-action-btn:active {
        background: var(--mc-dark-diamond);
    }
    
    .work-area-container {
        position: relative;
    }
    
    .math-keyboard-toggle {
        position: absolute;
        right: 8px;
        top: 8px;
        background: var(--mc-emerald);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .teacher-export-btn {
        background: var(--mc-gold);
        color: var(--mc-dark);
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        margin: var(--spacing-md);
        display: block;
        width: calc(100% - 2 * var(--spacing-md));
    }
    
    .teacher-export-btn:active {
        background: var(--mc-dark-gold);
    }
`;

// Add styles to page
const styleElement = document.createElement('style');
styleElement.textContent = mathKeyboardStyles;
document.head.appendChild(styleElement);