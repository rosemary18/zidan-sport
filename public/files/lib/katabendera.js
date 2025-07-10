const STATES = {
    event: {},
    categories: [],
    matches: [],
    filteredMatches: [],
    participants: [],
    sortOrder: [true, true],
    category: '',
    currentPage: 1,
    stageKataBendera: null
}

// Handlers

const handlerGetAllParticipants = async () => {

    const res = await fetch(`/api/participant/event/${STATES.event.id}`)
    const data = await res?.json()

    if (data?.statusCode == 200) {
        STATES.participants = data.data?.participants
        STATES.categories = [...new Set(data?.data?.participants?.filter(d => d?.category?.includes("KATA")).map(d => d?.category))];
    }
}

const handlerGetAllMatches = async () => {

    const res = await fetch(`/api/match/${STATES.event.id}/${encodeURIComponent(STATES.category)}`)
    const data = await res?.json()

    if (data?.statusCode == 200) {
        const filtered = data.data?.filter(d => d?.match_type == "KATA BENDERA")
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
        const stageKataBendera = {
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
            stageKataBendera.participants.push({
                ...STATES.participants.find(participant => participant?.id == participant1.value?.split('|')?.[0]),
                point: 0
            })
        } else stageKataBendera.participants.push(null)

        if (participant2.value?.split('|')?.[0]) {
            stageKataBendera.participants.push({
                ...STATES.participants.find(participant => participant?.id == participant2.value?.split('|')?.[0]),
                point: 0
            })
        } else stageKataBendera.participants.push(null)


        localStorage.setItem("stage_kata_bendera", JSON.stringify(stageKataBendera))
        STATES.stageKataBendera = stageKataBendera
        document.getElementById("match-handler").classList.remove("hidden");
        document.getElementById("title").innerText = `${stageKataBendera?.match_id} | ${stageKataBendera?.tatami} | ${stageKataBendera?.category?.toUpperCase()}`
        document.getElementById("main-content").classList.add("hidden");
        document.getElementById("match-content").classList.remove("hidden");
        handlerRenderMatch()
    }

}

const handlerDeleteStageMatch = () => {
    
    let conf = confirm("Apakah anda yakin untuk tidak menyimpan pertandingan ini?")

    if (conf) {
        localStorage.removeItem("stage_kata_bendera")
        STATES.stageKataBendera = null
        document.getElementById("match-handler").classList.add("hidden");
        document.getElementById("title").innerText = `KATA BENDERA | EVENT ${STATES.event?.name?.toUpperCase()}`
        document.getElementById("main-content").classList.remove("hidden");
        document.getElementById("match-content").classList.add("hidden");
        handlerRenderTable()
    }
}

const handlerMatchControl = (i, type) => {

    if (type == '1b') {
        STATES.stageKataBendera.participants[i].point = STATES.stageKataBendera?.participants[i]?.point + 1
        // localStorage.setItem("confetti_kata_bendera", `1b-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == '2b') {
        STATES.stageKataBendera.participants[i].point = STATES.stageKataBendera?.participants[i]?.point + 2
        // localStorage.setItem("confetti_kata_bendera", `2b-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == '3b') {
        STATES.stageKataBendera.participants[i].point = STATES.stageKataBendera?.participants[i]?.point + 3
        // localStorage.setItem("confetti_kata_bendera", `3b-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    if (type == '-1') {
        STATES.stageKataBendera.participants[i].point = Math.max(STATES.stageKataBendera?.participants[i]?.point - 1, 0)
        // localStorage.setItem("confetti_kata_bendera", `min-${i == 0 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
    }
    
    STATES.stageKataBendera.id = Math.floor(Math.random() * 1000000)
    localStorage.setItem("stage_kata_bendera", JSON.stringify(STATES.stageKataBendera))
    
    handlerRenderMatch()
}

const handlerCheckWinner = () => {

    let winner = null

    if (STATES.stageKataBendera.participants[0].point > STATES.stageKataBendera.participants[1].point) winner = STATES.stageKataBendera.participants[0].id
    if (STATES.stageKataBendera.participants[1].point > STATES.stageKataBendera.participants[0].point) winner = STATES.stageKataBendera.participants[1].id

    return winner
}

