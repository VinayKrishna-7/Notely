import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/authApi';
import { ClockPreferences, DEFAULT_CLOCK_PREFERENCES, ClockStyle, ClockTimeFormat, ClockAccent } from '../../types';
import { ClockPreview } from './ClockPreview';
import { ClockStyleSelector } from './ClockStyleSelector';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Clock, Check, Save } from 'lucide-react';
import { toast } from 'sonner';

export function ClockSettings() {
  const { user, updateUser } = useAuth();

  const [preferences, setPreferences] = useState<ClockPreferences>(() => {
    return {
      ...DEFAULT_CLOCK_PREFERENCES,
      ...(user?.clockPreferences || {}),
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Synchronize when user object changes
  useEffect(() => {
    if (user?.clockPreferences) {
      setPreferences({
        ...DEFAULT_CLOCK_PREFERENCES,
        ...user.clockPreferences,
      });
      setHasUnsavedChanges(false);
    }
  }, [user?.clockPreferences]);

  const updatePreference = <K extends keyof ClockPreferences>(
    key: K,
    value: ClockPreferences[K]
  ) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      setHasUnsavedChanges(true);
      return next;
    });
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await authApi.updateProfile({
        clockPreferences: preferences,
      });
      updateUser(updatedUser);
      setHasUnsavedChanges(false);
      toast.success('Clock preferences updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save clock preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Clock Preferences
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize the live clock format, style, and display behavior.
            </p>
          </div>
        </div>

        {/* Master Enabled Switch */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/40 px-3 py-1.5 rounded-xl border border-border/60">
          <span className="text-xs font-medium text-foreground">
            {preferences.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={(checked: boolean) => updatePreference('enabled', checked)}
            aria-label="Toggle Live Clock"
          />
        </div>
      </div>

      {/* Live Interactive Preview */}
      <ClockPreview preferences={preferences} />

      {/* Controls Container */}
      <div className={`space-y-6 transition-opacity duration-200 ${preferences.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {/* 1. Clock Style Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Clock Style
          </label>
          <ClockStyleSelector
            selectedStyle={preferences.style}
            preferences={preferences}
            onSelectStyle={(style) => updatePreference('style', style)}
            disabled={!preferences.enabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 2. Time Format (12h vs 24h) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Time Format
            </label>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              {[
                { id: '12h' as ClockTimeFormat, label: '12-Hour', example: '10:42 PM' },
                { id: '24h' as ClockTimeFormat, label: '24-Hour', example: '22:42' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updatePreference('timeFormat', item.id)}
                  disabled={!preferences.enabled}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                    preferences.timeFormat === item.id
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-2xs'
                      : 'border-border bg-muted/30 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-[10px] opacity-75 font-mono mt-0.5">{item.example}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Accent Palette */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Clock Accent
            </label>
            <div className="grid grid-cols-3 gap-2 max-w-xs">
              {[
                { id: 'neutral' as ClockAccent, label: 'Neutral', desc: 'Zinc' },
                { id: 'accent' as ClockAccent, label: 'Accent', desc: 'Primary' },
                { id: 'muted' as ClockAccent, label: 'Muted', desc: 'Subtle' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updatePreference('accent', item.id)}
                  disabled={!preferences.enabled}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all ${
                    preferences.accent === item.id
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-2xs'
                      : 'border-border bg-muted/30 hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-[10px] opacity-75 mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Display Toggles (Seconds & Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card/60">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Show Seconds
              </span>
              <span className="text-[11px] text-muted-foreground">
                Display ticking seconds
              </span>
            </div>
            <Switch
              checked={preferences.showSeconds}
              onCheckedChange={(checked: boolean) => updatePreference('showSeconds', checked)}
              aria-label="Toggle seconds"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card/60">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Show Date
              </span>
              <span className="text-[11px] text-muted-foreground">
                Include day or full date
              </span>
            </div>
            <Switch
              checked={preferences.showDate}
              onCheckedChange={(checked: boolean) => updatePreference('showDate', checked)}
              aria-label="Toggle date"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {hasUnsavedChanges ? 'You have unsaved changes' : 'All preferences synced'}
        </span>
        <Button
          onClick={handleSavePreferences}
          isLoading={isSaving}
          disabled={!hasUnsavedChanges && !isSaving}
          leftIcon={<Save className="h-4 w-4" />}
          size="sm"
        >
          Save Clock Settings
        </Button>
      </div>
    </div>
  );
}
