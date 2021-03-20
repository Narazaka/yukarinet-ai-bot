// @ts-check

const fs = require("fs");
const fetch = require("node-fetch").default
const { SatoriDic } = require("./satoridic");

const apikey = require("./apiKey.json").apiKey;
const base = "https://api.a3rt.recruit-tech.co.jp/talk/v1/smalltalk";


/** @param {string} query */
module.exports = async function reply(query) {
    // オンラインでの更新のため
    const satoriDic = SatoriDic.readDictionary(fs.readFileSync("reply.dic.txt", "utf8"))
    const pseudoAIReply = satoriDic.reply(query)
    if (pseudoAIReply) {
        return {
            status: 0,
            message: "ok",
            results: [],
            reply: pseudoAIReply,
            original: "pseudo",
            perplexity: 0,
        }
    }
    return replyAI(query);
}

/**
 * @param {string} query
 */
async function replyAI(query) {
    const body = new URLSearchParams();
    body.set("apikey", apikey)
    body.set("query", query)
    const res = await fetch(base, {
        method: "POST",
        body,
    })
    /** @type {{status: number; message: string; results?: {reply: string; perplexity: number}[]}} */
    const {status, message, results } = await res.json()
    if (!results || !results.length) {
        return {
            status,
            message,
            results,
        }
    }
    const { reply, perplexity } = results[0]
    const filtered = filterReply(reply, perplexity);
    return {
        status,
        message,
        results,
        reply: filtered.reply,
        original: filtered.original,
        perplexity,
    }
};

/** @param {string[]} list */
function randomSelect(list) {
    return list[Math.floor(Math.random() * list.length)];
}

const randomDic = fs.readFileSync("random.dic.txt", "utf8").split(/\r?\n/).filter(Boolean)

/**
 * 
 * @param {string} reply 
 * @param {number} perplexity 
 */
function filterReply(reply, perplexity) {
    if (reply === "あなたはよくするんですか?" && perplexity < 1) {
        return { reply: randomSelect(randomDic), original: reply };
    }
    return { reply };
}