const handlerSaveMatch = () => {

    const isRegu = !(STATES.stageKataBendera.participants[0] != null && STATES.stageKataBendera.participants[1] != null)

    if (!document.getElementById("w-1")?.checked && !document.getElementById("w-2")?.checked && !isRegu) {
        const conf = confirm("Pemenang belum ditentukan, apakah kamu ingin pemenang di tentukan oleh system ?")
        if (!conf) return
    }

    let con = confirm("Apakah anda yakin untuk menyimpan pertandingan ini?")
    if (!con) return

    let winner = isRegu ? '' : document.getElementById("w-1").checked ? STATES.stageKataBendera.participants[0].id : document.getElementById("w-2").checked ? STATES.stageKataBendera.participants[1].id : handlerCheckWinner()
    let grade1 = STATES.stageKataBendera.participants[0] == null ? '' : `Point ${STATES.stageKataBendera.participants[0]?.point}`
    let grade2 = STATES.stageKataBendera.participants[1] == null ? '' : `Point ${STATES.stageKataBendera.participants[1]?.point}`

    const data = {
        event_id: STATES.event.id,
        category: STATES.stageKataBendera.category,
        match_type: "KATA BENDERA",
        winner_id: winner,
        arena: STATES.stageKataBendera.tatami,
        time: "",
        participants: []
    }

    if (STATES.stageKataBendera.participants[0] != null) {
        data.participants.push({
            id: STATES.stageKataBendera.participants[0].id,
            grade: grade1
        })
    }

    if (STATES.stageKataBendera.participants[1] != null) {
        data.participants.push({
            id: STATES.stageKataBendera.participants[1].id,
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
            STATES.stageKataBendera = null
            localStorage.removeItem("stage_kata_bendera")
            localStorage.removeItem("confetti_kata_bendera")
            window.location.reload()
        }
    })
}

const handlerToggleCheckbox = (n) => {

    if (n == 1) document.getElementById('w-2').checked = false
    if (n == 2) document.getElementById('w-1').checked = false

    if (document.getElementById(`w-1`).checked || document.getElementById(`w-2`).checked) localStorage.setItem("confetti_kata_bendera", `win-${n == 1 ? 'red' : 'blue'}-${Math.floor(Math.random() * 1000)}`)
}

// Renders

