/* =========================================================
   Michael Asiedu Asare: script.js

   Modules:
     theme  : light/dark toggle, persisted in localStorage("theme")
     nav    : mobile disclosure menu
     year   : footer copyright year
     figure : homepage hero visualization (state model + input)

   The initial theme is set by a small inline script in each
   page's <head> so the correct palette paints first.
   ========================================================= */

(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------
     THEME
     --------------------------------------------------------- */

  const THEME_KEY = "theme";

  const storedTheme = {
    get() {
      try {
        const value = localStorage.getItem(THEME_KEY);
        return value === "light" || value === "dark" ? value : null;
      } catch {
        return null;
      }
    },
    set(value) {
      try {
        localStorage.setItem(THEME_KEY, value);
      } catch {
        /* Storage unavailable (private mode, blocked): theme still applies for this page. */
      }
    },
  };

  function initTheme() {
    const toggle = document.querySelector(".theme-toggle");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    let fadeTimer;

    const apply = (theme, animate) => {
      if (animate && !reducedMotion.matches) {
        root.classList.add("theme-switching");
        clearTimeout(fadeTimer);
        fadeTimer = setTimeout(() => root.classList.remove("theme-switching"), 300);
      }
      root.setAttribute("data-theme", theme);
      if (toggle) toggle.setAttribute("aria-pressed", String(theme === "dark"));
    };

    apply(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);

    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        storedTheme.set(next);
        apply(next, true);
      });
    }

    // Follow the system only while the visitor has not chosen.
    systemDark.addEventListener("change", (event) => {
      if (!storedTheme.get()) apply(event.matches ? "dark" : "light", true);
    });

    // Keep other open tabs in step.
    window.addEventListener("storage", (event) => {
      if (event.key === THEME_KEY && (event.newValue === "light" || event.newValue === "dark")) {
        apply(event.newValue, false);
      }
    });
  }

  /* ---------------------------------------------------------
     NAVIGATION (mobile disclosure)
     --------------------------------------------------------- */

  function initNav() {
    const header = document.querySelector(".site-header");
    const button = header && header.querySelector(".menu-toggle");
    const nav = header && header.querySelector(".site-nav");
    if (!header || !button || !nav) return;

    const desktop = window.matchMedia("(min-width: 900px)");
    const isOpen = () => button.getAttribute("aria-expanded") === "true";

    const setOpen = (open, { focusFirst = false, returnFocus = false } = {}) => {
      header.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open && focusFirst) {
        const first = nav.querySelector("a");
        if (first) first.focus();
      }
      if (!open && returnFocus) button.focus();
    };

    button.addEventListener("click", (event) => {
      // detail === 0 means keyboard activation: move focus into the menu.
      setOpen(!isOpen(), { focusFirst: event.detail === 0 });
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) setOpen(false, { returnFocus: true });
    });

    document.addEventListener("click", (event) => {
      if (isOpen() && !header.contains(event.target)) setOpen(false);
    });

    // Never leave the panel open when the layout becomes desktop.
    desktop.addEventListener("change", (event) => {
      if (event.matches && isOpen()) setOpen(false);
    });
  }

  /* ---------------------------------------------------------
     FOOTER YEAR
     --------------------------------------------------------- */

  function initYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = year;
    });
  }

  /* ---------------------------------------------------------
     HERO FIGURE: conceptual operating-envelope model

     A point (the system's operating state) moves through a 2-D
     space of conditions. Its normalised distance rho from the
     centre, relative to the boundary contour at the same angle,
     determines the state:

       rho < 0.6 stable · < 0.8 uncertain · < 1 warning · >= 1 unsafe

     Deterministic: idle motion is a fixed function of time, and
     user input maps directly to a position. This is a conceptual
     illustration, not a model of real data.

     The static SVG in index.html is generated from the same
     geometry, so the figure is complete without JavaScript.
     --------------------------------------------------------- */

  const FIG = {
    width: 400,
    height: 340,
    cx: 196,
    cy: 174,
    sx: 1.3,
    sy: 1,
    R: 116,
    tilt: -0.17,
    envelope: 0.6,
    margin: 0.8,
  };

  const FIG_STATES = [
    { key: "stable", below: FIG.envelope, label: "Stable", uncertainty: "Low", response: "Operating within its envelope" },
    { key: "uncertain", below: FIG.margin, label: "Uncertain", uncertainty: "Rising", response: "Reporting wider uncertainty" },
    { key: "warning", below: 1, label: "Warning", uncertainty: "High", response: "Early warning raised" },
    { key: "unsafe", below: Infinity, label: "Unsafe", uncertainty: "Out of range", response: "Abstaining; deferring to fallback" },
  ];

  // Idle drift: [seconds, rho]. Out through the bands, briefly past
  // the boundary, then recovery. Cosine-eased between keyframes.
  const DRIFT = [[0, 0.12], [3.5, 0.42], [7, 0.74], [10, 0.93], [12, 1.06], [13.5, 1.06], [17, 0.5], [20, 0.12]];
  const DRIFT_PERIOD = 20;
  const DRIFT_THETA0 = -1.2;
  const DRIFT_TURN = 0.8;
  const SLIDER_MAX_RHO = 1.1;
  const RESUME_IDLE_MS = 6000;

  const figRadius = (theta) =>
    FIG.R * (1 + 0.07 * Math.sin(2 * theta + 0.6) + 0.045 * Math.cos(3 * theta - 0.4));

  const figToWorld = (rho, theta) => {
    const r = rho * figRadius(theta);
    const x = FIG.sx * r * Math.cos(theta);
    const y = FIG.sy * r * Math.sin(theta);
    const c = Math.cos(FIG.tilt);
    const s = Math.sin(FIG.tilt);
    return [FIG.cx + x * c - y * s, FIG.cy + x * s + y * c];
  };

  const figToPolar = ([px, py]) => {
    const c = Math.cos(-FIG.tilt);
    const s = Math.sin(-FIG.tilt);
    const x = px - FIG.cx;
    const y = py - FIG.cy;
    const ux = (x * c - y * s) / FIG.sx;
    const uy = (x * s + y * c) / FIG.sy;
    const theta = Math.atan2(uy, ux);
    return { theta, rho: Math.hypot(ux, uy) / figRadius(theta) };
  };

  const figContour = (rho, steps = 120) => {
    let d = "";
    for (let i = 0; i < steps; i += 1) {
      const [x, y] = figToWorld(rho, (i / steps) * Math.PI * 2);
      d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return `${d}Z`;
  };

  const driftRho = (seconds) => {
    const t = seconds % DRIFT_PERIOD;
    for (let i = 1; i < DRIFT.length; i += 1) {
      const [t1, r1] = DRIFT[i];
      if (t <= t1) {
        const [t0, r0] = DRIFT[i - 1];
        const k = (1 - Math.cos(((t - t0) / (t1 - t0)) * Math.PI)) / 2;
        return r0 + (r1 - r0) * k;
      }
    }
    return DRIFT[0][1];
  };

  // Position on the drift path; t adds a slow deterministic sway.
  const driftPoint = (rho, t = 0) =>
    figToWorld(rho, DRIFT_THETA0 + DRIFT_TURN * rho + 0.06 * Math.sin((t / 6.5) * Math.PI * 2));

  const figState = (rho) => FIG_STATES.find((state) => rho < state.below);

  function initHeroFigure() {
    const fig = document.querySelector("[data-hero-figure]");
    const svg = fig && fig.querySelector(".fig-svg");
    if (!fig || !svg) return;

    const q = (selector) => fig.querySelector(selector);
    const el = {
      canvas: q(".fig-canvas"),
      point: q(".fig-point"),
      halo: q(".fig-halo"),
      spread: q(".fig-spread"),
      trail: q(".fig-trail"),
      lead: q(".fig-lead"),
      stateText: fig.querySelectorAll("[data-fig-state]"),
      uncertainty: q("[data-fig-uncertainty]"),
      response: q("[data-fig-response]"),
      live: q("[data-fig-live]"),
      slider: q(".fig-slider"),
    };
    if (!el.canvas || !el.point || !el.spread) return;

    // Contours come from the same function that classifies state.
    const boundary = figContour(1);
    q(".fig-envelope").setAttribute("d", figContour(FIG.envelope));
    q(".fig-margin").setAttribute("d", figContour(FIG.margin));
    q(".fig-boundary").setAttribute("d", boundary);
    q(".fig-unsafe").setAttribute("d", `M0 0H${FIG.width}V${FIG.height}H0Z${boundary}`);

    const sliderRho = () => (Number(el.slider ? el.slider.value : 78) / 100) * SLIDER_MAX_RHO;

    let pos = driftPoint(sliderRho());
    let target = pos.slice();
    let mode = "idle"; // idle | user
    let idleStart = performance.now() - 8800; // join the drift near the current (warning) position
    let pointerInside = false;
    let visible = true;
    let frame = 0;
    let lastTime = 0;
    let lastTrailAt = 0;
    let resumeTimer = 0;
    let currentKey = fig.getAttribute("data-state");
    let lastU = -1;
    let lastSlider = el.slider ? Number(el.slider.value) : 0;
    let announceUntil = 0; // announce state changes shortly after keyboard input only
    const trail = [];

    const animating = () => !reducedMotion.matches;
    const set = (node, attrs) => {
      if (!node) return;
      for (const name in attrs) node.setAttribute(name, attrs[name]);
    };

    const render = () => {
      const [x, y] = pos;
      const { rho, theta } = figToPolar(pos);
      const state = figState(rho);
      const r = 7 + 30 * Math.min(rho, 1.15) ** 2;
      const [bx, by] = figToWorld(1, theta);

      set(el.point, { cx: x.toFixed(1), cy: y.toFixed(1) });
      set(el.halo, { cx: x.toFixed(1), cy: y.toFixed(1) });
      set(el.spread, { cx: x.toFixed(1), cy: y.toFixed(1), rx: (r * 1.15).toFixed(1), ry: (r * 0.9).toFixed(1) });
      set(el.lead, { x1: x.toFixed(1), y1: y.toFixed(1), x2: bx.toFixed(1), y2: by.toFixed(1) });
      if (el.trail) el.trail.setAttribute("points", trail.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "));

      const u = Math.min(rho, 1);
      if (Math.abs(u - lastU) > 0.005) {
        fig.style.setProperty("--fig-u", u.toFixed(3));
        lastU = u;
      }

      if (state.key !== currentKey) {
        currentKey = state.key;
        fig.setAttribute("data-state", state.key);
        el.stateText.forEach((node) => { node.textContent = state.label; });
        if (el.uncertainty) el.uncertainty.textContent = state.uncertainty;
        if (el.response) el.response.textContent = state.response;
        if (el.slider) el.slider.setAttribute("aria-valuetext", `${state.label}: ${state.response.toLowerCase()}`);
        if (el.live && performance.now() < announceUntil) el.live.textContent = `${state.label}. ${state.response}.`;
      }
    };

    const syncSlider = (rho) => {
      if (!el.slider || document.activeElement === el.slider) return;
      const value = Math.round(Math.max(0, Math.min(1, rho / SLIDER_MAX_RHO)) * 100);
      if (value !== lastSlider) {
        el.slider.value = String(value);
        lastSlider = value;
      }
    };

    const tick = (now) => {
      frame = 0;
      const dt = Math.min((now - (lastTime || now)) / 1000, 0.1);
      lastTime = now;

      if (mode === "idle") {
        const t = (now - idleStart) / 1000;
        const rho = driftRho(t);
        target = driftPoint(rho, t);
        syncSlider(rho);
      }

      const k = 1 - Math.exp(-dt / 0.22);
      pos = [pos[0] + (target[0] - pos[0]) * k, pos[1] + (target[1] - pos[1]) * k];
      // Snap when close, so the displayed state always matches the target.
      if (Math.hypot(target[0] - pos[0], target[1] - pos[1]) < 0.05) pos = target.slice();

      if (now - lastTrailAt > 90) {
        trail.push(pos.slice());
        if (trail.length > 16) trail.shift();
        lastTrailAt = now;
      }

      render();

      const settled = Math.hypot(target[0] - pos[0], target[1] - pos[1]) < 0.05;
      const trailSettled = trail.every((p) => Math.hypot(p[0] - pos[0], p[1] - pos[1]) < 0.5);
      if (visible && (mode === "idle" || !settled || !trailSettled)) schedule();
    };

    function schedule() {
      if (!frame && visible && animating()) frame = requestAnimationFrame(tick);
    }

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };

    // Reduced motion: jump straight to the target, no idle drift, no trail.
    const moveTo = (point, announce) => {
      target = point;
      if (announce) announceUntil = performance.now() + 1500;
      if (!animating()) {
        pos = point.slice();
        trail.length = 0;
        render();
        return;
      }
      schedule();
    };

    const takeControl = () => {
      mode = "user";
      clearTimeout(resumeTimer);
    };

    const scheduleResume = () => {
      clearTimeout(resumeTimer);
      if (!animating()) return;
      resumeTimer = setTimeout(() => {
        if (pointerInside || document.activeElement === el.slider) return;
        mode = "idle";
        idleStart = performance.now();
        schedule();
      }, RESUME_IDLE_MS);
    };

    const toViewBox = (event) => {
      const rect = svg.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * FIG.width;
      const y = ((event.clientY - rect.top) / rect.height) * FIG.height;
      return [Math.max(6, Math.min(FIG.width - 6, x)), Math.max(6, Math.min(FIG.height - 6, y))];
    };

    const onPointer = (event) => {
      if (event.type === "pointermove" && event.pointerType === "touch") return; // touch: tap to place, never hijack scroll
      takeControl();
      const point = toViewBox(event);
      syncSlider(figToPolar(point).rho);
      moveTo(point, false);
    };

    el.canvas.addEventListener("pointerenter", () => { pointerInside = true; });
    el.canvas.addEventListener("pointermove", onPointer);
    el.canvas.addEventListener("pointerdown", onPointer);
    el.canvas.addEventListener("pointerleave", () => {
      pointerInside = false;
      scheduleResume();
    });

    if (el.slider) {
      el.slider.addEventListener("input", () => {
        takeControl();
        lastSlider = Number(el.slider.value);
        moveTo(driftPoint(sliderRho()), true);
      });
      el.slider.addEventListener("blur", scheduleResume);
    }

    // Only animate while the figure is on screen and the tab is visible.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting && !document.hidden;
        if (visible) schedule();
        else stop();
      }).observe(fig);
    }

    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
      if (visible) schedule();
      else stop();
    });

    reducedMotion.addEventListener("change", () => {
      if (!animating()) {
        stop();
        mode = "user";
        moveTo(target, false);
      } else {
        mode = "idle";
        idleStart = performance.now();
        schedule();
      }
    });

    render();
    if (animating()) schedule();
  }

  /* ---------------------------------------------------------
     BOOT
     --------------------------------------------------------- */

  const boot = () => {
    initTheme();
    initNav();
    initYear();
    initHeroFigure();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
