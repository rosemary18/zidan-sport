const STATES = {
    events: [],
    filteredEvents: []
}

const Start = async () => {
    
    await handlerGetAllEvents()
}

// Services

const handlerGetAllEvents = async (render = true) => {

    fetch('/api/event', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            STATES.events = res.data
            STATES.filteredEvents = res.data
            renderTable()
        }
    })
}

const handlerDeleteEvent = async (eventId) => {

    let conf = confirm("Apakah anda yakin ingin menghapus event ini?")
    if (!conf) return

    fetch('/api/event/delete/' + eventId, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            handlerGetAllEvents()
            localStorage.removeItem("event")
        }
    })
}

const handlerAddEvent = async () => {

    fetch('/api/event/create', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: document.getElementById("name").value,
            location: document.getElementById("location").value,
            organizer: document.getElementById("organizer").value,
            date: document.getElementById("date").value
        })
    })
    .then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            alert("Event berhasil ditambahkan!")
            handlerGetAllEvents()
            document.getElementById("name").value = ""
            document.getElementById("location").value = ""
            document.getElementById("organizer").value = ""
            document.getElementById("date").value = ""
        }
    })
}

const handlerGetIntoEvent = async (eventId) => {

    let event = STATES.events.find(e => e.id == eventId)
    localStorage.setItem("event", JSON.stringify(event))
    window.location.href = "/dashboard"
}

function openModal() {
    document.getElementById("modal").classList.remove("hidden");
}
function closeModal(submit) {
    if (submit) handlerAddEvent()
    document.getElementById("modal").classList.add("hidden");
}

let currentPage = 1;
let rowsPerPage = 5;
let sortOrder = [true, true, true, true];

function renderTable() {

    let i = 0;
    rowsPerPage = parseInt(document.getElementById("perPage").value);
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = STATES.filteredEvents.slice(start, end);
    
    pageData.forEach(row => {
        i = i+1
        const tr = `
            <tr class="bg-opacity-20 hover:bg-gray-200 transition duration-300 cursor-pointer" onclick="handlerGetIntoEvent(${row?.id})">
                <td class="pl-4">
                    ${i}
                </td>
                <td class="flex px-6 py-4 whitespace-nowrap">
                    ${row?.name || "-"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${row?.location || "-"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${row?.organizer || "-"}
                </td>
                <td class="flex px-6 py-4 whitespace-nowrap">
                    ${row?.date || "-"}
                </td>
                <td class="pl-4">
                    <svg class="w-4 fill-current text-red-500 cursor-pointer" onclick="handlerDeleteEvent(${row?.id})" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                </td>
            </tr>
        `;
        tableBody.innerHTML += tr;
    });
    renderPagination();
}

function filterTable() {
    const query = document.getElementById("search").value.toLowerCase();
    STATES.filteredEvents = STATES.events.filter(row => 
        row?.name.toLowerCase().includes(query) || 
        row?.location.toLowerCase().includes(query) || 
        row?.date.toLowerCase().includes(query) || 
        row?.organizer.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderTable();
}

function sortTable(colIndex) {
    const key = ["name", "location", "organizer", "date"][colIndex];
    sortOrder[colIndex] = !sortOrder[colIndex];
    STATES.filteredEvents.sort((a, b) => sortOrder[colIndex] ? (a[key] > b[key] ? 1 : -1) : (a[key] < b[key] ? 1 : -1));
    currentPage = 1;
    renderTable();
}

function renderPagination() {

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    const totalPages = Math.ceil(STATES.filteredEvents.length / rowsPerPage);
    
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            let button = document.createElement("button");
            button.innerText = i;
            button.classList = `border border-[.1px] border-[#dddddd] px-4 py-2 rounded shadow-md ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'}`;
            button.onclick = () => { currentPage = i; renderTable(); };
            pagination.appendChild(button);
        }
    }
}

Start()
renderTable();