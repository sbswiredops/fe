'use client';

import { useEffect } from 'react';

export default function HMRErrorHandler() {
  useEffect(() => {
    const isDev = process.env.NODE_ENV !== 'production';

    const isHmrOrDevFetchError = (msg?: string, stack?: string) => {
      const hay = `${msg || ''}\n${stack || ''}`.toLowerCase();
      if (!hay.includes('failed to fetch')) return false;
      // Common Next.js HMR/dev keywords and routers
      const keywords = [
        'webpack',
        'hmr',
        'hot-reload',
        'hot-reloader',
        'hot-reloader-app',
        'fetch-server-response',
        'app-router-instance',
        '_next/static/chunks/webpack',
      ];
      if (keywords.some(k => hay.includes(k))) return true;
      // Frequent third-party dev scripts causing benign fetch errors
      const thirdParty = ['edge.fullstory.com', 'fs.js', 'fullstory'];
      return thirdParty.some(k => hay.includes(k));
    };

    // Handle unhandled promise rejections (common with HMR fetch failures)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isDev) return;
      const reason: any = event.reason || {};
      const msg = String(reason?.message || reason);
      const stack = String(reason?.stack || '');
      if (isHmrOrDevFetchError(msg, stack)) {
        event.preventDefault();
        console.warn('[dev] HMR/Dev fetch error suppressed:', reason);
      }
    };

    // Handle general errors
    const handleError = (event: ErrorEvent) => {
      if (!isDev) return;
      const msg = String(event?.message || '');
      const stack = String((event as any)?.error?.stack || '');
      if (isHmrOrDevFetchError(msg, stack)) {
        event.preventDefault();
        console.warn('[dev] HMR/Dev error suppressed:', event.error || msg);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
