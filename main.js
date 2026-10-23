"use strict";

// Progressive enhancement: the complete portfolio remains readable without JS.
document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
if (menuToggle && navigation) {
  menuToggle.hidden = false;
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    menuToggle.querySelector("span").textContent = "+";
  };
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
    menuToggle.querySelector("span").textContent = isOpen ? "+" : "−";
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
  const wideViewport = window.matchMedia("(min-width: 781px)");
  wideViewport.addEventListener("change", closeMenu);
}

const toolbar = document.querySelector(".publication-toolbar");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const publications = [...document.querySelectorAll(".publication")];
const publicationCount = document.querySelector("#publication-count");
if (toolbar && publications.length && publicationCount) {
  toolbar.hidden = false;
  const totalBadge = toolbar.querySelector('[data-filter="all"] span');
  if (totalBadge) totalBadge.textContent = String(publications.length);
  publicationCount.textContent = `${publications.length} publications`;
  const filterPublications = (category) => {
    let visibleCount = 0;
    publications.forEach((publication) => {
      const show = category === "all" || publication.dataset.category === category;
      publication.hidden = !show;
      if (show) visibleCount++;
    });
    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === category;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    publicationCount.textContent = `${visibleCount} publication${visibleCount === 1 ? "" : "s"}`;
  };
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => filterPublications(button.dataset.filter));
  });
  // Cross-links from demos must still work when a paper is filtered out.
  const revealPublication = (hash) => {
    const target = publications.find((publication) => publication.id && `#${publication.id}` === hash);
    if (!target || !target.hidden) return null;
    filterPublications("all");
    return target;
  };
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link && !event.defaultPrevented) revealPublication(link.getAttribute("href"));
  });
  window.addEventListener("hashchange", () => {
    const revealed = revealPublication(window.location.hash);
    if (revealed) revealed.scrollIntoView({ block: "start" });
  });
}

if ("IntersectionObserver" in window) {
  const sectionLinks = [...document.querySelectorAll('nav a[href^="#"]')];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${entry.target.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  }, { rootMargin: "-15% 0px -55% 0px" });
  document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
}

const year = document.querySelector("#copyright-year");
if (year) year.textContent = String(new Date().getFullYear());

const videoPanels = [...document.querySelectorAll(".research-video")];
const portfolioVideos = [...document.querySelectorAll("video")];
videoPanels.forEach((panel) => {
  const video = panel.querySelector("video");
  if (!video) return;
  panel.addEventListener("toggle", () => {
    if (!panel.open) video.pause();
  });
});
portfolioVideos.forEach((video) => {
  video.addEventListener("play", () => {
    portfolioVideos.forEach((other) => {
      if (other !== video) other.pause();
    });
  });
});

// The gaze follows the mouse across the page; greetings stay user-triggered.
const buddy = document.querySelector(".buddy-button");
const buddyStatus = document.querySelector("#buddy-status");
if (buddy && buddyStatus) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let greetingTimer;
  let lookFrame = null;
  let pointer = null;
  const resetLook = () => {
    if (lookFrame !== null) window.cancelAnimationFrame(lookFrame);
    lookFrame = null;
    pointer = null;
    buddy.style.setProperty("--buddy-x", "0px");
    buddy.style.setProperty("--buddy-y", "0px");
    buddy.style.setProperty("--buddy-tilt", "0deg");
  };
  const updateLook = () => {
    lookFrame = null;
    if (!pointer) return;
    const bounds = buddy.getBoundingClientRect();
    const dx = pointer.x - (bounds.left + bounds.width / 2);
    const dy = pointer.y - (bounds.top + bounds.height / 2);
    const reach = Math.max(180, Math.min(window.innerWidth, window.innerHeight) * .3);
    const distance = Math.hypot(dx, dy, reach);
    const x = dx / distance;
    const y = dy / distance;
    buddy.style.setProperty("--buddy-x", `${(x * 3).toFixed(2)}px`);
    buddy.style.setProperty("--buddy-y", `${(y * 2.2).toFixed(2)}px`);
    buddy.style.setProperty("--buddy-tilt", `${(x * 5).toFixed(2)}deg`);
  };
  document.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !finePointer.matches) return;
    if (event.pointerType !== "mouse") {
      resetLook();
      return;
    }
    pointer = { x: event.clientX, y: event.clientY };
    if (lookFrame === null) lookFrame = window.requestAnimationFrame(updateLook);
  }, { passive: true });
  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) resetLook();
  });
  document.addEventListener("pointercancel", resetLook);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetLook();
  });
  window.addEventListener("blur", resetLook);
  window.addEventListener("resize", resetLook);
  buddy.addEventListener("blur", resetLook);
  buddy.addEventListener("click", () => {
    window.clearTimeout(greetingTimer);
    resetLook();
    buddy.classList.add("is-greeting");
    buddyStatus.textContent = "Hi! Thanks for visiting Selin's research.";
    greetingTimer = window.setTimeout(() => {
      buddy.classList.remove("is-greeting");
      buddyStatus.textContent = "";
    }, 1400);
  });
  reducedMotion.addEventListener("change", resetLook);
  finePointer.addEventListener("change", resetLook);
  buddy.disabled = false;
}
