getQuizzes();

function getQuizzes () {
    let promise = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes');

    promise.then(displayQuizzes);
}

function displayQuizzes(response) {

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