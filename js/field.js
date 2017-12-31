class Field{
    static color = '#777';
    static level_colors = ['#4162f4', '#f4be41', '#f46541', '#a3d616', '#841dde', '#2dcfe8'];
    static shit_color = '#b56a2d';

    constructor(canvas, width=480, height=480, depth=1200, grid_step=80){
        this.canvas = canvas;
        this.ctx    = this.canvas.getContext("2d");

        this.width  = width;
        this.height = height;
        this.depth  = depth;

        this.step   = grid_step;

        this.center_x = this.width/2;
        this.center_y = this.height/2;

        this.x_min = -1 * this.center_x;
        this.x_max  = this.center_x;
        this.y_min = -1 * this.center_y;
        this.y_max  = this.center_y;

        this.map = [];
        this.pieces = [];

        this.bit_mask = [1, 2, 4, 8, 16, 32];

        for (let z = 0; z < this.depth / this.step + 2; z++){
            this.map.push(this.empty_level());
        }

        this.draw_grid();
    }

    set_piece(piece){ this.piece = piece; }

    empty_level(){
        let new_level = [];
        for (let y = 0; y < this.height / this.step; y++){
            new_level[y] = Array(this.width / this.step).fill(0);
        }
        return new_level;
    }

    add_piece(piece, map_value=1){
        let local_x, local_y, local_z;

        piece.cube_centers.forEach((v) => {
            [local_x, local_y, local_z] = this.transform_coordinates(
                v[0] + piece.x,
                v[1] + piece.y,
                v[2] + piece.z
            );

            this.map[local_z][local_y][local_x] = map_value;
        })
    }

    draw_grid(){
        this.canvas.width = this.canvas.width;
        this.ctx.beginPath();
        this.ctx.strokeStyle = Field.color;

        // the grid
        for (let z = 0; z <= this.depth; z += this.step){
            let lt = convert2d(this.x_min, this.y_max, z);
            let rt = convert2d(this.x_max, this.y_max, z);
            let rb = convert2d(this.x_max, this.y_min, z);
            let lb = convert2d(this.x_min, this.y_min, z);

            this.ctx.moveTo(lt.x, lt.y);
            this.ctx.lineTo(rt.x, rt.y); this.ctx.stroke();
            this.ctx.lineTo(rb.x, rb.y); this.ctx.stroke();
            this.ctx.lineTo(lb.x, lb.y); this.ctx.stroke();
            this.ctx.lineTo(lt.x, lt.y); this.ctx.stroke();
        }
        for (let x = this.x_min; x <= this.x_max; x += this.step){
            let p1 = convert2d(x, this.y_max, 0);
            let p2 = convert2d(x, this.y_max, this.depth);
            let p3 = convert2d(x, this.y_min, this.depth);
            let p4 = convert2d(x, this.y_min, 0);

            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y); this.ctx.stroke();
            this.ctx.lineTo(p3.x, p3.y); this.ctx.stroke();
            this.ctx.lineTo(p4.x, p4.y); this.ctx.stroke();
        }
        for (let y = this.y_min; y <= this.y_max; y += this.step){
            let p1 = convert2d(this.x_min, y, 0);
            let p2 = convert2d(this.x_min, y, this.depth);
            let p3 = convert2d(this.x_max, y, this.depth);
            let p4 = convert2d(this.x_max, y, 0);

            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y); this.ctx.stroke();
            this.ctx.lineTo(p3.x, p3.y); this.ctx.stroke();
            this.ctx.lineTo(p4.x, p4.y); this.ctx.stroke();
        }
    }

    draw(color='#eee'){
        var put_cube = (x,y,z) => {
            if (!this.map[z][y][x]) return;
            let cube       = new Piece('_Cube', this.transform_indexes(x, y, z))
            let fill_color = (this.map[z][y][x] == 1) ? Field.level_colors[z % Field.level_colors.length] : Field.shit_color;

            cube.color = color;
            cube.draw(this.ctx, true, true, fill_color)
        }

        var put_row = (y,z) => {
            let width = this.map[z][y].length;
            for (let x = 0; x < width/2; x++){
                put_cube(x,y,z);

                // if width is odd, don't put the cube in the middle twice
                if (x == width - x - 1) continue;

                put_cube(width - x - 1, y, z);
            }
        }

        // draw pieces
        for (let z in this.map){
            let height = this.map[z].length;
            for (let y = 0; y < height/2; y++){
                put_row(y, z)

                // if height is odd, don't put the one in the middle twice
                if (y == height - y - 1) continue;

                put_row(height - y - 1, z)
            }
        }
    }

    transform_indexes(local_x, local_y, local_z){
        // transform indexes into 3d coordinates
        let x = (local_x * this.step) - this.center_x + this.step/2;
        let y = this.center_y - (local_y * this.step) - this.step/2;
        let z = this.depth - (local_z * this.step) - this.step/2;

        return [x, y, z];
    }

    transform_coordinates(x,y,z){
        // transform 3d coordinates into this.map indexes
        let local_x = (x + this.center_x == 0) ? 0 : Math.ceil((x + this.center_x) / this.step) - 1;
        let local_y = (this.center_y - y == 0) ? 0 : Math.ceil((this.center_y - y) / this.step) - 1;
        let local_z = (this.depth - z == 0) ? 0 : Math.ceil((this.depth - z) / this.step) - 1;

        return [local_x, local_y, local_z]
    }

    check_space([x, y, z], debug=false){
        // returns TRUE if space is available
        let local_x, local_y, local_z;

        [local_x, local_y, local_z] = this.transform_coordinates(x,y,z);

        this.check_flag = false;

        if (local_x < 0 || local_x >= this.map[0][0].length){
            this.check_flag = 0; // can not move hirizontally
            return false;
        }

        if (local_y < 0 || local_y >= this.map[0].length){
            this.check_flag = 1; // can not move vertically
            return false;
        }

        if (local_z < 0 || local_z >= this.map.length){
            this.check_flag = 2; // can not move down
            return false;
        }

        // if (this.map[local_z][local_y][local_x] == 1){
            // console.log(piece);
            // console.log(debug);
            // console.log(local_x, local_y, local_z);
            // pause();
            // let p = convert2d(x,y,z);
            // this.ctx.fillStyle = 'red';
            // this.ctx.fillRect( p.x, p.y, 2, 2 );
            // throw 'Here';
            // console.log(x,y,z);
            // console.log(local_x, local_y, local_z);
        // }

        return this.map[local_z][local_y][local_x] == 0;
    }

    move_legal(piece, d=[0,0,0]){
        let obj = piece.obj;

        let x = piece.x + d[0];
        let y = piece.y + d[1];
        let z = piece.z + d[2];

        for (let i in obj){
            for (let j in obj[i]){
                let v = obj[i][j];

                if (!this.check_space(
                    [Math.round(v[0]) + x, Math.round(v[1]) + y, Math.round(v[2]) + z],
                    [v, d, 'facet #' + i, 'vertex #' + j]
                )) return false;
            }
        }
        return true;
    }

    move_legal_cube_centers(piece, d=[0,0,0]){
        let cube_centers = piece.cube_centers;

        let x = piece.x + d[0];
        let y = piece.y + d[1];
        let z = piece.z + d[2];

        for (let i in cube_centers){
            let v = cube_centers[i];

            if (!this.check_space([Math.round(v[0]) + x, Math.round(v[1]) + y, Math.round(v[2]) + z]))
                return false;
        }
        return true;
    }

    check_levels_removed(){
        let levels_removed = 0;
        let target         = this.map[0].length * this.map[0][0].length;

        let map = this.map;
        this.map = this.map.filter(function(rows){
            let non_zeroes = rows.reduce(function(a, b) { return a.concat(b) }).filter(Boolean)

            if (non_zeroes.length == target){
                levels_removed++;
                return false;
            }
            return true;
        });

        for (let i = 0; i < levels_removed; i++) this.map.push(this.empty_level());

        return levels_removed;
    }

    shit(n=1){
        while (true){
            let x = Math.floor(Math.random() * this.map[0][0].length);
            let y = Math.floor(Math.random() * this.map[0].length);

            for (let z = 0; z < this.map.length; z++){
                if (this.map[z][y][x] == 0){
                    this.map[z][y][x] = 2;
                    this.piece.clear(ctx);
                    this.draw();
                    this.piece.draw(ctx);
                    if (!--n) return;
                    break;
                }
            }
        }
    }

    pack_map(){
        let ret = [];
        for (let z = 0; z < this.map.length; z++){
            let level = [];
            for (let y = 0; y < this.map[z].length; y++){
                let row = 0;
                for (let x = 0; x < this.map[z][y].length; x++){
                    let bit = this.map[z][y][x] ? this.bit_mask[x] : 0;
                    row = row | bit;
                }
                level.push(row);
            }
            ret.push(level.join(','));
        }
        return ret.join('|');
    }

    unpack_map(data){
        let map = this.map;
        let bit_mask = this.bit_mask;

        data.split('|').forEach(function(layer, z){
            layer.split(',').forEach(function(row, y){
                let row_int = parseInt(row, 10);
                for (let x = 0; x < map[z][y].length; x++){
                    map[z][y][x] = +((bit_mask[x] & row_int) > 0)
                }
            })
        })
        this.draw();
   }
}