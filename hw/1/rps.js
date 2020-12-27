let rps = ['s', 'p', 'r']

let play = true

while (play) {
    let computer = Math.floor(Math.random() * 3) + 3
    let player = rps.indexOf(prompt('Rock paper scissors')) + 3

    if (computer == player) {
        alert('tie!')
    } else if (
        ((computer - 1) % 3) == (player % 3)
    )
    {
        alert(`${rps[player - 3]} beats ${rps[computer - 3]}. player wins!`)
    } else {
        alert(`${rps[computer - 3]} beats ${rps[player - 3]}. computer wins!`)  
    }
    
    play = confirm('play again?')
}