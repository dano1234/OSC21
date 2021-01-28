let radius = 0;

function setup(){
    createCanvas(400,400);
}


function draw(){
    ellipse(width/2,height/2, radius,radius);
    radius++;
}