// Quiz Maker Application
class QuizMaker {
  constructor() {
    this.quizzes = this.loadQuizzes();
    this.currentQuizIndex = null;
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.displayQuizzes();
  }

  // Load quizzes from localStorage
  loadQuizzes() {
    const saved = localStorage.getItem('quizzes');
    return saved ? JSON.parse(saved) : [];
  }

  // Save quizzes to localStorage
  saveQuizzes() {
    localStorage.setItem('quizzes', JSON.stringify(this.quizzes));
  }

  // Setup all event listeners
  setupEventListeners() {
    // Navigation buttons
    document.getElementById('homeBtn').addEventListener('click', () => this.showView('homeView'));
    document.getElementById('myQuizzesBtn').addEventListener('click', () => this.showView('listingView', () => this.displayQuizzes()));

    // Home view buttons
    document.getElementById('createQuizBtn').addEventListener('click', () => {
      this.resetQuizForm();
      this.showView('createView');
    });

    document.getElementById('browseQuizzesBtn').addEventListener('click', () => {
      this.showView('listingView', () => this.displayQuizzes());
    });

    // Create view buttons
    document.getElementById('addQuestionBtn').addEventListener('click', () => this.addQuestion());
    document.getElementById('cancelCreateBtn').addEventListener('click', () => this.showView('homeView'));
    document.getElementById('createFirstQuizBtn').addEventListener('click', () => {
      this.resetQuizForm();
      this.showView('createView');
    });

    // Quiz form submission
    document.getElementById('quizForm').addEventListener('submit', (e) => this.handleQuizSubmit(e));

    // Taking quiz navigation
    document.getElementById('prevBtn').addEventListener('click', () => this.previousQuestion());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
    document.getElementById('submitQuizBtn').addEventListener('click', () => this.submitQuiz());

    // Results actions
    document.getElementById('retakeQuizBtn').addEventListener('click', () => this.retakeQuiz());
    document.getElementById('backToListBtn').addEventListener('click', () => {
      this.showView('listingView', () => this.displayQuizzes());
    });
  }

  // Show/Hide views
  showView(viewId, callback = null) {
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    if (callback) callback();
  }

  // Reset quiz form
  resetQuizForm() {
    document.getElementById('quizForm').reset();
    document.getElementById('questionsContainer').innerHTML = '<h3>Questions</h3>';
    this.addQuestion(); // Add one default question
  }

