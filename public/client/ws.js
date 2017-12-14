'use strict';


function webSocket(url) {
    url = $('#protocol').val() + (url || $url.val());

    ws = new WebSocket(url);
    ws.onerror = function (e) {
        console.error(e);
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
        let errorParse = false;
        console.group('%cMSG IN::::<<<<', 'color: green');
        console.info(msg.data);
        try {
            console.info(JSON.parse(msg.data));
        } catch (e) {
            errorParse = true;
            console.error(e);
        }
        console.groupEnd();
        showMsg('in', msg.data, false, errorParse);
    };
    ws.onopen = onOpen;
}


function onOpen() {
    cfg.set('connectOpen', true);
    ws.send = onSend.bind(null, ws.send);
    if ($autoMsg.val() !== '') {
        ws.send($autoMsg.val());
    }
    $url.css('color', '#1d6e1d');
}

function onSend(send, msg = $textarea.val()) {
    if (ws !== undefined && ws.readyState !== 1) {
        showMsg('send', 'Не подключенны', true, false);
        return;
    }
    if (msg === '') {
        return;
    }
    let errorParse = false;

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
        send.call(ws, msg);
        showMsg('send', msg, false, errorParse);
    } catch (e) {
        showMsg('send', e, true);
        console.error(e);
    }
}
