const STATES = {
    event: {}
}

const handlerOnload = async () => {
    const e = await localStorage.getItem("event")
    if (!e) {
        window.location.href = "/"
        return
    }
    
    STATES.event = JSON.parse(e)

    document.getElementById("title").innerText = `KATA | EVENT ${STATES.event?.name?.toUpperCase()}`

}

window.addEventListener("load", handlerOnload)