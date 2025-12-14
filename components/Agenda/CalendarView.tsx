import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment } from '../../types';
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    addMonths,
    isSameDay,
    isToday,
    getDay,
    eachDayOfInterval,
    parseISO
} from '../../utils/dateUtils';

interface CalendarViewProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    filteredAppointments: Appointment[];
}

const CalendarView: React.FC<CalendarViewProps> = ({
    currentDate,
    setCurrentDate,
    selectedDate,
    setSelectedDate,
    filteredAppointments
}) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = monthStart;
    const endDate = monthEnd;

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const startDay = getDay(startDate);
    const padding = Array(startDay).fill(null);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft /></button>
                <h3 className="font-bold text-gray-800 dark:text-white capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: 'pt-BR' })}
                </h3>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronRight /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                    <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {padding.map((_, i) => <div key={`pad-${i}`} className="h-10"></div>)}
                {days.map(day => {
                    const dayApps = filteredAppointments.filter(a => isSameDay(parseISO(a.date), day));
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => setSelectedDate(day)}
                            className={`
                h-14 rounded-lg flex flex-col items-center justify-start py-1 relative border transition-all
                ${isSelected ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 dark:bg-brand-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}
                ${isTodayDate && !isSelected ? 'text-brand-600 font-bold bg-gray-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300'}
              `}
                        >
                            <span className={`text-sm ${isTodayDate ? 'font-bold' : ''}`}>{format(day, 'd')}</span>
                            <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                                {dayApps.slice(0, 4).map((app, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${app.status === 'completed' ? 'bg-green-500' :
                                                app.status === 'in_progress' ? 'bg-amber-500' :
                                                    app.status === 'canceled' ? 'bg-red-500' : 'bg-blue-500'
                                            }`}
                                    />
                                ))}
                                {dayApps.length > 4 && <span className="text-[8px] text-gray-400 leading-none">+</span>}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
