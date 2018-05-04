var PROTOTYPES = {
    _Cube: {
        vertexes:{
            A:  [-40, -40, -40],
            B:  [-40, 40, -40],
            C:  [40, 40, -40],
            D:  [40, -40, -40],
            A1: [-40, -40, 40],
            B1: [-40, 40, 40],
            C1: [40, 40, 40],
            D1: [40, -40, 40]
        },
        prototype:[
            ['A', 'B', 'C', 'D'],      // front
            ['A1', 'D1', 'C1', 'B1'],  // back
            ['A', 'A1', 'B1', 'B'],    // left
            ['D', 'C', 'C1', 'D1'],    // right
            ['B', 'B1', 'C1', 'C'],    // top
            ['A', 'D', 'D1', 'A1'],    // bottom
        ],
        cube_centers:[[0, 0, 0]]
    },
    Cube: {
        vertexes:{
            A:  [-39, -39, -39],
            B:  [-39, 39, -39],
            C:  [39, 39, -39],
            D:  [39, -39, -39],
            A1: [-39, -39, 39],
            B1: [-39, 39, 39],
            C1: [39, 39, 39],
            D1: [39, -39, 39]
        },
        prototype:[
            ['A', 'B', 'C', 'D'],      // front
            ['A1', 'D1', 'C1', 'B1'],  // back
            ['A', 'A1', 'B1', 'B'],    // left
            ['D', 'C', 'C1', 'D1'],    // right
            ['B', 'B1', 'C1', 'C'],    // top
            ['A', 'D', 'D1', 'A1'],    // bottom
        ],
        cube_centers:[[0, 0, 0]]
    },
    Stick3: {
        vertexes:{
            A:  [-39, -119, -39],
            B:  [-39, 119, -39],
            C:  [39, 119, -39],
            D:  [39, -119, -39],
            A1: [-39, -119, 39],
            B1: [-39, 119, 39],
            C1: [39, 119, 39],
            D1: [39, -119, 39]
        },
        prototype:[
            ['A', 'B', 'C', 'D'],      // front
            ['A1', 'D1', 'C1', 'B1'],  // back
            ['A', 'A1', 'B1', 'B'],    // left
            ['D', 'C', 'C1', 'D1'],    // right
            ['B', 'B1', 'C1', 'C'],    // top
            ['A', 'D', 'D1', 'A1'],    // bottom
        ],
        cube_centers:[[0, 0, 0], [0, 80, 0], [0, -80, 0]]
    },
    Plate2x2:{
        vertexes:{
            A:  [-119, -119, -39],
            B:  [-119, 39, -39],
            C:  [39, 39, -39],
            D:  [39, -119, -39],
            A1: [-119, -119, 39],
            B1: [-119, 39, 39],
            C1: [39, 39, 39],
            D1: [39, -119, 39],
        },
        prototype:[
            ['A', 'B', 'C', 'D'],      // front
            ['A1', 'D1', 'C1', 'B1'],  // back
            ['A', 'A1', 'B1', 'B'],    // left
            ['D', 'C', 'C1', 'D1'],    // right
            ['B', 'B1', 'C1', 'C'],    // top
            ['A', 'D', 'D1', 'A1'],    // bottom
        ],
        cube_centers:[[0, 0, 0], [-80, 0, 0], [-80, -80, 0], [0, -80, 0]]
    },
    LStick: {
        vertexes:{
            A:  [-39, -119, -39],
            B:  [-39, 119, -39],
            C:  [39, 119, -39],
            D:  [39, -41, -39],
            E:  [119, -41, -39],
            F:  [119, -119, -39],
            A1: [-39, -119, 39],
            B1: [-39, 119, 39],
            C1: [39, 119, 39],
            D1: [39, -41, 39],
            E1: [119, -41, 39],
            F1: [119, -119, 39],

        },
        prototype:[
            ['A', 'B', 'C', 'D', 'E', 'F'],        // front
            ['A1', 'F1', 'E1', 'D1', 'C1', 'B1'],  // back
            ['A', 'A1', 'B1', 'B'],                // left
            ['D', 'C', 'C1', 'D1'],                // right-1
            ['F', 'E', 'E1', 'F1'],                // right-2
            ['B', 'B1', 'C1', 'C'],                // top-1
            ['D', 'D1', 'E1', 'E'],                // top-2
            ['A', 'F', 'F1', 'A1'],                // bottom
        ],
        cube_centers:[[0, 0, 0], [0, 80, 0], [0, -80, 0], [80, -80, 0]]
    },
    S:{
        vertexes:{
            A:  [-39, -119, -39],
            B:  [-39, 39, -39],
            C:  [41, 39, -39],
            D:  [41, 119, -39],
            E:  [119, 119, -39],
            F:  [119, -39, -39],
            G:  [39, -39, -39],
            H:  [39, -119, -39],
            A1: [-39, -119, 39],
            B1: [-39, 39, 39],
            C1: [41, 39, 39],
            D1: [41, 119, 39],
            E1: [119, 119, 39],
            F1: [119, -39, 39],
            G1: [39, -39, 39],
            H1: [39, -119, 39],
        },
        prototype:[
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],          // front
            ['A1', 'H1', 'G1', 'F1', 'E1', 'D1', 'C1', 'B1'],  // back
            ['A', 'A1', 'B1', 'B' ],                           // left-1
            ['C', 'C1', 'D1', 'D' ],                           // left-2
            ['E', 'E1', 'F1', 'F'],                            // right-1
            ['G', 'G1', 'H1', 'H'],                            // right-2
            ['B', 'B1', 'C1', 'C'],                            // top-1
            ['D', 'D1', 'E1', 'E'],                            // top-2
            ['A', 'H', 'H1', 'A1'],                            // bottom-1
            ['G', 'F', 'F1', 'G1']                             // bottom-2
        ],
        cube_centers: [[0, 0, 0], [0, -80, 0], [80, 0, 0], [80, 80, 0]]
    },
    Cross:{
        vertexes:{
            A:  [-119, -39, -39],
            B:  [-119, 39, -39],
            C:  [-39, 39, -39],
            D:  [-39, 119, -39],
            E:  [39, 119, -39],
            F:  [39, 39, -39],
            G:  [119, 39, -39],
            H:  [119, -39, -39],
            I:  [39, -39, -39],
            J:  [39, -119, -39],
            K:  [-39, -119, -39],
            L:  [-39, -39, -39],
            A1: [-119, -39, 39],
            B1: [-119, 39, 39],
            C1: [-39, 39, 39],
            D1: [-39, 119, 39],
            E1: [39, 119, 39],
            F1: [39, 39, 39],
            G1: [119, 39, 39],
            H1: [119, -39, 39],
            I1: [39, -39, 39],
            J1: [39, -119, 39],
            K1: [-39, -119, 39],
            L1: [-39, -39, 39]
        },
        prototype:[
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],              // front
            ['L1', 'K1', 'J1', 'I1', 'H1', 'G1', 'F1', 'E1', 'D1', 'C1', 'B1', 'A1'],  // back
            ['K', 'K1', 'L1', 'L'],                                                    // left-1
            ['A', 'A1', 'B1', 'B'],                                                    // left-2
            ['C', 'C1', 'D1', 'D'],                                                    // left-3
            ['F', 'E', 'E1', 'F1'],                                                     // right-1
            ['G', 'G1', 'H1', 'H'],                                                    // right-2
            ['J', 'I', 'I1', 'J1'],                                                     // right-3
            ['D', 'D1', 'E1', 'E'],                                                    // top-1
            ['B', 'B1', 'C1', 'C'],                                                    // top-2
            ['F', 'F1', 'G1', 'G'],                                                    // top-3
            ['A', 'L', 'L1', 'A1'],                                                   // bottom-1
            ['K', 'J', 'J1', 'K1'],                                                    // bottom-2
            ['I', 'H', 'H1', 'I1'],                                                    // bottom-3
        ],
        cube_centers: [[0, 0, 0], [-80, 0, 0], [80, 0, 0], [0, 80, 0], [0, -80, 0]]
    },
    Stares:{
        vertexes:{
            A:  [-119, -39, -39],
            B:  [-119, 119, -39],
            C:  [-41, 119, -39],
            D:  [-39, 39, -39],
            E:  [39, 39, -39],
            F:  [39, -39, -39],
            G:  [119, -41, -39],
            H:  [119, -119, -39],
            I:  [-39, -119, -39],
            J:  [-39, -39, -39],
            A1: [-119, -39, 39],
            B1: [-119, 119, 39],
            C1: [-41, 119, 39],
            D1: [-39, 39, 39],
            E1: [39, 39, 39],
            F1: [39, -39, 39],
            G1: [119, -41, 39],
            H1: [119, -119, 39],
            I1: [-39, -119, 39],
            J1: [-39, -39, 39],
        },
        prototype:[
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],             // front
            ['J1', 'I1', 'H1', 'G1', 'F1', 'E1', 'D1', 'C1', 'B1', 'A1'],   // back
            ['A', 'A1', 'B1', 'B'],                                         // left-1
            ['I', 'I1', 'J1', 'J'],                                         // left-2
            ['D', 'C', 'C1', 'D1'],                                         // right-1
            ['F', 'E', 'E1', 'F1'],                                         // right-2
            ['H', 'G', 'G1', 'H1'],                                         // right-3
            ['B', 'B1', 'C1', 'C'],                                         // top-1
            ['D', 'D1', 'E1', 'E'],                                         // top-2
            ['F', 'F1', 'G1', 'G'],                                         // top-3
            ['A', 'J', 'J1', 'A1'],                                         // bottom-1
            ['I', 'H', 'H1', 'I1'],                                         // bottom-2
        ],
        cube_centers: [[0,0,0], [-80, 0, 0], [-80, 80, 0], [0, -80, 0], [80, -80, 0]]
    },
    House:{
        vertexes:{
            A:  [-39, -119, -39],
            B:  [-39, 119, -39],
            C:  [39, 119, -39],
            D:  [39, 39, -39],
            E:  [119, 39, -39],
            F:  [119, -119, -39],
            A1: [-39, -119, 39],
            B1: [-39, 119, 39],
            C1: [39, 119, 39],
            D1: [39, 39, 39],
            E1: [119, 39, 39],
            F1: [119, -119, 39],
        },
        prototype:[
            ['A', 'B', 'C', 'D', 'E', 'F'],        // front
            ['A1', 'F1', 'E1', 'D1', 'C1', 'B1'],  // back
            ['A', 'A1', 'B1', 'B'],                // left
            ['D', 'C', 'C1', 'D1'],                // right-1
            ['E', 'E1', 'F1', 'F'],                // right-2
            ['B', 'B1', 'C1', 'C'],                // top-1
            ['D', 'D1', 'E1', 'E'],                // top-2
            ['A', 'F', 'F1', 'A1']                 // bottom
        ],
        cube_centers: [[0,0,0], [0, 80, 0], [0, -80, 0], [80,0,0], [80,-80,0]]
    },
    T:{
        vertexes: {
            A:  [-119, -39, -39],
            B:  [-119, 39, -39],
            C:  [-39, 39, -39],
            D:  [-39, 119, -39],
            E:  [39, 119, -39],
            F:  [39, 39, -39],
            G:  [119, 39, -39],
            H:  [119, -39, -39],
            A1: [-119, -39, 39],
            B1: [-119, 39, 39],
            C1: [-39, 39, 39],
            D1: [-39, 119, 39],
            E1: [39, 119, 39],
            F1: [39, 39, 39],
            G1: [119, 39, 39],
            H1: [119, -39, 39],
        },
        prototype:[
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],            // front
            ['A1', 'H1', 'G1', 'F1', 'E1', 'D1', 'C1', 'B1'],    // back
            ['B', 'B1', 'C1', 'C'],                              // top-1
            ['D', 'D1', 'E1', 'E'],                              // top-2
            ['F', 'F1', 'G1', 'G'],                              // top-3
            ['A', 'H', 'H1', 'A1'],                              // bottom
            ['A', 'A1', 'B1', 'B'],                              // left-1
            ['C', 'C1', 'D1', 'D'],                              // left-2
            ['F', 'E', 'E1', 'F1'],                              // right-1
            ['H', 'G', 'G1', 'H1'],                              // right-2
        ],
        cube_centers: [[0, 0, 0], [-80, 0, 0], [0, 80, 0], [80, 0, 0]]
    },
    T1:{
        vertexes: {
            A:  [-119, -39, -39],
            B:  [-119, 39, -39],
            C:  [-39, 39, -39],
            D:  [-39, 119, -39],
            E:  [39, 119, -39],
            F:  [39, 39, -39],
            G:  [119, 39, -39],
            H:  [119, -39, -39],
            A1: [-119, -39, 39],
            B1: [-119, 39, 39],
            C1: [-39, 39, 39],
            D1: [-39, 119, 39],
            E1: [39, 119, 39],
            F1: [39, 39, 39],
            G1: [119, 39, 39],
            H1: [119, -39, 39],
            C2: [-39, 41, 119],
            D2:  [-39, 119, 119],
            E2:  [39, 119, 119],
            F2:  [39, 41, 119],
        },
        prototype:[
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], // front
            ['F2', 'E2', 'D2', 'C2'],                 // back-1
            ['A1', 'H1', 'G1', 'B1'],                 // back-2
            ['B', 'B1', 'C1', 'C'],                   // top-1
            ['D', 'D2', 'E2', 'E'],                   // top-2
            ['F', 'F1', 'G1', 'G'],                   // top-3
            ['A', 'H', 'H1', 'A1'],                   // bottom-1
            ['F1', 'F2', 'C2', 'C1'],                 // bottom-2
            ['A', 'A1', 'B1', 'B'],                   // left-1
            ['C', 'C2', 'D2', 'D'],                   // left-2
            ['F', 'E', 'E2', 'F2'],                   // right-1
            ['H', 'G', 'G1', 'H1'],                   // right-2
        ],
        cube_centers: [[0, 0, 0], [-80, 0, 0], [0, 80, 0], [80, 0, 0], [0, 80, 80]],
        initial_move: [0, 0, 0, 2 * rotate_step, 0, 0]
    }
}
