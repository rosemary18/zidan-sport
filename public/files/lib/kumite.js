const STATES = {
    event: {},
    categories: [],
    matches: [],
    filteredMatches: [],
    participants: [],
    sortOrder: [true, true],
    category: '',
    currentPage: 1,
    stageKumite: null
}

let timeId = null

// Handlers

const handlerGetAllParticipants = async () => {

    const res = await fetch(`/api/participant/event/${STATES.event.id}`)
    const data = await res?.json()

    if (data?.statusCode == 200) {
        STATES.participants = data.data.participants
        STATES.categories = [...new Set(data?.data?.participants?.filter(d => d?.category?.includes("KUMITE")).map(d => d?.category))];
    }
}

const handlerGetAllMatches = async () => {

    const res = await fetch(`/api/match/${STATES.event.id}/${encodeURIComponent(STATES.category)}`)
    const data = await res?.json()

    if (data?.statusCode == 200) {
        const filtered = data.data?.filter(d => d?.match_type == "KUMITE")
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
        if (category.value == '' || participant1.value == '' || participant2.value == '' || tatami.value == '') {
            alert('Data belum lengkap!');
            return
        }
    }
    
    modal.innerHTML = "";
    modal.classList.add("hidden");

    if (add) {
        const stageKumite = {
            id: Math.floor(Math.random() * 1000000),
            match_id: Math.random().toString(36).substring(2, 6).toUpperCase(),
            event_id: STATES.event.id,
            category: category.value,
            participants: [
                {
                    ...STATES.participants.find(participant => participant?.id == participant1.value?.split('|')[0]),
                    senshuu: false,
                    c1: false,
                    c2: false,
                    c3: false,
                    hc: false,
                    h: false,
                    point: 0,
                },
                {
                    ...STATES.participants.find(participant => participant?.id == participant2.value?.split('|')[0]),
                    senshuu: false,
                    c1: false,
                    c2: false,
                    c3: false,
                    hc: false,
                    h: false,
                    point: 0
                }
            ],
            tatami: tatami.value,
            time: 0,
            play: false,
            rest: false
        }

        localStorage.setItem("stage_kumite", JSON.stringify(stageKumite))
        STATES.stageKumite = stageKumite
        document.getElementById("match-handler").classList.remove("hidden");
        document.getElementById("title").innerText = `${stageKumite?.match_id} | ${stageKumite?.tatami} | ${stageKumite?.category?.toUpperCase()}`
        document.getElementById("main-content").classList.add("hidden");
        document.getElementById("match-content").classList.remove("hidden");
        handlerRenderMatch()
    }

}

const handlerDeleteStageMatch = () => {
    
    let conf = confirm("Apakah anda yakin untuk tidak menyimpan pertandingan ini?")

    if (conf) {
        localStorage.removeItem("stage_kumite")
        STATES.stageKumite = null
        document.getElementById("match-handler").classList.add("hidden");
        document.getElementById("title").innerText = `KUMITE | EVENT ${STATES.event?.name?.toUpperCase()}`
        document.getElementById("main-content").classList.remove("hidden");
        document.getElementById("match-content").classList.add("hidden");
        handlerRenderTable()
    }
}

