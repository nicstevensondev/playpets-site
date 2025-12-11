// Mobile nav toggle
const navToggle = document.getElementById("nav-toggle");
const nav = document.getElementById("nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("nav-open");
  });
}

// Footer year (safe duplicate with inline script)
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* ====================================
   RIVE INTEGRATION
   Uses your existing cat.riv state machine: "Cat"
==================================== */

function hasRive() {
  return typeof window !== "undefined" &&
         window.rive &&
         typeof window.rive.Rive === "function";
}

/**
 * Make canvas sharp on high-DPI screens
 */
function resizeCanvasForDPR(canvas) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const targetWidth = rect.width * dpr;
  const targetHeight = rect.height * dpr;

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
}

/**
 * Helper to wire a Rive instance to the hero canvas and simple mode names
 * Modes:
 *  - Idle
 *  - Play
 *  - Study
 *  - Music
 *  - Sleep
 *  - Walk
 */
function initHeroRive() {
  if (!hasRive()) return;

  const canvas = document.getElementById("heroRive");
  if (!canvas) return;

  // Initial DPR sizing before Rive creates its surface
  resizeCanvasForDPR(canvas);

  const riveInstance = new rive.Rive({
    src: "rive/cat.riv",
    canvas,
    stateMachines: ["Cat"],
    autoplay: true,
    fit: rive.Fit.Contain,
    alignment: rive.Alignment.Center,
    onLoad: () => {
      // Re-size once more now that Rive is ready
      resizeCanvasForDPR(canvas);
      if (typeof riveInstance.resizeDrawingSurfaceToCanvas === "function") {
        riveInstance.resizeDrawingSurfaceToCanvas();
      }

      const inputs = riveInstance.stateMachineInputs("Cat") || [];
      const inputMap = {};
      inputs.forEach((i) => { inputMap[i.name] = i; });

      const setBool = (name, value) => {
        const inp = inputMap[name];
        if (inp && "value" in inp && typeof inp.value === "boolean") {
          inp.value = !!value;
        }
      };

      const clearBools = () => {
        for (const key in inputMap) {
          const inp = inputMap[key];
          if (inp && "value" in inp && typeof inp.value === "boolean") {
            inp.value = false;
          }
        }
      };

      // Map our high-level modes to your Rive inputs
      const setMode = (mode) => {
        clearBools();

        switch (mode) {
          case "Play":
            // Active play — your extension requires "play" + "playingRight"
            setBool("active", true);
            setBool("play", true);
            setBool("playingRight", true);
            break;

          case "Study":
            // Idle study behavior
            setBool("studyRight", true);
            break;

          case "Music":
            // Default mode — listening to music
            setBool("musicRight", true);
            break;

          case "Sleep":
            setBool("sleeping", true);
            break;

          case "Walk":
            // Activate and walk right
            setBool("active", true);
            setBool("rightWalk", true);
            break;
        }
      };


      // Wire buttons
      const buttons = document.querySelectorAll("[data-rive-mode]");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const mode = btn.getAttribute("data-rive-mode");
          setMode(mode);
        });
      });

      // Default: Idle
      setMode("Music")

      // Keep it sharp on resize
      window.addEventListener("resize", () => {
        resizeCanvasForDPR(canvas);
        if (typeof riveInstance.resizeDrawingSurfaceToCanvas === "function") {
          riveInstance.resizeDrawingSurfaceToCanvas();
        }
      });
    }
  });
}

/**
 * Small decorative instances (Getting Started / Privacy)
 * initialMode: "Idle" | "Play" | "Study" | "Music" | "Sleep"
 */
function initSmallRive(canvasId, initialMode) {
  if (!hasRive()) return;

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Initial DPR sizing
  resizeCanvasForDPR(canvas);

  const r = new rive.Rive({
    src: "rive/cat.riv",
    canvas,
    stateMachines: ["Cat"],
    autoplay: true,
    fit: rive.Fit.Contain,
    alignment: rive.Alignment.Center,
    onLoad: () => {
      resizeCanvasForDPR(canvas);
      if (typeof r.resizeDrawingSurfaceToCanvas === "function") {
        r.resizeDrawingSurfaceToCanvas();
      }

      const inputs = r.stateMachineInputs("Cat") || [];
      const inputMap = {};
      inputs.forEach((i) => { inputMap[i.name] = i; });

      const setBool = (name, value) => {
        const inp = inputMap[name];
        if (inp && "value" in inp && typeof inp.value === "boolean") {
          inp.value = !!value;
        }
      };

      const clearBools = () => {
        for (const key in inputMap) {
          const inp = inputMap[key];
          if (inp && "value" in inp && typeof inp.value === "boolean") {
            inp.value = false;
          }
        }
      };

      clearBools();

      switch (initialMode) {
        case "Idle":
          break;
        case "Play":
          setBool("active", true);
          setBool("play", true);          // same as hero
          setBool("playingRight", true);
          break;
        case "Study":
          setBool("studyRight", true);
          break;
        case "Music":
          setBool("musicRight", true);
          break;
        case "Sleep":
          setBool("sleeping", true);
          break;
        default:
          break;
      }

      window.addEventListener("resize", () => {
        resizeCanvasForDPR(canvas);
        if (typeof r.resizeDrawingSurfaceToCanvas === "function") {
          r.resizeDrawingSurfaceToCanvas();
        }
      });
    }
  });
}

// Initialize once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initHeroRive();
  initSmallRive("gettingStartedRive", "Sleep");
  initSmallRive("privacyRive", "Study");
});
