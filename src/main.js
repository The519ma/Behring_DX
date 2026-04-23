import { animate, createTimeline, stagger } from "animejs";
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
 * 1) jar enters from the right with overshoot / settle
 * 2) cap twists open (rotation on #bottle-cap)
 * 3) lemon wedge fades and scales into view inside the jar
 */
function playSpecimenEntrance() {
  const assembly = document.querySelector("#specimen-assembly");
  const cap = document.querySelector("#bottle-cap");
  const lemon = document.querySelector("#lemon-group");
  if (!assembly || !cap || !lemon) return;

  if (reducedMotion) {
    animate.set(assembly, { translateX: 0, translateY: 0, rotate: 0 });
    animate.set(cap, { rotate: -26 });
    animate.set(lemon, { opacity: 1, scale: 1 });
    return;
  }

  animate.set(assembly, { translateX: 360, translateY: 0, rotate: 4 });
  animate.set(cap, { rotate: 0 });
  animate.set(lemon, { opacity: 0, scale: 0.78 });

  const intro = createTimeline({ defaults: { ease: "out(3)" } });

  intro.add(
    assembly,
    {
      translateX: [360, -10, 0],
      rotate: [4, -1.8, 0.35, 0],
      duration: 1280,
      ease: "out(4)"
    },
    0
  );

  intro.add(
    cap,
    {
      rotate: [0, -30],
      duration: 720,
      ease: "inOut(3)"
    },
    520
  );

  intro.add(
    lemon,
    {
      opacity: [0, 1],
      scale: [0.78, 1],
      duration: 560,
      ease: "out(2)"
    },
    620
  );
}

/**
 * While the tall `.hero-scroll-host` scrolls through the viewport, we scrub a paused
 * timeline so typography shifts right, the stage shifts left, and the wedge lifts out.
 */
function setupHeroScrollStory() {
  const host = document.querySelector(".hero-scroll-host");
  const copy = document.querySelector("#hero-copy");
  const stage = document.querySelector("#hero-stage");
  const lemon = document.querySelector("#lemon-group");
  if (!host || !copy || !stage || !lemon) return;

  const scrollTl = createTimeline({
    autoplay: false,
    defaults: { duration: 2000, ease: "linear" }
  });

  scrollTl.add(
    copy,
    {
      translateX: [0, 52],
      translateY: [0, 6],
      opacity: [1, 0.88]
    },
    0
  );

  scrollTl.add(
    stage,
    {
      translateX: [0, -64],
      translateY: [0, 2]
    },
    0
  );

  scrollTl.add(
    lemon,
    {
      translateX: [0, 44],
      translateY: [0, -190],
      rotate: [0, 18],
      scale: [1, 1.05]
    },
    0
  );

  let scheduled = false;
  function scrub() {
    const travel = host.offsetHeight - window.innerHeight;
    const rect = host.getBoundingClientRect();
    let progress = travel > 0 ? -rect.top / travel : 0;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    scrollTl.seek(progress * scrollTl.duration, true);
  }

  function onFrame() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scrub();
    });
  }

  if (!reducedMotion) {
    window.addEventListener("scroll", onFrame, { passive: true });
    window.addEventListener("resize", onFrame);
    onFrame();
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
