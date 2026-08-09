import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/shared/components/layout/Header';
import { fetchNotifications, markNotificationRead } from '@/shared/services/api';

export default function NotificationsScreen() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('NotificationsScreen mounted');

        fetchNotifications()
            .then((data) => {
                console.log('NOTIFICATIONS:', data);
                setNotifications(data || []);
            })
            .catch((error) => {
                console.error('FAILED TO FETCH NOTIFICATIONS:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await markNotificationRead(notification.id);

                setNotifications((current) =>
                    current.map((item) =>
                    item.id === notification.id
                        ? { ...item, isRead: true }
                        : item
                    )
                );
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        if (notification.relatedTradeId) {
            navigate(`/trades/${notification.relatedTradeId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
            onBack={() => navigate(-1)}
            title="Notifications"
            />

            <div className="px-5 py-5">
            {loading ? (
                <p className="text-center text-sm text-gray-400 py-8">
                Loading notifications...
                </p>
            ) : notifications.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">
                No notifications yet.
                </p>
            ) : (
                <div className="space-y-3">
                {notifications.map((notification) => (
                    <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left rounded-2xl border p-4 transition ${
                        notification.isRead
                        ? 'bg-white border-gray-200'
                        : 'bg-brand-50 border-brand-200'
                    }`}
                    >
                    <div className="flex items-start gap-3">
                        {!notification.isRead && (
                        <span className="mt-2 w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                            {notification.title}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                            {notification.body}
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        </div>
                    </div>
                    </button>
                ))}
                </div>
            )}
            </div>
        </div>
    );
}