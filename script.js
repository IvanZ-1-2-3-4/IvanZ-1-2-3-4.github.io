// DON'T CHEAT

let questionsBank = JSON.stringify([
    {
        question: 'Inside which HTML element do we put the JavaScript?',
        options: ['&lt;js&gt;', '&lt;script&gt;', '&lt;javascript&gt;', '&lt;scripting&gt;'],
        correctOption: '&lt;script&gt;'
    },
    {
        question: 'What is the correct JavaScript syntax to change the content of the HTML element below?<br><br>&lt;p id="demo"&gt;This is a demonstration.&lt;/p&gt;',
        options: ['#demo.innerHTML = "Hello World!";', 'document.getElement("p").innerHTML = "Hello World!";', 'document.getElementById("demo").innerHTML = "Hello World!";', 'document.getElementByName("p").innerHTML = "Hello World!";'],
        correctOption: 'document.getElementById("demo").innerHTML = "Hello World!";'
    },
    {
        question: 'Where can we place a JS script in the page?',
        options: ['Anywhere in the page', 'In the body', 'In the head', 'Outside the body'],
        correctOption: 'Anywhere in the page'
    },
    {
        question: 'What is the correct syntax for referring to an external script called "script.js" located in the same directory as the page?',
        options: ['&lt;script name="script.js"&gt;', '&lt;script src="script.js"&gt;', '&lt;script href="script.js"&gt;', '&lt;script script="script.js"&gt;'],
        correctOption: '&lt;script src="script.js"&gt;'
    },
    {
        question: 'How do you write "Hello World" in an alert box?',
        options: ['msgBox("Hello World");', 'msg("Hello World");', 'alert("Hello World");', 'alertBox("Hello World");'],
        correctOption: 'alert("Hello World");'
    },
    {
        question: 'How do you create a function in JavaScript?',
        options: ['function:myFunction()', 'function = myFunction()', 'function myFunction()', 'function myFunction() {}'],
        correctOption: 'function myFunction() {}'
    },
    {
        question: 'How do you call a function named "myFunction"?',
        options: ['myFunction', 'call myFunction', 'myFunction()', 'myFunction() {}'],
        correctOption: 'myFunction()'
    },
    {
        question: 'How to write an IF statement in JavaScript?',
        options: ['if condition', 'if (condition)', 'if condition then', 'if (condition) then'],
        correctOption: 'if (condition)'
    }
])
let questions

const totalTimeSec = 60
let score = 0
let timer
let dateFinished

document.querySelectorAll('.option').forEach(elem => elem.addEventListener('click', answer))

// begin quiz
function quiz() {
    questions = shuffle(JSON.parse(questionsBank))

    // hide everything except quiz
    document.getElementById('begin').style.display = 'none'
    document.getElementById('scoreboard').style.display = 'none'
    document.getElementById('quiz-end').style.display = 'none'
    document.getElementById('incorrect').className = 'text-danger mx-1 hide'
    document.getElementById('correct').className = 'text-success mx-1 hide'
    document.getElementById('question-card').style.display = 'block'

    score = 0

    nextQuestion()

    document.getElementById('timer').innerHTML = totalTimeSec

    timer = setInterval(() => {
        let timerEl = document.getElementById('timer')
        let timeRemaining = parseInt(timerEl.innerHTML)

        if (timeRemaining > 0) {
            timerEl.innerHTML = timeRemaining - 1
        } else {
            clearInterval(timer)
            quizEnd()
        }
    }, 1000)
}

function nextQuestion() {
    let question = questions.pop()
    if (question) {
        questions.push(question)
        document.getElementById('question').innerHTML = question.question
        question.options = shuffle(question.options)

        document.querySelectorAll('.option').forEach(option => option.innerHTML = question.options.pop())
    } else {
        quizEnd()
    }
}

function answer(event) {
    let question = questions.pop()
    document.getElementById('correct').className = 'text-success mx-1 hide'
    document.getElementById('incorrect').className = 'text-danger mx-1 hide'

    if (event.target.innerHTML == question.correctOption) {
        score++
        // too fast if instant
        setTimeout(() => document.getElementById('correct').className = 'text-success mx-1 fade', 10)
    } else {
        document.getElementById('timer').innerHTML = Math.max(parseInt(document.getElementById('timer').innerHTML) - 10, 0)
        // too fast if instant
        setTimeout(() => document.getElementById('incorrect').className = 'text-danger mx-1 fade', 10)
    }
    nextQuestion()
}

