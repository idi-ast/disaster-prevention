import { useState, useCallback, useEffect, useRef } from 'react';
import { NotificationsService, LogsService, Notification, Log, NotificationPreferences } from '../services/logsNotificationsService';

/**
 * Hook para manejar notificaciones del usuario
 */
export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 50,
        offset: 0,
    });

    // Obtener notificaciones
    const fetchNotifications = useCallback(async (limit = 50, offset = 0, unreadOnly = false) => {
        setLoading(true);
        setError(null);
        try {
            const result = await NotificationsService.getNotifications(limit, offset, unreadOnly);
            setNotifications(result.data);
            setPagination(result.pagination);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al obtener notificaciones';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener conteo de no leídas
    const fetchUnreadCount = useCallback(async () => {
        try {
            const result = await NotificationsService.getUnreadCount();
            setUnreadCount(result.unread);
        } catch (err) {
            console.error('Error al obtener conteo de no leídas:', err);
        }
    }, []);

    // Marcar como leída
    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            await NotificationsService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
            fetchUnreadCount();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al marcar como leída';
            setError(errorMessage);
        }
    }, [fetchUnreadCount]);

    // Marcar todas como leídas
    const markAllAsRead = useCallback(async () => {
        try {
            await NotificationsService.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al marcar todas como leídas';
            setError(errorMessage);
        }
    }, []);

    // Eliminar notificación
    const deleteNotification = useCallback(async (notificationId: number) => {
        try {
            await NotificationsService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            fetchUnreadCount();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar notificación';
            setError(errorMessage);
        }
    }, [fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        pagination,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };
}

/**
 * Hook para manejar preferencias de notificaciones
 */
export function useNotificationPreferences() {
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener preferencias
    const fetchPreferences = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await NotificationsService.getPreferences();
            setPreferences(result.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al obtener preferencias';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar preferencias
    const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
        setLoading(true);
        setError(null);
        try {
            const result = await NotificationsService.updatePreferences(newPreferences);
            setPreferences(result.data);
            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar preferencias';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        preferences,
        loading,
        error,
        fetchPreferences,
        updatePreferences,
    };
}

/**
 * Hook para manejar logs del usuario
 */
export function useLogs() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 50,
        offset: 0,
    });

    // Obtener logs del usuario
    const fetchUserLogs = useCallback(async (limit = 50, offset = 0, action?: string, statusCode?: number) => {
        setLoading(true);
        setError(null);
        try {
            const result = await LogsService.getUserLogs(limit, offset, action, statusCode);
            setLogs(result.data);
            setPagination(result.pagination);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al obtener logs';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener detalle de un log
    const getLogDetail = useCallback(async (logId: number) => {
        try {
            const result = await LogsService.getLogDetail(logId);
            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al obtener detalles del log';
            setError(errorMessage);
            throw err;
        }
    }, []);

    return {
        logs,
        loading,
        error,
        pagination,
        fetchUserLogs,
        getLogDetail,
    };
}

/**
 * Hook para manejar estadísticas de logs
 */
export function useLogStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener estadísticas
    const fetchStats = useCallback(async (days = 7) => {
        setLoading(true);
        setError(null);
        try {
            const result = await LogsService.getLogStats(days);
            setStats(result.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al obtener estadísticas';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        stats,
        loading,
        error,
        fetchStats,
    };
}

/**
 * Hook para polling de notificaciones (check cada X segundos)
 */
export function useNotificationPolling(interval = 30000) {
    const { fetchUnreadCount } = useNotifications();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startPolling = useCallback(() => {
        intervalRef.current = setInterval(() => {
            fetchUnreadCount();
        }, interval);
    }, [fetchUnreadCount, interval]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return { startPolling, stopPolling };
}

/**
 * Hook personalizado para usar con Sonner (notificaciones toast)
 * Convierte notificaciones del sistema a toasts visuales
 */
export function useNotificationsToast(toast: any) {
    const { notifications, fetchNotifications, unreadCount } = useNotifications();

    const showNotificationAsToast = useCallback((notification: Notification) => {
        const toastType = notification.type as 'success' | 'error' | 'warning' | 'info';
        
        toast[toastType](notification.title, {
            description: notification.message,
            action: notification.action_url
                ? {
                    label: 'Ver',
                    onClick: () => {
                        window.location.href = notification.action_url;
                    },
                }
                : undefined,
        });
    }, [toast]);

    return {
        notifications,
        unreadCount,
        fetchNotifications,
        showNotificationAsToast,
    };
}

/**
 * Hook para monitorear logs en tiempo real
 */
export function useLogMonitoring(autoFetch = true, fetchInterval = 60000) {
    const { logs, fetchUserLogs, loading, error } = useLogs();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (autoFetch) {
            // Fetch inicial
            fetchUserLogs();

            // Setup polling
            intervalRef.current = setInterval(() => {
                fetchUserLogs();
            }, fetchInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoFetch, fetchInterval, fetchUserLogs]);

    return {
        logs,
        loading,
        error,
        refetch: fetchUserLogs,
    };
}
