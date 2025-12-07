
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Icons, MOCK_ARTICLES, ANATOMICAL_ORDER, STYLE_KEYWORDS_SUGGESTIONS, BRAND_ASSOCIATIONS, INITIAL_BRAND_SUGGESTIONS, STYLE_ASSOCIATIONS, INITIAL_STYLE_SUGGESTIONS, STYLE_TO_BRAND_ASSOCIATIONS, getImageSrc } from './constants';
import { Spinner } from './components/Spinner';
import { generateVirtualTryOn, rewriteArticle, generateSpeech } from './services/geminiService';
import { AntigravityService } from './services/antigravityService';
import { StorageService } from './services/storageService';
import { ClothingItem, UserProfile, GeneratedOutfit, AppView, Article, AgentLog } from './types';
import { TryOnWidget } from './components/TryOnWidget';
import { Navbar } from './components/Navbar';
import { NewsroomView } from './components/NewsroomView';

// Skeleton Component for Loading States
const SkeletonArticle = () => (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-8 w-48 bg-stone-200 mb-12 rounded"></div>
        <div className="h-24 w-3/4 bg-stone-200 mb-8 rounded"></div>
        <div className="grid grid-cols-4 gap-8 mb-12 py-6 border-y-4 border-stone-100">
            <div className="col-span-1 h-12 bg-stone-200 rounded"></div>
            <div className="col-span-3 h-12 bg-stone-200 rounded"></div>
        </div>
        <div className="space-y-4 mb-12">
            <div className="h-4 bg-stone-200 rounded w-full"></div>
            <div className="h-4 bg-stone-200 rounded w-5/6"></div>
            <div className="h-4 bg-stone-200 rounded w-full"></div>
            <div className="h-4 bg-stone-200 rounded w-4/6"></div>
        </div>
        <div className="h-64 bg-stone-200 rounded w-full mb-12"></div>
        <div className="grid grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-stone-200 rounded"></div>
            <div className="aspect-[3/4] bg-stone-200 rounded"></div>
        </div>
    </div>
);

