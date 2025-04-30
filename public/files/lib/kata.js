const STATES = {
    event: {},
    categories: [],
    matches: [],
    filteredMatches: [],
    participants: [],
    sortOrder: [true, true],
    category: '',
    currentPage: 1,
    stageKata: null
}

const socket = io()
let timeId = null

// Handlers

const handlerGetAllParticipants = async () => {

    const res = await fetch(`/api/participant/event/${STATES.event.id}`)
    const data = await res?.json()

    if (data?.statusCode == 200) {
        STATES.participants = data.data
        STATES.categories = [...new Set(data?.data?.filter(d => d?.category?.includes("KATA")).map(d => d?.category))];
    }
}

const handlerGetAllMatches = async () => {

    const res = await fetch(`/api/match/${STATES.event.id}/${encodeURIComponent(STATES.category)}`)
    const data = await res?.json()

    if (data?.statusCode == 200) {
        const filtered = data.data?.filter(d => d?.match_type == "KATA" || d?.match_type == "KATA REGU")
        STATES.matches = filtered
        STATES.filteredMatches = filtered
        handlerRenderTable()
    }
}

const handlerCloseModal = (add) => {

    const category = document.getElementById("category");
    const participant1 = document.getElementById("participant-1");
    const participant2 = document.getElementById("participant-2");
    const tatami = document.getElementById("tatami");
    const modal = document.getElementById("modal");

    if (add) {
        if (category.value == '' || (participant1.value == '' && participant2.value == '') || tatami.value == '') {
            alert('Data belum lengkap!');
            return
        }
    }
    
    modal.innerHTML = "";
    modal.classList.add("hidden");

    if (add) {
        const stageKata = {
            id: Math.floor(Math.random() * 1000000),
            match_id: Math.random().toString(36).substring(2, 6).toUpperCase(),
            event_id: STATES.event.id,
            category: category.value,
            participants: [],
            tatami: tatami.value,
            time: 0,
            play: false,
            rest: false
        }

        if (participant1.value?.split('|')?.[0]) {
            stageKata.participants.push({
                ...STATES.participants.find(participant => participant?.id == participant1.value?.split('|')[0]),
                g1: 0,
                g2: 0,
                g3: 0,
                g4: 0,
                g5: 0,
                c1: true,
                c2: true,
                c3: true,
                c4: true,
                c5: true,
                point: 0
            })
        } else stageKata.participants.push(null)

        if (participant2.value?.split('|')?.[0]) {
            stageKata.participants.push({
                ...STATES.participants.find(participant => participant?.id == participant2.value?.split('|')[0]),
                g1: 0,
                g2: 0,
                g3: 0,
                g4: 0,
                g5: 0,
                c1: true,
                c2: true,
                c3: true,
                c4: true,
                c5: true,
                point: 0
            })
        } else stageKata.participants.push(null)

        localStorage.setItem("stage_kata", JSON.stringify(stageKata))
        STATES.stageKata = stageKata
        document.getElementById("match-handler").classList.remove("hidden");
        document.getElementById("title").innerText = `${stageKata?.match_id} | ${stageKata?.tatami} | ${stageKata?.category?.toUpperCase()}`
        document.getElementById("main-content").classList.add("hidden");
        document.getElementById("match-content").classList.remove("hidden");
        handlerRenderMatch()
    }

}

const handlerDeleteStageMatch = () => {
    
    let conf = confirm("Apakah anda yakin untuk tidak menyimpan pertandingan ini?")

    if (conf) {
        localStorage.removeItem("stage_kata")
        STATES.stageKata = null
        document.getElementById("match-handler").classList.add("hidden");
        document.getElementById("title").innerText = `KATA | EVENT ${STATES.event?.name?.toUpperCase()}`
        document.getElementById("main-content").classList.remove("hidden");
        document.getElementById("match-content").classList.add("hidden");
        handlerRenderTable()
    }
}

