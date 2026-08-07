import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Settings,
  Trash2,
  X
} from 'lucide-react';
import api from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { FloatingInput } from '@/components/form';
import { formatCurrency } from '@/utils/formatters';

const emptyForm = {
  tahun: new Date().getFullYear(),
  label: '',
  sumber: 'BAZNAS RI',
  source_url: '',
  fitrah_uang: '',
  fitrah_beras_kg: '2.5',
  fitrah_beras_liter: '3.5',
  nisab_maal: '',
  nisab_penghasilan_bulanan: '',
  nisab_penghasilan_tahunan: '',
  kadar_zakat: '0.025',
  notes: '',
  is_active: false
};

const formatPercent = (value) => `${(Number(value || 0) * 100).toLocaleString('id-ID')}%`;

const parseNumberInput = (value) => Number(String(value || '').replace(/,/g, ''));

const NOTE_PREVIEW_LENGTH = 96;

const toFormValue = (setting) => ({
  tahun: setting.tahun || new Date().getFullYear(),
  label: setting.label || '',
  sumber: setting.sumber || 'BAZNAS RI',
  source_url: setting.source_url || '',
  fitrah_uang: setting.fitrah_uang ? Number(setting.fitrah_uang).toLocaleString('en-US') : '',
  fitrah_beras_kg: setting.fitrah_beras_kg || '2.5',
  fitrah_beras_liter: setting.fitrah_beras_liter || '3.5',
  nisab_maal: setting.nisab_maal ? Number(setting.nisab_maal).toLocaleString('en-US') : '',
  nisab_penghasilan_bulanan: setting.nisab_penghasilan_bulanan ? Number(setting.nisab_penghasilan_bulanan).toLocaleString('en-US') : '',
  nisab_penghasilan_tahunan: setting.nisab_penghasilan_tahunan ? Number(setting.nisab_penghasilan_tahunan).toLocaleString('en-US') : '',
  kadar_zakat: setting.kadar_zakat || '0.025',
  notes: setting.notes || '',
  is_active: Boolean(setting.is_active)
});

