import React from "react";

const HeroText = () => (
  <div className="text text-white absolute inset-0 flex flex-col md:block justify-center items-center select-none pointer-events-none z-10">
    <h1
      style={{ fontFamily: '"KnightWarrior", sans-serif' }}
      className="text-[clamp(5rem,18vw,16rem)] leading-[0.85] md:absolute md:top-20 md:left-20 text-center md:text-left"
    >
      KHEL
    </h1>
    <h1
      style={{ fontFamily: '"KnightWarrior", sans-serif' }}
      className="text-[clamp(5rem,18vw,16rem)] leading-[0.85] md:absolute md:bottom-20 md:right-20 text-center md:text-right mt-4 md:mt-0"
    >
      FUN
    </h1>
  </div>
);

export default HeroText;
