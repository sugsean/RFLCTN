
import React, { useState, useRef, useEffect } from 'react';
import { Icons, Z_INDEX_ORDER, ANATOMICAL_ORDER, getImageSrc } from '../constants';
import { ClothingItem, UserProfile } from '../types';
import { UploadButton } from './UploadButton';
import { Spinner } from './Spinner';
import { analyzeClothingItem, extractClothingItem } from '../services/geminiService';

interface TryOnWidgetProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  width: number;
  onResize: (width: number) => void;
  articleItems: ClothingItem[];
  userProfile: UserProfile;
  onUploadUser: (files: File[]) => void;
  onTryOn: (selectedItems: ClothingItem[], baseImage?: string) => void;
  isGenerating: boolean;
  generatedResult: string | null;
  onSave: (items: string[]) => void;
  justSaved: boolean;
  onReset: () => void;
}

interface ItemTransform {
  x: number;
  y: number;
  scale: number;
}

export const TryOnWidget: React.FC<TryOnWidgetProps> = ({
  isOpen,
  setIsOpen,
  width,
  onResize,
  articleItems,
  userProfile,
  onUploadUser,
  onTryOn,
  isGenerating,
  generatedResult,
  onSave,
  justSaved,
  onReset
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemTransforms, setItemTransforms] = useState<Record<string, ItemTransform>>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [showDropSuccess, setShowDropSuccess] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showShopList, setShowShopList] = useState(false);
  const [isSearchingLinks, setIsSearchingLinks] = useState(false);
  
  // Loading State for Rack Items (simulated)
  const [isLoadingRack, setIsLoadingRack] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [customItems, setCustomItems] = useState<ClothingItem[]>([]);
  const [cleaningItems, setCleaningItems] = useState<Set<string>>(new Set());

  // Filter State
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const allItems = [...articleItems, ...customItems];

  // Simulate Rack Loading
  useEffect(() => {
    if (isOpen) {
        setIsLoadingRack(true);
        const timer = setTimeout(() => setIsLoadingRack(false), 1000);
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-open shop list when result is generated with finding simulation
  useEffect(() => {
      if (generatedResult) {
          setShowShopList(true);
          setIsSearchingLinks(true);
          const timer = setTimeout(() => setIsSearchingLinks(false), 1500);
          return () => clearTimeout(timer);
      }
  }, [generatedResult]);

  // --- Resizing Logic ---
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const newWidth = Math.max(400, Math.min(900, startWidth + delta));
      onResize(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "copy";
    setDraggingItemId(id);
  };

  const handleDragEnd = () => {
    setDraggingItemId(null);
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDraggingItemId(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (!generatedResult) {
        onUploadUser(files);
        return;
      }
    }

    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      let initialX = 50;
      let initialY = 50;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        initialX = ((e.clientX - rect.left) / rect.width) * 100;
        initialY = ((e.clientY - rect.top) / rect.height) * 100;
      }

      if (!selectedItems.includes(id)) {
        setSelectedItems(prev => [...prev, id]);
        setShowDropSuccess(true);
        setTimeout(() => setShowDropSuccess(false), 1500);
      }

      setItemTransforms(prev => ({
        ...prev,
        [id]: { x: initialX, y: initialY, scale: 1 }
      }));
      setActiveItemId(id);
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i !== id));
    if (activeItemId === id) setActiveItemId(null);
  };

  const handleCustomUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const tempId = `custom-${Date.now()}`;

        // 1. Add Item immediately (Optimistic)
        const newItem: ClothingItem = {
            id: tempId,
            type: 'unknown',
            category: 'unknown',
            description: 'Analyzing...',
            originalImage: base64,
            processedImage: base64, // Initially use original
            brand: 'MY ARCHIVE',
            price: 'N/A'
        };
        setCustomItems(prev => [newItem, ...prev]);

        try {
            // 2. Analyze
            const analysis = await analyzeClothingItem(base64);
            
            setCustomItems(prev => prev.map(item => {
                if (item.id === tempId) {
                    return {
                        ...item,
                        description: analysis.description || 'Custom Piece',
                        category: analysis.category || 'unknown',
                        color: analysis.color,
                        type: analysis.category || 'unknown'
                    };
                }
                return item;
            }));

            // 3. Extract/Clean (Background Process)
            setCleaningItems(prev => new Set(prev).add(tempId));
            const cleanedImage = await extractClothingItem(base64, analysis.description || 'clothing item');
            
            if (cleanedImage) {
                 setCustomItems(prev => prev.map(item => {
                    if (item.id === tempId) {
                        return {
                            ...item,
                            processedImage: cleanedImage // Update with clean image
                        };
                    }
                    return item;
                }));
            }

        } catch (error) {
            console.error("Analysis failed", error);
            setCustomItems(prev => prev.map(item => {
                if (item.id === tempId) {
                    return { ...item, description: 'Custom Piece' };
                }
                return item;
            }));
        } finally {
            setCleaningItems(prev => {
                const next = new Set(prev);
                next.delete(tempId);
                return next;
            });
        }
    };
    reader.readAsDataURL(file);
  };

  const handleItemMouseDown = (e: React.MouseEvent, id: string) => {
    if (generatedResult) return;
    e.stopPropagation();
    setActiveItemId(id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = itemTransforms[id] || { x: 50, y: 50, scale: 1 };
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const dxPercent = (dx / rect.width) * 100;
      const dyPercent = (dy / rect.height) * 100;

      setItemTransforms(prev => ({
        ...prev,
        [id]: {
          ...startTransform,
          x: Math.min(100, Math.max(0, startTransform.x + dxPercent)),
          y: Math.min(100, Math.max(0, startTransform.y + dyPercent))
        }
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const updateItemScale = (id: string, newScale: number) => {
    setItemTransforms(prev => ({
      ...prev,
      [id]: { ...prev[id], scale: newScale }
    }));
  };

  const handleNextImage = () => {
    if (userProfile.referenceImages.length > 0) {
       setActiveImageIndex((prev) => (prev + 1) % userProfile.referenceImages.length);
    }
  };

  const handlePrevImage = () => {
    if (userProfile.referenceImages.length > 0) {
       setActiveImageIndex((prev) => (prev - 1 + userProfile.referenceImages.length) % userProfile.referenceImages.length);
    }
  };

  const currentBaseImage = userProfile.referenceImages?.[activeImageIndex];

  // Filtered Items Logic
  const filterMap: Record<string, string[]> = {
    'ALL': [],
    'TOPS': ['top', 'full-body'],
    'BOTTOMS': ['bottom'],
    'SHOES': ['shoes'],
    'ACCESSORIES': ['accessory', 'unknown']
  };

  const displayedItems = allItems.filter(item => {
    if (categoryFilter === 'ALL') return true;
    return filterMap[categoryFilter]?.includes(item.category);
  });

  // If widget is closed, it is hidden by parent layout logic mostly, but we can return null
  if (!isOpen) return null;

  return (
    <div 
        className={`fixed inset-y-0 right-0 z-50 bg-white flex flex-col border-l-4 border-black transition-transform duration-300 ease-in-out ${isResizing ? 'select-none' : ''}`}
        style={{ width: width }}
    >
      {/* Resize Handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-yellow-400 z-50 transition-colors"
        onMouseDown={handleResizeStart}
      />
      
      {/* Header */}
      <div className="p-6 border-b-4 border-black flex justify-between items-center bg-white">
        <div>
           <h2 className="font-black text-2xl uppercase tracking-tighter">Fitting Room</h2>
           <p className="text-xs font-bold uppercase tracking-widest mt-1">Drag & Drop to Style</p>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <Icons.Close className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar bg-stone-50">
        
        {/* 1. User Photo / Interactive Canvas */}
        <div className="space-y-4">
             <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <h3 className="text-sm font-black uppercase tracking-widest">1. Model</h3>
                {userProfile.referenceImages.length > 1 && !generatedResult && (
                    <div className="flex gap-2">
                        <button onClick={handlePrevImage} className="hover:bg-black hover:text-white px-2 border border-black"><Icons.ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-xs font-bold font-mono py-1">{activeImageIndex + 1} / {userProfile.referenceImages.length}</span>
                        <button onClick={handleNextImage} className="hover:bg-black hover:text-white px-2 border border-black"><Icons.ChevronRight className="w-4 h-4" /></button>
                    </div>
                )}
             </div>
             
             <div 
                ref={containerRef}
                className={`
                    relative w-full bg-white border-2 transition-all duration-300 select-none overflow-hidden min-h-[400px] flex items-center justify-center
                    ${showDropSuccess ? 'border-green-500' : ''}
                    ${isDragOver && !showDropSuccess ? 'border-black bg-stone-200' : 'border-stone-300'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => setActiveItemId(null)}
             >
                {generatedResult ? (
                    // Result View
                    <div className="w-full relative group">
                        <img src={getImageSrc(generatedResult)} className="w-full h-auto max-h-[70vh] object-contain mx-auto block" alt="Result" />
                         
                         {/* Shop The Look Popover */}
                         {showShopList && (
                            <div className="absolute bottom-16 right-4 left-4 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                                <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                                    <h4 className="font-black uppercase text-sm tracking-wider">Shopping Bag ({selectedItems.length})</h4>
                                    <button onClick={() => setShowShopList(false)} className="hover:bg-black hover:text-white p-1"><Icons.Close className="w-4 h-4" /></button>
                                </div>
                                
                                {isSearchingLinks ? (
                                    <div className="py-8 text-center">
                                        <div className="flex justify-center mb-2"><Spinner size="md" color="text-black" /></div>
                                        <p className="text-xs font-bold uppercase animate-pulse">Locating retailers...</p>
                                    </div>
                                ) : selectedItems.length === 0 ? (
                                    <div className="text-center py-4 text-xs font-bold uppercase text-stone-400">No items selected</div>
                                ) : (
                                    <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                                        {allItems.filter(i => selectedItems.includes(i.id)).map(item => (
                                            <div key={item.id} className="flex justify-between items-center gap-2 group/item border-b border-stone-100 pb-2 last:border-0">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className="w-8 h-8 bg-stone-100 border border-stone-200 flex-shrink-0">
                                                        <img src={getImageSrc(item.processedImage || item.originalImage)} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-[10px] font-black uppercase truncate">{item.brand}</span>
                                                        <span className="text-[10px] font-medium text-stone-500 truncate">{item.description}</span>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={item.buyLink || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent((item.brand || '') + ' ' + item.description)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-black text-white px-3 py-2 text-[10px] font-black uppercase hover:bg-yellow-400 hover:text-black transition-colors flex items-center gap-1 flex-shrink-0"
                                                >
                                                    BUY <Icons.Shop className="w-3 h-3" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 pt-2 border-t-2 border-black text-center">
                                    <p className="text-[10px] font-bold uppercase text-stone-400 flex items-center justify-center gap-2">
                                        <Icons.Lock className="w-3 h-3" /> Secure Affiliate Partner Link
                                    </p>
                                </div>
                            </div>
                         )}

                         <div className="absolute inset-x-0 bottom-0 p-4 bg-black text-white flex items-center justify-between z-20">
                             <button onClick={onReset} className="font-bold uppercase text-sm hover:text-stone-300">Reset</button>
                             <div className="flex gap-4">
                                <button 
                                    onClick={() => {
                                        if (!showShopList) setIsSearchingLinks(true);
                                        setShowShopList(!showShopList);
                                        if (!showShopList) setTimeout(() => setIsSearchingLinks(false), 1500);
                                    }} 
                                    className={`font-bold uppercase text-sm hover:text-yellow-400 flex items-center gap-2 transition-colors ${showShopList ? 'text-yellow-400' : ''}`}
                                >
                                    SHOP THE LOOK <Icons.Shop className="w-4 h-4" />
                                </button>
                                <button onClick={() => onSave(selectedItems)} className="font-bold uppercase text-sm hover:text-yellow-400 flex items-center gap-2 transition-colors">
                                    {justSaved ? 'Saved' : 'Save'} {justSaved ? <Icons.Check className="w-4 h-4" /> : <Icons.Heart className="w-4 h-4" />}
                                </button>
                             </div>
                         </div>
                    </div>
                ) : currentBaseImage ? (
                    // Canvas View
                    <>
                         <img src={getImageSrc(currentBaseImage)} className="w-full h-auto max-h-[70vh] object-contain mx-auto block opacity-90 pointer-events-none grayscale" alt="User" />
                         
                        {/* Interactive Clothing Layers */}
                        {selectedItems.map(id => {
                          const item = allItems.find(i => i.id === id);
                          if (!item) return null;
                          const transform = itemTransforms[id] || { x: 50, y: 50, scale: 1 };
                          const isActive = activeItemId === id;
                          
                          // Visual Layering based on Anatomical Order (Persists even when selected)
                          // ANATOMICAL_ORDER: Acc(10), Full(20), Top(30), Bottom(40), Shoes(50)
                          // Reversed for visual stack (Front to Back): 100 - Order
                          // Acc(90) > Full(80) > Top(70) > Bottom(60) > Shoes(50)
                          const itemOrder = ANATOMICAL_ORDER[item.category] || 60;
                          const zIndex = 100 - itemOrder; 

                          return (
                            <div
                              key={id}
                              onMouseDown={(e) => handleItemMouseDown(e, id)}
                              onClick={(e) => { e.stopPropagation(); setActiveItemId(id); }}
                              className="absolute cursor-move"
                              style={{
                                left: `${transform.x}%`,
                                top: `${transform.y}%`,
                                transform: `translate(-50%, -50%) scale(${transform.scale})`,
                                width: '40%',
                                touchAction: 'none',
                                zIndex: zIndex
                              }}
                            >
                               <img 
                                  src={getImageSrc(item.processedImage || item.originalImage)} 
                                  className={`w-full h-full object-contain drop-shadow-xl transition-all ${isActive ? 'filter brightness-110 drop-shadow-[0_0_5px_rgba(250,204,21,0.9)]' : ''}`}
                                  draggable={false}
                                />
                                {isActive && (
                                  <div className="absolute inset-0 border-2 border-dashed border-yellow-400 shadow-[0_0_15px_rgba(0,0,0,0.3)] pointer-events-none bg-yellow-400/10 rounded-sm"></div>
                                )}
                                
                                {isActive && (
                                  <div 
                                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-0 bg-black text-white shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] z-[120]"
                                    onMouseDown={e => e.stopPropagation()}
                                  >
                                     <input 
                                        type="range" 
                                        min="0.5" max="2" step="0.1"
                                        value={transform.scale}
                                        onChange={(e) => updateItemScale(id, parseFloat(e.target.value))}
                                        className="w-24 h-2 bg-stone-700 appearance-none cursor-pointer mx-2"
                                     />
                                     <button 
                                        onClick={() => removeItem(id)}
                                        className="bg-red-600 hover:bg-red-500 p-2 h-full"
                                        title="Remove Item"
                                     >
                                        <Icons.Trash className="w-4 h-4" />
                                     </button>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                    </>
                ) : (
                    // Empty State
                    <div className="w-full h-full flex flex-col items-center justify-center text-black p-6 text-center border-2 border-dashed border-stone-300 min-h-[400px]">
                        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-4">
                            <Icons.Upload className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-bold uppercase">Upload Photo</p>
                        <div className="mt-4">
                             <UploadButton label="SELECT FILE" onUpload={onUploadUser} variant="primary" />
                        </div>
                    </div>
                )}
             </div>
             
             {/* Actions */}
             {currentBaseImage && !generatedResult && (
                 <button
                    onClick={() => onTryOn(allItems.filter(i => selectedItems.includes(i.id)), currentBaseImage)}
                    disabled={selectedItems.length === 0 || isGenerating}
                    className={`
                         w-full py-4 font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black
                         ${selectedItems.length === 0 || isGenerating
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                            : 'bg-yellow-400 text-black hover:bg-yellow-300'}
                    `}
                 >
                    {isGenerating ? 'PROCESSING...' : 'VISUALIZE LOOK'}
                 </button>
             )}
        </div>

        {/* 2. The Rack (Horizontal Scroll / Grid) */}
        <div className="space-y-4">
            <div className="flex flex-col gap-4 border-b-2 border-black pb-2">
                 <div className="flex justify-between items-end">
                    <h3 className="text-sm font-black uppercase tracking-widest">2. Wardrobe</h3>
                    <UploadButton label="ADD CUSTOM" icon="Upload" variant="outline" onUpload={handleCustomUpload} />
                 </div>
                 {/* Category Filters */}
                 <div className="flex flex-wrap gap-2">
                    {['ALL', 'TOPS', 'BOTTOMS', 'SHOES', 'ACCESSORIES'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`
                                text-[10px] font-black uppercase px-2 py-1 border border-black transition-all
                                ${categoryFilter === cat ? 'bg-black text-white' : 'bg-white text-black hover:bg-stone-100'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                 </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {isLoadingRack ? (
                    // Skeleton Loader for Rack
                    <>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[3/4] bg-stone-200 animate-pulse border-2 border-stone-300"></div>
                        ))}
                    </>
                ) : (
                    <>
                        {displayedItems.length === 0 && (
                            <div className="col-span-2 py-8 text-center text-stone-400 font-bold uppercase text-xs">
                                No items found
                            </div>
                        )}
                        {displayedItems.map(item => {
                            const isSelected = selectedItems.includes(item.id);
                            const isAnalyzing = item.description === 'Analyzing...';
                            const isCleaning = cleaningItems.has(item.id);

                            return (
                                <div 
                                    key={item.id}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, item.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => {
                                        if (!isSelected) {
                                          setSelectedItems(prev => [...prev, item.id]);
                                          setItemTransforms(prev => ({ ...prev, [item.id]: { x: 50, y: 50, scale: 1 }}));
                                        }
                                        setActiveItemId(item.id);
                                    }}
                                    className={`
                                        relative aspect-[3/4] bg-white border-2 cursor-grab active:cursor-grabbing overflow-hidden transition-all group
                                        ${isSelected ? 'border-black ring-2 ring-yellow-400' : 'border-stone-200 hover:border-black'}
                                    `}
                                >
                                     {(isAnalyzing || isCleaning) && (
                                         <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                                             <Spinner size="sm" />
                                             <span className="text-[8px] font-bold uppercase mt-2 tracking-widest">
                                                 {isCleaning ? 'Cleaning Scan...' : 'AI Processing...'}
                                             </span>
                                         </div>
                                     )}
                                     <img 
                                        src={getImageSrc(item.processedImage || item.originalImage)} 
                                        alt={item.description} 
                                        className="w-full h-full object-contain p-2"
                                     />
                                     {/* IMPROVED INFO OVERLAY: Brand, Price, Description */}
                                     <div className="absolute bottom-0 inset-x-0 bg-white border-t-2 border-black p-2 flex flex-col gap-1 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase truncate text-black leading-none">{item.brand || 'Unknown'}</span>
                                            <span className="text-[10px] font-bold text-green-600 leading-none bg-green-100 px-1 rounded-sm">{item.price || '--'}</span>
                                        </div>
                                        <p className="text-[9px] font-medium text-stone-500 truncate uppercase leading-none">{item.description}</p>
                                        {item.affiliateCode && (
                                            <div className="text-[8px] text-stone-300 font-mono uppercase mt-1 flex justify-end">AD</div>
                                        )}
                                     </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
