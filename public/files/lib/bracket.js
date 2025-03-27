const STATES = {
    event: {},
    category: null,
    brackets: []
}
let draggedItem = null

const brackets = [
    [
        [
            {
                participant: [
                    {
                        name: "INDRA",
                        contingent: "(INKANAS)"
                    }, 
                    {
                        name: "ILOVIA",
                        contingent: "(INKANAS)"
                    }
                ],
                coordinate: "2-0-0"
            },
        ],
        [
            {
                participant: [
                    {
                        name: "MULYADI",
                        contingent: "(INKANAS)"
                    }, {
                        name: "EKA",
                        contingent: "(INKANAS)"
                    }
                ],
                coordinate: "1-1-0"
            },
            {
                participant: [
                    {
                        name: "MOLLA",
                        contingent: "(INKANAS)"
                    }, null
                ],
                coordinate: "1-1-0"
            }
        ],
    ],
    [
        [],
        [
            {
                participant: [
                    {},
                    {}
                ],
                coordinate: "2-0-0"
            }
        ],
    ],
    [
        [
            {
                participant: [
                    {}, {}
                ],
                coordinate: ""
            }
        ],
    ],
]

// Handlers

const chunkArrayWithNull = (arr, size) => {

    return arr.reduce((acc, _, i) => {
        if (i % size === 0) {
        acc.push(arr.slice(i, i + size));
        }
        return acc;
    }, []).map(subArr => subArr.length < size ? [...subArr, ...Array(size - subArr.length).fill(null)] : subArr);
}

const handlerCheckByeMatch = (groups) => {

    return ""
}

