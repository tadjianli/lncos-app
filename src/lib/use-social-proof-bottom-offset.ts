"use client";

import { useEffect, useState } from "react";

const GAP_ABOVE_STICKY_PX = 20;
const GAP_ABOVE_NAV_PX = 20;

function isVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.height < 1 || rect.width < 1) return false;
  const style = getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function measureOffset(navVisible: boolean): { offset: number; hasSticky: boolean } {
  const shell = document.querySelector(".app-shell");
  if (!shell) return { offset: GAP_ABOVE_NAV_PX, hasSticky: false };

  const shellBottom = shell.getBoundingClientRect().bottom;
  let topmost = shellBottom;
  let hasSticky = false;

  document.querySelectorAll(".bottom-action-bar").forEach((node) => {
    if (!(node instanceof HTMLElement) || !isVisible(node)) return;
    hasSticky = true;
    topmost = Math.min(topmost, node.getBoundingClientRect().top);
  });

  if (navVisible) {
    for (const selector of [".bottom-nav-bar"]) {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement) || !isVisible(node)) continue;
      topmost = Math.min(topmost, node.getBoundingClientRect().top);
    }
  }

  if (topmost >= shellBottom - 1) {
    return {
      offset: navVisible ? GAP_ABOVE_NAV_PX : Math.max(GAP_ABOVE_NAV_PX, 10),
      hasSticky: false,
    };
  }

  const obstruction = shellBottom - topmost;
  const gap = hasSticky ? GAP_ABOVE_STICKY_PX : GAP_ABOVE_NAV_PX;
  return { offset: obstruction + gap, hasSticky };
}

export function useSocialProofBottomOffset(navVisible: boolean): number {
  const [offset, setOffset] = useState(GAP_ABOVE_NAV_PX);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const { offset: next } = measureOffset(navVisible);
        setOffset(next);
      });
    };

    update();

    const shell = document.querySelector(".app-shell");
    const ro = new ResizeObserver(update);
    const observed = new Set<Element>();

    const track = (el: Element | null) => {
      if (!el || observed.has(el)) return;
      observed.add(el);
      ro.observe(el);
    };

    const scan = () => {
      track(shell);
      document.querySelectorAll(".bottom-action-bar, .bottom-nav").forEach((el) => track(el));
      update();
    };

    scan();

    const mo = new MutationObserver(scan);

    if (shell) {
      mo.observe(shell, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden"],
      });
    }

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [navVisible]);

  return offset;
}
