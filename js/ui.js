class UI{
    constructor(net){
        this.net = net;

        // this.updateTopScore(parseInt(readCookie('top_score', 0), 10));
        // if (!checkCookie('user_id')) createCookie('user_id', guid());

        this.user_id = readCookie('user_code');

        $('#start_game').addEventListener('click', function(){
            let new_game_id = guid();
            let path = location.path || '';

            document.location.href = 'http://' + document.domain + ':' + location.port + path + '/?game=' + new_game_id;
        });

        $('#user_alias').addEventListener('change', function(){
            this.updateUserAlias(data.alias);
        })

        fetch('/get_user_info',  {credentials: "same-origin"})
        .then((data) => {
            data.json().then((data) => {
                if (data.alias){
                    $('#user_alias').value = data.alias;
                }
                this.updateTopScore(data.top_score, false);
            })
        })
    }

    // updateUserAlias(value, server_request=true){
    //     console.log(value);

    //     if (server_request){
    //         fetch('/set_user_alias?alias=' + value, {credentials: "same-origin"})
    //     }
    // }

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
            fetch('/update_top_score',  {
                credentials: "same-origin",
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({value: value})
            })
        }
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
                $('.game_over').style.display = 'block';
            }
        }
        handler();
    }
}