import { useRouteError } from "react-router-dom"

const RouteError = () => {
    const error = useRouteError();

    return(
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <h1 className="text-4xl font-bold text-red-500">❌</h1>
            <h2 className="text-lg text-gray-600 mt-4">Maaf, halaman ini sedang bermasalah</h2>
            <p className="text-sm text-gray-500 mb-4">
                {error?.message || 'Terjadi kesalahan yang tidak diketahui.'}
            </p>
            <a href="/" className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700">
                Kembali ke Beranda
            </a>
        </div>
    );
};

export default RouteError;