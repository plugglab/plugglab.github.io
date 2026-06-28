const navbar   = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

let lastScroll = window.pageYOffset;

if (navbar && navToggle && navLinks) {

  const setMenu = (open) => {
    navLinks.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', open);
  };

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenu(!navLinks.classList.contains('nav-open'));
  });

  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  if (window.pageYOffset > 80) navbar.classList.add('nav-hidden');

  window.addEventListener('scroll', () => {
    const current = window.pageYOffset;
    if (current > lastScroll && current > 80) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }
    lastScroll = current;
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) setMenu(false);
  });
}
