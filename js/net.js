class Net{
    constructor(field){
        this.field = field;

        if (this.data()['game_code']){

            this.socket = new WebSocket("ws://localhost:5000/ws");
            this.socket.onopen = () => {
                this.emit('connect', this.data())
            };

            this.socket.onclose = (e) => {
                console.log('socket closed:', e)
            }

            this.socket.onmessage = (e) => {
                // console.log('socket message:', e)
                var [msg, param] = e.data.split(':')
                switch (msg) {
                    case 'PIECE_DROPPED':
                        console.log('PD!')
                    break
                    case 'LEVEL_REMOVED':
                        console.log('LR:', parseInt(param, 10))
                        this.field.shit(parseInt(param, 10));
                    break
                    case 'GAME_OVER':
                        console.log('GO:', param)
                }
            }
        }
    }

    emit(method, data){
        if (!this.socket) return

        this.socket.send(JSON.stringify({
            'data'  : data,
            'method': method
        }));
    }

    data = () => { return {
        'user_code': readCookie("user_code"),
        'game_code': readCookie("game_code")}
    }

    pieceDropped = ()  => this.emit('piece_dropped', Object.assign({}, this.data(), {'map': this.field.pack_map()}));
    levelRemoved = (n) => this.emit('level_removed', Object.assign({}, this.data(), {'levels': n ** n, 'map': this.field.pack_map()}))
    gameOver     = ()  => this.emit('game_over', this.data())
}
