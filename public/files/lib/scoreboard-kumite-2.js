const STATES = {
    match: {},
    longBell: false,
}

let intervalId = null
let timeOutId = null

// Handlers

// Renders

const renderContent = () => {
    
    document.getElementById("content").innerHTML = `

        <div class="flex h-[65%] relative">
            <div class="absolute bottom-0 right-1/2 translate-x-1/2 bg-white px-6 z-[99]">
                <span class="font-bold text-black text-[3.1em]">PENALTIES</span>
            </div>
            <div class="flex flex-1 flex-col bg-[#0000FF4D] relative">
                <div class="absolute bottom-[6.5rem] right-[2rem] bg-[#0000FF] p-4 rounded-3xl w-[25%] h-[35%] flex flex-col justify-center items-center overflow-hidden">
                    <span class="font-bold text-white text-[12rem] ${((STATES.match.participants[1]?.point - STATES.match.participants[0]?.point) >= 8) ? 'fade' : ''}">${STATES.match.participants[1].point}</span>
                    ${
                        STATES.match.participants[1].senshuu ? `
                            <div class="absolute bottom-0 right-0 w-0 h-0 border-l-[7em] border-b-[7em] border-l-transparent border-r-transparent border-b-white-500"></div>
                            <div class="absolute bottom-0 right-[.9em]">
                                <span class="font-bold text-green-600 text-italic text-[2.8em]">S</span>
                            </div>                    
                        ` : ''
                    }
                </div>
                <div class="flex flex-1 flex-col p-5 px-8">
                    <h1 class="text-[5rem] font-bold line-clamp-1 m-0 p-0">${STATES.match.participants[1]?.name}</h1>
                    <p class="text-[2.5rem]">( ${STATES.match.participants[1]?.contingent} )</p>
                </div>
                <div class="flex border border-[2px] border-white pr-[10em]">
                    <div class="${STATES.match.participants[1].h ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[1].h ? 'text-black' : 'text-white'} text-[2em]">H</span>
                    </div>
                    <div class="${STATES.match.participants[1].hc ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[1].hc ? 'text-black' : 'text-white'} text-[2em]">HC</span>
                    </div>
                    <div class="${STATES.match.participants[1].c3 ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[1].c3 ? 'text-black' : 'text-white'} text-[2em]">C3</span>
                    </div>
                    <div class="${STATES.match.participants[1].c2 ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[1].c2 ? 'text-black' : 'text-white'} text-[2em]">C2</span>
                    </div>
                    <div class="${STATES.match.participants[1].c1 ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[1].c1 ? 'text-black' : 'text-white'} text-[2em]">C1</span>
                    </div>
                </div>
            </div>
            <div class="flex flex-1 flex-col bg-[#ff00004D] relative">
                <div class="absolute bottom-[6.5rem] left-[2rem] bg-[#ff0000] p-4 rounded-3xl w-[25%] h-[35%] flex flex-col justify-center items-center overflow-hidden">
                    <span class="font-bold text-white text-[12rem] ${((STATES.match.participants[0]?.point - STATES.match.participants[1]?.point) >= 8) ? 'fade' : ''}">${STATES.match.participants[0].point}</span>
                    ${
                        STATES.match.participants[0].senshuu ? `
                            <div class="absolute bottom-0 left-0 w-0 h-0 border-r-[7em] border-b-[7em] border-r-transparent border-l-transparent border-b-white-500"></div>
                            <div class="absolute bottom-0 left-[.9em]">
                                <span class="font-bold text-green-600 text-italic text-[2.8em]">S</span>
                            </div>
                        ` : ''
                    }
                </div>
                <div class="flex flex-1 flex-col items-end p-5 px-8">
                    <h1 class="text-[5rem] font-bold line-clamp-1 m-0 p-0">${STATES.match.participants[0]?.name}</h1>
                    <p class="text-[2.5rem]">( ${STATES.match.participants[0]?.contingent} )</p>
                </div>
                <div class="flex border border-[2px] border-white pl-[10em]">
                    <div class="${STATES.match.participants[0].c1 ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[0].c1 ? 'text-black' : 'text-white'} text-[2em]">C1</span>
                    </div>
                    <div class="${STATES.match.participants[0].c2 ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[0].c2 ? 'text-black' : 'text-white'} text-[2em]">C2</span>
                    </div>
                    <div class="${STATES.match.participants[0].c3 ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[0].c3 ? 'text-black' : 'text-white'} text-[2em]">C3</span>
                    </div>
                    <div class="${STATES.match.participants[0].hc ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[0].hc ? 'text-black' : 'text-white'} text-[2em]">HC</span>
                    </div>
                    <div class="${STATES.match.participants[0].h ? 'bg-[#FEFF04]' : ''} flex flex-1 justify-center items-center py-3">
                        <span class="font-bold ${STATES.match.participants[0].h ? 'text-black' : 'text-white'} text-[2em]">H</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex h-[35%] relative justify-between items-center bg-black-900">
            <div class="flex flex-col ml-16 max-w-[21em]">
                <p class="text-yellow-400 text-[4.5em] font-bold">${STATES.match.tatami}</p>
                <p class="text-[1.8em]">${STATES.match.category}</p>
            </div>
            <div class="flex justify-center items-center">
                <span id="timer" class="text-[12em] ${STATES.match.time < 15 ? 'text-[#FF0000]' : STATES.match.time < 60 ? 'text-yellow-500' : 'text-white'}">
                    ${Math.floor(STATES.match.time/60)}:${`0${Math.floor(STATES.match.time%60)}`.slice(-2)}
                </span>
                <span id="timer-2" class="text-[6em] ${STATES.match.time < 15 ? 'text-[#FF0000]' : STATES.match.time < 60 ? 'text-yellow-500' : 'text-white'}">
                    .${parseFloat(STATES.match.time%1).toFixed(1).toString().slice(-1)}
                </span>
            </div>
            <img src="/icons/logo.png" alt="Logo" class="w-[22em] mr-6">
        </div>
    `
}

