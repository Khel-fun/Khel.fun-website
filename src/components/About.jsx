import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import AnimatedTitle from "./AnimatedTitle";

// ScrollTrigger is registered once in src/main.jsx

const About = () => {
  const cubesContainerRef = useRef(null);
  const titleRef = useRef(null);

  useGSAP(() => {
    // Animate "THE GAME" title entrance
    gsap.set(titleRef.current, {
      opacity: 0,
      y: 80,
      scale: 0.8,
      rotationX: 20
    });

    gsap.to(titleRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: 1.8,
      ease: "expo.out",
      scrollTrigger: {
        trigger: titleRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      }
    });

  // Responsive grid size: use a 3x3 grid on narrow screens to reduce
  // decode/paint load, else use 4x4 on larger viewports.
  const GRID_SIZE = (typeof window !== 'undefined' && window.innerWidth < 768) ? 3 : 4;
    const cubes = [];

    // Video sources for the cubes
    const videoSources = [
      '/videos/hero-1.mp4',
      '/videos/hero-2.mp4',
      '/videos/hero-3.mp4',
      '/videos/hero-4.mp4',
      '/videos/feature-1.mp4',
      '/videos/feature-2.mp4',
      '/videos/feature-3.mp4',
      '/videos/feature-4.mp4',
      '/videos/feature-5.mp4',
      '/videos/hero-1.mp4', // Repeat for 16 cubes
      '/videos/hero-2.mp4',
      '/videos/hero-3.mp4',
      '/videos/hero-4.mp4',
      '/videos/feature-1.mp4',
      '/videos/feature-2.mp4',
      '/videos/feature-3.mp4',
    ];

  // Create cube grid with videos
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cubeIndex = row * GRID_SIZE + col;
        const cube = document.createElement('div');
        cube.className = 'cube-piece';

        // Create video element
        const video = document.createElement('video');
        video.src = videoSources[cubeIndex];
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.borderRadius = '8px';
        video.style.display = 'block';
        video.style.transition = 'all 0.3s ease';

        // Set initial background for visibility
        cube.style.background = `linear-gradient(135deg, hsl(${cubeIndex * 25}, 70%, 60%), hsl(${cubeIndex * 25 + 60}, 70%, 70%))`;
        cube.style.opacity = '1';
        cube.style.visibility = 'visible';

        // Do not autoplay every video immediately; visibility-based playback
        // will be handled by an IntersectionObserver after the grid is built.

        cube.appendChild(video);
        cube.style.gridColumn = col + 1;
        cube.style.gridRow = row + 1;
        cube.style.setProperty('--row', row);
        cube.style.setProperty('--col', col);
        cube.style.borderRadius = '8px';
        cube.style.overflow = 'hidden';
        cube.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        cube.style.transition = 'all 0.3s ease';
        cube.style.cursor = 'pointer';

        // Add hover effect
        cube.addEventListener('mouseenter', () => {
          cube.style.transform = 'scale(1.05)';
          cube.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
        });

        cube.addEventListener('mouseleave', () => {
          cube.style.transform = 'scale(1)';
          cube.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });

        // Add data attributes for animation
        cube.dataset.row = row;
        cube.dataset.col = col;

        if (cubesContainerRef.current) {
          cubesContainerRef.current.appendChild(cube);
          cubes.push(cube);
        }
      }
    }

    
    // Ensure the container is visible and laid out as a grid before the
    // ScrollTrigger-driven timeline runs. Without this, the container can
    // have no explicit size and the cubes appear to "pop in" only when the
    // ScrollTrigger start position hits — a poor UX.
    if (cubesContainerRef.current) {
      const container = cubesContainerRef.current;
      // Basic grid layout so elements occupy space immediately
      container.style.display = 'grid';
      container.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
      container.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;
      container.style.gap = '16px';
      container.style.width = 'min(1200px, 90vw)';
      container.style.margin = '0 auto';
      container.style.boxSizing = 'border-box';
      // Give it a visible min height so the user sees content before scrolling
      // into the pinned area. This prevents the sudden pop-in effect.
      container.style.minHeight = window.innerWidth < 768 ? '45vh' : '60vh';
      container.style.padding = '20px';
      container.style.opacity = '1';
      container.style.transition = 'opacity 0.45s ease';
    }

    // IntersectionObserver: play videos only when their cube is mostly visible.
    // This dramatically reduces decode/paint load during fast scrolling.
    // Play/pause videos only when they are close to the viewport center.
    // Use a small rootMargin to start playback slightly before fully visible.
    const observerOptions = { root: null, rootMargin: '0px 0px -10% 0px', threshold: [0.25, 0.5] };

    // Limit concurrent playing videos to avoid decode/paint overload.
    const MAX_PLAYING = 3;
    const playingSet = new Set(); // set of video elements currently allowed to play

    const getDistanceFromViewportCenter = (el) => {
      const r = el.getBoundingClientRect();
      const elCenterX = r.left + r.width / 2;
      const elCenterY = r.top + r.height / 2;
      const vpCenterX = window.innerWidth / 2;
      const vpCenterY = window.innerHeight / 2;
      const dx = elCenterX - vpCenterX;
      const dy = elCenterY - vpCenterY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const prunePlaying = () => {
      if (playingSet.size <= MAX_PLAYING) return;
      // build array of {vid, distance}
      const arr = Array.from(playingSet).map((v) => ({ v, d: getDistanceFromViewportCenter(v.closest('.cube-piece')) }));
      // sort by distance ascending (closest first)
      arr.sort((a, b) => a.d - b.d);
      // keep closest MAX_PLAYING, pause the rest
      arr.slice(MAX_PLAYING).forEach((x) => {
  try { x.v.pause(); } catch { /* ignore */ }
        playingSet.delete(x.v);
      });
    };

    const ioCallback = (entries) => {
      // Batch updates to avoid layout thrash
      window.requestAnimationFrame(() => {
        entries.forEach((entry) => {
          const cubeEl = entry.target;
          const vid = cubeEl.querySelector('video');
          if (!vid) return;

          if (entry.intersectionRatio >= 0.25) {
            // Try to play; will register into playingSet on success
            vid.play().then(() => {
              playingSet.add(vid);
              prunePlaying();
            }).catch(() => {
              // ignore playback errors (autoplay policy etc.)
            });
          } else {
            // If element is no longer visible enough, pause and remove from set
            try { vid.pause(); } catch { /* ignore */ }
            playingSet.delete(vid);
          }
        });
      });
    };

    const observer = new IntersectionObserver(ioCallback, observerOptions);
    cubes.forEach((c) => observer.observe(c));

    // Check if mobile
    const isMobile = window.innerWidth < 768;



    // Add conservative lag smoothing to help GSAP interpolate through frame drops
  try { gsap.ticker.lagSmoothing(200, 16); } catch { /* ignore */ }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: isMobile ? "top center" : "center center",
        end: isMobile ? "+=600 center" : "+=1200 center", // Reduced scroll distance
  // Slightly longer scrub so GSAP has more room to interpolate during
  // fast scrolls; this smooths the mapping between scroll and timeline.
  scrub: isMobile ? 0.6 : 0.4,
        pin: true,
        pinSpacing: true, // Remove extra spacing to prevent layout shifts
        anticipatePin: 0,
      },
    });

    // Animate cubes splitting and moving (consolidated tween)
    // Use per-target functions and a stagger function based on distance from
    // center so we only create one tween instead of many small tweens which
    // can cause ScrollTrigger to jank under heavy scroll.
    const centerRow = (GRID_SIZE - 1) / 2;
    const centerCol = (GRID_SIZE - 1) / 2;

    tl.to(cubes, {
      x: (i, el) => {
        const row = parseInt(el.dataset.row);
        const col = parseInt(el.dataset.col);
        const isEven = (row + col) % 2 === 0;
        const distanceFromCenter = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
        const angle = Math.atan2(row - centerRow, col - centerCol);
        const movementMultiplier = isEven ? 1 : -0.8;
        return Math.cos(angle) * distanceFromCenter * 40 * movementMultiplier;
      },
      y: (i, el) => {
        const row = parseInt(el.dataset.row);
        const col = parseInt(el.dataset.col);
        const isEven = (row + col) % 2 === 0;
        const distanceFromCenter = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
        const angle = Math.atan2(row - centerRow, col - centerCol);
        const movementMultiplier = isEven ? 1 : -0.8;
        return Math.sin(angle) * distanceFromCenter * 40 * movementMultiplier;
      },
      z: (i, el) => {
        const row = parseInt(el.dataset.row);
        const isEven = (row + parseInt(el.dataset.col)) % 2 === 0;
        return isEven ? 100 : -100;
      },
      rotationX: (i, el) => ((parseInt(el.dataset.row) + parseInt(el.dataset.col)) % 2 === 0 ? 180 : 0),
      rotationY: (i, el) => ((parseInt(el.dataset.row) + parseInt(el.dataset.col)) % 2 === 0 ? 360 : -360),
      rotationZ: (i, el) => ((parseInt(el.dataset.row) + parseInt(el.dataset.col)) % 2 === 0 ? 90 : -90),
      scale: (i, el) => {
        const row = parseInt(el.dataset.row);
        const col = parseInt(el.dataset.col);
        const distanceFromCenter = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
        return Math.min(1 + (distanceFromCenter * 0.1), 1.4);
      },
      opacity: 1,
      ease: "expo.out",
      // Stagger based on distance to center (function form)
      stagger: (i, el) => {
        const row = parseInt(el.dataset.row);
        const col = parseInt(el.dataset.col);
        const dist = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
        return dist * 0.02;
      }
    }, 0);

    // Expand container with smooth easing
    tl.to(".cube-grid-container", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
      ease: "power2.inOut",
    }, 0.1); // Slight delay for better sequencing

  // Remove hard pause - it creates a rigid checkpoint. Let the timeline flow
  // continuously so scrub interpolation stays smooth during fast scrolling.

    // Enhanced fade-out sequence (consolidated tweens)
    tl.to(cubes, {
      scale: 0.22,
      rotationY: "+=120",
      rotationZ: "+=60",
      ease: "power2.inOut",
      duration: 0.7,
      stagger: (i, el) => {
        const row = parseInt(el.dataset.row);
        const col = parseInt(el.dataset.col);
        const dist = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
        return Math.pow(dist, 1.5) * 0.04;
      }
    }, 0.7);

    tl.to(cubes, {
      opacity: 0,
      scale: 0,
      y: "-=30",
      ease: "power2.in",
      duration: 1.2,
      stagger: (i, el) => {
        const row = parseInt(el.dataset.row);
        const col = parseInt(el.dataset.col);
        const dist = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
        return Math.pow(dist, 1.5) * 0.04;
      }
    }, 0.85);

    // Enhanced background effects sequence
    // First intensify the glow as cubes disappear
    tl.to("#clip .bg-violet-300\\/20", {
      scale: 0.5,
      opacity: 0.4,
      ease: "power2.out",
    }, 0.8);

    tl.to("#clip .bg-blue-300\\/10", {
      scale: 1.8,
      opacity: 0.3,
      ease: "power2.out",
    }, 0.82);

    // Then fade everything out smoothly
    tl.to("#clip .absolute.inset-0", {
      opacity: 0,
      scale: 2,
      ease: "expo.in",
      duration: 0.9,
    }, 0.9);

    // Final container fade with elegant exit
    tl.to(".cube-grid-container", {
      opacity: 0,
      scale: 0.5,
      rotationZ: 5,
      ease: "expo.in",
      duration: 1.5,
    }, 0.95);

    // Set initial state for next section
    gsap.set("#features", {
      y: 100,
      opacity: 0.3
    });

    // Smooth transition: bring in the next section as cubes disappear
    tl.to("#features", {
      y: 0,
      opacity: 1,
      ease: "expo.out",
      duration: 1.2,
    }, 0.8); // Start bringing in the next section as cubes begin to fade

    // Create a separate ScrollTrigger for seamless section transition
    ScrollTrigger.create({
      trigger: "#clip",
      start: "bottom 60%",
      end: "bottom top",
      onEnter: () => {
        gsap.to("#features", {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out"
        });
      },
      onLeave: () => {
        gsap.set("#features", { y: 0, opacity: 1 });
      }
    });

    return () => {
      // disconnect observer to avoid leaks
  try { observer && observer.disconnect(); } catch { /* ignore */ }

      cubes.forEach(cube => {
        const video = cube.querySelector('video');
        if (video) {
          video.pause();
          video.src = '';
        }
        cube.remove();
      });
    };
  });

  return (
    <div id="about" className="w-screen relative z-10">
      <div className="relative mb-8 mt-16 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
          <span ref={titleRef} className="font-mono text-sm md:text-xl uppercase tracking-[0.4em] text-violet-300 md:px-6">
            The Game
          </span>
          <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
        </div>

        <AnimatedTitle
          title="LIFE IS A KHEL"
          containerClass="mt-5 !text-black text-center"
        />

        <p className="max-w-2xl text-center font-circular-web text-lg text-black/70">
          Where blockchain meets arcade nostalgia. Prove your skills, earn rewards, dominate the leaderboard.
        </p>

        <div className="flex items-center gap-4">
        <p className="max-w-2xl text-center font-circular-web text-lg text-black/70">
          Fair-play, fully verified by
        </p>
        <a href="https://zkverify.io/" target="_blank" rel="noopener noreferrer">
        <img src="/zkVerify.svg" alt="zkVerify" className="w-36 h-20" />
        </a>
        </div>
      </div>

      <div className="h-screen w-screen" id="clip">
        <div
          ref={cubesContainerRef}
          className="cube-grid-container about-image"
        />

        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-300/20 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>


    </div>
  );
};

export default About;