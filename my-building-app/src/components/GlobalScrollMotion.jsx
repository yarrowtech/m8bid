import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const MOTION_SELECTOR = [
  "[data-motion]",
  "main",
  "section",
  "article",
  ".motion-item",
  ".card",
  ".rounded-2xl",
  ".rounded-3xl",
].join(", ");

export default function GlobalScrollMotion() {
  const location = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) return undefined;

    const seen = new WeakSet();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("motion-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

      const attachTargets = () => {
        const targets = document.querySelectorAll(MOTION_SELECTOR);
        targets.forEach((node, idx) => {
          if (seen.has(node)) return;
          seen.add(node);
          node.classList.add("motion-target");
          const explicitDelay = Number(node.getAttribute("data-motion-delay"));
          const delay = Number.isFinite(explicitDelay)
            ? explicitDelay
            : Math.min(idx * 22, 220);
          node.style.setProperty("--motion-delay", `${delay}ms`);
          observer.observe(node);
        });
      };

    attachTargets();
    const mutationObserver = new MutationObserver(() => attachTargets());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [location.pathname]);

  return null;
}
