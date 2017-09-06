'use strict';

let storage = new Storage('storageTable')
    , storagePattern = new Storage('storagePatternTable')
    , cfg = new Storage('cfgTable')
    , ws
;
const TIMEOUT_RECONNECT = 500
    , $url = $('#url')
    , $reconnect = $("#reconnect")
    , $textarea = $('#textarea')
    , $autoMsg = $('#auto_msg')
    , $pattern = $('#pattern')
    , $patternName = $('#pattern_name')
    , $messageField = $('#message_field')
    , $msgFieldMaxHeight = $('#msg_field_max_height')
    , msgFieldHeightLimit = 2000
;
// '{"HashAuth":"1bcb953ddc497d3dfb81afa61f6d67a0b78aa4c7797329a5e9b6bac57aae32ad"}'
// $url.val("ws://37.46.134.23:8080/ws" );

(function () {
    $url.css('color', 'darkred').val(storage.url);
    $autoMsg.val(storage.autoMsg);

    storagePattern.forEach(appendPattern);

    if (cfg.reconnect) {
        $reconnect.prop('checked', true);
    }
    if (cfg.connectOpen) {
        webSocket();
    }
    if (cfg.textArea) {
        $textarea.val(cfg.textArea)
    } else if (cfg.selectPattern) {
        $pattern.val(cfg.selectPattern);
        changePattern();
    }
    if (cfg.msgFieldHeight) {
        $msgFieldMaxHeight.val(cfg.msgFieldHeight);
        changeSize();
    }
})();


Object.prototype[Symbol.iterator] = function* () {
    let keys = Object.keys(this);
    for (let key = 0; key < keys.length; key++) {
        yield this[keys[key]];
    }
};


function appendPattern(_, name) {
    $pattern.append('<option value="' + name + '">' + name + '</option>');
}


function showMsg(cl, msg, error, errorParse) {
    let el = $('<div class="msg" ><button class="del">X</button> <span class="text_msg" >' + msg + '</span> </div>');
    el.addClass(cl);
    if (error) {
        el.css('background-color', 'darkred').css('color', '#f3fdff');
    } else if (errorParse) {
        el.css('color', '#001f7b')
    } else {
        el.find('.text_msg').before(' <button class="format_msg_btn">{}</button> ')
    }
    $messageField.prepend(el);
}


function webSocket(url) {
    url = $('#protocol').val() + (url || $url.val());
    let errorParse = false;

    ws = new WebSocket(url);
    ws.onerror = function (e) {
        console.error(e)
    };
    ws.onclose = function () {
        console.error("Сокеты упали");
        showMsg('send', 'Сокеты упали', true);
        $url.css('color', 'darkred');
        if ($reconnect.is(":checked") && cfg.connectOpen) {
            cfg.set('connectOpen', true);
            setTimeout(webSocket, TIMEOUT_RECONNECT);
        }
    };
    ws.onmessage = function (msg) {
        errorParse = false;
        console.group('%cMSG IN::::<<<<', 'color: green');
        try {
            console.info(JSON.parse(msg.data));
        } catch (e) {
            errorParse = true;
            console.info(msg.data);
            console.error(e);
        }
        console.groupEnd();
        showMsg('in', msg.data, false, errorParse);
    };
    ws.onopen = function () {
        cfg.set('connectOpen', true);
        ws.send = (function (x) {
            return function (msg) {
                if (ws !== undefined && ws.readyState !== 1) {
                    showMsg('send', 'Не подключенны', true, false);
                    return;
                }
                errorParse = false;
                msg = msg || $textarea.val();
                if (msg === '') {
                    return;
                }
                console.group("%cMSG SEND::::>>>>", 'color: blue');
                console.log(msg);
                try {
                    msg = JSON.parse(msg);
                    console.log(msg);
                    msg = JSON.stringify(msg)
                } catch (e) {
                    errorParse = true;
                    console.error(e);
                }
                console.groupEnd();
                try {
                    x.call(ws, msg);
                    showMsg('send', msg, false, errorParse);
                } catch (e) {
                    showMsg('send', e, true);
                    console.error(e);
                }
            }
        })(ws.send);
        if ($autoMsg.val() !== '') {
            ws.send($autoMsg.val());
        }
        $url.css('color', '#1d6e1d')
    };
}


