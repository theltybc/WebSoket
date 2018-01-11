'use strict';


let storage = new Storage('storageTable')
    , storagePattern = new Storage('storagePatternTable')
    , cfg = new Storage('cfgTable')
    , ws
;
const TIMEOUT_RECONNECT = 500
    , $url = $('#url')
    , $protocol = $('#protocol')
    , $reconnect = $("#reconnect")
    , $requestText = $('#request_text')
    , $autoMsg = $('#auto_msg')
    , $pattern = $('#pattern')
    , $patternName = $('#pattern_name')
    , $messageField = $('#message_field')
    , $msgFieldMaxHeight = $('#msg_field_max_height')
    , msgFieldHeightLimit = 2000
;
// '{"HashAuth":"1bcb953ddc497d3dfb81afa61f6d67a0b78aa4c7797329a5e9b6bac57aae32ad"}'
// $url.val("ws://37.46.134.23:8080/ws" );

function init() {
    if (storage.url) {
        $url.val(storage.url);
    }
    $url.css('color', 'darkred');
    if (storage.protocol) {
        $protocol.val(storage.protocol);
    }
    $autoMsg.val(storage.autoMsg);

    storagePattern.forEach(appendPattern);

    if (cfg.reconnect) {
        $reconnect.prop('checked', true);
    }
    if (cfg.connectOpen) {
        webSocket();
    }
    if (cfg.textArea) {
        $requestText.val(cfg.textArea)
    } else if (cfg.selectPattern) {
        $pattern.val(cfg.selectPattern);
        changePattern();
    }
    if (cfg.msgFieldHeight) {
        $msgFieldMaxHeight.val(cfg.msgFieldHeight);
        changeSize();
    }
}


init();






