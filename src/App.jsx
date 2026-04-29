import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import demoData from './data/solar-data.json';
import Header from './components/Header.jsx';
import DashboardTabs, { TAB_IDS } from './components/DashboardTabs.jsx';
import KpiCards from './components/KpiCards.jsx';
import PerformanceCharts from './components/PerformanceCharts.jsx';
import Insights from './components/Insights.jsx';
import EnvironmentalImpact from './components/EnvironmentalImpact.jsx';
import SystemsTable from './components/SystemsTable.jsx';
import SystemHealthReport from './components/SystemHealthReport.jsx';
import PeriodUnifiedView from './components/PeriodUnifiedView.jsx';
import SolarSummaryHub from './components/SolarSummaryHub.jsx';
import Footer from './components/Footer.jsx';
import { unifyPeriods } from './upload/periodUnifier.js';
import { filterUnifiedPeriods } from './upload/filterUnifiedPeriods.js';
import { loadHomeworkData } from './upload/demoSeed.js';
import { AccountProvider, useAccount } from './account/AccountContext.jsx';
import AuthScreen from './account/AuthScreen.jsx';
import UploadModal from './upload/UploadModal.jsx';
import EmptyState from './upload/EmptyState.jsx';

const SOLAR_TABS = [TAB_IDS.performance, TAB_IDS.health, TAB_IDS.environment, TAB_IDS.systems];

/** אובייקט ריק {} או חלקי — דורש totals מלאים ו-systems כדי שלא יקרסו KPI/גרפים */
function isRenderableSolar(obj) {
  if (!obj || typeof obj !== 'object' || !obj.totals || !Array.isArray(obj.systems)) return false;
  const t = obj.totals;
  const sc = Number(t.systems_count);
  const prod = Number(t.total_production_kwh);
  if (!Number.isFinite(sc) || sc < 0) return false;
  if (!Number.isFinite(prod)) return false;
  return true;
}

export default function App() {
  return (
    <AccountProvider>
      <Shell />
    </AccountProvider>
  );
}