  // Add question input
  addQuestion() {
    const container = document.getElementById('questionsContainer');
    const questionCount = container.querySelectorAll('.question-item').length + 1;
    
    const questionHTML = `
      <div class="question-item">
        <h4>Question ${questionCount}</h4>
        <input type="text" class="question-title" placeholder="Enter question text" required>
        <div class="options-container">
          <input type="text" class="option-input" placeholder="Option 1" required>
          <input type="text" class="option-input" placeholder="Option 2" required>
          <input type="text" class="option-input" placeholder="Option 3" required>
          <input type="text" class="option-input" placeholder="Option 4" required>
        </div>
        <label>
          <input type="number" class="correct-option" min="1" max="4" value="1" required>
          Correct Answer (1-4)
        </label>
        <button type="button" class="btn btn-outline" onclick="quizMaker.removeQuestion(this)">Remove Question</button>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', questionHTML);
  }

  // Remove question
  removeQuestion(btn) {
    btn.parentElement.remove();
  }

  // Handle quiz form submission
  handleQuizSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('quizTitle').value;
    const description = document.getElementById('quizDescription').value;
    const questionItems = document.querySelectorAll('.question-item');

    if (questionItems.length === 0) {
      alert('Please add at least one question!');
      return;
    }

    const questions = [];
    questionItems.forEach((item, index) => {
      const questionTitle = item.querySelector('.question-title').value;
      const options = Array.from(item.querySelectorAll('.option-input')).map(opt => opt.value);
      const correctOption = parseInt(item.querySelector('.correct-option').value) - 1;

      questions.push({
        question: questionTitle,
        options: options,
        correctAnswer: correctOption
      });
    });

    const newQuiz = {
      id: Date.now(),
      title: title,
      description: description,
      questions: questions,
      createdAt: new Date().toLocaleDateString()
    };

    this.quizzes.push(newQuiz);
    this.saveQuizzes();
    alert('Quiz created successfully!');
    this.showView('listingView', () => this.displayQuizzes());
  }

  // Display quizzes
  displayQuizzes() {
    const quizList = document.getElementById('quizList');
    const emptyState = document.getElementById('emptyState');

    if (this.quizzes.length === 0) {
      quizList.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    quizList.innerHTML = this.quizzes.map((quiz, index) => `
      <div class="quiz-item" onclick="quizMaker.startQuiz(${index})">
        <h3>${quiz.title}</h3>
        <p>${quiz.description}</p>
        <div class="quiz-meta">
          <span>${quiz.questions.length} questions</span>
          <span>${quiz.createdAt}</span>
        </div>
        <button class="btn btn-primary" onclick="event.stopPropagation(); quizMaker.startQuiz(${index})">Take Quiz</button>
      </div>
    `).join('');
  }

  // Start taking quiz
  startQuiz(quizIndex) {
    this.currentQuizIndex = quizIndex;
    this.currentQuestionIndex = 0;
    this.userAnswers = new Array(this.quizzes[quizIndex].questions.length).fill(null);
    
    this.showView('takingView', () => {
      this.displayQuestion();
    });
  }

  // Display current question
  displayQuestion() {
    const quiz = this.quizzes[this.currentQuizIndex];
    const question = quiz.questions[this.currentQuestionIndex];
    const totalQuestions = quiz.questions.length;

    // Update header
    document.getElementById('quizTitleDisplay').textContent = quiz.title;
    document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = totalQuestions;

    // Update progress bar
    const progress = ((this.currentQuestionIndex + 1) / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    // Display question
    const questionDisplay = document.getElementById('questionDisplay');
    questionDisplay.innerHTML = `
      <h3>${question.question}</h3>
      <div id="optionsContainer">
        ${question.options.map((option, index) => `
          <label class="option">
            <input type="radio" name="answer" value="${index}" ${this.userAnswers[this.currentQuestionIndex] === index ? 'checked' : ''}>
            <span>${option}</span>
          </label>
        `).join('')}
      </div>
    `;

    // Add change listener to radio buttons
    document.querySelectorAll('input[name="answer"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.userAnswers[this.currentQuestionIndex] = parseInt(e.target.value);
      });
    });

    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitQuizBtn');

    prevBtn.disabled = this.currentQuestionIndex === 0;
    
    if (this.currentQuestionIndex === totalQuestions - 1) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'block';
    } else {
      nextBtn.style.display = 'block';
      submitBtn.style.display = 'none';
    }
  }

  // Previous question
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.displayQuestion();
    }
  }

  // Next question
  nextQuestion() {
    if (this.userAnswers[this.currentQuestionIndex] === null) {
      alert('Please select an answer!');
      return;
    }
    
    const quiz = this.quizzes[this.currentQuizIndex];
    if (this.currentQuestionIndex < quiz.questions.length - 1) {
      this.currentQuestionIndex++;
      this.displayQuestion();
    }
  }

  // Submit quiz
  submitQuiz() {
    if (this.userAnswers[this.currentQuestionIndex] === null) {
      alert('Please select an answer for the last question!');
      return;
    }

    this.showView('resultsView', () => {
      this.displayResults();
    });
  }

  // Display results
  displayResults() {
    const quiz = this.quizzes[this.currentQuizIndex];
    let correctCount = 0;

    const answersReview = document.getElementById('answersReview');
    answersReview.innerHTML = '';

    quiz.questions.forEach((question, index) => {
      const userAnswer = this.userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      answersReview.innerHTML += `
        <div class="answer-item ${isCorrect ? 'correct' : 'wrong'}">
          <h4>Q${index + 1}: ${question.question}</h4>
          <p class="user-answer">Your answer: <strong>${userAnswer !== null ? question.options[userAnswer] : 'Not answered'}</strong></p>
          <p class="correct-answer">Correct answer: <strong>${question.options[question.correctAnswer]}</strong></p>
        </div>
      `;
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    document.getElementById('scorePercentage').textContent = percentage + '%';
    document.getElementById('scoreText').textContent = `${correctCount} out of ${quiz.questions.length}`;
  }

  // Retake quiz
  retakeQuiz() {
    this.startQuiz(this.currentQuizIndex);
  }
}

// Initialize Quiz Maker when DOM is loaded
let quizMaker;
document.addEventListener('DOMContentLoaded', () => {
  quizMaker = new QuizMaker();
});
