const body = document.body;
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll('.site-nav a[href^="#"], .footer-nav a[href^="#"]');
const yearTarget = document.getElementById("current-year");
const revealItems = document.querySelectorAll(".reveal");
const heroCarousel = document.querySelector("[data-carousel]");
const productCarousels = document.querySelectorAll("[data-product-carousel]");
const aboutVisual = document.querySelector("[data-about-visual]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("has-motion");

const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
};

const closeMenu = () => {
  body.classList.remove("menu-open");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!body.classList.contains("menu-open")) return;
    if (nav.contains(event.target) || menuToggle.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const initCarousel = (
  root,
  {
    trackSelector,
    slideSelector,
    dotSelector,
    prevSelector,
    nextSelector,
    currentSelector,
    totalSelector,
    interval = 3600
  }
) => {
  if (!root) return;

  const track = root.querySelector(trackSelector);
  const slides = Array.from(root.querySelectorAll(slideSelector));
  const dots = dotSelector ? Array.from(root.querySelectorAll(dotSelector)) : [];
  const prevButton = prevSelector ? root.querySelector(prevSelector) : null;
  const nextButton = nextSelector ? root.querySelector(nextSelector) : null;
  const currentCounter = currentSelector ? root.querySelector(currentSelector) : null;
  const totalCounter = totalSelector ? root.querySelector(totalSelector) : null;

  if (!track || !slides.length) return;

  let currentSlide = 0;
  let autoplayId = null;
  const formatSlideNumber = (index) => String(index + 1).padStart(2, "0");
  const hasMultipleSlides = slides.length > 1;

  root.classList.toggle("is-static", !hasMultipleSlides);

  const setActiveSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== currentSlide));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentSlide;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });

    if (currentCounter) {
      currentCounter.textContent = formatSlideNumber(currentSlide);
    }
  };

  const stopAutoplay = () => {
    if (!autoplayId) return;
    window.clearInterval(autoplayId);
    autoplayId = null;
  };

  const startAutoplay = () => {
    if (reducedMotion || !hasMultipleSlides) return;
    stopAutoplay();
    autoplayId = window.setInterval(() => {
      setActiveSlide(currentSlide + 1);
    }, interval);
  };

  const goToSlide = (index) => {
    setActiveSlide(index);
    startAutoplay();
  };

  if (totalCounter) {
    totalCounter.textContent = String(slides.length).padStart(2, "0");
  }

  prevButton?.addEventListener("click", () => {
    goToSlide(currentSlide - 1);
  });

  nextButton?.addEventListener("click", () => {
    goToSlide(currentSlide + 1);
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      goToSlide(dotIndex);
    });
  });

  setActiveSlide(0);
  startAutoplay();

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!root.contains(document.activeElement)) {
        startAutoplay();
      }
    }, 0);
  });
  root.addEventListener("touchstart", stopAutoplay, { passive: true });
  root.addEventListener("touchend", startAutoplay, { passive: true });
  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(currentSlide - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(currentSlide + 1);
    }
  });
};

initCarousel(heroCarousel, {
  trackSelector: ".hero-track",
  slideSelector: ".hero-slide",
  dotSelector: ".hero-progress-dot",
  prevSelector: "[data-carousel-prev]",
  nextSelector: "[data-carousel-next]",
  currentSelector: "[data-carousel-current]",
  totalSelector: "[data-carousel-total]",
  interval: 3600
});

productCarousels.forEach((carousel) => {
  initCarousel(carousel, {
    trackSelector: ".product-carousel-track",
    slideSelector: ".product-carousel-slide",
    prevSelector: "[data-carousel-prev]",
    nextSelector: "[data-carousel-next]",
    interval: 3200
  });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (aboutVisual && window.matchMedia("(pointer: fine)").matches) {
  const resetAboutVisual = () => {
    aboutVisual.style.setProperty("--about-offset-x", "0px");
    aboutVisual.style.setProperty("--about-offset-y", "0px");
  };

  aboutVisual.addEventListener("pointermove", (event) => {
    const bounds = aboutVisual.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    const moveX = `${(offsetX * 8).toFixed(2)}px`;
    const moveY = `${(offsetY * 8).toFixed(2)}px`;

    aboutVisual.style.setProperty("--about-offset-x", moveX);
    aboutVisual.style.setProperty("--about-offset-y", moveY);
  });

  aboutVisual.addEventListener("pointerleave", resetAboutVisual);
  aboutVisual.addEventListener("blur", resetAboutVisual, true);
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("load", () => {
  body.classList.add("is-ready");
  updateHeaderState();
});

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}
