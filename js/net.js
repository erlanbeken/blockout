class Net{
    constructor(shit){
        let url       = new URL(document.location.href);
        let game_code = url.searchParams.get("game");

        if (game_code){
            createCookie('game_code', game_code);
            this.socket = io.connect('http://' + document.domain + ':' + document.location.port + document.location.pathname);
            // this.socket.on('connect', function() {
            //     socket.emit('join', {game_code: game_code});
            // });
            this.socket.on('feces_time', function(msg) {
                if (readCookie('user_code') !== msg.user_code){
                    console.log('get some from ', msg.user_alias || msg.user_code);
                    shit(msg.n);
                }
            });
            this.socket.on('game_over', function(msg) {
                if (readCookie('user_code') !== msg.user_code){
                    console.log('user ' + (msg.user_alias || msg.user_code) + ' is out');
                }
            });
        }
    }
    level_removed(n){
        if (this.socket){
            this.socket.emit('level_removed', {'levels': n});
        }
    }
    game_over(){
        if (this.socket)
            this.socket.emit('game_over');
    }
}