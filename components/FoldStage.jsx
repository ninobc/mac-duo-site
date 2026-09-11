'use client';
import { useEffect, useRef } from 'react';

// The pinned hero + showcase. The Three.js scene lives in lib/stage.js and
// mounts on the canvas once the component is on screen.
export default function FoldStage() {
  const refs = {
    canvas: useRef(null), stage: useRef(null), heroCopy: useRef(null), finaleCopy: useRef(null),
    angleLabel: useRef(null), lidLine: useRef(null), hint: useRef(null), scrub: useRef(null), captions: useRef(null),
  };

  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;
    import('@/lib/stage.js').then(({ createStage }) => {
      if (cancelled) return;
      dispose = createStage({
        canvas: refs.canvas.current, stage: refs.stage.current, heroCopy: refs.heroCopy.current,
        finaleCopy: refs.finaleCopy.current, angleLabel: refs.angleLabel.current, lidLine: refs.lidLine.current,
        hint: refs.hint.current, scrub: refs.scrub.current,
        captions: [...refs.captions.current.querySelectorAll('.caption')],
      });
    });
    return () => { cancelled = true; dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="stage" id="stage" ref={refs.stage} aria-label="Mac Duo fold demo">
      <div className="sticky">
        <div className="sky" />
        <canvas id="scene" ref={refs.canvas} aria-hidden="true" />
        <div className="hero-copy" ref={refs.heroCopy}>
          <p className="eyebrow"><span className="dot" />For MacBook with a lid angle sensor</p>
          <h1>Close the lid.<br /><em>The desktop stays.</em></h1>
          <p className="lede">Mac Duo brings the iPhone&nbsp;Duo fold to your MacBook. As the lid comes down, what&apos;s on screen holds still in the room and softens into frosted light. Open it, and everything comes back into focus.</p>
          <div className="cta">
            <a className="button dark" href="#install"><DownloadIcon />Download for macOS</a>
            <span className="meta">Free · macOS 14 or later · Apple silicon &amp; Intel</span>
          </div>
        </div>
        <div className="captions" ref={refs.captions} aria-hidden="true">
          <p className="caption" data-at="0.25">The picture <em>holds still</em> while the glass folds over it.</p>
          <p className="caption" data-at="0.55">Frost grows from the <em>far edge</em>, never from the hinge.</p>
          <p className="caption" data-at="0.85">Open it again and it <em>comes back</em> through the same curve.</p>
        </div>
        <div className="finale-copy" ref={refs.finaleCopy} aria-hidden="true">
          <h2>Everything, exactly <em>where you left it.</em></h2>
          <p>Open the lid and the desktop comes back into focus through the same curve.</p>
        </div>
        <div className="readout">
          <svg className="glyph" viewBox="0 0 20 16" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.5 12.5h12.5" /><path ref={refs.lidLine} d="M4.5 12.5l-3.4-10.4" /></g></svg>
          <span className="angle"><span ref={refs.angleLabel}>110</span>°</span>
          <label className="visually-hidden" htmlFor="scrub">Lid angle</label>
          <input id="scrub" ref={refs.scrub} type="range" min="0" max="1000" defaultValue="0" />
          <span className="hint" ref={refs.hint}>Scroll to close</span>
        </div>
      </div>
    </section>
  );
}

export function DownloadIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 3v11.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4 3.6 3.6V3h2zM4 19h16v2H4z" /></svg>;
}
