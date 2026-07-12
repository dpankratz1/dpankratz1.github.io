(() => {
  const canvas = document.getElementById("background-canvas");

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const particleCount = () => {
    if (window.innerWidth < 640) {
      return 36;
    }

    if (window.innerWidth < 1024) {
      return 54;
    }

    return 72;
  };

  const pointer = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    active: false,
  };

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = 0;

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  const palette = [
    "184, 255, 241",
    "141, 184, 255",
    "239, 177, 237",
    "255, 228, 132",
  ];

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    particles = Array.from({ length: particleCount() }, () => ({
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      vx: randomBetween(-0.35, 0.35),
      vy: randomBetween(-0.25, 0.25),
      radius: randomBetween(1.1, 2.6),
      alpha: randomBetween(0.2, 0.8),
      color: palette[Math.floor(Math.random() * palette.length)],
    }));
  };

  const drawBackdrop = () => {
    context.clearRect(0, 0, width, height);

    const gradient = context.createRadialGradient(
      width * 0.72,
      height * 0.18,
      0,
      width * 0.72,
      height * 0.18,
      width * 0.9
    );
    gradient.addColorStop(0, "rgba(141, 184, 255, 0.08)");
    gradient.addColorStop(0.45, "rgba(184, 255, 241, 0.06)");
    gradient.addColorStop(1, "rgba(2, 3, 4, 0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  };

  const updateParticle = (particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    if (!pointer.active) {
      return;
    }

    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0 || distance > 180) {
      return;
    }

    const force = (180 - distance) / 1800;
    particle.vx -= (dx / distance) * force;
    particle.vy -= (dy / distance) * force;
    particle.vx *= 0.992;
    particle.vy *= 0.992;
  };

  const drawParticle = (particle) => {
    context.beginPath();
    context.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
    context.shadowBlur = 18;
    context.shadowColor = `rgba(${particle.color}, 0.22)`;
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  };

  const drawConnections = () => {
    context.shadowBlur = 0;

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 120) {
          continue;
        }

        const alpha = (1 - distance / 120) * 0.18;
        context.beginPath();
        context.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        context.lineWidth = 1;
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
  };

  const animate = () => {
    drawBackdrop();

    particles.forEach((particle) => {
      updateParticle(particle);
      drawParticle(particle);
    });

    drawConnections();
    animationFrame = window.requestAnimationFrame(animate);
  };

  const updatePointer = (event) => {
    const source = event.touches ? event.touches[0] : event;

    if (!source) {
      return;
    }

    pointer.x = source.clientX;
    pointer.y = source.clientY;
    pointer.active = true;
  };

  resize();
  animate();

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resize();
    animate();
  });

  window.addEventListener("mousemove", updatePointer);
  window.addEventListener("touchstart", updatePointer, { passive: true });
  window.addEventListener("touchmove", updatePointer, { passive: true });
  window.addEventListener("mouseleave", () => {
    pointer.active = false;
  });
  window.addEventListener("touchend", () => {
    pointer.active = false;
  });
})();