const handlerMatchControl = (i, type) => {

    if (type == 'play' && STATES.stageKata.time != 0) {
        STATES.stageKata.play = !STATES.stageKata?.play

        if (STATES.stageKata.play) {
            timeId = setInterval(() => {
                STATES.stageKata.time = Math.max(STATES.stageKata.time - .01, 0)
                document.getElementById("timer").textContent = `${`0${Math.floor(STATES.stageKata.time/60)}`.slice(-2)}:${`0${Math.floor(STATES.stageKata.time%60)}`.slice(-2)}.${`0${parseFloat(STATES.stageKata.time%1).toFixed(2)}`.slice(-2)}`
                if (STATES.stageKata.time == 0) STATES.stageKata.play = false
                STATES.stageKata.id = Math.floor(Math.random() * 1000000)
                STATES.stageKata.rest = false
                localStorage.setItem("stage_kata", JSON.stringify(STATES.stageKata))
                if (STATES.stageKata.time == 0) {
                    clearInterval(timeId)
                    timeId = null
                    handlerRenderMatch()
                }
            }, 10);
        } else {
            clearInterval(timeId)
            timeId = null
        }

        STATES.stageKata.rest = false
    } else {
        STATES.stageKata.rest = true
    }

    if (type == 'set') {
        STATES.stageKata.time = document.getElementById("time").value
        document.getElementById("time").value = 0
    }
    if (type == '-1s') STATES.stageKata.time = Math.max(STATES.stageKata.time - 1, 0)
    if (type == '-30s') STATES.stageKata.time = Math.max(STATES.stageKata.time - 30, 0)
    if (type == '-60s') STATES.stageKata.time = Math.max(STATES.stageKata.time - 60, 0)
    if (type == '+1s') STATES.stageKata.time = STATES.stageKata.time + 1
    if (type == '+30s') STATES.stageKata.time = STATES.stageKata.time + 30
    if (type == '+60s') STATES.stageKata.time = STATES.stageKata.time + 60
    if (type == 'reset') {
        STATES.stageKata.time = 0
        STATES.stageKata.play = false
        clearInterval(timeId)
        timeId = null
    }
    
    STATES.stageKata.id = Math.floor(Math.random() * 1000000)
    localStorage.setItem("stage_kata", JSON.stringify(STATES.stageKata))
    
    handlerRenderMatch()
}

const handlerCheckWinner = () => {

    let winner = null

    if (STATES.stageKata.participants[0].point > STATES.stageKata.participants[1].point) winner = STATES.stageKata.participants[0].id
    if (STATES.stageKata.participants[1].point > STATES.stageKata.participants[0].point) winner = STATES.stageKata.participants[1].id

    return winner
}

const handlerSaveMatch = () => {

    if ((document.getElementById("w-1") != undefined && document.getElementById("w-2") != undefined) && (!document.getElementById("w-1").checked && !document.getElementById("w-2").checked)) {
        const conf = confirm("Pemenang belum ditentukan, apakah kamu ingin pemenang di tentukan oleh system ?")
        if (!conf) return
    }

    let con = confirm("Apakah anda yakin untuk menyimpan pertandingan ini?")
    if (!con) return

    const isRegu = !(STATES.stageKata.participants[0] != null && STATES.stageKata.participants[1] != null)

    let winner = isRegu ? '' : document.getElementById("w-1").checked ? STATES.stageKata.participants[0].id : document.getElementById("w-2").checked ? STATES.stageKata.participants[1].id : handlerCheckWinner()
    let grade1 = STATES.stageKata.participants[0] == null ? '' : `${STATES.stageKata.participants[0]?.g1}, ${STATES.stageKata.participants[0]?.g2}, ${STATES.stageKata.participants[0]?.g3}, ${STATES.stageKata.participants[0]?.g4}, ${STATES.stageKata.participants[0]?.g5}, Point ${STATES.stageKata.participants[0]?.point}`
    let grade2 = STATES.stageKata.participants[1] == null ? '' : `${STATES.stageKata.participants[1]?.g1}, ${STATES.stageKata.participants[1]?.g2}, ${STATES.stageKata.participants[1]?.g3}, ${STATES.stageKata.participants[1]?.g4}, ${STATES.stageKata.participants[1]?.g5}, Point ${STATES.stageKata.participants[1]?.point}`

    const data = {
        event_id: STATES.event.id,
        category: STATES.stageKata.category,
        match_type: isRegu ? "KATA REGU" : "KATA",
        winner_id: winner,
        arena: STATES.stageKata.tatami,
        time: "",
        participants: []
    }

    if (STATES.stageKata.participants[0] != null) {
        data.participants.push({
            id: STATES.stageKata.participants[0].id,
            grade: grade1
        })
    }

    if (STATES.stageKata.participants[1] != null) {
        data.participants.push({
            id: STATES.stageKata.participants[1].id,
            grade: grade2
        })
    }

    fetch(`/api/match/create`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            STATES.stageKata = null
            localStorage.removeItem("stage_kata")
            localStorage.removeItem("confetti_kata")
            window.location.reload()
        }
    })
}

