function configureParameters() {
    document.getElementById('modal').style.display = 'flex'
}

function generate() {
    let cb = validateCheckBoxInput()
    let le = validateLengthInput()
    if (le && cb) {
        document.getElementById('modal').style.display = 'none'
        // Generate password
        let chars = ''
        // Add chars to pool of chars
        Array.from(document.querySelectorAll('input[type="checkbox"]')).forEach(e => {
            if ((e.id == 'lowercase') && e.checked) chars = chars + 'abcdefghijklmnopqrstuvwxyz'
            if ((e.id == 'uppercase') && e.checked) chars = chars + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            if ((e.id == 'numeric') && e.checked) chars = chars + '0123456789'
            if ((e.id == 'special') && e.checked) chars = chars + "!\"#$%&'()*+,-./:;<=>?[]^_`{|}~\\"
        })
        let pass = '';
        for (let i = 0; i < parseInt(document.getElementById('length').value); i++) {
            let newChar = chars[Math.floor(Math.random() * chars.length)]
            pass = pass + newChar
        }
        document.getElementById('password').value = pass
    } else {
        document.getElementById('length').addEventListener('input', validateLengthInput)
        document.querySelectorAll('input[type="checkbox"]').forEach(e => e.addEventListener('change', validateCheckBoxInput))
    }
}

function validateLengthInput(ev) {
    if (parseInt(document.getElementById('length').value)) {
        if ((parseInt(document.getElementById('length').value) < 8) || (parseInt(document.getElementById('length').value) > 128)) {
            document.getElementById('length-error').style.display = 'block'
            return false
        } else {
            document.getElementById('length-error').style.display = 'none'
            return true
        }
    } else {
        document.getElementById('length-error').style.display = 'block'
        return false
    }
}

function validateCheckBoxInput(ev) {
    let sum = Array.from(document.querySelectorAll('input[type="checkbox"]')).map(e => e.checked).reduce((a, b) => a + b, 0)
    if (sum == 0) {
        document.getElementById('checkbox-error').style.display = 'block'
        return false
    } else {
        document.getElementById('checkbox-error').style.display = 'none'
        return true
    }
}