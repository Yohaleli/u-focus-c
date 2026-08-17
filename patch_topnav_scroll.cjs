const fs = require('fs');
let content = fs.readFileSync('src/components/TopNav.tsx', 'utf8');

const replacement = `  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY && currentScrollY > 50) {
            setIsVisible((prev) => prev ? false : prev);
          } else {
            setIsVisible((prev) => !prev ? true : prev);
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);`;

content = content.replace(/  useEffect\(\(\) => \{\n    const handleScroll = \(\) => \{\n      const currentScrollY = window\.scrollY;\n      \n      if \(currentScrollY > lastScrollY && currentScrollY > 50\) \{\n        setIsVisible\(false\);\n      \} else \{\n        setIsVisible\(true\);\n      \}\n      setLastScrollY\(currentScrollY\);\n    \};\n\n    window\.addEventListener\('scroll', handleScroll, \{ passive: true \}\);\n    return \(\) => window\.removeEventListener\('scroll', handleScroll\);\n  \}, \[lastScrollY\]\);/g, replacement);

fs.writeFileSync('src/components/TopNav.tsx', content);
console.log("TopNav scroll throttled");
