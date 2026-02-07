/**
 * Liquid Glass Interactive Effects
 * Adds scroll-based header enhancement, mouse-tracking light highlights,
 * and intersection-observer fade-in animations.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------
     1. Header — intensify glass when page is scrolled
     ------------------------------------------------------- */
  const header = document.querySelector('header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // check on load
  }

  /* -------------------------------------------------------
     2. Mouse-tracking light highlight on glass cards
     ------------------------------------------------------- */
  const glassSelectors = [
    '.experience-item',
    '.education-item',
    '.project-card',
    '.publication-item',
    '.interest-item'
  ].join(', ');

  const glassElements = document.querySelectorAll(glassSelectors);

  glassElements.forEach(el => {
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
     3. Intersection Observer — fade-in on scroll
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
            // so they don't interfere with hover transitions
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
    // Fallback — show everything immediately
    fadeElements.forEach(el => el.classList.add('visible'));
  }
});
