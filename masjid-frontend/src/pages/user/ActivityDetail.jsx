import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Share2, ArrowLeft, CalendarDays, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/config/api';
import { Button } from '@/components/ui/button';
import { ActivityDetailSkeleton } from '@/features/activities/components/loading';

const ActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchActivity = async () => {
            try {
                const response = await api.get(`/kegiatan/${id}`);
                setActivity(response.data?.data || response.data || null);
            } catch (error) {
                console.error('Gagal Mengambil detail kegiatan', error);
                toast.error('Gagal Mengambil detail kegiatan');
                setActivity(null);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [id]);

    const getTitle = (item) => item?.judul || item?.nama_kegiatan || 'Kegiatan Masjid';
    const getCategory = (item) => item?.kategori?.nama_kategori || item?.kategori_nama || 'Umum';
    const getImage = (item) => item?.image_url || item?.foto || 'https://via.placeholder.com/800x400?text=No+Image';
    const normalizeLabel = (value) => String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    const formatDate = (dateString) => {
        if (!dateString) return '';

        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (item) => {
        if (item?.jam) return item.jam;
        if (!item?.tanggal) return '-';


        return new Date(item.tanggal).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleShare = async () => {
        const title = getTitle(activity);
        const url = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title,
                    text: activity?.deskripsi || 'Detail Kegiatan Masjid Nurul Ilmi',
                    url
                });
                return;
            }
            await navigator.clipboard.writeText(url);
            toast.success('Link kegiatan disalin')
        } catch (error) {
            if (error?.name !== 'AbortError') {
                toast.error('Gagal membagikan link kegiatan');
            }
        }
    };

    if (loading) {
        return <ActivityDetailSkeleton />;
    }

    if (!activity) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
                <div className='text-center'>
                    <h1 className='text-xl font-semibold text-gray-900 mb-2'>
                        Kegiatan Tidak ditemukan
                    </h1>
                    <p className='text-sm text-gray-500 mb-6'>
                        Kegiatan yang Anda cari tidak tersedia atau telah dihapus.
                    </p>
                    <Button onClick={() => navigate('/activities')} className='text-sm font-medium py-2 px-4 rounded border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150'>
                        Kembali ke Kegiatan
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className='min-h-screen bg-gray-50'>
            <section className='bg-white border-b'>
                {getImage(activity) ? (
                    <img
                        src={getImage(activity)}
                        alt={getTitle(activity)}
                        className='w-full h-72 md:h-96 object-cover'
                    />
                ) : (
                    <div className='w-full h-72 md:h-96 bg-green-50 flex items-center justify-center'>
                        <CalendarDays className='h-16 w-16 text-green-700' />
                    </div>
                )}
            </section>

            <section className='max-w-4xl mx-auto px-4 py-8'>
                <div className='flex flex-wrap items-center justify-between gap-3 mb-6'>
                    <Link
                        to="/activities"
                        className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900'>
                        <ArrowLeft className='h-4 w-4' />
                        Kembali
                    </Link>
                    <Button
                        onClick={handleShare}
                        className='inline-flex gap-2 items-center'
                    >
                        <Share2 className='h-4 w-4' />
                        Bagikan
                    </Button>
                </div>

                <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-4'>
                    {normalizeLabel(getCategory(activity))}
                </span>

                <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-5'>
                    {getTitle(activity)}
                </h1>

                <div className='grid sm:grid-cols-3 gap-3 mb-8'>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays className="h-4 w-4 text-green-700" />
                        {formatDate(activity.tanggal)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-green-700" />
                        {formatTime(activity)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-green-700" />
                        {activity.lokasi || '-'}
                    </div>
                </div>

                <article className='bg-white border rounded-lg p-6'>
                    <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                        {activity.deskripsi || 'Belum ada deskripsi kegiatan.'}
                    </p>
                </article>
            </section>
        </main>
    );
};

export default ActivityDetail;
