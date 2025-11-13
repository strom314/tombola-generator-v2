// Confetti.jsx
import React, { useRef, useEffect, useState } from "react";
import "./Confetti.css";

const Confetti = ({ trigger = false, onComplete = () => {} }) => {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const drawingCanvas = canvasRef.current;
    if (!drawingCanvas) return;

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    let ctx = drawingCanvas.getContext("2d");
    drawingCanvas.width = viewWidth;
    drawingCanvas.height = viewHeight;

    const TWO_PI = Math.PI * 2;
    const HALF_PI = Math.PI * 0.5;
    const timeStep = 1 / 60;

    function Point(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    }

    function Particle(p0, p1, p2, p3) {
      this.p0 = p0;
      this.p1 = p1;
      this.p2 = p2;
      this.p3 = p3;
      this.time = 0;
      this.duration = 3 + Math.random() * 1;
      this.color = "#" + Math.floor(Math.random() * 0xffffff).toString(16);
      this.w = 18;
      this.h = 13.5;
      this.complete = false;
      this.x = p0.x;
      this.y = p0.y;
    }

    Particle.prototype = {
      update: function () {
        this.time = Math.min(this.duration, this.time + timeStep);
        const f = Ease.linear(this.time, 0, 1, this.duration);
        const p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);
        const dx = p.x - this.x;
        const dy = p.y - this.y;
        this.r = Math.atan2(dy, dx) + HALF_PI;
        this.sy = Math.sin(Math.PI * f * 10);
        this.x = p.x;
        this.y = p.y;
        this.complete = this.time === this.duration;
      },
      draw: function () {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.r);
        ctx.scale(1, this.sy);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);
        ctx.restore();
      },
    };

    let particles = [];

    function createParticles() {
      particles = [];
      for (let i = 0; i < 128; i++) {
        const p0 = new Point(Math.random() * viewWidth, -50);
        const p1 = new Point(
          Math.random() * viewWidth,
          Math.random() * viewHeight
        );
        const p2 = new Point(
          Math.random() * viewWidth,
          Math.random() * viewHeight
        );
        const p3 = new Point(Math.random() * viewWidth, viewHeight + 64);
        particles.push(new Particle(p0, p1, p2, p3));
      }
    }

    function init() {
      createParticles();
      requestAnimationFrame(loop);
    }

    function update() {
      particles.forEach((p) => p.update());
    }

    function draw() {
      ctx.clearRect(0, 0, viewWidth, viewHeight);
      particles.forEach((p) => p.draw());
    }

    function loop() {
      update();
      draw();

      if (!checkParticlesComplete()) {
        requestAnimationFrame(loop);
      } else {
        // Animation complete
        setIsActive(false);
        onComplete();
      }
    }

    function checkParticlesComplete() {
      return particles.every((p) => p.complete);
    }

    const Ease = {
      linear: (t, b, c, d) => {
        return (c * t) / d + b;
      },
      outCubic: (t, b, c, d) => {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
      },
    };

    function cubeBezier(p0, c0, c1, p1, t) {
      const p = new Point();
      const nt = 1 - t;
      p.x =
        nt * nt * nt * p0.x +
        3 * nt * nt * t * c0.x +
        3 * nt * t * t * c1.x +
        t * t * t * p1.x;
      p.y =
        nt * nt * nt * p0.y +
        3 * nt * nt * t * c0.y +
        3 * nt * t * t * c1.y +
        t * t * t * p1.y;
      return p;
    }

    setIsActive(true);
    init();

    // Handle window resize
    const handleResize = () => {
      drawingCanvas.width = window.innerWidth;
      drawingCanvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [trigger, onComplete]);

  return (
    <div
      className="confetti-overlay"
      style={{ display: isActive ? "flex" : "none" }}
    >
      <canvas id="confetti_canvas" ref={canvasRef} />
    </div>
  );
};

export default Confetti;
