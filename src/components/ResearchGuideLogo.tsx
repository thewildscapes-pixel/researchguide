import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, RotateCcw, X, Check, Image as ImageIcon } from 'lucide-react';

const LOGO_STORAGE_KEY = 'research_guide_custom_logo_v1';

interface ResearchGuideLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showText?: boolean;
  showTagline?: boolean;
  showCopyright?: boolean;
  align?: 'left' | 'center';
  allowUpload?: boolean;
  className?: string;
}

export const ResearchGuideLogo: React.FC<ResearchGuideLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  showCopyright = true,
  align = 'left',
  allowUpload = true,
  className = '',
}) => {
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOGO_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if changed elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(LOGO_STORAGE_KEY);
        setCustomLogo(stored);
      } catch (e) {
        console.warn('Storage read error:', e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = () => {
    if (previewImage) {
      try {
        localStorage.setItem(LOGO_STORAGE_KEY, previewImage);
        setCustomLogo(previewImage);
      } catch (e) {
        alert('Image storage failed. Try a smaller file size.');
      }
    }
    setIsUploadModalOpen(false);
    setPreviewImage(null);
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem(LOGO_STORAGE_KEY);
      setCustomLogo(null);
      setPreviewImage(null);
    } catch (e) {
      console.warn('Reset error:', e);
    }
    setIsUploadModalOpen(false);
  };

  // Dimensions
  const sizeMap = {
    sm: {
      container: 'w-12 h-12',
      title: 'text-lg',
      tag: 'text-[9px]',
      copyright: 'text-[9px]',
      cameraIcon: 'w-3 h-3',
      cameraBadge: 'p-1',
    },
    md: {
      container: 'w-16 h-16 sm:w-20 sm:h-20',
      title: 'text-xl sm:text-2xl',
      tag: 'text-[11px] sm:text-xs',
      copyright: 'text-[10px]',
      cameraIcon: 'w-3.5 h-3.5',
      cameraBadge: 'p-1.5',
    },
    lg: {
      container: 'w-24 h-24 sm:w-28 sm:h-28',
      title: 'text-2xl sm:text-3xl',
      tag: 'text-xs sm:text-sm',
      copyright: 'text-xs',
      cameraIcon: 'w-4 h-4',
      cameraBadge: 'p-2',
    },
    xl: {
      container: 'w-32 h-32 sm:w-40 sm:h-40',
      title: 'text-3xl sm:text-4xl',
      tag: 'text-sm sm:text-base',
      copyright: 'text-xs sm:text-sm',
      cameraIcon: 'w-5 h-5',
      cameraBadge: 'p-2.5',
    },
    '2xl': {
      container: 'w-40 h-40 sm:w-48 sm:h-48',
      title: 'text-4xl sm:text-5xl',
      tag: 'text-base sm:text-lg',
      copyright: 'text-sm',
      cameraIcon: 'w-6 h-6',
      cameraBadge: 'p-3',
    },
    '3xl': {
      container: 'w-48 h-48 sm:w-56 sm:h-56',
      title: 'text-5xl sm:text-6xl',
      tag: 'text-lg sm:text-xl',
      copyright: 'text-sm sm:text-base',
      cameraIcon: 'w-7 h-7',
      cameraBadge: 'p-3.5',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <>
      <div
        className={`inline-flex ${
          align === 'center' ? 'flex-col items-center text-center' : 'items-center gap-5 text-left'
        } ${className}`}
      >
        {/* Large Profile Picture / Logo Container with FB-style Camera Upload Badge */}
        <div className="relative shrink-0 flex items-center justify-center group">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-amber-400/20 to-yellow-300/30 blur-2xl rounded-full scale-125 pointer-events-none" />

          {/* Main Logo Container */}
          <div
            onClick={() => allowUpload && setIsUploadModalOpen(true)}
            className={`${currentSize.container} relative rounded-3xl bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0A0F1D] p-2 flex items-center justify-center border-2 border-slate-700/80 shadow-2xl overflow-hidden transition-all duration-300 ${
              allowUpload ? 'cursor-pointer hover:border-blue-400 hover:shadow-blue-500/20 hover:scale-[1.02]' : ''
            }`}
            title={allowUpload ? 'Click to change or upload custom logo' : 'ResearchGuide Logo'}
          >
            {customLogo ? (
              // Custom Uploaded Admin Logo
              <img
                src={customLogo}
                alt="ResearchGuide Institutional Logo"
                className="w-full h-full object-contain rounded-2xl"
              />
            ) : (
              // Default Side-View Brain + Illuminating Light Bulb Vector Illustration
              <svg
                viewBox="0 0 140 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md select-none"
              >
                <defs>
                  <radialGradient id="bulbGlow" cx="70" cy="24" r="35" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
                    <stop offset="45%" stopColor="#FBBF24" stopOpacity="0.45" />
                    <stop offset="80%" stopColor="#3B82F6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#1E293B" stopOpacity="0" />
                  </radialGradient>

                  <linearGradient id="brainGrad" x1="20" y1="50" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="40%" stopColor="#3B82F6" />
                    <stop offset="85%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>

                  <linearGradient id="cerebellumG" x1="80" y1="90" x2="120" y2="125" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>

                  <linearGradient id="bulbGrad" x1="60" y1="8" x2="80" y2="34" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="30%" stopColor="#FEF08A" />
                    <stop offset="75%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>

                  <linearGradient id="lightCone" x1="70" y1="36" x2="70" y2="105" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE047" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Light Cone Down onto Brain */}
                <polygon points="70,34 20,95 120,95" fill="url(#lightCone)" className="opacity-70" />

                {/* Radiating Light Beams */}
                <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                  <line x1="70" y1="4" x2="70" y2="0" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="86" y1="9" x2="91" y2="5" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="54" y1="9" x2="49" y2="5" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="94" y1="20" x2="100" y2="18" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="46" y1="20" x2="40" y2="18" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="95" y1="33" x2="101" y2="36" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="45" y1="33" x2="39" y2="36" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
                </g>

                {/* Glowing Halo */}
                <circle cx="70" cy="22" r="22" fill="url(#bulbGlow)" />
                <circle cx="70" cy="22" r="10" fill="#FEF08A" opacity="0.35" className="animate-ping" style={{ animationDuration: '2.5s' }} />

                {/* Overhead Bulb */}
                <path
                  d="M60 22 C60 15 64 10 70 10 C76 10 80 15 80 22 C80 26 77 28 76 31 L64 31 C63 28 60 26 60 22 Z"
                  fill="url(#bulbGrad)"
                  stroke="#FBBF24"
                  strokeWidth="1.5"
                />
                <path d="M66 22 L68 17 L70 20 L72 17 L74 22" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="64.5" y="31" width="11" height="2" rx="0.8" fill="#94A3B8" stroke="#64748B" strokeWidth="0.5" />
                <rect x="65.5" y="33.5" width="9" height="2" rx="0.8" fill="#94A3B8" stroke="#64748B" strokeWidth="0.5" />
                <path d="M67 36 L73 36 L71.5 38 L68.5 38 Z" fill="#475569" />

                {/* Side-View Brain */}
                <path d="M66 112 C67 106 68 100 70 94 L78 95 C77 102 76 108 74 114 C71 116 68 115 66 112 Z" fill="#1E293B" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                <g>
                  <path d="M75 92 C82 86 98 88 102 96 C105 104 98 114 87 114 C80 114 74 108 75 98 Z" fill="url(#cerebellumG)" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M78 98 C84 96 92 98 97 103" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M80 104 C85 103 91 106 94 109" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <path
                  d="M68 45 C80 43 96 46 106 56 C116 66 118 78 112 88 C108 94 98 94 92 88 C86 82 80 82 76 86 C70 90 56 94 44 94 C32 94 22 86 20 74 C18 64 24 55 34 50 C44 45 56 46 68 45 Z"
                  fill="url(#brainGrad)"
                  stroke="#93C5FD"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M68 46 C67 55 69 64 64 72 C60 78 54 80 48 80" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
                <path d="M32 68 C42 66 54 68 66 64 C76 60 84 66 94 72" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
                <path d="M32 54 C38 58 46 56 50 60" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M26 64 C32 64 36 60 42 62" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M80 50 C86 56 94 54 100 60" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M84 64 C90 68 98 68 106 74" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M74 74 C80 76 86 78 92 84" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M34 78 C42 84 52 84 60 84" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="50" cy="58" r="2.2" fill="#FEF08A" className="animate-pulse" />
                <circle cx="72" cy="54" r="2" fill="#FFFFFF" />
                <circle cx="88" cy="62" r="2" fill="#93C5FD" />
                <circle cx="42" cy="74" r="2" fill="#FEF08A" className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle cx="60" cy="76" r="2.2" fill="#FFFFFF" />
                <circle cx="80" cy="80" r="1.8" fill="#38BDF8" />
              </svg>
            )}

            {/* Facebook-Style Hover Dark Overlay */}
            {allowUpload && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 select-none backdrop-blur-2xs">
                <Camera className={currentSize.cameraIcon} />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center px-1">
                  Change Logo
                </span>
              </div>
            )}
          </div>

          {/* Facebook-Style Floating Camera Badge on Bottom-Right */}
          {allowUpload && (
            <button
              type="button"
              id="admin-upload-logo-badge-btn"
              onClick={() => setIsUploadModalOpen(true)}
              aria-label="Upload custom logo"
              title="Update Logo / Change Profile Picture"
              className={`absolute -bottom-1 -right-1 ${currentSize.cameraBadge} rounded-full bg-[#2563EB] text-white border-2 border-white shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 active:scale-95 cursor-pointer z-20`}
            >
              <Camera className={currentSize.cameraIcon} />
            </button>
          )}
        </div>

        {/* Brand Text Below or Beside Logo */}
        {showText && (
          <div className={align === 'center' ? 'mt-4 flex flex-col items-center' : ''}>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span
                className={`${currentSize.title} font-black tracking-tight uppercase text-slate-900 leading-none`}
              >
                Research<span className="text-[#2563EB]">Guide</span>
              </span>
            </div>

            {showTagline && (
              <p
                className={`${currentSize.tag} text-slate-600 font-bold tracking-wide mt-1.5 uppercase leading-snug`}
              >
                Empowering Rigorous Social Science & Fieldwork Methodologies
              </p>
            )}

            {showCopyright && (
              <div className="mt-1.5 flex items-center gap-1.5 justify-center sm:justify-start">
                <span
                  className={`${currentSize.copyright} text-slate-700 font-bold tracking-wide inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs`}
                >
                  <span>Copyright © Dr. Deborshee Gogoi</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Facebook-Style Profile Photo / Logo Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#2563EB] rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Update Application Logo
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Upload institutional crest, university insignia, or custom profile image.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setPreviewImage(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-4">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0A0F1D] p-2 flex items-center justify-center border-2 border-slate-700 shadow-xl overflow-hidden relative">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Logo Preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : customLogo ? (
                  <img
                    src={customLogo}
                    alt="Current Custom Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center p-2">
                    <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-300 font-bold uppercase block">
                      Default Vector Logo
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">
                  Select a PNG, JPG, WebP, or SVG file
                </p>
                <p className="text-[11px] text-slate-400">
                  Recommended: Square aspect ratio (e.g. 512×512px)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-50 text-[#2563EB] hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Image File</span>
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              {customLogo && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setPreviewImage(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!previewImage}
                  onClick={handleSaveLogo}
                  className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow-md ${
                    previewImage
                      ? 'bg-[#2563EB] hover:bg-blue-700 text-white cursor-pointer shadow-blue-500/25'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Save Logo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
