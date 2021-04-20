
let quizzesArray = [];
getQuizzes();

function getQuizzes() {
    let promise = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes');

    promise.then(displayQuizzes);
}

function displayQuizzes(response) {

    quizzesArray = response.data;
    for (i = 0; i < response.data.length; i++) {

        let quizz = quizzesArray[i];
        let quizzHTML = `
            <li class="quizz" onclick="openQuizz()">
                <img src="${quizz.image}">
                <div id="gradient">
                    <p class="quizz-title">${quizz.title}</p>
                </div>
            </li>`
        let allQuizzes = document.querySelector(".all-quizzes");
        allQuizzes.innerHTML += quizzHTML;
    }
}

function getSpecificQuizz(id) {
    const quizzResquest = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes/" + id)
    quizzResquest.then(renderQuizz)
}

function renderQuizz(response) {
    const quizzesArray = response.data
    console.log(quizzesArray)
    const insideQuizzDiv = document.getElementById("inside-quizz")
    let newQuizzHTML = `
        <div class="quizz-title">
            <img src="${quizzesArray.image}" class="top-image">
            <div>${quizzesArray.title}</div>
        </div>`

    quizzesArray.questions.forEach(question => {
        newQuizzHTML += `
        <div class="question-box">
            <div class="question">${question.title}</div>
                <div class="options not-clicked">`
        question.answers.forEach(answer => {
            let rightOrWrong = "wrong"
            if (answer.isCorrectAnswer === true) {
                rightOrWrong = "right"
            }
            newQuizzHTML += `
            <div class="option ${rightOrWrong}}">
                <img src="${answer.image}">
                <p>${answer.text}</p>
            </div>`
        });
        newQuizzHTML += `
        </div>
    </div>`
    });


    insideQuizzDiv.innerHTML = newQuizzHTML;
}