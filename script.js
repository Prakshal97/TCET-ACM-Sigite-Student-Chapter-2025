/* =======================================================
    SYSTEM PERFORMANCE CHECK (Low FPS)
======================================================= */
let lowFpsMode = false;

(function detectFPS() {
  let last = performance.now();
  let frames = 0;

  function frame() {
    const now = performance.now();
    frames++;

    if (now > last + 1000) {
      if (frames < 40) {
        lowFpsMode = true;
        console.warn("⚠ Low FPS detected — animations reduced.");
      }
      frames = 0;
      last = now;
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();


/* =======================================================
    PRELOADER + PAGE TRANSITION (GLOBAL)
======================================================= */
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const overlay = document.getElementById("pageTransition");

  if (preloader) setTimeout(() => preloader.classList.add("hidden"), 350);

  setTimeout(() => {
    if (overlay) overlay.style.transform = "scaleX(0)";
    runGSAPIntro();
  }, 650);
});


/* =======================================================
    NAVIGATION (DESKTOP + MOBILE)
======================================================= */
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");
let navOpen = false;

function toggleNav() {
  if (!navMobile || !navToggle) return;
  navOpen = !navOpen;
  navMobile.style.display = navOpen ? "flex" : "none";
  navToggle.innerHTML = navOpen
    ? `<i class="ri-close-line"></i>`
    : `<i class="ri-menu-line"></i>`;
}

if (navToggle) navToggle.addEventListener("click", toggleNav);

window.addEventListener("resize", () => {
  if (window.innerWidth > 800) {
    if (navMobile) navMobile.style.display = "none";
    navOpen = false;
    if (navToggle) navToggle.innerHTML = `<i class="ri-menu-line"></i>`;
  }
});


/* =======================================================
    PAGE TRANSITION (SMOOTH SCROLL)
======================================================= */
function scrollToSection(id) {
  const target = document.getElementById(id);
  const overlay = document.getElementById("pageTransition");
  const nav = document.querySelector(".nav-blur");

  if (!target) return;

  const navHeight = nav ? nav.offsetHeight : 72;
  const targetY =
    target.getBoundingClientRect().top + window.scrollY - navHeight - 10;

  // fallback if GSAP missing
  if (!overlay || typeof gsap === "undefined") {
    return window.scrollTo({ top: targetY, behavior: "smooth" });
  }

  const tl = gsap.timeline({ defaults: { duration: 0.35, ease: "power2.inOut" } });

  tl.set(overlay, { transformOrigin: "left", pointerEvents: "auto" })
    .to(overlay, { scaleX: 1 })
    .add(() => window.scrollTo({ top: targetY, behavior: "auto" }))
    .set(overlay, { transformOrigin: "right" })
    .to(overlay, { scaleX: 0 })
    .set(overlay, { pointerEvents: "none" });
}

document.querySelectorAll("[data-target]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    scrollToSection(link.dataset.target);
    if (navOpen) toggleNav();
  });
});


/* =======================================================
    GSAP INTRO + SCROLL REVEAL (GLOBAL)
======================================================= */
function runGSAPIntro() {
  if (typeof gsap === "undefined") {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    });
    return;
  }

  if (!lowFpsMode) {
    gsap.from(".logo-circle", { y: -20, opacity: 0, duration: 0.5 });
    gsap.from(".logo-text span", {
      y: -12,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      delay: 0.1
    });
    gsap.from(".nav-links a", {
      y: -10,
      opacity: 0,
      duration: 0.35,
      stagger: 0.06,
      delay: 0.2
    });
  }

  if (typeof ScrollTrigger !== "undefined" && !lowFpsMode) {
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%"
          }
        }
      );
    });
  }
}


/* =======================================================
    EVENTS PAGE – YEAR SWITCHER + FILTER
======================================================= */
(function initEventsPage() {
  const yearBtns = document.querySelectorAll(".year-btn");
  const yearSlides = document.querySelectorAll(".year-slide");

  if (!yearBtns.length || !yearSlides.length) return; // not on events.html

  function showYear(year) {
    yearSlides.forEach((slide) => {
      const visible = slide.dataset.year === year;
      slide.classList.toggle("active", visible);
      slide.setAttribute("aria-hidden", visible ? "false" : "true");
    });

    yearBtns.forEach((btn) => {
      const active = btn.dataset.year === year;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active);
    });

    // Reset filters inside active slide
    const activeSlide = document.querySelector(`.year-slide.active`);
    if (activeSlide) {
      const fbtns = activeSlide.querySelectorAll(".filter-btn");
      const cards = activeSlide.querySelectorAll(".event-card-new");

      fbtns.forEach((b, i) => b.classList.toggle("active", i === 0));
      cards.forEach((card) => {
        card.classList.remove("hidden-by-filter");
        card.style.display = "block";
      });
    }
  }

  // Year button click
  yearBtns.forEach((btn) =>
    btn.addEventListener("click", () => showYear(btn.dataset.year))
  );

  // Default selected year
  const initialYear =
    document.querySelector(".year-btn.active")?.dataset.year ||
    yearBtns[0].dataset.year;

  showYear(initialYear);

  /* --------------------------
      FILTER inside each slide
  --------------------------- */
  function initFilters(slide) {
    const fbtns = slide.querySelectorAll(".filter-btn");
    const cards = slide.querySelectorAll(".event-card-new");
    if (!fbtns.length || !cards.length) return;

    fbtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        fbtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        cards.forEach((card) => {
          const show =
            filter === "all" || card.dataset.semester === filter;

          if (show) {
            card.style.display = "block";
            card.classList.remove("hidden-by-filter");
          } else {
            card.classList.add("hidden-by-filter");
            setTimeout(() => (card.style.display = "none"), 180);
          }
        });
      });
    });
  }

  yearSlides.forEach((slide) => initFilters(slide));
})();


/* =======================================================
    LIGHTBOX – FOR GALLERY + PROJECTS
======================================================= */
(function initLightbox() {
  const overlay = document.getElementById("lightboxOverlay");
  if (!overlay) return;

  const overlayImg = document.getElementById("lightboxImg");
  const overlayDesc = document.getElementById("lightboxDesc");
  const overlayClose = document.getElementById("lightboxClose");

  const clickableImages = [
    ...document.querySelectorAll(".gallery-item img"),
    ...document.querySelectorAll(".project-card img"),
  ];

  if (!clickableImages.length) return;

  clickableImages.forEach((img) => {
    img.addEventListener("click", () => {
      overlayImg.src = img.src;
      overlayDesc.textContent =
        img.dataset.desc ||
        img.closest(".project-card")?.dataset.desc ||
        "No description available.";
      overlay.style.display = "flex";
    });
  });

  overlayClose.addEventListener("click", () => {
    overlay.style.display = "none";
  });
})();


/* =======================================================
    FAQ (ONLY on contact.html)
======================================================= */
(function initFAQ() {
  const faqs = document.querySelectorAll(".faq-item");
  if (!faqs.length) return;

  faqs.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    btn.addEventListener("click", () => {
      faqs.forEach((other) => {
        if (other !== item) other.classList.remove("open");
      });
      item.classList.toggle("open");
    });
  });
})();


/* =======================================================
    FOOTER YEAR
======================================================= */
const yearSpan = document.getElementById("yearSpan");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();


/* =======================================================
    CONTACT FORM HANDLER
======================================================= */
function handleFormSubmit(e) {
  e.preventDefault();
  alert("This form is frontend-only. Connect to Google Forms or backend to store responses.");
  e.target.reset();
}
