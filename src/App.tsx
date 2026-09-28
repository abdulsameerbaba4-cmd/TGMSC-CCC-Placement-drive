import React, { useEffect, useState } from 'react';
import { api } from './services/api.ts';
import {
  User,
  Student,
  AppNotification,
  PlacementDrive,
  AptitudeTest,
  Interview,
} from './types/index.ts';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal.tsx';
import { AdminDashboard } from './components/dashboard/AdminDashboard.tsx';
import { StudentManagement } from './components/students/StudentManagement.tsx';
import { CompanyManagement } from './components/companies/CompanyManagement.tsx';
import { DriveManagement } from './components/drives/DriveManagement.tsx';
import { ApplicationManagement } from './components/applications/ApplicationManagement.tsx';
import { QuestionBankManagement } from './components/assessments/QuestionBankManagement.tsx';
import { AssessmentManagement } from './components/assessments/AssessmentManagement.tsx';
import { ExamSecurityDashboard } from './components/assessments/ExamSecurityDashboard.tsx';
import { InterviewManagement } from './components/interviews/InterviewManagement.tsx';
import { ShortlistDashboard } from './components/shortlists/ShortlistDashboard.tsx';
import { NotificationCenter } from './components/notifications/NotificationCenter.tsx';
import { AutomationCenter } from './components/automations/AutomationCenter.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { StudentPortal } from './components/student-portal/StudentPortal.tsx';
import { PublicLandingPage } from './components/portal/PublicLandingPage.tsx';
import { StudentExamEntryModal } from './components/portal/StudentExamEntryModal.tsx';
import { InterviewTimeModal } from './components/portal/InterviewTimeModal.tsx';
import { SecureExamRoom } from './components/student-portal/SecureExamRoom.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [viewMode, setViewMode] = useState<'portal' | 'app'>('portal'); // Default to public portal view
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Global Modals & Exam Room Session
  const [isGlobalExamModalOpen, setIsGlobalExamModalOpen] = useState(false);
  const [isGlobalInterviewModalOpen, setIsGlobalInterviewModalOpen] = useState(false);
  const [selectedDriveForExam, setSelectedDriveForExam] = useState<string | undefined>();
  const [selectedSlotForExam, setSelectedSlotForExam] = useState<string | undefined>();
  const [activeExamSession, setActiveExamSession] = useState<{
    testId: string;
    studentInfo?: any;
  } | null>(null);

  // Stats for badge alerts
  const [securityIncidentCount, setSecurityIncidentCount] = useState(0);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      setLoading(true);
      const [meRes, usersData, notifsData, secStats, drivesData, testsData, interviewsData] =
        await Promise.all([
          api.getMe(),
          api.getUsers(),
          api.getNotifications(),
          api.getSecurityStats(),
          api.getDrives().catch(() => []),
          api.getTests().catch(() => []),
          api.getInterviews().catch(() => []),
        ]);

      setCurrentUser(meRes.user);
      setCurrentStudent(meRes.student || null);
      setUsers(usersData);
      setNotifications(notifsData);
      setDrives(drivesData);
      setTests(testsData);
      setInterviews(interviewsData);

      if (secStats) {
        setSecurityIncidentCount(secStats.autoSubmittedAttempts || 0);
      }

      // Default active tab based on role
      if (meRes.user?.role === 'student') {
        setActiveTab('student_dashboard');
      } else {
        setActiveTab('dashboard');
      }
    } catch (e) {
      console.error('Initialization error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    try {
      const res = await api.switchRole({ userId: user.id });
      setCurrentUser(res.user);
      setCurrentStudent(res.student || null);
      const notifs = await api.getNotifications();
      setNotifications(notifs);

      if (res.user.role === 'student') {
        setActiveTab('student_dashboard');
      } else {
        setActiveTab('dashboard');
      }
      setViewMode('app');
    } catch (e) {
      console.error('Failed switching role', e);
    }
  };

  const handleLoginAsRole = async (
    role: 'student' | 'super_admin' | 'placement_officer' | 'recruiter'
  ) => {
    const targetUser =
      users.find((u) => u.role === role) ||
      users.find((u) => (role === 'placement_officer' ? u.role === 'super_admin' : false)) ||
      users[0];

    if (targetUser) {
      await handleSelectUser(targetUser);
    } else {
      setViewMode('app');
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleQuickAction = (action: string) => {
    setViewMode('app');
    if (action === 'create_drive') setActiveTab('drives');
    else if (action === 'schedule_interview') setActiveTab('interviews');
    else if (action === 'add_student') setActiveTab('students');
    else if (action === 'add_question') setActiveTab('questions');
  };

  const handleGlobalSearch = (query: string) => {
    if (!query) return;
    setViewMode('app');
    if (query.toLowerCase().includes('drive') || query.toLowerCase().includes('job')) {
      setActiveTab(currentUser?.role === 'student' ? 'student_drives' : 'drives');
    } else {
      setActiveTab(currentUser?.role === 'student' ? 'student_drives' : 'students');
    }
  };

  const handleNavigateFromPortal = (section: string) => {
    setViewMode('app');
    setActiveTab(section);
  };

  const handleOpenExamFormWithSlot = (driveId?: string, slot?: string) => {
    setSelectedDriveForExam(driveId);
    setSelectedSlotForExam(slot);
    setIsGlobalExamModalOpen(true);
  };

  const handleLaunchExam = (testId: string, studentInfo: any) => {
    setActiveExamSession({ testId, studentInfo });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-lg font-bold">PlacementFlow</h2>
          <p className="text-xs text-slate-400 mt-1">Starting placement automation workspace...</p>
        </div>
      </div>
    );
  }

  // 1. Fullscreen Active Secure Exam Room View
  if (activeExamSession) {
    return (
      <SecureExamRoom
        testId={activeExamSession.testId}
        studentInfo={activeExamSession.studentInfo}
        onExit={() => {
          setActiveExamSession(null);
          initApp();
        }}
      />
    );
  }

  // 2. Public Government & University Portal View ("like this website")
  if (viewMode === 'portal') {
    return (
      <>
        <PublicLandingPage
          drives={drives}
          tests={tests}
          interviews={interviews}
          onLoginAs={handleLoginAsRole}
          onNavigateToSection={handleNavigateFromPortal}
          onLaunchExamDirectly={handleLaunchExam}
          onSwitchToDashboard={() => setViewMode('app')}
        />

        {/* Role Switcher Modal */}
        <RoleSwitcherModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          currentUser={currentUser}
          users={users}
          onSelectUser={handleSelectUser}
        />
      </>
    );
  }

  const isStudent = currentUser?.role === 'student';

  // 3. Authenticated Admin / Student Application Console
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* App Shell */}
      <div className="flex h-screen overflow-hidden">
        {/* Dark Enterprise Sidebar (Desktop & Mobile Drawer) */}
        <div
          className={`fixed inset-y-0 left-0 z-40 lg:static lg:z-auto transition-transform duration-200 ${
            sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar
            user={currentUser}
            activeTab={activeTab}
            onNavigate={(tab) => {
              if (tab === 'portal') {
                setViewMode('portal');
              } else {
                setActiveTab(tab);
              }
              setSidebarMobileOpen(false);
            }}
            securityAlertCount={securityIncidentCount}
            unreadNotificationsCount={notifications.filter((n) => !n.read).length}
            onOpenRoleSwitcher={() => setIsRoleModalOpen(true)}
          />
        </div>

        {/* Mobile backdrop */}
        {sidebarMobileOpen && (
          <div
            onClick={() => setSidebarMobileOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <Header
            user={currentUser}
            notifications={notifications}
            onOpenRoleSwitcher={() => setIsRoleModalOpen(true)}
            onNavigate={(tab) => {
              if (tab === 'portal') setViewMode('portal');
              else setActiveTab(tab);
            }}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onOpenQuickAction={handleQuickAction}
            toggleSidebarMobile={() => setSidebarMobileOpen(!sidebarMobileOpen)}
            onGlobalSearch={handleGlobalSearch}
            onGoToPortal={() => setViewMode('portal')}
            onOpenExamForm={() => handleOpenExamFormWithSlot()}
            onOpenInterviewTimes={() => setIsGlobalInterviewModalOpen(true)}
          />

          {/* Viewport Content Area */}
          <main className="flex-1 overflow-y-auto bg-slate-50">
            {/* Student View Routes */}
            {isStudent ? (
              <StudentPortal
                user={currentUser!}
                student={currentStudent}
                activeSubTab={activeTab}
                onRefreshUser={initApp}
              />
            ) : (
              /* Admin Console Routes */
              <>
                {activeTab === 'dashboard' && (
                  <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />
                )}
                {activeTab === 'students' && <StudentManagement />}
                {activeTab === 'companies' && <CompanyManagement />}
                {activeTab === 'drives' && (
                  <DriveManagement
                    onNavigate={(tab) => setActiveTab(tab)}
                    onOpenTestForDrive={() => setActiveTab('tests')}
                  />
                )}
                {activeTab === 'applications' && <ApplicationManagement />}
                {activeTab === 'tests' && (
                  <AssessmentManagement onNavigateToSecurity={() => setActiveTab('security')} />
                )}
                {activeTab === 'questions' && <QuestionBankManagement />}
                {activeTab === 'shortlists' && <ShortlistDashboard />}
                {activeTab === 'interviews' && <InterviewManagement />}
                {activeTab === 'notifications' && (
                  <NotificationCenter onNavigate={(tab) => setActiveTab(tab)} />
                )}
                {activeTab === 'security' && <ExamSecurityDashboard />}
                {activeTab === 'reports' && <ReportsView />}
                {activeTab === 'automations' && <AutomationCenter />}
                {activeTab === 'settings' && <SettingsView onRefreshData={initApp} />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
      />

      {/* Global Student Exam Entry Form Modal */}
      <StudentExamEntryModal
        isOpen={isGlobalExamModalOpen}
        onClose={() => setIsGlobalExamModalOpen(false)}
        drives={drives}
        tests={tests}
        initialDriveId={selectedDriveForExam}
        initialSlot={selectedSlotForExam}
        onLaunchExam={handleLaunchExam}
      />

      {/* Global Interview Time & Schedule Modal */}
      <InterviewTimeModal
        isOpen={isGlobalInterviewModalOpen}
        onClose={() => setIsGlobalInterviewModalOpen(false)}
        interviews={interviews}
        drives={drives}
        onOpenExamFormForSlot={handleOpenExamFormWithSlot}
      />
    </div>
  );
}
