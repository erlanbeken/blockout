(function main(){
    const frames_per_move = 5;
    const checks_per_move = 3;

    window.canvas = document.getElementById("myCanvas");
    window.ctx    = canvas.getContext("2d");

    window.center_x     = canvas.width / 2;
    window.center_y     = canvas.height / 2;

    var piece;
    var field = new Field(canvas);
    var net   = new Net(shit);
    var ui    = new UI(net);

    var speed_levels    = [0, 300, 280, 250, 220, 200, 180, 150, 125, 100, 80, 50];
    var current_speed_level = 1;
    var counter  = 0;

    // move = [dx, dy, dz, angle_x, angle_y, angle_z]
    var moves_queue = [];
    var immediate_moves_queue = [];
    var timeout, timer;
    var on_pause = false;
    var game_over = false;
    var drop = false;
    var wait_flag = false;
    var score = 0;

    var keys = {
        //move
        76 : [move_step, 0, 0, 0, 0, 0],                    // right
        39 : [move_step, 0, 0, 0, 0, 0],                    // right
        74: [-1 * move_step, 0, 0, 0, 0, 0],                // left
        37: [-1 * move_step, 0, 0, 0, 0, 0],                // left
        73: [0, move_step, 0, 0, 0, 0],                     // up
        38: [0, move_step, 0, 0, 0, 0],                     // up
        75 : [0, -1 * move_step, 0, 0, 0, 0],               // down
        40 : [0, -1 * move_step, 0, 0, 0, 0],               // down
        188 : [0, -1 * move_step, 0, 0, 0, 0],              // alt down
        85: [-1 * move_step, move_step, 0, 0, 0, 0],        // left+up
        79: [move_step, move_step, 0, 0, 0, 0],             // right+up
        77 : [-1 * move_step, -1 * move_step, 0, 0, 0, 0],  // left+down
        190 : [move_step, -1 * move_step, 0, 0, 0, 0],      // right+down
        // rotate
        65: [0, 0, 0, rotate_step, 0, 0],
        81: [0, 0, 0, -1 * rotate_step, 0, 0],
        83: [0, 0, 0, 0, rotate_step, 0],
        87: [0, 0, 0, 0, -1 * rotate_step, 0],
        69: [0, 0, 0, 0, 0, rotate_step],
        68: [0, 0, 0, 0, 0, -1 * rotate_step],
        32: function(){ drop = true;},
        27: toggle_pause
    }
    function toggle_pause(){
        if (game_over) return;

        on_pause = !on_pause;
        if (on_pause){
            piece.clear(ctx);
            clearTimeout(timeout);
            clearInterval(timer);
        }else{
            piece.draw(ctx);
            run();
        }
    }

    function run(){
        moves_queue_handler();
        timer    = setInterval(function(){
            if (speed_levels.length - 1 > current_speed_level){
                ui.updateSpeedLevel(++current_speed_level)
            }
        }, 60000);
    }

    function new_piece(){
        let indexes = Object.keys(PROTOTYPES);
        let index   = indexes[Math.floor(Math.random() * indexes.length)];

        // index = 'LStick'
        piece = new Piece(index);
        piece.draw(ctx);
    }

    function shit(n=1){
        while (true){
            let x = Math.floor(Math.random() * field.map[0][0].length);
            let y = Math.floor(Math.random() * field.map[0].length);

            for (let z = 0; z < field.map.length; z++){
                if (field.map[z][y][x] == 0){
                    field.map[z][y][x] = 2;
                    piece.clear(ctx);
                    field.draw();
                    piece.draw(ctx);
                    if (!--n) return;
                    break;
                }
            }
        }
    }

    function moves_queue_handler(){
        try{
            if (immediate_moves_queue.length){
                let m = immediate_moves_queue.shift();
                piece.clear(ctx);
                piece.move(m);
                piece.draw(ctx);

                if (m[2] == 0) throw 'Execute intermediate move'
            }

            if (!wait_flag && !field.move_legal_cube_centers(piece, [0, 0, move_step * 2])){
                drop      = false;
                wait_flag = true;
                counter   = speed_levels[current_speed_level] - 5;
            }

            if (!field.move_legal_cube_centers(piece, [0, 0, move_step])){

                drop        = false;
                wait_flag   = false;
                moves_queue = [];

                field.add_piece(piece);

                // check if any levels have been removed
                let levels_removed = field.check();

                if (levels_removed){
                    net.level_removed(levels_removed);
                    score += levels_removed ** levels_removed;
                    field.draw_grid();
                    ui.updateScore(score);
                }
                field.draw();

                // check if the game is over
                if (!field.check_space(Piece.start_position)){
                    toggle_pause();
                    ui.gameOver(field);
                    game_over = true;
                    return
                }

                new_piece();
            }

            if (moves_queue.length){
                let value      = moves_queue.shift();
                let move_legal = field.move_legal(piece.clone().move(value));

                if (!move_legal){
                    // if trying to move up and right, but can't move right
                    // try moving up
                    if (value.filter(Boolean).length == 2){
                        let new_value = value.slice(0); // a fast way of cloning the array
                        new_value[field.check_flag] = 0 // field.check_flag: 0 if can't move left/right, 1 if can't move up/down
                        moves_queue.unshift(new_value);
                    }
                    throw 'Move is illegal'
                }

                let m = value.map(function(i){ return i / checks_per_move; });
                let tmp_piece = piece.clone();

                // check intermediate positions
                for (let i = 0; i < checks_per_move; i++){
                    if (!field.move_legal(tmp_piece.move(m))){
                        // if trying to rotate and the wall's in the way
                        // check if the final position is legal
                        // make the move if it is
                        if (field.check_flag !== false) break
                        throw 'Intermediate move is illegal'
                    }
                }

                m = value.map(function(i){ return i / frames_per_move; });
                for (let i = 0; i < frames_per_move; i++){
                    immediate_moves_queue.push(m);
                }
            }

            if (drop || ++counter >= speed_levels[current_speed_level]){
                counter = 0;
                // move the piece down
                immediate_moves_queue.push([0, 0, move_step, 0, 0, 0]);
            }
        }catch(e){
            // console.log(e);
        }

        timeout = setTimeout(moves_queue_handler, 1);
    }

    document.onkeydown = function(e){
        if (e.target == document.body && e.keyCode in keys){
            let value = keys[e.keyCode];

            if (typeof value === 'function') return value();
            if (on_pause) return;

            moves_queue.push(value)
        }
    }

    field.draw();
    new_piece();
    run();
})();