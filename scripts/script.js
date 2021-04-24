
let quizzesArray = [];
let currentQuizzObject = {};
let newQuizzObject = {};
let levelsNumber = null;
let questionsNumber = null;
let lastPageSelector = "body";
let editMode = false;
let editId = null;
getQuizzes();

function setLocalStorage(newId, key) {
    newId = parseInt(newId);
    localStorage.setItem(newId, `${key}`);
}
function getQuizzes() {
    let promise = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes');

    promise.then(displayQuizzes);
    loadingToggle(true);
}
function displayQuizzes(response) {

    quizzesArray = [];
    let allQuizzes = document.querySelector(".all-quizzes");
    let yourQuizzes = document.querySelector(".your-quizzes");
    allQuizzes.innerHTML = '<p class="title">Todos os Quizzes</p>';
    yourQuizzes.innerHTML = `
        <div>
            <p class="title">Seus Quizzes</p>
            <ion-icon name="add-circle" onclick="toggleScreen('#basic-info-screen')"></ion-icon>
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
    let startQuizz = document.querySelector(".start-quizz");
    if(youHaveQuizzes !== null) {
        startQuizz.classList.add("hidden");
        if(yourQuizzes.classList.contains("hidden")) {
            yourQuizzes.classList.remove("hidden");
        }
        yourQuizzes.style.margin = "0px 0px 30px 0px"
    } else {
        startQuizz.classList.remove("hidden");
        yourQuizzes.classList.add("hidden");
    }
    loadingToggle(false)
}
function openQuizz(id) {
    renderQuizz(id);
    toggleScreen("#inside-quizz");
}
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
function validateBasicInfo(){
    const quizzTitle = document.getElementById("quizz-title")
    const quizzBanner = document.getElementById("quizz-banner")
    const questionsQuantity = document.getElementById("questions-quantity")
    const levelsQuantity = document.getElementById("levels-quantity")
    clearWarnings("#basic-info-screen")
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
    const errorList = document.querySelectorAll("#basic-info-screen .error");
    if(errorList.length === 0){
        newQuizzObject["title"] = quizzTitle.value;
        newQuizzObject["image"] = quizzBanner.value;
        levelsNumber = parseInt(levelsQuantity.value);
        questionsNumber = parseInt(questionsQuantity.value);
        renderQuestionsScreen();
    }
};
function validateQuizzQuestions(){
    let questionsArray = [];
    const questions = document.querySelectorAll("#quizz-questions-screen .quizz-info");
    clearWarnings("#quizz-questions-screen");
    questions.forEach((question) => {
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
                answerArray.push({text: text, image: img, isCorrectAnswer: false});
            }
            if(text !== "" && !isURL(img)){
                showWarning(wrongImageArray[i])
            }
            if(text === "" && isURL(img)){
                showWarning(wrongAnswerArray[i])
            }
        }
        if(answerArray.length < 2){
            showWarning(wrongImageArray[0])
            showWarning(wrongAnswerArray[0])
        }
        questionObject["answers"] = answerArray;
        questionsArray.push(questionObject);
    });
    const errorList = document.querySelectorAll("#quizz-questions-screen .error");
    if(errorList.length === 0){
        newQuizzObject["questions"] = questionsArray;
        renderLevelsScreen()
    }
}
function validateQuizzLevels() {
    let levelsArray = [];
    const levels = document.querySelectorAll("#quizz-levels-screen .quizz-info");
    clearWarnings("#quizz-levels-screen");
    levels.forEach(level => {
        let levelObject = {};
        const levelTitle = level.querySelector(".level-title");
        const levelPercent = level.querySelector(".minimum-rights");
        const levelImage = level.querySelector(".level-image");
        const levelDescription = level.querySelector(".description");
        if(levelTitle.value.length < 10){
            showWarning(levelTitle)
        }
        if(levelPercent.value === "" || levelPercent.value > 100 || levelPercent.value < 0){
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
    const errorList = document.querySelectorAll("#quizz-levels-screen .error");
    if(errorList.length === 0) {
        newQuizzObject["levels"] = levelsArray;
        if(editMode){
            let promise = axios.put(`https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes/${editId}`, newQuizzObject, {headers: {'Secret-Key': `${localStorage[editId]}`}});
            promise.then(quizzSuccess);
            loadingToggle(true);
        } else{
            let promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes', newQuizzObject);
            promise.then(quizzSuccess);
            loadingToggle(true);
        }
    }
}
function quizzSuccess(response){
    getQuizzes();
    editMode = false;
    editId = null;
    let successScreen = document.getElementById("quizz-success-screen");
    successScreen.innerHTML = `
        <div class="head">
            Seu quizz está pronto!
        </div>`;
    let newQuizz = `
        <div class="quizz just-created" onclick="openQuizz(${response.data.id})">
            <img src="${response.data.image}">
            <div id="gradient">
                <p class="quizz-title">${response.data.title}</p>
            </div>
        </div>
        <button class="red-button" onclick="openQuizz(${response.data.id})">Acessar Quizz</button>
        <button class="back-home" onclick="toggleScreen('.back-home')">Voltar pra home</button>`
    successScreen.innerHTML += newQuizz;
    setLocalStorage(response.data.id, response.data.key);
    levelsNumber = null;
    toggleScreen('#quizz-success-screen');
}
function isHex(string){
    const re = /[0-9A-Fa-f]{6}/g;
    if(re.test(string)) {
        return true;
    }
    return false;
}
function isURL(str) {
    var pattern = new RegExp(/^(ftp|http|https):\/\/[^ "]+$/);
    return !!pattern.test(str);
}
function editQuizz(id){
    currentQuizzObject = quizzesArray.find(quizz => quizz.id === id);
    editMode = true;
    editId = id;
    const quizzTitle = document.getElementById("quizz-title")
    const quizzBanner = document.getElementById("quizz-banner")
    const questionsQuantity = document.getElementById("questions-quantity")
    const levelsQuantity = document.getElementById("levels-quantity")
    quizzTitle.value = currentQuizzObject.title
    quizzBanner.value = currentQuizzObject.image
    questionsQuantity.value = currentQuizzObject.questions.length
    levelsQuantity.value = currentQuizzObject.levels.length
    toggleScreen("#basic-info-screen")
}
function editQuestions(){
    const oldNumberOfQuestions = currentQuizzObject.questions.length
    const quizzInfos = document.querySelectorAll("#quizz-questions-screen .quizz-info");
    for (let i = 0; i < quizzInfos.length; i++) {
        if(i < oldNumberOfQuestions){
            const questionText = quizzInfos[i].querySelector(".question-text");
            const questionColor = quizzInfos[i].querySelector(".question-color");
            const rightAnswer = quizzInfos[i].querySelector(".right-answer");
            const rightImage = quizzInfos[i].querySelector(".right-image");
            const wrongAnswerArray = quizzInfos[i].querySelectorAll(".wrong-answer");
            const wrongImageArray = quizzInfos[i].querySelectorAll(".wrong-image");
            questionText.value = currentQuizzObject.questions[i].title
            questionColor.value = currentQuizzObject.questions[i].color
            let j = 0
            currentQuizzObject.questions[i].answers.forEach((answer) => {
                if (answer.isCorrectAnswer === true){
                    rightAnswer.value = answer.text;
                    rightImage.value = answer.image;
                } else {
                    wrongAnswerArray[j].value = answer.text;
                    wrongImageArray[j].value = answer.image;
                    j++;
                }
            });
        }
    }
}
function editLevels(){
    const oldNumberOfLevels = currentQuizzObject.levels.length
    const quizzInfos = document.querySelectorAll("#quizz-levels-screen .quizz-info");
    const firstLevel = currentQuizzObject.levels.filter(level => level.minValue === (0 || "0"));
    const otherLevels = currentQuizzObject.levels.filter(level => level.minValue !== (0 || "0"));
    for (let i = 0; i < quizzInfos.length; i++) {
        if(i < oldNumberOfLevels){
            const levelTitle = quizzInfos[i].querySelector(".level-title");
            const levelPercent = quizzInfos[i].querySelector(".minimum-rights");
            const levelImage = quizzInfos[i].querySelector(".level-image");
            const levelDescription = quizzInfos[i].querySelector(".description");
            if(i === 0){
                levelTitle.value = firstLevel[0].title
                levelPercent.value = firstLevel[0].minValue
                levelImage.value = firstLevel[0].image
                levelDescription.value = firstLevel[0].text
            }else{
                levelTitle.value = otherLevels[i-1].title
                levelPercent.value = otherLevels[i-1].minValue
                levelImage.value = otherLevels[i-1].image
                levelDescription.value = otherLevels[i-1].text    
            }
        }
    }
}
function renderQuestionsScreen(){
    let questionsScreen = document.getElementById("quizz-questions-screen");
    let selected;
    questionsScreen.innerHTML = `
        <div class="head">
            Crie suas perguntas
        </div>`;
    for(i = 0; i < questionsNumber; i++) {
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
                <span class="warning">Insira uma resposta incorreta</span>
                <input class="wrong-image" type="url" placeholder="URL da imagem 1">
                <span class="warning">Insira uma URL válida</span>
                <input class="wrong-answer" type="text" placeholder="Resposta incorreta 2">
                <span class="warning">Insira um texo para a imagem incorreta</span>
                <input class="wrong-image" type="url" placeholder="URL da imagem 2">
                <span class="warning">Insira uma URL válida</span>
                <input class="wrong-answer" type="text" placeholder="Resposta incorreta 3">
                <span class="warning">Insira um texo para a imagem incorreta</span>
                <input class="wrong-image" type="url" placeholder="URL da imagem 3">
                <span class="warning">Insira uma URL válida</span>
            </div>`
        questionsScreen.innerHTML += newQuestion;
    }
    questionsScreen.innerHTML += `
        <button class="red-button" onclick="validateQuizzQuestions()">Prosseguir pra criar níveis</button>
        <div class="bottom-padding">&nbsp;</div>`
    if(editMode){editQuestions()}    
    toggleScreen('#quizz-questions-screen')
}
function renderLevelsScreen(){
    let levelsScreen = document.getElementById("quizz-levels-screen");
    let selected;
    let disabled;
    levelsScreen.innerHTML = `                
        <div class="head">
            Agora, decida os níveis
        </div>`;
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
                <span class="warning">Digite uma porcentagem mínima de acertos (0 - 100)</span>
                <input class="level-image" type="url" placeholder="URL da imagem do nível">
                <span class="warning">Insira uma URL válida</span>
                <textarea class="description" placeholder="Descrição do nível"></textarea>
                <span class="warning">A descrição não pode estar vazia.</span>
            </div>`;
        levelsScreen.innerHTML += newLevel;
    }
    levelsScreen.innerHTML += `
        <button class="red-button" onclick="validateQuizzLevels()">Finalizar Quizz</button>
        <div class="bottom-padding">&nbsp;</div>`
    if(editMode){editLevels()}    
    toggleScreen('#quizz-levels-screen');
}
function deleteQuizz(id) {
    let secretKey = localStorage[id];

    if(window.confirm('Realmente deseja excluir o quizz?')) {
        let promise = axios.delete(`https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes/${id}`, {
            headers: {'Secret-Key': `${secretKey}`}
        });
        localStorage.removeItem(id);
        promise.then(getQuizzes);
        loadingToggle(true);
    }
}
function loadingToggle(isLoading){
    const screen = document.getElementById("loading-screen")
    if(isLoading){
        screen.style.display = "flex"
        setTimeout(function(){
            screen.style.opacity = "1"
        },50);
    }else{
        screen.style.opacity = "0"
        setTimeout(function(){
            screen.style.display = "none"
        },400);
    }
}