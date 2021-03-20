// @ts-check

const entryMarkRe = /^([*@＊＠])(.+)$/;

/**
 * 
 * @param {string} content 
 */
function readDictionary(content) {
    const lines = content.split(/\n/)
    /** @type {{[key: string]: string[]}} */
    const entries = {}
    /** @type {"block" | "line" | undefined} */
    let entryMode = undefined;
    let currentKey = undefined;
    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i]
        const entryMarkMatch = entryMarkRe.exec(line)
        if (entryMarkMatch) {
            if (!entryMarkMatch[2].length) {
                console.warn(`WARN: ${i + 1}: [${line}] は見出し語がありません`)
            }
            const mark = entryMarkMatch[1]
            entryMode = mark === "*" || mark === "＊" ? "block" : "line"
            currentKey = entryMarkMatch[2]
            if (!entries[currentKey]) entries[currentKey] = []
            if (entryMode === "block") entries[currentKey].push("")
            continue;
        }
        if (currentKey != null) {
            if (entryMode === "line") {
                if (line.length) {
                    entries[currentKey].push(line)
                }
            } else {
                entries[currentKey][entries[currentKey].length - 1] += line + "\n"
            }
        }
    }
    return entries;
}

class SatoriDic {
    /**
     * 
     * @param {string} content 
     */
    static readDictionary(content) {
        return new SatoriDic(readDictionary(content))
    }

    /**
     * 
     * @param {{[key: string]: string[]}} dic 
     */
    constructor(dic) {
        this.dic = dic
    }

    /**
     * 
     * @param {string} key 
     * @returns {string}
     */
    reply(key) {
        const items = this.dic[key];
        if (!items) return "";
        const rand = Math.random() * items.length
        const index = Math.floor(rand)
        const item = items[index]
        if (!item) return "";
        return item.replace(/（([^）]+)）/g, (all, part) => this.reply(part)).replace(/\n/g, "");
    }
}

module.exports = { readDictionary, SatoriDic };