const handlerToggleCheckbox = (n) => {

    if (n == 1) document.getElementById('w-2').checked = false
    if (n == 2) document.getElementById('w-1').checked = false

    if (document.getElementById(`w-1`).checked || document.getElementById(`w-2`).checked) localStorage.setItem("confetti_kata", `win-${n == 1 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
}

const handlerSetPoint = () => {

    STATES.stageKata?.participants?.forEach((item, i) => {

        if (item != null) {
            let grades = []
            let allSet = true

            if (item?.c1) {
                grades.push(parseFloat(item?.g1))
                if (item?.g1 == 0) allSet = false
            }

            if (item?.c2) {
                grades.push(parseFloat(item?.g2))
                if (item?.g2 == 0) allSet = false
            }

            if (item?.c3) {
                grades.push(parseFloat(item?.g3))
                if (item?.g3 == 0) allSet = false
            }

            if (item?.c4) {
                grades.push(parseFloat(item?.g4))
                if (item?.g4 == 0) allSet = false
            }

            if (item?.c5) {
                grades.push(parseFloat(item?.g5))
                if (item?.g5 == 0) allSet = false
            }

            if (grades?.length == 3 && allSet) STATES.stageKata.participants[i].point = parseFloat(grades.reduce((a, b) => a+b)).toFixed(2)     
            else STATES.stageKata.participants[i].point = 0
        }
    })

    localStorage.setItem("stage_kata", JSON.stringify(STATES.stageKata))

    handlerRenderMatch()
}

const handlerToggleField = (index, jury) => {
    
    STATES.stageKata.id = Math.floor(Math.random() * 1000)
    STATES.stageKata.participants[index][`c${jury}`] = !STATES.stageKata.participants[index][`c${jury}`]
    localStorage.setItem('stage_kata', JSON.stringify(STATES.stageKata))

    handlerSetPoint()
}

const handlerSetGrade = (index, jury) => {

    const value = document.getElementById(`g-${index}-${jury}`).value

    STATES.stageKata.id = Math.floor(Math.random() * 1000)
    STATES.stageKata.participants[index][`g${jury}`] = value
    localStorage.setItem('stage_kata', JSON.stringify(STATES.stageKata))

    handlerSetPoint()
}

// Renders

const handlerRenderMatch = () => {

    document.getElementById("match-content").innerHTML = `
        <div class="flex text-white">
            ${
                STATES.stageKata.participants[0] != null ? `
                    <div class="flex flex-1 flex-col justify-center items-center p-10 min-h-[30em] bg-red-600 rounded-md relative">
                        ${
                            STATES.stageKata.participants[1] != null ? `
                                <div class="absolute bottom-4 right-4 flex items-center justify-center">
                                    <span class="text-xl">🏆</span>
                                    <input id="w-1" type="checkbox" onclick="handlerToggleCheckbox(1)" class="w-5 h-5 ml-2 shadowed">
                                </div>
                            ` : ''
                        }
                        <h1 class="text-4xl font-bold line-clamp-1">${STATES.stageKata?.participants[0]?.name}</h1>
                        <h2 class="text-2xl font-bold">(${STATES.stageKata?.participants[0]?.contingent})</h2>
                        <h1 class="text-[10em] font-extrabold mt-2">${STATES.stageKata?.participants[0]?.point}</h1>
                    </div>
                ` : ''
            }
            ${ STATES.stageKata.participants[0] == null || STATES.stageKata.participants[1] == null ? '' : '<div class="mx-3"></div>' }
            ${
                STATES.stageKata.participants[1] != null ? `
                    <div class="flex flex-1 flex-col justify-center items-center p-10 min-h-[30em] bg-blue-600 rounded-md relative">
                        ${
                            STATES.stageKata.participants[0] != null ? `
                                <div class="absolute bottom-4 left-4 flex items-center justify-center">
                                    <input id="w-2" type="checkbox" onclick="handlerToggleCheckbox(2)" class="w-5 h-5 mr-2 shadowed">
                                    <span class="text-xl">🏆</span>
                                </div>
                            ` : ''
                        }
                        <h1 class="text-4xl font-bold line-clamp-1">${STATES.stageKata?.participants[1]?.name}</h1>
                        <h2 class="text-2xl font-bold">(${STATES.stageKata?.participants[1]?.contingent})</h2>
                        <h1 class="text-[10em] font-extrabold mt-2">${STATES.stageKata?.participants[1]?.point}</h1>
                    </div>
                ` : ''
            }
        </div>
    
        <div class="grid ${(STATES.stageKata.participants[0] != null && STATES.stageKata.participants[1] != null) ? 'grid-cols-2' : 'grid-cols-1'} gap-3 my-6">
            ${
                STATES.stageKata.participants[0] != null ? `
                    <div class="flex justify-center items-center flex-wrap gap-3 bg-red-100 p-4 rounded-lg">
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[0]?.c1 ? 'checked' : ''} onclick="handlerToggleField(0, 1)" class="w-4 h-4 m-3">
                            <input id="g-0-1" type="text" value="${STATES.stageKata.participants[0]?.g1 != 0 ? STATES.stageKata.participants[0]?.g1 : ''}" onchange="handlerSetGrade(0, 1)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J1" />
                        </div>
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[0]?.c2 ? 'checked' : ''} onclick="handlerToggleField(0, 2)" class="w-4 h-4 m-3">
                            <input id="g-0-2" type="text" value="${STATES.stageKata.participants[0]?.g2 != 0 ? STATES.stageKata.participants[0]?.g2 : ''}" onchange="handlerSetGrade(0, 2)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J2" />
                        </div>
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[0]?.c3 ? 'checked' : ''} onclick="handlerToggleField(0, 3)" class="w-4 h-4 m-3">
                            <input id="g-0-3" type="text" value="${STATES.stageKata.participants[0]?.g3 != 0 ? STATES.stageKata.participants[0]?.g3 : ''}" onchange="handlerSetGrade(0, 3)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J3" />
                        </div>
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[0]?.c4 ? 'checked' : ''} onclick="handlerToggleField(0, 4)" class="w-4 h-4 m-3">
                            <input id="g-0-4" type="text" value="${STATES.stageKata.participants[0]?.g4 != 0 ? STATES.stageKata.participants[0]?.g4 : ''}" onchange="handlerSetGrade(0, 4)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J4" />
                        </div>
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[0]?.c5 ? 'checked' : ''} onclick="handlerToggleField(0, 5)" class="w-4 h-4 m-3">
                            <input id="g-0-5" type="text" value="${STATES.stageKata.participants[0]?.g5 != 0 ? STATES.stageKata.participants[0]?.g5 : ''}" onchange="handlerSetGrade(0, 5)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J5" />
                        </div>
                    </div>                
                ` : ''
            }
            ${
                STATES.stageKata.participants[1] != null ? `
                    <div class="flex justify-center items-center flex-wrap gap-3 bg-blue-100 p-4 rounded-lg">
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[1]?.c1 ? 'checked' : ''} onclick="handlerToggleField(1, 1)" class="w-4 h-4 m-3">
                            <input id="g-1-1" type="text" value="${STATES.stageKata.participants[1]?.g1 != 0 ? STATES.stageKata.participants[1]?.g1 : ''}" onchange="handlerSetGrade(1, 1)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J1" />
                        </div>
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[1]?.c2 ? 'checked' : ''} onclick="handlerToggleField(1, 2)" class="w-4 h-4 m-3">
                            <input id="g-1-2" type="text" value="${STATES.stageKata.participants[1]?.g2 != 0 ? STATES.stageKata.participants[1]?.g2 : ''}" onchange="handlerSetGrade(1, 2)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J2" />
                        </div>
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[1]?.c3 ? 'checked' : ''} onclick="handlerToggleField(1, 3)" class="w-4 h-4 m-3">
                            <input id="g-1-3" type="text" value="${STATES.stageKata.participants[1]?.g3 != 0 ? STATES.stageKata.participants[1]?.g3 : ''}" onchange="handlerSetGrade(1, 3)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J3" />
                        </div>
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[1]?.c4 ? 'checked' : ''} onclick="handlerToggleField(1, 4)" class="w-4 h-4 m-3">
                            <input id="g-1-4" type="text" value="${STATES.stageKata.participants[1]?.g4 != 0 ? STATES.stageKata.participants[1]?.g4 : ''}" onchange="handlerSetGrade(1, 4)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J4" />
                        </div>
                        <div class="flex bg-white shadowed rounded-md overflow-hidden">
                            <input type="checkbox" ${STATES.stageKata.participants[1]?.c5 ? 'checked' : ''} onclick="handlerToggleField(1, 5)" class="w-4 h-4 m-3">
                            <input id="g-1-5" type="text" value="${STATES.stageKata.participants[1]?.g5 != 0 ? STATES.stageKata.participants[1]?.g5 : ''}" onchange="handlerSetGrade(1, 5)" class="bg-[#f5f5f5] w-5em appearance-none border-none outline-none focus:ring-0 rounded-e-md text-gray-900 focus:border-none text-sm px-2" placeholder="J5" />
                        </div>
                    </div>
                ` : ''
            }
        </div>
    
        <div class="flex flex-col justify-center items-center bg-gray-300 p-4 rounded-lg">
            <div class="flex gap-4 mb-4">
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '-60s')">-60s</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '-30s')">-30s</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '-1s')">-1s</button>
                <div id="timer" class="text-6xl font-bold mx-4">${`0${Math.floor(STATES.stageKata.time/60)}`.slice(-2)}:${`0${Math.floor(STATES.stageKata.time%60)}`.slice(-2)}.${`0${parseFloat(STATES.stageKata.time%1).toFixed(2)}`.slice(-2)}</div>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '+1s')">+1s</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '+30s')">+30s</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '+60s')">+60s</button>
            </div>
            <div class="flex gap-4">
                <input id="time" type="number" class="text-gray-500 pl-3 bg-white border border-[.1px] border-[#dddddd] p-2 rounded min-w-[6em] shadow-md focus:outline-none" placeholder="Set Waktu (detik)">
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, 'set')">Set</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, 'reset')">Reset</button>
            </div>
            <button class="py-2 px-6 ${STATES.stageKata.play ? "bg-red-600 text-white" : "bg-green-600 text-white"} text-white rounded-lg ${STATES.stageKata.time > 0 ? STATES.stageKata.play ? "hover:bg-red-500" : "hover:bg-green-500" : 'opacity-50'} flex items-center mt-4" onclick="handlerMatchControl(0, 'play')">
                ${
                    STATES.stageKata.play ? "<i class='bx bx-stop text-5xl'></i>" : "<i class='bx bx-play text-5xl'></i>"
                }
            </button>
        </div>
    `

    document.getElementById("match-content").classList.remove("hidden");
}

const handlerRenderFormModal = () => {

    const modal = document.getElementById("modal");
    const category = document.getElementById("category");

    let participants = '';

    STATES.participants.forEach(participant => {

        if (participant?.category == category.value) {
            participants += `
                <option value="${participant?.id} | ${participant?.name}">${participant?.id} | ${participant?.name}</option>
            `;
        }
    });

    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg w-[30em]">
            <h2 class="text-[1.5em] font-bold text-gray mb-4">Buat Pertandingan Kata</h2>
            <select id="tatami" class="text-gray-500 bg-white border border-[.1px] border-[#dddddd] p-2 rounded shadow-md focus:outline-none w-full mb-3">
                <option value="" disabled selected>Pilih Tatami ...</option>
                <option value="TATAMI 1" >TATAMI 1</option>
                <option value="TATAMI 2" >TATAMI 2</option>
                <option value="TATAMI 3" >TATAMI 3</option>
                <option value="TATAMI 4" >TATAMI 4</option>
                <option value="TATAMI 5" >TATAMI 5</option>
                <option value="TATAMI 6" >TATAMI 6</option>
                <option value="TATAMI 7" >TATAMI 7</option>
                <option value="TATAMI 8" >TATAMI 8</option>
                <option value="TATAMI 9" >TATAMI 9</option>
                <option value="TATAMI 10" >TATAMI 10</option>
            </select>
            <input list="participant-1-list" id="participant-1" type="text" autocomplete="off" placeholder="Pilih Peserta Merah..." class="text-gray-500 bg-white border border-[.1px] border-[#dddddd] p-2 rounded shadow-md focus:outline-none w-full mb-3">
            <datalist id="participant-1-list">
                ${participants}
            </datalist>
            <input list="participant-2-list" id="participant-2" type="text" autocomplete="off" placeholder="Pilih Peserta Biru..." class="text-gray-500 bg-white border border-[.1px] border-[#dddddd] p-2 rounded shadow-md focus:outline-none w-full mb-3">
            <datalist id="participant-2-list">
                ${participants}
            </datalist>
            <div class="flex justify-end gap-2">
                <button class="bg-red-500 px-4 py-2 rounded shadow-md text-white" onclick="handlerCloseModal()">Batal</button>
                <button class="bg-green-500 px-4 py-2 rounded shadow-md text-white" onclick="handlerCloseModal(true)">Lanjut</button>
            </div>
        </div>
    `

    modal.classList.remove("hidden");
}

