// Script to create remaining topic HTML files
const fs = require('fs');
const path = require('path');

const remainingTopics = [
    {
        id: 'scatter-graphs',
        title: 'Scatter Graphs',
        subtitle: 'Mob Spawning',
        icon: '📊',
        problems: 10,
        xpPerProblem: 12,
        description: 'Plot mob spawn patterns and find correlations'
    },
    {
        id: 'two-way-tables',
        title: 'Two-Way Tables',
        subtitle: 'Inventory Management', 
        icon: '📋',
        problems: 10,
        xpPerProblem: 10,
        description: 'Organize your items with frequency tables'
    },
    {
        id: 'enlargement',
        title: 'Enlargement',
        subtitle: 'Map Scaling',
        icon: '🗺️',
        problems: 12,
        xpPerProblem: 16,
        description: 'Scale builds and maps with precision'
    },
    {
        id: 'estimations',
        title: 'Estimations',
        subtitle: 'Resource Planning',
        icon: '📏',
        problems: 10,
        xpPerProblem: 10,
        description: 'Estimate materials for mega builds'
    },
    {
        id: 'expanding-brackets',
        title: 'Expanding Brackets',
        subtitle: 'TNT Calculations',
        icon: '💥',
        problems: 14,
        xpPerProblem: 14,
        description: 'Calculate TNT blast patterns'
    },
    {
        id: 'factorising',
        title: 'Factorising',
        subtitle: 'Enchantment Tables',
        icon: '✨',
        problems: 12,
        xpPerProblem: 16,
        description: 'Factor enchantment combinations'
    },
    {
        id: 'simultaneous-equations',
        title: 'Simultaneous Equations',
        subtitle: 'The End Portal',
        icon: '🌌',
        problems: 10,
        xpPerProblem: 18,
        description: 'Solve the final mathematical challenge'
    }
];

