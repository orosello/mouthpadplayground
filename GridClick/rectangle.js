class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.collide = false;
    }

    drawRect() {
        if (this.collide) {
            fill(255, 255, 0);
        } else {
            fill(255);
        }
        rect(this.x, this.y, this.w, this.h);
    }

    collided(cx, cy, cr) {
        let closeX = constrain(cx, this.x, this.x + this.w);
        let closeY = constrain(cy, this.y, this.y + this.h);
        let distance = dist(cx, cy, closeX, closeY);
        if (distance <= cr) {
            this.collide = true;
        } else {
            this.collide = false;
        }
    }
}
