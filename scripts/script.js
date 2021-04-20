
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
            <li class="quizz" onclick="openQuizz(${quizz.id})">
                <img src="${quizz.image}">
                <div id="gradient">
                    <p class="quizz-title">${quizz.title}</p>
                </div>
            </li>`
        let allQuizzes = document.querySelector(".all-quizzes");
        allQuizzes.innerHTML += quizzHTML;
    }
}

//function getSpecificQuizz(id) {
//    const quizzResquest = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes/" + id)
//    quizzResquest.then(renderQuizz)
//}

function openQuizz(id) {
    renderQuizz(id);
    //essa função vai tratar trocar de página, load e tal, só criei agora pra testar
}
function renderQuizz(id) {
    const thisQuizzObject = quizzesArray.find(quizzes => quizzes.id === id);
    console.log(thisQuizzObject)
    const questions = thisQuizzObject.questions.sort(comparator)
    const insideQuizzDiv = document.getElementById("inside-quizz")
    let newQuizzHTML = `
        <div class="quizz-title">
            <img src="${thisQuizzObject.image}" class="top-image">
            <div>${thisQuizzObject.title}</div>
        </div>`

        questions.forEach(question => {
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
            <div class="option ${rightOrWrong}">
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
function comparator() {
    return Math.random() - 0.5;
}
