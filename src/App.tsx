/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback, useEffect } from 'react';
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
  Stethoscope,
  CloudSun,
  TrendingUp,
  Mic,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeCropImage, type DiagnosisResult } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Language = 'English' | 'Hindi' | 'Marathi';

const UI_LABELS = {
  English: {
    urgentAction: "Urgent Action",
    stable: "Stable",
    confidence: "Confidence",
    severity: "Severity",
    diagnosisSummary: "Diagnosis Summary",
    possibleCauses: "Possible Causes",
    preventionTips: "Prevention Tips",
    recommendedTreatment: "Recommended Treatment",
    actionableSteps: "Actionable Steps",
    organicRemedies: "Organic Remedies",
    chemicalOptions: "Chemical Options",
    scanAnother: "Scan Another Crop",
    healthyPlant: "Healthy Plant",
    consultExpert: "Consult local agriculture expert for confirmation.",
    aiDoctor: "AI Crop Doctor",
    healthyCrops: "Healthy crops,",
    happyFarmers: "happy farmers.",
    introText: "Upload a clear photo of your crop's leaf, stem, or fruit to get instant AI diagnosis and treatment advice.",
    takePhoto: "Take a photo or upload",
    clickBrowse: "Click to browse or drag and drop image here",
    selectPhoto: "Select Photo",
    analyzeCrop: "Analyze Crop",
    consulting: "Consulting the AI Doctor...",
    analyzingLeaves: "Analyzing leaves and patterns for diagnosis",
    disclaimer: "KisanDost AI is a tool to assist farmers. Always consult with a local agricultural expert for critical decisions.",
    symptomsLabel: "Describe symptoms (optional)",
    symptomsPlaceholder: "e.g., yellow spots on edges, wilting since 2 days...",
    weatherTitle: "Weather & Spray Advisory",
    sprayGood: "Good time to spray",
    sprayBad: "Avoid spraying (Rain expected)",
    mandiTitle: "Current Mandi Prices",
    mandiSubtitle: "Daily updates for your region",
    mandiSearchPlaceholder: "Search...",
    mandiAreaLabel: "Search Village/Area",
    mandiAreaPlaceholder: "Enter village name...",
    mandiTabs: {
      vegetables: "Vegetables",
      fruits: "Fruits",
      grains: "Grains"
    },
    mandiAreas: {
      rahata: "Rahata",
      shirdi: "Shirdi",
      dhule: "Dhule",
      pune: "Pune",
      shrirampur: "Shrirampur",
      nashik: "Nashik",
      nagpur: "Nagpur",
      aurangabad: "Aurangabad",
      sangli: "Sangli",
      satara: "Satara",
      kolhapur: "Kolhapur",
      akola: "Akola",
      amravati: "Amravati",
      latur: "Latur",
      nanded: "Nanded",
      jalgaon: "Jalgaon",
      beed: "Beed",
      osmanabad: "Osmanabad",
      parbhani: "Parbhani",
      hingoli: "Hingoli",
      wardha: "Wardha",
      gondia: "Gondia",
      gadchiroli: "Gadchiroli",
      chandrapur: "Chandrapur",
      yavatmal: "Yavatmal",
      buldhana: "Buldhana",
      washim: "Washim",
      bhandara: "Bhandara",
      ratnagiri: "Ratnagiri",
      sindhudurg: "Sindhudurg",
      raigad: "Raigad",
      palghar: "Palghar",
      thane: "Thane",
      mumbai: "Mumbai",
      delhi: "Delhi",
      bangalore: "Bangalore",
      hyderabad: "Hyderabad",
      chennai: "Chennai",
      kolkata: "Kolkata",
      ahmedabad: "Ahmedabad",
      surat: "Surat",
      jaipur: "Jaipur",
      lucknow: "Lucknow",
      kanpur: "Kanpur"
    },
    mandiCrops: {
      onion: "Onion",
      tomato: "Tomato",
      potato: "Potato",
      cabbage: "Cabbage",
      cauliflower: "Cauliflower",
      okra: "Okra",
      brinjal: "Brinjal",
      ginger: "Ginger",
      garlic: "Garlic",
      chili: "Chili",
      carrot: "Carrot",
      radish: "Radish",
      spinach: "Spinach",
      bitterGourd: "Bitter Gourd",
      bottleGourd: "Bottle Gourd",
      apple: "Apple",
      banana: "Banana",
      mango: "Mango",
      grapes: "Grapes",
      orange: "Orange",
      pomegranate: "Pomegranate",
      papaya: "Papaya",
      watermelon: "Watermelon",
      guava: "Guava",
      wheat: "Wheat",
      soyabean: "Soyabean",
      cotton: "Cotton",
      rice: "Rice",
      maize: "Maize"
    },
    pricePerKg: "per kg",
    pricePerQ: "per quintal",
    builtBy: "Built by Tarkase Dnyaneshwari"
  },
  Hindi: {
    urgentAction: "तत्काल कार्रवाई",
    stable: "स्थिर",
    confidence: "आत्मविश्वास",
    severity: "गंभीरता",
    diagnosisSummary: "निदान सारांश",
    possibleCauses: "संभावित कारण",
    preventionTips: "बचाव के उपाय",
    recommendedTreatment: "अनुशंसित उपचार",
    actionableSteps: "कार्रवाई योग्य कदम",
    organicRemedies: "जैविक उपचार",
    chemicalOptions: "रासायनिक विकल्प",
    scanAnother: "एक और फसल स्कैन करें",
    healthyPlant: "स्वस्थ पौधा",
    consultExpert: "पुष्टि के लिए स्थानीय कृषि विशेषज्ञ से सलाह लें।",
    aiDoctor: "एआई फसल डॉक्टर",
    healthyCrops: "स्वस्थ फसलें,",
    happyFarmers: "खुशहाल किसान।",
    introText: "तत्काल एआई निदान और उपचार सलाह प्राप्त करने के लिए अपनी फसल की पत्ती, तने या फल की एक स्पष्ट तस्वीर अपलोड करें।",
    takePhoto: "तस्वीर लें या अपलोड करें",
    clickBrowse: "ब्राउज़ करने के लिए क्लिक करें या छवि को यहां खींचें",
    selectPhoto: "फोटो चुनें",
    analyzeCrop: "फसल का विश्लेषण करें",
    consulting: "एआई डॉक्टर से सलाह ले रहे हैं...",
    analyzingLeaves: "निदान के लिए पत्तियों और पैटर्न का विश्लेषण कर रहे हैं",
    disclaimer: "KisanDost AI किसानों की सहायता के लिए एक उपकरण है। महत्वपूर्ण निर्णयों के लिए हमेशा स्थानीय कृषि विशेषज्ञ से सलाह लें।",
    symptomsLabel: "लक्षणों का वर्णन करें (वैकल्पिक)",
    symptomsPlaceholder: "जैसे, किनारों पर पीले धब्बे, 2 दिनों से मुरझा रहे हैं...",
    weatherTitle: "मौसम और छिड़काव सलाह",
    sprayGood: "छिड़काव के लिए अच्छा समय",
    sprayBad: "छिड़काव से बचें (बारिश की संभावना)",
    mandiTitle: "वर्तमान मंडी भाव",
    mandiSubtitle: "आपके क्षेत्र के लिए दैनिक अपडेट",
    mandiSearchPlaceholder: "खोजें...",
    mandiAreaLabel: "गांव/क्षेत्र खोजें",
    mandiAreaPlaceholder: "गांव का नाम दर्ज करें...",
    mandiTabs: {
      vegetables: "सब्जियां",
      fruits: "फल",
      grains: "अनाज"
    },
    mandiAreas: {
      rahata: "रहाता",
      shirdi: "शिर्डी",
      dhule: "धुले",
      pune: "पुणे",
      shrirampur: "श्रीरामपुर",
      nashik: "नासिक",
      nagpur: "नागपुर",
      aurangabad: "औरंगाबाद",
      sangli: "सांगली",
      satara: "सतारा",
      kolhapur: "कोल्हापुर",
      akola: "अकोला",
      amravati: "अमरावती",
      latur: "लातूर",
      nanded: "नांदेड",
      jalgaon: "जलगांव",
      beed: "बीड",
      osmanabad: "उस्मानाबाद",
      parbhani: "परभणी",
      hingoli: "हिंगोली",
      wardha: "वर्धा",
      gondia: "गोंदिया",
      gadchiroli: "गढ़चिरौली",
      chandrapur: "चंद्रपुर",
      yavatmal: "यवतमाल",
      buldhana: "बुलढाणा",
      washim: "वाशिम",
      bhandara: "भंडारा",
      ratnagiri: "रत्नागिरी",
      sindhudurg: "सिंधुदुर्ग",
      raigad: "रायगढ़",
      palghar: "पालघर",
      thane: "ठाणे",
      mumbai: "मुंबई",
      delhi: "दिल्ली",
      bangalore: "बेंगलुरु",
      hyderabad: "हैदराबाद",
      chennai: "चेन्नई",
      kolkata: "कोलकाता",
      ahmedabad: "अहमदाबाद",
      surat: "सूरत",
      jaipur: "जयपुर",
      lucknow: "लखनऊ",
      kanpur: "कानपुर"
    },
    mandiCrops: {
      onion: "प्याज",
      tomato: "टमाटर",
      potato: "आलू",
      cabbage: "पत्ता गोभी",
      cauliflower: "फूलगोभी",
      okra: "भिंडी",
      brinjal: "बैंगन",
      ginger: "अदरक",
      garlic: "लहसुन",
      chili: "मिर्च",
      carrot: "गाजर",
      radish: "मूली",
      spinach: "पालक",
      bitterGourd: "करेला",
      bottleGourd: "लौकी",
      apple: "सेब",
      banana: "केला",
      mango: "आम",
      grapes: "अंगूर",
      orange: "संतरा",
      pomegranate: "अनार",
      papaya: "पपीता",
      watermelon: "तरबूज",
      guava: "अमरूद",
      wheat: "गेहूं",
      soyabean: "सोयाबीन",
      cotton: "कपास",
      rice: "चावल",
      maize: "मक्का"
    },
    pricePerKg: "प्रति किलो",
    pricePerQ: "प्रति क्विंटल",
    builtBy: "Tarkase Dnyaneshwari द्वारा निर्मित"
  },
  Marathi: {
    urgentAction: "तात्काळ कारवाई",
    stable: "स्थिर",
    confidence: "आत्मविश्वास",
    severity: "तीव्रता",
    diagnosisSummary: "निदान सारांश",
    possibleCauses: "संभावित कारणे",
    preventionTips: "प्रतिबंधात्मक उपाय",
    recommendedTreatment: "शिफारस केलेले उपचार",
    actionableSteps: "कृती करण्यायोग्य पावले",
    organicRemedies: "सेंद्रिय उपाय",
    chemicalOptions: "रासायनिक पर्याय",
    scanAnother: "दुसरे पीक स्कॅन करा",
    healthyPlant: "निरोगी रोप",
    consultExpert: "खात्रीसाठी स्थानिक कृषी तज्ज्ञांचा सल्ला घ्या.",
    aiDoctor: "एआय पीक डॉक्टर",
    healthyCrops: "निरोगी पिके,",
    happyFarmers: "सुखी शेतकरी.",
    introText: "त्वरीत एआय निदान आणि उपचार सल्ला मिळविण्यासाठी आपल्या पिकाच्या पानाचा, खोडाचा किंवा फळाचा स्पष्ट फोटो अपलोड करा.",
    takePhoto: "फोटो घ्या किंवा अपलोड करा",
    clickBrowse: "ब्राउझ करण्यासाठी क्लिक करा किंवा इमेज येथे ड्रॅग करा",
    selectPhoto: "फोटो निवडा",
    analyzeCrop: "पिकाचे विश्लेषण करा",
    consulting: "एआय डॉक्टरचा सल्ला घेत आहे...",
    analyzingLeaves: "निदानासाठी पाने आणि नमुन्यांचे विश्लेषण करत आहे",
    disclaimer: "KisanDost AI हे शेतकऱ्यांना मदत करण्यासाठी एक साधन आहे. महत्त्वाच्या निर्णयांसाठी नेहमी स्थानिक कृषी तज्ज्ञांचा सल्ला घ्या.",
    symptomsLabel: "लक्षणांचे वर्णन करा (पर्यायी)",
    symptomsPlaceholder: "उदा. कडांवर पिवळे डाग, २ दिवसांपासून कोमेजणे...",
    weatherTitle: "हवामान आणि फवारणी सल्ला",
    sprayGood: "फवारणीसाठी चांगली वेळ",
    sprayBad: "फवारणी टाळा (पावसाची शक्यता)",
    mandiTitle: "चालू मंडी भाव",
    mandiSubtitle: "तुमच्या भागातील दैनंदिन अपडेट्स",
    mandiSearchPlaceholder: "शोधा...",
    mandiAreaLabel: "गाव/क्षेत्र शोधा",
    mandiAreaPlaceholder: "गावाचे नाव टाका...",
    mandiTabs: {
      vegetables: "भाज्या",
      fruits: "फळे",
      grains: "धान्य"
    },
    mandiAreas: {
      rahata: "रहाता",
      shirdi: "शिर्डी",
      dhule: "धुळे",
      pune: "पुणे",
      shrirampur: "श्रीरामपूर",
      nashik: "नाशिक",
      nagpur: "नागपूर",
      aurangabad: "छत्रपती संभाजीनगर",
      sangli: "सांगली",
      satara: "सातारा",
      kolhapur: "कोल्हापूर",
      akola: "अकोला",
      amravati: "अमरावती",
      latur: "लातूर",
      nanded: "नांदेड",
      jalgaon: "जळगाव",
      beed: "बीड",
      osmanabad: "धाराशिव",
      parbhani: "परभणी",
      hingoli: "हिंगोली",
      wardha: "वर्धा",
      gondia: "गोंदिया",
      gadchiroli: "गडचिरोली",
      chandrapur: "चंद्रपूर",
      yavatmal: "यवतमाळ",
      buldhana: "बुलढाणा",
      washim: "वाशिम",
      bhandara: "भंडारा",
      ratnagiri: "रत्नागिरी",
      sindhudurg: "सिंधुदुर्ग",
      raigad: "रायगड",
      palghar: "पालघर",
      thane: "ठाणे",
      mumbai: "मुंबई",
      delhi: "दिल्ली",
      bangalore: "बेंगळुरू",
      hyderabad: "हैदराबाद",
      chennai: "चेन्नई",
      kolkata: "कोलकाता",
      ahmedabad: "अहमदाबाद",
      surat: "सुरत",
      jaipur: "जयपूर",
      lucknow: "लखनऊ",
      kanpur: "कानपूर"
    },
    mandiCrops: {
      onion: "कांदा",
      tomato: "टोमॅटो",
      potato: "बटाटा",
      cabbage: "कोबी",
      cauliflower: "फ्लॉवर",
      okra: "भेंडी",
      brinjal: "वांगी",
      ginger: "आले",
      garlic: "लसूण",
      chili: "मिरची",
      carrot: "गाजर",
      radish: "मुळा",
      spinach: "पालक",
      bitterGourd: "कारले",
      bottleGourd: "दुधी भोपळा",
      apple: "सफरचंद",
      banana: "केळी",
      mango: "आंबा",
      grapes: "द्राक्षे",
      orange: "संत्री",
      pomegranate: "डाळिंब",
      papaya: "पपई",
      watermelon: "कलिंगड",
      guava: "पेरू",
      wheat: "गहू",
      soyabean: "सोयाबीन",
      cotton: "कापूस",
      rice: "तांदूळ",
      maize: "मका"
    },
    pricePerKg: "प्रति किलो",
    pricePerQ: "प्रति क्विंटल",
    builtBy: "Tarkase Dnyaneshwari यांनी तयार केले"
  }
};

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('English');
  const [weather, setWeather] = useState<{ temp: number, condition: string, rain: boolean } | null>(null);
  const [mandiSearch, setMandiSearch] = useState('');
  const [mandiArea, setMandiArea] = useState('rahata');
  const [mandiAreaInput, setMandiAreaInput] = useState('Rahata');
  const [mandiCategory, setMandiCategory] = useState<'vegetables' | 'fruits' | 'grains'>('vegetables');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<{ image: string, result: DiagnosisResult, date: string }[]>(() => {
    const saved = localStorage.getItem('kisan_dost_history');
    return saved ? JSON.parse(saved) : [];
  });

  const labels = UI_LABELS[language];

  // Simulated Weather Data
  useEffect(() => {
    const fetchWeather = () => {
      // Simulate API call
      setWeather({
        temp: 28 + Math.floor(Math.random() * 5),
        condition: 'Partly Cloudy',
        rain: Math.random() > 0.7
      });
    };
    fetchWeather();
  }, []);

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
      const data = await analyzeCropImage(image, mimeType, symptoms);
      setResult(data);
      
      // Save to history
      const newHistory = [{ image, result: data, date: new Date().toLocaleString() }, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('kisan_dost_history', JSON.stringify(newHistory));
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
    setSymptoms('');
  };

  const currentData = result?.Languages[language];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-stone-100 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-stone-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-stone-200">
              <Sprout size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900 leading-none mb-1">KisanDost</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-600">{labels.aiDoctor}</p>
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

      <main className="max-w-6xl mx-auto px-8 pt-16">
        {/* Advanced Dashboard Widgets */}
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Weather Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
            >
              <div>
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">{labels.weatherTitle}</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                    <CloudSun size={32} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-stone-900 leading-none mb-1">{weather?.temp}°C</p>
                    <p className="text-sm font-medium text-stone-400">{weather?.condition}</p>
                  </div>
                </div>
              </div>
              <div className={cn(
                "px-5 py-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-2 uppercase tracking-wider",
                weather?.rain ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {weather?.rain ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                {weather?.rain ? labels.sprayBad : labels.sprayGood}
              </div>
            </motion.div>

            {/* Mandi Prices Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">{labels.mandiTitle}</h3>
                    <p className="text-[10px] text-stone-300 font-medium">{labels.mandiSubtitle}</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                    <TrendingUp size={16} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input 
                      list="mandi-villages"
                      value={mandiAreaInput}
                      onChange={(e) => {
                        setMandiAreaInput(e.target.value);
                        setMandiArea(e.target.value.toLowerCase());
                      }}
                      placeholder={labels.mandiAreaPlaceholder}
                      className="w-full pl-3 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[10px] font-bold text-stone-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                    <datalist id="mandi-villages">
                      {Object.values(labels.mandiAreas).map((name, idx) => (
                        <option key={idx} value={name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      value={mandiSearch}
                      onChange={(e) => setMandiSearch(e.target.value)}
                      placeholder={labels.mandiSearchPlaceholder}
                      className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[10px] focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                    <TrendingUp size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>

                <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                  {(['vegetables', 'fruits', 'grains'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMandiCategory(cat)}
                      className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                        mandiCategory === cat 
                          ? "bg-white text-emerald-700 shadow-sm" 
                          : "text-stone-500 hover:text-stone-700"
                      )}
                    >
                      {labels.mandiTabs[cat]}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {[
                  // Vegetables
                  { key: 'onion', basePrice: 20, unit: labels.pricePerKg, trend: '+5%', cat: 'vegetables' },
                  { key: 'tomato', basePrice: 35, unit: labels.pricePerKg, trend: '-2%', cat: 'vegetables' },
                  { key: 'potato', basePrice: 18, unit: labels.pricePerKg, trend: '0%', cat: 'vegetables' },
                  { key: 'cabbage', basePrice: 15, unit: labels.pricePerKg, trend: '+3%', cat: 'vegetables' },
                  { key: 'cauliflower', basePrice: 25, unit: labels.pricePerKg, trend: '-1%', cat: 'vegetables' },
                  { key: 'okra', basePrice: 40, unit: labels.pricePerKg, trend: '+8%', cat: 'vegetables' },
                  { key: 'brinjal', basePrice: 22, unit: labels.pricePerKg, trend: '+2%', cat: 'vegetables' },
                  { key: 'ginger', basePrice: 120, unit: labels.pricePerKg, trend: '+10%', cat: 'vegetables' },
                  { key: 'garlic', basePrice: 150, unit: labels.pricePerKg, trend: '+15%', cat: 'vegetables' },
                  { key: 'chili', basePrice: 60, unit: labels.pricePerKg, trend: '-5%', cat: 'vegetables' },
                  { key: 'carrot', basePrice: 30, unit: labels.pricePerKg, trend: '+2%', cat: 'vegetables' },
                  { key: 'radish', basePrice: 20, unit: labels.pricePerKg, trend: '-1%', cat: 'vegetables' },
                  { key: 'spinach', basePrice: 15, unit: labels.pricePerKg, trend: '+4%', cat: 'vegetables' },
                  { key: 'bitterGourd', basePrice: 45, unit: labels.pricePerKg, trend: '+6%', cat: 'vegetables' },
                  { key: 'bottleGourd', basePrice: 25, unit: labels.pricePerKg, trend: '-3%', cat: 'vegetables' },
                  // Fruits
                  { key: 'apple', basePrice: 120, unit: labels.pricePerKg, trend: '+2%', cat: 'fruits' },
                  { key: 'banana', basePrice: 40, unit: labels.pricePerKg, trend: '+5%', cat: 'fruits' },
                  { key: 'mango', basePrice: 80, unit: labels.pricePerKg, trend: '+12%', cat: 'fruits' },
                  { key: 'grapes', basePrice: 60, unit: labels.pricePerKg, trend: '-4%', cat: 'fruits' },
                  { key: 'orange', basePrice: 50, unit: labels.pricePerKg, trend: '+3%', cat: 'fruits' },
                  { key: 'pomegranate', basePrice: 100, unit: labels.pricePerKg, trend: '+7%', cat: 'fruits' },
                  { key: 'papaya', basePrice: 30, unit: labels.pricePerKg, trend: '-2%', cat: 'fruits' },
                  { key: 'watermelon', basePrice: 20, unit: labels.pricePerKg, trend: '+10%', cat: 'fruits' },
                  { key: 'guava', basePrice: 40, unit: labels.pricePerKg, trend: '+1%', cat: 'fruits' },
                  // Grains
                  { key: 'wheat', basePrice: 2450, unit: labels.pricePerQ, trend: '+1.2%', cat: 'grains' },
                  { key: 'soyabean', basePrice: 4800, unit: labels.pricePerQ, trend: '+0.5%', cat: 'grains' },
                  { key: 'cotton', basePrice: 7200, unit: labels.pricePerQ, trend: '-1.5%', cat: 'grains' },
                  { key: 'rice', basePrice: 3500, unit: labels.pricePerQ, trend: '+2.1%', cat: 'grains' },
                  { key: 'maize', basePrice: 2100, unit: labels.pricePerQ, trend: '+0.8%', cat: 'grains' },
                ].filter(item => item.cat === mandiCategory)
                .map(item => {
                  // Simulate area-specific price variation
                  const areaSeed = mandiArea.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const variation = (areaSeed % 10) - 5; // -5 to +4
                  const finalPrice = typeof item.basePrice === 'number' 
                    ? (item.basePrice + (item.unit === labels.pricePerQ ? variation * 10 : variation)).toLocaleString()
                    : item.basePrice;
                  
                  return { ...item, price: finalPrice };
                }).filter(item => 
                  labels.mandiCrops[item.key as keyof typeof labels.mandiCrops].toLowerCase().includes(mandiSearch.toLowerCase())
                ).map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-2 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-stone-900">
                        {labels.mandiCrops[item.key as keyof typeof labels.mandiCrops]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-bold text-stone-900">₹{item.price}</p>
                        <p className="text-[10px] text-stone-400">{item.unit}</p>
                      </div>
                      <div className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        item.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : 
                        item.trend.startsWith('-') ? "bg-red-50 text-red-600" : "bg-stone-100 text-stone-500"
                      )}>
                        {item.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Intro */}
        {!image && !result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="serif text-4xl md:text-7xl text-stone-900 mb-6 tracking-tight leading-tight">
              {labels.healthyCrops} <span className="text-emerald-700 italic">{labels.happyFarmers}</span>
            </h2>
            <p className="text-stone-500 max-w-xl mx-auto text-lg leading-relaxed">{labels.introText}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-12">
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
                  "relative aspect-[4/3] md:aspect-[21/9] rounded-[40px] border border-stone-200 transition-all overflow-hidden flex flex-col items-center justify-center bg-white shadow-2xl shadow-stone-200/50",
                  image ? "border-emerald-500/50" : "hover:border-emerald-400/50"
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
                    <p className="text-lg font-medium text-stone-900 mb-2">{labels.takePhoto}</p>
                    <p className="text-sm text-stone-500 mb-8">{labels.clickBrowse}</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Upload size={18} />
                      {labels.selectPhoto}
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

              {/* Symptoms Input */}
              {image && !isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                    <MessageSquare size={16} className="text-emerald-600" />
                    {labels.symptomsLabel}
                  </label>
                  <div className="relative">
                    <textarea 
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder={labels.symptomsPlaceholder}
                      className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none h-24 text-sm"
                    />
                    <button className="absolute bottom-3 right-3 p-2 bg-stone-100 rounded-full text-stone-400 hover:text-emerald-600 transition-colors">
                      <Mic size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

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
                    {labels.analyzeCrop}
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
                  <p className="text-stone-600 font-medium italic">{labels.consulting}</p>
                  <p className="text-xs text-stone-400 mt-1">{labels.analyzingLeaves}</p>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700">
                  <AlertTriangle className="shrink-0" size={20} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* History Section */}
              {!image && history.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-12"
                >
                  <h3 className="text-stone-900 font-bold mb-4 flex items-center gap-2">
                    <RefreshCw size={18} className="text-emerald-600" />
                    Recent Scans
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {history.map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setImage(item.image);
                          setResult(item.result);
                        }}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-stone-200 hover:border-emerald-500 transition-all"
                      >
                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <p className="text-[10px] text-white font-bold truncate">{item.result.Languages[language].Condition}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Result Section */}
          <AnimatePresence>
            {result && currentData && (
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
                        {labels.urgentAction}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
                        <CheckCircle2 size={14} />
                        {labels.stable}
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
                        <span className="text-sm font-bold uppercase tracking-widest">{currentData.Crop}</span>
                      </div>
                      <h2 className="serif text-4xl text-stone-900 mb-4 leading-tight">
                        {currentData.Condition.toLowerCase().includes('no disease') ? labels.healthyPlant : currentData.Condition}
                      </h2>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-50 p-3 rounded-2xl">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">{labels.confidence}</p>
                          <p className="text-xl font-bold text-stone-800">{result.Confidence}</p>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-2xl">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">{labels.severity}</p>
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
                      <span className="font-bold text-sm">{labels.diagnosisSummary}</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed italic">
                      "{currentData.Summary}"
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
                      <h3 className="font-bold text-stone-900">{labels.possibleCauses}</h3>
                    </div>
                    <ul className="space-y-3">
                      {currentData.Causes.map((cause, i) => (
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
                      <h3 className="font-bold text-stone-900">{labels.preventionTips}</h3>
                    </div>
                    <ul className="space-y-3">
                      {currentData.PreventionTips.map((tip, i) => (
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
                      <h3 className="font-bold text-xl text-stone-900">{labels.recommendedTreatment}</h3>
                      <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">{labels.actionableSteps}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit">{labels.organicRemedies}</h4>
                      <ul className="space-y-4">
                        {currentData.Treatment.Organic.map((item, i) => (
                          <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">{i + 1}</div>
                            <p className="text-sm text-stone-700 leading-relaxed">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full w-fit">{labels.chemicalOptions}</h4>
                      <ul className="space-y-4">
                        {currentData.Treatment.Chemical.map((item, i) => (
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
                    {labels.scanAnother}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto px-8 mt-32 pb-16 text-center">
        <div className="h-px bg-stone-100 w-full mb-12" />
        <p className="text-[11px] text-stone-300 max-w-sm mx-auto leading-relaxed mb-8 uppercase tracking-widest font-medium">
          {labels.disclaimer}
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-stone-200" />
            <p className="serif text-lg text-stone-800 italic">{labels.builtBy}</p>
            <div className="h-px w-8 bg-stone-200" />
          </div>
          <div className="flex items-center gap-3 text-[9px] text-stone-400 uppercase tracking-[0.3em] font-bold">
            <span>© 2024 KisanDost AI</span>
            <span className="w-1 h-1 bg-stone-200 rounded-full" />
            <span>Advanced Agriculture Tech</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
