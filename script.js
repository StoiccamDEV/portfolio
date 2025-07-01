class CinematicScroll {
  constructor() {
    this.currentSection = 0;
    this.totalSections = 4;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.sections = document.querySelectorAll(".scroll-section");
    this.dots = document.querySelectorAll(".scroll-dot");
    this.projectsScrollAttempts = 0;
    this.projectsScrollThreshold = 2;
    this.lastProjectsScrollTime = 0;
    this.boundaryIndicator = document.getElementById("scrollBoundaryIndicator");

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateSection(0);
  }

  setupEventListeners() {
    document.addEventListener("wheel", (e) => this.handleScroll(e), {
      passive: false,
    });

    document.addEventListener(
      "scroll",
      (e) => {
        if (
          e.target.classList.contains("projects") ||
          e.target.classList.contains("contact")
        ) {
          e.stopPropagation();
        }
      },
      true,
    );

    let startY = 0;
    document.addEventListener(
      "touchstart",
      (e) => {
        startY = e.touches[0].clientY;
      },
      { passive: true },
    );

    document.addEventListener(
      "touchend",
      (e) => {
        const endY = e.changedTouches[0].clientY;
        const diff = startY - endY;

        if (Math.abs(diff) > 50) {
          const direction = diff > 0 ? 1 : -1;
          this.navigate(direction);
        }
      },
      { passive: true },
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        this.navigate(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigate(-1);
      }
    });

    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        this.goToSection(index);
      });
    });

    document.querySelectorAll("[data-section]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionIndex = parseInt(link.getAttribute("data-section"));
        this.goToSection(sectionIndex);
      });
    });
  }

  handleScroll(e) {
    if (this.isScrolling) return;

    const currentSectionEl = this.sections[this.currentSection];

    if (currentSectionEl.classList.contains("section-projects")) {
      const scrollableContent = currentSectionEl.querySelector(".projects");

      if (scrollableContent) {
        const scrollTop = scrollableContent.scrollTop;
        const scrollHeight = scrollableContent.scrollHeight;
        const clientHeight = scrollableContent.clientHeight;

        const tolerance = 5;
        const isAtTop = scrollTop <= tolerance;
        const isAtBottom = scrollTop >= scrollHeight - clientHeight - tolerance;
        const isScrollable = scrollHeight > clientHeight;

        if (isScrollable) {
          if (e.deltaY > 0 && !isAtBottom) {
            this.resetProjectsScrollAttempts();
            return;
          }

          if (e.deltaY < 0 && !isAtTop) {
            this.resetProjectsScrollAttempts();
            return;
          }

          if (isAtTop && e.deltaY < 0) {
            this.resetProjectsScrollAttempts();
          } else if (isAtBottom && e.deltaY > 0) {
            const currentTime = Date.now();

            if (currentTime - this.lastProjectsScrollTime > 1500) {
              this.projectsScrollAttempts = 0;
            }

            this.projectsScrollAttempts++;
            this.lastProjectsScrollTime = currentTime;

            this.showScrollIndicator(this.projectsScrollAttempts);

            if (this.projectsScrollAttempts < this.projectsScrollThreshold) {
              e.preventDefault();
              return;
            }
            this.resetProjectsScrollAttempts();
          }
        }
      }
    }

    if (currentSectionEl.classList.contains("section-contact")) {
      const scrollableContent = currentSectionEl.querySelector(".contact");

      if (scrollableContent) {
        const scrollTop = scrollableContent.scrollTop;
        const scrollHeight = scrollableContent.scrollHeight;
        const clientHeight = scrollableContent.clientHeight;

        const tolerance = 30;
        const isAtTop = scrollTop <= tolerance;
        const isAtBottom = scrollTop >= scrollHeight - clientHeight - tolerance;
        const isScrollable = scrollHeight > clientHeight;

        if (isScrollable) {
          if ((!isAtTop && e.deltaY < 0) || (!isAtBottom && e.deltaY > 0)) {
            return;
          }
        }
      }
    }

    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    this.navigate(direction);
  }

  navigate(direction) {
    if (this.isScrolling) return;

    const newSection = this.currentSection + direction;

    if (newSection >= 0 && newSection < this.totalSections) {
      this.goToSection(newSection);
    }
  }

  goToSection(index) {
    if (index === this.currentSection || this.isScrolling) return;

    this.isScrolling = true;
    this.currentSection = index;

    this.updateSection(index);
    this.resetProjectsScrollAttempts();

    setTimeout(() => {
      this.isScrolling = false;
    }, 800);
  }

  resetProjectsScrollAttempts() {
    this.projectsScrollAttempts = 0;
    this.hideScrollIndicator();
  }

  showScrollIndicator(attempts) {
    if (!this.boundaryIndicator) return;

    this.boundaryIndicator.className = "scroll-boundary-indicator active";
    if (attempts === 1) {
      this.boundaryIndicator.classList.add("progress-1");
    } else if (attempts >= 2) {
      this.boundaryIndicator.classList.add("progress-2");
    }
  }

  hideScrollIndicator() {
    if (!this.boundaryIndicator) return;

    this.boundaryIndicator.className = "scroll-boundary-indicator";
  }

  updateSection(index) {
    this.sections.forEach((section, i) => {
      section.classList.remove("active", "prev", "next");

      if (i === index) {
        section.classList.add("active");
      } else if (i < index) {
        section.classList.add("prev");
      } else {
        section.classList.add("next");
      }
    });

    this.dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    const indicator = document.querySelector(".scroll-indicator");
    indicator.className = "scroll-indicator";

    if (index === 1) {
      indicator.classList.add("skills-active");
    } else if (index === 3) {
      indicator.classList.add("contact-active");
    }

    document.dispatchEvent(
      new CustomEvent("sectionChange", {
        detail: { section: index },
      }),
    );

    if (index === 2) {
      const projectsContent = document.querySelector(
        ".section-projects .projects",
      );
      if (projectsContent) projectsContent.scrollTop = 0;
    } else if (index === 3) {
      const contactContent = document.querySelector(
        ".section-contact .contact",
      );
      if (contactContent) contactContent.scrollTop = 0;
    }
  }
}

