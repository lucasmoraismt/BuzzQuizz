
let quizzesArray = [];
let localStorageArray = [];
let currentQuizzObject = {};
getLocalStorage();
getQuizzes();

function getLocalStorage() {
    let string = localStorage.getItem("id");
    if(string !== null) {
        newArray = string.split(",");
        localStorageArray = newArray;
    }
}

function setLocalStorage(newId) {
    localStorageArray.push(newId);
    newString = localStorageArray.toString();
    localStorage.setItem('id', `${newString}`);
}

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
        let yourQuizzes = document.querySelector(".your-quizzes");

        if(localStorageArray.includes(quizz.id)) {
            yourQuizzes.innerHTML += quizzHTML;
        } else {
            allQuizzes.innerHTML += quizzHTML;
        }
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
    currentQuizzObject = quizzesArray.find(quizz => quizz.id === id);
    currentQuizzObject.rights = 0;
    currentQuizzObject.wrongs = 0;
    const questions = currentQuizzObject.questions.sort(comparator)
    const insideQuizzDiv = document.getElementById("inside-quizz")
    let currentQuizzHTML = `
        <div class="quizz-title">
            <img src="${currentQuizzObject.image}" class="top-image">
            <div>${currentQuizzObject.title}</div>
        </div>`

        questions.forEach(question => {
        currentQuizzHTML += `
        <div class="question-box">
            <div class="question">${question.title}</div>
                <div class="options not-clicked">`
        const answers = question.answers.sort(comparator)
        answers.forEach(answer => {
            let rightOrWrong = "wrong"
            if (answer.isCorrectAnswer === true) {
                rightOrWrong = "right"
            }
            currentQuizzHTML += `
            <div class="option ${rightOrWrong}" onclick="clickedAnswer(this)">
                <img src="${answer.image}">
                <p>${answer.text}</p>
            </div>`
        });
        currentQuizzHTML += `
        </div>
    </div>
    `
    });
    currentQuizzHTML +=`
    <div class="level">
    <div>x% de acerto: Muito pouco</div>
        <img src="https://p.favim.com/orig/2018/09/09/sad-friends-sitcom-Favim.com-6248241.jpg" alt="">
        <span>Parece que a pandemia não te afetou tanto. Depois de um ano já deveria saber pelo menos metade das falas de trás pra frente!</span>
</div>
<button class="restart-quizz">Reiniciar Quizz</button>
<button class="back-home">Voltar pra home</button>
</div>
    `
    insideQuizzDiv.innerHTML = currentQuizzHTML;
}
function clickedAnswer(option){
    const rightOption = option.classList.contains("right")
    if(rightOption){
        currentQuizzObject.rights += 1;
    } else {
        currentQuizzObject.wrongs += 1;
    }
    const quizzIsOver = (currentQuizzObject.rights + currentQuizzObject.wrongs === currentQuizzObject.questions.length)
    if(quizzIsOver){
        console.log("quizzIsOver")
        //displayResult()
    }
    const optionsDiv = option.parentNode 
    optionsDiv.classList.remove("not-clicked");
    option.classList.add("clicked");
    const optionsList = optionsDiv.querySelectorAll(".option")
    optionsList.forEach(option => option.removeAttribute("onclick"));
    setTimeout(function (){
        optionsDiv.parentNode.nextElementSibling.scrollIntoView({ behavior: 'smooth', block: 'center'});
    }, 2000);
}
function comparator() {
    return Math.random() - 0.5;
}
