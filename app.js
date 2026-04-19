import { animate, stagger, createTimeline, createMotionPath, createDrawable } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

const revealTargets = Array.from(document.querySelectorAll(".reveal"));
const floatCards = Array.from(document.querySelectorAll(".float-card"));
const heroLines = Array.from(document.querySelectorAll(".hero-line"));
const referralFrame = document.getElementById("referral-frame");
const referralFrameWrap = document.getElementById("referral-frame-wrap");
const referralEmpty = document.getElementById("referral-empty");
const referralState = document.getElementById("referral-state");
const referralLink = document.getElementById("referral-link");

const siteConfig = window.BEHRING_SITE_CONFIG || {};
const referralFormUrl = siteConfig.referralFormUrl || "";
const referralFallbackUrl = siteConfig.referralFallbackUrl || "https://portal.behringdx.health";

function playEntrance() {
  animate(heroLines, {
    y: [34, 0],
    opacity: [0, 1],
    filter: ["blur(12px)", "blur(0px)"],
    duration: 1100,
    delay: stagger(180),
    ease: "out(4)"
  });

  animate(".hero-actions .cta", {
    y: [20, 0],
    opacity: [0, 1],
    duration: 900,
    delay: stagger(120, { start: 450 }),
    ease: "out(3)"
  });

  animate(revealTargets, {
    y: [18, 0],
    opacity: [0, 1],
    duration: 880,
    delay: stagger(90, { start: 180 }),
    ease: "out(3)"
  });
}

function watchReveals() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target, {
          y: [22, 0],
          opacity: [0, 1],
          duration: 760,
          ease: "out(3)"
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

function addPointerLift() {
  const limitX = 10;
  const limitY = 12;

  floatCards.forEach((card, index) => {
    card.addEventListener("pointermove", (event) => {
      const box = card.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;

      animate(card, {
        rotateY: px * limitX,
        rotateX: -py * limitY,
        scale: 1.015,
        duration: 420,
        ease: "out(3)"
      });

      const strength = 18 + index * 3;
      card.style.boxShadow = `0 38px 90px rgba(0,0,0,0.42), 0 0 ${strength}px rgba(137, 215, 255, 0.12)`;
    });

    card.addEventListener("pointerleave", () => {
      animate(card, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        duration: 600,
        ease: "out(4)"
      });
      card.style.boxShadow = "";
    });
  });
}

function mountReferralForm() {
  if (!referralFrame || !referralFrameWrap || !referralEmpty || !referralState || !referralLink) {
    return;
  }

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

function animateFlowStage() {
  const flowPath = document.querySelector("#diagnostic-path");
  const traveler = document.querySelector(".flow-traveler");
  const pulse = document.querySelector(".flow-pulse");
  const flowNodes = Array.from(document.querySelectorAll(".flow-node"));

  if (!flowPath || !traveler || !pulse || !flowNodes.length) {
    return;
  }

  const [drawable] = createDrawable(flowPath);
  const motionPath = createMotionPath(flowPath);

  drawable.draw = "0 0";

  animate(drawable, {
    draw: ["0 0", "0 1"],
    duration: 2200,
    ease: "inOut(3)"
  });

  animate(flowNodes, {
    opacity: [0, 1],
    scale: [0.94, 1],
    y: [18, 0],
    duration: 900,
    delay: stagger(180, { start: 350 }),
    ease: "out(3)"
  });

  const travel = createTimeline({
    loop: true,
    defaults: {
      duration: 4200,
      ease: "linear"
    }
  });

  travel
    .add(traveler, {
      translateX: motionPath.translateX,
      translateY: motionPath.translateY,
      rotate: motionPath.rotate
    }, 0)
    .add(pulse, {
      scale: [0.8, 2.6],
      opacity: [0.8, 0],
      duration: 1200,
      ease: "out(4)",
      loop: true
    }, 0);
}

playEntrance();
watchReveals();
addPointerLift();
mountReferralForm();
animateFlowStage();
