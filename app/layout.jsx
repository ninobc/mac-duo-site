import { Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', variable: '--font-serif', display: 'swap' });

export const metadata = {
  metadataBase: new URL('https://mac-duo.com'),
  title: 'Mac Duo — Close the lid. The desktop stays.',
  description: "Mac Duo brings the iPhone Duo fold to your MacBook. As the lid comes down, what's on screen holds still in the room and softens into frosted light. Free, open source, macOS 14+.",
  openGraph: {
    title: 'Mac Duo — Close the lid. The desktop stays.',
    description: 'The iPhone Duo fold, on your MacBook. Free and open source.',
    url: 'https://mac-duo.com',
    type: 'website',
    images: ['/assets/og.png'],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/assets/favicon.png', apple: '/assets/icon-180.png' },
};

export const viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
