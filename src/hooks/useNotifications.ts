import { useSettings } from '../context/SettingsContext';
import { showNotification as showNotificationUtil } from '../utils/notifications';

export const useNotifications = () => {
  const { showPriceAlerts } = useSettings();

  const showNotification = async (title: string, body: string) => {
    // Only show notifications if they are enabled
    if (showPriceAlerts) {
      await showNotificationUtil(title, body);
    }
  };

  return {
    showNotification,
    notificationsEnabled: showPriceAlerts
  };
};
