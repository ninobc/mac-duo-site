import Nav from '@/components/Nav';
import FoldStage, { DownloadIcon } from '@/components/FoldStage';
import Version from '@/components/Version';

const DMG = 'https://github.com/ninobc/mac-duo/releases/latest/download/Mac-Duo.dmg';

export default function Home() {
  return (
    <>
      <a className="skip" href="#how">Skip to content</a>
      <Nav home />
      <main id="top">
        <FoldStage />

        <section className="strip" aria-label="Compatibility">
          <ul className="chips">
            <li>MacBook Pro 14″ and 16″</li><li>MacBook Air M2 and later</li><li>macOS 14 or later</li><li>Apple silicon and Intel</li><li>Free and open source</li>
          </ul>
        </section>

        <section className="section" id="how">
          <div className="wrap">
            <p className="kicker">How it works</p>
            <h2>The picture stays.<br />The glass moves.</h2>
            <p className="sub">On iPhone Duo, the interface never jumps between screens. It holds its place, and the folding glass moves over it. Mac Duo gives your MacBook the same idea.</p>
            <div className="cards three">
              <article className="card">
                <div className="icon"><svg viewBox="0 0 24 24"><path d="M4 6h16v10H4z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M2 19h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></div>
                <h3>Frozen in place</h3>
                <p>As the lid passes 92°, your desktop is pinned where it is in the room. Every pixel of the glass then shows what you would see of that picture through it.</p>
              </article>
              <article className="card">
                <div className="icon"><svg viewBox="0 0 24 24"><path d="M4 18c4-8 12-8 16 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M6 12c3-5 9-5 12 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".55" /><path d="M8.5 7c2-2.5 5-2.5 7 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".3" /></svg></div>
                <h3>Frost from the far edge</h3>
                <p>Blur and darkness follow the picture, not the screen. The far edge dissolves first. Light leaks past the sides. The hinge stays sharp to the end.</p>
              </article>
              <article className="card">
                <div className="icon"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                <h3>Driven by the hinge</h3>
                <p>Nothing is pre-rendered. The lid angle is read a hundred times a second and smoothed with a spring. Stop halfway and it waits. Open again and it plays back.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section tinted" id="styles">
          <div className="wrap">
            <p className="kicker">Styles</p>
            <h2>Three looks.<br />Or make it yours.</h2>
            <p className="sub">Switch styles from the menu bar. Or open Settings and drag the sliders while the screen folds under your cursor.</p>
            <div className="cards three media">
              <figure className="card">
                <img src="/assets/look-duo.jpg" alt="The Duo style at mid-fold" width="1280" height="800" loading="lazy" decoding="async" />
                <figcaption><strong>Duo</strong><span>The default. Starts at 92°, fully frosted 58° later.</span></figcaption>
              </figure>
              <figure className="card">
                <img src="/assets/look-soft.jpg" alt="The Soft style at mid-fold" width="1280" height="800" loading="lazy" decoding="async" />
                <figcaption><strong>Soft</strong><span>Lighter frost, less darkness, a shallower lean.</span></figcaption>
              </figure>
              <figure className="card">
                <img src="/assets/look-cinematic.jpg" alt="The Cinematic style at mid-fold" width="1280" height="800" loading="lazy" decoding="async" />
                <figcaption><strong>Cinematic</strong><span>Starts earlier. Leans further. Frosts harder.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="section" id="details">
          <div className="wrap">
            <p className="kicker">Under the glass</p>
            <h2>Built like it belongs there.</h2>
            <dl className="specs">
              <div><dt>Metal</dt><dd>One shader pass per frame, at your display&apos;s full refresh rate. Idle, it does nothing at all.</dd></div>
              <div><dt>100 Hz</dt><dd>The hinge sensor is read a hundred times a second, with prediction for fast closes and a spring for smooth ones.</dd></div>
              <div><dt>0 bytes</dt><dd>Frames live on the GPU for the moment the lid is moving. Nothing is saved. Nothing leaves your Mac.</dd></div>
              <div><dt>Focus on wake</dt><dd>Open the lid and the desktop comes back into focus from frost, through the same curve.</dd></div>
              <div><dt>Menu bar</dt><dd>A switch, three styles and the three sliders you actually reach for, without opening a window.</dd></div>
              <div><dt>Open source</dt><dd>Swift and Metal, no dependencies, MIT licensed. Read every line on GitHub.</dd></div>
            </dl>
          </div>
        </section>

        <section className="section" id="install">
          <div className="wrap">
            <div className="install-card">
              <div className="install-copy">
                <p className="kicker">Get Mac Duo</p>
                <h2>Up and running in a minute.</h2>
                <ol>
                  <li><strong>Download</strong> the disk image and drag Mac Duo to Applications.</li>
                  <li><strong>Open it.</strong> macOS will say it can&apos;t verify Mac Duo. Click Done, then in System Settings › Privacy &amp; Security choose <em>Open Anyway</em>. Once is enough.</li>
                  <li><strong>Allow Screen Recording</strong> when asked. It&apos;s how Mac Duo sees the desktop while the lid moves.</li>
                </ol>
                <div className="cta">
                  <a className="button dark" href={DMG}><DownloadIcon />Download Mac Duo</a>
                  <span className="meta">Version <Version /> · Free · <a href="https://github.com/ninobc/mac-duo/releases" rel="noopener">All releases</a></span>
                </div>
              </div>
              <div className="install-art" aria-hidden="true">
                <img src="/assets/icon-1024.png" alt="" width="220" height="220" loading="lazy" decoding="async" />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="wrap narrow">
            <h2>Questions</h2>
            <details><summary>Does it record my screen?</summary><p>No. Capture starts only while the lid is closing towards the fold angle, frames stay on the GPU while the fold is on screen, and they&apos;re dropped the moment it ends. No files, no uploads, no accounts, no analytics. <a href="/privacy/">Read the privacy statement.</a></p></details>
            <details><summary>Will it slow my Mac down?</summary><p>Not while the lid is still. Idle, Mac Duo reads a sensor a few times a second. Folding is one Metal pass per frame, which Apple silicon handles at the display&apos;s full refresh rate.</p></details>
            <details><summary>What happens when the Mac sleeps?</summary><p>The fold plays until the lid&apos;s magnet switches the display off, a few degrees before fully closed. That&apos;s hardware; no app can keep the panel lit with the lid shut. Turn on Focus on Wake and the desktop comes back into focus when you open the lid.</p></details>
            <details><summary>Why do I see the login screen instead of the wake reveal?</summary><p>macOS asks for your password immediately after the display turns off. Set System Settings › Lock Screen › &quot;Require password after display is turned off&quot; to a short delay, and reopening within it goes straight to your desktop, where Mac Duo plays the reveal. Mac Duo cannot draw over the login window.</p></details>
            <details><summary>Why does macOS say &quot;Mac Duo&quot; Not Opened?</summary><p>Mac Duo isn&apos;t notarized with Apple yet, so macOS can&apos;t look up its signature and shows that warning on first launch. It isn&apos;t a finding. Click Done, open System Settings › Privacy &amp; Security, scroll to the bottom and click Open Anyway. macOS remembers it. The source is public on <a href="https://github.com/ninobc/mac-duo" rel="noopener">GitHub</a>, and the app never touches the network except to check for updates.</p></details>
            <details><summary>Does it work with an external display?</summary><p>The fold plays on the MacBook&apos;s own screen. External displays are left alone.</p></details>
            <details><summary>Which Macs have the sensor?</summary><p>MacBook Pro 14-inch and 16-inch from 2021 on, the 2019 16-inch MacBook Pro, and MacBook Air with M2 or later. On other Macs, Mac Duo stays quiet.</p></details>
            <details><summary>How do updates work?</summary><p>Mac Duo checks GitHub Releases once a day, or whenever you choose Check for Updates. A new version downloads to your Downloads folder and opens, one drag from installed.</p></details>
            <details><summary>Is it affiliated with Apple?</summary><p>No. Mac Duo is an independent project inspired by the iPhone Duo fold. iPhone, MacBook and macOS are trademarks of Apple Inc.</p></details>
          </div>
        </section>
        <section className="section" id="coffee">
          <div className="wrap">
            <div className="coffee-card">
              <div className="coffee-cup" aria-hidden="true">
                <svg viewBox="0 0 64 64" width="72" height="72">
                  <g className="steam" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M24 20c-3-4 3-6 0-10" /><path d="M32 18c-3-4 3-6 0-10" /><path d="M40 20c-3-4 3-6 0-10" />
                  </g>
                  <path d="M14 28h34v12a12 12 0 0 1-12 12H26a12 12 0 0 1-12-12z" fill="currentColor" opacity=".92" />
                  <path d="M48 31h4a6 6 0 0 1 0 12h-4" fill="none" stroke="currentColor" strokeWidth="2.4" />
                  <path d="M12 56h40" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity=".5" />
                </svg>
              </div>
              <div className="coffee-copy">
                <p className="kicker">From the person who made this</p>
                <h2>Free, and made at 1 a.m.</h2>
                <p>Mac Duo started as a &quot;how hard can it be&quot; on a weeknight and turned into this. It&apos;s free, there&apos;s no pro version coming, and nothing in it phones home. If closing your MacBook became the best part of your day, a coffee keeps the next late night going.</p>
                <div className="cta">
                  <a className="button dark" href="https://pay.ziina.com/ninoo?source=app" rel="noopener" target="_blank">Buy me a coffee</a>
                  <span className="meta">Secure payment through Ziina · Thank you, genuinely.</span>
                </div>
              </div>
            </div>
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
        <p>© 2026 Nino Bouchedid · <a href="/privacy/">Privacy</a> · <a href="https://github.com/ninobc/mac-duo" rel="noopener">Source</a> · <a href="https://pay.ziina.com/ninoo?source=app" rel="noopener">Buy me a coffee</a> · <a href="mailto:hello@mac-duo.com">hello@mac-duo.com</a></p>
        <p className="meta">Not affiliated with Apple. The MacBook Pro model shown is Apple&apos;s AR Quick Look asset, used for illustration only.</p>
      </div>
    </footer>
  );
}
