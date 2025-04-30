const STATES = {
    match: {},
    longBell: false,
}

let intervalId = null

// Handlers

// Renders

const renderContent = () => {
    
    document.getElementById("content").innerHTML = `
    
        <div class="flex h-[35%] justify-between bg-gradient-to-r from-red-500 to-black p-4">
            <div class="flex flex-1 flex-col px-8 pb-8 justify-between">
                <div class="flex flex-col">
                    <h1 class="text-[6em] line-clamp-1 m-0 p-0">${STATES.match.participants[0]?.name}</h1>
                    <p class="text-[3.5em]">${STATES.match.participants[0]?.contingent}</p>
                </div>
                <div class="flex space-x-[6em] mt-4 px-4">
                    ${
                        STATES.match.participants[0]?.c1 ? `
                            <div id="0-c1" class="bg-[#FEFF04] text-black px-5 py-4 rounded-full">
                                <span class="text-[2em] font-semibold">C1</span>
                            </div>
                        ` : ""
                    }
                    ${
                        STATES.match.participants[0]?.c2 ? `
                            <div id="0-c2" class="bg-[#FEFF04] text-black px-5 py-4 rounded-full">
                                <span class="text-[2em] font-semibold">C2</span>
                            </div>
                        ` : ""
                    }
                    ${
                        STATES.match.participants[0]?.c3 ? `
                            <div id="0-c3" class="bg-[#FEFF04] text-black px-5 py-4 rounded-full">
                                <span class="text-[2em] font-semibold">C3</span>
                            </div>
                        ` : ""
                    }
                    ${
                        STATES.match.participants[0]?.hc ? `
                            <div id="0-hc" class="bg-[#FEFF04] text-black px-5 py-4 rounded-full">
                                <span class="text-[2em] font-semibold">HC</span>
                            </div>
                        ` : ""
                    }
                    ${
                        STATES.match.participants[0]?.h ? `
                            <div id="0-h" class="bg-[#FEFF04] text-black px-[1.85em] py-4 rounded-full">
                                <span class="text-[2em] font-semibold">H</span>
                            </div>
                        ` : ""
                    }
                </div>
            </div>
            <div class="flex flex-col justify-center items-center">
                <div class="relative">
                    <h1 id="0-point" class="text-[13em] font-semibold text-red-500 mx-10 ${((STATES.match.participants[0]?.point - STATES.match.participants[1]?.point) >= 8) ? 'fade' : ''}">${STATES.match.participants[0]?.point}</h1>
                    ${STATES.match.participants[0]?.senshuu ? '<div id="0-senshuu" class="absolute top-[4em] left-[4.7em] transform border border-[.95em] border-red-500 w-[4em] h-[4em] rounded-full translate-x-[-10em]"></div>' : ''}
                </div>
            </div>
        </div>

        <div class="flex h-[35%] justify-between bg-gradient-to-r from-blue-500 to-black p-4">
            <div class="flex flex-1 flex-col px-8 pb-8 justify-between">
                <div class="flex flex-col">
                    <h1 class="text-[6em] line-clamp-1 m-0 p-0">${STATES.match.participants[1]?.name}</h1>
                    <p class="text-[3.5em]">${STATES.match.participants[1]?.contingent}</p>
                </div>
                <div class="flex space-x-[6em] mt-4 px-4">
                    ${
                        STATES.match.participants[1]?.c1 ? `
                            <div id="1-c1" class="bg-[#FEFF04] text-black px-5 py-4 rounded-full">
                                <span class="text-[2em] font-semibold">C1</span>
                            </div>
                        ` : ""
                    }
                    ${
                        STATES.match.participants[1]?.c2 ? `
                            <div id="1-c2" class="bg-[#FEFF04] text-black px-5 py-4 rounded-full">
                                <span class="text-[2em] font-semibold">C2</span>
                            </div>
                        ` : ""
                    }
                    ${
                        STATES.match.participants[1]?.c3 ? `
                            <div id="1-c3" class="bg-[#FEFF04] text-black px-5 py-4 rounded-full">
                                <span class="text-[2em] font-semibold">C3</span>
                            </div>
                        ` : ""
                    }
                    ${
                        STATES.match.participants[1]?.hc ? `
                            <div id="1-hc" class="bg-[#FEFF04] text-black px-5 py-4 rounded-full">
                                <span class="text-[2em] font-semibold">HC</span>
                            </div>
                        ` : ""
                    }
                    ${
                        STATES.match.participants[1]?.h ? `
                            <div id="1-h" class="bg-[#FEFF04] text-black px-[1.85em] py-4 rounded-full">
                                <span class="text-[2em] font-semibold">H</span>
                            </div>
                        ` : ""
                    }
                </div>
            </div>
            <div class="flex flex-col justify-center items-center">
                <div class="relative">
                    <h1 id="1-point" class="text-[13em] font-semibold text-blue-500 mx-10 ${((STATES.match.participants[1]?.point - STATES.match.participants[0]?.point) >= 8) ? 'fade' : ''}">${STATES.match.participants[1]?.point}</h1>
                    ${STATES.match.participants[1]?.senshuu ? '<div id="1-senshuu" class="absolute top-[1em] left-0 transform border border-[.95em] border-blue-500 w-[4em] h-[4em] rounded-full translate-x-[-10em]"></div>' : ''}
                </div>
            </div>
        </div>

        <div class="flex h-[30%] relative justify-between items-center bg-gray-900">
            <img src="/icons/logo.png" alt="Logo" class="w-[22em]">
            <span id="timer" class="text-[10em] ${STATES.match.time < 15 ? 'text-[#FF0000]' : STATES.match.time < 60 ? 'text-yellow-500' : 'text-white'}">${`0${Math.floor(STATES.match.time/60)}`.slice(-2)}:${`0${Math.floor(STATES.match.time%60)}`.slice(-2)}.${`0${parseFloat(STATES.match.time%1).toFixed(2)}`.slice(-2)}</span>
            <div class="flex flex-col mr-16 max-w-[20em]">
                <p class="text-yellow-400 text-[4em] font-bold">${STATES.match.tatami}</p>
                <p class="text-[1.5em]">${STATES.match.category}</p>
            </div>
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
                STATES.match.time = Math.max(STATES.match.time - .01, 0)
                if (timer) {
                    timer.innerText = `${`0${Math.floor(STATES.match.time/60)}`.slice(-2)}:${`0${Math.floor(STATES.match.time%60)}`.slice(-2)}.${`0${parseFloat(STATES.match.time%1).toFixed(2)}`.slice(-2)}`
                    if (STATES.match.time < 15) timer.style.color = "#FF0000"
                    else if (STATES.match.time < 60) timer.style.color = "yellow"
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

            setTimeout(() => {
                document.getElementById("confetti").classList.remove("show")
                document.getElementById("confetti").classList.add("hide")
            }, 2000)
        }
    }
}

window.addEventListener("load", serviceOnLoad)
window.addEventListener("unload", serviceOnUnload)
window.addEventListener("storage", serviceOnLocalStorageChange)