const App: React.FC = () => {
    // Navigation & View State
    const [view, setView] = useState<AppView>(AppView.BLOG_FEED);
    const [activeArticle, setActiveArticle] = useState<Article | null>(null);
    const [savedOutfits, setSavedOutfits] = useState<GeneratedOutfit[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);

    // Fetch real articles on load
    useEffect(() => {
        const loadArticles = async () => {
            try {
                const { ArticlesService } = await import('./services/articlesService');
                const realArticles = await ArticlesService.fetchArticles();
                if (realArticles.length > 0) {
                    // map RFLCTNArticle to Article interface if needed, or just use if matches
                    // The interfaces are slightly different, let's map them to ensure compatibility
                    const mappedArticles: Article[] = realArticles.map(a => ({
                        id: a.id,
                        title: a.title,
                        subtitle: a.subtitle,
                        author: a.author,
                        date: a.date,
                        coverImage: a.coverImage,
                        content: a.content,
                        items: a.items || [],
                        themeColor: a.themeColor,
                        category: a.category
                    }));
                    setArticles(mappedArticles);
                }
            } catch (e) {
                console.error("Failed to load real articles", e);
            }
        };
        loadArticles();
    }, []);

    // Filter State for Articles
    const [articleFilter, setArticleFilter] = useState<'ALL' | 'New Arrival' | 'Collection' | 'Editorial'>('ALL');

    // Loading Simulation for UX
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    // User State
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: '',
        email: '',
        country: '',
        city: '',
        referenceImages: [],
        height: '',
        weight: '',
        bodyType: 'Athletic',
        occupation: '',
        styleKeywords: [],
        favoriteBrands: [],
        styleIcons: [],
        preferences: '',
        hasProfile: false
    });
    const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
    const [keywordInput, setKeywordInput] = useState('');
    const [brandInput, setBrandInput] = useState('');
    const [iconInput, setIconInput] = useState('');

    // Personalization State
    const [personalizedImages, setPersonalizedImages] = useState<Record<string, string>>({}); // Key: ItemID, Value: Base64
    const [isPersonalizing, setIsPersonalizing] = useState(false);
    const [realityMode, setRealityMode] = useState(false);

    // Widget & Generation State
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [widgetWidth, setWidgetWidth] = useState(450); // Default width
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string | null>(null);
    const [justSaved, setJustSaved] = useState(false);

    // AI Editor & Audio State
    const [isRewriting, setIsRewriting] = useState(false);
    const [currentStyle, setCurrentStyle] = useState('Original');
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Newsroom / Antigravity State
    const [newsroomTopic, setNewsroomTopic] = useState('');
    const [isNewsroomBusy, setIsNewsroomBusy] = useState(false);
    const [targetCurrentUser, setTargetCurrentUser] = useState(false);
    const [newsroomTone, setNewsroomTone] = useState('Brutalist / Edgy');
    const [newsroomKeywords, setNewsroomKeywords] = useState('');
    const [newsroomAudience, setNewsroomAudience] = useState('');
    const [newsroomStyleGuide, setNewsroomStyleGuide] = useState('');
    const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);

    // Sidebar layout state
    const [sidebarWidth, setSidebarWidth] = useState(450);

    // Smart Suggestions Derived State
    const brandSuggestions = useMemo(() => {
        const selected = new Set(userProfile.favoriteBrands.map(b => b.toLowerCase()));
        let suggestions = [...INITIAL_BRAND_SUGGESTIONS];

        // 1. Suggest based on brands
        userProfile.favoriteBrands.forEach(brand => {
            const lower = brand.toLowerCase();
            if (BRAND_ASSOCIATIONS[lower]) {
                suggestions = [...BRAND_ASSOCIATIONS[lower], ...suggestions];
            }
        });

        // 2. Suggest based on Style DNA (Aesthetics)
        userProfile.styleKeywords.forEach(style => {
            const lower = style.toLowerCase();
            if (STYLE_TO_BRAND_ASSOCIATIONS[lower]) {
                suggestions = [...STYLE_TO_BRAND_ASSOCIATIONS[lower], ...suggestions];
            }
        });

        // Unique, not selected, cap at 20
        const unique = suggestions.filter(s => !selected.has(s.toLowerCase()));
        return Array.from(new Set(unique)).slice(0, 20);
    }, [userProfile.favoriteBrands, userProfile.styleKeywords]);

    const styleSuggestions = useMemo(() => {
        const selected = new Set(userProfile.styleKeywords.map(s => s.toLowerCase()));
        let suggestions = [...INITIAL_STYLE_SUGGESTIONS];

        userProfile.styleKeywords.forEach(style => {
            const lower = style.toLowerCase();
            if (STYLE_ASSOCIATIONS[lower]) {
                suggestions = [...STYLE_ASSOCIATIONS[lower], ...suggestions];
            }
        });

        const unique = suggestions.filter(s => !selected.has(s.toLowerCase()));
        return Array.from(new Set(unique)).slice(0, 20);
    }, [userProfile.styleKeywords]);


    // Flatten all items for the Product Grid View
    const allProducts = useMemo(() => {
        const products: { item: ClothingItem; article: Article }[] = [];
        articles.forEach(article => {
            article.items.forEach(item => {
                products.push({ item, article });
            });
        });
        return products;
    }, [articles]);

    // Initial Load from IndexedDB
    useEffect(() => {
        const loadStorage = async () => {
            try {
                const profile = await StorageService.getProfile();
                if (profile) {
                    // Ensure array fields exist
                    setUserProfile(prev => ({
                        ...prev,
                        ...profile,
                        favoriteBrands: profile.favoriteBrands || [],
                        styleKeywords: profile.styleKeywords || [],
                        styleIcons: profile.styleIcons || []
                    }));
                }
                const outfits = await StorageService.getOutfits();
                setSavedOutfits(outfits);
            } catch (e) {
                console.error("Failed to load data from storage", e);
            }
        };
        loadStorage();
    }, []);

    // Stop audio when changing articles
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setAudioSrc(null);
            setIsPlayingAudio(false);
        }
    }, [activeArticle?.id]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    // Just updates state, does not write to DB (to prevent quota thrashing on typing)
    const updateProfileState = (updates: Partial<UserProfile>) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
    };

    // Updates state AND writes to DB immediately (for big actions like images/tags)
    const updateProfileAndPersist = (updates: Partial<UserProfile>) => {
        const updated = { ...userProfile, ...updates, hasProfile: true };
        setUserProfile(updated);
        StorageService.saveProfile(updated);
    };

    const handleSaveIdentity = async () => {
        try {
            const updated = { ...userProfile, hasProfile: true };
            await StorageService.saveProfile(updated);
            setProfileSaveSuccess(true);
            setTimeout(() => setProfileSaveSuccess(false), 2000);
        } catch (e) {
            alert("Failed to save profile. Storage might be full.");
        }
    };

    const handleProfileImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                updateProfileAndPersist({ referenceImages: [...userProfile.referenceImages, base64] });
            } catch (err) {
                alert("Failed to load image");
            }
        }
    };

    const handleAddReferenceImage = async (files: File[]) => {
        const file = files[0];
        if (!file) return;
        try {
            const base64 = await fileToBase64(file);
            updateProfileAndPersist({ referenceImages: [...userProfile.referenceImages, base64] });
        } catch (e) {
            alert("Failed to process image.");
        }
    };

    const removeReferenceImage = (index: number) => {
        const updated = [...userProfile.referenceImages];
        updated.splice(index, 1);
        updateProfileAndPersist({ referenceImages: updated });
    };

    const addTag = (type: 'styleKeywords' | 'favoriteBrands' | 'styleIcons', value: string) => {
        if (value.trim() && !userProfile[type].some(t => t.toLowerCase() === value.trim().toLowerCase())) {
            updateProfileAndPersist({ [type]: [...userProfile[type], value.trim()] });
        }
    };

    const removeTag = (type: 'styleKeywords' | 'favoriteBrands' | 'styleIcons', value: string) => {
        updateProfileAndPersist({ [type]: userProfile[type].filter(k => k !== value) });
    };

    const handleProductClick = (article: Article) => {
        setIsLoadingContent(true);
        setView(AppView.ARTICLE);
        setActiveArticle(article);
        setIsWidgetOpen(false);
        setGeneratedResult(null);
        setCurrentStyle('Original');
        setRealityMode(false);
        window.scrollTo(0, 0);

        // Simulate loading for effect
        setTimeout(() => setIsLoadingContent(false), 800);
    };

    const handleTryOn = async (itemsToWear: ClothingItem[], specificBaseImage?: string) => {
        if (!userProfile.referenceImages || userProfile.referenceImages.length === 0) {
            alert("Please upload at least one reference photo in your Profile.");
            setView(AppView.PROFILE);
            return;
        }

        setIsGenerating(true);
        setJustSaved(false);

        try {
            // Process items to ensure they are base64 (fetch URLs if needed)
            const processedItems = await Promise.all(itemsToWear.map(async (item) => {
                let imgData = item.processedImage || item.originalImage;
                if (imgData.startsWith('http')) {
                    try {
                        // Fetch image via proxy or directly (Unsplash supports CORS)
                        const response = await fetch(imgData, { mode: 'cors' });
                        const blob = await response.blob();
                        imgData = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        }) as string;
                    } catch (e) {
                        console.error("Failed to fetch image", e);
                        return item; // Skip or fail
                    }
                }
                return { ...item, processedImage: imgData, originalImage: imgData };
            }));

            // Sort items for correct AI layering
            const sortedItems = [...processedItems].sort((a, b) => {
                const orderA = ANATOMICAL_ORDER[a.category] || 100;
                const orderB = ANATOMICAL_ORDER[b.category] || 100;
                return orderA - orderB;
            });

            const baseImage = specificBaseImage || userProfile.referenceImages[0];
            const resultBase64 = await generateVirtualTryOn(baseImage, sortedItems);
            setGeneratedResult(resultBase64);
        } catch (e) {
            console.error("Try-on failed", e);
            alert("Failed to generate outfit. Ensure you are uploading valid images.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePersonalizeArticle = async () => {
        if (!activeArticle || userProfile.referenceImages.length === 0) {
            alert("Please complete your IDENTITY profile to use Reality Mode.");
            setView(AppView.PROFILE);
            return;
        }

        setRealityMode(true);

        const missingItems = activeArticle.items.filter(item => !personalizedImages[item.id]);
        if (missingItems.length === 0) return;

        setIsPersonalizing(true);

        try {
            const baseImage = userProfile.referenceImages[0];
            for (const item of missingItems) {
                // Handle URL-to-Base64 for this item
                let imgData = item.processedImage || item.originalImage;
                if (imgData.startsWith('http')) {
                    const response = await fetch(imgData, { mode: 'cors' });
                    const blob = await response.blob();
                    imgData = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                        reader.readAsDataURL(blob);
                    }) as string;
                }

                const itemReady = { ...item, processedImage: imgData, originalImage: imgData };
                const result = await generateVirtualTryOn(baseImage, [itemReady]);
                setPersonalizedItems(prev => ({ ...prev, [item.id]: result }));
            }
        } catch (e) {
            console.error("Personalization failed", e);
        } finally {
            setIsPersonalizing(false);
        }
    };

    const setPersonalizedItems = (updater: (prev: Record<string, string>) => Record<string, string>) => {
        setPersonalizedImages(updater);
    };

    const handleSaveOutfit = async (itemsUsed: string[]) => {
        if (!generatedResult) return;

        const newOutfit: GeneratedOutfit = {
            id: crypto.randomUUID(),
            image: generatedResult,
            itemsUsed: itemsUsed,
            createdAt: new Date().toISOString()
        };

        try {
            await StorageService.saveOutfit(newOutfit);
            setSavedOutfits(prev => [newOutfit, ...prev]);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 3000);
        } catch (e) {
            alert("Failed to save outfit to Archive.");
        }
    };

    const handleDeleteOutfit = async (id: string) => {
        try {
            await StorageService.deleteOutfit(id);
            setSavedOutfits(prev => prev.filter(o => o.id !== id));
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const handleRewrite = async (style: string) => {
        if (!activeArticle || style === currentStyle) return;

        if (style === 'Original') {
            const original = articles.find(a => a.id === activeArticle.id);
            if (original) {
                setActiveArticle({ ...activeArticle, content: original.content });
                setCurrentStyle('Original');
            }
            return;
        }

        setIsRewriting(true);
        try {
            const newContent = await rewriteArticle(activeArticle.content, style);
            setActiveArticle({ ...activeArticle, content: newContent });
            setCurrentStyle(style);
        } catch (e) {
            alert("Could not rewrite article.");
        } finally {
            setIsRewriting(false);
        }
    };

    const handleListen = async () => {
        if (!activeArticle) return;

        if (audioSrc) {
            if (isPlayingAudio) {
                audioRef.current?.pause();
                setIsPlayingAudio(false);
            } else {
                audioRef.current?.play();
                setIsPlayingAudio(true);
            }
            return;
        }

        setIsGeneratingAudio(true);
        try {
            const base64 = await generateSpeech(activeArticle.content, currentStyle);
            const src = `data:audio/mp3;base64,${base64}`;
            setAudioSrc(src);
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.play();
                    setIsPlayingAudio(true);
                }
            }, 100);
        } catch (e) {
            alert("Audio generation failed.");
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    // --- ANTIGRAVITY MISSION DISPATCH ---
    const handleDispatchMission = async () => {
        if (!newsroomTopic) return;
        setIsNewsroomBusy(true);
        setAgentLogs([]);


        try {
            const profileForAgent = targetCurrentUser && userProfile.hasProfile ? userProfile : undefined;
            const keywordsList = newsroomKeywords.split(',').map(s => s.trim()).filter(s => s.length > 0);

            const newArticle = await AntigravityService.dispatchMission({
                topic: newsroomTopic,
                tone: newsroomTone,
                keywords: keywordsList,
                targetAudience: newsroomAudience,
                targetProfile: profileForAgent,
                styleGuide: newsroomStyleGuide
            });

            setArticles(prev => [newArticle, ...prev]);
            setNewsroomTopic('');

            setTimeout(() => {
                setView(AppView.BLOG_FEED);
            }, 2000);

        } catch (e) {
            console.error(e);
            alert("Mission Failed. Signal Lost.");
        } finally {
            setIsNewsroomBusy(false);
        }
    };

    // --- VIEW: PROFILE ---
    const ProfileView = () => (
        <div className="p-4 md:p-12 min-h-screen bg-white pt-24">
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none">SUBJECT<br />01</h1>
                <div className="hidden md:flex flex-col items-end opacity-40 select-none">
                    <div className="h-16 w-48 mb-2 flex items-stretch gap-1">
                        {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} className={`bg-black flex-1 ${i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-2' : 'w-0.5'}`}></div>
                        ))}
                    </div>
                    <span className="font-mono text-xs tracking-[0.5em] font-bold">REF: 77-A9-X2</span>
                </div>
            </div>

            <p className="text-xl font-bold border-l-8 border-black pl-6 mb-12 max-w-2xl uppercase tracking-wide">
                Construct your digital twin. This data fuels the adaptive narrative engine.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Visuals & Stats */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="border-4 border-black p-4 shadow-[12px_12px_0px_0px_#000]">
                        <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
                            <h3 className="font-black uppercase text-xl">Subject Visuals</h3>
                            <span className="bg-black text-white text-xs font-bold px-2 py-1">REQ: FULL BODY</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {userProfile.referenceImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-[3/4] bg-stone-100 group border-2 border-black">
                                    <img src={getImageSrc(img)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                    <button
                                        onClick={() => removeReferenceImage(idx)}
                                        className="absolute top-2 right-2 bg-black text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Icons.Trash />
                                    </button>
                                    <div className="absolute bottom-0 left-0 bg-black text-white text-[10px] font-mono px-1">IMG_0{idx + 1}</div>
                                </div>
                            ))}

                            {userProfile.referenceImages.length < 4 && (
                                <label className="aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-black bg-stone-50 hover:bg-black hover:text-white transition-all cursor-pointer relative group">
                                    <input
                                        type="file"
                                        onChange={handleProfileImageSelect}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <Icons.Camera />
                                    <span className="font-black uppercase mt-2 text-xs group-hover:underline">Add Scan</span>
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="border-4 border-black p-4 bg-stone-100">
                        <h3 className="font-black uppercase text-lg mb-4 border-b-2 border-black pb-1">Biometric Data</h3>
                        <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase">Height</label>
                                <input
                                    type="text"
                                    value={userProfile.height}
                                    onChange={e => updateProfileState({ height: e.target.value })}
                                    className="w-full bg-transparent border-b border-stone-400 focus:border-black outline-none uppercase font-bold"
                                    placeholder="--"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase">Weight</label>
                                <input
                                    type="text"
                                    value={userProfile.weight}
                                    onChange={e => updateProfileState({ weight: e.target.value })}
                                    className="w-full bg-transparent border-b border-stone-400 focus:border-black outline-none uppercase font-bold"
                                    placeholder="--"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase">Body Type</label>
                                <select
                                    value={userProfile.bodyType}
                                    onChange={e => updateProfileState({ bodyType: e.target.value as any })}
                                    className="w-full bg-transparent border-b border-stone-400 focus:border-black outline-none uppercase font-bold"
                                >
                                    <option value="Ectomorph">Ectomorph (Lean)</option>
                                    <option value="Mesomorph">Mesomorph (Muscular)</option>
                                    <option value="Endomorph">Endomorph (Soft)</option>
                                    <option value="Athletic">Athletic</option>
                                    <option value="Curvy">Curvy</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Textual Data */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="space-y-6">
                        <h3 className="font-black uppercase text-4xl bg-black text-white inline-block px-4 py-1 transform -skew-x-6">Subject Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="block font-black uppercase tracking-widest text-xs text-stone-400">Full Name</label>
                                <input
                                    type="text"
                                    value={userProfile.name}
                                    onChange={e => updateProfileState({ name: e.target.value })}
                                    className="w-full bg-transparent border-b-4 border-black py-2 font-sans font-black text-2xl focus:outline-none uppercase placeholder:text-stone-200"
                                    placeholder="NAME"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block font-black uppercase tracking-widest text-xs text-stone-400">Occupation</label>
                                <input
                                    type="text"
                                    value={userProfile.occupation}
                                    onChange={e => updateProfileState({ occupation: e.target.value })}
                                    className="w-full bg-transparent border-b-4 border-black py-2 font-sans font-black text-2xl focus:outline-none uppercase placeholder:text-stone-200"
                                    placeholder="ROLE"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="block font-black uppercase tracking-widest text-xs text-stone-400">Location</label>
                                <input
                                    type="text"
                                    value={userProfile.city}
                                    onChange={e => updateProfileState({ city: e.target.value })}
                                    className="w-full bg-transparent border-b-4 border-black py-2 font-sans font-bold text-xl focus:outline-none uppercase placeholder:text-stone-200"
                                    placeholder="CITY"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block font-black uppercase tracking-widest text-xs text-stone-400">Region</label>
                                <input
                                    type="text"
                                    value={userProfile.country}
                                    onChange={e => updateProfileState({ country: e.target.value })}
                                    className="w-full bg-transparent border-b-4 border-black py-2 font-sans font-bold text-xl focus:outline-none uppercase placeholder:text-stone-200"
                                    placeholder="COUNTRY"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t-8 border-stone-100">
                        <h3 className="font-black uppercase text-2xl mb-6">Style DNA</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                            {/* Brand Affinity Section */}
                            <div className="space-y-4">
                                <label className="font-bold uppercase text-xs bg-black text-white px-2 py-1 inline-block">Brand Affinity</label>
                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {userProfile.favoriteBrands?.map(k => (
                                        <span key={k} className="bg-stone-900 text-white text-xs font-bold px-2 py-1 uppercase flex items-center gap-2">
                                            {k} <button onClick={() => removeTag('favoriteBrands', k)}><Icons.Close /></button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={brandInput}
                                    onChange={e => setBrandInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { addTag('favoriteBrands', brandInput); setBrandInput(''); } }}
                                    className="w-full border-b-2 border-stone-300 py-2 font-bold uppercase text-sm focus:outline-none focus:border-black"
                                    placeholder="+ ADD BRAND"
                                />

                                {/* Smart Brand Suggestions */}
                                {brandSuggestions.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-[10px] font-black uppercase text-stone-400 mb-2 tracking-widest">Smart Suggestions</p>
                                        <div className="flex flex-wrap gap-2">
                                            {brandSuggestions.map(brand => (
                                                <button
                                                    key={brand}
                                                    onClick={() => addTag('favoriteBrands', brand)}
                                                    className="text-[10px] uppercase border border-stone-200 text-stone-600 px-2 py-1 hover:bg-black hover:text-white hover:border-black transition-all"
                                                >
                                                    + {brand}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Style DNA / Aesthetics Section */}
                            <div className="space-y-4">
                                <label className="font-bold uppercase text-xs bg-stone-200 px-2 py-1 inline-block">Style DNA</label>
                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {userProfile.styleKeywords.map(k => (
                                        <span key={k} className="border-2 border-black text-black text-xs font-bold px-2 py-1 uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-colors">
                                            {k} <button onClick={() => removeTag('styleKeywords', k)}><Icons.Close /></button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={keywordInput}
                                    onChange={e => setKeywordInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { addTag('styleKeywords', keywordInput); setKeywordInput(''); } }}
                                    className="w-full border-b-2 border-stone-300 py-2 font-bold uppercase text-sm focus:outline-none focus:border-black"
                                    placeholder="+ ADD TAG"
                                />

                                {/* Smart Style Suggestions */}
                                <div className="mt-3">
                                    <p className="text-[10px] font-black uppercase text-stone-400 mb-2 tracking-widest">Related Styles</p>
                                    <div className="flex flex-wrap gap-2">
                                        {styleSuggestions.map(kw => (
                                            <button
                                                key={kw}
                                                onClick={() => addTag('styleKeywords', kw)}
                                                className="text-[10px] uppercase border border-stone-200 text-stone-600 px-2 py-1 hover:bg-black hover:text-white hover:border-black transition-all"
                                            >
                                                + {kw}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Style Icons Section */}
                            <div className="space-y-4">
                                <label className="font-bold uppercase text-xs bg-stone-200 px-2 py-1 inline-block">Style Icons</label>
                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {userProfile.styleIcons?.map(k => (
                                        <span key={k} className="border-2 border-black text-black text-xs font-bold px-2 py-1 uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-colors">
                                            {k} <button onClick={() => removeTag('styleIcons', k)}><Icons.Close /></button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={iconInput}
                                    onChange={e => setIconInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { addTag('styleIcons', iconInput); setIconInput(''); } }}
                                    className="w-full border-b-2 border-stone-300 py-2 font-bold uppercase text-sm focus:outline-none focus:border-black"
                                    placeholder="+ ADD ICON (E.G. A$AP ROCKY)"
                                />
                            </div>

                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            onClick={handleSaveIdentity}
                            className={`
                            w-full py-6 font-black uppercase text-2xl tracking-widest transition-all border-4 border-black shadow-[8px_8px_0px_0px_#000] active:translate-y-[4px] active:shadow-[4px_4px_0px_0px_#000]
                            ${profileSaveSuccess ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}
                        `}
                        >
                            {profileSaveSuccess ? (
                                <span className="flex justify-center items-center gap-4">CONFIRMED <Icons.Check /></span>
                            ) : (
                                'SAVE IDENTITY RECORD'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- NEW VIEW: LONG READS ---
    const LongReadsView = () => {
        // Use memoized filtering
        const filteredArticles = useMemo(() => {
            if (articleFilter === 'ALL') return articles;
            return articles.filter(a => a.category === articleFilter);
        }, [articles, articleFilter]);

        const filters = ['ALL', 'New Arrival', 'Collection', 'Editorial'];

        return (
            <div className="min-h-screen bg-white pt-24 pb-32 px-4 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="border-b-8 border-black pb-8 mb-12">
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-8">EDITORIAL<br />STORIES</h1>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap gap-4">
                            {filters.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setArticleFilter(f as any)}
                                    className={`
                                px-4 py-2 font-black uppercase text-sm tracking-widest border-2 border-black transition-all
                                ${articleFilter === f ? 'bg-black text-white' : 'bg-white text-black hover:bg-stone-200'}
                            `}
                                >
                                    {f === 'ALL' ? 'VIEW ALL' : f + 'S'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-32">
                        {filteredArticles.length === 0 ? (
                            <div className="py-20 text-center font-black uppercase text-stone-300 text-4xl">No stories found</div>
                        ) : (
                            filteredArticles.map((article, idx) => (
                                <article key={article.id} className="group cursor-pointer flex flex-col lg:flex-row gap-8 md:gap-16" onClick={() => handleProductClick(article)}>
                                    {/* Numbering / Meta */}
                                    <div className="lg:w-1/12 pt-2 border-t-4 border-black hidden lg:block">
                                        <span className="font-black text-4xl block">{(idx + 1).toString().padStart(2, '0')}</span>
                                    </div>

                                    {/* Image */}
                                    <div className="lg:w-5/12">
                                        <div className="aspect-[3/4] md:aspect-[4/5] lg:aspect-[3/4] border-4 border-black overflow-hidden relative bg-stone-100">
                                            <img
                                                src={getImageSrc(article.coverImage)}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                                            />
                                            {/* Category Badge */}
                                            {article.category && (
                                                <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 font-black uppercase text-xs z-10">
                                                    {article.category}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="lg:w-6/12 flex flex-col justify-center">
                                        <div className="mb-4 flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                                            <span className="bg-black text-white px-2 py-1">{article.date}</span>
                                            <span className="text-stone-500">{article.author}</span>
                                        </div>
                                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6 decoration-4 underline-offset-8 group-hover:underline">
                                            {article.title}
                                        </h2>
                                        <p className="text-xl md:text-2xl font-bold text-stone-600 uppercase leading-tight mb-8">
                                            {article.subtitle}
                                        </p>
                                        <div className="flex items-center gap-2 font-black uppercase text-sm group-hover:gap-4 transition-all">
                                            Read Full Story <Icons.ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Gufram-style Dense Grid (Landing Page)
    const ProductGrid = () => {
        const getSpanClass = (i: number) => {
            // Pattern for varied visual hierarchy (Gufram style)
            const patterns = [
                'col-span-1 row-span-1',
                'col-span-1 row-span-2', // Tall
                'col-span-1 row-span-1',
                'col-span-2 row-span-2', // Big Feature
                'col-span-1 row-span-1',
                'col-span-2 row-span-1', // Wide
                'col-span-1 row-span-1',
            ];
            return patterns[i % patterns.length];
        };

        return (
            <div className="min-h-screen bg-white">
                <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-4 border-black px-4 py-3 flex justify-between items-center">
                    <div className="font-black text-sm uppercase tracking-widest">
                        INDEX ({allProducts.length})
                    </div>
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                        <button className="hover:text-stone-500 underline decoration-2 underline-offset-2">Grid</button>
                        <button className="text-stone-400 hover:text-black">List</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[250px] md:auto-rows-[350px] gap-1 p-1 grid-flow-dense">
                    {allProducts.map(({ item, article }, idx) => (
                        <div
                            key={item.id + idx}
                            className={`relative group cursor-pointer border border-transparent hover:border-black transition-colors bg-stone-50 overflow-hidden ${getSpanClass(idx)}`}
                            onClick={() => handleProductClick(article)}
                        >
                            <img
                                src={getImageSrc(item.originalImage)}
                                alt={item.description}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />

                            {/* Hover State Overlay */}
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-6">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {item.brandLogo ? (
                                        <img src={getImageSrc(item.brandLogo)} alt={item.brand} className="h-8 w-auto object-contain mb-2" />
                                    ) : (
                                        <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-[0.8] break-words">
                                            {item.brand || "Unknown"}
                                        </h3>
                                    )}
                                    <div className="h-1 w-12 bg-black mt-4 mb-2"></div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">{item.category}</p>
                                </div>

                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                    <p className="font-bold text-sm uppercase leading-tight mb-1">{item.description}</p>
                                    <p className="font-mono text-xs text-stone-600">{item.price}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="py-32 border-t-4 border-black mt-1 bg-stone-100 flex items-center justify-center overflow-hidden">
                    <h1 className="text-[12vw] font-black uppercase tracking-tighter leading-none opacity-5 select-none whitespace-nowrap">
                        RFLCTN ARCHIVE
                    </h1>
                </div>
            </div>
        );
    };

    const ArticleOverlay = () => {
        if (!activeArticle) return null;
        if (isLoadingContent) return <SkeletonArticle />;

        return (
            <div className="min-h-screen bg-white pb-32">
                {/* Audio Element */}
                {audioSrc && <audio ref={audioRef} src={audioSrc} onEnded={() => setIsPlayingAudio(false)} />}

                {/* Article Header */}
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <button onClick={() => setView(AppView.BLOG_FEED)} className="mb-12 flex items-center gap-2 text-lg font-black uppercase tracking-widest hover:underline decoration-4 underline-offset-4">
                        <Icons.ChevronLeft /> BACK TO PRODUCTS
                    </button>

                    {/* Admin Magic Editor */}
                    {isAdmin && (
                        <div className="mb-8 p-4 border-4 border-black bg-yellow-300 flex items-center gap-4">
                            <div className="font-black uppercase flex items-center gap-2">
                                <Icons.Sparkles /> Magic Editor
                            </div>
                            <select
                                className="bg-white border-4 border-black text-sm py-2 px-4 font-bold uppercase cursor-pointer outline-none"
                                value={currentStyle}
                                onChange={(e) => handleRewrite(e.target.value)}
                                disabled={isRewriting}
                            >
                                <option value="Original">Original</option>
                                <option value="The Conscious Curator">Conscious Curator</option>
                                <option value="Gen Z">Gen Z</option>
                                <option value="Professional">Professional</option>
                            </select>
                            {isRewriting && <Spinner size="sm" />}
                        </div>
                    )}

                    <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8 break-words hyphens-auto">
                        {activeArticle.title}
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 border-y-4 border-black py-6">
                        <div className="col-span-1 font-bold text-sm uppercase tracking-widest text-black">
                            <div>DATE: {activeArticle.date}</div>
                            <div>AUTHOR: {activeArticle.author}</div>
                            {activeArticle.category && <div className="mt-2 bg-black text-white px-2 py-1 inline-block">{activeArticle.category}</div>}

                            <button
                                onClick={handleListen}
                                disabled={isGeneratingAudio}
                                className="mt-4 flex items-center gap-2 text-xs font-black uppercase border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-all"
                            >
                                {isGeneratingAudio ? <Spinner size="sm" color="text-current" /> : isPlayingAudio ? <><Icons.Pause className="w-4 h-4" /> PAUSE</> : <><Icons.SpeakerWave className="w-4 h-4" /> LISTEN</>}
                            </button>
                        </div>
                        <div className="col-span-3 text-2xl md:text-3xl font-bold uppercase leading-tight">
                            {activeArticle.subtitle}
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="mb-12 border-4 border-black">
                        <img src={getImageSrc(activeArticle.coverImage)} className="w-full h-auto grayscale" />
                    </div>

                    <div className={`prose prose-xl max-w-none prose-headings:font-black prose-headings:uppercase prose-p:font-medium prose-p:text-black prose-blockquote:border-l-8 border-black prose-blockquote:bg-stone-100 prose-blockquote:p-8 prose-blockquote:font-black prose-blockquote:uppercase prose-blockquote:not-italic ${isRewriting ? 'opacity-50' : ''}`}>
                        <div dangerouslySetInnerHTML={{ __html: activeArticle.content }} />
                    </div>

                    {/* Collection Section */}
                    <div className="mt-24 pt-12 border-t-8 border-black">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">THE COLLECTION</h2>

                            <div className="flex flex-col items-end">
                                <button
                                    onClick={realityMode ? () => setRealityMode(false) : handlePersonalizeArticle}
                                    className={`
                                  flex items-center gap-3 px-6 py-3 border-4 border-black font-black uppercase tracking-widest transition-all
                                  ${realityMode ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'}
                              `}
                                >
                                    <Icons.Eye className={`w-5 h-5 ${realityMode ? "text-yellow-400" : ""}`} />
                                    {realityMode ? 'REALITY: ON' : 'REALITY: OFF'}
                                    {isPersonalizing && <Spinner size="sm" color={realityMode ? "text-white" : "text-black"} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {activeArticle.items.map((item) => {
                                let displayImage = item.originalImage;
                                let isPersonalized = false;
                                if (realityMode && personalizedImages[item.id]) {
                                    displayImage = personalizedImages[item.id];
                                    isPersonalized = true;
                                }

                                return (
                                    <div key={item.id} className="group relative">
                                        <div className={`aspect-[3/4] border-4 border-black bg-white relative overflow-hidden ${isPersonalized ? 'shadow-[8px_8px_0px_0px_#000]' : ''}`}>
                                            <img
                                                src={getImageSrc(displayImage)}
                                                className={`w-full h-full object-cover transition-all duration-700 ${isPersonalized ? 'scale-100' : 'grayscale group-hover:grayscale-0'}`}
                                            />

                                            <button
                                                onClick={() => setIsWidgetOpen(true)}
                                                className="absolute bottom-0 right-0 bg-black text-white border-t-4 border-l-4 border-black p-4 hover:bg-white hover:text-black transition-colors"
                                            >
                                                <Icons.Shirt className="w-8 h-8" />
                                            </button>
                                        </div>
                                        <div className="mt-2 border-b-4 border-black pb-2">
                                            <h3 className="font-black text-3xl uppercase leading-none">{item.brand}</h3>
                                            <div className="flex justify-between items-end">
                                                <p className="font-bold text-lg uppercase">{item.description}</p>
                                                <span className="font-black text-xl">{item.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        );
    };

    const SavedLooksView = () => (
        <div className="p-4 md:p-12 min-h-screen pt-24 bg-white">
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-12 leading-none">HISTORY<br />(ARCHIVE)</h1>
            {savedOutfits.length === 0 ? (
                <div className="border-8 border-black p-20 text-center">
                    <p className="font-black text-4xl text-stone-300 uppercase">ARCHIVE EMPTY</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {savedOutfits.map(outfit => (
                        <div key={outfit.id} className="border-4 border-black bg-white p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <img src={getImageSrc(outfit.image)} className="w-full h-auto border-2 border-black" />
                            <div className="mt-4 flex justify-between items-center px-2 border-t-4 border-black pt-2">
                                <span className="font-bold font-mono text-xs">{new Date(outfit.createdAt).toLocaleDateString()}</span>
                                <button
                                    onClick={() => handleDeleteOutfit(outfit.id)}
                                    className="font-black text-xs uppercase hover:bg-black hover:text-white px-2 py-1 transition-colors"
                                >
                                    DELETE
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white text-black font-sans flex-col md:flex-row">
            <Navbar
                currentView={view}
                setView={setView}
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
                userProfile={userProfile}
            />

            {/* Main Content Area - Offset for Desktop Sidebar */}
            <main className="flex-1 md:ml-96 transition-all duration-300 relative bg-white" style={{ marginRight: (isWidgetOpen && view === AppView.ARTICLE) ? `${sidebarWidth}px` : 0 }}>
                {view === AppView.BLOG_FEED && <ProductGrid />}
                {view === AppView.LONG_READS && <LongReadsView />}
                {view === AppView.ARTICLE && <ArticleOverlay />}
                {view === AppView.SAVED_LOOKS && <SavedLooksView />}
                {view === AppView.PROFILE && <ProfileView />}
                {view === AppView.NEWSROOM && <NewsroomView
                    isAdmin={isAdmin}
                    setView={setView}
                    newsroomTopic={newsroomTopic}
                    setNewsroomTopic={setNewsroomTopic}
                    newsroomTone={newsroomTone}
                    setNewsroomTone={setNewsroomTone}
                    newsroomKeywords={newsroomKeywords}
                    setNewsroomKeywords={setNewsroomKeywords}
                    newsroomAudience={newsroomAudience}
                    setNewsroomAudience={setNewsroomAudience}
                    newsroomStyleGuide={newsroomStyleGuide}
                    setNewsroomStyleGuide={setNewsroomStyleGuide}
                    targetCurrentUser={targetCurrentUser}
                    setTargetCurrentUser={setTargetCurrentUser}
                    userProfile={userProfile}
                    isNewsroomBusy={isNewsroomBusy}
                    handleDispatchMission={handleDispatchMission}
                    agentLogs={agentLogs}
                />}
            </main>

            {/* Context Widget (Try On) */}
            {activeArticle && (
                <TryOnWidget
                    isOpen={isWidgetOpen && view === AppView.ARTICLE}
                    setIsOpen={(val) => {
                        setIsWidgetOpen(val);
                    }}
                    width={sidebarWidth}
                    onResize={setSidebarWidth}
                    articleItems={activeArticle.items}
                    userProfile={userProfile}
                    onUploadUser={handleAddReferenceImage}
                    onTryOn={handleTryOn}
                    isGenerating={isGenerating}
                    generatedResult={generatedResult}
                    onSave={handleSaveOutfit}
                    justSaved={justSaved}
                    onReset={() => {
                        setGeneratedResult(null);
                        setIsWidgetOpen(true);
                    }}
                />
            )}
        </div>
    );
};

export default App;
