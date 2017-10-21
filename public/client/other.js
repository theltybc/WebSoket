'use strict';

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