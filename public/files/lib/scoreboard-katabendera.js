const STATES = {
    match: {},
}

// Handlers

const handlerFade = (i) => {

    let cls = ""

    if (STATES.match.participants[0] != null && STATES.match.participants[1] != null) {
        if (STATES.match.participants[0].point > STATES.match.participants[1].point && i == 0) cls = "fade" 
        if (STATES.match.participants[1].point > STATES.match.participants[0].point && i == 1) cls = "fade" 
    }

    return cls
}

// Renders

const renderContent = () => {
    
    document.getElementById("content").innerHTML = `
    
        ${
            STATES.match.participants[0] != null ? `
                <div class="flex h-[${STATES.match.participants[1] == null ? '70%' : '35%'}] justify-between bg-gradient-to-r from-red-500 to-black p-4">
                    <div class="flex flex-1 flex-col px-8 pb-8 justify-between">
                        <div class="flex flex-1 flex-col justify-center">
                            <h1 class="text-[5.5em] line-clamp-1 m-0 p-0">${STATES.match.participants[0]?.name}</h1>
                            <p class="text-[3.5em]">${STATES.match.participants[0]?.contingent}</p>
                        </div>
                    </div>
                    <div class="flex flex-col justify-center items-center">
                        <div class="relative">
                            <h1 id="0-point" class="text-[16em] ${handlerFade(0)} font-bold text-red-500 mx-10">${STATES.match.participants[0]?.point}</h1>
                        </div>
                    </div>
                </div>
            ` : ''
        }

        ${
            STATES.match.participants[1] != null ? `
                <div class="flex h-[${STATES.match.participants[0] == null ? '70%' : '35%'}] justify-between bg-gradient-to-r from-blue-500 to-black p-4">
                    <div class="flex flex-1 flex-col px-8 pb-8 justify-between">
                        <div class="flex flex-1 flex-col justify-center">
                            <h1 class="text-[5.5em] line-clamp-1 m-0 p-0">${STATES.match.participants[1]?.name}</h1>
                            <p class="text-[3.5em]">${STATES.match.participants[1]?.contingent}</p>
                        </div>
                    </div>
                    <div class="flex flex-col justify-center items-center">
                        <div class="relative">
                            <h1 id="1-point" class="text-[16em] ${handlerFade(1)} font-bold text-blue-500 mx-10">${STATES.match.participants[1]?.point}</h1>
                        </div>
                    </div>
                </div>
            ` : ''
        }

        <div class="flex h-[30%] relative justify-between items-center bg-gray-900 pr-16">
            <img src="/icons/logo.png" alt="Logo" class="w-[22em]">
            <p class="text-yellow-400 text-[5em] font-bold">${STATES.match.tatami}</p>
            <div class="flex flex-col max-w-[40em]">
                <p class="text-[2.2em]">${STATES.match.category}</p>
            </div>
        </div>
    `
}

// Services

const serviceOnLoad = async () => {

    const match = await localStorage.getItem("stage_kata_bendera")
    if (!match) return
    
    STATES.match = JSON.parse(match)
    renderContent()
}

const serviceOnUnload = () => {
    
}

const serviceOnLocalStorageChange = (e) => {

    if (e.key == "stage_kata_bendera") {

        if (e.newValue === null) {
            location.reload()
            return
        }

        STATES.match = JSON.parse(e.newValue)
        renderContent()
    }

    if (e.key == "confetti_kata_bendera") {
        const confetti = e.newValue.split("-")
        if (confetti?.length > 0) {
            const container = document.getElementById(`confetti`)
            let content = ''

            switch (confetti[0]) {
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
