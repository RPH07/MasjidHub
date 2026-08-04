const runIdle = (callback) => {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }

  window.setTimeout(callback, 0);
};

const preload = (imports) => {
  runIdle(() => {
    imports.forEach((loadPage) => {
      loadPage().catch(() => {
      });
    });
  });
};

export const preloadUserDashboardPages = () => {
  preload([
    () => import('@/pages/user/UserDashboard'),
    () => import('@/pages/user/ContributionHistory'),
    () => import('@/pages/user/UserActivities'),
    () => import('@/pages/ZakatForm'),
    () => import('@/pages/user/DonationPrograms')
  ]);
};

export const preloadAdminDashboardPages = () => {
  preload([
    () => import('@/pages/admin/Dashboard'),
    () => import('@/pages/admin/Activities'),
    () => import('@/pages/admin/Cash.jsx'),
    () => import('@/pages/admin/Donations'),
    () => import('@/pages/admin/UserAccess'),
    () => import('@/pages/admin/TransactionVerification'),
    () => import('@/pages/admin/AdminTransparency'),
    () => import('@/pages/admin/ZakatSettings')
  ]);
};
