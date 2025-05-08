(function main(){
    window.api_url = window.location.origin + '/';

    const move_step         = 80;
    const frames_per_move   = 7;
    const checks_per_move   = 3;
    const prototype_indexes = Object.keys(PROTOTYPES).filter(function(i){ return i[0] != '_';});

    window.canvas = document.getElementById("myCanvas");
    window.ctx    = canvas.getContext("2d", {willReadFrequently: true});

    let piece;
    let field = new Field(canvas);
    let ui    = new UI(field);
    let net;

    ui.when_done(() => {
        // net = new Net(field)
        field.draw();
        new_piece();
        run();
    });

    const speed_levels      = [0, 300, 280, 250, 220, 200, 180, 150, 125, 100, 80, 50, 30];
    let pieces_down         = 0;
    let current_speed_level = 1;
    let counter             = 0;

    // move = [dx, dy, dz, angle_x, angle_y, angle_z]
    let moves_queue = [];
    let immediate_moves_queue = [];
    let timeout;
    let on_pause = false;
    let game_over = false;
    let drop = false;
    let score = 0;

    const keys = {
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
        32: () => { drop = true },
        27: toggle_pause,
        80: toggle_pause
    }

    function toggle_pause(){
        on_pause = !on_pause;
        if (on_pause){
            ui.showMessage('Paused');
            piece.clear(ctx);
            clearTimeout(timeout);
        }else{
            ui.hideMessage();
            piece.draw(ctx);
            run();
        }
    }

    function new_piece(){
        let indexes = prototype_indexes;
        let index   = indexes[Math.floor(Math.random() * indexes.length)];

        piece = new Piece(index);
        field.set_piece(piece);
        piece.draw(ctx);
    }

    function run(){
        try{
            if (immediate_moves_queue.length){
                let m = immediate_moves_queue.shift();
                piece.clear(ctx);
                piece.move(m);
                piece.draw(ctx);

                throw 'Execute intermediate move'
            }

            if (!field.move_legal_cube_centers(piece, [0, 0, move_step])){
                if (drop && moves_queue.length){
                    do_move(true);
                    throw 'Execute last move';
                }

                drop        = false;
                moves_queue = [];

                field.add_piece(piece);

                // net.pieceDropped();

                // check if any levels have been removed
                let levels_removed = field.check_levels_removed();

                if (levels_removed){
                    score += levels_removed ** levels_removed;

                    // net.levelRemoved(levels_removed);
                    ui.updateScore(score);

                    field.draw_grid();

                }
                field.draw();

                // check if the game is over
                if (!field.check_space(Piece.start_position)){
                    toggle_pause();

                    ui.gameOver();
                    // net.gameOver();

                    game_over = true;
                    return
                }
                pieces_down++;

                // check if it's time to hike the level up
                if (pieces_down % 20 == 0 && current_speed_level < speed_levels.length - 1){
                    ui.updateSpeedLevel(++current_speed_level)
                }
                new_piece();
            }

            if (moves_queue.length && !drop) do_move();

            if (drop || ++counter >= speed_levels[current_speed_level]){
                counter = 0;
                // move the piece down
                immediate_moves_queue.push([0, 0, move_step, 0, 0, 0]);
            }
        }catch(e){
            // console.log(e);
        }

        timeout = setTimeout(run, 1);
    }

    function do_move(debug=false){
        const value    = moves_queue.shift()
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

    document.onkeydown = function(e){
        if (e.target == document.body && e.keyCode in keys){

            if (game_over) return;

            let value = keys[e.keyCode];

            if (typeof value === 'function') return value();
            if (on_pause) return;

            moves_queue.push(value)
        }
    }

    document.getElementById("help_close").addEventListener('click', () => {
        document.getElementById("help_info").style.display = "none";
    });
    document.getElementById("help").addEventListener('click', () => {
        document.getElementById("help_info").style.display = "block";
        if (!on_pause) toggle_pause();
    })
})();
