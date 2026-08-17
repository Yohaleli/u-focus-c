// A small test to see what happens
let BACKGROUNDS = [0,1,2,3,4,5,6,7,8,9];
let bgIndex = 0;
let setBgIndex = (fn) => { bgIndex = fn(bgIndex); };
setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
console.log(bgIndex);
