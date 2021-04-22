
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
    const youHaveQuizzes = document.querySelector(".your-quizzes .quizz")
    if(youHaveQuizzes !== null) {
        let startQuizz = document.querySelector(".start-quizz");
        startQuizz.classList.add("hidden");
        yourQuizzes.style.margin = "0px 0px 30px 0px"
    } else {
        yourQuizzes.classList.add("hidden");
    }
}

function openQuizz(id) {
    renderQuizz(id);
    toggleScreen("#inside-quizz");
}
let lastPageSelector = "body";

function toggleScreen(selector){
    const openPage = document.querySelector(selector)
    const bodyStyle = document.querySelector("body").style
    const lastPage = document.querySelector(lastPageSelector)
    if(selector === ".back-home"){
        lastPage.style.left = "100%";
        bodyStyle.overflow = "scroll";
        setTimeout(function(){
            lastPage.scrollTo({top: 0});
        }, 500)
    } else {
        openPage.style.left = 0;
        bodyStyle.overflow = "hidden";
        setTimeout(function(){
            lastPage.scrollTo({top: 0});
            lastPage.style.left = "100%"
        }, 500)
    }
    lastPageSelector = selector
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
    <button class="back-home" onclick="toggleScreen('.back-home')">Voltar pra home</button>
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
    option.previousElementSibling.scrollIntoView({ behavior: 'smooth', block: 'start'});
    option.classList.add("selected");
}

function validateFirstPage(){
    let noErrors = true;
    let errorMessages = [];
    const quizzTitle = document.getElementById("quizz-title").value
    const quizzBanner = document.getElementById("quizz-banner").value
    const questionsQuantity = document.getElementById("questions-quantity").value
    const levelsQuantity = document.getElementById("levels-quantity").value
    if(quizzTitle.length < 20 || quizzTitle.length > 65){
        errorMessages.push("O título deve ter de 20 a 65 caracteres.");
        noErrors = false
    }
    if(!isURL(quizzBanner)){
        errorMessages.push("Por favor, insira uma URL válida.");
        noErrors = false
    }
    if(questionsQuantity < 3){
        errorMessages.push("Mínimo de 3 perguntas.");   
        noErrors = false
    }
    if(levelsQuantity < 2){
        errorMessages.push("Mínimo de 2 níveis.");   
        noErrors = false
    }
    if(noErrors){
        renderScreen(2)
    } else{
        errorMessages.forEach(msg => console.log(msg));
    }
};
function validateSecondPage(){

}
function validateThirdPage(){

}
function validateFourthPage(){

}

function isHex(string){
    const re = /[0-9A-Fa-f]{6}/g;
    if(re.test(string)) {
        return true;
    }
    return false;
}

function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
      '((\\d{1,3}\\.){3}\\d{1,3}))'+
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
      '(\\?[;&a-z\\d%_.~+=-]*)?'+
      '(\\#[-a-z\\d_]*)?$','i');
    return !!pattern.test(str);
}

function renderScreen(n){
    if(n = 2){
        toggleScreen('#second-screen')
    } else if(n = 3){
        //render more questions if needed
        toggleScreen('#third-screen')
    } else if(n = 4){
        //render more levels
        toggleScreen('#fourth-screen')
    }
}  