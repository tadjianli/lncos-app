"use client";

import { useEffect, useState } from "react";

const GAP_ABOVE_NAV_PX = 24;
const GAP_ABOVE_STICKY_PX = 24;
const SAFE_MARGIN_PX = 0;

function isVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.height < 1 || rect.width < 1) return false;
  const style = getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function readSafeBottomPx(): number {
  if (typeof document === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;bottom:0;left:0;width:0;height:0;padding-bottom:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none;";
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
}

function measureOffset(navVisible: boolean): number {
  const shell = document.querySelector(".app-shell");
  if (!shell) {
    return GAP_ABOVE_NAV_PX + readSafeBottomPx() + SAFE_MARGIN_PX;
  }

  const shellBottom = shell.getBoundingClientRect().bottom;
  let topmost = shellBottom;
  let hasSticky = false;

  document.querySelectorAll(".bottom-action-bar").forEach((node) => {
    if (!(node instanceof HTMLElement) || !isVisible(node)) return;
    hasSticky = true;
    topmost = Math.min(topmost, node.getBoundingClientRect().top);
  });

  if (navVisible) {
    const nav = document.querySelector(".bottom-nav");
    if (nav instanceof HTMLElement && isVisible(nav)) {
      topmost = Math.min(topmost, nav.getBoundingClientRect().top);
    }
  }

  if (topmost >= shellBottom - 1) {
    const nav = document.querySelector(".bottom-nav");
    const navHeight =
      navVisible && nav instanceof HTMLElement && isVisible(nav)
        ? nav.getBoundingClientRect().height
        : 0;
    return navHeight + GAP_ABOVE_NAV_PX + SAFE_MARGIN_PX;
  }

  const obstruction = shellBottom - topmost;
  const gap = hasSticky ? GAP_ABOVE_STICKY_PX : GAP_ABOVE_NAV_PX;
  return obstruction + gap + SAFE_MARGIN_PX;
}

export function useSocialProofBottomOffset(navVisible: boolean): number {
  const [offset, setOffset] = useState(GAP_ABOVE_NAV_PX);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setOffset(measureOffset(navVisible));
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
      document
        .querySelectorAll(".bottom-action-bar, .bottom-nav, .bottom-nav-dock, .bottom-nav-bar, .bottom-nav-cart-fab")
        .forEach((el) => track(el));
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
