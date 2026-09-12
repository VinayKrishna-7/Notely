import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotes } from '../hooks/useNotes';
import { useTags } from '../hooks/useTags';
import { useStats } from '../hooks/useStats';
import { StatCard } from '../components/common/StatCard';
import { NoteCard } from '../components/notes/NoteCard';
import { Button } from '../components/ui/button';
import { PageSkeleton } from '../components/ui/skeleton';
import { TagBadge } from '../components/tags/TagBadge';
import {
  FileText,
  Star,
  Pin,
  Tag as TagIcon,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar,
  Flame,
  Activity,
} from 'lucide-react';
import { ClockWidget } from '../components/clock';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, isLoading: isStatsLoading } = useStats();
  const {
    notes,
    isLoading: isNotesLoading,
    toggleFavorite,
    togglePin,
    toggleArchive,
    deleteNote,
    duplicateNote,
  } = useNotes({ limit: 12, sort: 'updated_desc' });
  const { tags } = useTags();

  if (isStatsLoading && isNotesLoading) {
    return <PageSkeleton />;
  }

  // Active notes (exclude trash & archive for dashboard overview)
  const activeNotes = notes.filter((n) => !n.isDeleted && !n.isArchived);
  const pinnedNotes = activeNotes.filter((n) => n.isPinned);
  const favoriteNotes = activeNotes.filter((n) => n.isFavorite);
  const recentNotes = activeNotes.slice(0, 6);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const todayDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const maxDailyCount = Math.max(1, ...(stats?.activityByDay?.map((d) => d.count) || [1]));

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Top Banner / Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>{greeting}, {user?.name?.split(' ')[0] || 'there'}!</span>
            <Sparkles className="h-5 w-5 text-muted-foreground inline" />
          </h1>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
            <ClockWidget size="compact" />
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Notely Personal Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/today')}
            leftIcon={<Calendar className="h-4 w-4" />}
            size="default"
          >
            Today's Daily Note
          </Button>
          <Button
            onClick={() => navigate('/notes/new')}
            leftIcon={<Plus className="h-4 w-4" />}
            size="default"
          >
            Create Note
          </Button>
        </div>
      </div>

      {/* Writing Streak & Cadence Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Streak & Metrics */}
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-500" />
              Writing Streak
            </span>
            <span className="text-xs text-muted-foreground">Cadence</span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-foreground flex items-baseline gap-2">
              <span>{stats?.writingStreak || 1}</span>
              <span className="text-sm font-normal text-muted-foreground">day streak</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalWords
                ? `${stats.totalWords.toLocaleString()} total words composed`
                : 'Keep creating notes daily to maintain your momentum.'}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/today')}
            className="w-full justify-between text-xs text-muted-foreground hover:text-foreground border border-border/50"
          >
            <span>Open today's journal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* 7-Day Activity Cadence Bar Graph */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 flex flex-col justify-between space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary" />
              Activity in Past 7 Days
            </span>
            <span className="text-xs text-muted-foreground">
              {stats?.createdThisWeek ?? 0} updates this week
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end pt-3 h-28">
            {(stats?.activityByDay || []).map((day) => {
              const heightPercent = Math.max(12, Math.round((day.count / maxDailyCount) * 100));
              return (
                <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-md transition-all duration-300 ${
                      day.count > 0
                        ? 'bg-foreground/80 hover:bg-foreground group-hover:shadow-xs'
                        : 'bg-muted/60'
                    }`}
                    title={`${day.day} (${day.date}): ${day.count} updates`}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Notes"
          value={stats?.totalNotes ?? activeNotes.length}
          icon={<FileText className="h-5 w-5" />}
          description="Active in workspace"
          onClick={() => navigate('/notes')}
        />
        <StatCard
          title="Favorites"
          value={stats?.favoritesCount ?? favoriteNotes.length}
          icon={<Star className="h-5 w-5" />}
          description="Starred notes"
          onClick={() => navigate('/favorites')}
        />
        <StatCard
          title="Pinned"
          value={stats?.pinnedCount ?? pinnedNotes.length}
          icon={<Pin className="h-5 w-5" />}
          description="Priority pinned"
          onClick={() => navigate('/pinned')}
        />
        <StatCard
          title="Tags"
          value={tags.length}
          icon={<TagIcon className="h-5 w-5" />}
          description="Active categories"
          onClick={() => navigate('/tags')}
        />
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                Pinned Notes
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/pinned')}
              className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.slice(0, 3).map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onSelect={(n) => navigate(`/notes/${n._id}`)}
                onEdit={(n) => navigate(`/notes/${n._id}`)}
                onToggleFavorite={toggleFavorite}
                onTogglePin={togglePin}
                onToggleArchive={toggleArchive}
                onDelete={deleteNote}
                onDuplicate={duplicateNote}
                onTagClick={(tag) => navigate(`/notes?tag=${encodeURIComponent(tag)}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              Recently Updated Notes
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/notes')}
            className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            All notes <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              You haven't created any notes yet.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/notes/new')}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create your first note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onSelect={(n) => navigate(`/notes/${n._id}`)}
                onEdit={(n) => navigate(`/notes/${n._id}`)}
                onToggleFavorite={toggleFavorite}
                onTogglePin={togglePin}
                onToggleArchive={toggleArchive}
                onDelete={deleteNote}
                onDuplicate={duplicateNote}
                onTagClick={(tag) => navigate(`/notes?tag=${encodeURIComponent(tag)}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Popular Tags Section */}
      {tags.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tags in your Workspace
            </h3>
            <span className="text-xs text-muted-foreground">{tags.length} total</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge
                key={tag._id}
                name={tag.name}
                count={tag.noteCount || 0}
                onClick={() => navigate(`/notes?tag=${encodeURIComponent(tag.name)}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