function Shell() {
  const { currentUser, data, setHomeTaskData } = useAccount();
  const [guestMode, setGuestMode] = useState(false);
  const [homeTaskMode, setHomeTaskMode] = useState(false);
  const [isLoadingHomeTask, setIsLoadingHomeTask] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [guestBundle, setGuestBundle] = useState(null);
  const [periodSelection, setPeriodSelection] = useState('all');
  const [activeTab, setActiveTab] = useState(TAB_IDS.performance);
  const [deletedPeriods, setDeletedPeriods] = useState([]);
  const hadPeriodView = useRef(false);

  const isGuest = !currentUser && (guestMode || homeTaskMode);

  const handleHomeTask = async () => {
    setHomeTaskMode(true);
    setIsLoadingHomeTask(true);
    try {
      const b = await loadHomeworkData();
      setGuestBundle(b);
    } catch (e) {
      console.error(e);
      alert('שגיאה בטעינת נתוני משימת הבית');
    } finally {
      setIsLoadingHomeTask(false);
    }
  };

  useEffect(() => {
    if (!isGuest) {
      setGuestBundle(null);
      setHomeTaskMode(false);
      setGuestMode(false);
    }
  }, [isGuest]);

  const rawSolar = isGuest ? guestBundle?.solarSystems : data.solarSystems;
  let solar = isGuest
    ? (isRenderableSolar(rawSolar) ? rawSolar : demoData)
    : (isRenderableSolar(rawSolar) ? rawSolar : null);
  const summary = isGuest ? guestBundle?.summary : data.summary;
  const bills = isGuest ? (guestBundle?.bills || []) : (data.bills || []);

  const unified = useMemo(() => {
    if (!summary?.periods?.length && !bills.length) return null;
    try {
      const copySummary = summary ? { ...summary, periods: summary.periods.filter(p => !deletedPeriods.includes(p.label)) } : summary;
      return unifyPeriods({ summary: copySummary, bills, solar });
    } catch (e) {
      console.error('unifyPeriods failed', e);
      return null;
    }
  }, [summary, bills, solar, deletedPeriods]);

  if (!solar && unified) {
    solar = {
      period: 'כל התקופות',
      totals: {
        systems_count: 1,
        total_capacity_kwp: 0,
        total_production_kwh: unified.totals.production_kwh || 0,
        total_revenue_nis: unified.totals.net_solar_profit_nis || 0,
        weighted_avg_tariff_nis_per_kwh: bills.length > 0 ? (bills[0].avg_price_agorot / 100 || 0) : 0,
        avg_specific_yield_kwh_per_kwp: 0,
        group_benchmark_kwh_per_kwp: 0,
        median_specific_yield_kwh_per_kwp: 0,
        std_dev_yield_kwh_per_kwp: 0
      },
      systems: [],
      health: { faulty: [], underperformers: [], lost_kwh: 0, lost_revenue_nis: 0 },
      top5: [],
      environmental: {
        co2_kg_per_kwh: 0.434,
        co2_kg_saved: (unified.totals.production_kwh || 0) * 0.434,
        co2_tons_saved: ((unified.totals.production_kwh || 0) * 0.434) / 1000,
        trees_equivalent_year: Math.round(((unified.totals.production_kwh || 0) * 0.434) / 21),
        cars_equivalent_year: ((unified.totals.production_kwh || 0) * 0.434) / 4600,
        km_equivalent: Math.round(((unified.totals.production_kwh || 0) * 0.434) / 0.12),
        households_powered_month: (unified.totals.production_kwh || 0) / 583,
        coal_kg_saved: Math.round((unified.totals.production_kwh || 0) * 0.45),
        smartphone_charges: Math.round((unified.totals.production_kwh || 0) / 0.012),
      },
      synthesized: true
    };
  }

  const filteredUnified = useMemo(
    () => filterUnifiedPeriods(unified, periodSelection),
    [unified, periodSelection],
  );

  const hasAnyData = !!solar || !!summary || (bills.length > 0);
  const hasPeriodView = !!unified;
  const showTabs = hasPeriodView || !!solar;

  /** מונע מסך ריק: משתמש עם סיכום בלי קובץ ייצור לא יישאר על «ביצועים» ללא תוכן */
  const effectiveTab = useMemo(() => {
    const summaryOk = hasPeriodView && activeTab === TAB_IDS.summary;
    const solarOk = !!solar && SOLAR_TABS.includes(activeTab);
    if (summaryOk || solarOk) return activeTab;
    if (hasPeriodView) return TAB_IDS.summary;
    if (solar) return TAB_IDS.performance;
    return TAB_IDS.performance;
  }, [activeTab, hasPeriodView, solar]);

  useEffect(() => {
    if (hasPeriodView && !hadPeriodView.current) {
      setActiveTab(TAB_IDS.performance);
    }
    hadPeriodView.current = hasPeriodView;
  }, [hasPeriodView]);

  const scrollToSummary = useCallback(() => {
    setActiveTab(TAB_IDS.summary);
    requestAnimationFrame(() => {
      document.getElementById('solar-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        || document.getElementById('periods')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  if (!currentUser && !guestMode && !homeTaskMode) {
    return <AuthScreen onGuest={() => setGuestMode(true)} onHomeTask={handleHomeTask} />;
  }

  if (isLoadingHomeTask) {
    return (
      <div className="min-h-screen bg-hero-light flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-brand-green-200 border-t-brand-green-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-brand-ink-900">טוען את נתוני המשימה...</h2>
        <p className="text-brand-ink-500 mt-2 text-center max-w-sm">מנתח קבצי PDF ואקסל באופן מקומי בדפדפן.</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <Header
          period={solar?.period || ''}
          isGuest={isGuest}
          hasPeriodData={hasPeriodView}
          hasSolarData={!!solar}
          activeTab={effectiveTab}
          onTabChange={setActiveTab}
          onUpload={() => setUploadOpen(true)}
          onExitGuest={() => setGuestMode(false)}
        />

        {!isGuest && !hasAnyData && (
          <EmptyState onUpload={() => setUploadOpen(true)} />
        )}

        <div id="dashboard-panels">
        {showTabs && (
          <DashboardTabs
            activeTab={effectiveTab}
            onTabChange={setActiveTab}
            hasPeriodView={hasPeriodView}
            hasSolar={!!solar}
            isSynthesized={solar?.synthesized}
          />
        )}

        <div className="pb-8">
          {effectiveTab === TAB_IDS.summary && hasPeriodView && (
            <>
              <SolarSummaryHub
                unifiedFull={unified}
                unifiedFiltered={filteredUnified}
                selection={periodSelection}
                onSelectionChange={setPeriodSelection}
                summary={summary}
                bills={bills}
              />
              <PeriodUnifiedView 
                unified={filteredUnified} 
                onDeletePeriod={(label) => {
                  if (window.confirm('האם אתה בטוח שברצונך למחוק תקופה זו?')) {
                    setDeletedPeriods(prev => [...prev, label]);
                  }
                }}
              />
            </>
          )}

          {effectiveTab === TAB_IDS.performance && solar && (
            <>
              <KpiCards data={solar} />
              <PerformanceCharts data={solar} />
              <Insights data={solar} />
            </>
          )}

          {effectiveTab === TAB_IDS.health && solar && <SystemHealthReport data={solar} />}

          {effectiveTab === TAB_IDS.environment && solar && <EnvironmentalImpact data={solar} />}

          {effectiveTab === TAB_IDS.systems && solar && <SystemsTable data={solar} />}
        </div>
        </div>

        <Footer period={solar?.period || ''} generatedAt={solar?.generated_at || new Date().toISOString()} />
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={scrollToSummary}
      />
    </>
  );
}
