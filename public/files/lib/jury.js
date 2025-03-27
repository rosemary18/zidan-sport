const STATES = {
    event: {},
    match: {},
    jury: {},
}

// Handlers

const handlerRequestCredential = async () => {

    let eventId = prompt("Masukkan ID Event : ")
    let juryId = prompt("Masukkan Nomor Juri : ")
    let arenaId = prompt("Masukkan Nomor Tatami : ")

    if (!eventId || !juryId || !arenaId) {
        alert("ID Event, Nomor Juri, dan Nomor Tatami harus diisi!")
        return
    }

    STATES.jury = {
        eventId: eventId,
        juryId: juryId,
        arenaId: arenaId
    }
    localStorage.setItem("jury", JSON.stringify(STATES.jury))
}

function updateScore(player, amount) {
    let scoreInput = document.getElementById(player + "Score");
    let currentScore = parseFloat(scoreInput.value);
    let newScore = Math.max(5.0, Math.min(10.0, currentScore + amount));
    scoreInput.value = newScore.toFixed(1);
}

function validateScore(player) {
    let scoreInput = document.getElementById(player + "Score");
    let newScore = parseFloat(scoreInput.value);
    if (isNaN(newScore) || newScore < 5.0) {
        scoreInput.value = "5.0";
    } else if (newScore > 10.0) {
        scoreInput.value = "10.0";
    }
}

const changeCredential = () => {      

    localStorage.removeItem("jury")
    location.reload()
}

// Services

const handlerOnLoad = async () => {

    // const socket = io();
    const j = await localStorage.getItem("jury")

    if (!j) {
        handlerRequestCredential()
        return
    }

    STATES.jury = JSON.parse(j)
}

window.addEventListener("load", handlerOnLoad)