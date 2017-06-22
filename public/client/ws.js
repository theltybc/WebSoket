function Storage(nameTable) {
    var _name
        , _cookieCfg = {'path': '/', 'expires': new Date('2999-12-30T23:59:59.980Z')};

    this.table = {};
    try {
        this.table = JSON.parse($.cookie(nameTable));
    } catch (e) {
        $.cookie(nameTable, JSON.stringify(this.table), _cookieCfg);
    }
    this.set = function (name, val) {
        if (val !== undefined) {
            this.table[name] = nameTable + '_' + name;
            $.cookie(this.table[name], JSON.stringify(val), _cookieCfg);
            this[name] = val;
            try {
                $.cookie(nameTable, JSON.stringify(this.table), _cookieCfg);
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
            $.cookie(nameTable, JSON.stringify(this.table), _cookieCfg);
        } catch (e) {
            console.error(e);
        }
    };

    this.softSet = function (name, val) {
        if (!this[name]) {
            return this.set(name, val);
        }
    };

    for (_name in this.table) {
        try {
            this[_name] = JSON.parse($.cookie(this.table[_name]));
        } catch (e) {
            console.error(e);
            delete this.table[_name];
            $.cookie(nameTable, JSON.stringify(this.table), _cookieCfg)
        }
    }
}

var storage = new Storage('storageTable')
    , storagePattern = new Storage('storagePatternTable')
    , cfg = new Storage('cfgTable')
    , ws
    , TIMEOUT_RECONNECT = 500
    , $url = $('#url').css('color', 'darkred').val(storage.url)
    , $reconnect = $("#reconnect")
    , $textarea = $('#textarea')
    , $autoMsg = $('#auto_msg').val(storage.auto_msg)
    , delBTN = '<button class="del">X</button>'
    , $pattern = $('#pattern')
    , $patternName = $('#pattern_name')
    , $message_field = $('#message_field')
    , $msgFieldMaxHeight = $('#msg_field_max_height')
    , msgFieldHeightLimit = 2000
;
// '{"HashAuth":"1bcb953ddc497d3dfb81afa61f6d67a0b78aa4c7797329a5e9b6bac57aae32ad"}'
// $url.val("ws://37.46.134.23:8080/ws" );

(function () {
    var i, el = '';
    for (i in storagePattern.table) if (i !== 'set') {
        el += makePattern(i)
    }

    if (cfg.reconnect) {
        $reconnect.prop('checked', true);
        if (cfg.connectOpen) {
            webSocket();
        }
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
function makePattern(i) {
    $pattern.append('<option value="' + i + '">' + i + '</option>');
}

function webSocket(url) {
    url = $('#protocol').val() + (url || $url.val());

    ws = new WebSocket(url);
    ws.onerror = function (e) {
        console.error(e)
    };
    ws.onclose = function () {
        console.error("Сокеты упали");
        $message_field.prepend('<div style="background-color: darkred; color: #f3fdff" class="msg send" >' + delBTN + 'Сокеты упали</div>');
        $url.css('color', 'darkred');
        if ($reconnect.is(":checked") && cfg.connectOpen) {
            cfg.set('connectOpen', true);
            setTimeout(webSocket, TIMEOUT_RECONNECT);
        }
    };
    ws.onmessage = function (msg) {
        console.group('%cMSG IN::::<<<<', 'color: green');
        console.info(msg);
        try {
            console.log(JSON.parse(msg.data));
        } catch (e) {
            console.error(e);
        }
        console.groupEnd();
        $message_field.prepend('<div class="msg in" >' + delBTN + msg.data + '</div>')
    };
    ws.onopen = function () {
        cfg.set('connectOpen', true);
        ws.send = (function (x) {
            return function (msg) {
                msg = msg || $textarea.val();
                console.group("%cMSG SEND::::>>>>", 'color: blue');
                console.log(msg);
                try {
                    console.log(JSON.parse(msg));
                } catch (e) {
                    console.error(e);
                }
                console.groupEnd();
                try {
                    x.apply(ws, arguments);
                    $message_field.prepend('<div class="msg send" >' + delBTN + msg + '</div>')
                } catch (e) {
                    $message_field.prepend('<div style="background-color: darkred; color: #f3fdff" class="msg send" >' + delBTN + e + '</div>')
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
    var name = $patternName.val(), text = $textarea.val(), notExist = !storagePattern[name];
    if (name === '' || text === '') {
        return;
    }
    storagePattern.set(name, text);
    if (notExist) {
        makePattern(name)
    }
    $patternName.val('');
    $pattern.val(name)
});
$(document).on('click', '#delete_pattern', function () {
    var sel = $pattern.find('option:checked'), name = $pattern.val();
    if (name === 'empty') {
        return;
    }
    storagePattern.del(name);
    sel.remove();
});
function changePattern() {
    var val = $pattern.val();
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
    $message_field.empty();
});
function changeSize() {
    var size = +($msgFieldMaxHeight.val());
    if (size > msgFieldHeightLimit) {
        $msgFieldMaxHeight.val(500);
        return;
    }
    cfg.set('msgFieldHeight', size);
    $message_field.css('max-height', size);
    $('#_message_field').css('max-height', size - 19);
    $('#message').css('max-height', size + 32);
}
$(document).on('change', '#msg_field_max_height', changeSize);
$(document).on('click', '.del', function () {
    $(this.parentNode).remove();
});


$(document).on('click', '#auto_msg_save', function () {
    storage.set('auto_msg', $autoMsg.val())
});

$(document).on('change', '#reconnect', function () {
    cfg.set('reconnect', $(this).is(":checked"));
});