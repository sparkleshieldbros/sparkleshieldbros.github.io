export const chapterNames={
 bubble:['Seed and Vine','The Broken Bridge','The Waterwheel','The Wind Gate'],
 cash:['Street and Rooftops','Lantern Alley','Clockwork Finale','Echo Factory'],
 ninja:['The Hidden Shortcut','The Switchback','Shadow Fox’s Labyrinth'],
 echo:['The Lantern Falls','The Ripple Road','The Guardian Awakens']
};
export const levels={bubble:[
 {crate:[220,455],goal:[390,455],walls:[],tip:'Bubble the seed pod into the planter, then cross the vine bridge.'},
 {crate:[220,455],goal:[552,482],walls:[],tip:'Lift the loose panel to the glowing brackets. Release it with BUBBLE, then cross.'},
 {crate:[280,455],goal:[460,455],walls:[],tip:'Lift the branch up and out of the blue channel to restart the waterwheel.'},
 {crate:[220,455],goal:[540,355],walls:[],tip:'Guide the sail into the blue updraft and release it. Try the violet current for a hidden garden.'}
 ],cash:[{targets:[[535,420],[790,332]],walls:[[250,452,105,14],[407,402,105,14],[570,352,155,14],[782,352,104,14]]},{targets:[[450,330],[650,265],[830,350]],walls:[[320,455,50,85],[580,455,50,85]]},{targets:[[390,280],[565,330],[740,250],[855,375]],walls:[[350,455,48,85],[520,455,48,85],[710,455,48,85]]},{walls:[]}],ninja:[{grid:['###############','#S....#......E#','#.##.#.#.###..#','#....#.#...#..#','###.##.###.#.##','#....K....#...#','#.#########.#.#','#...........#.#','###############']},{grid:['###############','#S....#......E#','###.#.#.#######','#...#...#.....#','#.#####.#.###.#','#.#...K.#...#.#','#.#.#######.#.#','#...........#.#','###############']},{grid:['###############','#S..#........E#','#.#.#.#######.#','#.#...#.....#.#','#.#####.###.#.#','#.....#K..#...#','#####.###.###.#','#.............#','###############']}],echo:[
 {name:'The Lantern Falls',crate:[230,455],goal:[490,430],targets:[[490,430]],walls:[]},
 {name:'The Ripple Road',crate:[255,455],goal:[530,430],targets:[[530,430]],walls:[]},
 {name:'The Guardian Awakens',crate:[285,455],goal:[570,430],targets:[[570,430]],walls:[]}
 ]};
