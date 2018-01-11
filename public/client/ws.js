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

    var testMsg = '{"Tables":[{"Name":"Session","TypeParameter":"","Values":[{"SessionHash":"2c534fe2a342b02895fc9229deefe8b265d8462cecad2ba90443f787a6b35f14","UserHash":"8618a75bdb746c07cb2b5a8eb8e16f56720da8c305afc03c28bc042cdb07c63f","SurName":"Тестовый","FirstName":"Кассир","SecondName":"1","VPNNumber":"1008","VPNPassword":"ab8aa3315436874e9ab050c39b5a1f54","Language":"ru","RoleHash":"dcfb7d4d43418b73fba6be0d51ce988e1a84dacda379e3ba3e1f3bef932d4c92c074009d331af45875dabc4fcf6e161925b93d1e67336f13540dfe4af063b556","RoleName":"Кассир","OrganizationHash":"8d530b253ab52715733e6d92caa19cbcf5edfb43f63311970d3ed5af7265763302a2a29843231753616c4f8b64a8d1602800ea2303caca35477ff6bc09d15231","OrganizationName":"Курган;5 микрорайон;33","Rights":"[{\\"ID\\":26,\\"HashRole\\":\\"dcfb7d4d43418b73fba6be0d51ce988e1a84dacda379e3ba3e1f3bef932d4c92c074009d331af45875dabc4fcf6e161925b93d1e67336f13540dfe4af063b556\\",\\"Service\\":\\"Склад\\",\\"ServiceName\\":\\"Sklad\\",\\"Flag\\":4},{\\"ID\\":27,\\"HashRole\\":\\"dcfb7d4d43418b73fba6be0d51ce988e1a84dacda379e3ba3e1f3bef932d4c92c074009d331af45875dabc4fcf6e161925b93d1e67336f13540dfe4af063b556\\",\\"Service\\":\\"Админка\\",\\"ServiceName\\":\\"Admin\\",\\"Flag\\":4},{\\"ID\\":28,\\"HashRole\\":\\"dcfb7d4d43418b73fba6be0d51ce988e1a84dacda379e3ba3e1f3bef932d4c92c074009d331af45875dabc4fcf6e161925b93d1e67336f13540dfe4af063b556\\",\\"Service\\":\\"Вики\\",\\"ServiceName\\":\\"Wiki\\",\\"Flag\\":4}]","SkladName":["GlavSklad","SkladGogol","SkladMicroFive","SkladProletar"],"Stage":0,"SessionData":"","Begin":"2018-01-11T09:16:05.115544Z","End":"0001-01-01T00:00:00Z"}],"Limit":0,"Offset":0}],"Query":"SystemUpdate","Error":{"Code":0,"Type":"","Description":""},"ID_msg":"","IgnoreLoading":false}';

    ws.onmessage({data: testMsg});
    ws.onmessage({data: testMsg});
    ws.onmessage({data: testMsg});
}

function onSend(send, msg = $requestText.val()) {
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