// Services

const serviceOnLoad = async () => {

    const match = await localStorage.getItem("stage_kumite")
    if (!match) return
    
    STATES.match = JSON.parse(match)
    renderContent()
}

const serviceOnUnload = () => {

    clearInterval(intervalId)
    intervalId = null
}

const serviceOnLocalStorageChange = (e) => {

    if (e.key == "stage_kumite") {

        if (e.newValue === null) {
            location.reload()
            return
        }

        STATES.match = JSON.parse(e.newValue)

        if (!STATES.match.play && intervalId == null) renderContent()
        if (STATES.match?.rest == true) {
            console.log("Re-render ...")
            STATES.match.rest = false
            renderContent()
        }
        

        if (!STATES.match.play && intervalId != null) {
            clearInterval(intervalId)
            intervalId = null
            renderContent()
        }

        if (STATES.match.play && intervalId == null) {
            intervalId = setInterval(() => {
                const timer = document.getElementById("timer")
                const timer2 = document.getElementById("timer-2")
                STATES.match.time = Math.max(STATES.match.time - .01, 0)
                timer.innerText = `${Math.floor(STATES.match.time/60)}:${`0${Math.floor(STATES.match.time%60)}`.slice(-2)}`
                timer2.innerText = `.${`${parseFloat(STATES.match.time%1).toFixed(2)}`[2]}`

                if (STATES.match.time < 15) {
                    timer.style.color = "#FF0000"
                    timer2.style.color = "#FF0000"
                } else if (STATES.match.time < 60) {
                    timer.style.color = "yellow"
                    timer2.style.color = "yellow"
                }

                if (Math.floor(STATES.match.time) == 15 && STATES.longBell == false) {
                    STATES.longBell = true
                    document.getElementById('short-bell').play()
                }
                if (Math.floor(STATES.match.time) <= 14) STATES.longBell = false
                if (STATES.match.time == 0) {
                    document.getElementById('long-bell').play()
                    clearInterval(intervalId)
                    STATES.match.play = false
                    intervalId = null
                }
            }, 10)
        }
    }

    if (e.key == "confetti_kumite") {
        const confetti = e.newValue.split("-")
        if (confetti?.length > 0) {
            const container = document.getElementById(`confetti`)
            let content = ''

            switch (confetti[0]) {
                case "c1":
                    content = `
                        <h1 class="text-center text-[2.4em] font-bold">PENALTY</h1>
                        <h2 class="text-[1.2em]">( C1 )</h2>
                    `
                    break;
                case "c2":
                    content = `
                        <h1 class="text-center text-[2.4em] font-bold">PENALTY</h1>
                        <h2 class="text-[1.2em]">( C2 )</h2>
                    `
                    break;
                case "c3":
                    content = `
                        <h1 class="text-center text-[2.4em] font-bold tracking-[0.1em]">PENALTY</h1>
                        <h2 class="text-[1.2em]">( C3 )</h2>
                    `
                    break;
                case "hc":
                    content = `
                        <h1 class="text-center text-[2.4em] font-bold tracking-[0.1em]">PENALTY</h1>
                        <h2 class="text-[1.2em]">( HANSHOKU )</h2>
                    `
                    break;
                case "h":
                    content = `
                        <h1 class="text-center text-[2.4em] font-bold tracking-[0.1em]">PENALTY</h1>
                        <h2 class="text-[1.2em]">( HANSHOKU )</h2>
                    `
                    break;
                case "senshuu":
                    content = `
                        <h1 class="text-center text-[1.75em] font-bold tracking-[0.1em]">FIRST POINT ADVANTAGE</h1>
                        <h2 class="text-[1.2em]">( SENSHUU )</h2>
                    `
                    break;
                case "yuko":
                    content = `
                        <h1 class="text-center text-[2.4em] font-bold tracking-[0.1em]">1 POINT</h1>
                        <h2 class="text-[1.2em]">( YUKO )</h2>
                    `
                    break;
                case "wazari":
                    content = `
                        <h1 class="text-center text-[2.4em] font-bold tracking-[0.1em]">2 POINT</h1>
                        <h2 class="text-[1.2em]">( WAZARI )</h2>
                    `
                    break;
                case "ippon":
                    content = `
                        <h1 class="text-center text-[2.4em] font-bold tracking-[0.1em]">3 POINT</h1>
                        <h2 class="text-[1.2em]">( IPPON )</h2>
                    `
                    break;
                case "min":
                    content = `<h1 class="text-center text-[2.4em] font-bold tracking-[0.1em]">-1 POINT</h1>`
                    break;
                case "win":
                    content = `
                        <h1 class="text-center text-[1.5em] font-bold tracking-[0.1em]">${STATES.match.participants[confetti[1] == "red" ? 0 : 1].name}</h1>
                        <h2 class="text-[1.2em]">( WINNER )</h2>
                    `
                    break;
                default:
                    break;
            }

            switch (confetti[1]) {
                case "red":
                    container.style.backgroundColor = "#FF0000F2"
                    break;
                case "blue":
                    container.style.backgroundColor = "#0000FFF2"
                    break;
                default:
                    break;
            }

            container.innerHTML = content
            container.classList.remove("hide")
            container.classList.add("show")

            clearTimeout(timeOutId)
            timeOutId = null
            timeOutId = setTimeout(() => {
                document.getElementById("confetti").classList.remove("show")
                document.getElementById("confetti").classList.add("hide")
            }, 2500)
        }
    }
}

window.addEventListener("load", serviceOnLoad)
window.addEventListener("unload", serviceOnUnload)
window.addEventListener("storage", serviceOnLocalStorageChange)
