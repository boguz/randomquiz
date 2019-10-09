const API = 'https://opentdb.com/api.php?amount=10&difficulty=medium'
let state = 0    //  0 = loading   1 = playing   2 = answer result   3 = end
const loadingEl = document.querySelector('.card__loading')
const imageEl = document.querySelector('.card__image-container')
const bottomEl = document.querySelector('.card__bottom')
const questionEl = document.querySelector('.card__question')
const buttonContainer = document.querySelector('.card__buttons')
const scoreEl = document.querySelector('.current__score')
const stepsEls = document.querySelectorAll('.step')
const responseEl = document.querySelector('.card__response')
const responseTextEl = document.querySelector('.card__response-text')
const endEl = document.querySelector('.card__end')
const endTextEl = document.querySelector('.card__end-text')

let userAnswers = []
let questions = []
let points = 0
let currentStep = 1

document.querySelector('.card__response-button').addEventListener('click', handleNextClick)
document.querySelector('.card__end-button').addEventListener('click', restartGame)

const getData = fetch(API)
getData
  .then(quizData => {
    return quizData.json()
    .then(response => {
      questions = response.results
      startGame(response)
    })
  })
  .catch((err) => {
    loadingEl.textContent = 'There was an error loading the quiz. Please try to refresh the page...' + err
  })

function startGame(quiz) {
  changeState(1)
  loadQuestion()
}

function changeState(newState) {
  state = newState
  if (state == 0) {
    // loading
    loadingEl.style.display = 'block'
    imageEl.style.display = 'none'
    bottomEl.style.display = 'none'
    responseEl.style.display = 'none'
    endEl.style.display = 'none'
  } else if (state == 1) {
    // playing
    loadingEl.style.display = 'none'
    imageEl.style.display = 'block'
    bottomEl.style.display = 'block'
    responseEl.style.display = 'none'
    endEl.style.display = 'none'
  } else if (state == 2) {
    // show result
    loadingEl.style.display = 'none'
    imageEl.style.display = 'block'
    bottomEl.style.display = 'none'
    responseEl.style.display = 'block'
    endEl.style.display = 'none'
  } else if (state == 3) {
    // end
    loadingEl.style.display = 'none'
    imageEl.style.display = 'block'
    bottomEl.style.display = 'none'
    responseEl.style.display = 'none'
    endEl.style.display = 'block'
    displayEndMessage()
  }
}

function loadQuestion() {
  const index = currentStep - 1;
  questionEl.innerHTML = questions[index].question
  let answers = getQuestionAnswers(index)
  let newButtons = generateButtons(answers)
}

function getQuestionAnswers(index) {
  let answers = []
  questions[index].incorrect_answers.forEach(answer => {
    answers.push({ answer: answer, status: false })
  })

  let correctAnswer = { 
    answer: questions[index].correct_answer,
    status: true
  }

  answers.splice(spliceCorrectIntoRandomIndex(answers), 0, correctAnswer)

  return answers
}

function spliceCorrectIntoRandomIndex(answers) {
  return Math.round(Math.random() * answers.length)
}

function generateButtons(answers) {
  buttonContainer.innerHTML = ''
  answers.forEach(answer => {
    let newButton = document.createElement('div')
    newButton.classList.add('card__button')
    newButton.innerHTML = answer.answer
    newButton.setAttribute('status', answer.status)
    newButton.addEventListener('click', handleButtonClick)
    buttonContainer.appendChild(newButton)
  })
}

function handleButtonClick(event) {
  const status = event.target.getAttribute('status')
  if (status === 'true') {
    userAnswers[currentStep - 1] = 'correct'
    points++
    showResult('correct')
  } else {
    userAnswers[currentStep - 1] = 'incorrect'
    showResult('incorrect')
  }
}

function showResult(result) {
  changeState(2)
  if (result === 'correct') {
    responseTextEl.textContent = 'Correct!'
    responseTextEl.style.color = 'var(--color-green)'
  } else if (result === 'incorrect') {
    responseTextEl.textContent = 'Incorrect!'
    responseTextEl.style.color = 'var(--color-red)'
  }
}

function updateQuiz() {
  updateScore()
  updateSteps()
  loadQuestion()
}

function updateScore() {
  return scoreEl.textContent = points
}

function updateSteps() {
  stepsEls.forEach((step, index) => {
    if (index < currentStep) {
      step.style.opacity = '1'
    } else {
      step.style.opacity = '0.5'
    }

    if (!userAnswers[index]) {
      return
    }
    if (userAnswers[index] == 'correct') {
      step.classList.add('step--correct')
    } else if (userAnswers[index] == 'incorrect') {
      step.classList.add('step--incorrect')
    }
  })
}

function handleNextClick() {
  if (currentStep < 10) {
    currentStep++
    changeState(1)
    updateQuiz()
  } else {
    updateScore()
    updateSteps()
    changeState(3)
  }
}

function displayEndMessage() {
  let messageEnd = ''
  if (points < 6) {
    messageEnd = 'Try again, i am sure you will do better next time!'
  } else if (points >= 6 && point < 9) {
    messageEnd = 'Not bad. Not bad at all...'
  } else if (points === 9) {
    messageEnd = 'Almost perfect!'
  } else if (points === 10) {
    messageEnd = 'Peeeeeeeeeerfect! '
  }
  const message = `You scored ${points} out of 10 questions! ${messageEnd}`

  endTextEl.innerHTML = message;
}

function restartGame() {
  changeState(0)
  userAnswers = []
  questions = []
  points = 0
  currentStep = 1
  stepsEls.forEach((step, index) => {
    step.classList.remove('step--correct')
    step.classList.remove('step--incorrect')
  })

  fetch(API)
    .then(quizData => {
      return quizData.json()
      .then(response => {
        questions = response.results
        startGame(response)
      })
    })
    .catch((err) => {
      loadingEl.textContent = 'There was an error loading the quiz. Please try to refresh the page...' + err
    })
}