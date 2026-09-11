import Nav from '@/components/Nav';
import FoldStage, { DownloadIcon } from '@/components/FoldStage';
import Version from '@/components/Version';

export default function Home() {
  return (
    <>
      <a className="skip" href="#how">Skip to content</a>
      <Nav home />
      <main id="top">
        <FoldStage />

        <section className="strip">
          <ul className="chips">
            <li>MacBook Pro 14″ &amp; 16″ (2021+)</li><li>MacBook Pro 16″ (2019)</li><li>MacBook Air M2+</li><li>macOS 14 Sonoma+</li><li>Apple silicon &amp; Intel</li><li>Free &amp; open source</li>
          </ul>
        </section>

        <section className="section" id="how">
          <div className="wrap">
            <h2>One idea, done properly</h2>
            <p className="sub">The iPhone Duo transition doesn&apos;t cut between screens. It lets the picture stay where it was and shows it through the moving glass. Mac Duo does exactly that with your desktop and the MacBook&apos;s lid.</p>
            <div className="cards three">
              <article className="card">
                <div className="icon"><svg viewBox="0 0 24 24"><path d="M4 6h16v10H4z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M2 19h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></div>
                <h3>The picture holds still</h3>
                <p>Past the start angle, the desktop is frozen where it is in the room. Every pixel of the glass then shows what a fixed eye would see of that picture through it, so the desktop stays put while the MacBook folds around it.</p>
              </article>
              <article className="card">
                <div className="icon"><svg viewBox="0 0 24 24"><path d="M4 18c4-8 12-8 16 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M6 12c3-5 9-5 12 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".55" /><path d="M8.5 7c2-2.5 5-2.5 7 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".3" /></svg></div>
                <h3>Frost from the far edge</h3>
                <p>Blur and darkness follow the picture&apos;s own height above the hinge. The top dissolves first, colour leaks softly past the edges, and a faint band of light crosses the glass mid-fold. Near the hinge it stays readable to the end.</p>
              </article>
              <article className="card">
                <div className="icon"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                <h3>One curve, both ways</h3>
                <p>Nothing is a recorded animation. Every frame comes from the hinge angle, read a hundred times a second and smoothed with a spring. Stop halfway and it waits. Open again and it plays back through the same curve.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section tinted" id="styles">
          <div className="wrap">
            <h2>Three looks, or your own</h2>
            <p className="sub">Pick a style from the menu bar, or drag the sliders while the screen folds under your cursor.</p>
            <div className="cards three media">
              <figure className="card">
                <img src="/assets/look-duo.jpg" alt="Duo style at mid-fold" width="1280" height="800" loading="lazy" />
                <figcaption><strong>Duo</strong><span>The reference look. Starts at 95°, full frost 60° later.</span></figcaption>
              </figure>
              <figure className="card">
                <img src="/assets/look-soft.jpg" alt="Soft style at mid-fold" width="1280" height="800" loading="lazy" />
                <figcaption><strong>Soft</strong><span>Lighter frost, less darkness, a shallower lean.</span></figcaption>
              </figure>
              <figure className="card">
                <img src="/assets/look-cinematic.jpg" alt="Cinematic style at mid-fold" width="1280" height="800" loading="lazy" />
                <figcaption><strong>Cinematic</strong><span>Starts earlier, leans further, frosts harder.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="section" id="install">
          <div className="wrap">
            <div className="install-card">
              <div className="install-copy">
                <h2>Install in a minute</h2>
                <ol>
                  <li><strong>Download</strong> the disk image and drag Mac Duo to Applications.</li>
                  <li><strong>Open it.</strong> If macOS says it can&apos;t verify the developer, right-click the app and choose <em>Open</em>.</li>
                  <li><strong>Allow Screen Recording</strong> when asked. Mac Duo uses it to see the desktop for the second the lid is moving. Nothing is saved, nothing leaves the Mac.</li>
                </ol>
                <div className="cta">
                  <a className="button dark" href="https://github.com/ninobc/mac-duo/releases/latest"><DownloadIcon />Download Mac Duo</a>
                  <span className="meta">Version <Version /> · DMG · MIT license</span>
                </div>
              </div>
              <div className="install-art" aria-hidden="true">
                <img src="/assets/icon-1024.png" alt="" width="220" height="220" />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="wrap narrow">
            <h2>Questions</h2>
            <details><summary>Does it record my screen?</summary><p>No. Mac Duo starts a capture only when the lid is closing towards the fold angle, keeps frames on the GPU while the fold is on screen, and drops them the moment it ends. There are no files, no uploads, no accounts and no analytics. <a href="/privacy/">Privacy statement.</a></p></details>
            <details><summary>Will it slow my Mac down?</summary><p>Not when the lid is still: idle, it reads a sensor a few times a second and nothing else. While folding, one Metal pass a frame does all the work, which an M-series chip does comfortably at the display&apos;s full refresh rate.</p></details>
            <details><summary>What happens when the Mac sleeps?</summary><p>The fold ends when macOS puts the display to sleep near the end of the close. When you open the lid again, Mac Duo can bring the desktop back into focus from frost. Turn on &quot;Focus on Wake&quot; in the menu.</p></details>
            <details><summary>Does it work with an external display?</summary><p>The fold plays on the MacBook&apos;s own screen. External displays are left alone.</p></details>
            <details><summary>Which Macs have the sensor?</summary><p>MacBook Pro 14-inch and 16-inch from 2021 onwards, the 2019 16-inch MacBook Pro, and MacBook Air with M2 or later. The M1 MacBook Air and the 13-inch MacBook Pro don&apos;t have it; Mac Duo stays quiet on those.</p></details>
            <details><summary>Is it affiliated with Apple?</summary><p>No. Mac Duo is an independent project inspired by the iPhone Duo fold. iPhone, MacBook and macOS are trademarks of Apple Inc.</p></details>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <a className="brand" href="/"><img src="/assets/icon-180.png" width="24" height="24" alt="" /><span>Mac Duo</span></a>
        <p>© 2026 Nino Bouchedid · <a href="/privacy/">Privacy</a> · <a href="https://github.com/ninobc/mac-duo" rel="noopener">Source</a> · <a href="mailto:hello@mac-duo.com">hello@mac-duo.com</a></p>
        <p className="meta">Not affiliated with Apple. The MacBook Pro model shown is Apple&apos;s AR Quick Look asset, used for illustration only.</p>
      </div>
    </footer>
  );
}
