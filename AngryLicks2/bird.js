class Bird {
  constructor(x, y, r) {
    const options = {
      restitution: 0.5,
    };
    this.body = Matter.Bodies.circle(x, y, r, options);
    Matter.Body.setMass(this.body, this.body.mass * 4);
    Matter.World.add(world, this.body);
    this.r = r;
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
    circle(0, 0, this.r * 2);
    pop();
  }
}