const SettingInput = ({ label, name, value, onChange, type = 'text', required = false, hint, icon = '' }) => (
  <div>
    <FloatingInput
      label={label}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      icon={icon}
      labelBgClass="bg-white"
    />
    {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
  </div>
);

const ZakatSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  const canManage = useMemo(() => {
    if (user?.role === 'admin') return true;
    return user?.role === 'dkm' && ['ketua_dkm', 'bendahara'].includes(user?.jabatan);
  }, [user]);

  const activeSetting = settings.find((item) => item.is_active);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/zakat-settings');
      setSettings(response.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Gagal memuat setting zakat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleNote = (settingId) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));
  };

  const handleEdit = (setting) => {
    setEditingId(setting.id);
    setForm(toFormValue(setting));
  };

  const buildPayload = () => ({
  ...form,
  tahun: Number(form.tahun),
  fitrah_uang: parseNumberInput(form.fitrah_uang),
  fitrah_beras_kg: Number(form.fitrah_beras_kg),
  fitrah_beras_liter: Number(form.fitrah_beras_liter),
  nisab_maal: parseNumberInput(form.nisab_maal),
  nisab_penghasilan_bulanan: parseNumberInput(form.nisab_penghasilan_bulanan),
  nisab_penghasilan_tahunan: parseNumberInput(form.nisab_penghasilan_tahunan),
    kadar_zakat: Number(form.kadar_zakat)
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManage) return;

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editingId) {
        await api.put(`/zakat-settings/${editingId}`, payload);
        toast.success('Setting zakat berhasil diperbarui');
      } else {
        await api.post('/zakat-settings', payload);
        toast.success('Setting zakat berhasil dibuat');
      }

      resetForm();
      await fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Gagal menyimpan setting zakat');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (setting) => {
    if (!canManage || setting.is_active) return;

    try {
      await api.post(`/zakat-settings/${setting.id}/activate`);
      toast.success('Setting zakat berhasil diaktifkan');
      await fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Gagal mengaktifkan setting');
    }
  };

  const handleDelete = async (setting) => {
    if (!canManage || setting.is_active) return;

    const confirmed = window.confirm(`Hapus setting "${setting.label}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/zakat-settings/${setting.id}`);
      toast.success('Setting zakat berhasil dihapus');
      await fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Gagal menghapus setting');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Setting Zakat</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola tarif fitrah, nisab, dan kadar zakat yang dipakai form jamaah.
          </p>
        </div>
        <Button
          type="button"
          onClick={fetchSettings}
          variant="outline"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {activeSetting && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            Setting aktif: {activeSetting.label}
          </div>
          <div className="mt-3 grid gap-3 text-sm text-green-900 md:grid-cols-3">
            <div>Fitrah: {formatCurrency(activeSetting.fitrah_uang)} / jiwa</div>
            <div>Nisab penghasilan: {formatCurrency(activeSetting.nisab_penghasilan_bulanan)} / bulan</div>
            <div>Kadar: {formatPercent(activeSetting.kadar_zakat)}</div>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        {canManage && (
          <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">
                  {editingId ? 'Edit Setting' : 'Tambah Setting'}
                </h2>
              </div>
              {editingId && (
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                  Batal
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <SettingInput label="Tahun" name="tahun" type="number" value={form.tahun} onChange={handleChange} required icon="#" />
              <SettingInput label="Label" name="label" value={form.label} onChange={handleChange} required icon="A" />
              <SettingInput label="Sumber" name="sumber" value={form.sumber} onChange={handleChange} required icon="S" />
              <SettingInput label="URL Sumber" name="source_url" value={form.source_url} onChange={handleChange} icon="↗" />
              <SettingInput label="Fitrah Uang" name="fitrah_uang" type="currency" value={form.fitrah_uang} onChange={handleChange} required icon="Rp" />
              <SettingInput label="Fitrah Beras Kg" name="fitrah_beras_kg" type="number" value={form.fitrah_beras_kg} onChange={handleChange} required icon="kg" />
              <SettingInput label="Fitrah Beras Liter" name="fitrah_beras_liter" type="number" value={form.fitrah_beras_liter} onChange={handleChange} required icon="L" />
              <SettingInput label="Nisab Maal" name="nisab_maal" type="currency" value={form.nisab_maal} onChange={handleChange} required icon="Rp" />
              <SettingInput label="Nisab Penghasilan Bulanan" name="nisab_penghasilan_bulanan" type="currency" value={form.nisab_penghasilan_bulanan} onChange={handleChange} required icon="Rp" />
              <SettingInput label="Nisab Penghasilan Tahunan" name="nisab_penghasilan_tahunan" type="currency" value={form.nisab_penghasilan_tahunan} onChange={handleChange} required icon="Rp" />
              <SettingInput
                label="Kadar Zakat"
                name="kadar_zakat"
                type="number"
                value={form.kadar_zakat}
                onChange={handleChange}
                required
                icon="%"
                hint="Gunakan desimal. 0.025 berarti 2.5%."
              />
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Catatan</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-green-600"
              />
              Jadikan setting aktif setelah disimpan
            </label>

            <Button
              type="submit"
              disabled={saving}
              variant="success"
              fullWidth
              className="mt-5 font-semibold"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Simpan Perubahan' : 'Tambah Setting'}
            </Button>
          </form>
        )}

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Daftar Setting</h2>
            {!canManage && (
              <p className="mt-1 text-sm text-gray-500">
                Anda hanya punya akses baca. Perubahan setting dibatasi untuk admin, ketua DKM, dan bendahara.
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat setting...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-280 divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Setting</th>
                    <th className="px-4 py-3">Fitrah</th>
                    <th className="px-4 py-3">Nisab</th>
                    <th className="px-4 py-3">Kadar</th>
                    <th className="px-4 py-3">Status</th>
                    {canManage && <th className="px-4 py-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {settings.map((setting) => {
                      const note = setting.notes || 'Tidak ada catatan.';
                      const isExpanded = Boolean(expandedNotes[setting.id]);
                      const isLongNote = note.length > NOTE_PREVIEW_LENGTH;
                      const visibleNote = isLongNote && !isExpanded
                        ? `${note.slice(0, NOTE_PREVIEW_LENGTH)}...`
                        : note;

                      return (
                      <tr key={setting.id} className="align-top">
                        <td className="min-w-90 px-4 py-3">
                          <div className="font-medium text-gray-900">{setting.label}</div>
                          <div className="text-xs text-gray-500">{setting.tahun} · {setting.sumber}</div>
                          {setting.source_url && (
                          <a
                            href={setting.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                              Sumber
                            </a>
                          )}
                          <div className="mt-2 max-w-90 rounded-md bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600">
                            <span className="font-medium text-gray-600">Catatan:</span>{' '}
                            <span className="wrap-break-word">{visibleNote}</span>
                            {isLongNote && (
                              <Button
                                type="button"
                                onClick={() => toggleNote(setting.id)}
                                variant="link"
                                size="xs"
                                className="ml-1 h-auto p-0 text-green-700"
                              >
                                {isExpanded ? 'Show less' : 'Show more'}
                              </Button>
                            )}
                          </div>
                        </td>
                      <td className="px-4 py-3">
                        <div>{formatCurrency(setting.fitrah_uang)}</div>
                        <div className="text-xs text-gray-500">{setting.fitrah_beras_kg} kg / {setting.fitrah_beras_liter} L</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>Maal: {formatCurrency(setting.nisab_maal)}</div>
                        <div className="text-xs text-gray-500">Penghasilan: {formatCurrency(setting.nisab_penghasilan_bulanan)} / bulan</div>
                      </td>
                      <td className="px-4 py-3">{formatPercent(setting.kadar_zakat)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          setting.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {setting.is_active ? 'Aktif' : 'Draft'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {!setting.is_active && (
                              <Button
                                type="button"
                                onClick={() => handleActivate(setting)}
                                variant="successOutline"
                                size="xs"
                              >
                                Aktifkan
                              </Button>
                            )}
                            <Button
                              type="button"
                              onClick={() => handleEdit(setting)}
                              variant="outline"
                              size="icon"
                              aria-label="Edit setting"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            {!setting.is_active && (
                              <Button
                                type="button"
                                onClick={() => handleDelete(setting)}
                                variant="dangerOutline"
                                size="icon"
                                aria-label="Hapus setting"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                      </tr>
                      );
                    })}
                  {settings.length === 0 && (
                    <tr>
                      <td colSpan={canManage ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                        Belum ada setting zakat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZakatSettings;
