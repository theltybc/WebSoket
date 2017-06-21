// var storage = new (function ( nameTable ) {
//     var i, _storageTable = {}
//     ;
//     try {
//         _storageTable = JSON.parse( localStorage.getItem( nameTable ) );
//     } catch ( e ) {
//         console.error( e );
//         localStorage.setItem( 'storageTable', JSON.stringify( _storageTable ) );
//     }
//     this.set = function ( name, val ) {
//         if ( name === 'set' ) return;
//
//         if ( val === undefined ) {
//             delete _storageTable[name];
//             delete this[name];
//             localStorage.removeItem( name );
//         } else {
//             localStorage.setItem( name, JSON.stringify( val ) );
//             _storageTable[name] = '';
//             this[name] = val;
//         }
//
//         try {
//             localStorage.setItem( 'storageTable', JSON.stringify( _storageTable ) );
//         } catch ( e ) {
//             console.error( e );
//         }
//     };
//
//     for ( i in _storageTable ) {
//         this[i] = JSON.parse( localStorage.getItem( i ) );
//     }
// })( 'storageTable' );

var storage = new (function ( nameTable ) {
    var i, _storageTable = {}
        , _cookieCfg = { 'path': '/', 'expires': new Date( '2999-12-30T23:59:59.980Z' ) }
    ;

    try {
        _storageTable = JSON.parse( $.cookie( nameTable ) );
    } catch ( e ) {
        console.error( e );
        $.cookie( 'storageTable', JSON.stringify( _storageTable ), _cookieCfg );
    }
    this.set = function ( name, val ) {
        if ( name === 'set' ) return;

        if ( val === undefined ) {
            delete _storageTable[name];
            delete this[name];
            $.removeCookie( name );
        } else {
            $.cookie( name, JSON.stringify( val ), _cookieCfg );
            _storageTable[name] = '';
            this[name] = val;
        }

        try {
            $.cookie( 'storageTable', JSON.stringify( _storageTable ), _cookieCfg );
        } catch ( e ) {
            console.error( e );
        }
    };

    for ( i in _storageTable ) {
        this[i] = JSON.parse( $.cookie( i ) );
    }
})( 'storageTable' );

var ws
    , CLOSE = false
    , TIMEOUT_RECONNECT = 500
    , $url = $( '#url' ).css( 'color', 'darkred' ).val( storage.url )
    , $reconnect = $( "#reconnect" )
    , $textarea = $( '#textarea' )
    , $autoMsg = $( '#auto_msg' ).val( storage.auto_msg )
    , delBTN = '<button class="del">X</button>'
    , pattern = storage.pattern
    , $pattern = $( '#pattern' )
    , $patternName = $( '#pattern_name' )
    , $message_field = $( '#message_field' )
;
// '{"HashAuth":"1bcb953ddc497d3dfb81afa61f6d67a0b78aa4c7797329a5e9b6bac57aae32ad"}'
// $url.val("ws://37.46.134.23:8080/ws" );

(function () {
    var i, el = '';
    for ( i in pattern ) {
        el += makePattern( i )
    }

    if ( storage.reconnect ) {
        $reconnect.prop( 'checked', true )
    }

    // if ( )
})();
function makePattern( i ) {
    $pattern.append( '<option value="' + i + '">' + i + '</option>' );
}

function webSocket( url ) {
    CLOSE = false;

    url = $( '#protocol' ).val() + (url || $url.val());

    ws = new WebSocket( url );
    ws.onerror = function ( e ) {

    };
    ws.onclose = function () {
        $message_field.prepend( '<div style="background-color: darkred; color: #f3fdff" class="msg send" >' + delBTN + 'Сокеты упали</div>' );
        $url.css( 'color', 'darkred' );
        if ( $reconnect.is( ":checked" ) && !CLOSE ) {
            setTimeout( webSocket, TIMEOUT_RECONNECT );
        }
    };
    ws.onmessage = function ( msg ) {
        console.log( 'msg', msg );
        $message_field.prepend( '<div class="msg in" >' + delBTN + msg.data + '</div>' )
    };
    ws.onopen = function () {
        ws.send = (function ( x ) {
            return function () {
                console.log( 'SEND', arguments[0] );
                x.apply( ws, arguments )
            }
        })( ws.send );
        if ( $autoMsg.val() !== '' ) {
            send( $autoMsg.val() );
        }
        $url.css( 'color', '#1d6e1d' )
    };
}

function send( msg ) {
    msg = msg || $textarea.val();
    try {
        ws.send( msg );
        $message_field.prepend( '<div class="msg send" >' + delBTN + msg + '</div>' )
    } catch ( e ) {
        $message_field.prepend( '<div style="background-color: darkred; color: #f3fdff" class="msg send" >' + delBTN + e + '</div>' )
    }
}


$( document ).on( 'click', '#connect', function () {
    webSocket();
} );
$( document ).on( 'keyup', '#url', function ( ev ) {
    if ( ev.keyCode === 13 ) {
        webSocket();
    }
} );
$( document ).on( 'click', '#disconnect', function () {
    CLOSE = true;
    ws.close();
    storage.set( 'disconnect', true, true )
} );
$( document ).on( 'click', '#save_url', function () {
    storage.set( 'url', $url.val() )
} );


$( document ).on( 'keyup', '#textarea', function ( ev ) {
    if ( ev.keyCode === 13 ) {
        send();
    }
} );
$( document ).on( 'click', '#send', function () {
    send();
} );


$( document ).on( 'click', '#save_pattern', function () {
    if ( typeof pattern !== "object" ) {
        pattern = {};
    }
    var name = $patternName.val(), text = $textarea.val(), notExist = !pattern[name];
    if ( name === '' || text === '' ) {
        return;
    }
    pattern[name] = text;
    storage.set( 'pattern', pattern );
    if ( notExist ) {
        makePattern( name )
    }
    $patternName.val( '' );
    $pattern.val( name )
} );
$( document ).on( 'click', '#delete_pattern', function () {
    var sel = $pattern.find( 'option:checked' ), name = $pattern.val();
    if ( name === 'empty' ) {
        return;
    }
    delete pattern[name];
    sel.remove();
    storage.set( 'pattern', pattern );
} );
$( document ).on( 'change', '#pattern', function () {
    if ( this.value === 'empty' ) {
        return false;
    }
    $textarea.val( pattern[this.value] );
    return false;
} );


$( document ).on( 'click', '#clear_textarea', function () {
    $textarea.val( '' );
} );


$( document ).on( 'click', '#clear_msg', function () {
    $message_field.empty();
} );
$( document ).on( 'change', '#height', function () {
    $message_field.css( 'max-height', this.value );
    $( '#_message_field' ).css( 'max-height', +this.value - 19 );
} );
$( document ).on( 'click', '.del', function () {
    $( this.parentNode ).remove();
} );


$( document ).on( 'click', '#auto_msg_save', function () {
    storage.set( 'auto_msg', $autoMsg.val() )
} );

$( document ).on( 'change', '#reconnect', function () {
    if ( $( this ).is( ":checked" ) ) {
        storage.set( 'reconnect', true );
    } else {
        storage.set( 'reconnect', false )
    }
} );