function quizEnd() {
    clearInterval(timer)

    // hide everything except quiz end
    document.getElementById('begin').style.display = 'none'
    document.getElementById('question-card').style.display = 'none'
    document.getElementById('scoreboard').style.display = 'none'
    document.getElementById('quiz-end').style.display = 'block'

    dateFinished = Date(Date.now())

    document.getElementById('score-display').innerHTML = `Your score is ${score}.`
    let timeRemaining = parseInt(document.getElementById('timer').innerHTML)
    document.getElementById('time-display').innerHTML = `You finished with ${timeRemaining} seconds left.`
    if (localStorage.getItem('scoreboard')) {
        let scoreboard = JSON.parse(localStorage.getItem('scoreboard'))
        document.getElementById('ranking-display').innerHTML = `Your position in the leaderboard is ${getPosition(scoreboard, score, timeRemaining)}`
    } else {
        document.getElementById('ranking-display').innerHTML = 'There is no score data available to compare your results to as of yet.'
    }
}

// form on quiz end
function formSubmit(userNew=true) {
    if (userNew) {
        // get name input
        let nameIn = document.getElementById('name-input').value

        if (localStorage.getItem('scoreboard')) {
            let scoreboard = JSON.parse(localStorage.getItem('scoreboard'))
            if (userExists(scoreboard, nameIn)) {
                // ask user if the existing name is their name
                document.getElementById('user-exists').setAttribute('data-namein', nameIn) // save namein that matches existing
                document.getElementById('user-exists').style.display = 'block'
                document.getElementById('user-exists-prompt').innerHTML = `A user with the name "${nameIn}" already exists. Is this is you? If not, please enter a different name to distinguish yourself.`
            } else {
                // add user if they don't already exist
                if (nameIn == '') nameIn = 'Anonymous'
                let timeTaken = totalTimeSec - parseInt(document.getElementById('timer').innerHTML)
                addUser(scoreboard, nameIn, score, timeTaken, dateFinished)
                localStorage.setItem('scoreboard', JSON.stringify(scoreboard))
                scoreBoard()
            }
        } else {
            // create scoreboard with initial entry
            let timeTaken = totalTimeSec - parseInt(document.getElementById('timer').innerHTML)
            if (nameIn == '') nameIn = 'Anonymous'
            localStorage.setItem('scoreboard', JSON.stringify({
                users: [{
                    name: nameIn,
                    games: [{
                        userName: nameIn,
                        date: dateFinished,
                        score: score,
                        time: timeTaken,
                        netScore: score - timeTaken
                    }]
                }],
                entriesCache: [{
                    userName: nameIn,
                    date: dateFinished,
                    score: score,
                    time: timeTaken,
                    netScore: score - timeTaken,
                    position: 1
                }]
            }))
            scoreBoard()
        }
    } else {
        // add game to existing user
        let scoreboard = JSON.parse(localStorage.getItem('scoreboard'))
        let timeTaken = totalTimeSec - parseInt(document.getElementById('timer').innerHTML)
        addGameToUser(scoreboard, document.getElementById('user-exists').getAttribute('data-namein'), score, timeTaken, dateFinished)
        localStorage.setItem('scoreboard', JSON.stringify(scoreboard))
        scoreBoard()
    }
}

