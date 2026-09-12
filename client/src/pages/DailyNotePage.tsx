import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDailyNote } from '../hooks/useDailyNote';
import { useTags } from '../hooks/useTags';
import { useAutoSave } from '../hooks/useAutoSave';
import { MarkdownEditor, EditorValue } from '../components/editor/MarkdownEditor';
import { VersionHistoryPanel } from '../components/versions/VersionHistoryPanel';
import { BacklinksPanel } from '../components/notes/BacklinksPanel';
import { PageSkeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import {
  format,
  addDays,
  subDays,
  parseISO,
  isToday,
  isValid,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  History,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';

export function DailyNotePage() {
  const { date: routeDate } = useParams<{ date?: string }>();
  const navigate = useNavigate();

  // Validate or fallback to today's ISO date (YYYY-MM-DD)
  const currentDateStr = useMemo(() => {
    if (routeDate && /^\d{4}-\d{2}-\d{2}$/.test(routeDate)) {
      const parsed = parseISO(routeDate);
      if (isValid(parsed)) return routeDate;
    }
    return new Date().toISOString().split('T')[0];
  }, [routeDate]);

  const currentDateObj = useMemo(() => parseISO(currentDateStr), [currentDateStr]);

  const {
    dailyNote,
    dailyDates,
    isLoading,
    updateDailyNote,
  } = useDailyNote(currentDateStr);

  const { tags } = useTags();
  const [editorValue, setEditorValue] = useState<EditorValue>({
    title: '',
    content: '',
    tags: ['daily'],
    color: 'default',
    isFavorite: false,
    isPinned: false,
    isArchived: false,
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Sync daily note into editor
  useEffect(() => {
    if (dailyNote) {
      setEditorValue({
        title: dailyNote.title || format(currentDateObj, 'MMMM d, yyyy'),
        content: dailyNote.content || '',
        tags: dailyNote.tags || ['daily'],
        color: dailyNote.color || 'default',
        isFavorite: dailyNote.isFavorite || false,
        isPinned: dailyNote.isPinned || false,
        isArchived: dailyNote.isArchived || false,
      });
    }
  }, [dailyNote, currentDateObj]);

  // Auto-save handler
  const handleSave = async (val: EditorValue) => {
    if (dailyNote?._id) {
      await updateDailyNote(val);
    }
  };

  const { status: autoSaveStatus, lastSavedAt, triggerSave } = useAutoSave({
    value: editorValue,
    onSave: handleSave,
    delay: 1000,
    enabled: Boolean(dailyNote?._id),
  });

  // Navigate dates
  const handlePrevDay = () => {
    const prev = format(subDays(currentDateObj, 1), 'yyyy-MM-dd');
    navigate(`/today/${prev}`);
  };

  const handleNextDay = () => {
    const next = format(addDays(currentDateObj, 1), 'yyyy-MM-dd');
    navigate(`/today/${next}`);
  };

  const handleJumpToToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    navigate(`/today/${todayStr}`);
    setIsCalendarOpen(false);
  };

  // Calendar days calculation
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDateObj);
    const monthEnd = endOfMonth(currentDateObj);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDateObj]);

  const datesWithNotesSet = useMemo(() => {
    return new Set(dailyDates.map((d) => d.date));
  }, [dailyDates]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  const availableTagNames = tags.map((t) => t.name);
  const formattedDayTitle = format(currentDateObj, 'EEEE, MMMM d, yyyy');
  const isCurrentDayToday = isToday(currentDateObj);

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-5xl mx-auto">
      {/* Date Navigation & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevDay}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground">
                {formattedDayTitle}
              </h1>
              {isCurrentDayToday && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Today
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Daily Planner & Notes Workspace
            </p>
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Next Day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Stepper Actions */}
        <div className="flex items-center gap-2">
          {!isCurrentDayToday && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleJumpToToday}
              className="h-8 text-xs font-medium"
            >
              Jump to Today
            </Button>
          )}

          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              leftIcon={<CalendarIcon className="h-3.5 w-3.5" />}
              className="h-8 text-xs font-medium"
            >
              Calendar
            </Button>

            {/* Calendar Popover */}
            {isCalendarOpen && (
              <div className="absolute right-0 top-10 z-40 w-64 rounded-2xl border border-border bg-card p-3 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs font-bold text-foreground">
                  <span>{format(currentDateObj, 'MMMM yyyy')}</span>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground pt-2 mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {calendarDays.map((day) => {
                    const dayIso = format(day, 'yyyy-MM-dd');
                    const isSelected = isSameDay(day, currentDateObj);
                    const isTodayDay = isToday(day);
                    const hasNote = datesWithNotesSet.has(dayIso);

                    return (
                      <button
                        key={dayIso}
                        type="button"
                        onClick={() => {
                          navigate(`/today/${dayIso}`);
                          setIsCalendarOpen(false);
                        }}
                        className={cn(
                          'h-7 w-7 rounded-lg flex flex-col items-center justify-center relative text-xs transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                            : isTodayDay
                            ? 'border border-primary/40 text-primary font-semibold'
                            : 'hover:bg-muted text-foreground'
                        )}
                      >
                        <span>{format(day, 'd')}</span>
                        {hasNote && !isSelected && (
                          <span className="h-1 w-1 rounded-full bg-primary absolute bottom-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Component */}
      <div className="h-[calc(100vh-14rem)] flex flex-col">
        <MarkdownEditor
          initialValue={editorValue}
          availableTags={availableTagNames}
          saveStatus={autoSaveStatus}
          lastSavedAt={lastSavedAt}
          onChange={(val) => setEditorValue(val)}
          onManualSave={triggerSave}
          onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        />
      </div>

      {/* Backlinks panel for daily note */}
      {dailyNote?._id && (
        <div className="pt-2">
          <BacklinksPanel noteId={dailyNote._id} />
        </div>
      )}

      {/* Version History Drawer */}
      <VersionHistoryPanel
        noteId={dailyNote?._id}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
      />
    </div>
  );
}
