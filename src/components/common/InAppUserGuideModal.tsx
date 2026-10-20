import React, { useState } from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  Building,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  HandCoins,
  HelpCircle,
  Lightbulb,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';

interface InAppUserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateModule?: (module: string) => void;
  onOpenTxModal?: (defaultType?: string) => void;
  onOpenTransferModal?: () => void;
}

export const InAppUserGuideModal: React.FC<InAppUserGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateModule,
  onOpenTxModal,
  onOpenTransferModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'office_voucher' | 'transfers' | 'loans' | 'personal'>(
    'overview'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-400/20 text-sky-300 font-mono uppercase tracking-wider">
                  SYSTEM USER MANUAL
                </span>
                <span className="text-xs text-slate-300 font-medium">বাংলা ব্যবহার নির্দেশিকা</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                হিসাব-নিকাশ সহজ গাইড ও ব্যবহারের সঠিক নিয়মাবলী
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>১. এক নজরে সিস্টেম গাইড</span>
          </button>

          <button
            onClick={() => setActiveTab('office_voucher')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'office_voucher'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-purple-300" />
            <span>২. অফিস অগ্রিম ও ভাউচার প্রিন্ট</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'transfers'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-sky-200" />
            <span>৩. একাউন্ট ও ট্রান্সফার</span>
          </button>

          <button
            onClick={() => setActiveTab('loans')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'loans'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <HandCoins className="w-4 h-4 text-rose-200" />
            <span>৪. লোন ও দেনা-পাওনা</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-200" />
            <span>৫. পরিবার ও ব্যক্তিগত বাজেট</span>
          </button>
        </div>

        {/* TAB CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex gap-3 text-sky-900">
                <Lightbulb className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-sky-900">আপনার পুরো অর্থনৈতিক জীবন একসাথে ট্র্যাক করার উপায়</h3>
                  <p className="text-xs text-sky-800 leading-relaxed">
                    এই সিস্টেমে আপনার ব্যাংক, নগদ টাকা, বিকাশ/নগদ ওয়ালেট, অফিসের অগ্রিম টাকা, লোন হিসাব এবং পরিবার ও ব্যক্তিগত আয়-ব্যয়ের পুরো হিসাব স্বয়ংক্রিয়ভাবে একটি কেন্দ্রবিন্দুতে সংযুক্ত রয়েছে।
                  </p>
                </div>
              </div>

              {/* FLOW DIAGRAM VISUAL */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/80 space-y-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 font-mono">
                  সিস্টেমের লেনদেন ও একাউন্ট কানেকশন ম্যাপ (System Interaction Flow)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span>১. মেইন একাউন্টসমূহ</span>
                    </div>
                    <ul className="text-slate-600 space-y-1 text-xs">
                      <li>• ক্যাশ ইন হ্যান্ড (Physical Cash)</li>
                      <li>• ব্যাংক একাউন্ট (Bank Accounts)</li>
                      <li>• বিকাশ ও নগদ (bKash & Nagad)</li>
                      <li>• লোন একাউন্ট (Loan Ledger)</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Building className="w-4 h-4 text-purple-600" />
                      <span>২. অফিসের বাজেট ও ফান্ড</span>
                    </div>
                    <ul className="text-slate-600 space-y-1 text-xs">
                      <li>• অফিস থেকে অগ্রিম টাকা গ্রহণ</li>
                      <li>• অফিসিয়াল খরচ ও ভাউচার প্রিন্ট</li>
                      <li>• অবশিষ্ট ফান্ড ফেরত ও এডজাস্টমেন্ট</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <DollarSign className="w-4 h-4 text-sky-600" />
                      <span>৩. ব্যক্তিগত ও পারিবারিক বাজেট</span>
                    </div>
                    <ul className="text-slate-600 space-y-1 text-xs">
                      <li>• বেতন ও অন্যান্য পার্সোনাল ইনকাম</li>
                      <li>• ফ্যামিলি বাজার ও দৈনন্দিন খরচ</li>
                      <li>• সেভিংস ও ইনভেস্টমেন্ট গোল</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CORE PILLARS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>কোন কাজ কোন মডিউলে করবেন?</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
                    <li><strong>অফিসিয়াল ফান্ড:</strong> Office Fund মডিউলে গিয়ে অগ্রিম নিবেন এবং খরচ এন্ট্রি দিবেন।</li>
                    <li><strong>টাকা স্থানান্তরিত হলে:</strong> Header বা Dashboard এর "Transfer" বাটন চাপবেন।</li>
                    <li><strong>লোন দিলে/নিলে:</strong> Loans, Debts & Receivables ট্যাবে এন্ট্রি দিবেন।</li>
                    <li><strong>ভাউচার প্রিন্ট:</strong> যেকোনো ট্রানজেকশন এর পাশে থাকা "Voucher" বাটনে ক্লিক করবেন।</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>নিরাপত্তা ও লক সুবিধা</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
                    <li>অ্যাপ্রুভড ট্রানজেকশন পরবর্তীতে ভুলবশত পরিবর্তন হওয়া থেকে লক থাকে।</li>
                    <li>আপনার ডাটা নিরাপদ রাখতে "Backup & Restore" অপশন থেকে যেকোনো সময় ডাটা সেভ করে রাখতে পারেন।</li>
                    <li>৫.৫" × ৪.২৫" অফিশিয়াল ভাউচার A4 পেজে প্রিন্ট নিতে পারবেন।</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICE FUND & VOUCHERS */}
          {activeTab === 'office_voucher' && (
            <div className="space-y-5">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-purple-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  <span>অফিস অগ্রিম গ্রহণ, খরচ এবং ভাউচার প্রিন্টের ধাপসমূহ</span>
                </h3>
                <p className="text-xs text-purple-800 leading-relaxed">
                  অফিস থেকে অগ্রিম টাকা নেওয়া এবং সেই টাকা অফিসের বিভিন্ন কাজে খরচ করে উপযুক্ত ভাউচার জমা দেওয়ার সহজ ধাপ নিচে দেওয়া হলো:
                </p>
              </div>

              {/* STEP BY STEP STEPS */}
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-white flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                    ১
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">অফিস থেকে অগ্রিম টাকা নেওয়া (Receive Office Advance)</h4>
                    <p className="text-xs text-slate-600">
                      <strong>উপায়:</strong> হেডার থেকে <code>+ Office Fund</code> বাটনে ক্লিক করুন। "Receive Advance" বেছে নিয়ে কত টাকা কোন একাউন্টে (যেমন Cash বা Bank) জমা হলো তা লিখে সাবমিট করুন।
                    </p>
                    <p className="text-xs text-purple-700 font-medium pt-0.5">
                      ✓ এটি আপনার অফিসের অবশিষ্ট ফান্ডের ক্যাশ ব্যালেন্স বাড়িয়ে দিবে।
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-white flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                    ২
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">অফিসের কাজে খরচ করা (Record Office Expense)</h4>
                    <p className="text-xs text-slate-600">
                      <strong>উপায়:</strong> <code>+ Office Fund</code> থেকে "Record Expense" বেছে নিয়ে ক্যাটাগরি (যেমন প্রিন্টিং, ট্রান্সপোর্ট, আপ্যায়ন), কার কাছে টাকা দেওয়া হলো (Payee Name) এবং কারণ লিখে সাবমিট করুন।
                    </p>
                    <p className="text-xs text-purple-700 font-medium pt-0.5">
                      ✓ এর ফলে অফিস অগ্রিম ফান্ডের হিসাব স্বয়ংক্রিয়ভাবে কমবে এবং খরচের তালিকা তৈরি হবে।
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-white flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                    ৩
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">A4 পেজে ৫.৫" × ৪.২৫" ভাউচার প্রিন্ট আউট করা</h4>
                    <p className="text-xs text-slate-600">
                      <strong>উপায়:</strong> ট্রানজেকশন লিস্টে থাকা যেকোনো খরচের পাশে <code>Voucher (ভাউচার)</code> আইকন চাপুন।
                    </p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 mt-1">
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        <Printer className="w-3.5 h-3.5 text-slate-600" /> A4 প্রিন্টিং ফরমেট:
                      </p>
                      <p className="text-slate-600">
                        ভাউচারটি একটি A4 সাইজ পেজে ঠিক ৫.৫ ইঞ্চি × ৪.২৫ ইঞ্চি মাপে ১টি প্রফেশনাল কর্পোরেট ভাউচার হিসেবে আসবে। নিচের বাকি অংশটি সুন্দর ও পরিষ্কার সাদা থাকবে।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSFERS & ACCOUNTS */}
          {activeTab === 'transfers' && (
            <div className="space-y-5">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-sky-900 flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-sky-600" />
                  <span>ব্যাংক, বিকাশ, নগদ ও ক্যাশ ট্রান্সফার করার সঠিক নিয়ম</span>
                </h3>
                <p className="text-xs text-sky-800 leading-relaxed">
                  এক স্থান থেকে অন্য স্থানে টাকা পাঠালে তা যেন ভুলবশত ডাবল ইনকাম বা ডাবল খরচ হিসেবে না আসে, তার জন্য ট্রান্সফার সুবিধা ব্যবহার করুন:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 font-mono">
                    উদাহরণ ১: ব্যাংক থেকে বিকাশে টাকা আনা
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ১. হেডার থেকে <strong>Transfer</strong> বাটনে চাপ দিন।<br />
                    ২. <strong>From Account:</strong> "Islami Bank" বা আপনার ব্যাংক সিলেক্ট করুন।<br />
                    ৩. <strong>To Account:</strong> "bKash" সিলেক্ট করুন।<br />
                    ৪. টাকার পরিমাণ ও বিবরণ লিখে সাবমিট করুন।
                  </p>
                  <p className="text-xs text-sky-700 font-semibold pt-1">
                    ✓ ব্যাংকের ব্যালেন্স কমবে এবং বিকাশের ব্যালেন্স বাড়বে।
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 font-mono">
                    উদাহরণ ২: ব্যাংক থেকে ক্যাশ টাকা তোলা
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ১. হেডার থেকে <strong>Transfer</strong> বাটনে চাপ দিন।<br />
                    ২. <strong>From Account:</strong> "Bank Account" বেছে নিন।<br />
                    ৩. <strong>To Account:</strong> "Cash in Hand" বেছে নিন।<br />
                    ৪. সাবমিট করুন।
                  </p>
                  <p className="text-xs text-amber-700 font-semibold pt-1">
                    ✓ আপনার হাতের ক্যাশ টাকা (Physical Cash) সাথে সাথে আপডেট হবে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOANS & DEBTS */}
          {activeTab === 'loans' && (
            <div className="space-y-5">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-rose-900 flex items-center gap-2">
                  <HandCoins className="w-5 h-5 text-rose-600" />
                  <span>লোন দেওয়া ও নেওয়ার হিসাব রাখার নিয়ম</span>
                </h3>
                <p className="text-xs text-rose-800 leading-relaxed">
                  কেউ আপনার কাছে টাকা পাবে নাকি আপনি কারো কাছে পাবেন তা নাম ও ফোন নাম্বারসহ নিখুঁতভাবে ম্যানেজ করুন:
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>১. আপনি কাউকে লোন দিলেন (Receivable - আমি পাব)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Loans, Debts & Receivables</strong> ট্যাবে গিয়ে <code>+ Add Entry</code> এ ক্লিক করে "Given (Receivable)" সিলেক্ট করুন। যার কাছে পাবেন তার নাম লিখে সাবমিট করুন। পরবর্তীতে টাকা ফেরত পেলে <strong>Settle Payment</strong> চাপলেই ব্যালেন্স এড হয়ে ভাউচার জেনারেট হবে।
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>২. আপনি কারো কাছ থেকে লোন নিলেন (Liability - আমার কাছে পাবে)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <code>+ Add Entry</code> চাপ দিয়ে "Taken (Liability)" সিলেক্ট করুন। যার কাছে আপনি ঋণী তার নাম লিখুন। পরিশোধ করার সময় <strong>Repay</strong> বাটনে ক্লিক করলেই আপনার একাউন্ট থেকে টাকা কেটে লোন হিসাব সমন্বয় হয়ে যাবে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERSONAL & FAMILY BUDGET */}
          {activeTab === 'personal' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <span>ব্যক্তিগত আয়, বেতন ও পারিবারিক খরচের হিসাব</span>
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  আপনার মাসিক বাজেট ও সার্বিক আর্থিক অবস্থা স্বচ্ছ রাখার উপায়:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">ইনকাম এন্ট্রি (Salary & Extra Income)</h4>
                  <p className="text-xs text-slate-600">
                    <code>+ Income</code> এ ক্লিক করে বেতন পেলে "Salary Income" অথবা অন্যান্য উৎস হলে "Extra Income" ক্যাটাগরি বেছে নিন এবং টাকা যে একাউন্টে ঢুকলো তা সিলেক্ট করুন।
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">পার্সোনাল ও ফ্যামিলি খরচ</h4>
                  <p className="text-xs text-slate-600">
                    <code>+ Expense</code> এ ক্লিক করে "Family Expense" বা "Personal Expense" বেছে নিন। ক্যাটাগরি (বাজার, ইউটিলিটি বিল, চিকিৎসা) দিয়ে সাবমিট করুন।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER WITH DIRECT ACTION BUTTONS */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            💡 যেকোনো সময় হেডার বা নেভিগেশন থেকে <strong>"ব্যবহার নির্দেশিকা"</strong> বাটনে ক্লিক করে এটি দেখতে পারেন।
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenTxModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTxModal('personal_expense');
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                + এন্ট্রি যুক্ত করুন
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
