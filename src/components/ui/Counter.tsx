// Add this above your HeroSection component or import from another file
import { useEffect, useState } from "react";

function Counter({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16); // 16ms per frame ~60fps
    let raf: number;

    function update() {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        raf = requestAnimationFrame(update);
      } else {
        setCount(end);
      }
    }
    update();
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}
