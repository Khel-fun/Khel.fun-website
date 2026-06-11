import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import useMouseParallax from "../hooks/useMouseParallax";
import useIntroAnimation from "../hooks/useIntroAnimation";
import HeroText from "./HeroText";
import BottomBar from "./BottomBar";
import CharacterSection from "./CharacterSection";
import PrizeKingdomsSection from "./PrizeKingdomsSection";

// ScrollTrigger plugin is registered at app entry in src/main.jsx

const Hero = () => {
  const [showContent, setShowContent] = useState(false);
  const mainRef = useRef(null);

  // Use the mouse parallax hook
  useMouseParallax(mainRef);

  // Use the intro animation hook to show content when ready
  useIntroAnimation(setShowContent);

  // Enhanced main content animation
  useGSAP(() => {
    if (!showContent) return;

    gsap.registerPlugin(ScrollTrigger);

    // Initial state setup: start cinematic (zoomed + tilted) but only via GSAP
    // We avoid static rotate/scale classes in the DOM and animate from these
    gsap.set([".sky", ".bg", ".character", ".text", ".powered-by"], {
      opacity: 0,
    });

    // Start the whole main container zoomed and slightly rotated (cinematic start)
    gsap.set(".main", {
      scale: 1.5,
      rotate: -8,
      transformOrigin: "50% 50%",
    });

    // Give sky/bg/character/text initial zoom/rotation values (will animate to identity)
    gsap.set(".sky", { scale: 1.3, rotate: -15, transformOrigin: "50% 50%" });
    gsap.set(".bg", { scale: 1, rotate: 0, transformOrigin: "100% 100%" });
    // reduce character base size by ~20% (scale multiplier 0.8)
    gsap.set(".character", {
      bottom: "-100%",
      left: "50%",
      x: "-50%",
      rotate: -20,
      scale: 0.8, // 1.3 * 0.8 ≈ 1.04
      transformOrigin: "50% 50%",
    });
    gsap.set(".text", { scale: 1.1, rotate: -10, transformOrigin: "50% 50%" });

    // Set up section transition
    ScrollTrigger.create({
      trigger: ".character-to-prize-trigger",
      start: "top top",
      end: "bottom center",
      onEnter: () => {
        gsap.to(".prize-section", {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      },
      onLeave: () => {
        gsap.to(".prize-section", {
          opacity: 1,
          duration: 0.5
        });
      },
      onEnterBack: () => {
        gsap.to(".prize-section", {
          opacity: 1,
          duration: 0.5
        });
      },
      onLeaveBack: () => {
        gsap.to(".prize-section", {
          opacity: 0,
          duration: 0.5
        });
      }
    });

    // Add floating particles effect during transition
    gsap.to(".animate-float", {
      y: -30,
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        amount: 2,
        from: "random"
      }
    });

    // Create a dynamic entry sequence
    const tl = gsap.timeline();

    // Animate from cinematic start into the final upright panorama
    tl.to(".main", {
      scale: 1.05,
      rotate: 0,
      duration: 1.5,
      ease: "expo.out",
    })
      .to(
        ".sky",
        {
          opacity: 1,
          scale: 1.5,
          rotate: 0,
          duration: 0.8,
          ease: "power2.out",
          transformOrigin: "50% 50%",
        },
        "-=1.2"
      )
      .to(
        ".sky",
        {
          scale: 1.1,
          duration: 0.8,
          ease: "power2.inOut",
          transformOrigin: "50% 50%",
        },
        "-=0.4"
      )
      .to(
        ".bg",
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.inOut",
        },
        "-=1"
      )
      .to(
        ".character",
        {
          opacity: 1,
          scale: 0.72,
          x: "-50%",
          bottom: window.innerWidth < 768 ? "-5%" : "-20%",
          rotate: 0,
          duration: 1.5,
          ease: "back.out(1.2)",
        },
        "-=0.8"
      )
      .to(
        ".text",
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 1,
          ease: "back.out(1.4)",
        },
        "-=1"
      )
      .to(
        ".powered-by",
        {
          opacity: 1,
          duration: 1,
        },
        "-=0.5"
      );

    // Add parallax effect on scroll (sky only; bg stays fixed to avoid edge gaps during zoom)
    gsap.to(".sky", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: ".landing",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Add floating animation to character
    gsap.to(".character", {
      y: "20px",
      duration: 2,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });

    // Panorama: gentle horizontal parallax pan for layered depth
    gsap.to(".sky", {
      xPercent: 0,
      duration: 20,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2.5,
    });

    // bg: gentle zoom in and back to 1x, always covering the full hero
    gsap.to(".bg", {
      scale: 1.2,
      duration: 8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 1,
      transformOrigin: "100% 50%",
    });

    // Very slight main container motion to keep panorama feeling alive
    gsap.to(".main", {
      xPercent: -2,
      duration: 24,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2.5,
    });

  }, [showContent]);

  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      {/* Intro Mask */}
      {!showContent && (
        <div className="vi-mask-group fixed inset-0 z-[200] flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-8">
            {/* K.F mask - letters filled with the background image */}
            <div className="kf-mask-wrapper">
              <div className="kf-mask">K.F</div>
            </div>

            {/* Spinner */}
            <div className="three-body">
              <div className="three-body__dot" />
              <div className="three-body__dot" />
              <div className="three-body__dot" />
            </div>
          </div>
        </div>
      )}



      {/* Main Content */}
      {showContent && (
        <>
          <div
            className="main w-full h-screen overflow-hidden"
            ref={mainRef}
          >
            <div className="landing overflow-hidden relative w-full h-screen bg-transparent">

              {/* Images Container */}
              <div className="imagesdiv relative overflow-hidden w-full h-screen">
                {/* Sky Background */}
                {/* <img
                  className="absolute sky top-0 left-0 w-screen h-full object-cover"
                  src="/bg.png"
                  alt="Sky background"
                /> */}

                {/* Main Background */}
                <img
                  className="bg"
                  src="/bg.png"
                  alt="Main background" 
                />

                {/* Hero Text */}
                <HeroText />

                {/* Character */}
                <img
                  className="absolute character"
                  src="/girl.png"
                  alt="Main character"
                />

                {/* Powered by zkVerify */}
                {/* <div className="absolute bottom-10 left-10 z-30 flex flex-col items-start gap-1 powered-by">
                  <span className="text-[14px] font-bold uppercase tracking-[0.2em] text-white">
                    Powered by
                  </span>
                  <img
                    src="/zkVerify.svg"
                    alt="zkVerify Logo"
                    className="h-8 w-auto object-contain opacity-100 brightness-0 invert"
                  />
                </div> */}
              </div>

              <BottomBar />
            </div>
          </div>

          {/* Additional Sections */}
          <div className="relative">
            <CharacterSection />
            <PrizeKingdomsSection />
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;