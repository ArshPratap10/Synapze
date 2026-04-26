// Particle canvas — floating cyan/violet data motes
(function () {
  const canvas = document.getElementById('particle-canvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let w, h
  function resize() {
    w = canvas.width = canvas.offsetWidth
    h = canvas.height = canvas.offsetHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const COUNT = 150
  const particles = []

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '0,243,255' : '139,92,246',
    })
  }

  function draw() {
    ctx.clearRect(0, 0, w, h)
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = w
      if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h
      if (p.y > h) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`
      ctx.fill()
    }
    requestAnimationFrame(draw)
  }
  draw()
})()