function scoreBoard(page=1, entriesPerPage=10) {
    document.getElementById('begin').style.display = 'none'
    document.getElementById('question-card').style.display = 'none'
    document.getElementById('quiz-end').style.display = 'none'
    document.getElementById('scoreboard').style.display = 'block'

    // Populate scoreboard
    if (localStorage.getItem('scoreboard')) {
        let scoreboard = JSON.parse(localStorage.getItem('scoreboard'))

        // page links
        document.getElementById('pages').innerHTML = ''
        for (let i = 0; i < Math.ceil(scoreboard.entriesCache.length / entriesPerPage); i++) {
            document.getElementById('pages').innerHTML += `<a href="#" class="mx-1" onclick="scoreBoard(page=${i+1})">${i+1}</a>`
        }

        let entries = getEntries(scoreboard, page, entriesPerPage)
        if (entries) {
            let tbody = document.getElementById('scoreboard-table-body')
            tbody.innerHTML = ''
            for (let i in entries) {
                tbody.innerHTML = tbody.innerHTML + 
                    `<tr><th scope="row">${entries[i].position}</th><td>${entries[i].userName}</td><td>${entries[i].score}</td><td>${totalTimeSec - entries[i].time}</td><td>${(entries[i].date)}</td></tr>`
            }
        }
    } else {
        document.getElementById('scoreboard-board').innerHTML = 'No scoreboard entries exist. <a href="#" onclick="quiz()"> Begin quiz.</a>'
    }
}

// ---------------- SCOREBOARD FUNCTIONS -----------------------
function userExists(sb, name) {
    if (sb.users.find(user => user.name == name)) {
        return true
    } else {
        return false
    }
}
function addUser(sb, name, score, time, dateFinished) {
    let game = {
        userName: name,
        date: dateFinished,
        score: score,
        time: time,
        netScore: score - time,
        position: null
    }
    if (name == 'Anonymous') {
        sb.users.push({
            name: name,
            games: [game]
        })
        for (let i in sb.entriesCache) {
            if (game.netScore > sb.entriesCache[i].netScore) {
                let before = sb.entriesCache.slice(0, i) // from beggining to i
                let after = sb.entriesCache.slice(i, sb.entriesCache.length) // from i to end
                sb.entriesCache = before.concat(game).concat(after) // sandwich new game in the middle
                return
            }
            sb.entriesCache.push(game)
            return
        }
    } else {
        sb.users.push({
            name: name,
            games: []
        })
        addGameToUser(sb, name, score, time, dateFinished)
    }
}
function addGameToUser(sb, name, score, time, dateFinished) {
    let game = {
        userName: name,
        date: dateFinished,
        score: score,
        time: time,
        netScore: score - time,
        position: null
    }

    // add game to user
    for (let i in sb.users) {
        if (sb.users[i].name == name) {
            sb.users[i].games.push(game)
            break
        }
    }

    // add game to entries
    for (let i in sb.entriesCache) {
        if (game.netScore > sb.entriesCache[i].netScore) {
            let before = sb.entriesCache.slice(0, i) // from beggining to i
            let after = sb.entriesCache.slice(i, sb.entriesCache.length) // from i to end
            sb.entriesCache = before.concat(game).concat(after) // sandwich new game in the middle
            return
        }
        sb.entriesCache.push(game)
        return
    }
}
function getPosition(sb, score, time) {
    for (let i in sb.entriesCache) {
        if ((score - time) > sb.entriesCache[i].netScore) {
            return parseInt(parseInt(i) + 1)
        }
    }
}
function getEntries(sb, page, entriesPerPage) {
    // if (!sb.entriesCache) {
    //     // sort all games

    //     let allGames = []
    //     for (let i in sb.users) for (let j in sb.users[i].games) {
    //         allGames.push(sb.users[i].games[j]) // score good time bad
    //     }

    //     let sorted = false
    //     // what
    //     while (!sorted) {
    //         sorted = true
    //         for (let i in allGames) {
    //             if (allGames[i].netScore < allGames[i + 1].netScore && allGames[i + 1]) {
    //                 sorted = false
    //                 let temp = allGames[i]
    //                 allGames[i] = allGames[i + 1]
    //                 allGames[i + 1] = temp
    //             }
    //         }
    //     }
    //     sb.entriesCache = allGames
    // }
    
    page = page - 1

    let i = Math.min(page * entriesPerPage, sb.entriesCache.length)

    if (i >= sb.entriesCache.length) {
        return false
    }
    setPositionOnEntries(sb)
    return sb.entriesCache.slice(i, Math.min((page + 1) * entriesPerPage, sb.entriesCache.length))
}
function setPositionOnEntries(sb) {
    for (let i in sb.entriesCache) {
        sb.entriesCache[i].position = parseInt(parseInt(i) + 1)
    }
}
// ---------------------------------------------


function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
  
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }
    return array
  }
  