const handlerRenderMatch = () => {

    document.getElementById("match-content").innerHTML = `

        <div class="flex text-white">
            ${
                STATES.stageKataBendera.participants[0] != null ? `
                    <div class="flex flex-col flex-1">
                        <div class="flex flex-1 flex-col justify-center items-center p-10 min-h-[30em] bg-red-600 rounded-md relative">
                            ${
                                STATES.stageKataBendera.participants[1] != null ? `
                                    <div class="absolute bottom-4 right-4 flex items-center justify-center">
                                        <span class="text-xl">🏆</span>
                                        <input id="w-1" type="checkbox" onclick="handlerToggleCheckbox(1)" class="w-5 h-5 ml-2 shadowed">
                                    </div>
                                ` : ''
                            }
                            <h1 class="text-4xl font-bold line-clamp-1">${STATES.stageKataBendera?.participants[0]?.name}</h1>
                            <h2 class="text-2xl font-bold">(${STATES.stageKataBendera?.participants[0]?.contingent})</h2>
                            <h1 class="text-[10em] font-extrabold mt-2">${STATES.stageKataBendera?.participants[0]?.point}</h1>
                        </div>
                        <div class="flex flex-col justify-center gap-3 bg-red-100 p-4 rounded-lg mt-6">
                            <div class="flex flex-wrap justify-center gap-2 p-2 rounded-lg">
                                <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(0, '1b')">1 BENDERA</button>
                                <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(0, '2b')">2 BENDERA</button>
                                <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(0, '3b')">3 BENDERA</button>
                                <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(0, '-1')">Kurangi (-1)</button>
                            </div>
                        </div>
                    </div>
                ` : ''
            }
            ${ STATES.stageKataBendera.participants[0] == null || STATES.stageKataBendera.participants[1] == null ? '' : '<div class="mx-3"></div>' }
            ${
                STATES.stageKataBendera.participants[1] != null ? `
                    <div class="flex flex-col flex-1">
                        <div class="flex flex-1 flex-col justify-center items-center p-10 min-h-[30em] bg-blue-600 rounded-md relative">
                            ${
                                STATES.stageKataBendera.participants[0] != null ? `
                                    <div class="absolute bottom-4 left-4 flex items-center justify-center">
                                        <input id="w-2" type="checkbox" onclick="handlerToggleCheckbox(2)" class="w-5 h-5 mr-2 shadowed">
                                        <span class="text-xl">🏆</span>
                                    </div>                            
                                ` : ''
                            }
                            <h1 class="text-4xl font-bold line-clamp-1">${STATES.stageKataBendera?.participants[1]?.name}</h1>
                            <h2 class="text-2xl font-bold">(${STATES.stageKataBendera?.participants[1]?.contingent})</h2>
                            <h1 class="text-[10em] font-extrabold mt-2">${STATES.stageKataBendera?.participants[1]?.point}</h1>
                        </div>
                        <div class="flex flex-col justify-center gap-2 bg-blue-100 p-4 rounded-lg mt-6">
                            <div class="flex flex-wrap justify-center gap-2 p-2 rounded-lg">
                                <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(1, '1b')">1 BENDERA</button>
                                <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(1, '2b')">2 BENDERA</button>
                                <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(1, '3b')">3 BENDERA</button>
                                <button class="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg" onclick="handlerMatchControl(1, '-1')">Kurangi (-1)</button>
                            </div>
                        </div>
                    </div>
                ` : ''
            }
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
            <h2 class="text-[1.5em] font-bold text-gray mb-4">Buat Pertandingan Kata Bendera</h2>
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
            <input list="participant-1-list" type="text" autocomplete="off" id="participant-1" placeholder="Pilih Peserta Merah..." class="text-gray-500 bg-white border border-[.1px] border-[#dddddd] p-2 rounded shadow-md focus:outline-none w-full mb-3">
            <datalist id="participant-1-list">
                ${participants}
            </datalist>
            <input list="participant-2-list" type="text" autocomplete="off" id="participant-2" placeholder="Pilih Peserta Biru..." class="text-gray-500 bg-white border border-[.1px] border-[#dddddd] p-2 rounded shadow-md focus:outline-none w-full mb-3">
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
        <input value="${STATES.category}" list="categories" id="category" placeholder="Pilih Kategori..." class="text-gray-500 bg-white border border-[.1px] border-[#dddddd] p-2 rounded shadow-md focus:outline-none mr-4 min-w-75" onchange="handlerFilterTable('category')">
        <datalist id="categories">
            ${options}
        </datalist>
    `;
}

const handlerRenderTable = () => {

    if (STATES.stageKataBendera != null) return

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
                ${
                    row?.match_type == "KATA REGU" ? `
                        <td colspan="2" class="px-6 py-4 whitespace-nowrap">
                            <div class="flex flex-col items-start justify-start">
                                <div class="flex flex-col items-start justify-start"></div>
                                    <p class="text-xs font-regular">${row?.participants?.[0]?.name || "-"} & CS</p>
                                    <p class="text-[.8em] font-semibold">(${row?.participants?.[0]?.contingent || "-"})</p>
                                </div>
                                <span class="text-xs font-regular mt-2">${row?.participants?.[0]?.grade || "-"}</span>
                            </div>
                        </td>
                    ` : `
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
                    `
                }
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

    const stageKataBendera = await localStorage.getItem("stage_kata_bendera")
    const parsedStageKumite = JSON.parse(stageKataBendera)

    if (stageKataBendera && parsedStageKumite?.event_id == STATES.event?.id) {
        STATES.stageKataBendera = JSON.parse(stageKataBendera)
        document.getElementById("match-handler").classList.remove("hidden");
        document.getElementById("title").innerText = `${STATES.stageKataBendera?.match_id} | ${STATES.stageKataBendera?.tatami} | ${STATES.stageKataBendera?.category?.toUpperCase()}`
        handlerRenderMatch()
    }  else {
        document.getElementById("match-handler").classList.add("hidden");
        document.getElementById("main-content").classList.remove("hidden");
        document.getElementById("title").innerText = `KATA BENDERA | EVENT ${STATES.event?.name?.toUpperCase()}`
    }
    
    await handlerGetAllParticipants()
    await handlerGetAllMatches()
}

const handlerOnUnload = () => {

    localStorage.setItem("stage_kata_bendera", JSON.stringify(STATES.stageKataBendera))
}

window.addEventListener("load", handlerOnload)
window.addEventListener("unload", handlerOnUnload)