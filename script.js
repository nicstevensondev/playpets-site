// Mobile nav toggle
const navToggle = document.getElementById("nav-toggle");
const nav = document.getElementById("nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

// Footer year
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* ====================================
   RIVE INTEGRATION
   Based on extension content.js:
   - state machine: "Pet"
   - shared inputs for cat and dog
==================================== */

function hasRive() {
  return (
    typeof window !== "undefined" &&
    window.rive &&
    typeof window.rive.Rive === "function"
  );
}

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

function bindModeButtons(selector, setMode) {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-rive-mode");
      setMode(mode);
    });
  });
}

function attachResizeHandler(canvas, riveInstance) {
  window.addEventListener("resize", () => {
    resizeCanvasForDPR(canvas);
    if (typeof riveInstance.resizeDrawingSurfaceToCanvas === "function") {
      riveInstance.resizeDrawingSurfaceToCanvas();
    }
  });
}

function createInputHelpers(riveInstance, stateMachineName) {
  const inputs = riveInstance.stateMachineInputs(stateMachineName) || [];
  const inputMap = {};
  inputs.forEach((i) => {
    inputMap[i.name] = i;
  });

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

  return { inputMap, setBool, clearBools };
}

/* ====================================
   Shared pet mode mapping
   Mirrors content.js input names
==================================== */

function applyPetMode(mode, helpers) {
  const { setBool, clearBools } = helpers;

  clearBools();

  switch (mode) {
    case "Idle":
      // true idle/default state
      break;

    case "Play":
      setBool("active", true);
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

    case "Walk":
      setBool("active", true);
      setBool("rightWalk", true);
      break;

    default:
      break;
  }
}

function initPetHero({
  canvasId,
  src,
  buttonTarget,
  defaultMode,
}) {
  if (!hasRive()) return;

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  resizeCanvasForDPR(canvas);

  const riveInstance = new rive.Rive({
    src,
    canvas,
    stateMachines: ["Pet"],
    autoplay: true,
    fit: rive.Fit.Contain,
    alignment: rive.Alignment.Center,
    onLoad: () => {
      resizeCanvasForDPR(canvas);

      if (typeof riveInstance.resizeDrawingSurfaceToCanvas === "function") {
        riveInstance.resizeDrawingSurfaceToCanvas();
      }

      const helpers = createInputHelpers(riveInstance, "Pet");

      const setMode = (mode) => {
        applyPetMode(mode, helpers);
      };

      bindModeButtons(`[data-rive-target="${buttonTarget}"]`, setMode);
      setMode(defaultMode);
      attachResizeHandler(canvas, riveInstance);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPetHero({
    canvasId: "heroRive",
    src: "rive/cat.riv",
    buttonTarget: "cat",
    defaultMode: "Music",
  });

  initPetHero({
    canvasId: "dogHeroRive",
    src: "rive/dog.riv",
    buttonTarget: "dog",
    defaultMode: "Idle",
  });
});