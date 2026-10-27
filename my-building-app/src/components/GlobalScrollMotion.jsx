import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Reveal-on-scroll for content below the fold. Page containers (main) are never
// hidden, and anything already on screen at load shows immediately, so a page can
// never stay blank waiting for an animation.
const MOTION_SELECTOR = [
  "[data-motion]",
  "section",
  "article",
  ".motion-item",
  ".card",
  ".rounded-2xl",
  ".rounded-3xl",
].join(", ");
const SKIP_PATHS = ["/admin", "/dashboard", "/account", "/raiser", "/contributor"];

export default function GlobalScrollMotion() {
  const location = useLocation();

  useEffect(() => {
    if (SKIP_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))) {
      return undefined;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const seen = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("motion-in");
          observer.unobserve(entry.target);
        });
      },
      // threshold 0: tall sections reveal as soon as any part is visible.
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    const attachTargets = () => {
      const fold = window.innerHeight;
      let index = 0;
      document.querySelectorAll(MOTION_SELECTOR).forEach((node) => {
        if (seen.has(node)) return;
        seen.add(node);
        if (node.closest("[data-scroll-motion-disabled], .motion-target")) return; // no nested fades
        if (node.getBoundingClientRect().top < fold) return; // already visible: leave untouched
        node.classList.add("motion-target");
        const explicitDelay = Number(node.getAttribute("data-motion-delay"));
        node.style.setProperty("--motion-delay", `${Number.isFinite(explicitDelay) && node.hasAttribute("data-motion-delay") ? explicitDelay : Math.min(index++ * 40, 160)}ms`);
        observer.observe(node);
      });
    };

    // New content (lazy routes, fetched lists) is picked up at most once per frame.
    let frame = 0;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; attachTargets(); }); };
    attachTargets();
    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(document.getElementById("root") || document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      observer.disconnect();
      seen.forEach((node) => {
        node.classList.remove("motion-target", "motion-in");
        node.style.removeProperty("--motion-delay");
      });
    };
  }, [location.pathname]);

  return null;
}
