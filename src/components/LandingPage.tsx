import React, { useState } from 'react';
import { ResearchGuideLogo } from './ResearchGuideLogo';
import {
  Mail,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Layers,
  BarChart2,
  CheckCircle2,
  Lock,
  Globe,
  Compass,
  FileCheck,
  Award,
  AlertCircle,
} from 'lucide-react';
import { UserSession, isValidEmail, isValidPhone, isUserAdmin } from '../utils/auth';

export type { UserSession };

interface LandingPageProps {
  onLogin: (session: UserSession) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const rawMobile = mobile.trim();

    // Strict validation: Email is required and must have valid format
    if (!trimmedEmail) {
      setError('Please enter your email address to continue.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address (e.g., scholar@university.ac.in or researcher@gmail.com).');
      return;
    }

    // Strict validation: Mobile number is required and must contain at least 10 digits
    if (!rawMobile) {
      setError('Please enter your mobile phone number.');
      return;
    }

    if (!isValidPhone(rawMobile)) {
      setError('Please enter a valid mobile number with at least 10 digits.');
      return;
    }

    setIsSubmitting(true);

    const fullMobile = `${countryCode} ${rawMobile}`;
    const potentialSession: UserSession = {
      email: trimmedEmail,
      mobile: fullMobile,
      name: name.trim() || trimmedEmail.split('@')[0],
      institution: institution.trim() || 'Social Science Research Scholar',
      loginTime: new Date().toISOString(),
    };

    // Check if this researcher is the authorized administrator
    const isAdmin = isUserAdmin(potentialSession);
    const session: UserSession = {
      ...potentialSession,
      isAdmin,
    };

    setTimeout(() => {
      onLogin(session);
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] flex flex-col font-sans selection:bg-blue-100 selection:text-[#2563EB]">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#E5E7EB] bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <ResearchGuideLogo size="sm" showTagline={false} allowUpload={false} isAdmin={false} />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Researcher Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-5xl mx-auto space-y-12">
          {/* Centered Brand Showcase */}
          <div className="text-center flex flex-col items-center justify-center space-y-4">
            <ResearchGuideLogo
              size="2xl"
              align="center"
              showText={true}
              showTagline={true}
              showCopyright={true}
              allowUpload={false}
              isAdmin={false}
            />

            <p className="max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed mx-auto font-medium">
              An institutional social science methodology engine designed for scholars,
              doctoral candidates, and fieldwork researchers navigating quantitative sampling,
              mixed-methods architectures, variable operationalization, and ethics governance.
            </p>
          </div>

          {/* 2-Column Authentication & Capability Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-4xl mx-auto">
            {/* Left Column: Researcher Login Card */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                    Researcher Sign In
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Enter your valid email address and mobile phone number to authenticate and access your research projects.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Email Field - MANDATORY */}
                <div className="space-y-1">
                  <label
                    htmlFor="researcher-email"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="researcher-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scholar@university.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Mobile Number Field - MANDATORY */}
                <div className="space-y-1">
                  <label
                    htmlFor="researcher-mobile"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Mobile Phone No. <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+880">🇧🇩 +880</option>
                      <option value="+977">🇳🇵 +977</option>
                      <option value="+975">🇧🇹 +975</option>
                      <option value="+95">🇲🇲 +95</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+81">🇯🇵 +81</option>
                    </select>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="researcher-mobile"
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="10-digit mobile no."
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Please provide a valid 10-digit phone number.
                  </p>
                </div>

                {/* Optional Scholar Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="researcher-name"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Scholar / Researcher Name <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="researcher-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Priyabrata Saikia"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Optional University / Institution */}
                <div className="space-y-1">
                  <label
                    htmlFor="researcher-institution"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    University / Department / Institution <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                  </label>
                  <input
                    id="researcher-institution"
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. University / ICSSR / Research Institute"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  id="researcher-sign-in-btn"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>{isSubmitting ? 'Verifying Credentials...' : 'Enter Research Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right Column: 9-Step Methodology Matrix Showcase */}
            <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl border border-slate-800">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 block">
                  Methodology Pipeline
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  9-Step Academic Workflow
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Every project in your dashboard follows this peer-reviewed workflow with instant step navigation.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { num: '01', title: 'Title Intake & Bias Analysis', desc: 'Framing deconstruction & scope precision' },
                  { num: '02', title: 'Literature & Gap Context', desc: 'Regional empirical grounding & gap synthesis' },
                  { num: '03', title: 'Research Design Matrix', desc: 'Convergent, explanatory & sequential paradigms' },
                  { num: '04', title: 'Constructs & Variables', desc: 'Latent variables & operationalization tables' },
                  { num: '05', title: 'Objectives & Hypotheses', desc: 'Golden-thread construct alignment tests' },
                  { num: '06', title: 'Sampling & Power Calculator', desc: 'Cochran & Yamane formulas with design effect' },
                  { num: '07', title: 'Statistical Tools & Analysis', desc: 'Parametric, non-parametric & thematic matrix' },
                  { num: '08', title: 'Ethics & Customary Governance', desc: 'Dual consent protocols & traditional councils' },
                  { num: '09', title: 'Summary & Citations Export', desc: 'Institutional proposal synthesis & APA/MLA bibliography' },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      {item.num}
                    </span>
                    <div className="text-left flex-1 min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {item.desc}
                      </span>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800">ResearchGuide</span>
            <span>• Precision Social Science Methodology Engine</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Copyright © Dr. Deborshee Gogoi
            </span>
          </div>
          <div>
            Built with strict adherence to academic standards, UGC/ICSSR research frameworks, and regional protocols.
          </div>
        </div>
      </footer>
    </div>
  );
};
