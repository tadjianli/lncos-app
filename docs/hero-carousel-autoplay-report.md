# Rapport — Autoplay Hero Carousel LN COS

**Date :** 12 juin 2026  
**Composant :** `src/components/home/HomeHeroCarousel.tsx`  
**Librairie :** aucune (pas Embla ni Swiper — implémentation React native)

---

## Symptôme

Le carousel affichait plusieurs slides correctement, mais **ne défilait pas automatiquement** sans interaction utilisateur.

---

## Causes identifiées

### 1. Intervalle réinitialisé à chaque changement de slide (cause principale)

L’ancien code utilisait :

```ts
const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

useEffect(() => {
  const id = window.setInterval(goNext, intervalMs);
  return () => window.clearInterval(id);
}, [..., goNext]);
```

`goNext` dépendait de `index`. **À chaque slide**, React recréait `goNext`, déclenchait le cleanup (`clearInterval`) puis un nouvel intervalle. Le compte à rebours repartait de zéro à chaque transition.

En pratique, combiné aux re-renders du parent (données Supabase / Realtime sur la home), le timer était souvent **annulé avant d’atteindre le délai** — l’autoplay semblait « mort » alors que le code était bien présent.

### 2. Pas de reprise après interaction

Swipe, tap sur indicateur ou CTA changeait la slide **sans mécanisme pause/reprise**. Ce n’empêchait pas le démarrage initial, mais cassait l’expérience « premium » attendue.

### 3. `prefers-reduced-motion` lu via ref non réactive

`reducedMotion.current` était mis à jour dans un effet séparé, mais l’effet autoplay ne se réabonnait pas si la préférence changeait. Comportement imprévisible sur certains navigateurs.

### 4. `setInterval` sans gestion `visibilitychange`

Sur iOS Safari / PWA, les timers en arrière-plan sont suspendus. Sans écoute de `document.visibilitychange`, l’autoplay ne reprenait pas toujours au retour sur l’onglet.

### 5. Ce qui n’était **pas** en cause

- Embla / Swiper : non utilisés sur ce carousel.
- `isPaused` bloqué : aucun état pause n’existait avant ce correctif.
- `settings.autoplay` ou `settings.enabled` : inchangés ; le bug était côté timer React.

---

## Correctifs appliqués

| Élément | Solution |
|--------|----------|
| Timer stable | `setTimeout` récursif + refs (`indexRef`, `countRef`) — plus de dépendance à `index` |
| Délai | 4–5 s (clamp sur `intervalSeconds`, défaut 5 s) |
| Interaction | Pause immédiate au touch / pointer / dot / CTA |
| Reprise | Automatique après **5 s** (`RESUME_AFTER_MS`) |
| PWA / Safari | Reprise sur `visibilitychange` quand l’onglet redevient visible |
| Accessibilité | Autoplay désactivé si `prefers-reduced-motion: reduce` (state + listener) |
| Debug | Logs `[HeroCarousel] autoplay started`, `slide changed`, `autoplay resumed` |

---

## Vérification manuelle recommandée

1. Accueil avec ≥ 2 slides actives, autoplay activé en admin.
2. Attendre 5 s sans toucher → slide suivante + log `slide changed`.
3. Swiper → pause ~5 s → reprise + log `autoplay resumed`.
4. Répéter sur iPhone Safari, Chrome Android, PWA standalone.

---

## Retrait des logs

Supprimer ou mettre `AUTOPLAY_LOG = false` dans `HomeHeroCarousel.tsx` une fois la validation terminée.
