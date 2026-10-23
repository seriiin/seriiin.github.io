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

const videoPanels = [...document.querySelectorAll(".research-video")];
const researchVideos = videoPanels.map((panel) => panel.querySelector("video")).filter(Boolean);
videoPanels.forEach((panel) => {
  const video = panel.querySelector("video");
  if (!video) return;
  panel.addEventListener("toggle", () => {
    if (!panel.open) video.pause();
  });
  video.addEventListener("play", () => {
    researchVideos.forEach((other) => {
      if (other !== video) other.pause();
    });
  });
});

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

// Optional AR navigation: every destination also remains available in the page.
const arTrigger = document.querySelector(".portrait-trigger");
const arExplorer = document.querySelector("#ar-explorer");
if (arTrigger && arExplorer && typeof arExplorer.showModal === "function") {
  const arWindows = [...arExplorer.querySelectorAll(".ar-window")];
  const arWindowGrid = arExplorer.querySelector(".ar-windows");
  const arClose = arExplorer.querySelector(".ar-close");
  const arHint = document.querySelector(".ar-entry-hint");
  let arDestination = null;

  arTrigger.addEventListener("click", () => {
    if (arExplorer.open) return;
    const portrait = arTrigger.getBoundingClientRect();
    const originX = portrait.left + portrait.width * .46;
    const originY = portrait.top + portrait.height * .31;
    arExplorer.showModal();
    document.documentElement.classList.add("ar-view-open");
    arTrigger.setAttribute("aria-expanded", "true");

    // Offset dimensions stay stable while the entry animation is running.
    const grid = arWindowGrid.getBoundingClientRect();
    arWindows.forEach((card) => {
      const x = originX - (grid.left + card.offsetLeft + card.offsetWidth / 2);
      const y = originY - (grid.top + card.offsetTop + card.offsetHeight / 2);
      card.style.setProperty("--ar-from-x", `${Math.max(-640, Math.min(640, x)).toFixed(1)}px`);
      card.style.setProperty("--ar-from-y", `${Math.max(-480, Math.min(480, y)).toFixed(1)}px`);
    });
  });

  arClose.addEventListener("click", () => arExplorer.close());
  arExplorer.addEventListener("click", (event) => {
    const link = event.target.closest(".ar-window");
    if (link) {
      if (event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const destination = document.querySelector(link.getAttribute("href"));
      if (destination) {
        arDestination = destination.querySelector("h2") || destination;
        arExplorer.close();
      }
      // Native anchor navigation preserves hashes, history, and reduced-motion scrolling.
      return;
    }
    if (event.target !== arExplorer) return;
    const bounds = arExplorer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      arExplorer.close();
    }
  });

  // The native dialog handles Escape and focus trapping; all exit paths clean up.
  arExplorer.addEventListener("close", () => {
    document.documentElement.classList.remove("ar-view-open");
    arTrigger.setAttribute("aria-expanded", "false");
    if (arDestination) {
      const heading = arDestination;
      const temporaryTabIndex = !heading.hasAttribute("tabindex");
      if (temporaryTabIndex) {
        heading.setAttribute("tabindex", "-1");
        heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
      }
      heading.focus({ preventScroll: true });
      arDestination = null;
    } else {
      arTrigger.focus({ preventScroll: true });
    }
  });

  arTrigger.disabled = false;
  if (arHint) arHint.hidden = false;
}
