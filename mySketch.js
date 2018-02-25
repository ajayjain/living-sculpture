/*
I'm watching you!

I took a series of images (7x3) to map the mouse's position so it seems like I'm looking at the mouse.

Controls:
	- Move the mouse around.

Authors:
    Ajay Jain
    Based on a sketch by Jason Labbe
*/

const initialPointCount = 200;
const jitter = 15;

let up_imgs = [];
let straight_imgs = [];
let down_imgs = [];

let diagram; // Cache for voronoi?
let boundingBox;

let points;

class Points {
    constructor(width, height, count) {
        this.width = width;
        this.height = height;
        this.points = [];
        this.count = count;

        this.generatePoints();
    }

    generatePoints() {
        this.points.splice(0, this.points.length);
        
        //for (let x = 0; x < this.width; x += 25) {
        //    for (let y = 0; y < this.height; y += 25) {
        //        this.points.push(new p5.Vector(x, y));
        //    }
        //}

        for (let i = 0; i < this.count; i++) {
            let x = Math.floor(random(this.width));
            let y = Math.floor(random(this.height));
            this.points.push(new p5.Vector(x, y));
        }
    }

    addPoint(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.points.push(new p5.Vector(x, y));
        }
    }

    addJitteredPoint(x, y) {
        // NOTE: if this jitters a point off screen, it won't be added
        let dx = Math.floor(random(jitter));
        let dy = Math.floor(random(jitter));
        this.addPoint(x + dx, y + dy);
    }
}

function preload() {
	// Preload all the images.
	for (let i = 1; i < 8; i++) {
		up_imgs.push(loadImage("".concat("up_", i, ".jpg")));
		straight_imgs.push(loadImage("".concat("straight_", i, ".jpg")));
		down_imgs.push(loadImage("".concat("down_", i, ".jpg")));

        	}
}

function setup() {
	// Make the canvas size the same as the images to map easier.
	createCanvas(up_imgs[0].width, up_imgs[0].height);

    boundingBox = {
        xl: 1,
        xr: up_imgs[0].width - 1,
        yt: 1,
        yb: up_imgs[0].height - 1
    }

    points = new Points(up_imgs[0].width, up_imgs[0].height, initialPointCount);

    //for (let i = 1; i < 8; i++) {
    //    image(up_imgs[i-1], 0, 0);
    //    up_imgs[i-1].loadPixels();

    //    image(straight_imgs[i-1], 0, 0);
    //    straight_imgs[i-1].loadPixels();

    //    image(down_imgs[i-1], 0, 0);
    //    down_imgs[i-1].loadPixels();
    //}
}

function selectImage() {
	// Map the mouse x's position to look left/right.
	let xIndex = int(map(mouseX, 0, width, 0, up_imgs.length));
	
	// Map the mouse's y position to look up/down.
	if (mouseY < height/4) {
		return up_imgs[xIndex];
	} else if (mouseY > height-height/4) {
		return down_imgs[xIndex];
	} else {
		return straight_imgs[xIndex];
	}
}

function draw() {
	background(0);

    let targetImage = selectImage();
    targetImage.loadPixels();
    
    //loadPixels();
    let transform = [];
    for (const point of points.points) {
        let index = Math.floor((point.y * targetImage.width + point.x) * 4);

        let r = targetImage.pixels[index];
        let g = targetImage.pixels[index + 1];
        let b = targetImage.pixels[index + 2];
        let a = targetImage.pixels[index + 3];

        //pixels[index] = r;
        //pixels[index + 1] = g;
        //pixels[index + 2] = b;
        //pixels[index + 3] = a;
        
        transform.push({ x: point.x, y: point.y, r: r, g: g, b: b, a: a });
    }
    //updatePixels();


    points.addJitteredPoint(mouseX, mouseY);
    

    voronoi = new Voronoi();
    voronoi.recycle(diagram);

    diagram = voronoi.compute(transform, boundingBox);

    for (let i = 0; i < diagram.cells.length; i++) {
        // Skip invalid cells.
        if (!diagram.cells[i].halfedges.length) {
          continue;
        }
        
        // Collect the cell's data.
        let siteColor = color(diagram.cells[i].site.r, diagram.cells[i].site.g, diagram.cells[i].site.b, diagram.cells[i].site.a);

        if (true) {
          // It's near a hotspot's center so draw it with voronoi.
          fill(siteColor);
          stroke(0, 25);
          strokeWeight(0.5);
          
          beginShape();
          for (let j = 0; j < diagram.cells[i].halfedges.length; j++) {
            let v = diagram.cells[i].halfedges[j].getStartpoint();
            vertex(v.x, v.y);
          }
          endShape(CLOSE);
        } else {
          // It's near a hotspot's edges so draw it with points.
          noFill();
          stroke(siteColor);
          strokeWeight(10);
          point(diagram.cells[i].site.x, diagram.cells[i].site.y);
        }
    }

    //image(targetImage, 0, 0);
    
}
