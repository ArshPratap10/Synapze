// GSAP ScrollTrigger animations — cinematic scroll effects
document.addEventListener('DOMContentLoaded', function () {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(init, 100)
      return
    }
    gsap.registerPlugin(ScrollTrigger)

    // ── Fade-up elements ──────────────────────────────────────────────────
    document.querySelectorAll('.fade-up').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }
      )
    })

    // ── Navbar ────────────────────────────────────────────────────────────
    var navbar = document.getElementById('navbar')
    if (navbar) {
      ScrollTrigger.create({
        start: 'top -100',
        onUpdate: function (self) {
          if (self.scroll() > 100) {
            navbar.style.boxShadow = '0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)'
            navbar.style.background = 'rgba(3,3,4,0.9)'
            navbar.style.backdropFilter = 'blur(40px)'
          } else {
            navbar.style.boxShadow = ''
            navbar.style.background = ''
            navbar.style.backdropFilter = ''
          }
        },
      })
    }

    // ── Neural Score gauge ─────────────────────────────────────────────────
    var gaugeProgress = document.getElementById('gauge-progress')
    var gaugeBody = document.getElementById('gauge-body')
    var gaugeMind = document.getElementById('gauge-mind')
    var gaugeValue = document.getElementById('gauge-value')

    if (gaugeProgress && gaugeValue) {
      ScrollTrigger.create({
        trigger: '#neural-gauge',
        start: 'top 80%',
        once: true,
        onEnter: function () {
          // Main ring: 85/100
          gaugeProgress.style.strokeDashoffset = 534 - (85 / 100) * 534
          // Body ring: 88%
          if (gaugeBody) gaugeBody.style.strokeDashoffset = 452 - (88 / 100) * 452
          // Mind ring: 82%
          if (gaugeMind) gaugeMind.style.strokeDashoffset = 377 - (82 / 100) * 377

          // Counter
          var obj = { val: 0 }
          gsap.to(obj, {
            val: 85,
            duration: 2.5,
            ease: 'power3.out',
            onUpdate: function () {
              gaugeValue.textContent = Math.round(obj.val)
            },
          })
        },
      })
    }

    // ── Stat cards counter ─────────────────────────────────────────────────
    document.querySelectorAll('.stat-card').forEach(function (card) {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          gsap.fromTo(card,
            { opacity: 0, y: 20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
          )
        },
      })
    })

    // ── Exploded UI stack ─────────────────────────────────────────────────
    var stack = document.getElementById('exploded-stack')
    var glow = document.getElementById('exploded-glow')
    if (stack) {
      var cards = stack.querySelectorAll('.exploded-card')
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#exploded-ui',
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1.5,
        },
      })

      cards.forEach(function (card, i) {
        var direction = i % 2 === 0 ? 1 : -1
        tl.to(card, {
          y: (i - 2) * 80,
          x: direction * (i === 2 ? 0 : 15),
          rotateX: direction * 6,
          scale: 1 - Math.abs(i - 2) * 0.02,
          opacity: 1,
          duration: 1,
        }, 0)
      })

      if (glow) {
        tl.to(glow, { opacity: 1, scale: 2, duration: 1 }, 0)
      }
    }

    // ── Hero parallax ─────────────────────────────────────────────────────
    var heroContent = document.querySelector('#hero .max-w-5xl')
    if (heroContent) {
      gsap.to(heroContent, {
        y: 150,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    // ── Testimonial cards stagger ──────────────────────────────────────────
    document.querySelectorAll('.testimonial-card').forEach(function (card, i) {
      gsap.fromTo(card,
        { opacity: 0, y: 40, rotateY: -5 },
        {
          opacity: 1, y: 0, rotateY: 0,
          duration: 0.8,
          delay: i * 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        }
      )
    })

    // ── Pricing card entrance ─────────────────────────────────────────────
    var pricingCard = document.querySelector('.pricing-card')
    if (pricingCard) {
      gsap.fromTo(pricingCard,
        { opacity: 0, scale: 0.92, y: 40 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: pricingCard, start: 'top 80%', once: true },
        }
      )
    }
  }

  init()

  // ── Feature card mouse-follow glow ──────────────────────────────────────
  document.addEventListener('mousemove', function (e) {
    document.querySelectorAll('.feature-card').forEach(function (card) {
      var rect = card.getBoundingClientRect()
      var x = ((e.clientX - rect.left) / rect.width) * 100
      var y = ((e.clientY - rect.top) / rect.height) * 100
      card.style.setProperty('--mouse-x', x + '%')
      card.style.setProperty('--mouse-y', y + '%')
    })
  })
})
