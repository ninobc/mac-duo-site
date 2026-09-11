'use client';
import { useEffect, useState } from 'react';

// The latest version, from the same feed the app polls.
export default function Version() {
  const [version, setVersion] = useState('1.0.0');
  useEffect(() => {
    fetch('/updates.json').then(r => r.json()).then(u => { if (u.version) setVersion(u.version); }).catch(() => {});
  }, []);
  return <span>{version}</span>;
}
