/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WalletProvider } from '../lib/genlayer/WalletProvider';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Views
import { LandingView } from './views/LandingView';
import { BoardView } from './views/BoardView';
import { FileDisputeView } from './views/FileDisputeView';
import { CaseFileView } from './views/CaseFileView';
import { ResolveConfirmView } from './views/ResolveConfirmView';
import { AppealView } from './views/AppealView';
import { VerdictRecordView } from './views/VerdictRecordView';

export default function App() {
  // Path parser
  const getInitialPath = () => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) return hash;
    return window.location.pathname || '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  // Sync with browser popstate
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(getInitialPath());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Navigation helper
  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching logic
  const renderRoute = () => {
    // 1. Landing: /
    if (currentPath === '/' || currentPath === '') {
      return (
        <LandingView
          onNavigate={navigate}
          onSelectDispute={(id) => navigate(`/disputes/${id}`)}
        />
      );
    }

    // 2. Discover / Board: /disputes
    if (currentPath === '/disputes') {
      return (
        <BoardView
          onNavigate={navigate}
          onSelectDispute={(id) => navigate(`/disputes/${id}`)}
        />
      );
    }

    // 3. File Dispute: /disputes/new
    if (currentPath === '/disputes/new') {
      return (
        <FileDisputeView
          onNavigate={navigate}
          onDisputeCreated={(id) => navigate(`/disputes/${id}`)}
        />
      );
    }

    // 4. Resolve: /disputes/:id/resolve
    const resolveMatch = currentPath.match(/^\/disputes\/([^/]+)\/resolve$/);
    if (resolveMatch) {
      const id = resolveMatch[1];
      return (
        <ResolveConfirmView
          disputeId={id}
          onNavigate={navigate}
          onResolved={(resolvedId) => navigate(`/disputes/${resolvedId}`)}
        />
      );
    }

    // 5. Appeal: /disputes/:id/appeal
    const appealMatch = currentPath.match(/^\/disputes\/([^/]+)\/appeal$/);
    if (appealMatch) {
      const id = appealMatch[1];
      return (
        <AppealView
          disputeId={id}
          onNavigate={navigate}
          onAppealed={(appealedId) => navigate(`/disputes/${appealedId}`)}
        />
      );
    }

    // 6. Record Certificate: /disputes/:id/record
    const recordMatch = currentPath.match(/^\/disputes\/([^/]+)\/record$/);
    if (recordMatch) {
      const id = recordMatch[1];
      return (
        <VerdictRecordView
          disputeId={id}
          onNavigate={navigate}
        />
      );
    }

    // 7. Case File: /disputes/:id
    const caseMatch = currentPath.match(/^\/disputes\/([^/]+)$/);
    if (caseMatch) {
      const id = caseMatch[1];
      return (
        <CaseFileView
          disputeId={id}
          onNavigate={navigate}
        />
      );
    }

    // Fallback: Default to landing
    return (
      <LandingView
        onNavigate={navigate}
        onSelectDispute={(id) => navigate(`/disputes/${id}`)}
      />
    );
  };

  return (
    <WalletProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-[#07090E] text-[#D1D5DB]">
          {/* Shared Top Navigation */}
          <Navbar currentRoute={currentPath} onNavigate={navigate} />

          {/* Active View Container */}
          <main className="flex-1 w-full pb-16">
            {renderRoute()}
          </main>

          {/* Shared Broadcast Desk Footer */}
          <Footer />
        </div>
      </ToastProvider>
    </WalletProvider>
  );
}