const handlerMatchControl = (i, type) => {

    if (type == 'c1') {
        STATES.stageKumite.participants[i].c1 = !STATES.stageKumite?.participants[i]?.c1
        if (STATES.stageKumite.participants[i].c1) localStorage.setItem("confetti_kumite", `c1-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == 'c2') {
        STATES.stageKumite.participants[i].c2 = !STATES.stageKumite?.participants[i]?.c2
        if (STATES.stageKumite.participants[i].c2) localStorage.setItem("confetti_kumite", `c2-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == 'c3') {
        STATES.stageKumite.participants[i].c3 = !STATES.stageKumite?.participants[i]?.c3
        if (STATES.stageKumite.participants[i].c3) localStorage.setItem("confetti_kumite", `c3-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == 'hc') {
        STATES.stageKumite.participants[i].c1 = true
        STATES.stageKumite.participants[i].c2 = true
        STATES.stageKumite.participants[i].c3 = true
        STATES.stageKumite.participants[i].hc = !STATES.stageKumite?.participants[i]?.hc
        if (STATES.stageKumite.participants[i].hc) localStorage.setItem("confetti_kumite", `hc-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == 'h') {
        STATES.stageKumite.participants[i].h = !STATES.stageKumite?.participants[i]?.h
        if (STATES.stageKumite.participants[i].h) localStorage.setItem("confetti_kumite", `h-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == 'senshuu') {
        STATES.stageKumite.participants[i].senshuu = !STATES.stageKumite?.participants[i]?.senshuu
        if (STATES.stageKumite.participants[i].senshuu) localStorage.setItem("confetti_kumite", `senshuu-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }

    if (type == 'yuko') {
        STATES.stageKumite.participants[i].point = STATES.stageKumite?.participants[i]?.point + 1
        localStorage.setItem("confetti_kumite", `yuko-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == 'wazari') {
        STATES.stageKumite.participants[i].point = STATES.stageKumite?.participants[i]?.point + 2
        localStorage.setItem("confetti_kumite", `wazari-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == 'ippon') {
        STATES.stageKumite.participants[i].point = STATES.stageKumite?.participants[i]?.point + 3
        localStorage.setItem("confetti_kumite", `ippon-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == '-1') {
        STATES.stageKumite.participants[i].point = Math.max(STATES.stageKumite?.participants[i]?.point - 1, 0)
        localStorage.setItem("confetti_kumite", `min-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }

    if (type == 'play' && STATES.stageKumite.time != 0) {
        STATES.stageKumite.play = !STATES.stageKumite?.play

        if (STATES.stageKumite.play) {
            timeId = setInterval(() => {
                STATES.stageKumite.time = Math.max(STATES.stageKumite.time - .01, 0)
                document.getElementById("timer").textContent = `${`0${Math.floor(STATES.stageKumite.time/60)}`.slice(-2)}:${`0${Math.floor(STATES.stageKumite.time%60)}`.slice(-2)}.${`0${parseFloat(STATES.stageKumite.time%1).toFixed(2)}`.slice(-2)}`
                if (STATES.stageKumite.time == 0) STATES.stageKumite.play = false
                STATES.stageKumite.id = Math.floor(Math.random() * 1000000)
                STATES.stageKumite.rest = false
                localStorage.setItem("stage_kumite", JSON.stringify(STATES.stageKumite))
                if (STATES.stageKumite.time == 0) {
                    clearInterval(timeId)
                    timeId = null
                    handlerRenderMatch()
                }
            }, 10);
        } else {
            clearInterval(timeId)
            timeId = null
        }

        STATES.stageKumite.rest = false
    } else {
        STATES.stageKumite.rest = true
    }

    if (type == 'set') {
        STATES.stageKumite.time = document.getElementById("time").value
        document.getElementById("time").value = 0
    }
    if (type == '-1s') STATES.stageKumite.time = Math.max(STATES.stageKumite.time - 1, 0)
    if (type == '-30s') STATES.stageKumite.time = Math.max(STATES.stageKumite.time - 30, 0)
    if (type == '-60s') STATES.stageKumite.time = Math.max(STATES.stageKumite.time - 60, 0)
    if (type == '+1s') STATES.stageKumite.time = STATES.stageKumite.time + 1
    if (type == '+30s') STATES.stageKumite.time = STATES.stageKumite.time + 30
    if (type == '+60s') STATES.stageKumite.time = STATES.stageKumite.time + 60
    if (type == 'reset') {
        STATES.stageKumite.time = 0
        STATES.stageKumite.play = false
        clearInterval(timeId)
        timeId = null
    }
    
    STATES.stageKumite.id = Math.floor(Math.random() * 1000000)
    localStorage.setItem("stage_kumite", JSON.stringify(STATES.stageKumite))
    
    handlerRenderMatch()
}

const handlerCheckWinner = () => {

    let winner

    // Check winner via penalty
    if (STATES.stageKumite.participants[0].h) winner = STATES.stageKumite.participants[1].id
    else if (STATES.stageKumite.participants[1].h) winner = STATES.stageKumite.participants[0].id

    // Check winner via point seri shensu
    else if ((STATES.stageKumite.participants[0].point == STATES.stageKumite.participants[1].point) && STATES.stageKumite.participants[0].senshuu) winner = STATES.stageKumite.participants[0].id
    else if ((STATES.stageKumite.participants[0].point == STATES.stageKumite.participants[1].point) && !STATES.stageKumite.participants[1].senshuu) winner = STATES.stageKumite.participants[1].id

    // Check winner via point 8
    else if ((STATES.stageKumite.participants[0].point - STATES.stageKumite.participants[1].point) >= 8) winner = STATES.stageKumite.participants[0].id
    else if ((STATES.stageKumite.participants[1].point - STATES.stageKumite.participants[0].point) >= 8) winner = STATES.stageKumite.participants[1].id

    // Check winner via greater point
    else if (STATES.stageKumite.participants[0].point > STATES.stageKumite.participants[1].point) winner = STATES.stageKumite.participants[0].id
    else if (STATES.stageKumite.participants[1].point > STATES.stageKumite.participants[0].point) winner = STATES.stageKumite.participants[1].id

    return winner
}

const handlerSaveMatch = () => {

    if (!document.getElementById("w-1").checked && !document.getElementById("w-2").checked) {
        let conf = confirm("Pemenang belum ditentukan, apakah kamu ingin pemenang di tentukan oleh system ?")
        if (!conf) return
    }

    let con = confirm("Apakah anda yakin untuk menyimpan pertandingan ini?")
    if (!con) return

    let winner = document.getElementById("w-1").checked ? STATES.stageKumite.participants[0].id : document.getElementById("w-2").checked ? STATES.stageKumite.participants[1].id : handlerCheckWinner()
    let grade1 = ''
    let grade2 = ''

    if (STATES.stageKumite.participants[0].c1) grade1 = 'C1'
    if (STATES.stageKumite.participants[0].c2) grade1 += grade1?.length > 0 ? ', C2' : 'C2'
    if (STATES.stageKumite.participants[0].c3) grade1 += grade1?.length > 0 ? ', C3' : 'C3'
    if (STATES.stageKumite.participants[0].hc) grade1 += grade1?.length > 0 ? ', HC' : 'HC'
    if (STATES.stageKumite.participants[0].h) grade1 += grade1?.length > 0 ? ', H' : 'H'
    if (STATES.stageKumite.participants[0].senshuu) grade1 += grade1?.length > 0 ? ', Senshu' : 'Senshu'
    grade1 += grade1?.length > 0 ? `, Poin ${STATES.stageKumite.participants[0].point}` : `Poin ${STATES.stageKumite.participants[0].point}`

    if (STATES.stageKumite.participants[1].c1) grade2 = 'C1'
    if (STATES.stageKumite.participants[1].c2) grade2 += grade2?.length > 0 ? ', C2' : 'C2'
    if (STATES.stageKumite.participants[1].c3) grade2 += grade2?.length > 0 ? ', C3' : 'C3'
    if (STATES.stageKumite.participants[1].hc) grade2 += grade2?.length > 0 ? ', HC' : 'HC'
    if (STATES.stageKumite.participants[1].h) grade2 += grade2?.length > 0 ? ', H' : 'H'
    if (STATES.stageKumite.participants[1].senshuu) grade2 += grade2?.length > 0 ? ', Senshu' : 'Senshu'
    grade2 += grade2?.length > 0 ? `, Poin ${STATES.stageKumite.participants[1].point}` : `Poin ${STATES.stageKumite.participants[1].point}`

    const data = {
        event_id: STATES.event.id,
        category: STATES.stageKumite.category,
        match_type: "KUMITE",
        winner_id: winner,
        arena: STATES.stageKumite.tatami,
        time: "",
        participants: [
            {
                id: STATES.stageKumite.participants[0].id,
                grade: grade1
            },
            {
                id: STATES.stageKumite.participants[1].id,
                grade: grade2
            }
        ]
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
            STATES.stageKumite = null
            localStorage.removeItem("stage_kumite")
            localStorage.removeItem("confetti_kumite")
            window.location.reload()
        }
    })
}

const handlerToggleCheckbox = (n) => {

    if (n == 1) document.getElementById('w-2').checked = false
    if (n == 2) document.getElementById('w-1').checked = false

    if (document.getElementById(`w-1`).checked || document.getElementById(`w-2`).checked) localStorage.setItem("confetti_kumite", `win-${n == 1 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
}

// Renders

const handlerRenderMatch = () => {

    document.getElementById("match-content").innerHTML = `
        <div class="flex text-white">
            <div class="flex flex-1 flex-col justify-center items-center p-10 min-h-[30em] bg-blue-600 mr-3 rounded-md relative">
                <div class="absolute bottom-4 right-4 flex items-center justify-center">
                    <span class="text-xl">🏆</span>
                    <input id="w-2" type="checkbox" onclick="handlerToggleCheckbox(2)" class="w-5 h-5 ml-2 shadowed">
                </div>
                <h1 class="text-4xl font-bold line-clamp-1">${STATES.stageKumite?.participants[1]?.name}</h1>
                <h2 class="text-2xl font-bold">(${STATES.stageKumite?.participants[1]?.contingent})</h2>
                <h1 class="text-[10em] font-extrabold mt-2">${STATES.stageKumite?.participants[1]?.point}</h1>
            </div>
            <div class="flex flex-1 flex-col justify-center items-center p-10 min-h-[30em] bg-red-600 ml-3 rounded-md relative">
                <div class="absolute bottom-4 left-4 flex items-center justify-center">
                    <input id="w-1" type="checkbox" onclick="handlerToggleCheckbox(1)" class="w-5 h-5 mr-2 shadowed">
                    <span class="text-xl">🏆</span>
                </div>
                <h1 class="text-4xl font-bold line-clamp-1">${STATES.stageKumite?.participants[0]?.name}</h1>
                <h2 class="text-2xl font-bold">(${STATES.stageKumite?.participants[0]?.contingent})</h2>
                <h1 class="text-[10em] font-extrabold mt-2">${STATES.stageKumite?.participants[0]?.point}</h1>
            </div>
        </div>
    
        <div class="grid grid-cols-2 gap-6 my-6">
            <div class="flex flex-col justify-center gap-2 bg-blue-100 p-4 rounded-lg">
                <div class="flex flex-wrap justify-center gap-2 p-2 rounded-lg">
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[1].c1 ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(1, 'c1')">C1</button>
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[1].c2 ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(1, 'c2')">C2</button>
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[1].c3 ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(1, 'c3')">C3</button>
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[1].hc ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(1, 'hc')">HC</button>
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[1].h ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(1, 'h')">H</button>
                    ${ STATES.stageKumite.participants[0].senshuu ? '' : `<button class="py-2 px-4 ${STATES.stageKumite.participants[1].senshuu ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(1, 'senshuu')">Senshu</button>` }
                </div>
                <div class="flex flex-wrap justify-center gap-2 p-2 rounded-lg">
                    <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(1, 'yuko')">YUKO (1P)</button>
                    <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(1, 'wazari')">WAZARI (2P)</button>
                    <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(1, 'ippon')">IPPON (3P)</button>
                    <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(1, '-1')">Kurangi (-1)</button>
                </div>
            </div>
            <div class="flex flex-col justify-center gap-3 bg-red-100 p-4 rounded-lg">
                <div class="flex flex-wrap justify-center gap-2 p-2 rounded-lg">
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[0].c1 ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(0, 'c1')">C1</button>
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[0].c2 ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(0, 'c2')">C2</button>
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[0].c3 ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(0, 'c3')">C3</button>
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[0].hc ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(0, 'hc')">HC</button>
                    <button class="py-2 px-4 ${STATES.stageKumite.participants[0].h ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(0, 'h')">H</button>
                    ${ STATES.stageKumite.participants[1].senshuu ? '' : `<button class="py-2 px-4 ${STATES.stageKumite.participants[0].senshuu ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800' : 'bg-gray-600 hover:bg-gray-500 text-white'} rounded-lg" onclick="handlerMatchControl(0, 'senshuu')">Senshu</button>`}
                </div>
                <div class="flex flex-wrap justify-center gap-2 p-2 rounded-lg">
                    <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(0, 'yuko')">YUKO (1P)</button>
                    <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(0, 'wazari')">WAZARI (2P)</button>
                    <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(0, 'ippon')">IPPON (3P)</button>
                    <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(0, '-1')">Kurangi (-1)</button>
                </div>
            </div>
        </div>
    
        <div class="flex flex-col justify-center items-center bg-gray-300 p-4 rounded-lg">
            <div class="flex gap-4 mb-4">
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '-60s')">-60s</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '-30s')">-30s</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '-1s')">-1s</button>
                <div id="timer" class="text-6xl font-bold mx-4">${`0${Math.floor(STATES.stageKumite.time/60)}`.slice(-2)}:${`0${Math.floor(STATES.stageKumite.time%60)}`.slice(-2)}.${`0${parseFloat(STATES.stageKumite.time%1).toFixed(2)}`.slice(-2)}</div>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '+1s')">+1s</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '+30s')">+30s</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, '+60s')">+60s</button>
            </div>
            <div class="flex gap-4">
                <input id="time" type="number" class="text-gray-500 pl-3 bg-white border border-[.1px] border-[#dddddd] p-2 rounded min-w-[6em] shadow-md focus:outline-none" placeholder="Set Waktu (detik)">
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, 'set')">Set</button>
                <button class="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500" onclick="handlerMatchControl(0, 'reset')">Reset</button>
            </div>
            <button class="py-2 px-6 ${STATES.stageKumite.play ? "bg-red-600 text-white" : "bg-green-600 text-white"} text-white rounded-lg ${STATES.stageKumite.time > 0 ? STATES.stageKumite.play ? "hover:bg-red-500" : "hover:bg-green-500" : 'opacity-50'} flex items-center mt-4" onclick="handlerMatchControl(0, 'play')">
                ${
                    STATES.stageKumite.play ? "<i class='bx bx-stop text-5xl'></i>" : "<i class='bx bx-play text-5xl'></i>"
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
            <h2 class="text-[1.5em] font-bold text-gray mb-4">Buat Pertandingan Kumite</h2>
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

    if (STATES.stageKumite != null) return

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
                            <p class="text-[.8em] font-semibold">(${row?.participants?.[0]?.contingent || "-"})</p>
                        </div>
                        <p class="text-xs font-regular mt-2">${row?.participants?.[0]?.grade || "-"}</p>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col items-start justify-start">
                        <div class="flex flex-col items-start justify-start"></div>
                            <p class="text-xs font-regular ${row.winner_id == row?.participants?.[1]?.id ? 'text-green-700' : ''}">${row.winner_id == row?.participants?.[1]?.id ? "🏆 " : ""}${row?.participants?.[1]?.name || "-"}</p>
                            <p class="text-[.8em] font-semibold">(${row?.participants?.[1]?.contingent || "-"})</p>
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
        const query = document.getElementById("search").value.toLowerCase();
        if (query == '') handlerFilterTable("category")
        else {
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
    const stageKumite = await localStorage.getItem("stage_kumite")
    const parsedStageKumite = JSON.parse(stageKumite)

    if (stageKumite && parsedStageKumite?.event_id == STATES.event?.id) {
        STATES.stageKumite = JSON.parse(stageKumite)
        document.getElementById("match-handler").classList.remove("hidden");
        document.getElementById("title").innerText = `${STATES.stageKumite?.match_id} | ${STATES.stageKumite?.tatami} | ${STATES.stageKumite?.category?.toUpperCase()}`
        handlerRenderMatch()
    }  else {
        document.getElementById("match-handler").classList.add("hidden");
        document.getElementById("main-content").classList.remove("hidden");
        document.getElementById("title").innerText = `KUMITE | EVENT ${STATES.event?.name?.toUpperCase()}`
    }
    
    
    await handlerGetAllParticipants()
    await handlerGetAllMatches()
}

const handlerOnUnload = () => {

    clearInterval(timeId)
    if (STATES.stageKumite != null) {
        STATES.stageKumite.play = false
        localStorage.setItem("stage_kumite", JSON.stringify(STATES.stageKumite))
    }
}

const handlerOnKeydown = (e) => {

    if (e.keyCode == 32 && STATES.stageKumite != null) {
        e.preventDefault()
        handlerMatchControl(null, 'play')
    }
}

window.addEventListener("load", handlerOnload)
window.addEventListener("unload", handlerOnUnload)
window.addEventListener("keydown", handlerOnKeydown)