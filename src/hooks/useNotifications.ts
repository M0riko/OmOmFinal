import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Ваш браузер не підтримує системні сповіщення');
      return false;
    }
    const perm = await Notification.requestPermission();
    setPermission(perm);
    
    if (perm === 'granted') {
      new Notification('Сповіщення увімкнено!', {
        body: 'Тепер ви будете отримувати реальні сповіщення від SLKY.'
      });
    }
    
    return perm === 'granted';
  };

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        ...options
      });
    }
  }, []);

  return { permission, requestPermission, notify };
}
