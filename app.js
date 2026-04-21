import { animate, stagger } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

const revealTargets = Array.from(document.querySelectorAll(".reveal"));
const stepCards = Array.from(document.querySelectorAll(".workflow-step"));
const storyVisual = document.querySelector(".story-visual");
const storyTitle = document.querySelector(".visual-title");
const sampleCore = document.querySelector(".sample-core");
const referralFrame = document.getElementById("referral-frame");
const referralFrameWrap = document.getElementById("referral-frame-wrap");
const referralEmpty = document.getElementById("referral-empty");
const referralState = document.getElementById("referral-state");
const referralLink = document.getElementById("referral-link");

const siteConfig = window.BEHRING_SITE_CONFIG || {};
const referralFormUrl = siteConfig.referralFormUrl || "";
const referralFallbackUrl = siteConfig.referralFallbackUrl || "https://portal.behringdx.health";

const stageTitles = {
  received: "Referral received",
  grossing: "Gross intake in motion",
  staining: "Sectioned and stained",
  reporting: "Report ready for release"
};

function playEntrance() {
  animate(".hero-copy .eyebrow, .hero-copy h1, .hero-copy .hero-lead", {
    opacity: [0, 1],
    translateY: [28, 0],
    duration: 900,
    delay: stagger(130),
    ease: "out(3)"
  });

  animate(".hero-actions .cta", {
    opacity: [0, 1],
    translateY: [22, 0],
    duration: 760,
    delay: stagger(110, { start: 340 }),
    ease: "out(3)"
  });

  animate(".scene-microscope, .scene-slide-card, .scene-status, .scene-caption", {
    opacity: [0, 1],
    scale: [0.94, 1],
    duration: 1100,
    delay: stagger(110, { start: 160 }),
    ease: "out(4)"
  });

  if (sampleCore) {
    animate(sampleCore, {
      scale: [0.88, 1.06, 1],
      duration: 2200,
      ease: "inOutSine",
      loop: true
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
          duration: 760,
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

playEntrance();
watchReveals();
watchWorkflow();
mountReferralForm();
