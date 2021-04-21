
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

    let allQuizzes = document.querySelector(".all-quizzes");
    let yourQuizzes = document.querySelector(".your-quizzes");
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

        if(localStorageArray.includes(`${quizz.id}`)) {
            yourQuizzes.innerHTML += quizzHTML;
        } else {
            allQuizzes.innerHTML += quizzHTML;
        }
    }

    let yourHeight = yourQuizzes.offsetHeight;
    if(yourHeight > 100) {
        let startQuizz = document.querySelector(".start-quizz");
        startQuizz.classList.add("hidden");
    } else {
        yourQuizzes.classList.add("hidden");
    }
}

function openQuizz(id) {
    renderQuizz(id);
    toggleScreen();
}
function toggleScreen(){
    const insideQuizzDiv = document.getElementById("inside-quizz")
    const insideQuizzStyle = insideQuizzDiv.style
    const bodyStyle = document.querySelector("body").style
    if(insideQuizzStyle.left === "100%" || insideQuizzStyle.left === ""){
        insideQuizzStyle.left = 0;
        bodyStyle.overflow = "hidden";
    } else {
        insideQuizzDiv.style.left = "100%";
        bodyStyle.overflow = "scroll";
        setTimeout(function(){
            insideQuizzDiv.querySelector(".quizz-title").scrollIntoView({block: "center"});
        }, 500)
    }
    //document.querySelector("#app").scrollTo({left: (window.innerWidth * 2), behavior: 'smooth'});
    //document.getElementById("app").classList.toggle("right")
}
function restartQuizz(id){
    renderQuizz(id);
    document.getElementById("inside-quizz").scrollTo({top: 0, behavior: 'smooth'});
}
function renderQuizz(id) {
    currentQuizzObject = quizzesArray.find(quizz => quizz.id === id);
    currentQuizzObject.rights = 0;
    currentQuizzObject.wrongs = 0;
    const questions = currentQuizzObject.questions.sort(comparator)
    const insideQuizzDiv = document.getElementById("inside-quizz")
    let currentQuizzHTML = `
        <div class="quizz-title" style="background-image: url(${currentQuizzObject.image});">
            <div>${currentQuizzObject.title}</div>
        </div>`

        questions.forEach(question => {
        currentQuizzHTML += `
        <div class="question-box">
            <div class="question" style="background-color:${question.color};">${question.title}</div>
                <div class="options not-clicked">`
        const answers = question.answers.sort(comparator)
        answers.forEach(answer => {
            let rightOrWrong = "wrong"
            if (answer.isCorrectAnswer === true) {
                rightOrWrong = "right"
            }
            currentQuizzHTML += `
            <div class="option ${rightOrWrong}" onclick="clickedAnswer(this)">
                <div class="image" style="background-image: url(${answer.image})"></div>
                <p>${answer.text}</p>
            </div>`
        });
        currentQuizzHTML += `
        </div>
    </div>
    `
    });
    currentQuizzHTML +=`
    <div class="level hidden"></div>
    <button class="red-button" onclick="restartQuizz(${id})">Reiniciar Quizz</button>
    <button class="back-home" onclick="toggleScreen()">Voltar pra home</button>
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
        displayLevel()
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
function displayLevel(){
    const levelDiv = document.querySelector("#inside-quizz .level")
    const rightsPercent = Math.ceil((currentQuizzObject.rights / currentQuizzObject.questions.length) * 100)
    const levelObject = {}
    currentQuizzObject.levels.forEach(level => {
        if(rightsPercent >= level.minValue){
            levelObject.title = level.title;
            levelObject.image = level.image;
            levelObject.text = level.text;
        }
    })
    const levelHTML=`
    <div>${rightsPercent}% de acerto: ${levelObject.title}</div>
    <img src="${levelObject.image}">
    <span>${levelObject.text}</span>`
    levelDiv.innerHTML = levelHTML;
    levelDiv.classList.remove("hidden")
}

function comparator() {
    return Math.random() - 0.5;
}

function openOption(option) {
    let currentSelected = option.parentNode.querySelector(".quizz-info.selected");
    currentSelected.classList.remove("selected");
    option.classList.add("selected");
}