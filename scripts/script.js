
let quizzesArray = [];
getQuizzes();

function getQuizzes () {
    let promise = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes');

    promise.then(displayQuizzes);
}

function displayQuizzes(response) {

    quizzesArray = response.data;
    for(i = 0; i < response.data.length; i++) {

        let quizz = response.data[i];
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

function getSpecificQuizz(id){
    const quizzResquest = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes/" + id)
    quizzResquest.then(renderQuizz)
}

function renderQuizz(response){
    const quizzArray = response.data
    console.log(quizzArray)
    const insideQuizzDiv = document.getElementById("inside-quizz")
    let newQuizzHTML =`
        <div class="quizz-title">
            <img src="${quizzArray.image}" class="top-image">
            <div>${quizzArray.title}</div>
        </div>`

    quizzArray.questions.forEach(question => {
        newQuizzHTML +=`
        <div class="question-box">
            <div class="question">${question.title}</div>
                <div class="options not-clicked">`
        question.answers.forEach(answer => {
            let rightOrWrong = "wrong"
            if(answer.isCorrectAnswer === true){
                rightOrWrong = "right"
            }
            newQuizzHTML +=`
            <div class="option ${rightOrWrong}}">
                <img src="${answer.image}">
                <p>${answer.text}</p>
            </div>`
        });
        newQuizzHTML +=`
        </div>
    </div>`
    });

        
    insideQuizzDiv.innerHTML = newQuizzHTML;
}