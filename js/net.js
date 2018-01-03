class Net{
    constructor(field){
        this.field = field;

        if (this.data()['game_code']){
            this.socket = io.connect(window.api_url);

            this.socket.on('connect', (msg) => {
                this.socket.emit('join', this.data())
            });

            this.socket.on('feces_time', (msg) => {
                console.log('Feces time!');
                if (readCookie('user_code') !== msg.user_code){
                    console.log('get some from ', msg.user_alias || msg.user_code);
                    field.shit(msg.n);
                }
            });
            this.socket.on('game_over', function(msg) {
                if (readCookie('user_code') !== msg.user_code){
                    console.log('user ' + (msg.user_alias || msg.user_code) + ' is out');
                }
            });
        }
    }
    data(){
        let user_code = readCookie("user_code");
        let game_code = readCookie("game_code");

        return {
            'user_code': user_code,
            'game_code': game_code,
        }
    }
    pieceDropped(){
        // console.log('piece_dropped');
        this.socket && this.socket.emit('piece_dropped', Object.assign({}, this.data(), {'map': this.field.pack_map()}))
    }
    levelRemoved(n){
        // console.log('level_removed');
        this.socket && this.socket.emit('level_removed',Object.assign({}, this.data(), {'levels': n, 'map': this.field.pack_map()}))
    }
    gameOver(){
        // console.log('game_over');
        this.socket && this.socket.emit('game_over', this.data())
    }
}