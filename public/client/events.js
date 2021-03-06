'use strict';


window.addEventListener('beforeunload', function () {
    cfg.set('textArea', $requestText.val());
}, false);


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
    storage.set('url', $url.val());
    storage.set('protocol', $protocol.val());
});


$(document).on('click', '#send', function () {
    if (ws !== undefined) {
        ws.send();
    }
});


$(document).on('click', '#save_pattern', function () {
    let name = $patternName.val(), text = $requestText.val(), notExist = !storagePattern[name];
    if (name === '' || text === '') {
        return;
    }
    storagePattern.set(name, text);
    if (notExist) {
        appendPattern('', name)
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
$(document).on('change', '#pattern', changePattern);


$(document).on('click', '#clear_textarea', function () {
    $requestText.val('');
});


$(document).on('click', '#clear_msg', function () {
    $messageField.empty();
});


$(document).on('change', '#msg_field_max_height', changeSize);
$(document).on('click', '.del', function () {
    $(this.parentNode).remove();
});


$(document).on('click', '#auto_msg_save', function () {
    storage.set('autoMsg', $autoMsg.val())
});
$(document).on('keyup', '#auto_msg', function (ev) {
    if (ev.keyCode === 13) {
        let msg = $autoMsg.val();
        if (msg !== '') {
            ws.send(msg);
        }
    }
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
        msg.innerHTML = '</br>' + objectToString(JSON.parse(msg.innerText), '&emsp;|&emsp;', '</br>');
    }
});


$(document).on('click', '#format_textarea_btn', function () {
    let text = $requestText.val()
        , nonFormatted = JSON.stringify(JSON.parse(text))
    ;
    if (nonFormatted.length < text.length) {
        $requestText.val(nonFormatted);
    } else {
        $requestText.val(objectToString(JSON.parse(text), '   ', null, true));
    }
});
