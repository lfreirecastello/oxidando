(() => {
  "use strict";

  const progressBar = document.querySelector("#reading-progress-bar");
  const headerProgressBar = document.querySelector("#header-progress-bar");
  const progressValue = document.querySelector("#progress-value");

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    const width = `${progress.toFixed(1)}%`;
    progressBar.style.width = width;
    headerProgressBar.style.width = width;
    progressValue.value = `${Math.round(progress)}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  const mobileMenu = document.querySelector("#mobile-menu");
  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => mobileMenu.removeAttribute("open"));
  });

  document.addEventListener("click", (event) => {
    if (mobileMenu?.hasAttribute("open") && !mobileMenu.contains(event.target)) {
      mobileMenu.removeAttribute("open");
    }
  });

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.closest(".code-card")?.querySelector("pre code")?.textContent;
      if (!code || !navigator.clipboard) return;

      try {
        await navigator.clipboard.writeText(code);
        const previous = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = previous; }, 1400);
      } catch {
        button.textContent = "Select code";
      }
    });
  });

  const outlineLinks = [...document.querySelectorAll(".outline a")];
  const sectionIds = outlineLinks.map((link) => link.hash.slice(1));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;

      outlineLinks.forEach((link) => {
        if (link.hash === `#${visible.target.id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-20% 0px -65%", threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }
})();
