let openweather = 'd5b49d362cf029e62e23b7eca9882ae7'
let openweatherURL = 'https://api.openweathermap.org/data/2.5/onecall?q=${city}&appid=d5b49d362cf029e62e23b7eca9882ae7&units=imperial'

let cities
let citiesOpenweather
let countryNames

!gloc('lastSearched') ? sloc('lastSearched', {name: 'London, United Kingdom', lat: 51.5085, lon: -0.1257}) : false
!gloc('searchHistory') ? sloc('searchHistory', []) : false
updateSearchHistory()
populateWeather(gloc('lastSearched').name, gloc('lastSearched').lat, gloc('lastSearched').lon)

// if (localStorage.getItem('cities')) {
//     cities = JSON.parse(localStorage.getItem('cities'))
// } else {
//     fetch('htps://pkgtstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json')   
//     .then(response => response.json())
//     .then(data => {
//         cities = data
//         console.log(cities)
//         localStorage.setItem('cities', JSON.stringify(cities))
//     })
// }

fetch(`city_list.json`, {
    headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        }
    }).then(response => {
    if (response.ok) {
        return response.json()
    } else {
        lg(response)
    }
}).then(data => {
    cities = data
})
.catch(err => lg(err))

fetch(`names.json`, {
    headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        }
}).then(response => {
    if (response.ok) {
        return response.json()
    } else {
        lg(response)
    }
}).then(data => {
    countryNames = data
})

async function search(cityIn=null) {
    eid('search-results').innerHTML = ''
    if (cityIn) {
        eid('search-input').value = cityIn
    } else {
        cityIn = eid('search-input').value
    }
    let matches = cities.filter(city => norm(city.name) == norm(cityIn))
    if (!matches[0]) {
        appendSearchResult(null, 'No cities found.')
    } else {
        for (let i in matches) appendSearchResult(matches[i])

        let hist = gloc('searchHistory')
        if (!hist.find(city => norm(cityIn) == norm(city))) {
            if (hist.length > 10) hist.shift()
            hist.push(cityIn)
            sloc('searchHistory', hist)
            updateSearchHistory()
        }
    }
}

async function populateWeather(cityName, lat, lon) {
    eid('loading').style.display = 'block'
    eid('weather-display').style.display = 'none'

    let weather = await (
        await fetch(weatherQuery(lat, lon))
    ).json()
    lg(weather)

    eid('temperature').innerHTML = `Temperature: ${weather.current.temp}°F`
    eid('humidity').innerHTML = `Humidity: ${weather.current.humidity}%`
    eid('wind-speed').innerHTML = `Wind Speed: ${weather.current.wind_speed}MPH`
    eid('city-name').innerHTML = cityName
    eid('weather-icon-main').innerHTML = `<img src='${iconURL(weather.current.weather[0].icon)}' style='width: 3rem; mix-blend-mode: difference;'>`
    let uvi = weather.current.uvi
    let uvEl = eid('uv')
    eid('uv-text').innerHTML = uvi
    if (uvi < 8) {
        if (uvi < 6) {
            if (uvi < 3) {
                if (uvi == 0) {
                    uvEl.className = 'bg-white'
                    eid('uv-text').innerHTML = '<span style="color: black;">No UV data exists for this area.</span>'
                } else {
                    // low
                    uvEl.className = 'bg-primary'
                }
            } else {
                // moderate
                uvEl.className = 'bg-warning'
            }
        } else {
            // high
            uvEl.className = 'bg-danger'
        }
    } else {
        // very high
        uvEl.className = 'bg-danger'
        eid('uv-text').innerHTML = eid('uv-text').innerHTML + ' (!!!)'
    }

    let i = 1
    let forecast = eid('5-day-cards')
    forecast.innerHTML = ''
    while ((i < 6) && weather.daily[i]) {
        let date = new Date(weather.daily[i].dt * 1000)
        forecast.innerHTML = forecast.innerHTML + 
            `<div class="card bg-info"><div class="card-title">${date.getMonth()}/${date.getDay()}/${date.getFullYear()}</div><div class="card-text"><img src='${iconURL(weather.daily[i].weather[0].icon)}' style='width: 3rem; mix-blend-mode: difference;'><br>Temp: ${weather.daily[i].temp.day}°F<br>Humidity: ${weather.daily[i].humidity}%</div></div>`
        i++
    }

    eid('loading').style.display = 'none'
    eid('weather-display').style.display = 'block'

    sloc('lastSearched', {name: cityName, lat: lat, lon: lon})
}

function iconURL(code) { return `http://openweathermap.org/img/wn/${code}@2x.png` }

async function getCoords(city) {
        let result = await (
            await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d5b49d362cf029e62e23b7eca9882ae7&units=imperial`)
        ).json()
    return {
        lat: result['coord']['lat'],
        lon: result['coord']['lon']
    }
}

function weatherQuery(lat, lon) { return `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=d5b49d362cf029e62e23b7eca9882ae7&units=imperial` }

function appendSearchResult(city, message=null) {
    let sres = eid('search-results')
    if (message) {
        sres.innerHTML = message
        return
    }

    let innerstr = `${city.name}, ${countryNames[city.country]}`

    if (!city.state == '') innerstr = `${city.name}, ${city.state}, ${countryNames[city.country]}`

    let args = `'${innerstr}', ${city.coord.lat}, ${city.coord.lon}`
    
    sres.innerHTML = sres.innerHTML + 
        `<li class="list-group-item list-group-item-action" onclick="populateWeather(${args})">${innerstr}</li>`
}

function txt(text) { return document.createTextNode(text) }

function eid(id) { return document.getElementById(id) } // this is way too long

function norm(str) { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() }

function lg(item) { console.log(item) }

function gloc(name) { return JSON.parse(localStorage.getItem(name)) }

function sloc(name, val) { localStorage.setItem(name, JSON.stringify(val)) }

function updateSearchHistory() {
    let hist = gloc('searchHistory')
    let histEl = eid('search-history')
    histEl.innerHTML = ''
    for (let i in hist) {
        histEl.innerHTML = histEl.innerHTML + 
            `<li class="list-group-item list-group-item-action" onclick="search('${hist[i]}')">${hist[i]}</li>`
    }
    if (hist.length == 0) histEl.innerHTML = 'Search history is empty.'
}