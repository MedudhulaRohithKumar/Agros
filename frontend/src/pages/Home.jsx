import { Link } from 'react-router-dom';
import { 
    ShoppingBag, ShieldCheck, Sprout, Sparkles, Award, Truck, CheckCircle2, 
    ArrowRight, ChevronRight, Phone, Clock, MapPin, Layers, Droplet, Bug, Leaf
} from 'lucide-react';

export default function Home() {
    const fertilizerCategories = [
        {
            title: "Nitrogenous Fertilizers",
            tag: "Vegetative Growth",
            desc: "High-nitrogen nutrition for lush green foliage, accelerated tillering, and robust plant stamina.",
            items: ["Urea 46% Prilled & Granular", "Ammonium Sulphate 20.6% N", "Calcium Ammonium Nitrate (CAN)"],
            color: "from-emerald-500 to-teal-600",
            icon: Leaf
        },
        {
            title: "Phosphatic & Complex",
            tag: "Root & Tillering",
            desc: "Balanced N-P-K blends engineered for deep root systems, vigorous flowering, and uniform maturation.",
            items: ["DAP 18-46-0 Di-Ammonium Phosphate", "NPK 20-20-0-13 Complex", "Single Super Phosphate (SSP)"],
            color: "from-blue-500 to-indigo-600",
            icon: Sprout
        },
        {
            title: "Potassic Plant Food",
            tag: "Fruit Quality & Defense",
            desc: "Fortifies cell walls, accelerates starch transport, and improves drought & pest resistance.",
            items: ["MOP Muriate of Potash 60%", "Sulphate of Potash (SOP 0-0-50)", "Water Soluble Potassic Sprays"],
            color: "from-amber-500 to-orange-600",
            icon: Droplet
        },
        {
            title: "Organic & Bio-Nutrients",
            tag: "Soil Microbiome",
            desc: "100% natural microbial and organic manure that rejuvenates organic carbon and long-term soil health.",
            items: ["Cold-Pressed Neem Cake Manure", "Bio-NPK Liquid Consortia", "Enriched Vermicompost"],
            color: "from-teal-600 to-emerald-700",
            icon: Sparkles
        },
        {
            title: "Chelated Micronutrients",
            tag: "Deficiency Cure",
            desc: "Corrects yellowing, chlorosis, and stunted growth with fast-acting chelated trace minerals.",
            items: ["Zinc Sulphate 33% Monohydrate", "Disodium Octaborate (Boron 20%)", "Multi-Micronutrient Grade II"],
            color: "from-purple-500 to-violet-600",
            icon: Layers
        }
    ];

    const pesticideCategories = [
        {
            title: "Targeted Insecticides",
            tag: "Pest Shield",
            desc: "Systemic and contact formulas neutralizing stem borers, aphids, thrips, whiteflies, and bollworms.",
            items: ["Emamectin Benzoate 5% SG", "Chlorantraniliprole 18.5% SC", "Imidacloprid 17.8% SL"],
            badge: "Fast Action"
        },
        {
            title: "Broad-Spectrum Fungicides",
            tag: "Disease Defense",
            desc: "Curative and preventive protection against leaf blast, powdery mildew, sheath rot, and blight.",
            items: ["Azoxystrobin + Difenoconazole", "Tebuconazole + Trifloxystrobin", "Mancozeb 75% WP"],
            badge: "Total Cure"
        },
        {
            title: "Selective Herbicides",
            tag: "Weed Inhibition",
            desc: "Pre-emergence and post-emergence weed control that keeps crops clean without soil harm.",
            items: ["Bispyribac Sodium 10% SC", "Pretilachlor 50% EC", "Glyphosate & Glufosinate Formulations"],
            badge: "Zero Crop Stress"
        },
        {
            title: "Bio & Botanical Pesticides",
            tag: "Residue-Free Organic",
            desc: "Botanical extracts and microbial bio-repellents safe for beneficial pollinators and export crops.",
            items: ["Neem Oil 10,000 PPM (Azadirachtin)", "Bacillus thuringiensis (Bt)", "Beauveria Bassiana Liquid"],
            badge: "100% Safe"
        }
    ];

    return (
        <div className="min-h-screen bg-[#F0F4F8] text-slate-800 pb-20 md:pb-0">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-xl shadow-md">
                        🌾
                    </div>
                    <div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-800 leading-none block">
                            Agros
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                            Fertilizers & Crop Care
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="clay-btn-primary px-5 py-2.5 text-xs font-bold shadow-sm"
                    >
                        <span>Launch POS Terminal</span>
                        <ArrowRight size={15} />
                    </Link>
                </div>
            </header>

            {/* Hero Section with High-Res Agriculture Farm Imagery */}
            <section className="relative px-4 md:px-8 py-8 md:py-14 max-w-7xl mx-auto">
                <div className="clay-card overflow-hidden relative">
                    {/* Background image overlay */}
                    <div className="relative h-[420px] md:h-[500px] w-full overflow-hidden">
                        <img
                            src="/images/agros_hero_farm.jpg"
                            alt="Agros Modern Agricultural Farmland"
                            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent flex flex-col justify-end p-6 md:p-12 text-white">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-extrabold uppercase tracking-wider mb-3 backdrop-blur-xs self-start">
                                <Sparkles size={14} /> Certified High-Yield Agricultural Supplies
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl leading-tight">
                                Empowering Farmers With Scientific Crop Nutrition.
                            </h1>
                            <p className="mt-3 text-sm md:text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
                                Agros provides genuine chemical & organic fertilizers, targeted insecticides, and high-efficiency crop protectors to maximize yield per acre.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    to="/login"
                                    className="clay-btn-primary px-6 py-3.5 text-xs md:text-sm font-black shadow-xl"
                                >
                                    <ShoppingBag size={18} /> Staff Billing Login
                                </Link>
                                <a
                                    href="#fertilizers"
                                    className="clay-btn-secondary px-6 py-3.5 text-xs md:text-sm font-bold bg-white/90 text-slate-900 backdrop-blur-md"
                                >
                                    Explore Products Catalog
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Trust Highlights */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-6">
                    {[
                        { icon: ShieldCheck, title: "100% Genuine Stock", desc: "Govt-approved batch tagged" },
                        { icon: Award, title: "All Crop Varieties", desc: "Paddy, Cotton, Veg & Pulses" },
                        { icon: Truck, title: "Bulk Farm Supply", desc: "Ready dispatch in shop" },
                        { icon: Sparkles, title: "Modern Barcode POS", desc: "Fast computerized billing" },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="clay-card-flat p-4 bg-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-xs text-slate-800 leading-tight">{item.title}</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Showroom & Store Display Section */}
            <section className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
                <div className="clay-card p-6 md:p-8 bg-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-6 space-y-4">
                        <span className="clay-badge bg-emerald-100 text-emerald-800">
                            🌾 Our Store & Warehouse
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-snug">
                            Complete Range of Mineral, Bio & Foliar Farm Nutrients.
                        </h2>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            At Agros, we stock complete agricultural solutions under one roof. Whether you are prepping the soil before sowing, providing vital mid-stage nitrogen top-dressing, or curing micro-nutrient deficiencies, we ensure farmers get genuine products at regulated prices.
                        </p>
                        <div className="space-y-2.5 pt-2">
                            {[
                                "Authentic laboratory-tested N-P-K formulation ratios",
                                "Organic certified bio-stimulants and cold-pressed neem cake",
                                "Complete seasonal pest protection for paddy, cotton, maize, chilli, and vegetables",
                                "Instant barcode-driven digital receipts with transparent pricing"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-6">
                        <div className="clay-card-flat overflow-hidden p-2 bg-slate-50">
                            <img
                                src="/images/agros_fertilizers_showcase.jpg"
                                alt="Agros Fertilizer and Plant Nutrition Showroom"
                                className="w-full h-80 object-cover rounded-2xl shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FERTILIZERS CATALOG SHOWCASE */}
            <section id="fertilizers" className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <span className="clay-badge bg-emerald-100 text-emerald-800 mb-2">
                        🌱 Plant Nutrition Range
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                        Wide Variety of Fertilizers
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium">
                        Tailored formulations for every crop phase: basal dosage, vegetative vegetative surge, flowering, and grain filling.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fertilizerCategories.map((cat, idx) => {
                        const Icon = cat.icon;
                        return (
                            <div key={idx} className="clay-card p-6 flex flex-col justify-between bg-white hover:-translate-y-1 transition-transform">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md`}>
                                            <Icon size={20} />
                                        </div>
                                        <span className="clay-badge text-[10px] bg-slate-100 text-slate-700">
                                            {cat.tag}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 mb-1.5">{cat.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">{cat.desc}</p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                                        Available in Shop:
                                    </span>
                                    {cat.items.map((it, i) => (
                                        <div key={i} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            <span>{it}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* PESTICIDES & CROP PROTECTION SHOWCASE */}
            <section id="pesticides" className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <span className="clay-badge bg-rose-100 text-rose-800 mb-2">
                        🛡️ Crop Defense Range
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                        Pesticides & Crop Protection
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium">
                        Field-tested insecticides, fungicides, and selective weedicides that prevent yield losses and keep crops healthy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {pesticideCategories.map((pest, idx) => (
                        <div key={idx} className="clay-card p-5 bg-white flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-base">
                                        <Bug size={18} />
                                    </div>
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                                        {pest.badge}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-800 mb-1">{pest.title}</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-3">{pest.desc}</p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 space-y-1">
                                {pest.items.map((it, i) => (
                                    <p key={i} className="text-[11px] font-bold text-slate-700 truncate">
                                        • {it}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Banner to POS Terminal */}
            <section className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
                <div className="clay-card p-8 md:p-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className="max-w-xl">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-200 block mb-2">
                            Counter Staff & Store Managers
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                            Access the Agros POS & Billing Terminal
                        </h3>
                        <p className="text-xs md:text-sm text-emerald-100 mt-2 font-medium leading-relaxed">
                            Generate barcode receipts, track stock deductions in real-time, apply customer discounts, and print sales invoices instantly.
                        </p>
                    </div>

                    <Link
                        to="/login"
                        className="clay-btn-secondary px-8 py-4 text-xs md:text-sm font-black text-emerald-800 bg-white hover:bg-emerald-50 shrink-0 shadow-lg"
                    >
                        <span>Open POS Billing</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200/80 px-4 md:px-8 py-8 text-xs text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🌾</span>
                        <span className="font-extrabold text-slate-800">Agros Agro-Chemicals & Fertilizers</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span>Open Daily: 8:00 AM – 8:00 PM</span>
                        <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
                            Staff Sign In
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
