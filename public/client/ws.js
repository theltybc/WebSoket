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

    for (let i in storagePattern.table) {
        appendPattern(i)
    }

    if (cfg.reconnect) {
        $reconnect.prop('checked', true);
    }
    if (cfg.connectOpen) {
        webSocket();
    }
    if (cfg.selectPattern) {
        $pattern.val(cfg.selectPattern);
        changePattern();
    }
    if (cfg.msgFieldHeight) {
        $msgFieldMaxHeight.val(cfg.msgFieldHeight);
        changeSize();
    }
})();


function appendPattern(name) {
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
                if (ws.readyState !== 1) {
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
                    console.log(JSON.parse(msg));
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


$(document).on('click', '#connect', function () {
    if (ws) {
        ws.close();
    }
    webSocket();
});
$(document).on('keyup', '#url', function (ev) {
    if (ev.keyCode === 13) {
        webSocket();
    }
});
$(document).on('click', '#disconnect', function () {
    cfg.set('connectOpen', false);
    ws.close();
});
$(document).on('click', '#save_url', function () {
    storage.set('url', $url.val())
});


$(document).on('keyup', '#textarea', function (ev) {
    if (ev.keyCode === 13) {
        ws.send();
    }
});
$(document).on('click', '#send', function () {
    ws.send();
});


$(document).on('click', '#save_pattern', function () {
    let name = $patternName.val(), text = $textarea.val(), notExist = !storagePattern[name];
    if (name === '' || text === '') {
        return;
    }
    storagePattern.set(name, text);
    if (notExist) {
        appendPattern(name)
    }
    $patternName.val('');
    $pattern.val(name)
});
$(document).on('click', '#delete_pattern', function () {
    let sel = $pattern.find('option:checked'), name = $pattern.val();
    if (name === 'empty') {
        return;
    }
    storagePattern.del(name);
    sel.remove();
});
function changePattern() {
    let val = $pattern.val();
    cfg.set('selectPattern', val);
    if (val === 'empty') {
        return false;
    }
    $textarea.val(storagePattern[val]);
    return false;
}
$(document).on('change', '#pattern', changePattern);


$(document).on('click', '#clear_textarea', function () {
    $textarea.val('');
});


$(document).on('click', '#clear_msg', function () {
    $messageField.empty();
});
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
$(document).on('change', '#msg_field_max_height', changeSize);
$(document).on('click', '.del', function () {
    $(this.parentNode).remove();
});


$(document).on('click', '#auto_msg_save', function () {
    storage.set('autoMsg', $autoMsg.val())
});


$(document).on('change', '#reconnect', function () {
    cfg.set('reconnect', $(this).is(":checked"));
});


$(document).on('click', '.format_msg_btn', function () {
    let msg = this.parentNode.querySelector('.text_msg');
    if (msg.dataset.text_msg) {
        msg.innerHTML = msg.dataset.text_msg;
        delete msg.dataset.text_msg;
    } else {
        msg.dataset.text_msg = msg.innerText;
        msg.innerHTML = '</br>' + formatObject(JSON.parse(msg.innerText), '&emsp;&emsp;', '</br>');
    }
});

// var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));


function Storage(nameTable) {
    this.table = {};
    try {
        this.table = JSON.parse(localStorage.getItem(nameTable)) || {};
    } catch (e) {
        localStorage.setItem(nameTable, JSON.stringify(this.table));
    }
    this.set = function (name, val) {
        if (val !== undefined) {
            this.table[name] = nameTable + '_' + name;
            localStorage.setItem(this.table[name], JSON.stringify(val));
            this[name] = val;
            try {
                localStorage.setItem(nameTable, JSON.stringify(this.table));
            } catch (e) {
                console.error(e);
            }
            return this[name]
        }
    };
    this.del = function (name) {
        delete this.table[name];
        delete this[name];
        $.removeCookie(this.table[name]);
        try {
            localStorage.setItem(nameTable, JSON.stringify(this.table));
        } catch (e) {
            console.error(e);
        }
    };

    this.softSet = function (name, val) {
        if (!this[name]) {
            return this.set(name, val);
        }
    };

    for (let _name in this.table) {
        try {
            this[_name] = JSON.parse(localStorage.getItem(this.table[_name]));
        } catch (e) {
            console.error(e);
            delete this.table[_name];
            localStorage.setItem(nameTable, JSON.stringify(this.table))
        }
    }
}


function formatObject(obj, TAB, LINE_BREAK, tabs) {
    let result = [], decBeg, decEnd, _tabs, i, ii;
    TAB = TAB || '\t';
    LINE_BREAK = LINE_BREAK || '\n';
    if (tabs === undefined) {
        tabs = [];
    }

    if (typeof obj !== "object" || obj === null) {
        return;
    }

    if (Array.isArray(obj)) {
        decBeg = '[' + LINE_BREAK;
        decEnd = '],' + LINE_BREAK;
    } else {
        decBeg = '{' + LINE_BREAK;
        decEnd = '},' + LINE_BREAK;
    }

    result.push(decBeg);

    tabs.push(TAB);
    for (i in obj) {
        ii = obj[i];

        _tabs = tabs.join('');

        if (Array.isArray(obj)) {
            result.push(_tabs, i, ': ');
        } else {
            result.push(_tabs, '"', i, '"', ': ');
        }

        if (typeof ii === "object" && ii !== null) {
            result.push(formatObject(ii, TAB, LINE_BREAK, tabs)); // рекурсия
        } else {
            if (typeof ii === "string") {
                result.push('"', ii, '"', ',', LINE_BREAK);
            } else {
                ii = ii === null ? 'null' : ii === undefined ? 'undefined' : ii;
                result.push(ii, ',', LINE_BREAK);
            }
        }
    }
    tabs.pop();
    result.push(tabs.join(''), decEnd);

    return result.join('');
}


function testExpression(con) { // for test
    let arr = Array.prototype.slice.call(arguments, 1);
    if (con) {
        console.info('%c\\\\\\\\\\\\', 'color: darkgreen', con, arr.join(' '));
        // console.dir( _con + ' ' + arr.join( ' ' ), { colors: 'green' } );
    } else {
        console.error('/////' + con, arr.join(' '));
    }
}


// setTimeout(function () {
//     let x = {
//         "ID_msg": "x10009",
//         "Tables": [{
//             "Name": "ClientInfo",
//             "TypeParameter": "Insert",
//             "Values": [{
//                 "Table": "ClientInfo",
//                 "TypeParameter": "Phone",
//                 "Query": "Create"
//             }, {
//                 "Phone": "79097777777",
//                 "Name": "TEST"
//             }]
//         }],
//         "Query": "Services",
//         "Error": null,
//         error: undefined,
//         erro22r: 13213213
//     };
//
//     console.log(res(x));
// }, 1000);


