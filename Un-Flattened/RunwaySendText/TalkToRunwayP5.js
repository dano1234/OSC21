var runway_img;
let runway_canvas;
function setup() {
  runway_canvas = createCanvas(512, 512);

  runway_canvas.style('display', 'none');// hide this because I want to use in three.js
  console.log("setup runway");
}

function talkToRunway(query) {
  const path = 'http://localhost:8000/query';
  console.log("askit");
  const data = {
    "caption": query
  };
  httpPost(path, 'json', data, gotImage, gotError);
}

function gotError(error) {
  console.error(error);
}

function gotImage(data) {
  console.log("Got Image Data", data.result);
  let runway_img = createImg(data.result,
    function () {
      let graphics = createGraphics(width, height);
      graphics.image(runway_img, 0, 0);
      placeImage(graphics.elt);
    });

  // runway_img.hide();
}
