
import React, { useState, useRef } from 'react';
import { Upload, ArrowLeft, Bus, Train, CreditCard, TrendingUp, X, Download, Share2, Check, Image as ImageIcon } from 'lucide-react';
import { parsePDF } from './services/pdfParser';
import { calculateStats, DetailedStats } from './services/statsEngine';
import { Language, TRANSLATIONS } from './types';
import { StoryCard } from './components/StoryCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, CartesianGrid } from 'recharts';
import * as htmlToImage from 'html-to-image';

// ==========================================
// 1. COMPONENTS FOR THE WEB VIEW (RESPONSIVE)
// ==========================================

const WebStatsTrips = ({ stats, t }: { stats: DetailedStats, t: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
        {/* Big Counter */}
        <div className="md:col-span-2 xl:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <h2 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">{t.trips_total}</h2>
                <div className="text-7xl font-black text-barik-red">{stats.tripCount}</div>
            </div>
            <div className="hidden md:block h-24 w-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chronologicalTrips}>
                        <defs>
                            <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#da291c" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#da291c" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="trips" stroke="#da291c" fillOpacity={1} fill="url(#colorTrips)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Chronological Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[300px]">
            <h3 className="font-bold text-lg mb-6 text-gray-800">{t.evolution_title}</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chronologicalTrips}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} dy={10} />
                        <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                            cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="trips" fill="#da291c" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Time of Day */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">{t.time_of_day_title}</h3>
            <div className="h-48">
                 <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                         <Pie 
                            data={stats.timeOfDay} 
                            dataKey="value" 
                            innerRadius={50} 
                            outerRadius={70} 
                            paddingAngle={5}
                        >
                            {stats.timeOfDay.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                         <Tooltip />
                     </PieChart>
                 </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs mt-2">
                {stats.timeOfDay.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-gray-600 font-medium">{item.name}</span>
                        <span className="font-bold">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Top 5 Days Table */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">{t.ranking_days}</h3>
            <table className="w-full">
                <tbody>
                    {stats.sortedDays.map(([day, count], i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                            <td className="py-3 text-gray-400 font-mono w-8 text-sm">0{i+1}</td>
                            <td className="py-3 font-medium text-gray-700">{day}</td>
                            <td className="py-3 text-right font-bold text-barik-red">{count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

         {/* Top 5 Months Table */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">{t.ranking_months}</h3>
            <table className="w-full">
                <tbody>
                    {stats.sortedMonths.map((m, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                            <td className="py-3 text-gray-400 font-mono w-8 text-sm">0{i+1}</td>
                            <td className="py-3 font-medium text-gray-700">{m.name}</td>
                            <td className="py-3 text-right font-bold text-barik-red">{m.count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Weekday Usage */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">{t.weekday_title}</h3>
             <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.weekdayUsage}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#2C3E50" radius={[4, 4, 4, 4]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

const WebStatsStops = ({ stats, t }: { stats: DetailedStats, t: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6 text-gray-800">{t.ranking_stops}</h3>
            <div className="overflow-y-auto max-h-[600px] pr-2">
                <table className="w-full">
                    <thead className="text-left text-xs uppercase text-gray-400 tracking-wider">
                        <tr>
                            <th className="pb-4">#</th>
                            <th className="pb-4">Parada</th>
                            <th className="pb-4 text-right">Uso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.topStopsAll.map(([stop, count], i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                <td className="py-4 text-gray-400 font-mono w-10">{i+1}</td>
                                <td className="py-4 font-bold text-gray-800">{stop}</td>
                                <td className="py-4 text-right">
                                    <span className="bg-red-100 text-barik-red px-3 py-1 rounded-full text-sm font-bold">{count}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-lg mb-6 text-gray-800">{t.monthly_stops}</h3>
             <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2">
                {stats.topStopsMonthly.map((m, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-xs uppercase font-bold text-gray-400 mb-2 tracking-wider">{m.month}</div>
                        {m.stops.map(([stop, count], idx) => (
                            <div key={idx} className="flex justify-between items-center py-1.5 border-b border-gray-200 last:border-0">
                                <span className="text-gray-700 font-medium text-sm truncate pr-4">{stop}</span>
                                <span className="text-xs font-bold text-gray-500">{count}</span>
                            </div>
                        ))}
                    </div>
                ))}
             </div>
        </div>
    </div>
);

const WebStatsOperators = ({ stats, t }: { stats: DetailedStats, t: any }) => {
    const data = stats.topOperators.map(([name, value]) => ({name, value}));
    const COLORS = ['#da291c', '#2C3E50', '#FFB347', '#95a5a6', '#ecf0f1'];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 items-center">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-96 flex flex-col justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-6 text-gray-800">{t.ranking_operators}</h3>
                <table className="w-full">
                    <tbody>
                         {stats.topOperators.map(([op, count], i) => (
                             <tr key={i} className="border-b border-gray-50 last:border-0">
                                 <td className="py-4 flex items-center gap-3">
                                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                     <span className="font-bold text-gray-700">{op}</span>
                                 </td>
                                 <td className="py-4 text-right font-mono text-gray-500">{count}</td>
                             </tr>
                         ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const WebStatsStreak = ({ stats, t }: { stats: DetailedStats, t: any }) => (
    <div className="p-6">
        <div className="bg-gradient-to-r from-barik-red to-red-800 rounded-3xl p-12 text-white text-center shadow-lg relative overflow-hidden mb-8">
            <div className="relative z-10">
                <div className="text-2xl uppercase tracking-widest font-medium opacity-80 mb-2">{t.streak_title}</div>
                <div className="text-9xl font-black tracking-tighter drop-shadow-xl">{stats.maxStreak} <span className="text-4xl font-light opacity-60">{t.streak_days}</span></div>
            </div>
            <TrendingUp className="absolute bottom-0 right-0 text-white opacity-10 -mb-10 -mr-10 transform -rotate-12" size={300} />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6 text-gray-800">{t.longest_streaks}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.streakList.map((streak, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-barik-red text-white flex items-center justify-center font-bold mb-4 shadow-md">#{i+1}</div>
                        <div className="text-3xl font-black text-gray-800 mb-1">{streak.days} <span className="text-sm font-normal text-gray-500">días</span></div>
                        <div className="text-sm text-gray-400 font-medium mb-3">{streak.trips} viajes</div>
                        <div className="text-xs bg-white px-3 py-1 rounded border border-gray-200 text-gray-500 font-mono">
                            {new Date(streak.start).toLocaleDateString()} - {new Date(streak.end).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const WebStatsMoney = ({ stats, t, formatCurrency }: { stats: DetailedStats, t: any, formatCurrency: (val: number) => string }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
         <div className="md:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">{t.total_spent}</div>
             <div className="text-8xl font-black text-gray-900 tracking-tight">{formatCurrency(stats.totalSpent)}</div>
         </div>

         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-lg mb-6 text-gray-800">{t.spending_breakdown}</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlySpendingList} margin={{bottom: 20}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                        <XAxis 
                            dataKey="name" 
                            tick={{fontSize: 10, fill: '#666'}} 
                            interval={0} 
                            angle={-45} 
                            textAnchor="end"
                            height={50}
                        />
                        <Tooltip formatter={(val: number) => formatCurrency(val)} />
                        <Bar dataKey="amount" fill="#da291c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
         </div>

         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-lg mb-6 text-gray-800">{t.ranking_operators}</h3>
             <table className="w-full">
                <tbody>
                {stats.topSpendingOperators.map(([op, amt], i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-700">{op}</td>
                        <td className="py-3 text-right font-mono font-bold text-gray-900">{formatCurrency(amt)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
         </div>
    </div>
);

// ==========================================
// 2. EXPORT OPTIONS & MODAL
// ==========================================

export interface ExportOptions {
    showTopDays?: boolean;
    showTopMonths?: boolean;
    showTimeOfDay?: boolean;
    showWeekdays?: boolean;
    stopsMode?: 'global' | 'monthly';
}

const ExportOptionsModal = ({ 
    t, 
    type, 
    onClose, 
    onConfirm 
}: { 
    t: any, 
    type: string, 
    onClose: () => void, 
    onConfirm: (options: ExportOptions) => void 
}) => {
    const [options, setOptions] = useState<ExportOptions>({
        showTopDays: true,
        showTopMonths: true,
        showTimeOfDay: true,
        showWeekdays: true,
        stopsMode: 'global'
    });

    const toggle = (key: keyof ExportOptions) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{t.export_options_title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                </div>

                <div className="space-y-4 mb-8">
                    {type === 'trips' && (
                        <>
                            <div onClick={() => toggle('showTopDays')} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-barik-red transition-colors">
                                <span className="font-medium text-gray-700">{t.include_top_days}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.showTopDays ? 'bg-barik-red border-barik-red' : 'border-gray-300'}`}>
                                    {options.showTopDays && <Check size={14} className="text-white" />}
                                </div>
                            </div>
                            <div onClick={() => toggle('showTopMonths')} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-barik-red transition-colors">
                                <span className="font-medium text-gray-700">{t.include_top_months}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.showTopMonths ? 'bg-barik-red border-barik-red' : 'border-gray-300'}`}>
                                    {options.showTopMonths && <Check size={14} className="text-white" />}
                                </div>
                            </div>
                            <div onClick={() => toggle('showTimeOfDay')} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-barik-red transition-colors">
                                <span className="font-medium text-gray-700">{t.include_time_of_day}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.showTimeOfDay ? 'bg-barik-red border-barik-red' : 'border-gray-300'}`}>
                                    {options.showTimeOfDay && <Check size={14} className="text-white" />}
                                </div>
                            </div>
                             <div onClick={() => toggle('showWeekdays')} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-barik-red transition-colors">
                                <span className="font-medium text-gray-700">{t.include_weekdays}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${options.showWeekdays ? 'bg-barik-red border-barik-red' : 'border-gray-300'}`}>
                                    {options.showWeekdays && <Check size={14} className="text-white" />}
                                </div>
                            </div>
                        </>
                    )}

                    {type === 'stops' && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t.stops_export_mode}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div 
                                    onClick={() => setOptions(prev => ({ ...prev, stopsMode: 'global' }))}
                                    className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${options.stopsMode === 'global' ? 'border-barik-red bg-red-50 text-barik-red font-bold' : 'border-gray-200 text-gray-600'}`}
                                >
                                    {t.stops_mode_global}
                                </div>
                                <div 
                                    onClick={() => setOptions(prev => ({ ...prev, stopsMode: 'monthly' }))}
                                    className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${options.stopsMode === 'monthly' ? 'border-barik-red bg-red-50 text-barik-red font-bold' : 'border-gray-200 text-gray-600'}`}
                                >
                                    {t.stops_mode_monthly}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => onConfirm(options)}
                    className="w-full bg-barik-red text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition"
                >
                    {t.generate_image}
                </button>
            </div>
        </div>
    );
};

// ==========================================
// 3. EXPORT VIEW (HIDDEN 9:16)
// ==========================================

const ExportView = React.forwardRef<HTMLDivElement, { type: string, stats: DetailedStats, t: any, options: ExportOptions }>(({ type, stats, t, options }, ref) => {
    const formatCurrency = (val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
    const renderExportContent = () => {
        // Updated classes for larger text
        const tableHeaderClass = "text-left py-3 px-4 border-b border-white/30 font-bold uppercase text-2xl tracking-wider opacity-80";
        const tableCellClass = "py-4 px-4 border-b border-white/10 text-3xl font-medium";
        const rankCellClass = "py-4 px-4 border-b border-white/10 text-3xl font-black text-barik-light w-20";

        switch(type) {
            case 'trips': return (
                <div className="w-full px-8 flex flex-col gap-8 h-full justify-start pt-8">
                     <div className="text-center shrink-0">
                        <div className="text-[12rem] font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] leading-none">{stats.tripCount}</div>
                        <div className="text-5xl uppercase tracking-[0.2em] mt-2 font-light">{t.trips_total}</div>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-8 w-full grow overflow-hidden content-start mt-8">
                        {options.showTopDays && (
                             <div className="bg-white/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden shadow-lg border border-white/10">
                                <div className="bg-black/20 p-4 font-bold text-3xl uppercase text-center border-b border-white/10">{t.ranking_days}</div>
                                <table className="w-full collapse">
                                    <thead><tr><th className={tableHeaderClass}>#</th><th className={tableHeaderClass}>Fecha</th><th className={`${tableHeaderClass} text-right`}>Viajes</th></tr></thead>
                                    <tbody>{stats.sortedDays.map(([day, count], i) => (
                                        <tr key={i} className="bg-white/5"><td className={rankCellClass}>{i+1}</td><td className={tableCellClass}>{day}</td><td className={`${tableCellClass} text-right font-bold`}>{count}</td></tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        )}

                        {options.showTopMonths && (
                             <div className="bg-white/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden shadow-lg border border-white/10">
                                <div className="bg-black/20 p-4 font-bold text-3xl uppercase text-center border-b border-white/10">{t.ranking_months}</div>
                                <table className="w-full"><tbody>{stats.sortedMonths.slice(0,5).map((m, i) => (
                                    <tr key={i}><td className={rankCellClass}>{i+1}</td><td className={tableCellClass}>{m.name}</td><td className={`${tableCellClass} text-right font-bold`}>{m.count}</td></tr>
                                ))}</tbody></table>
                            </div>
                        )}

                        {options.showTimeOfDay && (
                            <div className="bg-white/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden shadow-lg border border-white/10 p-8 flex justify-around items-center">
                                 {stats.timeOfDay.map((t, i) => (
                                     <div key={i} className="text-center">
                                         <div className="text-6xl font-black mb-2" style={{color: t.color === '#2C3E50' ? '#ccc' : t.color}}>{t.value}</div>
                                         <div className="text-xl uppercase font-bold tracking-wider opacity-80">{t.name.split(' ')[0]}</div>
                                     </div>
                                 ))}
                            </div>
                        )}

                        {options.showWeekdays && (
                            <div className="bg-white/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden shadow-lg border border-white/10 p-8">
                                <div className="text-center font-bold text-2xl uppercase tracking-widest mb-6 opacity-80">{t.weekday_title}</div>
                                <div className="flex justify-between items-end h-40 gap-4">
                                    {stats.weekdayUsage.map((d, i) => {
                                        const max = Math.max(...stats.weekdayUsage.map(x=>x.value));
                                        const h = max > 0 ? (d.value / max) * 100 : 0;
                                        return (
                                            <div key={i} className="flex flex-col items-center flex-1 gap-2">
                                                <div className="w-full bg-white/20 rounded-t-xl relative" style={{height: `${h}%`, minHeight: '8px'}}>
                                                    {d.value > 0 && <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl font-bold">{d.value}</span>}
                                                </div>
                                                <span className="text-xl font-mono opacity-60">{d.name}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                     </div>
                </div>
            );
            case 'stops': 
              if (options.stopsMode === 'global') {
                  return (
                    <div className="space-y-10 w-full h-full flex flex-col px-8">
                        <div className="bg-white/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden shadow-lg border border-white/10 flex-1">
                            <div className="bg-black/20 p-6 font-bold text-4xl uppercase text-center border-b border-white/10">{t.ranking_stops}</div>
                            <table className="w-full">
                                <thead><tr><th className={tableHeaderClass}>#</th><th className={tableHeaderClass}>Parada</th><th className={`${tableHeaderClass} text-right`}>Uso</th></tr></thead>
                                <tbody>{stats.topStopsAll.slice(0, 10).map(([stop, count], i) => (
                                    <tr key={i} className="even:bg-white/5"><td className={rankCellClass}>{i+1}</td><td className={tableCellClass}>{stop}</td><td className={`${tableCellClass} text-right font-bold`}>{count}</td></tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </div>
                );
              } else {
                  return (
                    <div className="space-y-8 w-full h-full flex flex-col px-8 pt-4">
                        <div className="text-center text-4xl font-black uppercase mb-6">{t.monthly_stops}</div>
                        <div className="grid grid-cols-1 gap-6 overflow-hidden">
                             {stats.topStopsMonthly.slice(0, 4).map((m, i) => (
                                 <div key={i} className="bg-white/10 rounded-[2rem] p-6 border border-white/10">
                                     <div className="text-3xl font-bold uppercase tracking-wider mb-4 text-barik-light">{m.month}</div>
                                     {m.stops.map(([stop, count], idx) => (
                                         <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                             <span className="text-2xl font-medium truncate pr-4">{stop}</span>
                                             <span className="text-2xl font-bold">{count}</span>
                                         </div>
                                     ))}
                                 </div>
                             ))}
                             {stats.topStopsMonthly.length > 4 && <div className="text-center italic opacity-60 text-2xl">...</div>}
                        </div>
                    </div>
                  );
              }

            case 'operators': return (
                <div className="space-y-12 w-full h-full flex flex-col px-8">
                    <div className="h-96 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.topOperators.map(([name, value]) => ({name, value}))} cx="50%" cy="50%" labelLine={false} outerRadius={180} fill="#8884d8" dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                                    {stats.topOperators.map((entry, index) => <Cell key={`cell-${index}`} fill={['#ffffff', '#ffcccb', '#ff6b61', '#da291c', '#8a1b12'][index % 5]} stroke="none" />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden shadow-lg border border-white/10 flex-1">
                         <div className="bg-black/20 p-6 font-bold text-4xl uppercase text-center border-b border-white/10">{t.ranking_operators}</div>
                         <table className="w-full">
                            <tbody>{stats.topOperators.map(([op, count], i) => (
                                 <tr key={i} className="border-b border-white/5 last:border-0"><td className="py-5 px-8 text-3xl font-bold">{op}</td><td className="py-5 px-8 text-3xl text-right font-mono">{count}</td></tr>
                             ))}</tbody>
                         </table>
                    </div>
                </div>
            );
            case 'streak': return (
                <div className="space-y-16 w-full flex flex-col items-center justify-center h-full px-8">
                     <div className="text-center relative">
                         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[20rem] text-white opacity-5 select-none pointer-events-none"><TrendingUp size={500} /></div>
                         <div className="text-[15rem] font-black text-white leading-none drop-shadow-2xl relative z-10">{stats.maxStreak}</div>
                         <div className="text-5xl uppercase tracking-[0.3em] font-bold mt-8">{t.streak_days}</div>
                         <div className="mt-8 bg-white/20 inline-block px-10 py-4 rounded-full text-4xl font-mono">{stats.maxStreakTrips} {t.trips_total}</div>
                     </div>
                     <div className="w-full bg-white/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden shadow-lg border border-white/10 mt-16">
                         <div className="bg-black/20 p-8 font-bold text-3xl uppercase text-center border-b border-white/10">{t.longest_streaks}</div>
                         <table className="w-full"><tbody>{stats.streakList.map((streak, i) => (
                                <tr key={i} className="border-b border-white/10 last:border-0"><td className="py-6 px-8 text-4xl font-black text-barik-light text-center w-24">#{i+1}</td><td className="py-6 px-6"><div className="text-2xl opacity-80">{new Date(streak.start).toLocaleDateString()} - {new Date(streak.end).toLocaleDateString()}</div></td><td className="py-6 px-8 text-right"><div className="text-4xl font-bold">{streak.days}</div></td></tr>
                         ))}</tbody></table>
                     </div>
                </div>
            );
            case 'money': return (
                <div className="space-y-12 w-full px-8">
                    <div className="text-center bg-black/20 p-12 rounded-[3rem] backdrop-blur-sm border border-white/10">
                        <div className="text-[10rem] font-black tracking-tight drop-shadow-lg">{formatCurrency(stats.totalSpent)}</div>
                        <div className="text-4xl uppercase opacity-80 mt-6 tracking-widest">{t.total_spent}</div>
                    </div>
                    <div className="bg-white/10 rounded-[2.5rem] backdrop-blur-md overflow-hidden shadow-lg border border-white/10">
                         <div className="bg-black/20 p-6 font-bold text-3xl uppercase text-center border-b border-white/10">{t.ranking_operators}</div>
                         <table className="w-full"><tbody>{stats.topSpendingOperators.map(([op, amt], i) => (
                            <tr key={i} className="border-b border-white/5 last:border-0 even:bg-white/5"><td className="py-5 px-8 text-3xl font-medium">{op}</td><td className="py-5 px-8 text-3xl font-mono text-right font-bold">{formatCurrency(amt)}</td></tr>
                        ))}</tbody></table>
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div 
            ref={ref}
            className="w-[1080px] h-[1920px] bg-[#da291c] bg-gradient-to-br from-barik-red via-[#b31b1b] to-[#5e0f0f] text-white p-16 flex flex-col items-center relative font-sans overflow-hidden fixed top-0 left-0 z-0 pointer-events-none"
        >
            <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2.5px)', backgroundSize: '40px 40px' }}></div>
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            <div className="w-full flex justify-between items-center mb-16 relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-barik-red text-7xl font-black italic shadow-lg">b</div>
                    <div className="font-bold text-7xl tracking-tighter italic drop-shadow-md">barik<span className="font-light text-white/90">wrapped</span></div>
                </div>
                <div className="text-6xl font-light tracking-widest opacity-80 border-l-4 border-white/30 pl-8">2025</div>
            </div>
            <div className="relative z-10 w-full text-center mb-16 shrink-0">
                <h2 className="text-9xl font-black uppercase text-white drop-shadow-xl tracking-wide">{t[`${type}_title` as keyof typeof t] || type}</h2>
                <div className="h-3 w-48 bg-white mx-auto mt-8 rounded-full opacity-80"></div>
            </div>
            <div className="flex-1 w-full flex flex-col justify-center items-center relative z-10 min-h-0">{renderExportContent()}</div>
            <div className="mt-16 text-center opacity-60 text-4xl font-mono tracking-widest relative z-10 shrink-0">#BARIKWRAPPED</div>
        </div>
    );
});

// ==========================================
// 4. TEMPLATE VIEW (HIDDEN 9:16)
// ==========================================
const TemplateView = React.forwardRef<HTMLDivElement, {}>((props, ref) => {
    return (
        <div 
            ref={ref}
            className="w-[1080px] h-[1920px] bg-[#da291c] bg-gradient-to-br from-barik-red via-[#b31b1b] to-[#5e0f0f] text-white p-16 flex flex-col items-center relative font-sans overflow-hidden fixed top-0 left-0 z-0 pointer-events-none"
        >
             <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2.5px)', backgroundSize: '40px 40px' }}></div>
             <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
             
             <div className="w-full flex justify-between items-center mb-16 relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-barik-red text-7xl font-black italic shadow-lg">b</div>
                    <div className="font-bold text-7xl tracking-tighter italic drop-shadow-md">barik<span className="font-light text-white/90">wrapped</span></div>
                </div>
                <div className="text-6xl font-light tracking-widest opacity-80 border-l-4 border-white/30 pl-8">2025</div>
            </div>

            <div className="flex-1"></div>

            <div className="mt-16 text-center opacity-60 text-4xl font-mono tracking-widest relative z-10 shrink-0">#BARIKWRAPPED</div>
        </div>
    )
})

// ==========================================
// 5. MAIN DETAIL VIEW CONTAINER
// ==========================================

const DetailView = ({ type, stats, t, onClose, lang }: { type: string, stats: DetailedStats, t: any, onClose: () => void, lang: string }) => {
    const exportRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        showTopDays: true,
        showTopMonths: true,
        showTimeOfDay: true,
        showWeekdays: true,
        stopsMode: 'global'
    });

    const handleExportClick = () => {
        if (type === 'trips' || type === 'stops') {
            setShowExportOptions(true);
        } else {
            // For other types, direct download with defaults
            triggerDownload();
        }
    };

    const handleOptionsConfirm = (options: ExportOptions) => {
        setExportOptions(options);
        setShowExportOptions(false);
        // Small timeout to allow state update and re-render of hidden view
        setTimeout(() => triggerDownload(), 100);
    };

    const triggerDownload = async () => {
        if (exportRef.current) {
            setExporting(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 200)); // Wait for render
                
                const dataUrl = await htmlToImage.toPng(exportRef.current, { 
                    quality: 0.95, 
                    width: 1080, 
                    height: 1920, 
                    pixelRatio: 1,
                    backgroundColor: '#da291c'
                });
                const link = document.createElement('a');
                link.download = `barik-${type}-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error('Error', err);
            } finally {
                setExporting(false);
            }
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'eu-ES', { style: 'currency', currency: 'EUR' }).format(val);

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto animate-fade-in flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-40 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft size={24} className="text-gray-700"/></button>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">{t[`${type}_title` as keyof typeof t] || type}</h2>
                </div>
                <button 
                    onClick={handleExportClick}
                    disabled={exporting}
                    className="flex items-center gap-2 bg-barik-red text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-red-700 transition transform active:scale-95 disabled:opacity-70"
                >
                    {exporting ? '...' : <><Share2 size={18}/> {t.export_image}</>}
                </button>
            </div>

            {/* Main Content (Web View) */}
            <div className="flex-1 w-full max-w-7xl mx-auto py-8 z-50 bg-gray-50 relative">
                {type === 'trips' && <WebStatsTrips stats={stats} t={t} />}
                {type === 'stops' && <WebStatsStops stats={stats} t={t} />}
                {type === 'operators' && <WebStatsOperators stats={stats} t={t} />}
                {type === 'streak' && <WebStatsStreak stats={stats} t={t} />}
                {type === 'money' && <WebStatsMoney stats={stats} t={t} formatCurrency={formatCurrency} />}
            </div>

            {/* Export Options Modal */}
            {showExportOptions && (
                <ExportOptionsModal 
                    t={t} 
                    type={type} 
                    onClose={() => setShowExportOptions(false)} 
                    onConfirm={handleOptionsConfirm} 
                />
            )}

            {/* Hidden Export View */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                 <ExportView ref={exportRef} type={type} stats={stats} t={t} options={exportOptions} />
            </div>
        </div>
    );
};

export default function App() {
  const [lang, setLang] = useState<Language>('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setStats(null);

    try {
      const transactions = await parsePDF(file);
      if (transactions.length === 0) {
        throw new Error("No transactions found");
      }
      const calculatedStats = calculateStats(transactions, t);
      setStats(calculatedStats);
    } catch (err) {
      console.error(err);
      setError(t.error_parsing);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadTemplate = async () => {
    if (templateRef.current) {
        try {
            const dataUrl = await htmlToImage.toPng(templateRef.current, { 
                quality: 0.95, 
                width: 1080, 
                height: 1920, 
                pixelRatio: 1,
                backgroundColor: '#da291c'
            });
            const link = document.createElement('a');
            link.download = `barik-template.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
        }
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'eu-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const renderDashboard = () => {
    if (!stats) return null;

    return (
      <div className="min-h-screen bg-neutral-900 py-12 px-4 font-sans selection:bg-barik-red selection:text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button 
                onClick={() => setStats(null)}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium px-4 py-2 hover:bg-white/10 rounded-full"
            >
                <ArrowLeft size={20} /> {t.back}
            </button>
            <div className="text-white/50 font-mono text-sm hidden md:block">
                #BARIKWRAPPED
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            
            <div onClick={() => setSelectedStat('trips')} className="cursor-pointer transform hover:scale-105 transition-all duration-300 w-full flex justify-center">
                <StoryCard title={t.trips_card_title} footerText={t.click_for_details}>
                    <div className="text-center">
                        <div className="text-8xl font-black text-white drop-shadow-xl">{stats.tripCount}</div>
                        <div className="text-xl uppercase tracking-widest mt-2 font-light">{t.trips_total}</div>
                    </div>
                    <div className="mt-8 bg-white/10 p-4 rounded-xl backdrop-blur-sm text-sm border border-white/5">
                        <div className="flex justify-between items-center mb-2 border-b border-white/20 pb-2">
                            <span className="font-bold opacity-80">{t.top_day}</span>
                            <span className="font-mono">{stats.sortedDays[0]?.[0] || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold opacity-80">{t.top_month}</span>
                            <span className="font-mono">{stats.sortedMonths[0]?.name || '-'}</span>
                        </div>
                    </div>
                </StoryCard>
            </div>

            <div onClick={() => setSelectedStat('stops')} className="cursor-pointer transform hover:scale-105 transition-all duration-300 w-full flex justify-center">
                <StoryCard title={t.stops_title} footerText={t.click_for_details}>
                    <div className="space-y-3 w-full">
                    {stats.topStopsAll.slice(0, 5).map(([stop, count]: [string, number], idx: number) => (
                        <div key={stop} className="flex items-center gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                            <div className="font-black text-xl w-6 text-center text-barik-light">#{idx + 1}</div>
                            <div className="flex-1 text-sm font-semibold truncate leading-tight">{stop}</div>
                            <div className="font-mono text-xs opacity-75 bg-white/10 px-1.5 py-0.5 rounded">{count}</div>
                        </div>
                    ))}
                    </div>
                </StoryCard>
            </div>

            <div onClick={() => setSelectedStat('operators')} className="cursor-pointer transform hover:scale-105 transition-all duration-300 w-full flex justify-center">
                <StoryCard title={t.operators_title} footerText={t.click_for_details}>
                    <div className="h-56 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topOperators.slice(0, 5).map(([name, count]) => ({ name, count }))} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={100} tick={{fill: 'white', fontSize: 11, fontWeight: 500}} interval={0} />
                                <Bar dataKey="count" fill="#ffffff" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </StoryCard>
            </div>

            <div onClick={() => setSelectedStat('streak')} className="cursor-pointer transform hover:scale-105 transition-all duration-300 w-full flex justify-center">
                <StoryCard title={t.streak_title} footerText={t.click_for_details}>
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-barik-light blur-2xl opacity-20 animate-pulse"></div>
                            <TrendingUp size={80} className="text-white relative z-10" />
                        </div>
                        <div className="text-center">
                            <div className="text-7xl font-black relative z-10">{stats.maxStreak}</div>
                            <div className="text-lg font-bold uppercase tracking-widest opacity-80">{t.streak_days}</div>
                        </div>
                        
                        <div className="w-full bg-gradient-to-r from-transparent via-white/30 to-transparent h-px my-2"></div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold font-mono">{stats.maxStreakTrips}</div>
                            <div className="text-xs opacity-70 uppercase tracking-wide">{t.streak_trips}</div>
                        </div>
                    </div>
                </StoryCard>
            </div>

            <div onClick={() => setSelectedStat('money')} className="cursor-pointer transform hover:scale-105 transition-all duration-300 w-full flex justify-center">
                <StoryCard title={t.money_title} footerText={t.click_for_details}>
                    <div className="flex flex-col items-center gap-2 mb-8 bg-black/20 p-4 rounded-2xl border border-white/5 w-full">
                        <div className="text-4xl font-bold text-white tracking-tight">{formatCurrency(stats.totalSpent)}</div>
                        <div className="text-xs uppercase opacity-75 font-medium tracking-wider">{t.total_spent}</div>
                    </div>

                    <div className="space-y-2 w-full">
                        <div className="text-xs uppercase font-bold opacity-60 mb-2 pl-1">{t.most_expensive_day}</div>
                        {stats.topSpendingDays.slice(0, 3).map(([day, amount]: any, idx: number) => (
                            <div key={day} className="flex justify-between items-center bg-white/10 p-2.5 rounded-lg border border-white/5">
                                <span className="text-sm font-medium">{day}</span>
                                <span className="font-mono font-bold text-barik-light">{formatCurrency(amount)}</span>
                            </div>
                        ))}
                    </div>
                </StoryCard>
            </div>
          </div>

          <div className="mt-20 text-center">
            <button 
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/40 px-6 py-3 rounded-full text-sm font-medium"
            >
                <ImageIcon size={18} /> {t.download_template}
            </button>
          </div>
        </div>

        {selectedStat && (
            <DetailView 
                type={selectedStat} 
                stats={stats} 
                t={t} 
                onClose={() => setSelectedStat(null)}
                lang={lang} 
            />
        )}
        
        {/* Hidden Template View */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
             <TemplateView ref={templateRef} />
        </div>
      </div>
    );
  };

  if (stats) {
    return renderDashboard();
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans selection:bg-barik-red selection:text-white">
      {/* Navbar */}
      <nav className="bg-barik-red text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black italic text-2xl tracking-tighter cursor-pointer hover:opacity-90 transition-opacity">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-barik-red shadow-sm">b</div>
             barik<span className="font-light">wrapped</span>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => setLang('es')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-transparent ${lang === 'es' ? 'bg-white text-barik-red shadow-md' : 'bg-red-900/30 hover:bg-red-900/50 hover:border-red-400/30'}`}
            >
                ES
            </button>
            <button 
                onClick={() => setLang('eu')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-transparent ${lang === 'eu' ? 'bg-white text-barik-red shadow-md' : 'bg-red-900/30 hover:bg-red-900/50 hover:border-red-400/30'}`}
            >
                EU
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full transform transition-all hover:scale-[1.01] hover:shadow-3xl border-t-8 border-barik-red relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-20 bg-red-50 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-barik-red group-hover:scale-110 transition-transform duration-300">
             <Upload size={48} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{t.title}</h1>
          <p className="text-gray-500 mb-10 leading-relaxed font-medium">{t.upload_text}</p>
          
          <label className="block w-full cursor-pointer group/btn relative">
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={loading}
            />
            <div className={`
              relative overflow-hidden rounded-2xl bg-gradient-to-r from-barik-red to-red-600 p-5 text-white font-bold text-lg shadow-xl 
              transition-all group-hover/btn:shadow-2xl group-hover/btn:translate-y-[-2px]
              ${loading ? 'opacity-90 cursor-wait' : ''}
            `}>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-3 relative z-10">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t.processing}
                </div>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                    <Upload size={20}/> Seleccionar PDF / Aukeratu PDF
                </span>
              )}
            </div>
          </label>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 animate-bounce-in font-medium flex items-center justify-center gap-2">
              <X size={16}/> {error}
            </div>
          )}

          <p className="mt-8 text-xs text-gray-400 border-t border-gray-100 pt-6 font-mono">
            {t.upload_subtext}
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl opacity-40 hover:opacity-100 transition-opacity duration-500">
           {[Bus, Train, CreditCard, TrendingUp].map((Icon, i) => (
               <div key={i} className="flex flex-col items-center justify-center p-4 group">
                   <div className="bg-white p-4 rounded-2xl shadow-md mb-3 group-hover:scale-110 transition-transform text-barik-red">
                        <Icon size={32} />
                   </div>
               </div>
           ))}
        </div>
      </div>
      
      <footer className="p-8 text-center text-gray-400 text-sm font-medium border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        Barik Wrapped &copy; 2025 - Unofficial Tool
      </footer>
    </div>
  );
}