const generateBracket = (participants) => {

    const totalParticipants = participants.length;
    const rounds = Math.ceil(Math.log2(totalParticipants));
    const bracket = [];
    
    const half = Math.ceil(totalParticipants / 2);
    const groupA = chunkArrayWithNull(participants.slice(0, half), 2);
    const groupB = chunkArrayWithNull(participants.slice(half), 2);
    
    for (let r = 0; r < rounds; r++) {
        const round = []
        if (r == 0) {
            const a = [];
            const b = [];
            for (let i = 0; i < groupA.length; i++) {
                let col = groupA.length%2 == 0 ? 2 : 1;
                let data = {
                    participant: groupA[i],
                    coordinate: ``
                }
                a.push(data);
            }
            for (let i = 0; i < groupB.length; i++) {
                let data = {
                    participant: groupB[i],
                    coordinate: ``
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
                        coordinate: ""
                    }
                ])
            } else {
                const lastBracket = bracket[r-1]
                const a = []
                const b = []
                if (lastBracket[0]?.length > 1) {
                    for (let j = 0; j < Math.ceil(lastBracket[0]?.length/2); j++) {
                        if ((j == 0 && ((lastBracket[0]?.length%2) == 1))) {
                            a.push({})
                        } else {
                            a.push({
                                participant: [{}, {}],
                                coordinate: ""
                            })
                        }
                    }
                }
                if (lastBracket[1]?.length > 1) {
                    for (let j = 0; j < Math.ceil(lastBracket[1]?.length/2); j++) {
                        if ((j == 0 && ((lastBracket[1]?.length%2) == 1))) {
                            b.push({
                                participant: [{}, {}],
                                coordinate: ""
                            })
                        } else {
                            b.push({
                                participant: [{}, {}],
                                coordinate: ""
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
    
    return bracket;
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
                const between = midX1 + (midX2 - midX1) / 2;

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
    console.log("Dragging")
    draggedItem = event.target
}

const handlerDragEnd = (event) => {
    console.log("Drag end")
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
    }
}

const handlerDropWinner = (event) => {


}

const handlerClearWinner = (event) => {

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
    }
}

// Renders

const renderBracket = () => {

    const content = document.getElementById("content")
    let grids = ""

    for (let i = 0; i < STATES.brackets.length; i++) {
        grids += `<div class="grid gap-y-6">`
        if (STATES.brackets[i]?.length > 0) {
            for (let j = 0; j < STATES.brackets[i].length; j++) {
                const bracket = STATES.brackets[i][j]
                if (bracket?.length > 0) {
                    grids += '<div class="flex flex-col justify-center">'
                    for (let k = 0; k < bracket.length; k++) {
                        const groups = bracket[k]?.participant || []
                        grids += `<div id='${i}-${j}-${k}' class="w-64 text-white my-4 mx-[2em] overflow-hidden rounded-md ">`
                        if (groups?.length > 0) {
                            for (let l = 0; l < groups?.length; l++) {
                                if (groups[l] == null || Object.keys(groups[l]).length == 0) {
                                    grids += `
                                        <div id="${i}-${j}-${k}-${l}" class="flex bg-gradient-to-r from-[${ l == 0 ? '#eb3434' : '#3437eb'}] to-gray-600 ${l == 0 ? 'mb-[.18em]' : ''}" allowdrop="true" ondrop="handlerDrop(event)" ondragover="handlerAllowDrop(event)">
                                            <div class="flex flex-col flex-1 p-2">
                                                <span id="name-${i}-${j}-${k}-${l}" class="text-left line-clamp-2">${groups[l] == null ? 'BYE' : '-'}</span>
                                                <span id="contingent-${i}-${j}-${k}-${l}" class="text-left text-xs font-bold">-</span>
                                            </div>
                                            ${
                                                l == 0 ? '<div class="w-[.5em] bg-[#eb3434]"></div>'
                                                : '<div class="w-[.5em] bg-[#3437eb]"></div>'
                                            }
                                        </div>
                                    `
                                } else {
                                    grids += `
                                        <div id="${i}-${j}-${k}-${l}" class="flex bg-gradient-to-r from-[${ l == 0 ? '#eb3434' : '#3437eb'}] to-gray-600 ${l == 0 ? 'mb-[.18em]' : ''} hover:cursor-pointer hover:bg-gray-600" draggable="true" allowdrop="true" ondragover="handlerAllowDrop(event)" ondragstart="handlerDragStart(event)" ondragend="handlerDragEnd(event)" ondrop="handlerDrop(event)" ondblclick="handlerClear(event)">
                                            <div class="flex flex-col flex-1 p-2">
                                                <span id="name-${i}-${j}-${k}-${l}" class="text-left line-clamp-2">${groups[l].name}</span>
                                                <span id="contingent-${i}-${j}-${k}-${l}" class="text-left text-xs font-bold">(${groups[l].contingent?.toUpperCase()})</span>
                                            </div>
                                            ${
                                                l == 0 ? '<div class="w-[.5em] bg-[#eb3434]"></div>'
                                                : '<div class="w-[.5em] bg-[#3437eb]"></div>'
                                            }
                                        </div>
                                    `
                                }
                            }
                        } else {
                            grids += `<div class="h-30"></div>`
                        }  
                        grids += '</div>'                      
                    }
                    grids += '</div>'
                } else {
                    grids += `<div class="flex flex-col flex-1 justify-center"></div>`
                }
            }
        }
        grids += `</div>`
    }

    content.innerHTML = `
        <div class="grid grid-cols-${STATES.brackets.length+1} gap-x-8 relative">
            ${grids}
            <div id="winner" class="grid gap-y-6">
                <div class="flex flex-col justify-center items-center">
                    <div class="w-64 text-white my-4 mx-[2em] overflow-hidden rounded-md">
                        <div class="flex bg-gray-500 relative">
                            <div class="flex flex-col flex-1 p-2">
                                <span class="text-left line-clamp-2">-</span>
                                <span class="text-left text-sm font-bold">-</span>
                            </div>
                            <div class="absolute bottom-0 right-0 w-0 h-0 border-l-[60px] border-b-[60px] border-l-transparent border-r-transparent border-b-green-500">
                            </div>
                            <div class="absolute bottom-0 right-1">
                                <i class="bx bx-medal text-white text-2xl"></i>
                            </div>
                        </div>
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
    STATES.category = category

    document.getElementById("title").innerText = `EVENT ${STATES.event?.name?.toUpperCase()}\nBAGAN PERTANDINGAN : ${category.toUpperCase()}`
    STATES.brackets = generateBracket([
        {
            id: 1,
            name: "Ali",
            contingent: "Inkanas"
        },
        {
            id: 2,
            name: "Budi",
            contingent: "Macando"
        },
        {
            id: 3,
            name: "Cici",
            contingent: "Ergan"
        },
        {
            id: 4,
            name: "Dedi",
            contingent: "Mododo"
        },
        {
            id: 5,
            name: "Eri",
            contingent: "Inkanas"
        },
        {
            id: 6,
            name: "Toni",
            contingent: "Inkanas"
        },
        {
            id: 7,
            name: "Tono",
            contingent: "Inkanas"
        },
        {
            id: 8,
            name: "Anto",
            contingent: "Inkanas"
        },
        {
            id: 9,
            name: "Yono",
            contingent: "Inkanas"
        },
    ])
    setTimeout(renderBracket, 500);
    console.log(JSON.stringify(STATES.brackets))
}

window.addEventListener("load", handlerOnload)
window.addEventListener("resize", drawConnectors)