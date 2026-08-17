const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setIsNavVisible((prev) => prev ? false : prev);
          } else {
            setIsNavVisible((prev) => !prev ? true : prev);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);`;

content = content.replace(/  useEffect\(\(\) => \{\n    const handleScroll = \(\) => \{\n      const currentScrollY = window\.scrollY;\n      if \(currentScrollY > lastScrollY\.current && currentScrollY > 50\) \{\n        setIsNavVisible\(false\);\n      \} else \{\n        setIsNavVisible\(true\);\n      \}\n      lastScrollY\.current = currentScrollY;\n    \};\n\n    window\.addEventListener\('scroll', handleScroll, \{ passive: true \}\);\n    return \(\) => window\.removeEventListener\('scroll', handleScroll\);\n  \}, \[\]\);/g, replacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Scroll throttled");
