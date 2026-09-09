'use client';

import { useCallback, useEffect, useState } from 'react';
import type { NotificationItemResponseDto } from '@aletheia/contracts';

export interface UseNotificationsResult {
  notifications: NotificationItemResponseDto[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

// Only the Settings page used to fetch notifications for itself, so the
// bell was invisible on every other page — where a guardian actually
// spends most of their time. This hook lets ProductShell fetch its own
// notifications whenever a page doesn't already provide them as props,
// so the bell (and its unread count) shows up everywhere the shell renders.
export function useNotifications(familyId: string | null | undefined): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationItemResponseDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!familyId) return;
    try {
      const [notifRes, countRes] = await Promise.all([
        fetch(`/api/v1/families/${familyId}/notifications`, { credentials: 'include' }),
        fetch(`/api/v1/families/${familyId}/notifications/unread-count`, { credentials: 'include' }),
      ]);
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (countRes.ok) setUnreadCount((await countRes.json()).count ?? 0);
    } catch {
      // Notification bell just stays empty/stale — never blocks the shell.
    }
  }, [familyId]);

  useEffect(() => {
    setNotifications([]);
    setUnreadCount(0);
    void refresh();
  }, [refresh]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!familyId) return;
      const res = await fetch(`/api/v1/families/${familyId}/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) await refresh();
    },
    [familyId, refresh],
  );

  const markAllAsRead = useCallback(async () => {
    if (!familyId) return;
    const res = await fetch(`/api/v1/families/${familyId}/notifications/read-all`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) await refresh();
  }, [familyId, refresh]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