let counter = 0;
const welcomeCounter = document.getElementById("welcomeCounter");
const welcomeOverlay = document.getElementById("welcomeOverlay");

const counterInterval = setInterval(() => {
  counter += Math.floor(Math.random() * 15) + 1;
  if (counter >= 100) {
    counter = 100;
    clearInterval(counterInterval);
  }
  welcomeCounter.textContent = counter.toString().padStart(2, "0");
}, 50);

setTimeout(() => {
  welcomeOverlay.style.display = "none";
  new CinematicScroll();
}, 4000);

const cursor = document.getElementById("cursor");
const hoverElements = document.querySelectorAll(
  "a, button, .skill-item, .project-item, input, textarea, .scroll-dot",
);

document.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

hoverElements.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.classList.add("hover");
  });
  el.addEventListener("mouseleave", () => {
    cursor.classList.remove("hover");
  });
});

setTimeout(() => {
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const name = formData.get("name");
      const email = formData.get("email");
      const project = formData.get("project");

      const submitBtn = this.querySelector(".submit-btn");
      const originalText = submitBtn.textContent;

      submitBtn.textContent = "Enviando...";
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = "Mensaje Enviado ✓";
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          this.reset();
        }, 2000);
      }, 1000);
    });
  }
}, 4000);

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

setTimeout(() => {
  document
    .querySelectorAll(".skill-item, .project-item, .info-block")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "all 0.6s ease";
      observer.observe(el);
    });
}, 4500);

function updateHeaderStyle(sectionIndex) {
  const header = document.querySelector(".header");

  if (sectionIndex === 1 || sectionIndex === 3) {
    header.style.borderBottomColor = "#fff";
    header.style.background = "rgba(0, 0, 0, 0.95)";
    header.style.color = "#fff";
    header.querySelectorAll("a, .logo").forEach((el) => {
      el.style.color = "#fff";
    });
    header.querySelector(".status-indicator").style.background = "#00ff00";
  } else {
    header.style.borderBottomColor = "#000";
    header.style.background = "rgba(255, 255, 255, 0.95)";
    header.style.color = "#000";
    header.querySelectorAll("a, .logo").forEach((el) => {
      el.style.color = "#000";
    });
    header.querySelector(".status-indicator").style.background = "#00ff00";
  }
}

document.addEventListener("sectionChange", (e) => {
  updateHeaderStyle(e.detail.section);
});
