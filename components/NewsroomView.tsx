import React from 'react';
import { Icons } from '../constants';
import { AppView, AgentLog, UserProfile } from '../types';

interface NewsroomViewProps {
    isAdmin: boolean;
    setView: (view: AppView) => void;
    newsroomTopic: string;
    setNewsroomTopic: (value: string) => void;
    newsroomTone: string;
    setNewsroomTone: (value: string) => void;
    newsroomKeywords: string;
    setNewsroomKeywords: (value: string) => void;
    newsroomAudience: string;
    setNewsroomAudience: (value: string) => void;
    newsroomStyleGuide: string;
    setNewsroomStyleGuide: (value: string) => void;
    targetCurrentUser: boolean;
    setTargetCurrentUser: (value: boolean) => void;
    userProfile: UserProfile;
    isNewsroomBusy: boolean;
    handleDispatchMission: () => void;
    agentLogs: AgentLog[];
}

export const NewsroomView = React.memo<NewsroomViewProps>(({
    isAdmin,
    setView,
    newsroomTopic,
    setNewsroomTopic,
    newsroomTone,
    setNewsroomTone,
    newsroomKeywords,
    setNewsroomKeywords,
    newsroomAudience,
    setNewsroomAudience,
    newsroomStyleGuide,
    setNewsroomStyleGuide,
    targetCurrentUser,
    setTargetCurrentUser,
    userProfile,
    isNewsroomBusy,
    handleDispatchMission,
    agentLogs
}) => {
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center border-4 border-black p-12 max-w-md">
                    <div className="flex justify-center mb-4"><Icons.Lock className="w-8 h-8" /></div>
                    <h2 className="text-4xl font-black uppercase">Restricted</h2>
                    <p className="font-bold mt-4 text-stone-600">Admin Clearance Required for AI Editorial Backend.</p>
                    <button onClick={() => setView(AppView.BLOG_FEED)} className="mt-8 underline font-bold uppercase">Return to Index</button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-12 min-h-screen bg-white pt-24">
            <div className="border-b-8 border-black pb-8 mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none">NEWSROOM</h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-stone-500 mt-4">AI Editorial Backend</p>
                </div>
                <div className="text-right">
                    <div className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-1">
                        UPLINK: {isNewsroomBusy ? 'ACTIVE' : 'STANDBY'}
                    </div>
                    <div>SWARM STATUS: {isNewsroomBusy ? 'DEPLOYED' : 'AWAITING BRIEF'}</div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* MISSION BRIEFING CONSOLE */}
                <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] mb-12">
                    <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                        <h3 className="font-black uppercase tracking-widest text-lg">Mission Briefing</h3>
                        <span className="font-mono text-xs">ID: NEWSROOM-001</span>
                    </div>

                    <label className="block font-black uppercase tracking-widest text-xs text-stone-500 mb-2">Core Directive (Theme)</label>
                    <textarea
                        key="newsroom-topic"
                        value={newsroomTopic}
                        onChange={(e) => setNewsroomTopic(e.target.value)}
                        placeholder="ENTER THEME OR TREND..."
                        className="w-full bg-stone-100 border-none text-black p-4 font-bold uppercase text-2xl focus:outline-none focus:bg-stone-200 h-32 resize-none mb-8 placeholder:text-stone-300"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-t-4 border-stone-100 pt-8">
                        <div>
                            <label className="block font-black uppercase tracking-widest text-xs text-stone-500 mb-2">Editorial Voice (Agent Tone)</label>
                            <div className="relative">
                                <select
                                    key="newsroom-tone"
                                    value={newsroomTone}
                                    onChange={(e) => setNewsroomTone(e.target.value)}
                                    className="w-full bg-white border-4 border-stone-200 p-3 font-bold uppercase focus:border-black outline-none appearance-none cursor-pointer"
                                >
                                    <option value="Brutalist / Edgy">Brutalist / Edgy</option>
                                    <option value="Witty / Sarcastic">Witty / Sarcastic</option>
                                    <option value="Authoritative / Vogue">Authoritative / Vogue</option>
                                    <option value="Casual / Gen-Z">Casual / Gen-Z</option>
                                    <option value="Academic / Critical">Academic / Critical</option>
                                    <option value="Street Luxe / UK Urban">Street Luxe / UK Urban</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Icons.ChevronRight className="rotate-90 w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block font-black uppercase tracking-widest text-xs text-stone-500 mb-2">Keywords / Vectors</label>
                            <input
                                type="text"
                                value={newsroomKeywords}
                                onChange={(e) => setNewsroomKeywords(e.target.value)}
                                placeholder="E.G. SUSTAINABILITY, DENIM..."
                                className="w-full bg-white border-b-4 border-stone-200 p-3 font-bold uppercase focus:border-black outline-none placeholder:text-stone-300"
                            />
                        </div>
                        <div>
                            <label className="block font-black uppercase tracking-widest text-xs text-stone-500 mb-2">Target Audience</label>
                            <input
                                type="text"
                                value={newsroomAudience}
                                onChange={(e) => setNewsroomAudience(e.target.value)}
                                placeholder="E.G. GEN Z, LUXURY SHOPPERS..."
                                className="w-full bg-white border-b-4 border-stone-200 p-3 font-bold uppercase focus:border-black outline-none placeholder:text-stone-300"
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block font-black uppercase tracking-widest text-xs text-stone-500 mb-2">Style Guide / Voice Training (Optional)</label>
                        <textarea
                            key="newsroom-style-guide"
                            value={newsroomStyleGuide}
                            onChange={(e) => setNewsroomStyleGuide(e.target.value)}
                            placeholder="Paste text examples or describe the desired writing style..."
                            className="w-full bg-stone-50 border-b-4 border-stone-200 p-3 font-medium text-sm focus:border-black outline-none placeholder:text-stone-300 h-24 resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div
                            className={`cursor-pointer flex items-center gap-3 border-4 border-black px-6 py-3 select-none ${targetCurrentUser ? 'bg-black text-white' : 'bg-white text-black'}`}
                            onClick={() => setTargetCurrentUser(!targetCurrentUser)}
                        >
                            <div className={`w-4 h-4 border-2 ${targetCurrentUser ? 'border-white bg-white' : 'border-black'}`}></div>
                            <span className="font-black text-sm uppercase">Target: {userProfile.name || 'Guest'}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDispatchMission}
                        disabled={isNewsroomBusy || !newsroomTopic.trim()}
                        className="w-full bg-black text-white border-4 border-black py-6 font-black text-2xl uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[8px_8px_0px_0px_#000]"
                    >
                        {isNewsroomBusy ? 'SWARM DEPLOYED...' : 'INITIATE SWARM SEQUENCE'}
                    </button>
                </div>

                {/* AGENT LOGS */}
                {agentLogs.length > 0 && (
                    <div className="bg-black text-green-400 p-6 font-mono text-xs border-4 border-black shadow-[12px_12px_0px_0px_#000] max-h-96 overflow-y-auto" id="log-container">
                        {agentLogs.map((log, i) => (
                            <div key={i} className="mb-1">
                                <span className="text-green-600">[{log.timestamp}]</span> <span className="text-yellow-400">[{log.agent}]</span> {log.message}
                            </div>
                        ))}
                        {isNewsroomBusy && <div className="animate-pulse">_</div>}
                    </div>
                )}
            </div>
        </div>
    );
});

NewsroomView.displayName = 'NewsroomView';