const handlerRenderPagination = () => {

    const pagination = document.getElementById("pagination");
    let rowsPerPage = parseInt(document.getElementById("perPage").value) || 5;
    pagination.innerHTML = "";
    const totalPages = Math.ceil(STATES.filteredMatches.length / rowsPerPage);
    
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            let button = document.createElement("button");
            button.innerText = i;
            button.classList = `border border-[.1px] border-[#dddddd] px-3 py-1 rounded shadow ${i === STATES.currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'}`;
            button.onclick = () => { STATES.currentPage = i; handlerRenderTable(); };
            pagination.appendChild(button);
        }
    }
}

const handlerRenderCategory = () => {

    const category = document.getElementById("category-container");
    let options = '';

    STATES.categories.forEach(d => {
        options += `<option value="${d}">${d}</option>`;
    })

    category.innerHTML = `
        <input value="${STATES.category}" list="categories" type="text" autocomplete="off" id="category" placeholder="Pilih Kategori..." class="text-gray-500 bg-white border border-[.1px] border-[#dddddd] p-2 rounded shadow-md focus:outline-none mr-4 min-w-75" onchange="handlerFilterTable('category')">
        <datalist id="categories">
            ${options}
        </datalist>
    `;
}

const handlerRenderTable = () => {

    if (STATES.stageKata != null) return

    let i = 0;
    let rowsPerPage = parseInt(document.getElementById("perPage").value) || 5;
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    if (STATES.currentPage > Math.ceil(STATES.filteredMatches.length / rowsPerPage)) {
        STATES.currentPage = Math.ceil(STATES.filteredMatches.length / rowsPerPage);
    }
    
    const start = (STATES.currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = STATES.filteredMatches.slice(start, end);
    
    pageData.forEach(row => {
        i = i+1
        const tr = `
            <tr class="bg-opacity-20 hover:bg-gray-200 transition duration-300 cursor-pointer" >
                <td class="pl-4 bg-white">
                    <p>${i}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col items-start justify-start">
                        <p>${row?.arena ? `(${row?.match_type}) ${row?.arena}` : "-"}</p>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col items-start justify-start">
                        <p>${row?.category || "-"}</p>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col items-start justify-start">
                        <div class="flex flex-col items-start justify-start"></div>
                            <p class="text-xs font-regular ${row.winner_id == row?.participants?.[0]?.id ? 'text-green-700' : ''}">${row.winner_id == row?.participants?.[0]?.id ? "🏆 " : ""}${row?.participants?.[0]?.name || "-"}</p>
                            <p class="text-[.8em] font-semibold">${row?.participants?.[0] ? `(${row?.participants?.[0]?.contingent})` : '-'}</p>
                        </div>
                        <p class="text-xs font-regular mt-2">${row?.participants?.[0]?.grade || "-"}</p>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col items-start justify-start">
                        <div class="flex flex-col items-start justify-start"></div>
                            <p class="text-xs font-regular ${row.winner_id == row?.participants?.[1]?.id ? 'text-green-700' : ''}">${row.winner_id == row?.participants?.[1]?.id ? "🏆 " : ""}${row?.participants?.[1]?.name || "-"}</p>
                            <p class="text-[.8em] font-semibold">${row?.participants?.[1] ? `(${row?.participants?.[1]?.contingent})` : '-'}</p>
                        </div>
                        <p class="text-xs font-regular mt-2">${row?.participants?.[1]?.grade || "-"}</p>
                    </div>
                </td>
                <td class="pl-4">
                    <svg class="w-4 fill-current text-red-500 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" onclick="handlerDeleteMatch(${row?.id})">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                </td>
            </tr>
        `;
        tableBody.innerHTML += tr;
    });

    if (STATES.filteredMatches.length == 0) {
        tableBody.innerHTML = `
            <tr class="bg-opacity-20 hover:bg-gray-200 transition duration-300 cursor-pointer" >
                <td class="pl-4" colspan="8">
                    <p class="text-center p-4">Tidak ada data pertandingan</p>
                </td>
            </tr>
        `;
    }

    handlerRenderCategory()
    handlerRenderPagination()
}

const handlerSortTable = (column) => {

    const order = STATES.sortOrder[column] === 'asc' ? 'desc' : 'asc';
    STATES.sortOrder[column] = order;
    STATES.filteredMatches.sort((a, b) => {
        if (order === 'asc') {
            return a[column] > b[column] ? 1 : -1;
        } else {
            return a[column] < b[column] ? 1 : -1;
        }
    });
    STATES.currentPage = 1;
    handlerRenderTable();
}

const handlerFilterTable = (type) => {

    if (type == 'category') {
        STATES.category = document.getElementById("category").value
        if (document.getElementById("category").value == '') {
            document.getElementById("creatematch").classList.add("hidden");
        } else {
            document.getElementById("creatematch").classList.remove("hidden");
        }
        STATES.filteredMatches = STATES.matches.filter(row => 
            row?.category == document.getElementById("category").value
        );
    } else {
        if (query == '') handlerFilterTable("category")
        else {
            const query = document.getElementById("search").value.toLowerCase();
            STATES.filteredMatches = STATES.matches.filter(row => 
                row?.arena.toLowerCase().includes(query) || 
                row?.participants?.some(m => m?.name?.toLowerCase().includes(query))
            );
        }
    }

    STATES.currentPage = 1;
    handlerRenderTable();
}

const handlerDeleteMatch = async (id) => {

    let conf = confirm("Apakah anda yakin ingin menghapus data pertandingan ini?")
    if (!conf) return

    fetch('/api/match/delete/' + id, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            handlerGetAllMatches()
        }
    })
}

