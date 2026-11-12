import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HeroBackgroundAnimation } from './components/HeroBackgroundAnimation';
import { TrustBar } from './components/TrustBar';
import { WorkflowPillars } from './components/WorkflowPillars';
import { BeforeAfterComparison } from './components/BeforeAfterComparison';
import { WhyPracticesSwitch } from './components/WhyPracticesSwitch';
import { SecurityCompliance } from './components/SecurityCompliance';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { DemoModal } from './components/DemoModal';
import { KyneraApp } from './components/app/KyneraApp';
import type { DashboardTab } from './data/dashboardData';

const VALID_TABS: DashboardTab[] = ['overview', 'calls', 'schedule', 'patients', 'claims', 'studio'];

function parseAppRoute(hash: string): { isApp: boolean; tab: DashboardTab } {
  if (!hash.startsWith('#/app')) {
    return { isApp: false, tab: 'overview' };
  }
  const slug = hash.replace(/^#\/app\/?/, '').toLowerCase() as DashboardTab;
  const tab = VALID_TABS.includes(slug) ? slug : 'overview';
  return { isApp: true, tab };
}

export function App() {
  const [route, setRoute] = useState(() => parseAppRoute(window.location.hash));
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoInitialEmail, setDemoInitialEmail] = useState('');

  useEffect(() => {
    const onHashChange = () => {
      const next = parseAppRoute(window.location.hash);
      setRoute(next);
      if (next.isApp) {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateToApp = (tab: DashboardTab = 'overview') => {
    window.location.hash = tab === 'overview' ? '#/app' : `#/app/${tab}`;
  };

  const navigateToLanding = () => {
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const openDemoModal = (email?: string) => {
    if (typeof email === 'string' && email.trim().length > 0) {
      setDemoInitialEmail(email.trim());
    }
    setIsDemoModalOpen(true);
  };

  const closeDemoModal = () => {
    setIsDemoModalOpen(false);
  };

  if (route.isApp) {
    return (
      <KyneraApp
        activeTab={route.tab}
        onSelectTab={navigateToApp}
        onNavigateHome={navigateToLanding}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-white text-text-body font-sans selection:bg-brand-teal/20 selection:text-brand-navy">
      {/* Top Hero Container with continuous downward gradient behind floating header */}
      <div className="hero-gradient-bg relative w-full overflow-hidden">
        {/* Animated Clinical Telemetry & Biometric Wave Background */}
        <HeroBackgroundAnimation />

        {/* Floating Detached Header */}
        <Header onRequestDemo={openDemoModal} />

        {/* Hero Section with Dashboard Showcase */}
        <div id="agents" className="relative z-10">
          <Hero onRequestDemo={openDemoModal} />
        </div>

        {/* Trust Bar with Integrations (seamlessly positioned on white gradient bottom) */}
        <div className="relative z-10">
          <TrustBar />
        </div>
      </div>

      <main className="flex-grow">
        {/* Four Workflows */}
        <div id="workflows">
          <WorkflowPillars onRequestDemo={openDemoModal} />
        </div>

        {/* "A morning without Kynera vs. with it" Scorecard */}
        <BeforeAfterComparison />

        {/* Why Practices Switch */}
        <div id="pricing">
          <WhyPracticesSwitch />
        </div>

        {/* Security & Compliance */}
        <div id="security">
          <SecurityCompliance onRequestSecurityPacket={openDemoModal} />
        </div>

        {/* Frequently Asked Questions */}
        <FAQ />

        {/* Final CTA */}
        <FinalCTA onRequestDemo={openDemoModal} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Live Demo Request Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={closeDemoModal} initialEmail={demoInitialEmail} />
    </div>
  );
}

export default App;
