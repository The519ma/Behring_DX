import { animate, createTimeline, stagger, set, spring } from "animejs";
import "../styles.css";

const revealTargets = Array.from(document.querySelectorAll(".reveal"));
const stepCards = Array.from(document.querySelectorAll(".workflow-step"));
const storyVisual = document.querySelector(".story-visual");
const storyTitle = document.querySelector(".visual-title");
const referralFrame = document.getElementById("referral-frame");
const referralFrameWrap = document.getElementById("referral-frame-wrap");
const referralEmpty = document.getElementById("referral-empty");
const referralState = document.getElementById("referral-state");
const referralLink = document.getElementById("referral-link");

const siteConfig = window.BEHRING_SITE_CONFIG || {};
const referralFormUrl = siteConfig.referralFormUrl || "";
const referralFallbackUrl = siteConfig.referralFallbackUrl || "https://portal.behringdx.health";

const stageTitles = {
  received: "Referral assessment",
  grossing: "Grossing and lab handling",
  staining: "Staining and IHC",
  reporting: "Review and reporting"
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const STAGE_LABELS = [
  "Demonstration vessel",
  "Paraffin block",
  "Microtome & ribbon",
  "IHC development",
  "Microscopy"
];

let lastLabUiIdx = -1;

/**
 * Hero copy fades in on load (independent of the specimen rig).
 */
function playCopyEntrance() {
  const base =
    "#hero-copy .eyebrow, #hero-copy h1, #hero-copy .hero-lead, #hero-copy .hero-hint, #hero-copy .hero-lab-captions";
  animate(base, {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: reducedMotion ? 0 : 800,
    delay: stagger(90, { start: 60 }),
    ease: "out(3)"
  });

  animate("#hero-copy .hero-actions .cta", {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: reducedMotion ? 0 : 700,
    delay: stagger(100, { start: 320 }),
    ease: "out(3)"
  });
}

/**
 * Load choreography for the specimen vessel (panel 0 only); lab strip is handled by scroll.
 */
function playSpecimenEntrance() {
  const assembly = document.querySelector("#specimen-assembly");
  const cap = document.querySelector("#bottle-cap");
  const lemon = document.querySelector("#lemon-group");
  if (!assembly || !cap || !lemon) return null;

  if (reducedMotion) {
    set(assembly, { translateX: 0, translateY: 0, rotate: 0 });
    set(cap, { rotate: -28 });
    set(lemon, { opacity: 1, scale: 1, translateX: 0, translateY: 0, rotate: 0 });
    return null;
  }

  set(assembly, { translateX: 380, translateY: 0, rotate: 5 });
  set(cap, { rotate: 0 });
  set(lemon, { opacity: 0, scale: 0.72, translateX: 0, translateY: 0, rotate: 0 });

  const intro = createTimeline({ defaults: { ease: "out(3)" } });

  intro.add(
    assembly,
    {
      translateX: [380, 0],
      rotate: [5, 0],
      duration: 1050,
      ease: spring({ stiffness: 95, damping: 14, mass: 1.05, velocity: 0 })
    },
    0
  );

  intro.add(
    assembly,
    { rotate: [0, -2.2], duration: 180, ease: "out(2)" },
    1180
  );
  intro.add(assembly, { rotate: [-2.2, 0.9], duration: 200, ease: "inOut(2)" }, ">");
  intro.add(assembly, { rotate: [0.9, 0], duration: 260, ease: "out(3)" }, ">");

  intro.add(
    cap,
    { rotate: [0, -32], duration: 780, ease: "inOut(3)" },
    380
  );

  intro.add(
    lemon,
    { opacity: [0, 1], scale: [0.72, 1], duration: 520, ease: "out(2)" },
    560
  );

  return intro;
}

function currentLabIndex(/** @type {number} */ p) {
  if (p >= 0.999) return 4;
  return Math.min(4, Math.max(0, Math.floor(p * 5)));
}

function updateLabUi(/** @type {number} */ p) {
  const idx = currentLabIndex(p);
  if (idx === lastLabUiIdx) return;
  lastLabUiIdx = idx;
  const label = document.getElementById("stage-label");
  if (label) label.textContent = STAGE_LABELS[idx];
  document.querySelectorAll(".hero-lab-step").forEach((el) => {
    const k = parseInt(/** @type {HTMLElement} */(el).dataset.lab || "0", 10);
    el.classList.toggle("is-active", k === idx);
  });
}

/**
 * Damped scroll target + a single seekable timeline for the full lab “film” (strip + subplots).
 * Smoothing: requestAnimationFrame loop lerps `scrollSmooth` → `scrollTarget` for buttery motion.
 */
function setupHeroScrollStory() {
  const host = document.querySelector(".hero-scroll-host");
  const copy = document.querySelector("#hero-copy");
  const stage = document.querySelector("#hero-stage");
  const lemon = document.querySelector("#lemon-group");
  if (!host || !copy || !stage || !lemon) return () => {};

  if (reducedMotion) {
    set(copy, { translateX: 0, translateY: 0, opacity: 1 });
    set(stage, { translateX: 0, translateY: 0 });
    set(lemon, { translateX: 0, translateY: 0, rotate: 0, scale: 1 });
    set("#lab-strip", { translateX: 0 });
    set("#wax-embed", { scale: 1 });
    set("#wax-glow", { opacity: 0 });
    set("#microtome-blade", { translateY: 0 });
    set("#section-float", { opacity: 0.35 });
    set("#ihc-bloom", { opacity: 0.55 });
    set("#stain-droplet", { opacity: 0 });
    set("#stain-heat", { opacity: 0 });
    set("#scope-beam", { opacity: 0.4 });
    updateLabUi(0);
    return () => {};
  }

  const scrollTl = createTimeline({
    autoplay: false,
    defaults: { ease: "linear" }
  });

  // 1) Film strip: five 320pt panels, slide the journey left across the viewport.
  scrollTl.add(
    "#lab-strip",
    { translateX: [0, -1280], duration: 10800, ease: "inOut(2)" },
    0
  );

  // 2) Framing: copy and stage breathe apart (same window as the film).
  scrollTl.add(
    copy,
    { translateX: [0, 44], translateY: [0, 10], opacity: [1, 0.9], duration: 10000, ease: "inOut(2)" },
    0
  );
  scrollTl.add(
    stage,
    { translateX: [0, -32], translateY: [0, 4], duration: 10000, ease: "inOut(2)" },
    0
  );

  // 3) Wedge “releases” in the first act while the first panel is dominant.
  scrollTl.add(
    lemon,
    {
      translateX: [0, 58],
      translateY: [0, -240],
      rotate: [0, 26],
      scale: [1, 1.12],
      duration: 1600,
      ease: "out(3)"
    },
    0
  );

  // 4) Paraffin: subtle compress + emissive hint as that panel is centred mid-scroll.
  scrollTl.add("#wax-embed", { scale: [1, 1.05], duration: 900, ease: "inOut(2)" }, 2400);
  scrollTl.add("#wax-glow", { opacity: [0, 0.7], duration: 500, ease: "out(2)" }, 2800);
  scrollTl.add("#wax-glow", { opacity: [0.7, 0.25], duration: 500, ease: "in(2)" }, 3300);

  // 5) Microtome: blade nudges; ribbon segment brightens.
  scrollTl.add("#microtome-blade", { translateY: [0, -3.2], duration: 400, ease: "inOut(2)" }, 4000);
  scrollTl.add("#microtome-blade", { translateY: [-3.2, 0.4], duration: 450, ease: "inOut(2)" }, 4400);
  scrollTl.add("#section-float", { opacity: [0.35, 0.95], scale: [1, 1.08], duration: 500, ease: "out(2)" }, 4600);
  scrollTl.add("#section-float", { opacity: [0.95, 0.45], duration: 400, ease: "in(2)" }, 5100);

  // 6) IHC: reagent, brown signal develops, “heat” haze.
  scrollTl.add("#stain-droplet", { opacity: [0, 1], translateY: [0, 36], duration: 600, ease: "out(2)" }, 5800);
  scrollTl.add("#ihc-bloom", { opacity: [0, 0.75], scale: [0.9, 1.05], duration: 1000, ease: "inOut(2)" }, 6200);
  scrollTl.add("#stain-heat", { opacity: [0, 0.55], duration: 800, ease: "out(2)" }, 6000);
  scrollTl.add("#stain-heat", { opacity: [0.55, 0.2], duration: 500, ease: "in(2)" }, 6800);

  // 7) Readout: beam + ocular “focus”.
  scrollTl.add("#scope-beam", { opacity: [0, 0.55], duration: 700, ease: "out(2)" }, 8800);
  scrollTl.add("#scope-ocular", { scale: [1, 1.04], duration: 600, ease: "inOut(2)" }, 9000);
  scrollTl.add("#view-slide", { scale: [1, 1.12], duration: 800, ease: "out(2)" }, 9200);

  let targetP = 0;
  let smoothP = 0;
  const LERP = 0.11;

  function measureProgress() {
    const travel = host.offsetHeight - window.innerHeight;
    const rect = host.getBoundingClientRect();
    let p = travel > 0 ? -rect.top / travel : 0;
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    return p;
  }

  const storyDuration = () => /** @type {number} */ (scrollTl.duration);

  function applyStoryAt(/** @type {number} */ p) {
    const t = p * storyDuration();
    scrollTl.seek(t, true);
    updateLabUi(p);
  }

  function tick() {
    requestAnimationFrame(tick);
    smoothP += (targetP - smoothP) * LERP;
    if (Math.abs(targetP - smoothP) < 0.0004) smoothP = targetP;
    applyStoryAt(smoothP);
  }

  function onScroll() {
    targetP = measureProgress();
  }

  function onResize() {
    onScroll();
  }

  targetP = measureProgress();
  smoothP = targetP;
  applyStoryAt(smoothP);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  rafId = requestAnimationFrame(tick);

  return () => {
    applyStoryAt(measureProgress());
  };
}

function watchReveals() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target, {
          opacity: [0, 1],
          translateY: [22, 0],
          duration: reducedMotion ? 0 : 760,
          ease: "out(3)"
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

function setStage(stage) {
  if (!storyVisual) return;

  storyVisual.dataset.stage = stage;
  if (storyTitle && stageTitles[stage]) {
    storyTitle.textContent = stageTitles[stage];
  }

  stepCards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.stage === stage);
  });

  animate(".visual-slide", {
    scale: [0.96, 1],
    duration: 420,
    ease: "out(3)"
  });

  animate(".visual-output", {
    opacity: storyVisual.dataset.stage === "reporting" ? [0.45, 1] : [1, 0.2],
    duration: 380,
    ease: "out(2)"
  });
}

function watchWorkflow() {
  if (!stepCards.length || !storyVisual) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      setStage(visible.target.dataset.stage);
    },
    {
      threshold: [0.35, 0.6, 0.8],
      rootMargin: "-12% 0px -20% 0px"
    }
  );

  stepCards.forEach((card) => observer.observe(card));
}

function mountReferralForm() {
  if (!referralFrame || !referralFrameWrap || !referralEmpty || !referralState || !referralLink) return;

  referralLink.href = referralFallbackUrl;

  if (!referralFormUrl) {
    referralFrameWrap.hidden = true;
    referralEmpty.hidden = false;
    referralState.textContent = "Awaiting public form URL";
    return;
  }

  referralFrame.src = referralFormUrl;
  referralFrameWrap.hidden = false;
  referralEmpty.hidden = true;
  referralState.textContent = "Live public intake";
}

playCopyEntrance();
const syncHeroScroll = setupHeroScrollStory();
const specimenIntro = playSpecimenEntrance();
if (specimenIntro && typeof specimenIntro.then === "function") {
  specimenIntro.then(() => {
    requestAnimationFrame(syncHeroScroll);
  });
}

watchReveals();
watchWorkflow();
mountReferralForm();
