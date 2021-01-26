let times = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm']
let times24 = [9, 10, 11, 12, 13, 14, 15, 16, 17]
setInterval(updateTexts, 500)

if (!getLocal()) {
    let schedule = []
    for (let i in times) {
        schedule.push({
            time: times[i],
            message: ''
        })
    }
    setLocal(schedule)
    localStorage.setItem('lastDay', moment().format('LLLL'))
} else {
    if (localStorage.getItem('lastDay') != moment().format('LLLL')) {
        let schedule = []
        for (let i in times) {
            schedule.push({
                time: times[i],
                message: ''
            })
        }
        setLocal(schedule)
        localStorage.setItem('lastDay', moment().format('LLLL'))
    }
}

$('.save').on('click', function() {
    let time = $(this).attr('id')
    let msg = $(`#${time} textarea`).val()
    let s = getLocal()
    s.forEach((elem) => {
        if (elem.time == time) {
            elem.message = msg
        }
    })
    setLocal(s)
})

function updateTexts() {
    $('textarea').each(function() {
        $(this).text(
            getLocal().find(
                elem => elem.time == $(this).attr('id')
            ).message
        )
        let time24 = times24[times.indexOf($(this).attr('id'))]
        let real24 = parseInt(moment().format('H'))
        if (time24 < real24) {
            $(this).attr('class', 'past')
        } else if (time24 > real24) {
            $(this).attr('class', 'future')
        } else {
            $(this).attr('class', 'present')
        }
    })
    $('#currentDay').text(moment().format('LLLL'))
}



function getLocal() { return JSON.parse(localStorage.getItem('schedule')) }

function setLocal(schedule) { localStorage.setItem('schedule', JSON.stringify(schedule)) }

