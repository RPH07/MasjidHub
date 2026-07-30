import { useEffect, useMemo, useState } from "react";
import api from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/form";

const roles = ['admin', 'dkm', 'jamaah'];
const jabatanOptions = ['ketua_dkm', 'bendahara', 'sekretaris', 'anggota_dkm'];

const formatLabel = (value) => value ? value.replace(/_/g, ' ') : '-';

const getStatusClass = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'deletion_requested') return 'bg-yellow-100 text-yellow-700';
    if (status === 'inactive') return 'bg-gray-100 text-gray-600';
    return 'bg-gray-100 text-gray-600';
};

const formatDateTime = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};

const UserAccessPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [passwordTarget, setPasswordTarget] = useState(null);
    const [passwordForm, setPasswordForm] = useState({
        password: '',
        confirmPassword: ''
    });

    const isAdmin = currentUser?.role === 'admin';
    const isKetuaDkm = currentUser?.role === 'dkm' && currentUser?.jabatan === 'ketua_dkm';

    const draftUsers = useMemo(() => {
        return users.map((item) => ({
            ...item,
            ...(drafts[item.id] || {})
        }));
    }, [users, drafts]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/user');
            setUsers(res.data || []);
            setDrafts({});
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Gagal memuat data pengguna');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        if (!isAdmin) return;

        try {
            setLogsLoading(true);
            setError(null);
            const res = await api.get('/user/logs?limit=50');
            setLogs(res.data?.data?.logs || []);
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Gagal memuat log aktivitas');
        } finally {
            setLogsLoading(false);
        }
    };

    const updateAccess = async (userId, payload) => {
        try {
            setSavingId(userId);
            setError(null);
            await api.patch(`/user/${userId}/access`, payload);
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Gagal memperbarui akses pengguna');
        } finally {
            setSavingId(null);
        }
    };

    const updateStatus = async (userId, status) => {
        try {
            setSavingId(userId);
            setError(null);
            await api.patch(`/user/${userId}/status`, { status });
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Gagal memperbarui status pengguna');
        } finally {
            setSavingId(null);
        }
    };

    const deleteUser = async (item) => {
        const actionLabel = item.role === 'jamaah' ? 'menghapus permanen' : 'menonaktifkan';
        const confirmed = window.confirm(`Yakin ingin ${actionLabel} akun ${item.nama}?`);

        if (!confirmed) return;

        try {
            setSavingId(item.id);
            setError(null);
            await api.delete(`/user/${item.id}`);
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Gagal menghapus user');
        } finally {
            setSavingId(null);
        }
    };

    const openPasswordModal = (item) => {
        setPasswordTarget(item);
        setPasswordForm({
            password: '',
            confirmPassword: ''
        });
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        if (!passwordTarget) return;

        try {
            setSavingId(passwordTarget.id);
            setError(null);
            await api.patch(`/user/${passwordTarget.id}/password`, passwordForm);
            setPasswordTarget(null);
            setPasswordForm({
                password: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || 'Gagal reset password user');
        } finally {
            setSavingId(null);
        }
    };

    const setDraftValue = (userId, patch) => {
        setDrafts((prev) => ({
            ...prev,
            [userId]: {
                ...(prev[userId] || {}),
                ...patch
            }
        }));
    };

    const saveDraft = async (item) => {
        const draft = drafts[item.id];
        if (!draft) return;

        const nextRole = draft.role || item.role;

        await updateAccess(item.id, {
            role: nextRole,
            jabatan: nextRole === 'dkm' ? (draft.jabatan || item.jabatan || 'anggota_dkm') : null
        });
    };

    const handleRoleChange = (item, role) => {
        const payload = {
            role,
            jabatan: role === 'dkm' ? (item.jabatan || 'anggota_dkm') : null
        };

        if (isAdmin) {
            updateAccess(item.id, payload);
            return;
        }

        setDraftValue(item.id, payload);
    };

    const handleJabatanChange = (item, jabatan) => {
        if (isAdmin) {
            updateAccess(item.id, {
                role: item.role,
                jabatan
            });
            return;
        }

        setDraftValue(item.id, { jabatan });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    if (loading) return <div>Memuat data user...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Manajemen Akses Pengguna</h2>
                <p className="text-sm text-gray-500">
                    Kelola role, jabatan, dan status akses pengurus MasjidHub.
                </p>
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="flex gap-2">
                <Button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === 'users' ? 'bg-green-600 text-white' : 'border bg-white text-gray-700'}`}
                >
                    Daftar User
                </Button>

                {isAdmin && (
                    <Button
                        type="button"
                        onClick={() => setActiveTab('logs')}
                        className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === 'logs' ? 'bg-green-600 text-white' : 'border bg-white text-gray-700'}`}
                    >
                        Log Aktivitas
                    </Button>
                )}
            </div>

            {activeTab === 'users' && (
            <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-3">Nama</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Jabatan</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {draftUsers.map((item) => {
                            const hasDraft = Boolean(drafts[item.id]);
                            const canKetuaManageUser = isKetuaDkm && item.role !== 'admin' && item.jabatan !== 'ketua_dkm';
                            const canEditRole = isAdmin || canKetuaManageUser;
                            const canEditJabatan = isAdmin || (canKetuaManageUser && item.role === 'dkm');
                            const isSaving = savingId === item.id;

                            return (
                                <tr key={item.id} className="border-t">
                                    <td className="p-3 font-medium">{item.nama}</td>
                                    <td className="p-3">{item.email}</td>

                                    <td className="p-3">
                                        <select
                                            className="border rounded-md px-2 py-1 disabled:bg-gray-100"
                                            value={item.role}
                                            disabled={!canEditRole || isSaving}
                                            onChange={(e) => handleRoleChange(item, e.target.value)}
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="p-3">
                                        <select
                                            className="border rounded-md px-2 py-1 disabled:bg-gray-100"
                                            value={item.jabatan || ''}
                                            disabled={!canEditJabatan || item.role !== 'dkm' || isSaving}
                                            onChange={(e) => handleJabatanChange(item, e.target.value)}
                                        >
                                            <option value="">-</option>
                                            {jabatanOptions
                                                .filter((jabatan) => isAdmin || jabatan !== 'ketua_dkm')
                                                .map((jabatan) => (
                                                <option key={jabatan} value={jabatan}>
                                                    {formatLabel(jabatan)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="p-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(item.status)}`}>
                                            {formatLabel(item.status)}
                                        </span>
                                    </td>

                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            {isKetuaDkm && hasDraft && (
                                                <Button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => saveDraft(item)}
                                                    className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                                                >
                                                    Simpan
                                                </Button>
                                            )}

                                            {item.status === 'deletion_requested' && isAdmin && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        disabled={isSaving}
                                                        onClick={() => updateStatus(item.id, 'inactive')}
                                                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                                                    >
                                                        Nonaktifkan
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        disabled={isSaving}
                                                        onClick={() => updateStatus(item.id, 'active')}
                                                        className="rounded-md border px-3 py-1 text-xs font-medium disabled:opacity-50"
                                                    >
                                                        Tolak
                                                    </Button>
                                                </>
                                            )}

                                            {isAdmin && item.status === 'inactive' && (
                                                <Button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => updateStatus(item.id, 'active')}
                                                    className="rounded-md border px-3 py-1 text-xs font-medium disabled:opacity-50"
                                                >
                                                    Aktifkan
                                                </Button>
                                            )}

                                            {isAdmin && currentUser?.id !== item.id && (
                                                <Button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => deleteUser(item)}
                                                    className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 disabled:opacity-50"
                                                >
                                                    Hapus
                                                </Button>
                                            )}

                                            {isAdmin && (
                                                <Button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => openPasswordModal(item)}
                                                    className="rounded-md border px-3 py-1 text-xs font-medium disabled:opacity-50"
                                                >
                                                    Reset Password
                                                </Button>
                                            )}

                                            <span className="min-w-20 text-right text-xs text-gray-500">
                                                {isSaving ? 'Menyimpan...' : hasDraft ? 'Belum disimpan' : 'Tersimpan'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            )}

            {activeTab === 'logs' && isAdmin && (
                <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
                    {logsLoading ? (
                        <div className="p-4 text-sm text-gray-500">Memuat log aktivitas...</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="p-3">Waktu</th>
                                    <th className="p-3">Aktor</th>
                                    <th className="p-3">Target</th>
                                    <th className="p-3">Aksi</th>
                                    <th className="p-3">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-500">
                                            Belum ada log aktivitas.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="border-t">
                                            <td className="p-3 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                                            <td className="p-3">
                                                <div className="font-medium">{log.actor?.nama || '-'}</div>
                                                <div className="text-xs text-gray-500">{log.actor?.email || '-'}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium">{log.target?.nama || '-'}</div>
                                                <div className="text-xs text-gray-500">{log.target?.email || '-'}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                                    {formatLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div>{log.description || '-'}</div>
                                                {(log.old_value || log.new_value) && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        <span>From: {JSON.stringify(log.old_value || '-')}</span>
                                                        <br />
                                                        <span>To: {JSON.stringify(log.new_value || '-')}</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {passwordTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <form
                        onSubmit={resetPassword}
                        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                    >
                        <h3 className="text-lg font-semibold">Reset Password</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Buat password baru untuk {passwordTarget.nama}. User bisa login memakai password ini.
                        </p>

                        <div className="mt-5 space-y-4">
                            <FloatingInput
                                label="Password Baru"
                                type="password"
                                name="password"
                                minLength={6}
                                required
                                value={passwordForm.password}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                                inputClassName="border-gray-300 focus:ring-green-500"
                                labelFocusClass="peer-focus:text-green-600"
                            />

                            <FloatingInput
                                label="Konfirmasi Password"
                                type="password"
                                name="confirmPassword"
                                minLength={6}
                                required
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                inputClassName="border-gray-300 focus:ring-green-500"
                                labelFocusClass="peer-focus:text-green-600"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button
                                type="button"
                                onClick={() => setPasswordTarget(null)}
                                className="rounded-md border px-4 py-2 text-sm"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={savingId === passwordTarget.id}
                                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {savingId === passwordTarget.id ? 'Menyimpan...' : 'Simpan Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UserAccessPage;
