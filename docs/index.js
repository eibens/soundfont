function getUrl(options = {
}) {
    const cdn = options.cdn || "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages";
    const pack = options.pack || "FluidR3_GM";
    const type = options.type || "acoustic_grand_piano";
    const format = options.format || "ogg";
    return `${cdn}/${pack}/${type}-${format}.js`;
}
var isBuffer_1 = function(obj) {
    return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
};
function isBuffer(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
function isSlowBuffer(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0));
}
var cache = {
};
var audioContext = function getContext(options) {
    if (typeof window === "undefined") return null;
    var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    if (typeof options === "number") {
        options = {
            sampleRate: options
        };
    }
    var sampleRate = options && options.sampleRate;
    if (options && options.offline) {
        if (!OfflineContext) return null;
        return new OfflineContext(options.channels || 2, options.length, sampleRate || 44100);
    }
    var ctx = cache[sampleRate];
    if (ctx) return ctx;
    try {
        ctx = new Context(options);
    } catch (err) {
        ctx = new Context();
    }
    cache[ctx.sampleRate] = cache[sampleRate] = ctx;
    return ctx;
};
function createCommonjsModule(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {
        },
        require: function(path, base) {
            return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
function b64ToUint6(nChr) {
    return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ? nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4 : nChr === 43 ? 62 : nChr === 47 ? 63 : 0;
}
function decode(sBase64, nBlocksSize) {
    var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, "");
    var nInLen = sB64Enc.length;
    var nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2;
    var taBytes = new Uint8Array(nOutLen);
    for(var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++){
        nMod4 = nInIdx & 3;
        nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
            for(nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++){
                taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
            }
            nUint24 = 0;
        }
    }
    return taBytes;
}
var base64 = {
    decode
};
var load_1 = createCommonjsModule(function(module) {
    function fromRegex(r) {
        return function(o) {
            return typeof o === "string" && r.test(o);
        };
    }
    function prefix(pre, name) {
        return typeof pre === "string" ? pre + name : typeof pre === "function" ? pre(name) : name;
    }
    function load(source, options, defVal) {
        var loader = isArrayBuffer(source) || isBuffer_1(source) ? decodeBuffer : isAudioFileName(source) ? loadAudioFile : isPromise(source) ? loadPromise : isArray(source) ? loadArrayData : isObject(source) ? loadObjectData : isJsonFileName(source) ? loadJsonFile : isBase64Audio(source) ? loadBase64Audio : isJsFileName(source) ? loadMidiJSFile : null;
        var opts = options || {
        };
        var promise = loader ? loader(source, opts) : defVal ? Promise.resolve(defVal) : Promise.reject("Source not valid (" + source + ")");
        return promise.then(function(data) {
            opts.ready(null, data);
            return data;
        }, function(err) {
            opts.ready(err);
            throw err;
        });
    }
    function isArrayBuffer(o) {
        return o instanceof ArrayBuffer;
    }
    function decodeBuffer(array, options) {
        return options.decode(array);
    }
    var isAudioFileName = fromRegex(/\.(mp3|wav|ogg)(\?.*)?$/i);
    function loadAudioFile(name, options) {
        var url = prefix(options.from, name);
        return load(options.fetch(url, "arraybuffer"), options);
    }
    function isPromise(o) {
        return o && typeof o.then === "function";
    }
    function loadPromise(promise, options) {
        return promise.then(function(value) {
            return load(value, options);
        });
    }
    var isArray = Array.isArray;
    function loadArrayData(array, options) {
        return Promise.all(array.map(function(data) {
            return load(data, options, data);
        }));
    }
    function isObject(o) {
        return o && typeof o === "object";
    }
    function loadObjectData(obj, options) {
        var dest = {
        };
        var promises = Object.keys(obj).map(function(key) {
            if (options.only && options.only.indexOf(key) === -1) return null;
            var value = obj[key];
            return load(value, options, value).then(function(audio) {
                dest[key] = audio;
            });
        });
        return Promise.all(promises).then(function() {
            return dest;
        });
    }
    var isJsonFileName = fromRegex(/\.json(\?.*)?$/i);
    function loadJsonFile(name, options) {
        var url = prefix(options.from, name);
        return load(options.fetch(url, "text").then(JSON.parse), options);
    }
    var isBase64Audio = fromRegex(/^data:audio/);
    function loadBase64Audio(source, options) {
        var i = source.indexOf(",");
        return load(base64.decode(source.slice(i + 1)).buffer, options);
    }
    var isJsFileName = fromRegex(/\.js(\?.*)?$/i);
    function loadMidiJSFile(name, options) {
        var url = prefix(options.from, name);
        return load(options.fetch(url, "text").then(midiJsToJson), options);
    }
    function midiJsToJson(data) {
        var begin = data.indexOf("MIDI.Soundfont.");
        if (begin < 0) throw Error("Invalid MIDI.js Soundfont format");
        begin = data.indexOf("=", begin) + 2;
        var end = data.lastIndexOf(",");
        return JSON.parse(data.slice(begin, end) + "}");
    }
    if (module.exports) module.exports = load;
    if (typeof window !== "undefined") window.loadAudio = load;
});
var browser = function(source, options, cb) {
    if (options instanceof Function) {
        cb = options;
        options = {
        };
    }
    options = options || {
    };
    options.ready = cb || function() {
    };
    var ac = options && options.context ? options.context : audioContext();
    var defaults = {
        decode: getAudioDecoder(ac),
        fetch
    };
    var opts = Object.assign(defaults, options);
    return load_1(source, opts);
};
function getAudioDecoder(ac) {
    return function decode2(buffer) {
        return new Promise(function(resolve, reject) {
            ac.decodeAudioData(buffer, function(data) {
                resolve(data);
            }, function(err) {
                reject(err);
            });
        });
    };
}
function fetch(url, type) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        if (type) req.responseType = type;
        req.open("GET", url);
        req.onload = function() {
            req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
        };
        req.onerror = function() {
            reject(Error("Network Error"));
        };
        req.send();
    });
}
async function load(ac, url) {
    const audio = await browser(url, {
        context: ac
    });
    if (audio instanceof AudioBuffer) {
        throw new Error("url seems to point to a single audio file");
    }
    return audio;
}
new WebSocket("ws://localhost:1234").addEventListener("message", ()=>window.location.reload()
);
const css = `\nhtml {\n  background: #222;\n  font-size: 16px;\n  font-family: "JetBrains Mono", monospace;\n}\n\nbody {\n  display: flex;\n  align-items: stretch;\n  justify-content: stretch;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  margin: 0;\n}\n\n.piano {\n  flex: 1;\n  flex-direction: column;\n  display: flex;\n  align-items: stretch;\n}\n\n.nav {\n  background: #222;\n  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.5);\n  padding: 0.5rem 1rem;\n}\n\n.key-list {\n  flex: 1;\n  display: flex;\n  list-style: none;\n  align-items: stretch;\n  justify-content: stretch;\n  margin: 0;\n  padding: 1rem;\n}\n\n.key-item {\n  flex: 1;\n  display: flex;\n}\n\n.key {\n  flex: 1;\n  display: flex;\n  align-items: flex-end;\n  justify-content: center;\n  margin: 0.25rem;\n  background: linear-gradient(transparent, white);\n  border-radius: 0.5rem;\n  border: none;\n  font-size: 1.5rem;\n  font-family: inherit;\n  color: rgba(0, 0, 0, 0.75);\n  transition: opacity 0.25s;\n  padding-bottom: 1rem;\n}\n\n.piano.loading .key {\n  pointer-events: none;\n  opacity: 0.25;\n}\n\n.nav h1 {\n  color: white;\n  font-size: 1.5rem;\n  font-weight: normal;\n}\n`;
function initPage() {
    const viewport = document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width";
    document.head.appendChild(viewport);
    const styleContent = document.createTextNode(css);
    const style = document.createElement("style");
    style.appendChild(styleContent);
    document.head.appendChild(style);
}
function createGui(options) {
    const piano = document.createElement("div");
    piano.classList.add("piano");
    piano.classList.add("loading");
    const nav = document.createElement("nav");
    nav.classList.add("nav");
    piano.appendChild(nav);
    const title = document.createElement("h1");
    title.appendChild(new Text("🎹 virtual piano"));
    nav.appendChild(title);
    const keyList = document.createElement("ol");
    keyList.classList.add("key-list");
    piano.appendChild(keyList);
    options.keys.forEach((key)=>{
        const item = document.createElement("li");
        item.classList.add("key-item");
        const label = document.createTextNode(key);
        const button = document.createElement("button");
        button.addEventListener("click", ()=>{
            if (!options.play) return;
            options.play(key);
        });
        button.classList.add("key");
        button.appendChild(label);
        item.appendChild(button);
        keyList.appendChild(item);
    });
    return piano;
}
async function createPiano() {
    const ac = new AudioContext();
    const url = getUrl();
    const font = await load(ac, url);
    return (str)=>{
        if (!font[str]) {
            console.error("error: unknown key " + str);
            return;
        }
        const node = ac.createBufferSource();
        node.buffer = font[str];
        node.connect(ac.destination);
        node.start();
    };
}
const state = {
    keys: "C4 D4 E4 F4 G4 A4 B4 C5".split(" ")
};
initPage();
const root = createGui(state);
document.body.appendChild(root);
createPiano().then((play)=>{
    state.play = play;
    root.classList.remove("loading");
});
