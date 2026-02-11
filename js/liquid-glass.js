/**
 * Liquid Glass Interactive Effects
 *
 * Core technique: For each glass element, a .glass-distortion div is injected.
 * It uses  backdrop-filter: blur(0px)  to capture the backdrop pixels, then
 * filter: url(#liquid-glass-distort)  applies an SVG feDisplacementMap that
 * warps/refracts the captured backdrop — producing Apple's liquid glass look.
 *
 * Also handles: scroll-based header, mouse-tracking highlights, fade-in anims.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------
     1. Inject .glass-distortion layers into glass elements
     ------------------------------------------------------- */
  const glassSelectors = [
    'header',
    'nav a',
    '.social-links a',
    '.experience-item',
    '.education-item',
    '.project-card',
    '.publication-item',
    '.interest-item',
    '.blog-post',
    'footer'
  ].join(', ');

  document.querySelectorAll(glassSelectors).forEach(el => {
    // Skip if already injected (e.g. on SPA navigation)
    if (el.querySelector('.glass-distortion')) return;

    const layer = document.createElement('div');
    layer.className = 'glass-distortion';
    layer.setAttribute('aria-hidden', 'true');

    // Prepend so it sits below content in z-order (z-index: -1)
    el.prepend(layer);
  });

  /* -------------------------------------------------------
     2. Header — intensify glass when page is scrolled
     ------------------------------------------------------- */
  const header = document.querySelector('header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------------------------------------------------------
     3. Mouse-tracking light highlight on glass cards
     ------------------------------------------------------- */
  const cardSelectors = [
    '.experience-item',
    '.education-item',
    '.project-card',
    '.publication-item',
    '.interest-item'
  ].join(', ');

  const glassCards = document.querySelectorAll(cardSelectors);

  glassCards.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mouse-x', `${x}%`);
      el.style.setProperty('--mouse-y', `${y}%`);
    });

    el.addEventListener('mouseleave', () => {
      el.style.removeProperty('--mouse-x');
      el.style.removeProperty('--mouse-y');
    });
  });

  /* -------------------------------------------------------
     4. Intersection Observer — fade-in on scroll
        with staggered child animations
     ------------------------------------------------------- */
  const fadeElements = document.querySelectorAll('.fade-in');
  const glassChildSelectors =
    '.experience-item, .education-item, .project-card, .publication-item, .interest-item';

  if (fadeElements.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Apply stagger delays BEFORE triggering the transition
            const children = entry.target.querySelectorAll(glassChildSelectors);
            children.forEach((child, i) => {
              child.style.transitionDelay = `${i * 0.07}s`;
            });

            // Trigger the animation
            entry.target.classList.add('visible');

            // Clean up stagger delays after animation completes
            const cleanupMs = (children.length * 70) + 700;
            setTimeout(() => {
              children.forEach(child => {
                child.style.transitionDelay = '';
              });
            }, cleanupMs);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    fadeElements.forEach(el => observer.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add('visible'));
  }
});
