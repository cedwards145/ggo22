const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");

const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;

var socket = io();

function update() { }

function draw() {
    context.globalAlpha = 1;
    context.fillStyle = "#763B36";
    context.fillRect(0, 0, WIDTH, HEIGHT);
}

function tick() {
    update();
    draw();
    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
