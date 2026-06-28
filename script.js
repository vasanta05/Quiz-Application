// ---------- Quiz content ----------
// Edit this array to use your own questions.
const questions = [
  { text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
  { text: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
  { text: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], answer: 1 },
  { text: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2 },
  { text: "Which country is home to the kangaroo?", options: ["South Africa", "Brazil", "Australia", "India"], answer: 2 },
  { text: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], answer: 2 },
  { text: "What is the smallest prime number?", options: ["0", "1", "2", "3"], answer: 2 },
  { text: "What gas do plants absorb for photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2 }
];

const TIME_LIMIT = 15;     // seconds per question
const BASE_POINTS = 10;    // points for a correct answer
const MAX_BONUS = 10;      // extra points if answered instantly
const STREAK_BONUS = 5;    // extra points per streak (from 2 correct in a row)

// ---------- State ----------
let currentQuestion = 0;
let score = 0;
let streak = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let isAnswered = false;

// ---------- DOM references ----------
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');

const progressText = document.getElementById('progress-text');
const scoreText = document.getElementById('score-text');
const streakText = document.getElementById('streak-text');
const timerFill = document.getElementById('timer-fill');
const questionText = document.getElementById('question-text');
const optionsBox = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');

document.getElementById('start-btn').addEventListener('click', startQuiz);
document.getElementById('restart-btn').addEventListener('click', startQuiz);
nextBtn.addEventListener('click', goToNextQuestion);

// ---------- Quiz flow ----------
function startQuiz() {
  currentQuestion = 0;
  score = 0;
  streak = 0;
  updateScoreDisplay();
  showScreen(quizScreen);
  loadQuestion();
}

function loadQuestion() {
  isAnswered = false;
  nextBtn.style.display = 'none';

  const q = questions[currentQuestion];
  progressText.textContent = `Question ${currentQuestion + 1}/${questions.length}`;
  questionText.textContent = q.text;

  optionsBox.innerHTML = '';
  q.options.forEach((optionLabel, index) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = optionLabel;
    btn.addEventListener('click', () => selectAnswer(index));
    optionsBox.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = TIME_LIMIT;
  renderTimer();

  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      renderTimer();
      clearInterval(timerInterval);
      if (!isAnswered) selectAnswer(-1); // ran out of time = no answer
      return;
    }
    renderTimer();
  }, 100);
}

function renderTimer() {
  const percent = (timeLeft / TIME_LIMIT) * 100;
  timerFill.style.width = percent + '%';
  timerFill.style.background = percent > 50 ? '#00b894' : (percent > 20 ? '#fdcb6e' : '#e74c3c');
}

// The novelty: scoring rewards speed and consistency, not just correctness.
function selectAnswer(chosenIndex) {
  if (isAnswered) return;
  isAnswered = true;
  clearInterval(timerInterval);

  const q = questions[currentQuestion];
  const buttons = optionsBox.querySelectorAll('.option');
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === q.answer) btn.classList.add('correct');
    else if (index === chosenIndex) btn.classList.add('wrong');
  });

  if (chosenIndex === q.answer) {
    streak++;
    const speedBonus = Math.round((timeLeft / TIME_LIMIT) * MAX_BONUS);
    const streakBonus = streak >= 2 ? STREAK_BONUS : 0;
    const pointsEarned = BASE_POINTS + speedBonus + streakBonus;
    score += pointsEarned;
    showPointsPopup(pointsEarned);
  } else {
    streak = 0;
  }

  updateScoreDisplay();

  nextBtn.textContent = (currentQuestion === questions.length - 1) ? 'See Results →' : 'Next →';
  nextBtn.style.display = 'inline-block';
}

function showPointsPopup(points) {
  const popup = document.createElement('span');
  popup.className = 'popup';
  popup.textContent = '+' + points;
  scoreText.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}

function updateScoreDisplay() {
  scoreText.firstChild.textContent = 'Score: ' + score + ' ';
  streakText.textContent = streak >= 2 ? `🔥 x${streak}` : '';
}

function goToNextQuestion() {
  currentQuestion++;
  if (currentQuestion >= questions.length) {
    endQuiz();
  } else {
    loadQuestion();
  }
}

function endQuiz() {
  showScreen(endScreen);
  document.getElementById('final-score').textContent = score;

  let message;
  if (streak >= questions.length) message = "Flawless run — every answer, fast and correct!";
  else if (score >= questions.length * BASE_POINTS) message = "Great job — solid accuracy and good speed.";
  else if (score >= questions.length * BASE_POINTS * 0.5) message = "Nice work — try to answer a little quicker next time.";
  else message = "Keep practicing — speed and accuracy both add up.";
  document.getElementById('final-message').textContent = message;
}

function showScreen(target) {
  [startScreen, quizScreen, endScreen].forEach(s => s.classList.remove('active'));
  target.classList.add('active');
}