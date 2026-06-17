"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { usePublicPopups } from "@/lib/client-supabase";
import { getRenderModeFromSearch } from "@/lib/render-mode";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useStore, selectOverlay } from "@/lib/store";
import type { Popup } from "@/lib/rdv-store";
import { isImageUrl } from "@/lib/admin-media";
import {
  getPopupScrollProgress,
  getPopupShowDelayMs,
  incrementPopupVisitCount,
  markPopupDismissed,
  pickEligiblePopup,
  POPUP_SCROLL_TRIGGER_RATIO,
  popupLog,
  type PopupEligibilityContext,
} from "@/lib/popups-public";

export function PopupPromo() {
  const pathname = usePathname();
  const overlay = useStore(selectOverlay);
  const showToast = useStore((s) => s.showToast);
  const promosEnabled = useSettingsStore((s) => s.notifPromos);
  const { popups, loading, error } = usePublicPopups();

  const [visible, setVisible] = useState(false);
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const triggerTimerRef = useRef<number | null>(null);
  const scrollTriggeredRef = useRef(false);
  const mountedRef = useRef(false);

  const previewMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    return getRenderModeFromSearch(window.location.search) !== "live";
  }, []);

  const overlayOpen = Boolean(overlay);

  const eligibilityCtx = useMemo<PopupEligibilityContext>(
    () => ({
      pathname,
      overlayOpen,
      previewMode,
      promosEnabled,
    }),
    [pathname, overlayOpen, previewMode, promosEnabled]
  );

  useEffect(() => {
    incrementPopupVisitCount();
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (error) {
      popupLog("error", "hook error", error);
    }
  }, [error]);

  const clearTriggerTimer = useCallback(() => {
    if (triggerTimerRef.current !== null) {
      window.clearTimeout(triggerTimerRef.current);
      triggerTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(
    (popup: Popup | null) => {
      if (popup) markPopupDismissed(popup);
      setVisible(false);
      setActivePopup(null);
      setCountdownSec(null);
      clearTriggerTimer();
    },
    [clearTriggerTimer]
  );

  const openPopup = useCallback((popup: Popup) => {
    popupLog("info", "showing popup", { id: popup.id, name: popup.name });
    setActivePopup(popup);
    setVisible(true);
    if (popup.countdown?.enabled) {
      setCountdownSec(Math.max(0, (popup.countdown.minutes ?? 30) * 60));
    }
  }, []);

  const scheduleShow = useCallback(
    (popup: Popup) => {
      clearTriggerTimer();
      const delayMs = getPopupShowDelayMs(popup);

      if (delayMs === 0) {
        if (!mountedRef.current) return;
        openPopup(popup);
        return;
      }

      triggerTimerRef.current = window.setTimeout(() => {
        if (!mountedRef.current) return;
        openPopup(popup);
      }, delayMs);
    },
    [clearTriggerTimer, openPopup]
  );

  useEffect(() => {
    if (loading || previewMode) {
      if (previewMode) popupLog("info", "blocked: preview_mode");
      return;
    }

    clearTriggerTimer();
    setVisible(false);
    setActivePopup(null);
    scrollTriggeredRef.current = false;

    const { popup, reasons } = pickEligiblePopup(popups, eligibilityCtx);

    popupLog("info", `candidates: ${popups.length}`, reasons);

    if (!popup) {
      popupLog("info", "no eligible popup");
      return;
    }

    if (popup.trigger === "scroll") return;
    if (popup.trigger === "exit") return;

    scheduleShow(popup);

    return clearTriggerTimer;
  }, [popups, loading, eligibilityCtx, previewMode, scheduleShow, clearTriggerTimer]);

  /* Déclencheur scroll — capture sur conteneurs internes (PWA / AppShell) */
  useEffect(() => {
    if (loading || previewMode || overlayOpen) return;
    const { popup } = pickEligiblePopup(popups, eligibilityCtx);
    if (!popup || popup.trigger !== "scroll") return;

    const tryScrollTrigger = () => {
      if (scrollTriggeredRef.current || visible) return;
      if (getPopupScrollProgress() < POPUP_SCROLL_TRIGGER_RATIO) return;
      scrollTriggeredRef.current = true;
      scheduleShow(popup);
    };

    tryScrollTrigger();
    document.addEventListener("scroll", tryScrollTrigger, { passive: true, capture: true });
    return () => document.removeEventListener("scroll", tryScrollTrigger, { capture: true });
  }, [popups, loading, eligibilityCtx, previewMode, overlayOpen, visible, scheduleShow]);

  /* Déclencheur exit intent (desktop web) */
  useEffect(() => {
    if (loading || previewMode || overlayOpen) return;
    const { popup } = pickEligiblePopup(popups, eligibilityCtx);
    if (!popup || popup.trigger !== "exit") return;

    const onMouseLeave = (e: MouseEvent) => {
      if (visible || e.clientY > 24) return;
      scheduleShow(popup);
    };

    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    return () =>
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
  }, [popups, loading, eligibilityCtx, previewMode, overlayOpen, visible, scheduleShow]);

  /* Compte à rebours interne popup */
  useEffect(() => {
    if (!visible || countdownSec == null) return;
    if (countdownSec <= 0) return;
    const t = window.setInterval(() => {
      setCountdownSec((s) => (s == null ? s : Math.max(0, s - 1)));
    }, 1000);
    return () => window.clearInterval(t);
  }, [visible, countdownSec]);

  const handleCta = async () => {
    if (!activePopup) return;
    if (activePopup.ctaAction === "copy" && activePopup.code) {
      try {
        await navigator.clipboard.writeText(activePopup.code);
        showToast("Code copié ✨", "tag");
      } catch {
        showToast(activePopup.code, "tag");
      }
    }
    dismiss(activePopup);
  };

  if (!visible || !activePopup) return null;

  const imageUrl =
    activePopup.image && isImageUrl(activePopup.imageId)
      ? activePopup.imageId
      : null;

  const countdownLabel =
    countdownSec != null
      ? `${String(Math.floor(countdownSec / 60)).padStart(2, "0")}:${String(countdownSec % 60).padStart(2, "0")}`
      : null;

  return (
    <div
      className="popup-promo-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-promo-title"
    >
      <button
        type="button"
        className="popup-promo-scrim"
        aria-label="Fermer la promotion"
        onClick={() => dismiss(activePopup)}
      />

      <div
        className="popup-promo-card"
        style={{ "--popup-accent": activePopup.accent || "var(--gold)" } as React.CSSProperties}
      >
        <button
          type="button"
          className="popup-promo-close"
          aria-label="Fermer"
          onClick={() => dismiss(activePopup)}
        >
          <Icon name="x" size={18} />
        </button>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="popup-promo-image" />
        )}

        <div className="popup-promo-body">
          {activePopup.eyebrow ? (
            <p className="popup-promo-eyebrow">{activePopup.eyebrow}</p>
          ) : null}
          {activePopup.title ? (
            <h2 id="popup-promo-title" className="popup-promo-title">
              {activePopup.title}
            </h2>
          ) : null}
          {activePopup.subtitle ? (
            <p className="popup-promo-subtitle">{activePopup.subtitle}</p>
          ) : null}
          {activePopup.code ? (
            <div className="popup-promo-code">{activePopup.code}</div>
          ) : null}
          {countdownLabel && (
            <p className="popup-promo-countdown">Expire dans {countdownLabel}</p>
          )}
          <button type="button" className="popup-promo-cta" onClick={() => void handleCta()}>
            {activePopup.ctaLabel || "Découvrir"}
          </button>
        </div>
      </div>
    </div>
  );
}