// Services

const handlerOnload = async () => {

    const e = await localStorage.getItem("event")
    if (!e) {
        window.location.href = "/"
        return
    }
    STATES.event = JSON.parse(e)


    socket.on("update-grade", (data) => {
        if (data?.jury?.eventId == STATES.event?.id && STATES.stageKata != null && STATES.stageKata?.tatami?.split(' ')[1] == data?.jury?.arenaId) {
            document.getElementById(`g-${data?.participant}-${data?.jury?.juryId}`).value = data?.grade
            STATES.stageKata.id = Math.floor(Math.random() * 1000)
            STATES.stageKata.participants[data?.participant][`g${data?.jury?.juryId}`] = parseFloat(data?.grade).toFixed(1)
            localStorage.setItem("stage_kata", JSON.stringify(STATES.stageKata))
        }
    })

    const stageKata = await localStorage.getItem("stage_kata")
    const parsedStageKumite = JSON.parse(stageKata)

    if (stageKata && parsedStageKumite?.event_id == STATES.event?.id) {
        STATES.stageKata = JSON.parse(stageKata)
        document.getElementById("match-handler").classList.remove("hidden");
        document.getElementById("title").innerText = `${STATES.stageKata?.match_id} | ${STATES.stageKata?.tatami} | ${STATES.stageKata?.category?.toUpperCase()}`
        handlerRenderMatch()
    }  else {
        document.getElementById("match-handler").classList.add("hidden");
        document.getElementById("main-content").classList.remove("hidden");
        document.getElementById("title").innerText = `KATA | EVENT ${STATES.event?.name?.toUpperCase()}`
    }
    
    await handlerGetAllParticipants()
    await handlerGetAllMatches()
}

const handlerOnUnload = () => {

    clearInterval(timeId)
    if (STATES.stageKata != null) {
        STATES.stageKata.play = false
        localStorage.setItem("stage_kata", JSON.stringify(STATES.stageKata))
    }
}

const handlerOnKeydown = (e) => {

    if (e.keyCode == 32 && STATES.stageKata != null) {
        e.preventDefault()
        handlerMatchControl(null, 'play')
    }
}

window.addEventListener("load", handlerOnload)
window.addEventListener("unload", handlerOnUnload)
window.addEventListener("keydown", handlerOnKeydown)