const STATES = {
    event: {},
    category: null,
    bracket_id: null,
    brackets: [],
    matches: [],
    winners: [],
    participants: []
}
let draggedItem = null

// Handlers

const handlerGetParticipant = async () => {
    
    let link = `/api/participant/category/${STATES.event.id}/${encodeURIComponent(STATES.category)}`

    await fetch(link, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            STATES.participants = res.data
        }
    })
}

const handlerGetBracket = async () => {

    const res = await fetch(`/api/bracket/${STATES.event.id}/${encodeURIComponent(STATES.category)}`)
    const data = await res?.json()

    if (data?.statusCode == 200 && data.data) {
        STATES.bracket_id = data.data?.id || null
        STATES.brackets = JSON.parse(data.data?.bracket || "[]")
        STATES.winners = JSON.parse(data.data?.rangking || "[]")
        console.log(data.data)
    }
}

const handlerCreateBracket = () => {

    fetch('/api/bracket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_id: STATES.event.id,
            category: STATES.category,
            bracket: JSON.stringify(STATES.brackets)
        })
    }).then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            renderBracket()
        }
    })
}

const handlerUpdateBracket = async () => {
    
    if (STATES.bracket_id) {
        await fetch(`/api/bracket/${STATES.bracket_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bracket: JSON.stringify(STATES.brackets),
                rangking: JSON.stringify(STATES.winners)
            })
        })
    }
}

const handlerReshuffleBrackets = () => {
    STATES.brackets = generateBracket(STATES.participants)
    handlerUpdateBracket()
    renderBracket()
}

const shuffleArray = (array) => {

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

const chunkArrayWithNull = (arr, size) => {

    return arr.reduce((acc, _, i) => {
        if (i % size === 0) {
        acc.push(arr.slice(i, i + size));
        }
        return acc;
    }, []);
}

const handlerCheckBye = (brackets) => {
    
    for (let i = 0; i < brackets.length; i++) {
        for (let j = 0; j < brackets[i].length; j++) {
            for (let k = 0; k < brackets[i][j].length; k++) {
                if (brackets[i][j][k]?.participant?.includes(null)) {
                    let coordinates = brackets[i][j][k].coordinate.split("-");
                    brackets[coordinates[0]][coordinates[1]][coordinates[2]].participant[1] = brackets[i][j][k]?.participant[0] || brackets[i][j][k]?.participant[1]
                }
            }
        }
    }

    return brackets
}

const generateBracket = (participants) => {

    const totalParticipants = participants.length;
    const shuffledParticipants = shuffleArray(participants);
    const rounds = Math.ceil(Math.log2(totalParticipants));
    const bracket = [];
    
    const half = Math.ceil(totalParticipants / 2);
    const groupA = chunkArrayWithNull(shuffledParticipants.slice(0, half), 2);
    const groupB = chunkArrayWithNull(shuffledParticipants.slice(half), 2);
    
    for (let r = 0; r < rounds; r++) {
        const round = []
        if (r == 0) {
            const a = [];
            const b = [];
            for (let i = 0; i < groupA.length; i++) {
                let col = ((i == 0) && (groupA.length%2 == 1)) ? Math.ceil(groupA?.length/2) : 1;
                let match = (groupA.length%2 == 0) ? Math.floor(i/2) : Math.ceil(i/2)
                let data = {
                    participant: groupA[i],
                    coordinate: `${col}-0-${match}`
                }
                a.push(data);
            }
            for (let i = 0; i < groupB.length; i++) {
                let col = ((i == 0) && (groupB.length%2 == 1) && groupB?.length != 1) ? Math.ceil(groupB?.length/2) : 1 + ((groupB?.length == 1 && Math.floor(groupA?.length/2) == 1) ? 1 : 0);
                let match = (groupB.length%2 == 0) ? Math.floor(i/2) : Math.ceil(i/2)
                let data = {
                    participant: groupB[i],
                    coordinate: `${col}-${groupB.length == 1 ? 0 : 1}-${match}`
                }
                b.push(data);
            }
            round.push(a)
            round.push(b)
        } else {
            if (r+1 == rounds) {
                round.push([
                    {
                        participant: [{}, {}],
                        coordinate: ''
                    }
                ])
            } else {
                const lastBracket = bracket[r-1]
                const a = []
                const b = []
                let currentRoundALength = Math.ceil(lastBracket[0]?.length/2)
                let currentRoundBLength = Math.ceil(lastBracket[1]?.length/2)
                if (lastBracket[0]?.length > 1) {
                    for (let j = 0; j < currentRoundALength; j++) {
                        if ((j == 0 && ((lastBracket[0]?.length%2) == 1))) {
                            a.push({})
                        } else {
                            let col = ((j == 0) && (currentRoundALength%2 == 1) && currentRoundALength != 1) ? Math.ceil(currentRoundALength/2) : (r+1) + (currentRoundBLength == 0 ? 1 : 0);
                            let match = (currentRoundALength%2 == 0) ? Math.floor(j/2) : Math.ceil(j/2)
                            a.push({
                                participant: [{}, {}],
                                coordinate: `${col}-0-${match}`
                            })
                        }
                    }
                }
                if (lastBracket[1]?.length > 1) {
                    for (let j = 0; j < Math.ceil(lastBracket[1]?.length/2); j++) {
                        if ((j == 0 && ((lastBracket[1]?.length%2) == 1))) {
                            b.push({})
                        } else {
                            let col = ((j == 0) && (currentRoundBLength%2 == 1) && currentRoundBLength != 1) ? Math.ceil(currentRoundBLength/2) : (r+1) + (currentRoundALength == 0 ? 1 : 0);
                            let match = (currentRoundBLength%2 == 0) ? Math.floor(j/2) : Math.ceil(j/2)
                            b.push({
                                participant: [{}, {}],
                                coordinate: `${col}-${currentRoundBLength == 1 ? 0 : 1}-${match}`
                            })
                        }
                    }
                }
                
                round.push(a)
                round.push(b)
            }
        }

        bracket.push(round)
    }
    
    return handlerCheckBye(bracket);
}

const drawCircle = (ctx, centerX, centerY, radius) => {
    
    // Gambar lingkaran
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

const drawConnectors = () => {

    const canvas = document.getElementById("bracket-connectors");
    const ctx = canvas.getContext("2d");

    // Atur ukuran canvas sesuai tampilan
    const content = document.getElementById("content");
    canvas.width = content.offsetWidth;
    canvas.height = content.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    function drawLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#323232";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    STATES.brackets?.forEach((item, i) => {
        item?.forEach((it, j) => {
            it?.forEach((d, k) => {

                const bracket = document.getElementById(`${i}-${j}-${k}`)
                const nextBracket = document.getElementById(`${d.coordinate}`)

                if (!nextBracket) return

                const rect1 = bracket.getBoundingClientRect();
                const rect2 = nextBracket.getBoundingClientRect();

                const midX1 = rect1.right;
                const midY1 = rect1.top + rect1.height / 2;
                const midX2 = rect2.left;
                const midY2 = rect2.top + rect2.height / 2;
                const between = midX1 + ((midX2 - midX1) - (1.5 * 16)) ;

                drawCircle(ctx, midX1+10, midY1, 3);

                drawLine(midX1 + 15, midY1, between, midY1);
                drawLine(between, midY1, between, midY2);
                drawLine(between, midY2, midX2 - 15, midY2);

                drawCircle(ctx, midX2-10, midY2, 3);
            })
        })
    })

    // Hubungkan final ke pemenang
    const winner = document.getElementById("winner");
    if (winner) {
        const winnerRect = winner.getBoundingClientRect();
        const lastBracket = document.getElementById(`${STATES.brackets.length - 1}-0-0`);
        
        if (lastBracket) {

            const lastRect = lastBracket.getBoundingClientRect();

            const midXLast = lastRect.right;
            const midYLast = lastRect.top + lastRect.height / 2;
            const midXWinner = winnerRect.left;
            const midYWinner = winnerRect.top + winnerRect.height / 2;

            drawCircle(ctx, midXLast+10, midYLast, 3);
            drawLine(midXLast + 15, midYLast, midXWinner + 15, midYWinner);
            drawCircle(ctx, midXWinner+20, midYWinner, 3);
        }
    }
};

const handlerDragStart = (event) => {
    draggedItem = event.target
}

const handlerDragEnd = (event) => {
    draggedItem = null
}

const handlerDrop = (event) => {

    event.preventDefault();

    if (draggedItem && (draggedItem.id != event.currentTarget.id)) {

        targetIndexes = event.currentTarget.id.split("-")
        indexes = draggedItem.id.split("-")
        data = STATES.brackets[indexes[0]][indexes[1]][indexes[2]].participant[indexes[3]]

        if (data == null || (indexes?.[0] > targetIndexes?.[0])) return
        
        if (indexes?.[0] == targetIndexes?.[0]) {
            
            // Swap data
            let temp = STATES.brackets[targetIndexes[0]][targetIndexes[1]][targetIndexes[2]].participant[targetIndexes[3]]
            STATES.brackets[targetIndexes[0]][targetIndexes[1]][targetIndexes[2]].participant[targetIndexes[3]] = STATES.brackets[indexes[0]][indexes[1]][indexes[2]].participant[indexes[3]]
            STATES.brackets[indexes[0]][indexes[1]][indexes[2]].participant[indexes[3]] = temp
        } else if (indexes?.[0] < targetIndexes?.[0]) {

            // Copy data
            STATES.brackets[targetIndexes[0]][targetIndexes[1]][targetIndexes[2]].participant[targetIndexes[3]] = STATES.brackets[indexes[0]][indexes[1]][indexes[2]].participant[indexes[3]]
        }

        renderBracket()
        handlerUpdateBracket()
    }
}

const handlerDropWinner = (event) => {

    event.preventDefault();

    let indexes = draggedItem.id.split("-")
    let data = STATES.brackets[indexes[0]][indexes[1]][indexes[2]].participant[indexes[3]]

    STATES.winners[0] = data
    renderBracket()
    handlerUpdateBracket()
}

const handlerClearWinner = (event) => {

    event.preventDefault();

    STATES.winners[0] = undefined
    renderBracket()
    handlerUpdateBracket()
}

const handlerAllowDrop = (event) => {
    event.preventDefault();
}

const handlerClear = (event) => {

    event.preventDefault();

    const indexes = event.currentTarget.id.split("-")

    if (indexes?.[0] > 0) {
        STATES.brackets[indexes[0]][indexes[1]][indexes[2]].participant[indexes[3]] = {}
        renderBracket()
        handlerUpdateBracket()
    }
}

// Renders

const renderBracket = () => {

    const content = document.getElementById("content")

    let row1 = ""
    let row2 = ""
    let lastRoundIndex = STATES.brackets.length-1
    let lastRoundData = STATES.brackets[lastRoundIndex][0][0].participant

    if (STATES.brackets.length > 1) {
        row1 += `<div class="flex p-2">`
        for (let i = 0; i < STATES.brackets.length; i++) {
            if (i+1 != STATES.brackets.length) {
                for (let j = 0; j < STATES.brackets[i].length; j++) {
                    if (j == 0) {
                        row1 += `<div class="flex flex-col justify-center">`
                        const matches = STATES.brackets[i][j]
                        if (matches?.length > 0) {
                            for (let k = 0; k < matches.length; k++) {
                                row1 += `<div class="flex flex-col ${i > 0 ? 'flex-[.6] justify-center' : ''}">`
                                if (matches[k] == null || Object.keys(matches[k]).length == 0) {
                                    row1 += `
                                        <div class="w-64 my-1 mx-[1.5em] overflow-hidden opacity-0">
                                            <div class="flex">
                                                <div class="flex flex-col flex-1 p-2">
                                                    <span class="text-left line-clamp-2">-</span>
                                                    <span class="text-left text-xs font-bold">-</span>
                                                </div>
                                            </div>
                                        </div>
                                    `
                                } else {
                                    const groups = matches[k]?.participant || []
                                    row1 += `<div id='${i}-${j}-${k}' class="w-64 text-white my-1 mx-[1.5em] overflow-hidden rounded-md ">`
                                    for (let l = 0; l < groups?.length; l++) {
                                        const participant = groups[l]
                                        if (participant == null || Object.keys(participant).length == 0) {
                                            row1 += `
                                                <div id="${i}-${j}-${k}-${l}" class="flex bg-gradient-to-r from-[${ l == 0 ? '#eb3434' : '#3437eb'}] to-gray-600 ${l == 0 ? 'mb-[.18em]' : ''}" allowdrop="true" ondrop="handlerDrop(event)" ondragover="handlerAllowDrop(event)">
                                                    <div class="flex flex-col flex-1 p-2">
                                                        <span id="name-${i}-${j}-${k}-${l}" class="text-left line-clamp-2">${participant == null ? 'BYE' : '-'}</span>
                                                        <span id="contingent-${i}-${j}-${k}-${l}" class="text-left text-xs font-bold">-</span>
                                                    </div>
                                                    ${
                                                        l == 0 ? '<div class="w-[.5em] bg-[#eb3434]"></div>'
                                                        : '<div class="w-[.5em] bg-[#3437eb]"></div>'
                                                    }
                                                </div>
                                            `
                                        } else {
                                            row1 += `
                                                <div id="${i}-${j}-${k}-${l}" class="flex bg-gradient-to-r from-[${ l == 0 ? '#eb3434' : '#3437eb'}] to-gray-600 ${l == 0 ? 'mb-[.18em]' : ''} hover:cursor-pointer hover:bg-gray-600" draggable="true" allowdrop="true" ondragover="handlerAllowDrop(event)" ondragstart="handlerDragStart(event)" ondragend="handlerDragEnd(event)" ondrop="handlerDrop(event)" ondblclick="handlerClear(event)">
                                                    <div class="flex flex-col flex-1 p-2">
                                                        <span id="name-${i}-${j}-${k}-${l}" class="text-left line-clamp-2">${participant.name}</span>
                                                        <span id="contingent-${i}-${j}-${k}-${l}" class="text-left text-xs font-bold">(${participant.contingent?.toUpperCase()})</span>
                                                    </div>
                                                    ${
                                                        l == 0 ? '<div class="w-[.5em] bg-[#eb3434]"></div>'
                                                        : '<div class="w-[.5em] bg-[#3437eb]"></div>'
                                                    }
                                                </div>
                                            `
                                        }
                                    }
                                    row1 += `</div>`
                                }
                                row1 += `</div>`
                            }
                        } else {
                            row1 += `<div class="w-64 my-4"></div>`
                        }
                        row1 += `</div>`
                    }
                }                
            }
        }
        row1 += `</div>`
    }

    if (STATES.brackets.length > 1) {
        row2 += `<div class="flex p-2">`
        for (let i = 0; i < STATES.brackets.length; i++) {
            if (i+1 != STATES.brackets.length) {
                for (let j = 0; j < STATES.brackets[i].length; j++) {
                    if (j == 1) {
                        row2 += `<div class="flex flex-col justify-center">`
                        const matches = STATES.brackets[i][j]
                        if (matches?.length > 0) {
                            for (let k = 0; k < matches.length; k++) {
                                row2 += `<div class="flex flex-col ${i > 0 ? 'flex-[.6] justify-center' : ''}">`
                                if (matches[k] == null || Object.keys(matches[k]).length == 0) {
                                    row2 += `
                                        <div class="w-64 text-white my-1 mx-[1.5em] overflow-hidden rounded-md hidden">
                                            <div class="flex">
                                                <div class="flex flex-col flex-1 p-2">
                                                    <span class="text-left line-clamp-2">-</span>
                                                    <span class="text-left text-xs font-bold">-</span>
                                                </div>
                                            </div>
                                        </div>
                                    `
                                } else {
                                    const groups = matches[k]?.participant || []
                                    row2 += `<div id='${i}-${j}-${k}' class="w-64 text-white my-1 mx-[1.5em] overflow-hidden rounded-md ">`
                                    for (let l = 0; l < groups?.length; l++) {
                                        const participant = groups[l]
                                        if (participant == null || Object.keys(participant).length == 0) {
                                            row2 += `
                                                <div id="${i}-${j}-${k}-${l}" class="flex bg-gradient-to-r from-[${ l == 0 ? '#eb3434' : '#3437eb'}] to-gray-600 ${l == 0 ? 'mb-[.18em]' : ''}" allowdrop="true" ondrop="handlerDrop(event)" ondragover="handlerAllowDrop(event)">
                                                    <div class="flex flex-col flex-1 p-2">
                                                        <span id="name-${i}-${j}-${k}-${l}" class="text-left line-clamp-2">${participant == null ? 'BYE' : '-'}</span>
                                                        <span id="contingent-${i}-${j}-${k}-${l}" class="text-left text-xs font-bold">-</span>
                                                    </div>
                                                    ${
                                                        l == 0 ? '<div class="w-[.5em] bg-[#eb3434]"></div>'
                                                        : '<div class="w-[.5em] bg-[#3437eb]"></div>'
                                                    }
                                                </div>
                                            `
                                        } else {
                                            row2 += `
                                                <div id="${i}-${j}-${k}-${l}" class="flex bg-gradient-to-r from-[${ l == 0 ? '#eb3434' : '#3437eb'}] to-gray-600 ${l == 0 ? 'mb-[.18em]' : ''} hover:cursor-pointer hover:bg-gray-600" draggable="true" allowdrop="true" ondragover="handlerAllowDrop(event)" ondragstart="handlerDragStart(event)" ondragend="handlerDragEnd(event)" ondrop="handlerDrop(event)" ondblclick="handlerClear(event)">
                                                    <div class="flex flex-col flex-1 p-2">
                                                        <span id="name-${i}-${j}-${k}-${l}" class="text-left line-clamp-2">${participant.name}</span>
                                                        <span id="contingent-${i}-${j}-${k}-${l}" class="text-left text-xs font-bold">(${participant.contingent?.toUpperCase()})</span>
                                                    </div>
                                                    ${
                                                        l == 0 ? '<div class="w-[.5em] bg-[#eb3434]"></div>'
                                                        : '<div class="w-[.5em] bg-[#3437eb]"></div>'
                                                    }
                                                </div>
                                            `
                                        }
                                    }
                                    row2 += `</div>`
                                }
                                row2 += `</div>`
                            }
                        } else {
                            row2 += `<div class="w-64 my-4"></div>`
                        }
                        row2 += `</div>`
                    }
                }                
            }
        }
        row2 += `</div>`
    }

    content.innerHTML = `
        ${
            STATES.matches?.length == 0 ? `
                <div class="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                    <button
                        onclick="handlerReshuffleBrackets()"
                        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-2 cursor-pointer">
                        <i class='bx bx-shuffle text-xl'></i>
                        Acak
                    </button>
                </div>
            ` : ''
        }
        <div class="flex flex-col">
            ${row1}
            ${row2}
        </div>
        <div class="flex flex-col justify-center items-center">
            <div id='${lastRoundIndex}-0-0' class="w-64 text-white mx-[1.5em] overflow-hidden rounded-md ">
                <div id="${lastRoundIndex}-0-0-0" class="flex bg-gradient-to-r from-[#eb3434] to-gray-600 mb-[.18em] hover:cursor-pointer hover:bg-gray-600" draggable="true" allowdrop="true" ondragover="handlerAllowDrop(event)" ondragstart="handlerDragStart(event)" ondragend="handlerDragEnd(event)" ondrop="handlerDrop(event)" ondblclick="handlerClear(event)">
                    <div class="flex flex-col flex-1 p-2">
                        <span id="name-${lastRoundIndex}-0-0-0" class="text-left line-clamp-2">${lastRoundData?.[0]?.name || '-'}</span>
                        <span id="contingent-${lastRoundIndex}-0-0-0" class="text-left text-xs font-bold">${lastRoundData?.[0]?.contingent ? `(${lastRoundData?.[0]?.contingent?.toUpperCase()})` : '-'}</span>
                    </div>
                    <div class="w-[.5em] bg-[#eb3434]"></div>
                </div>
                <div id="${lastRoundIndex}-0-0-1" class="flex bg-gradient-to-r from-[#3437eb] to-gray-600 hover:cursor-pointer hover:bg-gray-600" draggable="true" allowdrop="true" ondragover="handlerAllowDrop(event)" ondragstart="handlerDragStart(event)" ondragend="handlerDragEnd(event)" ondrop="handlerDrop(event)" ondblclick="handlerClear(event)">
                    <div class="flex flex-col flex-1 p-2">
                        <span id="name-${lastRoundIndex}-0-0-1" class="text-left line-clamp-2">${lastRoundData?.[1]?.name || '-'}</span>
                        <span id="contingent-${lastRoundIndex}-0-0-1" class="text-left text-xs font-bold">${lastRoundData?.[1]?.contingent ? `(${lastRoundData?.[1]?.contingent?.toUpperCase()})` : '-'}</span>
                    </div>
                    <div class="w-[.5em] bg-[#3437eb]"></div>
                </div>
            </div>
        </div>
        <div id="winner" class="flex flex-col justify-center items-center">
            <div class="w-64 text-white my-4 mx-[2em] overflow-hidden rounded-md hover:cursor-pointer hover:bg-gray-600" allowdrop="true" ondragover="handlerAllowDrop(event)" ondrop="handlerDropWinner(event)" ondblclick="handlerClearWinner(event)">
                <div class="flex bg-gray-500 relative">
                    <div class="flex flex-col flex-1 p-2">
                        <span class="text-left line-clamp-2">${STATES.winners?.[0]?.name?.toUpperCase() || '-'}</span>
                        <span class="text-left text-sm font-bold">${ STATES.winners?.[0]?.contingent ? `(${STATES.winners?.[0]?.contingent?.toUpperCase()})` : '-' }</span>
                    </div>
                    <div class="absolute bottom-0 right-0 w-0 h-0 border-l-[60px] border-b-[60px] border-l-transparent border-r-transparent border-b-green-500">
                    </div>
                    <div class="absolute bottom-0 right-1">
                        <i class="bx bx-medal text-white text-2xl"></i>
                    </div>
                </div>
            </div>
        </div>
    `

    setTimeout(drawConnectors, 1000);
}

// Services

const handlerOnload = async () => {

    const e = await localStorage.getItem("event")
    const category = await localStorage.getItem("category_bracket")
    if (!e) {
        if (!category) window.location.href = "/dashboard"
        else window.location.href = "/"
        return
    }
    
    STATES.event = JSON.parse(e)
    STATES.category = JSON.parse(category)

    document.getElementById("title").innerText = `EVENT ${STATES.event?.name?.toUpperCase()}\nBAGAN PERTANDINGAN : ${category.toUpperCase()}`

    await handlerGetParticipant()
    await handlerGetBracket()

    if (!STATES.bracket_id) {
        STATES.brackets = generateBracket(STATES.participants)
        await handlerCreateBracket()
    } else renderBracket()

    document.getElementById("loadingModal").classList.add("hidden")
}

window.addEventListener("load", handlerOnload)
window.addEventListener("resize", drawConnectors)