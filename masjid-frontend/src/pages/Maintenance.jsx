import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/navigation/Navbar';

const Maintenance = () => {
    return (
        <>
            <Navbar />
            <div className="relative flex min-h-screen items-center overflow-hidden bg-[#F5F6F3] px-6 py-16 sm:px-10">
                
                <svg
                    className="pointer-events-none absolute -right-24 top-1/2 hidden h-144 w-xl -translate-y-1/2 text-[#1F6D45]/[0.07] lg:block"
                    viewBox="0 0 200 200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                >
                    <rect x="40" y="40" width="120" height="120" transform="rotate(0 100 100)" />
                    <rect x="40" y="40" width="120" height="120" transform="rotate(45 100 100)" />
                    <circle cx="100" cy="100" r="85" />
                    <circle cx="100" cy="100" r="60" />
                </svg>

                <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8">

                    {/* status */}
                    <div className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1F6D45]" />
                        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#1F6D45]">
                            Status — Perbaikan
                        </span>
                    </div>

                    <div className="h-px w-16 bg-[#DEE3DE]" />

                    {/* Headline */}
                    <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#14181D] sm:text-4xl">
                        Halaman ini sedang kami perbaiki
                    </h1>

                    {/* Body */}
                    <p className="max-w-md text-base leading-relaxed text-[#5B6660]">
                        Fitur ini sedang kami tingkatkan agar pengalaman pengguna jadi lebih
                        baik. Silakan kembali beberapa saat lagi.
                    </p>

                    {/* CTA */}
                    <div className="pt-2">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 rounded-md border border-[#1F6D45] px-5 py-2.5 text-sm font-medium text-[#1F6D45] transition-colors hover:bg-[#1F6D45] hover:text-white"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>

                    {/* Footer note */}
                    <p className="pt-6 font-mono text-xs text-[#9AA39C]">
                        Terakhir diperbarui secara berkala — tidak perlu refresh manual.
                    </p>
                </div>
            </div>
        </>
        
    );
};

export default Maintenance;
