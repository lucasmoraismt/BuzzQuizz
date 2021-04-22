
let quizzesArray = [];
let localStorageArray = [];
let currentQuizzObject = {};
let creatingQuizzObject = {};
let levelsNumber = null;
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

    quizzesArray = [];
    let allQuizzes = document.querySelector(".all-quizzes");
    let yourQuizzes = document.querySelector(".your-quizzes");
    allQuizzes.innerHTML = '<p class="title">Todos os Quizzes</p>';
    yourQuizzes.innerHTML = `
        <div>
            <p class="title">Seus Quizzes</p>
            <ion-icon name="add-circle" onclick="toggleScreen('#first-screen')"></ion-icon>
        </div>`
    quizzesArray = response.data;
    for (i = 0; i < response.data.length; i++) {

        let quizz = quizzesArray[i];
        let quizzHTML = `
            <li class="quizz" onclick="openQuizz(${quizz.id})" style="background-image: url(${quizz.image});">
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
        getQuizzes();
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
    option.classList.add("selected");
    option.previousElementSibling.scrollIntoView({ behavior: 'smooth', block: 'start'});
}

function validateFirstPage(){
    let errorMessages = [];
    const quizzTitle = document.getElementById("quizz-title").value
    const quizzBanner = document.getElementById("quizz-banner").value
    const questionsQuantity = document.getElementById("questions-quantity").value
    const levelsQuantity = document.getElementById("levels-quantity").value
    if(quizzTitle.length < 20 || quizzTitle.length > 65){
        errorMessages.push("O título deve ter de 20 a 65 caracteres.");
    }
    if(!isURL(quizzBanner)){
        errorMessages.push("Insira uma URL válida.");
    }
    if(questionsQuantity < 3){
        errorMessages.push("Mínimo de 3 perguntas.");   
    }
    if(levelsQuantity < 2){
        errorMessages.push("Mínimo de 2 níveis.");   
    }
    if(errorMessages.length === 0){
        creatingQuizzObject["title"] = quizzTitle;
        creatingQuizzObject["image"] = quizzBanner;
        levelsNumber = levelsQuantity;
        renderScreen(2, questionsQuantity);
    } else{
        let alertMessage = '';
        errorMessages.forEach(msg => alertMessage += msg + "\n");
        alert(alertMessage);
    }
};
function validateSecondPage(){
    let questionsArray = [];
    let unfilteredErrors = [];
    let filteredErrors = [];
    let unfilteredValidWrongs = [];
    let filteredValidWrongs = [];
    const questions = document.querySelectorAll("#second-screen .quizz-info");
    questions.forEach((question, iterations) => {
        let questionObject = {};
        let answerArray = [];
        const questionText = question.querySelector(".question-text").value;
        const questionColor = question.querySelector(".question-color").value;
        const rightAnswer = question.querySelector(".right-answer").value;
        const rightImage = question.querySelector(".right-image").value;
        const wrongAnswerArray = question.querySelectorAll(".wrong-answer");
        const wrongImageArray = question.querySelectorAll(".wrong-image");
        if(questionText.length < 20){
            unfilteredErrors.push("A pergunta deve ter no mínimo 20 caracteres.");
        }       
        if(!isHex(questionColor)){
            unfilteredErrors.push("A cor deve estar em hexadecimal.");
        }
        if(rightAnswer === ""){
            unfilteredErrors.push("Resposta correta não pode estar vazia.");   
        }
        if(!isURL(rightImage)){
            unfilteredErrors.push("Insira uma URL válida.");   
        }
        questionObject["title"] = questionText;
        questionObject["color"] = questionColor;
        answerArray.push({text: rightAnswer, image: rightImage, isCorrectAnswer: true});
        for (let i = 0; i < wrongAnswerArray.length; i++) {
            const text = wrongAnswerArray[i].value;
            const img = wrongImageArray[i].value;
            if(text !== "" && isURL(img)){
                unfilteredValidWrongs.push(iterations)
                answerArray.push({text: text, image: img, isCorrectAnswer: false});
            } else if(text === "" || !isURL(img) ){
                unfilteredErrors.push("Insira a resposta incorreta com uma imagem.");   
            }
        }
        questionObject["answers"] = answerArray;
        questionsArray.push(questionObject);
    });
    filteredErrors = sortUnique(unfilteredErrors);
    filteredValidWrongs = sortUnique(unfilteredValidWrongs);
    if(filteredValidWrongs.length === 3){
        const item = "Insira a resposta incorreta com uma imagem."
        filteredErrors = removeFromArray(filteredErrors, item)
    }
    if(filteredErrors.length === 0){
        creatingQuizzObject["questions"] = questionsArray;
        renderScreen(3)
    } else {
        let alertMessage = '';
        filteredErrors.forEach(msg => alertMessage += msg + "\n");
        alert(alertMessage);
    }
}
function validateThirdPage() {
    let errorMessages = [];
    let percentage = [];
    let levelsArray = []
    const levels = document.querySelectorAll("#third-screen .quizz-info");
    levels.forEach(level => {
        let levelObject = {};
        const levelTitle = level.querySelector(".level-title").value;
        const levelPercent = level.querySelector(".minimum-rights").value;
        const levelImage = level.querySelector(".level-image").value;
        const levelDescription = level.querySelector(".description").value;
        if(levelTitle.length < 10){
            errorMessages.push("O título deve ter no mínimo 10 caracteres.");
        }
        if(levelDescription === ""){
            errorMessages.push("A descrição não pode estar vazia.");   
        }
        if(!isURL(levelImage)){
            errorMessages.push("Insira uma URL válida.");   
        }
        percentage.push(levelPercent);
        levelObject["title"] = levelTitle;
        levelObject["image"] = levelImage;
        levelObject["text"] = levelDescription;
        levelObject["minValue"] = levelPercent;
        levelsArray.push(levelObject);
    });
    if(!percentage.includes("0")) {
        errorMessages.push("Faltando nível com 0% de acerto mínimo.");
    }
    if(errorMessages.length === 0) {
        creatingQuizzObject["levels"] = levelsArray;
        let promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes', creatingQuizzObject);

        promise.then(validateFourthPage);
    } else {
        let alertMessage = '';
        errorMessages.forEach(msg => alertMessage += msg + "\n");
        alert(alertMessage);
    }
}
function validateFourthPage(response){
    let fourthScreen = document.getElementById("fourth-screen");
    let newQuizz = `
        <div class="quizz" onclick="renderQuizz(${response.id})">
            <img src="${response.image}">
            <div id="gradient">
                <p class="quizz-title">${response.title}</p>
            </div>
        </div>
        <button class="red-button" onclick="renderQuizz(${response.id})">Acessar Quizz</button>
        <button class="back-home" onclick="toggleScreen('.back-home')">Voltar pra home</button>`
    fourthScreen.innerHTML += newQuizz;
    setLocalStorage(response.id);
    getLocalStorage();
    levelsNumber = null;
    renderScreen(4);
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
function sortUnique(array){
    const oldArr = Array.from(array).sort((a, b) => a - b);
    let newArr = []
    oldArr.forEach((n) => {
        if (!newArr.includes(n)) {
            newArr.push(n);
        }
    });
    return newArr;
}
function removeFromArray(arr, item){
   return (arr = arr.filter(n => n !== item));
}

function renderScreen(n, questions){
    if(n === 2){
        questions = parseInt(questions);
        if(questions > 3) {
            let secondScreen = document.getElementById("second-screen");
            let button = secondScreen.querySelector(".red-button");
            let padding = secondScreen.querySelector(".bottom-padding");
            secondScreen.removeChild(button);
            secondScreen.removeChild(padding);
            for(i = 0; i < (questions - 3); i++) {
                const newQuestion = `
                    <div class="quizz-info" onclick="openOption(this)">
                        <div class="icon">
                            <p class="title">Pergunta ${3 + (i + 1)}</p>
                            <ion-icon name="create-outline"></ion-icon>
                        </div>
                        <input class="question-text" type="text" placeholder="Texto da pergunta">
                        <input class="question-color" type="text" placeholder="Cor de fundo da pergunta">
                        <p class="title">Resposta correta</p>
                        <input class="right-answer" type="text" placeholder="Resposta correta">
                        <input class="right-image" type="text" placeholder="URL da imagem">
                        <p class="title">Respostas incorretas</p>
                        <input class="wrong-answer" type="text" placeholder="Resposta incorreta 1">
                        <input class="wrong-image" type="text" placeholder="URL da imagem 1">
                        <input class="wrong-answer" type="text" placeholder="Resposta incorreta 2">
                        <input class="wrong-image" type="text" placeholder="URL da imagem 2">
                        <input class="wrong-answer" type="text" placeholder="Resposta incorreta 3">
                        <input class="wrong-image" type="text" placeholder="URL da imagem 3">
                    </div>`
                secondScreen.innerHTML += newQuestion;
            }
            secondScreen.innerHTML += `
                <button class="red-button" onclick="validateSecondPage()">Prosseguir pra criar níveis</button>
                <div class="bottom-padding">&nbsp;</div>`
        }
        toggleScreen('#second-screen')
    } else if(n === 3){
        levelsNumber = parseInt(levelsNumber);
        if(levelsNumber > 2) {
            let thirdScreen = document.getElementById("third-screen");
            let button = thirdScreen.querySelector(".red-button");
            let padding = thirdScreen.querySelector("bottom-padding");
            thirdScreen.removeChild(button);
            thirdScreen.removeChild(padding);
            for(i = 0; i < (levelsNumber - 2); i++) {
                const newLevel = `
                    <div class="quizz-info" onclick="openOption(this)">
                        <div class="icon">
                            <p class="title">Nível ${2 + (i + 1)}</p>
                            <ion-icon name="create-outline"></ion-icon>
                        </div>
                        <input class="level-title" type="text" placeholder="Título do nível">
                        <input class="minimum-rights" type="text" placeholder="% de acerto mínima">
                        <input class="level-image" type="text" placeholder="URL da imagem do nível">
                        <textarea class="description" placeholder="Descrição do nível"></textarea>
                    </div>`;
                thirdScreen.innerHTML += newLevel;
            }
            thirdScreen.innerHTML += `
                <button class="red-button" onclick="validateThirdPage()">Finalizar Quizz</button>
                <div class="bottom-padding">&nbsp;</div>`
        }
        toggleScreen('#third-screen')
    } else if(n === 4){
        toggleScreen('#fourth-screen')
    }
}