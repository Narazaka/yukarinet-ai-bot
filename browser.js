/** @type {import("socket.io-client").io} */
var io;

const socket = io("ws://localhost:8090");

function evtypelog(event) {
    console.log(event.type)
}

document.addEventListener("DOMContentLoaded", () => {
    const $input = document.querySelector("#input");
    const $output = document.querySelector("#output");
    /** @type {SpeechRecognition} */
    const re = new (webkitSpeechRecognition || SpeechRecognition)();
    re.onaudiostart = evtypelog
    re.onaudioend = evtypelog
    re.onerror = console.log
    re.onstart = evtypelog
    re.onnomatch = console.log
    re.onsoundend = evtypelog
    re.onsoundstart = evtypelog
    re.onspeechstart = evtypelog
    re.onspeechend = evtypelog
    re.addEventListener("result", event => {
        console.log(event)
        
        const result = event.results.item(0).item(0).transcript;
        $input.textContent = result;
        socket.send(result)
    });
    re.addEventListener("end", event => {
        console.log(event)
        re.start()
    })
    re.start();

    socket.on("message", (data) => {
        $output.textContent = data
    })
})
