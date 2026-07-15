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
    () => import('../pages/user/userDashoard'),
    () => import('../pages/user/KontribusiHistory'),
    () => import('../pages/user/UserKegiatan'),
    () => import('../pages/ZakatForm'),
    () => import('../pages/user/Crowdfunding')
  ]);
};

export const preloadAdminDashboardPages = () => {
  preload([
    () => import('../pages/admin/Dashboard'),
    () => import('../pages/admin/Kegiatan'),
    () => import('../pages/admin/Kas.jsx'),
    () => import('../pages/admin/Donasi'),
    () => import('../pages/admin/UserAccess'),
    () => import('../pages/admin/VerifikasiTransaksi'),
    () => import('../pages/admin/TransparansiAdmin'),
    () => import('../pages/admin/ZakatSettings')
  ]);
};
