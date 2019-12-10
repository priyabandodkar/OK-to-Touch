//OK-to-touch - Experiment 5 - Manisha & Priya/

var capture;
var previousPixels;
var flow;
var w, h;
var step = 8;

var uMotionGraph, vMotionGraph;

let digiFont;
let fpIcon;

function preload() {
  digiFont = loadFont('assets/font.ttf');
  fpIcon = loadImage('assets/fpIcon.png');
}



function setup() {
  w = windowWidth;
  h = windowHeight;
  createCanvas(w, h);
  capture = createCapture({
    audio: false,
    video: {
      width: w,
      height: h
    }
  }, function() {
    console.log('capture ready.')
  });
  capture.elt.setAttribute('playsinline', '');
  capture.hide();
  flow = new FlowCalculator(step);
  uMotionGraph = new Graph(10, -step / 4, +step / 4);
  vMotionGraph = new Graph(10, -step / 4, +step / 4);
}

function copyImage(src, dst) {
  var n = src.length;
  if (!dst || dst.length != n) dst = new src.constructor(n);
  while (n--) dst[n] = src[n];
  return dst;
}

function same(a1, a2, stride, n) {
  for (var i = 0; i < n; i += stride) {
    if (a1[i] != a2[i]) {
      return false;
    }
  }
  return true;
}

function draw() {
  capture.loadPixels();
  if (capture.pixels.length > 0) {
    if (previousPixels) {

      // cheap way to ignore duplicate frames
      if (same(previousPixels, capture.pixels, 4, width)) {
        return;
      }

      flow.calculate(previousPixels, capture.pixels, capture.width, capture.height);
    }
    previousPixels = copyImage(capture.pixels, previousPixels);
    image(capture, 0, 0, w, h);

    if (flow.flow && flow.flow.u != 0 && flow.flow.v != 0) {
      uMotionGraph.addSample(flow.flow.u);
      vMotionGraph.addSample(flow.flow.v);



      filter(INVERT);
      fill(40, 0, 80, 120);
      rect(0, 0, w, h);

      strokeWeight(0);
      fill(0, 250, 200, 120);
      flow.flow.zones.forEach(function(zone) {
        stroke(map(zone.u, -step, +step, 0, 255),
          map(zone.v, -step, +step, 0, 255), 128);

        let a;
        a = zone.u + zone.v;

        ellipse(zone.x, zone.y, a, a);
        //image (fpIcon, zone.x, zone.y, a, a);
        // console.log(a);
        if (a >= 4) {
          textSize(a * 0.9);
          textFont(digiFont);
          text('<user.Data/SENT>', zone.x, zone.y);
        }
      })
    }

    //         noFill();
    //         stroke(255);

    //         // draw left-right motion
    //         uMotionGraph.draw(width, height / 2);
    //         ellipse(0, height / 4, width, height / 4);

    //         // draw up-down motion
    //         translate(0, height / 2);
    //         vMotionGraph.draw(width, height / 2);
    //         ellipse(0, height / 4, width, height / 4);
  }
}