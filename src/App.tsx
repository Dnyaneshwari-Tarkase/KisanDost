/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Camera, 
  Leaf, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  RefreshCw,
  Languages,
  Droplets,
  Sprout,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeCropImage, type DiagnosisResult } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Language = 'English' | 'Hindi' | 'Marathi';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('English');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const mimeType = image.split(';')[0].split(':')[1];
      const data = await analyzeCropImage(image, mimeType);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Sprout size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">KisanDost</h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-600">AI Crop Doctor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-full border border-stone-200">
            {(['English', 'Hindi', 'Marathi'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full transition-all",
                  language === lang 
                    ? "bg-white text-emerald-700 shadow-sm" 
                    : "text-stone-500 hover:text-stone-700"
                )}
              >
                {lang === 'English' ? 'EN' : lang === 'Hindi' ? 'HI' : 'MR'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Intro */}
        {!image && !result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="serif text-5xl md:text-6xl text-stone-900 mb-4">Healthy crops, <br /><span className="text-emerald-700 italic">happy farmers.</span></h2>
            <p className="text-stone-500 max-w-md mx-auto">Upload a clear photo of your crop's leaf, stem, or fruit to get instant AI diagnosis and treatment advice.</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Upload Section */}
          {!result && (
            <motion.div 
              layout
              className="relative"
            >
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className={cn(
                  "relative aspect-[4/3] md:aspect-[16/9] rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center bg-white",
                  image ? "border-emerald-500" : "border-stone-200 hover:border-emerald-400"
                )}
              >
                {image ? (
                  <>
                    <img src={image} alt="Crop to analyze" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setImage(null)}
                        className="bg-white/90 backdrop-blur p-3 rounded-full text-red-600 shadow-xl hover:scale-110 transition-transform"
                      >
                        <RefreshCw size={24} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400 group-hover:text-emerald-500 transition-colors">
                      <Camera size={40} />
                    </div>
                    <p className="text-lg font-medium text-stone-900 mb-2">Take a photo or upload</p>
                    <p className="text-sm text-stone-500 mb-8">Click to browse or drag and drop image here</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Upload size={18} />
                      Select Photo
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                )}
              </div>

              {image && !isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 flex justify-center"
                >
                  <button 
                    onClick={handleAnalyze}
                    className="bg-stone-900 text-white px-12 py-4 rounded-full font-bold text-lg shadow-2xl hover:bg-stone-800 transition-all flex items-center gap-3 group"
                  >
                    <Stethoscope size={24} className="group-hover:rotate-12 transition-transform" />
                    Analyze Crop
                    <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}

              {isAnalyzing && (
                <div className="mt-8 text-center">
                  <div className="flex justify-center gap-2 mb-4">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-3 h-3 bg-emerald-600 rounded-full" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                      className="w-3 h-3 bg-emerald-600 rounded-full" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                      className="w-3 h-3 bg-emerald-600 rounded-full" 
                    />
                  </div>
                  <p className="text-stone-600 font-medium italic">Consulting the AI Doctor...</p>
                  <p className="text-xs text-stone-400 mt-1">Analyzing leaves and patterns for diagnosis</p>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700">
                  <AlertTriangle className="shrink-0" size={20} />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Result Section */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="space-y-8"
              >
                {/* Summary Card */}
                <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8">
                    {result.ImmediateActionRequired === 'Yes' ? (
                      <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-red-100">
                        <AlertTriangle size={14} />
                        Urgent Action
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
                        <CheckCircle2 size={14} />
                        Stable
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shadow-inner bg-stone-50 shrink-0">
                      <img src={image!} alt="Analyzed" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <Leaf size={16} />
                        <span className="text-sm font-bold uppercase tracking-widest">{result.Crop}</span>
                      </div>
                      <h2 className="serif text-4xl text-stone-900 mb-4 leading-tight">
                        {result.Condition === 'No disease detected' ? 'Healthy Plant' : result.Condition}
                      </h2>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-50 p-3 rounded-2xl">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">Confidence</p>
                          <p className="text-xl font-bold text-stone-800">{result.Confidence}</p>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-2xl">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">Severity</p>
                          <p className={cn(
                            "text-xl font-bold",
                            result.Severity === 'High' ? 'text-red-600' : 
                            result.Severity === 'Medium' ? 'text-orange-500' : 'text-emerald-600'
                          )}>{result.Severity}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Language Explanation */}
                  <div className="mt-8 p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                    <div className="flex items-center gap-2 mb-3 text-emerald-800">
                      <Languages size={18} />
                      <span className="font-bold text-sm">Diagnosis Summary ({language})</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed italic">
                      "{result.LanguageOutput[language]}"
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Causes */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <Info size={20} />
                      </div>
                      <h3 className="font-bold text-stone-900">Possible Causes</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.Causes.map((cause, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <ShieldCheck size={20} />
                      </div>
                      <h3 className="font-bold text-stone-900">Prevention Tips</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.PreventionTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Treatment */}
                <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      <Droplets size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-stone-900">Recommended Treatment</h3>
                      <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Actionable Steps</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit">Organic Remedies</h4>
                      <ul className="space-y-4">
                        {result.Treatment.Organic.map((item, i) => (
                          <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">{i + 1}</div>
                            <p className="text-sm text-stone-700 leading-relaxed">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full w-fit">Chemical Options</h4>
                      <ul className="space-y-4">
                        {result.Treatment.Chemical.map((item, i) => (
                          <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold shrink-0">{i + 1}</div>
                            <p className="text-sm text-stone-700 leading-relaxed">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 text-stone-400 hover:text-emerald-600 transition-colors font-medium"
                  >
                    <RefreshCw size={18} />
                    Scan Another Crop
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto px-6 mt-20 text-center">
        <div className="h-px bg-stone-200 w-full mb-8" />
        <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
          KisanDost AI is a tool to assist farmers. Always consult with a local agricultural expert for critical decisions.
        </p>
      </footer>
    </div>
  );
}
