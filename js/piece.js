class Piece{
    static saved_rect_width = 350;
    static start_position   = [40, 40, 120];

    constructor(prototype_index, start_position){
        start_position = start_position || Piece.start_position;

        [this.x, this.y, this.z] = start_position;

        let p = PROTOTYPES[prototype_index];

        this.prototype_index = prototype_index;
        this.color           = 'white';
        this.cube_centers    = JSON.parse(JSON.stringify(p.cube_centers));
        this.obj             = p.prototype.map(function(facet){
            return facet.map(function(vertex){ return p.vertexes[vertex];})
        });

        if ('initial_move' in p){
            this.move(p.initial_move);
        }
    }

    clear(ctx){
        if (this.saved_rect){
            let d = Piece.saved_rect_width/2;
            ctx.putImageData(this.saved_rect, this.last_position.x - d, this.last_position.y - d);
        }
    }

    draw(ctx, hide_facets = false, fill_facets = false, fill_color='#4162f4'){
        let d = Piece.saved_rect_width/2;
        this.last_position = convert2d(this.x, this.y, this.z);
        this.saved_rect    = ctx.getImageData(
            this.last_position.x - d,
            this.last_position.y - d,
            Piece.saved_rect_width,
            Piece.saved_rect_width
        );


        for (let i = 0; i < this.obj.length; i++){

            let facet = this.obj[i];

            if (hide_facets){
                let vector1 = [facet[1][0] - facet[0][0], facet[1][1] - facet[0][1], facet[1][2] - facet[0][2]];
                let vector2 = [facet[2][0] - facet[0][0], facet[2][1] - facet[0][1], facet[2][2] - facet[0][2]];

                let vx = vector1[1] * vector2[2] - vector1[2] * vector2[1];
                let vy = vector1[2] * vector2[0] - vector1[0] * vector2[2];
                let vz = vector1[0] * vector2[1] - vector1[1] * vector2[0];

                let this_x = this.x + facet[0][0];
                let this_y = this.y + facet[0][1]
                let this_z = this.z + facet[0][2] + FOCAL_LENGTH;

                // let p1, p2;
                // ctx.beginPath();
                // ctx.strokeStyle = 'red';
                // p1 = convert2d(vx + this.x, vy + this.y, vz + this.z);
                // p2 = convert2d(this.x, this.y, this.z);
                // ctx.moveTo(p1.x, p1.y);
                // ctx.lineTo(p2.x, p2.y)
                // ctx.stroke();

                // ctx.beginPath();
                // ctx.strokeStyle = 'blue';
                // p1 = convert2d(this.x, this.y, this.z);
                // p2 = convert2d(this.x * 2, this.y * 2, this.z * 2 + FOCAL_LENGTH);
                // ctx.moveTo(p1.x, p1.y);
                // ctx.lineTo(p2.x, p2.y)
                // ctx.stroke();

                let mul = (this_x * vx) + (this_y * vy) + (this_z * vz);

                // console.log(i, mul);
                if (mul >= 0) continue;
            }

            ctx.beginPath();
            ctx.strokeStyle = this.color;

            let origin = convert2d(facet[0][0] + this.x, facet[0][1] + this.y, facet[0][2] + this.z);
            ctx.moveTo(origin.x, origin.y);

            for (let j = 1; j < facet.length; j++){
                let xy = convert2d(facet[j][0] + this.x, facet[j][1] + this.y, facet[j][2] + this.z);
                ctx.lineTo(xy.x, xy.y);
                ctx.stroke();
            }
            ctx.closePath();
            ctx.stroke();

            if (fill_facets){
                ctx.fillStyle = fill_color;
                ctx.fill();
            }
        }
    }

    move(m){
        if (!m){
            console.trace()
            return
        }
        this.x += m[0];
        this.y += m[1];
        this.z += m[2];

        let matrix = false;

        if (m[3]){
            matrix = [
                [1, 0, 0],
                [0, Math.cos(m[3]), -1 * Math.sin(m[3])],
                [0, Math.sin(m[3]), Math.cos(m[3])]
            ];
        }else if (m[4]){
            matrix = [
                [Math.cos(m[4]), 0, Math.sin(m[4])],
                [0, 1, 0],
                [-1 * Math.sin(m[4]), 0, Math.cos(m[4])]
            ];
        }else if (m[5]){
            matrix = [
                [Math.cos(m[5]), -1 * Math.sin(m[5]), 0],
                [Math.sin(m[5]), Math.cos(m[5]), 0],
                [0, 0, 1]
            ]
        }

        if (matrix){
            for (let i = 0; i < this.obj.length; i++){
                for (let j = 0; j < this.obj[i].length; j++){
                    this.obj[i][j] = [
                        roundTo((this.obj[i][j][0] * matrix[0][0]) + (this.obj[i][j][1] * matrix[0][1]) + (this.obj[i][j][2] * matrix[0][2])),
                        roundTo((this.obj[i][j][0] * matrix[1][0]) + (this.obj[i][j][1] * matrix[1][1]) + (this.obj[i][j][2] * matrix[1][2])),
                        roundTo((this.obj[i][j][0] * matrix[2][0]) + (this.obj[i][j][1] * matrix[2][1]) + (this.obj[i][j][2] * matrix[2][2]))
                    ];
                }
            }

            for (let i in this.cube_centers){
                let v = this.cube_centers[i];
                this.cube_centers[i] = [
                    roundTo((v[0] * matrix[0][0]) + (v[1] * matrix[0][1]) + (v[2] * matrix[0][2]), 1),
                    roundTo((v[0] * matrix[1][0]) + (v[1] * matrix[1][1]) + (v[2] * matrix[1][2]), 1),
                    roundTo((v[0] * matrix[2][0]) + (v[1] * matrix[2][1]) + (v[2] * matrix[2][2]), 1)
                ];
            }
        }
        return this;
    }

    clone(){
        let new_piece = new Piece(this.prototype_index, [this.x, this.y, this.z]);

        new_piece.obj   = this.obj.map(function(face){ return face.map(function(vertex){ return vertex.slice(0); }) })

        return new_piece;
    }
}