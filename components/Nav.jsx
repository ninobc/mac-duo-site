'use client';
import { useEffect, useState } from 'react';

export default function Nav({ home = false }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 40);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a className="brand" href="/" aria-label="Mac Duo home">
        <img src="/assets/icon-180.png" width="28" height="28" alt="" />
        <span>Mac Duo</span>
      </a>
      {home && (
        <nav>
          <a href="#how">How it works</a>
          <a href="#styles">Styles</a>
          <a href="#install">Install</a>
          <a href="#faq">FAQ</a>
          <a href="https://github.com/ninobc/mac-duo" rel="noopener">GitHub</a>
        </nav>
      )}
      <a className="button dark small" href={home ? '#install' : '/#install'}>Download</a>
    </header>
  );
}
