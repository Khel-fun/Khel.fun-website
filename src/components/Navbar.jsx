import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { TiLocationArrow } from "react-icons/ti";
import { FaGamepad } from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";

import Button from "./Button";

const navItems = ["ZUNNO", "CARD WAR", "zkMINES", "About", "Contact"];

const Navbar = () => {
  //State for toggling audio and visual indicator
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  //refs for audio and navigation center
  const audioElementRef = useRef(null);
  const navContainerRef = useRef(null);

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  //Toggle audio and visual indicator
  const toggleAudioIndicator = () => {
    setIsAudioPlaying((prev) => !prev);
    setIsIndicatorActive((prev) => !prev);
  };

  //Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  //manage audio playback
  useEffect(() => {
    if (isAudioPlaying) {
      audioElementRef.current.play();
    } else {
      audioElementRef.current.pause();
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    // Close mobile menu on significant scroll
    if (isMobileMenuOpen && Math.abs(currentScrollY - lastScrollY) > 10) {
      setIsMobileMenuOpen(false);
    }

    if (currentScrollY === 0) {
      //Topmost position: show navbar without floating-nav
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      //Scrolling down:hide navbar and apply floating-nav
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      //Scrolling up:show navbar with floating-nav
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }
    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY, isMobileMenuOpen]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 transition-all duration-700"
    >
      {/* Centered glass container */}
    <div className="mx-4 sm:mx-6 lg:mx-10">
  <header className="mx-auto max-w-[1400px] bg-gradient-to-r from-sky-400/6 via-violet-300/5 to-amber-200/5 backdrop-blur-lg site-nav-header rounded-full px-6 py-3 shadow-lg">
          <nav className="flex size-full items-center justify-between" role="navigation" aria-label="Primary">
          {/*Logo and product button */}
          <div className="flex items-center gap-7">
            <div className="group relative flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/img/logo.png" 
                  alt="Khel.fun logo" 
                  loading="lazy"
                  className="w-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" 
                />
                {/* Glow effect on logo */}
                <div className="absolute inset-0 -z-10 blur-xl bg-violet-300/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              
              {/* Brand name - hidden on mobile */}
              <span className="hidden lg:block font-zentry text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-blue-300 to-violet-300 animate-pulse-slow hide-during-intro">
                KHEL.FUN
              </span>
            </div>

            <Button
              id="product-button"
              title="PLAY NOW"
              rightIcon={<FaGamepad className="animate-pulse" />}
              containerClass="md:flex hidden items-center justify-center gap-1"
              variant="gaming"
            />
          </div>

          {/*Navigation links and audio button */}
          <div className="flex h-full items-center">
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item, index) => {
                const isZunno = item === "ZUNNO";
                const isCardWar = item === "CARD WAR";
                const isZkMines = item === "zkMINES";
                let href, target, rel;
                
                if (isZunno) {
                  href = "https://farcaster.xyz/miniapps/sT0wxMVbxIg_/zunno";
                  target = "_blank";
                  rel = "noopener noreferrer";
                } else if (isCardWar) {
                  href = "https://card-war-nine.vercel.app/";
                  target = "_blank";
                  rel = "noopener noreferrer";
                } else {
                  href = `#${item.toLowerCase().replace(/\s+/g, '-')}`;
                  target = "_self";
                  rel = undefined;
                }
                
                if (isZkMines) {
                  return (
                    <div
                      key={item}
                      className="nav-hover-btn-enhanced opacity-50 cursor-not-allowed group/nav-item relative"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="nav-link-text">{item}</span>
                      {/* Tooltip for desktop */}
                      <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 scale-0 group-hover/nav-item:scale-100 transition-transform duration-200 bg-black/90 text-white text-[10px] px-2 py-1 rounded border border-violet-400/50 whitespace-nowrap z-50">
                        Coming Soon
                      </div>
                    </div>
                  );
                }

                return (
                  <a
                    key={item}
                    href={href}
                    target={target}
                    rel={rel}
                    className="nav-hover-btn-enhanced"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="nav-link-text">{item}</span>
                    <span className="nav-link-glow" />
                  </a>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden ml-4 text-blue-50 hover:text-violet-300 transition-colors duration-300"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenuAlt3 className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleAudioIndicator}
              className="ml-6 md:ml-10 flex items-center space-x-0.5 group relative"
              aria-label="Toggle audio"
              aria-pressed={isAudioPlaying}
            >
              {/* Audio button background glow */}
              <div className="absolute inset-0 -z-10 rounded-lg bg-violet-300/20 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <audio
                ref={audioElementRef}
                className="hidden"
                src="/audio/loop.mp3"
                loop
              />
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`indicator-line ${
                    isIndicatorActive ? "active" : ""
                  }`}
                  style={{ animationDelay: `${bar * 0.1}s` }}
                />
              ))}
            </button>
          </div>
          </nav>

          {/* Mobile Menu - keep it visually detached from the pill container */}
          <div
            id="mobile-menu"
            className={`md:hidden mt-3 rounded-lg bg-black/95 backdrop-blur-xl border border-violet-300/30 overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen
                ? "max-h-96 opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-4"
            }`}
            role="menu"
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="flex flex-col p-4 space-y-2">
              {navItems.map((item, index) => {
                const isZunno = item === "ZUNNO";
                const isCardWar = item === "CARD WAR";
                const isZkMines = item === "zkMINES";
                let href, target, rel;
                
                if (isZunno) {
                  href = "https://farcaster.xyz/miniapps/sT0wxMVbxIg_/zunno";
                  target = "_blank";
                  rel = "noopener noreferrer";
                } else if (isCardWar) {
                  href = "https://card-war-nine.vercel.app/";
                  target = "_blank";
                  rel = "noopener noreferrer";
                } else {
                  href = `#${item.toLowerCase().replace(/\s+/g, '-')}`;
                  target = "_self";
                  rel = undefined;
                }
                
                if (isZkMines) {
                  return (
                    <div
                      key={item}
                      className="px-4 py-3 text-blue-50/50 uppercase font-general text-sm cursor-not-allowed flex items-center justify-between"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {item}
                      <span className="text-[10px] bg-violet-300/20 px-2 py-0.5 rounded border border-violet-300/30">SOON</span>
                    </div>
                  );
                }

                return (
                  <a
                    key={item}
                    href={href}
                    target={target}
                    rel={rel}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-blue-50 uppercase font-general text-sm hover:bg-violet-300/10 hover:text-violet-300 rounded-lg transition-all duration-300 hover:translate-x-2"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {item}
                  </a>
                );
              })}
              <div className="pt-2 border-t border-violet-300/20">
                <Button
                  id="mobile-play-button"
                  title="PLAY NOW"
                  rightIcon={<FaGamepad />}
                  containerClass="w-full flex items-center justify-center gap-1"
                  variant="gaming"
                />
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Navbar;