function changeSize() {
    let size = +($msgFieldMaxHeight.val());
    if (size > msgFieldHeightLimit) {
        $msgFieldMaxHeight.val(500);
        return;
    }
    cfg.set('msgFieldHeight', size);
    $messageField.css('max-height', size);
    $('#_message_field').css('max-height', size - 19);
    $('#message').css('max-height', size + 32);
}


function changePattern() {
    let val = $pattern.val();
    cfg.set('selectPattern', val);
    if (val === 'empty') {
        return false;
    }
    $textarea.val(storagePattern[val]);
    return false;
}

// var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));


function Storage(nameTable) {
    this.__table = {};
    try {
        this.__table = JSON.parse(localStorage.getItem(nameTable)) || {};
    } catch (e) {
        localStorage.setItem(nameTable, JSON.stringify(this.__table));
    }
    for (let _name in this.__table) {
        try {
            this[_name] = JSON.parse(localStorage.getItem(this.__table[_name]));
        } catch (e) {
            console.error(e);
            delete this.__table[_name];
            localStorage.setItem(nameTable, JSON.stringify(this.__table))
        }
    }


    this.set = function (name, val) {
        if (val !== undefined && name !== undefined) {
            this.__table[name] = nameTable + '_' + name;
            localStorage.setItem(this.__table[name], JSON.stringify(val));
            this[name] = val;
            try {
                localStorage.setItem(nameTable, JSON.stringify(this.__table));
            } catch (e) {
                console.error(e);
            }
            return this[name]
        } else {
            console.error('undefined', this, '\n', name, val)
        }
    };
    this.softSet = function (name, val) {
        if (!this[name]) {
            return this.set(name, val);
        }
    };

    this.del = function (name) {
        delete this.__table[name];
        delete this[name];
        localStorage.removeItem(this.__table[name]);
        try {
            localStorage.setItem(nameTable, JSON.stringify(this.__table));
        } catch (e) {
            console.error(e);
        }
    };

    this.forEach = function (fn) {
        for (let i in this.__table) {
            fn(this.__table[i], i)
        }
    };
}


function objectToString(obj, TAB, LINE_BREAK, withoutIndex, tabs) {
    if (typeof obj !== "object" || obj === null) {
        throw new TypeError('Need Object or Array',);
    }


    TAB = TAB || '\t';
    LINE_BREAK = LINE_BREAK || '\n';

    tabs = tabs || [];

    return form(obj, tabs);

    function form(obj, tabs) {
        let _tabs, i, ii
            , result = ''
            , decBeg, decEnd
            , isArray = Array.isArray(obj)
            , keys = Object.keys(obj), len = keys.length
        ;
        if (isArray) {
            decBeg = '[' + LINE_BREAK;
            decEnd = ']';
        } else {
            decBeg = '{' + LINE_BREAK;
            decEnd = '}';
        }

        result += decBeg;


        tabs.push(TAB);
        _tabs = tabs.join('');


        for (i = 0; i < len; i++) {
            ii = obj[keys[i]];

            if (isArray) {
                result += _tabs;
                if (!withoutIndex) {
                    result += keys[i] + ': ';
                }
            } else {
                result += _tabs + '"' + keys[i] + '"' + ': ';
            }

            if (typeof ii === "object" && ii !== null) {
                result += form(ii, tabs); // рекурсия // не забываем переименовать
            } else {
                if (typeof ii === "string") {
                    result += '"' + ii + '"';
                } else {
                    ii = ii === null ? 'null' : ii === undefined ? 'undefined' : ii;
                    result += ii;
                }
            }

            if (i < len - 1) {
                result += ',';
            }
            result += LINE_BREAK;
        }

        tabs.pop();
        result += tabs.join('') + decEnd;

        return result;
    }
}

// console.log(objectToString({sadf: 10, asdfas: [{asdf: 1555}]}));

function testExpression(con) { // for test
    let arr = Array.prototype.slice.call(arguments, 1);
    if (con) {
        console.info('%c\\\\\\\\\\\\', 'color: darkgreen', con, arr.join(' '));
        // console.dir( _con + ' ' + arr.join( ' ' ), { colors: 'green' } );
    } else {
        console.error('/////' + con, arr.join(' '));
    }
}

