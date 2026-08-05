import React from 'react';
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail, User } from 'lucide-react';
import { FloatingInput } from '@/components/form';
import { Button } from "@/components/ui/button";

const authInputClassName = "border-[#1B1A15]/30 bg-[#F7F3E7] text-[#1B1A15] font-['Inter'] focus:border-[#14532D]";
const authInputErrorClassName = "border-[#A23B2E] bg-[#F7F3E7] text-[#1B1A15] font-['Inter'] focus:border-[#A23B2E]";
const authIconClassName = 'text-[#1B1A15]/45';
const authLabelBgClass = 'bg-[#F7F3E7]';

const getFieldIcon = (name, type) => {
    if (name === 'nama') return <User className="h-4.5 w-4.5" />;
    if (name === 'secret') return <KeyRound className="h-4.5 w-4.5" />;
    if (type === 'email' || name === 'email') return <Mail className="h-4.5 w-4.5" />;
    return null;
};

export const AuthShell = ({
    eyebrow = 'MASJIDHUB',
    tagline = 'Buku kas & agenda masjid, satu tempat.',
    formTitle,
    formSubtitle,
    stamp,
    restricted = false,
    children,
    footer,
}) => {
    return (
        <div className="min-h-screen w-full bg-[#E4DEC9] flex items-center justify-center px-4 py-10 font-['Inter']">
            <div className="w-full max-w-4xl border-2 border-[#1B1A15] shadow-[8px_8px_0_0_#1B1A15] flex flex-col md:flex-row overflow-hidden">

                {/* Panel kiri — brand / ledger */}
                <div className="relative bg-[#1B1A15] text-[#F7F3E7] md:w-[36%] flex md:flex-col justify-between px-6 py-6 md:px-8 md:py-10 overflow-hidden">
                    {/* garis ledger tipis di background */}
                    <div
                        className="absolute inset-0 opacity-[0.15] pointer-events-none"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(to bottom, transparent, transparent 27px, #F7F3E7 28px)',
                        }}
                    />

                    {restricted && (
                        <div className="absolute top-0 left-0 right-0 md:right-auto md:left-0 md:top-0 md:h-full md:w-8 z-10">
                            <div
                                className="h-2 md:h-full md:w-full"
                                style={{
                                    backgroundImage:
                                        'repeating-linear-gradient(45deg, #B8873A, #B8873A 8px, #1B1A15 8px, #1B1A15 16px)',
                                }}
                            />
                        </div>
                    )}

                    <div className="relative z-10 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-3 md:gap-0">
                        <span className="text-[10px] tracking-[0.25em] font-['IBM_Plex_Mono'] text-[#B8873A]">
                            {eyebrow}
                        </span>
                        <span className="text-[10px] tracking-[0.2em] font-['IBM_Plex_Mono'] text-[#F7F3E7]/50 md:hidden">
                            {restricted ? 'AKSES TERBATAS' : 'BUKU KAS DIGITAL'}
                        </span>
                    </div>

                    {/* wordmark — vertikal di desktop, horizontal di mobile */}
                    <div className="relative z-10 hidden md:flex flex-1 items-center">
                        <h1
                            className="font-['Fraunces'] text-3xl leading-none whitespace-nowrap"
                            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                            Masjid<span className="text-[#B8873A]">Hub</span>
                        </h1>
                    </div>

                    <div className="relative z-10 hidden md:block">
                        <p className="text-xs text-[#F7F3E7]/60 leading-relaxed max-w-45 font-['Inter']">
                            {tagline}
                        </p>
                        {restricted && (
                            <span className="mt-4 inline-block text-[10px] tracking-[0.2em] font-['IBM_Plex_Mono'] text-[#B8873A] border border-[#B8873A]/50 px-2 py-1">
                                AKSES TERBATAS
                            </span>
                        )}
                    </div>

                    {stamp && !restricted && (
                        <div
                            className="relative z-10 hidden md:inline-flex self-start items-center gap-1 mt-6 px-3 py-1.5 border border-[#B8873A] text-[#B8873A] font-['IBM_Plex_Mono'] text-[10px] tracking-[0.15em]"
                            style={{ transform: 'rotate(-4deg)' }}
                        >
                            {stamp}
                        </div>
                    )}
                </div>

                {/* Perforasi — cuma di desktop */}
                <div className="hidden md:block relative w-0">
                    <div className="absolute top-0 bottom-0 -left-px border-l-2 border-dashed border-[#1B1A15]/25" />
                    <div className="absolute -top-3.5 -left-3.75 w-7 h-7 rounded-full bg-[#E4DEC9]" />
                    <div className="absolute -bottom-3.5 -left-3.75 w-7 h-7 rounded-full bg-[#E4DEC9]" />
                </div>

                {/* Panel kanan — form */}
                <div className="flex-1 bg-[#F7F3E7] px-6 py-8 sm:px-10 sm:py-10">
                    <div className="max-w-sm mx-auto">
                        <h2 className="font-['Fraunces'] text-3xl text-[#1B1A15] mb-1.5">{formTitle}</h2>
                        {formSubtitle && (
                            <p className="text-sm text-[#1B1A15]/60 mb-8">{formSubtitle}</p>
                        )}
                        {children}
                        {footer && (
                            <p className="mt-6 text-center text-sm text-[#1B1A15]/70">{footer}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Banner error/success bergaya nota, bukan kotak rounded generik */
export const Banner = ({ type = 'error', children }) => {
    const isError = type === 'error';
    return (
        <div
            className={`mb-6 pl-3 pr-3 py-2.5 border-l-4 flex items-start gap-2 font-['Inter'] text-sm ${isError
                    ? 'border-[#A23B2E] bg-[#A23B2E]/6 text-[#7a2c22]'
                    : 'border-[#14532D] bg-[#14532D]/6 text-[#14532D]'
                }`}
        >
            <span
                className={`font-['IBM_Plex_Mono'] text-[10px] tracking-[0.15em] mt-0.5 shrink-0 ${isError ? 'text-[#A23B2E]' : 'text-[#14532D]'
                    }`}
            >
                {isError ? 'GAGAL' : 'SUKSES'}
            </span>
            <span>{children}</span>
        </div>
    );
};

/** Input teks/email auth memakai FloatingInput global. */
export const Field = ({ label, icon, className = '', ...props }) => (
    <div className="mb-5">
        <FloatingInput
            label={label}
            icon={icon ?? getFieldIcon(props.name, props.type)}
            labelBgClass={authLabelBgClass}
            inputClassName={authInputClassName}
            iconClassName={authIconClassName}
            focusRingClass="focus:ring-[#14532D]/20"
            labelFocusClass="peer-focus:text-[#14532D]"
            className={className}
            {...props}
        />
    </div>
);

/** Input password auth: FloatingInput global + tombol show/hide. */
export const PasswordField = ({ label, show, onToggle, error, className = '', ...props }) => {
    const ToggleIcon = show ? EyeOff : Eye;
    const LeadingIcon = props.name === 'secret' ? KeyRound : LockKeyhole;

    return (
        <div className="mb-5">
            <FloatingInput
                label={label}
                type={show ? 'text' : 'password'}
                icon={<LeadingIcon className="h-4.5 w-4.5" />}
                labelBgClass={authLabelBgClass}
                inputClassName={error ? authInputErrorClassName : authInputClassName}
                iconClassName={authIconClassName}
                focusRingClass={error ? 'focus:ring-[#A23B2E]/20' : 'focus:ring-[#14532D]/20'}
                labelFocusClass={error ? 'text-[#A23B2E] peer-focus:text-[#A23B2E]' : 'peer-focus:text-[#14532D]'}
                className={className}
                aria-invalid={Boolean(error)}
                rightElement={
                    <Button
                        type="button"
                        onClick={onToggle}
                        aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                        className="flex h-7 w-7 items-center justify-center text-[#1B1A15]/50 transition-colors hover:text-[#1B1A15]"
                    >
                        <ToggleIcon className="h-4.5 w-4.5" />
                    </Button>
                }
                {...props}
            />
            {error && <p className="mt-1.5 text-xs font-medium text-[#A23B2E]">{error}</p>}
        </div>
    );
};

export const SubmitButton = ({ isLoading, children }) => (
    <Button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-[#1B1A15] text-[#F7F3E7] py-3 font-['IBM_Plex_Mono'] text-xs tracking-[0.2em] border-2 border-[#1B1A15] shadow-[4px_4px_0_0_#14532D] hover:shadow-[2px_2px_0_0_#14532D] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all duration-100 ${isLoading ? 'opacity-50 cursor-not-allowed hover:shadow-[4px_4px_0_0_#14532D] hover:translate-x-0 hover:translate-y-0' : ''
            }`}
    >
        {isLoading ? (
            <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                MEMPROSES...
            </span>
        ) : (
            children.toUpperCase()
        )}
    </Button>
);
