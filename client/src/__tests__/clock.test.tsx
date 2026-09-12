// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { ClockWidget } from '../components/clock/ClockWidget';
import { useClock } from '../hooks/useClock';
import { AuthContext } from '../contexts/AuthContext';

// Mock auth wrapper
function renderWithAuth(
  ui: React.ReactElement,
  clockPreferences = {}
) {
  const mockAuth = {
    user: {
      _id: 'user1',
      name: 'Test User',
      email: 'test@notely.app',
      createdAt: '',
      updatedAt: '',
      clockPreferences: {
        enabled: true,
        style: 'minimal' as const,
        timeFormat: '12h' as const,
        showSeconds: false,
        showDate: false,
        accent: 'neutral' as const,
        ...clockPreferences,
      },
    },
    token: 'token',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    refreshUser: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={mockAuth as any}>
      {ui}
    </AuthContext.Provider>
  );
}

// Helper component for testing useClock hook
function ClockHookTester() {
  const time = useClock();
  return <div data-testid="time-display">{time.toISOString()}</div>;
}

describe('Clock Widget & Hook Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('useClock updates time when timers advance and cleans up on unmount', () => {
    const initialDate = new Date('2026-09-12T10:00:00Z');
    vi.setSystemTime(initialDate);

    const { unmount } = render(<ClockHookTester />);
    expect(screen.getByTestId('time-display').textContent).toBe(initialDate.toISOString());

    // Advance 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const expectedDate = new Date('2026-09-12T10:00:03Z');
    expect(screen.getByTestId('time-display').textContent).toBe(expectedDate.toISOString());

    // Unmount should not throw or leak
    unmount();
  });

  it('renders Minimal style in 12-hour format', () => {
    const testDate = new Date(2026, 8, 12, 10, 42, 0);
    renderWithAuth(
      <ClockWidget staticDate={testDate} preferences={{ style: 'minimal', timeFormat: '12h' }} />
    );
    expect(screen.getByText('10:42 AM')).toBeDefined();
  });

  it('renders 24-hour format correctly', () => {
    const testDate = new Date(2026, 8, 12, 22, 42, 0);
    renderWithAuth(
      <ClockWidget staticDate={testDate} preferences={{ style: 'minimal', timeFormat: '24h' }} />
    );
    expect(screen.getByText('22:42')).toBeDefined();
  });

  it('renders DateTime stacked style', () => {
    const testDate = new Date(2026, 8, 12, 10, 42, 0);
    renderWithAuth(
      <ClockWidget staticDate={testDate} preferences={{ style: 'dateTime' }} />
    );
    expect(screen.getByText(/Sep 12/)).toBeDefined();
    expect(screen.getByText('10:42 AM')).toBeDefined();
  });

  it('renders Digital style with seconds', () => {
    const testDate = new Date(2026, 8, 12, 10, 42, 37);
    renderWithAuth(
      <ClockWidget staticDate={testDate} preferences={{ style: 'digital' }} />
    );
    expect(screen.getByRole('timer')).toBeDefined();
    expect(screen.getByText(':37')).toBeDefined();
  });

  it('renders Compact style with day indicator', () => {
    const testDate = new Date(2026, 8, 12, 10, 42, 0);
    renderWithAuth(
      <ClockWidget staticDate={testDate} preferences={{ style: 'compact' }} />
    );
    expect(screen.getByText('10:42 AM')).toBeDefined();
    expect(screen.getByText('Sat')).toBeDefined();
  });

  it('renders Productivity style with full date', () => {
    const testDate = new Date(2026, 8, 12, 10, 42, 0);
    renderWithAuth(
      <ClockWidget staticDate={testDate} preferences={{ style: 'productivity' }} />
    );
    expect(screen.getByText('Saturday, September 12')).toBeDefined();
    expect(screen.getByText('10:42 AM')).toBeDefined();
  });

  it('renders Focus style with focus badge', () => {
    const testDate = new Date(2026, 8, 12, 10, 42, 0);
    renderWithAuth(
      <ClockWidget staticDate={testDate} preferences={{ style: 'focus' }} />
    );
    expect(screen.getByText('Focus')).toBeDefined();
  });

  it('renders Analog style SVG dial', () => {
    const testDate = new Date(2026, 8, 12, 10, 42, 0);
    const { container } = renderWithAuth(
      <ClockWidget staticDate={testDate} preferences={{ style: 'analog' }} />
    );
    expect(container.querySelector('svg')).toBeDefined();
    expect(screen.getByRole('timer')).toBeDefined();
  });

  it('respects disabled state by returning null', () => {
    const { container } = renderWithAuth(
      <ClockWidget preferences={{ enabled: false }} />
    );
    expect(container.firstChild).toBeNull();
  });
});
