import Nav from '@/components/Nav';

export const metadata = {
  title: 'Privacy — Mac Duo',
  description: 'What Mac Duo does with your screen: nothing that leaves the Mac.',
};

export default function Privacy() {
  return (
    <>
      <Nav />
      <main className="wrap prose">
        <h1>Privacy</h1>
        <p className="meta">Last updated September 11, 2026</p>
        <p>Mac Duo is a small app that runs on your Mac and nowhere else. This page says exactly what it touches.</p>
        <h2>Your screen</h2>
        <p>To fold the desktop, Mac Duo has to see it. It asks macOS for Screen Recording access once. With that access it captures the built-in display only while the lid is closing towards the fold angle and while the fold is on screen. Frames are handed to the GPU as textures and discarded when the fold ends. Mac Duo never writes a frame to disk and never sends one anywhere.</p>
        <h2>The lid angle</h2>
        <p>The hinge angle comes from a sensor built into recent MacBooks. Reading it needs no permission and reveals nothing about you. Mac Duo can show the angle in the menu bar if you ask it to.</p>
        <h2>Network</h2>
        <p>The only network request Mac Duo makes is a check for new versions: a small JSON file at <code>mac-duo.com/updates.json</code>, at most once a day, sending only the app&apos;s name and version in the request headers. You can turn this off in Settings › General. Nothing else talks to the internet. There are no analytics, no crash reporting and no accounts.</p>
        <h2>Settings</h2>
        <p>Your preferences are stored in the standard macOS defaults for the app on your Mac. Nothing is synced.</p>
        <h2>Contact</h2>
        <p>Questions go to <a href="mailto:hello@mac-duo.com">hello@mac-duo.com</a>.</p>
      </main>
      <footer><div className="wrap"><p>© 2026 Nino Bouchedid · <a href="/">Home</a></p></div></footer>
    </>
  );
}
