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
$(document).on('change', '#pattern', changePattern);


$(document).on('click', '#clear_textarea', function () {
    $textarea.val('');
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
        msg.innerHTML = '</br>' + formatObject(JSON.parse(msg.innerText), '&emsp;|&emsp;', '</br>');
    }
});


$(document).on('click', '#format_textarea_btn', function () {
    let format = $textarea.attr('format'), text = $textarea.val();
    if (format) {
        $textarea.val(JSON.stringify(JSON.parse(text))); // костыль
        $textarea.removeAttr('format')
    } else {
        $textarea.val(formatObject(JSON.parse(text), '   ', null, true));
        $textarea.attr('format', 'true');
    }
});