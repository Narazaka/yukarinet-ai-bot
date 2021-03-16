// @ts-check

const Koa = require("koa");
const IO = require('koa-socket-2');
const WebSocket = require("ws");
const open = require("open");
const fetch = require("node-fetch").default

const apikey = require("./apiKey.json").apiKey;
const port = 49513;

const app = new Koa();
const io = new IO();
io.attach(app)

const wss = new WebSocket(`ws://localhost:${port}`)

app.use(require("koa-static")("."))

const base = "https://api.a3rt.recruit-tech.co.jp/talk/v1/smalltalk";
io.on("message", (ctx, query) => {
    console.log(query)
    const body = new URLSearchParams();
    body.set("apikey", apikey)
    body.set("query", query)
    fetch(base, {
        method: "POST",
        body,
    }).then(async res => {
        const {status, message, results } = await res.json()
        console.log(status, message, results)
        if (!results) return;
        const response = results[0].reply
        /** @type {import("socket.io").Socket} */
        const socket = ctx.socket
        socket.send(response)
        wss.send(`0:${response}`)
    },
    err => {
        console.log(err)
    })
})

app.listen(8000)

open("http://localhost:8000", {app: {name: open.apps.chrome}});
