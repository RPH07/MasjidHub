import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import api from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/form';

const roleLabels = {
  admin: 'Admin',
  dkm: 'Pengurus DKM',
  jamaah: 'Jamaah'
};

const jabatanLabels = {
  ketua_dkm: 'Ketua DKM',
  bendahara: 'Bendahara',
  sekretaris: 'Sekretaris',
  anggota_dkm: 'Anggota DKM'
};

const statusLabels = {
  active: 'Aktif',
  deletion_requested: 'Menunggu Penghapusan',
  inactive: 'Tidak Aktif'
};

const MIN_PASSWORD_LENGTH = 6;

const getInitials = (name = '') => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'U';
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('');
};

const PasswordInput = ({ label, name, autoComplete, show, value, onChange, onToggle }) => (
  <FloatingInput
    id={name}
    label={label}
    name={name}
    type={show ? 'text' : 'password'}
    value={value}
    onChange={onChange}
    autoComplete={autoComplete}
    inputClassName="border-gray-300 focus:ring-green-500"
    labelFocusClass="peer-focus:text-green-600"
    required
    rightElement={(
      <Button
        type="button"
        onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
        aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    )}
    rightElementClassName="right-1"
  />
);

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    password: false,
    confirmPassword: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/me');
        if (!active) return;

        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        toast.error(error.response?.data?.msg || error.response?.data?.message || 'Gagal memuat profil');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const profileItems = useMemo(() => {
    const items = [
      {
        label: 'Email',
        value: user?.email || '-',
        icon: <Mail className="h-5 w-5" />
      },
      {
        label: 'Akses',
        value: roleLabels[user?.role] || user?.role || '-',
        icon: <ShieldCheck className="h-5 w-5" />
      }
    ];

    if (user?.role !== 'jamaah') {
      items.push({
        label: 'Jabatan',
        value: user?.jabatan ? jabatanLabels[user.jabatan] || user.jabatan : 'Administrator Sistem',
        icon: <UserRound className="h-5 w-5" />
      });
    }

    items.push({
      label: 'Status',
      value: statusLabels[user?.status] || user?.status || '-',
      icon: <LockKeyhole className="h-5 w-5" />
    });

    return items;
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password baru minimal ${MIN_PASSWORD_LENGTH} karakter`);
      return;
    }

    try {
      setSaving(true);
      const response = await api.patch('/user/me/password', formData);
      toast.success(response.data?.msg || 'Password berhasil diperbarui');
      setFormData({
        currentPassword: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.msg || error.response?.data?.message || 'Gagal memperbarui password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6 text-sm text-gray-500">
        Memuat profil...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <section className="rounded-lg border bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-green-600 text-xl font-semibold text-white">
              {getInitials(user?.nama)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{user?.nama || 'User'}</h2>
              <p className="mt-1 text-sm text-gray-500">
                Kelola info akun dan keamanan login.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            {roleLabels[user?.role] || user?.role || 'User'}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {profileItems.map((item) => (
          <div key={item.label} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <p className="mt-3 wrap-break-word text-base font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Detail Profil</h3>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Nama Lengkap</dt>
              <dd className="mt-1 font-medium text-gray-900">{user?.nama || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email Login</dt>
              <dd className="mt-1 wrap-break-word font-medium text-gray-900">{user?.email || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Catatan</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">
                Foto profil memakai inisial otomatis supaya aplikasi tidak perlu menyimpan gambar tambahan.
              </dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ganti Password</h3>
              <p className="text-sm text-gray-500">
                Masukkan password lama. Password baru minimal {MIN_PASSWORD_LENGTH} karakter.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <PasswordInput
              label="Password Saat Ini"
              name="currentPassword"
              autoComplete="current-password"
              show={showPassword.currentPassword}
              value={formData.currentPassword}
              onChange={handleChange}
              onToggle={() => togglePassword('currentPassword')}
            />
            <PasswordInput
              label="Password Baru"
              name="password"
              autoComplete="new-password"
              show={showPassword.password}
              value={formData.password}
              onChange={handleChange}
              onToggle={() => togglePassword('password')}
            />
            <p className="-mt-2 text-xs text-gray-500">
              Gunakan minimal {MIN_PASSWORD_LENGTH} karakter.
            </p>
            <PasswordInput
              label="Konfirmasi Password Baru"
              name="confirmPassword"
              autoComplete="new-password"
              show={showPassword.confirmPassword}
              value={formData.confirmPassword}
              onChange={handleChange}
              onToggle={() => togglePassword('confirmPassword')}
            />
          </div>

          <Button
            type="submit"
            isLoading={saving}
            loadingText="Menyimpan..."
            className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-green-600 px-4 font-medium text-white hover:bg-green-700 disabled:opacity-70 md:w-auto"
          >
            Simpan Password
          </Button>
        </form>
      </section>
    </div>
  );
};

export default Profile;
