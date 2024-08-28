document.addEventListener('DOMContentLoaded', () => {
    const addTeamSection = document.getElementById('add-team-section');
    const addTeamButton = document.getElementById('add-team-button');
    const startGameButton = document.getElementById('start-game-button');
    const teamNameInput = document.getElementById('team-name-input');
    const teamScoresContainer = document.getElementById('team-scores');
    const gameSection = document.getElementById('game-section');
    const teamList = document.getElementById('team-list');
    const modal = document.getElementById('modal');
    const modalQuestion = document.getElementById('modal-question');
    const modalImage = document.getElementById('modal-image');
    const modalAnswer = document.getElementById('modal-answer');
    const showAnswerButton = document.getElementById('show-answer');
    const closeButton = document.querySelector('.close-button');
    const teamSelectionModal = document.getElementById('team-selection-modal');
    const teamSelectionButtonsContainer = document.getElementById('team-selection-buttons');
    const cancelSelectionButton = document.getElementById('cancel-selection');
    const questions = document.querySelectorAll('.question');
    const incorrectButton = document.getElementById('incorrect-button');
    const correctButton = document.getElementById('correct-button');

    let teams = [];
    let currentQuestionValue = 0;
    let currentAction = null; // "add" or "subtract"
    let lastWinningTeamIndex = null;
    let specialQuestions = [];
    let currentSpecialQuestion = null;
    let unansweredQuestions = [];
    let answeredQuestions = [];

    function updateTeamScores() {
        teamScoresContainer.innerHTML = '';
        teams.forEach((team, index) => {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'team';
            teamDiv.dataset.teamIndex = index; // Set a data attribute to keep track of the team index
            const scoreColor = team.score < 0 ? 'red' : 'white'; // Determine score color based on value
            teamDiv.innerHTML = `<h3>${team.name}</h3><p id="team-${index}-score" style="color: ${scoreColor};">${team.score}</p>`;
            teamScoresContainer.appendChild(teamDiv);
        });
    }

    function updateTeamButtons() {
        teamSelectionButtonsContainer.innerHTML = '';
        teams.forEach((team, index) => {
            const button = document.createElement('button');
            button.textContent = team.name;
            button.className = 'team-select-button';
            button.setAttribute('data-team-index', index);
            teamSelectionButtonsContainer.appendChild(button);
        });
    }

    function addTeamToList(teamName) {
        const teamItem = document.createElement('div');
        teamItem.className = 'team-list-item';
        teamItem.textContent = teamName;
        teamList.appendChild(teamItem);
        teamItem.classList.add('shake');
    }

    function highlightTeam(index) {
        // Remove previous highlights
        document.querySelectorAll('.team').forEach(team => {
            team.classList.remove('highlighted-team');
            team.classList.remove('round-winner');
        });
        // Highlight the team at the given index
        const teamElements = document.querySelectorAll('.team');
        if (teamElements[index]) {
            teamElements[index].classList.add('highlighted-team');
        }
    }

    function highlightWinningTeam(index) {
        const teamElements = document.querySelectorAll('#team-scores .team');

        // Remove previous round-winner highlight
        teamElements.forEach(team => team.classList.remove('round-winner'));

        // Highlight the new correct team's box
        if (teamElements[index]) {
            teamElements[index].classList.add('round-winner');
        }

        // Update the global variable with the current winner's index
        lastWinningTeamIndex = index;
    }

    function placeSpecialQuestions() {
        unansweredQuestions = Array.from(questions).filter(q => {
            const value = parseInt(q.textContent, 10);
            return value >= 300 && value <= 500 && !q.classList.contains('viewed');
        });

        specialQuestions = [];
        while (specialQuestions.length < 2 && unansweredQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
            const question = unansweredQuestions[randomIndex];

            if (!specialQuestions.includes(question)) {
                specialQuestions.push(question);
                unansweredQuestions.splice(randomIndex, 1); // Remove from unansweredQuestions after assigning
            }
        }
    }

    function reassignSpecialQuestion() {
        if (unansweredQuestions.length > 0) {
            const nextQuestion = unansweredQuestions.shift(); // Take the first unanswered question
            specialQuestions.push(nextQuestion);
            specialQuestions = [...new Set(specialQuestions)]; // Ensure no duplicates
        }
    }

    function handleSpecialQuestion(question) {
        currentSpecialQuestion = question; // Set the current special question

        const lastWinningTeam = teams[lastWinningTeamIndex];
        if (lastWinningTeam.score > 0) {
            showSpecialQuestionEffect();

            setTimeout(() => {
                promptWagerAmount(lastWinningTeam);
            }, 4000); // Show wager prompt after the "Hõbevillak" effect
        } else {
            // If the team is not eligible, reveal the question and reassign the special question
            specialQuestions = specialQuestions.filter(q => q !== question); // Remove special status from the question
            showSpecialQuestion(question);
            reassignSpecialQuestion(); // Reassign the special question to another unanswered question
        }
    }

    function promptWagerAmount(team) {
        const wager = prompt(`How much would ${team.name} like to wager? (1 to ${team.score})`);

        if (wager !== null) {
            const wagerAmount = parseInt(wager, 10);
            if (wagerAmount > 0 && wagerAmount <= team.score) {
                currentQuestionValue = wagerAmount;
                showSpecialQuestion(currentSpecialQuestion);
            } else {
                alert("Invalid wager amount. Please try again.");
                promptWagerAmount(team); // Retry if invalid wager
            }
        }
    }

    function showSpecialQuestionEffect() {
        const specialEffectDiv = document.getElementById('special-question-effect');
        specialEffectDiv.classList.remove('hidden');
        specialEffectDiv.style.display = 'block';

        setTimeout(() => {
            specialEffectDiv.style.display = 'none';
        }, 4000); // Hide after 4 seconds
    }

    function showSpecialQuestion(question) {
        const questionText = question.getAttribute('data-question');
        const answerText = question.getAttribute('data-answer');
        const imageUrl = question.getAttribute('data-image');

        modalQuestion.textContent = questionText;
        modalAnswer.textContent = answerText;
        if (imageUrl) {
            modalImage.src = imageUrl;
            modalImage.style.display = 'block'; // Make sure the image is visible
        } else {
            modalImage.style.display = 'none'; // Hide the image if no image URL is provided
        }
        modalAnswer.style.display = 'none';
        modal.style.display = 'flex';

        question.classList.add('viewed');

        // Move the question from unanswered to answered
        unansweredQuestions = unansweredQuestions.filter(q => q !== question);
        answeredQuestions.push(question);
    }

    addTeamButton.addEventListener('click', () => {
        const teamName = teamNameInput.value.trim();
        if (teamName !== '' && teams.length < 6) {
            teams.push({ name: teamName, score: 0 });
            updateTeamScores();
            updateTeamButtons();
            addTeamToList(teamName); // Add the team to the list below the form
            teamNameInput.value = '';
        }
    });

    startGameButton.addEventListener('click', () => {
        if (teams.length > 0) {
            addTeamSection.style.display = 'none';
            gameSection.style.display = 'block';
            updateTeamButtons();
            placeSpecialQuestions(); // Place special questions after starting the game

            // Mark a random team as the initial correct one
            const randomTeamIndex = Math.floor(Math.random() * teams.length);
            highlightWinningTeam(randomTeamIndex);  // Mark the team in the "correct" state
        }
    });

    questions.forEach(question => {
        question.addEventListener('click', () => {
            if (specialQuestions.includes(question) && lastWinningTeamIndex !== null) {
                const lastWinningTeam = teams[lastWinningTeamIndex];

                if (lastWinningTeam.score > 0) {
                    handleSpecialQuestion(question); // Handle the special question
                } else {
                    // If not eligible, just reveal the question and move the special status to another question
                    specialQuestions = specialQuestions.filter(q => q !== question);
                    showSpecialQuestion(question);
                    reassignSpecialQuestion(); // Reassign the special question to another unanswered question
                }
            } else {
                // Regular question flow
                const questionText = question.getAttribute('data-question');
                const answerText = question.getAttribute('data-answer');
                const imageUrl = question.getAttribute('data-image');
                currentQuestionValue = parseInt(question.textContent, 10);

                modalQuestion.textContent = questionText;
                modalAnswer.textContent = answerText;
                if (imageUrl) {
                    modalImage.src = imageUrl;
                    modalImage.style.display = 'block'; // Make sure the image is visible
                } else {
                    modalImage.style.display = 'none'; // Hide the image if no image URL is provided
                }
                modalAnswer.style.display = 'none';
                modal.style.display = 'flex';

                question.classList.add('viewed');

                // Move the question from unanswered to answered
                unansweredQuestions = unansweredQuestions.filter(q => q !== question);
                answeredQuestions.push(question);
            }
        });
    });

    showAnswerButton.addEventListener('click', () => {
        modalAnswer.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        const viewedQuestion = document.querySelector('.viewed');
        if (viewedQuestion) {
            viewedQuestion.style.visibility = 'hidden';
            viewedQuestion.classList.remove('viewed');
        }
    });

    incorrectButton.addEventListener('click', () => {
        currentAction = 'subtract';
        teamSelectionModal.style.display = 'flex';
    });

    correctButton.addEventListener('click', () => {
        currentAction = 'add';
        teamSelectionModal.style.display = 'flex';
    });

    teamSelectionButtonsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('team-select-button')) {
            const teamIndex = parseInt(event.target.getAttribute('data-team-index'), 10);
            const team = teams[teamIndex];

            if (currentAction === 'add') {
                // Update the highlight and scores only on correct answers
                team.score += currentQuestionValue;
                updateTeamScores();
                highlightWinningTeam(teamIndex); // Highlight the team only if they answered correctly
            } else if (currentAction === 'subtract') {
                team.score -= currentQuestionValue;
                updateTeamScores();
                // Reapply the last correct highlight
                if (lastWinningTeamIndex !== null) {
                    highlightWinningTeam(lastWinningTeamIndex);
                }
            }

            // Change the score color to red if it goes below zero
            const scoreElement = document.getElementById(`team-${teamIndex}-score`);
            if (team.score < 0) {
                scoreElement.style.color = 'red';
            } else {
                scoreElement.style.color = 'white'; // Reset to default color
            }

            teamSelectionModal.style.display = 'none';
        }
    });

    cancelSelectionButton.addEventListener('click', () => {
        teamSelectionModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            const viewedQuestion = document.querySelector('.viewed');
            if (viewedQuestion) {
                viewedQuestion.style.visibility = 'hidden';
                viewedQuestion.classList.remove('viewed');
            }
        }
    });
});
