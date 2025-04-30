const STATES = {
    event: {},
    categories: [],
    participants: [],
    filteredParticipants: [],
    sortOrder: [true, true, true],
    category: '',
    currentPage: 1,
}

// Handlers

const pickFile = () => {

    let conf = confirm("Apakah kamu ingin mengimport data baru?");
    if (!conf) return

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', async function() {
        const file = fileInput.files[0];
        if (file) {
            const data = await parseFileToArray(file);
            importData(data);
        }
    });

    fileInput.click();
}

const parseFileToArray = (file) => {
    return new Promise((resolve, reject) => {
        const data = [];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const lines = event.target.result.split('\n');
            console.log(lines)
            for (let i = 0; i < lines.length; i++) {
                const row = lines[i].split(',');
                const obj = {
                    contingent: row[0]?.trim(),
                    name: row[1]?.trim(),
                    gender: row[2]?.trim(),
                    category: row[3]?.trim(),
                }
                data.push(obj);
            }
            console.log(data);
            resolve(data);
        };

        reader.onerror = function(error) {
            console.error('Error reading file:', error);
            reject(error);
        };

        reader.readAsText(file);
    });
}

function importData(data) {

    console.log('Data to Import: ', data);

    fetch('/api/participant/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event_id: STATES.event.id,
            data
        })
    })
    .then(response => response.json())
    .then((r) => {
        alert(r?.message);
        location.reload();
    }).catch(error => {
        alert("Import Data Gagal!\n\n Periksa kembali data Anda!");
        console.error('Error:', error);
    });
}

const handlerGetAllParticipants = async () => {

    const res = await fetch(`/api/participant/event/${STATES.event.id}`)
    const data = await res?.json()

    if (data?.statusCode == 200) {

        STATES.participants = data.data
        STATES.filteredParticipants = data.data
        STATES.categories = [...new Set(data?.data?.map(d => d?.category))];
        
        handlerRenderTable()
    }
}

// Renders

const handlerRenderPagination = () => {

    const pagination = document.getElementById("pagination");
    let rowsPerPage = parseInt(document.getElementById("perPage").value) || 5;
    pagination.innerHTML = "";
    const totalPages = Math.ceil(STATES.filteredParticipants.length / rowsPerPage);
    
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
        <input value="${STATES.category}" type="text" autocomplete="off" list="categories" id="category" placeholder="Pilih Kategori..." class="text-gray-500 bg-white border border-[.1px] border-[#dddddd] p-2 rounded shadow-md focus:outline-none mr-4 min-w-75" onchange="handlerFilterTable('category')">
        <datalist id="categories">
            ${options}
        </datalist>
    `;
}

const handlerRenderTable = () => {

    let i = 0;
    let rowsPerPage = parseInt(document.getElementById("perPage").value) || 5;
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    if (STATES.currentPage > Math.ceil(STATES.filteredParticipants.length / rowsPerPage)) {
        STATES.currentPage = Math.ceil(STATES.filteredParticipants.length / rowsPerPage);
    }
    
    const start = (STATES.currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = STATES.filteredParticipants.slice(start, end);
    
    pageData.forEach(row => {
        i = i+1
        const tr = `
            <tr class="bg-opacity-20 hover:bg-gray-200 transition duration-300 cursor-pointer" >
                <td class="pl-4 bg-white">
                    ${i}
                </td>
                <td class="flex px-6 py-4 whitespace-nowrap">
                    ${row?.name || "-"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${row?.contingent || "-"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${row?.gender || "-"}
                </td>
                <td class="pl-4">
                    <svg class="w-4 fill-current text-red-500 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" onclick="handlerDeleteParticipant(${row?.id})">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                </td>
            </tr>
        `;
        tableBody.innerHTML += tr;
    });

    if (STATES.filteredParticipants.length == 0) {
        tableBody.innerHTML = `
            <tr class="bg-opacity-20 hover:bg-gray-200 transition duration-300 cursor-pointer" >
                <td class="pl-4" colspan="8">
                    <p class="text-center p-4">Tidak ada data peserta</p>
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
    STATES.filteredParticipants.sort((a, b) => {
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
            STATES.filteredParticipants = STATES.participants
            document.getElementById("bracket").classList.add("hidden");
            return
        }
        document.getElementById("bracket").classList.remove("hidden");
        STATES.filteredParticipants = STATES.participants.filter(row => 
            row?.category == document.getElementById("category").value
        );
    } else {
        const query = document.getElementById("search").value.toLowerCase();
        if (query == '') handlerFilterTable("category")
        else {
            STATES.filteredParticipants = STATES.filteredParticipants.filter(row => 
                row?.name?.toLowerCase()?.includes(query) || 
                row?.contingent?.toLowerCase()?.includes(query)
            );
        }
    }

    STATES.currentPage = 1;
    handlerRenderTable();
}

const handlerDeleteParticipant = async (id) => {

    let conf = confirm("Apakah anda yakin ingin menghapus peserta ini?")
    if (!conf) return

    fetch('/api/participant/delete/' + id, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => {
        if (res?.statusCode == 200) {
            handlerGetAllParticipants()
        }
    })
}

const handlerViewBracket = () => {
    
    localStorage.setItem("category_bracket", JSON.stringify(document.getElementById("category").value))
    window.open(`/bracket`, "_blank")
}

// Services

const handlerOnload = async () => {

    const e = await localStorage.getItem("event")
    if (!e) {
        window.location.href = "/"
        return
    }
    
    STATES.event = JSON.parse(e)
    handlerGetAllParticipants()

    document.getElementById("title").innerText = `DASHBOARD | EVENT (${STATES.event?.id}) ${STATES.event?.name?.toUpperCase()}`

}

window.addEventListener("load", handlerOnload)