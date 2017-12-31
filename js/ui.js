class UI{
    constructor(field, start_game){
        // this.updateTopScore(parseInt(readCookie('top_score', 0), 10));
        // if (!checkCookie('user_id')) createCookie('user_id', guid());

        this.field = field;

        $('#start_game').addEventListener('click', function(){

            let new_game_id = guid();
            let path = location.path || '';

            document.location.href = '?game=' + new_game_id;
        });

        $('#user_alias').addEventListener('change', () => {
            this.updateUserInfo({alias: $('#user_alias').value})
        });

        let url       = new URL(document.location.href);
        let game_code = url.searchParams.get("game");

        if (game_code) createCookie('game_code', game_code, 10000);
        else eraseCookie('game_code');

        getJSON(
            window.api_url + 'api/get_user_info', {},
            (data) => {
                if (data.alias){
                    $('#user_alias').value = data.alias;
                }
                createCookie('user_code', data.user_code, 10000);
                this.user_code = data.user_code;

                this.updateTopScore(data.top_score, false);

                if (data.map){
                    this.field.unpack_map(data.map);
                }
                start_game();
            },
            (error) => {
                this.showError(error)
            }
        )
    }

    updateSpeedLevel(value){
        $('#speed_value').innerHTML = value;
    }

    updateScore(value){
        $('#score_value').innerHTML = value;

        if (value > this.top_score){
            this.updateTopScore(value);
        }
    }

    updateTopScore(value, update_server=true){
        this.top_score = value;
        $('#top_score_value').innerHTML = value;

        if (update_server){
            this.updateUserInfo({top_score: value})
        }
    }

    updateUserInfo(data){
        getJSON(window.api_url + 'api/update_user_info', data, null, (msg) => { this.showError(msg) })
    }

    gameOver(field){
        let z = field.depth / field.step;

        let handler = function(){
            field.map[z] = field.empty_level();
            field.draw_grid();
            field.draw();
            if (--z >= 0){
                setTimeout(handler, 50);
            }else{
                $('.message span').innerHTML = 'Game Over';
                $('.message').style.display = 'block';
            }
        }
        handler();
    }

    showError(error){
        $('.message span').innerHTML = window.error;
        $('.message').style.display = 'block';
        $('.message').className += ' error';
    }
}