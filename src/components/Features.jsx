import { useEffect, useState, useRef } from "react";
import { TiLocationArrow } from "react-icons/ti";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

// ScrollTrigger is registered once in src/main.jsx

const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Detect mobile on mount and on resize
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleMouseMove = (e) => {
    // Disable tilt on mobile/touch devices
    if (isMobile || !itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relativeX = (e.clientX - left) / width;
    const relativeY = (e.clientY - top) / height;

    // Smoother, more subtle tilt with better easing
    const tiltX = (relativeY - 0.5) * 3; // Reduced from 5 to 3 for smoother effect
    const tiltY = (relativeX - 0.5) * -3;

    const newTransform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(0.99, 0.99, 0.99)`;
    setTransformStyle(newTransform);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setTransformStyle("");
      setIsHovering(false);
    }
  };

  return (
    <div
      ref={itemRef}
      className={`${className} ${isHovering ? 'smooth-hover' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isMobile ? 'none' : transformStyle,
        transition: isMobile ? 'none' : 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {children}
    </div>
  );
};

const BentoCard = ({ src, title, description, players = "1-4", status = "LIVE", link }) => {
  const isLive = status === "LIVE";
  const statusColor = isLive ? "border-green-400/50" : "border-yellow-400/50";
  const dotColor = isLive ? "bg-green-400" : "bg-yellow-400";
  const videoRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(m.matches);
    update();
    m.addEventListener?.('change', update);
    return () => m.removeEventListener?.('change', update);
  }, []);

  const handleClick = () => {
    if (isLive && link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  // Prevent video autoplay issues on mobile
  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay prevented - this is fine for mobile
      });
    }
  };

  return (
    <div className="group relative size-full smooth-hover">
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        autoPlay={!prefersReducedMotion}
        preload="metadata"
        onLoadedData={handleVideoLoad}
        className="absolute left-0 top-0 size-full object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110 group-hover:brightness-110"
      />

      {/* Enhanced overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/60 opacity-0 transition-all duration-500 group-hover:opacity-100" />

      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-300/10 via-transparent to-blue-300/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

    {/* Bottom mask to hide small watermarks (e.g. 'Veo') in video assets.
      This gently covers the bottom edge with a gradient so the watermark
      doesn't show through while preserving the visual feel. */}
     <div className="absolute left-0 right-0 bottom-0 h-12 pointer-events-none bg-gradient-to-t from-black/100 to-transparent md:h-16" />

      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50">
        {/* Top Status Badges */}
        <div className="flex items-start justify-between">
          <div className={`flex items-center gap-2 rounded-full border ${statusColor} bg-black/50 px-3 py-1 backdrop-blur-sm`}>
            <div className={`h-2 w-2 ${isLive ? 'animate-pulse' : ''} rounded-full ${dotColor}`} />
            <span className="font-mono text-xs">{status}</span>
          </div>

          <div className="rounded-full border border-violet-300/50 bg-black/50 px-3 py-1 backdrop-blur-sm">
            <span className="font-mono text-xs">{players} Players</span>
          </div>
        </div>

        {/* Bottom Title and Description */}
        <div>
          <h1 className="bento-title special-font drop-shadow-lg">{title}</h1>
          {description && (
            <p className="mt-3 max-w-64 text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:text-base">
              {description}
            </p>
          )}

          {/* Enhanced Play Button with tooltip on hover when disabled */}
          <div className="relative">
            <button
              onClick={handleClick}
              disabled={!isLive}
              onMouseEnter={() => !isLive && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className={`mt-4 rounded-full border-2 border-white bg-violet-300 px-6 py-2 font-bold uppercase opacity-0 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 ${isLive ? 'hover:bg-white hover:text-violet-300 cursor-pointer smooth-scale' : 'cursor-not-allowed opacity-70'
                }`}
            >
              <span className="relative inline-flex items-center gap-2">
                {isLive ? 'Play Now' : 'Coming Soon'}
                {isLive && <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
              </span>
            </button>
            
            {!isLive && showTooltip && (
              <div className="absolute left-0 top-0 -translate-y-full mb-2 bg-black/90 text-white text-xs px-3 py-1 rounded border border-violet-400/50 backdrop-blur-sm z-50 whitespace-nowrap opacity-100 transition-opacity duration-300">
                Coming Soon
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const mainCardRef = useRef(null);
  const gridRef = useRef(null);

  useGSAP(() => {
    // Enhanced initial states with more dramatic positioning
    gsap.set(titleRef.current, {
      opacity: 0,
      y: 80,
      scale: 0.8,
      rotationX: 20
    });

    gsap.set(mainCardRef.current, {
      opacity: 0,
      y: 150,
      scale: 0.7,
      rotationX: 25,
      rotationY: -10,
      z: -200
    });

    gsap.set(".grid-card", {
      opacity: 0,
      y: 120,
      scale: 0.6,
      rotationX: 30,
      rotationY: 15,
      z: -300
    });

    // Enhanced entrance timeline with multiple triggers
    const entranceTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 85%",
        end: "top 15%",
        toggleActions: "play none none reverse",
        onEnter: () => {
          // Add entrance sound effect or haptic feedback here if needed
        }
      }
    });

    // Cinematic title sequence
    entranceTl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: 1.8,
      ease: "expo.out",
    })

      // Hero card with dramatic 3D entrance
      .to(mainCardRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        z: 0,
        duration: 2,
        ease: "expo.out",
      }, "-=0.8")

      // Grid cards with sophisticated staggered entrance
      .to(".grid-card", {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        z: 0,
        duration: 1.6,
        ease: "expo.out",
        stagger: {
          amount: 1.2,
          from: "start",
          ease: "power3.out",
          onComplete: function () {
            // Add subtle bounce after each card appears
            gsap.to(this.targets(), {
              scale: 1.05,
              duration: 0.3,
              ease: "back.out(2)",
              yoyo: true,
              repeat: 1
            });
          }
        }
      }, "-=1.4");

    // Remove all extra floating animations

  }, []);

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-b from-black via-gray-900 to-black py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-400/5 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-3 md:px-10 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            <span ref={titleRef} className="font-mono text-lg md:text-xl uppercase tracking-[0.4em] text-violet-400 px-6">
              Game Arsenal
            </span>
            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
          </div>
        </div>

        {/* Main Featured Card */}
        <BentoTilt ref={mainCardRef} className="border-hsla relative mb-12 h-96 w-full overflow-hidden rounded-md md:h-[65vh] zunno-glow-card">
          <BentoCard
            src="/videos/feature-1.mp4"
            title="Zunno"
            description="Experience the thrill of traditional Zunno game on blockchain"
            players="2-4"
            status="LIVE"
            link="https://farcaster.xyz/miniapps/sT0wxMVbxIg_/zunno"
          />
        </BentoTilt>

        {/* Enhanced Grid */}
        <div ref={gridRef} className="grid h-auto md:h-[135vh] grid-cols-1 md:grid-cols-2 md:grid-rows-3 gap-7">
          <BentoTilt className="bento-tilt_1 md:col-span-1 md:row-span-2">
            <BentoCard
              src="/videos/feature-2.mp4"
              title="CARD WAR"
              description="A fast-paced card battle game with high stakes - Play Now"
              players="2"
              status="LIVE"
              link="https://card-war-nine.vercel.app/"
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_1 md:col-span-1">
            <BentoCard
              src="/videos/feature-3.mp4"
              title="zkMINES"
              description="The classic logic game with a zk-twist"
              players="1"
              status="LIVE"
              link="https://zkmines.vercel.app/"
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_2">
            <div className="flex size-full flex-col justify-between bg-gradient-to-br from-violet-400 to-purple-600 p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
              <h1 className="bento-title special-font max-w-64 text-white relative z-10">M<b>o</b>re co<b>m</b>ing s<b>o</b>on!</h1>
              <TiLocationArrow className="m-5 scale-[5] self-end text-white/90 relative z-10 drop-shadow-lg" />
            </div>
          </BentoTilt>

          <BentoTilt className="bento-tilt_1 md:col-span-1">
            <video
              src="/videos/feature-5.mp4"
              loop
              muted
              autoPlay
              className="size-full object-cover object-center"
            />
          </BentoTilt>
        </div>
      </div>
    </section>
  );
};

export default Features;