const templateHTML = (topic) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>${topic.title} - ${topic.subtitle} | Minecraft Maths</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="topic-styles.css">
</head>
<body>
    <div class="topic-container">
        <!-- Topic Header -->
        <header class="topic-header">
            <button class="back-btn" onclick="window.location.href='../index.html'">
                <span>←</span>
            </button>
            <div class="topic-info">
                <h1 class="topic-title">${topic.title}</h1>
                <p class="topic-subtitle">${topic.subtitle}</p>
            </div>
            <div class="topic-stats">
                <span class="problems-count">0/${topic.problems}</span>
            </div>
        </header>

        <!-- Progress Bar -->
        <div class="topic-progress-bar">
            <div class="progress-fill" id="topicProgress"></div>
        </div>

        <!-- Intro Section -->
        <section class="intro-section" id="introSection">
            <div class="intro-card">
                <div class="intro-icon">${topic.icon}</div>
                <h2>Welcome to ${topic.subtitle}!</h2>
                <p>${topic.description}</p>
                
                <div class="key-concepts">
                    <h3>🔑 Key Concepts:</h3>
                    <ul>
                        <li>Master ${topic.title.toLowerCase()} techniques</li>
                        <li>Apply skills to Minecraft scenarios</li>
                        <li>Earn emeralds for correct answers</li>
                        <li>Complete all problems to unlock rewards</li>
                    </ul>
                </div>
                
                <button class="start-quest-btn" onclick="startQuest()">
                    Start Quest
                </button>
            </div>
        </section>

        <!-- Problem Section -->
        <section class="problem-section" id="problemSection" style="display: none;">
            <div class="problem-card">
                <div class="problem-header">
                    <span class="problem-number">Problem 1/${topic.problems}</span>
                    <span class="problem-xp">+${topic.xpPerProblem} XP</span>
                </div>
                
                <div class="problem-content" id="problemContent">
                    <!-- Problem will be inserted here -->
                </div>
                
                <div class="work-area">
                    <h3>Your Working:</h3>
                    <textarea 
                        id="workArea" 
                        class="work-input" 
                        placeholder="Show your working here..."
                        rows="4"
                    ></textarea>
                </div>
                
                <div class="answer-area">
                    <label for="answerInput">Your Answer:</label>
                    <input 
                        type="text" 
                        id="answerInput" 
                        class="answer-input" 
                        placeholder="Enter your answer"
                    >
                </div>
                
                <div class="action-buttons">
                    <button class="hint-btn" onclick="showHint()">
                        💡 Hint (-5 XP)
                    </button>
                    <button class="check-btn" onclick="checkAnswer()">
                        ✓ Check Answer
                    </button>
                </div>
                
                <div class="hint-box" id="hintBox" style="display: none;">
                    <!-- Hint will be inserted here -->
                </div>
                
                <div class="feedback-box" id="feedbackBox" style="display: none;">
                    <!-- Feedback will be inserted here -->
                </div>
            </div>
        </section>

        <!-- Success Modal -->
        <div class="modal" id="successModal">
            <div class="modal-content success">
                <div class="modal-icon">✅</div>
                <h2>Correct!</h2>
                <p id="successMessage">Well done!</p>
                <div class="xp-earned">+${topic.xpPerProblem} XP</div>
                <button class="continue-btn" onclick="nextProblem()">
                    Continue →
                </button>
            </div>
        </div>

        <!-- Completion Modal -->
        <div class="modal" id="completionModal">
            <div class="modal-content completion">
                <div class="modal-icon">🏆</div>
                <h2>Quest Complete!</h2>
                <p>You've mastered ${topic.title}!</p>
                <div class="completion-stats">
                    <div class="stat">
                        <span class="stat-value" id="totalXP">0</span>
                        <span class="stat-label">XP Earned</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value" id="totalEmeralds">0</span>
                        <span class="stat-label">💚 Earned</span>
                    </div>
                </div>
                <button class="home-btn" onclick="window.location.href='../index.html'">
                    Back to Home
                </button>
            </div>
        </div>
    </div>

    <script>
        // Placeholder problems - would be customized for each topic
        const problems = Array.from({length: ${topic.problems}}, (_, i) => ({
            id: i + 1,
            question: \`${topic.title} problem \${i + 1}\`,
            hint: "Think about the key concepts",
            answer: "varies",
            solution: "Step by step solution"
        }));

        // Game state
        let currentProblem = 0;
        let score = 0;
        let emeraldsEarned = 0;
        let hintsUsed = 0;
        let attempts = {};

        // Base game logic (same for all topics)
        function startQuest() {
            document.getElementById('introSection').style.display = 'none';
            document.getElementById('problemSection').style.display = 'block';
            showProblem();
        }

        function showProblem() {
            const problem = problems[currentProblem];
            document.querySelector('.problem-number').textContent = \`Problem \${currentProblem + 1}/${topic.problems}\`;
            document.getElementById('problemContent').innerHTML = \`
                <div class="problem-question">\${problem.question}</div>
            \`;
            
            // Reset UI
            document.getElementById('workArea').value = '';
            document.getElementById('answerInput').value = '';
            document.getElementById('hintBox').style.display = 'none';
            document.getElementById('feedbackBox').style.display = 'none';
            document.querySelector('.hint-btn').disabled = false;
            
            updateProgress();
        }

        function showHint() {
            const problem = problems[currentProblem];
            document.getElementById('hintBox').innerHTML = \`
                <p><strong>💡 Hint:</strong> \${problem.hint}</p>
            \`;
            document.getElementById('hintBox').style.display = 'block';
            hintsUsed++;
            document.querySelector('.hint-btn').disabled = true;
        }

        function checkAnswer() {
            // Simplified check - in real implementation would check actual answers
            const userAnswer = document.getElementById('answerInput').value.trim();
            
            if (!userAnswer) {
                showFeedback('Please enter an answer!', false);
                return;
            }
            
            // For demo, accept any answer
            let xp = ${topic.xpPerProblem};
            if (document.querySelector('.hint-btn').disabled) xp -= 5;
            
            score += xp;
            let emeraldReward = 2;
            emeraldsEarned += emeraldReward;
            awardEmeralds(emeraldReward);
            
            document.querySelector('.xp-earned').textContent = \`+\${xp} XP & \${emeraldReward}💚\`;
            document.getElementById('successModal').classList.add('show');
            
            saveProgress();
        }

        function showFeedback(message, isSuccess) {
            const feedbackBox = document.getElementById('feedbackBox');
            feedbackBox.className = \`feedback-box \${isSuccess ? 'success' : 'error'}\`;
            feedbackBox.innerHTML = \`<p>\${message}</p>\`;
            feedbackBox.style.display = 'block';
        }

        function nextProblem() {
            document.getElementById('successModal').classList.remove('show');
            currentProblem++;
            
            if (currentProblem >= problems.length) {
                showCompletion();
            } else {
                showProblem();
            }
        }

        function showCompletion() {
            document.getElementById('totalXP').textContent = score;
            document.getElementById('totalEmeralds').textContent = emeraldsEarned;
            document.getElementById('completionModal').classList.add('show');
            updateMainProgress();
        }

        function updateProgress() {
            const progress = (currentProblem / problems.length) * 100;
            document.getElementById('topicProgress').style.width = progress + '%';
            document.querySelector('.problems-count').textContent = \`\${currentProblem}/${topic.problems}\`;
        }

        function saveProgress() {
            const progress = {
                topicId: '${topic.id}',
                completed: currentProblem,
                score: score,
                hintsUsed: hintsUsed,
                timestamp: Date.now()
            };
            
            let allProgress = JSON.parse(localStorage.getItem('minecraftMathsProgress') || '{}');
            if (!allProgress.topics) allProgress.topics = [];
            
            const topicIndex = allProgress.topics.findIndex(t => t.id === '${topic.id}');
            if (topicIndex >= 0) {
                allProgress.topics[topicIndex].completed = currentProblem;
            } else {
                allProgress.topics.push({ id: '${topic.id}', completed: currentProblem });
            }
            
            allProgress.xp = (allProgress.xp || 0) + ${topic.xpPerProblem};
            localStorage.setItem('minecraftMathsProgress', JSON.stringify(allProgress));
        }

        function updateMainProgress() {
            let allProgress = JSON.parse(localStorage.getItem('minecraftMathsProgress') || '{}');
            
            if (!allProgress.topics) allProgress.topics = [];
            const topicIndex = allProgress.topics.findIndex(t => t.id === '${topic.id}');
            if (topicIndex >= 0) {
                allProgress.topics[topicIndex].completed = problems.length;
            }
            
            allProgress.xp = (allProgress.xp || 0) + 50;
            allProgress.emeralds = (allProgress.emeralds || 0) + Math.floor(${topic.problems} / 2);
            
            localStorage.setItem('minecraftMathsProgress', JSON.stringify(allProgress));
        }

        function awardEmeralds(amount) {
            let allProgress = JSON.parse(localStorage.getItem('minecraftMathsProgress') || '{}');
            allProgress.emeralds = (allProgress.emeralds || 0) + amount;
            localStorage.setItem('minecraftMathsProgress', JSON.stringify(allProgress));
        }

        // Event listeners
        document.getElementById('successModal').addEventListener('click', function(e) {
            if (e.target === this) {
                nextProblem();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && document.activeElement === document.getElementById('answerInput')) {
                checkAnswer();
            }
        });
    </script>
</body>
</html>`;

// Create files
remainingTopics.forEach(topic => {
    const filePath = path.join(__dirname, 'topics', `${topic.id}.html`);
    fs.writeFileSync(filePath, templateHTML(topic));
    console.log(`Created ${filePath}`);
});

console.log('All topic files created!');