
let quizzesArray = [];
let currentQuizzObject = {};
let creatingQuizzObject = {};
let levelsNumber = null;
let questionsNumber = null;
getQuizzes();

function setLocalStorage(newId, key) {
    newId = parseInt(newId);
    localStorage.setItem(newId, `${key}`);
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
    for (i = 0; i < quizzesArray.length; i++) {

        let quizz = quizzesArray[i];
        let quizzHTML = `
            <li class="quizz" onclick="openQuizz(${quizz.id})" style="background-image: url(${quizz.image});">
                <div id="gradient">
                    <p class="quizz-title">${quizz.title}</p>
                </div>
            </li>`

        if(localStorage[quizz.id]) {
            quizzHTML = `
                <li class="quizz" style="background-image: url(${quizz.image});">
                    <div id="gradient" onclick="openQuizz(${quizz.id})">
                        <p class="quizz-title">${quizz.title}</p>
                    </div>
                    <div class="edit-delete">
                    <div class="edit" onclick="editQuizz(${quizz.id})">
                        <ion-icon name="create-outline"></ion-icon>
                    </div>
                    <div class="delete" onclick="deleteQuizz(${quizz.id})">
                        <ion-icon name="trash-outline"></ion-icon>
                    </div>
                </div>
                </li>
                `
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

function showWarning(element){
    element.classList.add("error")
    element.nextElementSibling.classList.add("error")
}

function clearWarnings(selector){
    const errorList = document.querySelectorAll(`${selector} .error`);
    errorList.forEach(element => element.classList.remove("error"));
}

function validateFirstPage(){
    const quizzTitle = document.getElementById("quizz-title")
    const quizzBanner = document.getElementById("quizz-banner")
    const questionsQuantity = document.getElementById("questions-quantity")
    const levelsQuantity = document.getElementById("levels-quantity")
    clearWarnings("#first-screen")
    if(quizzTitle.value.length < 20 || quizzTitle.value.length > 65){
        showWarning(quizzTitle)
    }
    if(!isURL(quizzBanner.value)){
        showWarning(quizzBanner)
    }
    if(questionsQuantity.value < 3){
        showWarning(questionsQuantity)
    }
    if(levelsQuantity.value < 2){
        showWarning(levelsQuantity)
    }
    const errorList = document.querySelectorAll("#first-screen .error");
    if(errorList.length === 0){
        creatingQuizzObject["title"] = quizzTitle.value;
        creatingQuizzObject["image"] = quizzBanner.value;
        levelsNumber = levelsQuantity.value;
        questionsNumber = parseInt(questionsQuantity.value);
        renderScreen(2, questionsQuantity.value);
    }
};
function validateSecondPage(){
    let questionsArray = [];
    let unfilteredErrors = [];
    let filteredErrors = [];
    let unfilteredValidWrongs = [];
    let filteredValidWrongs = [];
    const questions = document.querySelectorAll("#second-screen .quizz-info");
    clearWarnings("#second-screen");
    questions.forEach((question, iterations) => {
        let questionObject = {};
        let answerArray = [];
        const questionText = question.querySelector(".question-text");
        const questionColor = question.querySelector(".question-color");
        const rightAnswer = question.querySelector(".right-answer");
        const rightImage = question.querySelector(".right-image");
        const wrongAnswerArray = question.querySelectorAll(".wrong-answer");
        const wrongImageArray = question.querySelectorAll(".wrong-image");
        if(questionText.value.length < 20){
            showWarning(questionText)
        }       
        if(!isHex(questionColor.value)){
            showWarning(questionColor)
        }
        if(rightAnswer.value === ""){
            showWarning(rightAnswer)
        }
        if(!isURL(rightImage.value)){
            showWarning(rightImage)
        }
        questionObject["title"] = questionText.value;
        questionObject["color"] = questionColor.value;
        answerArray.push({text: rightAnswer.value, image: rightImage.value, isCorrectAnswer: true});
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
    const errorList = document.querySelectorAll("#second-screen .error");
    if(filteredValidWrongs.length === questionsNumber){
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
    let levelsArray = [];
    const levels = document.querySelectorAll("#third-screen .quizz-info");
    clearWarnings("#third-screen");
    levels.forEach(level => {
        let levelObject = {};
        const levelTitle = level.querySelector(".level-title");
        const levelPercent = level.querySelector(".minimum-rights");
        const levelImage = level.querySelector(".level-image");
        const levelDescription = level.querySelector(".description");
        if(levelTitle.value.length < 10){
            showWarning(levelTitle)
        }
        if(levelPercent.value === ""){
            showWarning(levelPercent)
        }
        if(levelDescription.value === ""){
            showWarning(levelDescription)
        }
        if(!isURL(levelImage.value)){
            showWarning(levelImage)
        }
        levelObject["title"] = levelTitle.value;
        levelObject["image"] = levelImage.value;
        levelObject["text"] = levelDescription.value;
        levelObject["minValue"] = levelPercent.value;
        levelsArray.push(levelObject);
    });
    const errorList = document.querySelectorAll("#third-screen .error");
    if(errorList.length === 0) {
        creatingQuizzObject["levels"] = levelsArray;
        let promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes', creatingQuizzObject);
        promise.then(validateFourthPage);
    }
}
function validateFourthPage(response){
    let fourthScreen = document.getElementById("fourth-screen");
    let newQuizz = `
        <div class="quizz" onclick="renderQuizz(${response.data.id})">
            <img src="${response.data.image}">
            <div id="gradient">
                <p class="quizz-title">${response.data.title}</p>
            </div>
        </div>
        <button class="red-button" onclick="renderQuizz(${response.data.id})">Acessar Quizz</button>
        <button class="back-home" onclick="toggleScreen('.back-home')">Voltar pra home</button>`
    fourthScreen.innerHTML += newQuizz;
    setLocalStorage(response.data.id, response.data.key);
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
            let secondScreen = document.getElementById("second-screen");
            let selected;
            for(i = 0; i < questions; i++) {
                if(i===0){selected = " selected"} else {selected = ""};
                const newQuestion = `
                    <div class="quizz-info${selected}" onclick="openOption(this)">
                        <div class="icon">
                            <p class="title">Pergunta ${(i + 1)}</p>
                            <ion-icon name="create-outline"></ion-icon>
                        </div>
                        <input class="question-text" type="text" placeholder="Texto da pergunta">
                        <span class="warning">A pergunta deve ter no mínimo 20 caracteres</span>
                        <input class="question-color" type="text" placeholder="Cor de fundo da pergunta">
                        <span class="warning">A cor deve estar em hexadecimal.</span>
                        <p class="title">Resposta correta</p>
                        <input class="right-answer" type="text" placeholder="Resposta correta">
                        <span class="warning">Resposta correta não pode estar vazia</span>
                        <input class="right-image" type="url" placeholder="URL da imagem">
                        <span class="warning">Insira uma URL válida</span>
                        <p class="title">Respostas incorretas</p>
                        <input class="wrong-answer" type="text" placeholder="Resposta incorreta 1">
                        <span class="warning">O título deve ter de 20 a 65 caracteres</span>
                        <input class="wrong-image" type="url" placeholder="URL da imagem 1">
                        <span class="warning">O título deve ter de 20 a 65 caracteres</span>
                        <input class="wrong-answer" type="text" placeholder="Resposta incorreta 2">
                        <span class="warning">O título deve ter de 20 a 65 caracteres</span>
                        <input class="wrong-image" type="url" placeholder="URL da imagem 2">
                        <span class="warning">O título deve ter de 20 a 65 caracteres</span>
                        <input class="wrong-answer" type="text" placeholder="Resposta incorreta 3">
                        <span class="warning">O título deve ter de 20 a 65 caracteres</span>
                        <input class="wrong-image" type="url" placeholder="URL da imagem 3">
                        <span class="warning">O título deve ter de 20 a 65 caracteres</span>
                    </div>`
                secondScreen.innerHTML += newQuestion;
            }
            secondScreen.innerHTML += `
                <button class="red-button" onclick="validateSecondPage()">Prosseguir pra criar níveis</button>
                <div class="bottom-padding">&nbsp;</div>`
        toggleScreen('#second-screen')
    } else if(n === 3){
        levelsNumber = parseInt(levelsNumber);
            let thirdScreen = document.getElementById("third-screen");
            let selected;
            let disabled;
            for(i = 0; i < levelsNumber; i++) {
                if(i===0){
                    selected = " selected"
                    disabled = " value='0' disabled"
                } else {
                    selected = ""
                    disabled = " min='1' max='100'"
                };
                const newLevel = `
                    <div class="quizz-info${selected}" onclick="openOption(this)">
                        <div class="icon">
                            <p class="title">Nível ${(i + 1)}</p>
                            <ion-icon name="create-outline"></ion-icon>
                        </div>
                        <input class="level-title" type="text" placeholder="Título do nível">
                        <span class="warning">O título deve ter no mínimo 10 caracteres</span>
                        <input class="minimum-rights" type="number" placeholder="% de acerto mínima"${disabled}>
                        <span class="warning">Digite uma porcentagem de acertos</span>
                        <input class="level-image" type="url" placeholder="URL da imagem do nível">
                        <span class="warning">Insira uma URL válida</span>
                        <textarea class="description" placeholder="Descrição do nível"></textarea>
                        <span class="warning">A descrição não pode estar vazia.</span>
                    </div>`;
                thirdScreen.innerHTML += newLevel;
            }
            thirdScreen.innerHTML += `
                <button class="red-button" onclick="validateThirdPage()">Finalizar Quizz</button>
                <div class="bottom-padding">&nbsp;</div>`
        toggleScreen('#third-screen')
    } else if(n === 4){
        toggleScreen('#fourth-screen')
    }
}