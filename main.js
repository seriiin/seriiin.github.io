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
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      let visibleCount = 0;
      publications.forEach((publication) => {
        const show = category === "all" || publication.dataset.category === category;
        publication.hidden = !show;
        if (show) visibleCount++;
      });
      filterButtons.forEach((filterButton) => {
        const selected = filterButton === button;
        filterButton.classList.toggle("is-active", selected);
        filterButton.setAttribute("aria-pressed", String(selected));
      });
      publicationCount.textContent = `${visibleCount} publication${visibleCount === 1 ? "" : "s"}`;
    });
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

// A small, user-triggered greeting; no idle animation or page-wide tracking.
const buddy = document.querySelector(".buddy-button");
const buddyStatus = document.querySelector("#buddy-status");
if (buddy && buddyStatus) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let greetingTimer;
  const resetLook = () => {
    buddy.style.setProperty("--buddy-x", "0px");
    buddy.style.setProperty("--buddy-y", "0px");
    buddy.style.setProperty("--buddy-tilt", "0deg");
  };
  buddy.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== "mouse") return;
    const bounds = buddy.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    buddy.style.setProperty("--buddy-x", `${(x * 2).toFixed(2)}px`);
    buddy.style.setProperty("--buddy-y", `${(y * 1.5).toFixed(2)}px`);
    buddy.style.setProperty("--buddy-tilt", `${(x * 4).toFixed(2)}deg`);
  });
  buddy.addEventListener("pointerleave", resetLook);
  buddy.addEventListener("pointercancel", resetLook);
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
