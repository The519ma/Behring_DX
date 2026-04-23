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

/**
 * Hero copy fades in on load (independent of the specimen rig).
 */
function playCopyEntrance() {
  animate("#hero-copy .eyebrow, #hero-copy h1, #hero-copy .hero-lead, #hero-copy .hero-hint", {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: reducedMotion ? 0 : 820,
    delay: stagger(110, { start: 80 }),
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
 * Load choreography for the specimen vessel:
 * 1) jar enters from the right with spring overshoot / settle (anime.js v4 only uses the first TWO
 *    entries of a [from, to, ...] array per tween, so we chain tweens instead of a 3-stop array).
 * 2) cap twists open (rotation on #bottle-cap).
 * 3) lemon wedge fades and scales into view inside the jar.
 */
function playSpecimenEntrance() {
  const assembly = document.querySelector("#specimen-assembly");
  const cap = document.querySelector("#bottle-cap");
  const lemon = document.querySelector("#lemon-group");
  if (!assembly || !cap || !lemon) return;

  if (reducedMotion) {
    set(assembly, { translateX: 0, translateY: 0, rotate: 0 });
    set(cap, { rotate: -28 });
    set(lemon, { opacity: 1, scale: 1, translateX: 0, translateY: 0, rotate: 0 });
    return;
  }

  // Initial rig (anime v4: use `set`, not `animate.set`).
  set(assembly, { translateX: 380, translateY: 0, rotate: 5 });
  set(cap, { rotate: 0 });
  set(lemon, { opacity: 0, scale: 0.72, translateX: 0, translateY: 0, rotate: 0 });

  const intro = createTimeline({ defaults: { ease: "out(3)" } });

  // Slide in: large horizontal move + slight rotation, eased so it still feels weighted.
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

  // Secondary wobble on the glass (small angles, chained after the spring settles visually).
  intro.add(
    assembly,
    {
      rotate: [0, -2.2],
      duration: 180,
      ease: "out(2)"
    },
    720
  );
  intro.add(
    assembly,
    {
      rotate: [-2.2, 0.9],
      duration: 200,
      ease: "inOut(2)"
    },
    ">"
  );
  intro.add(
    assembly,
    {
      rotate: [0.9, 0],
      duration: 260,
      ease: "out(3)"
    },
    ">"
  );

  // Cap twists open partway through the approach so it reads as one coordinated lab motion.
  intro.add(
    cap,
    {
      rotate: [0, -32],
      duration: 780,
      ease: "inOut(3)"
    },
    380
  );

  // Wedge becomes visible as the cap clears the opening.
  intro.add(
    lemon,
    {
      opacity: [0, 1],
      scale: [0.72, 1],
      duration: 520,
      ease: "out(2)"
    },
    560
  );
}

/**
 * While `.hero-scroll-host` is taller than the viewport, we scrub a paused timeline: copy drifts
 * right, stage drifts left, lemon lifts out of the jar. Progress = how far the host has moved
 * through the sticky window.
 */
function setupHeroScrollStory() {
  const host = document.querySelector(".hero-scroll-host");
  const copy = document.querySelector("#hero-copy");
  const stage = document.querySelector("#hero-stage");
  const lemon = document.querySelector("#lemon-group");
  if (!host || !copy || !stage || !lemon) return;

  const scrollTl = createTimeline({
    autoplay: false,
    defaults: { duration: 2200, ease: "linear" }
  });

  scrollTl.add(
    copy,
    {
      translateX: [0, 56],
      translateY: [0, 8],
      opacity: [1, 0.86]
    },
    0
  );

  scrollTl.add(
    stage,
    {
      translateX: [0, -72],
      translateY: [0, 4]
    },
    0
  );

  scrollTl.add(
    lemon,
    {
      translateX: [0, 52],
      translateY: [0, -210],
      rotate: [0, 22],
      scale: [1, 1.08]
    },
    0
  );

  let scheduled = false;
  function scrubHeroScroll() {
    const travel = host.offsetHeight - window.innerHeight;
    const rect = host.getBoundingClientRect();
    let progress = travel > 0 ? -rect.top / travel : 0;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    const t = progress * scrollTl.duration;
    scrollTl.seek(t, true);
  }

  function onFrame() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scrubHeroScroll();
    });
  }

  if (!reducedMotion) {
    window.addEventListener("scroll", onFrame, { passive: true });
    window.addEventListener("resize", onFrame);
    requestAnimationFrame(() => {
      requestAnimationFrame(onFrame);
    });
  }
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
playSpecimenEntrance();
setupHeroScrollStory();
watchReveals();
watchWorkflow();
mountReferralForm();
