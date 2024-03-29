class Ground extends Box {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.body.isStatic = true;
  }

  show() {
    const pos = this.body.position;
    const angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    stroke(0);
    strokeWeight(2);
    fill(255);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}
