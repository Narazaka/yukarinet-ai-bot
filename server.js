// @ts-check

const Koa = require("koa");
const IO = require('koa-socket-2');
const WebSocket = require("ws");
const open = require("open");
const fs = require("fs");

const reply = require("./reply");
const port = 49513;

const app = new Koa();
const io = new IO();
io.attach(app)

const wss = new WebSocket(`ws://localhost:${port}`)

app.use(require("koa-static")("."))

const fd = fs.openSync("log.txt", "a");

io.on("message", (ctx, query) => {
    console.log(query)
    fs.writeSync(fd, `> ${query}\n`)
    reply(query).then(result => {
        if (!result) return;
        console.log(result.message, result.perplexity, result.reply, result.original)
        fs.writeSync(fd, `< ${JSON.stringify(result)}\n`)
        if (!result.reply) return;
        /** @type {import("socket.io").Socket} */
        const socket = ctx.socket
        socket.send(result.reply)
        wss.send(`0:${result.reply}`)
    }, err => {
        console.log(err)
    })
})

app.listen(8090)

open("http://localhost:8090", {app: {name: open.apps.chrome}});
