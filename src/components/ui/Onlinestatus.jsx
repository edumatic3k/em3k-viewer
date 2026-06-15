// src/components/layout/OnlineStatus.jsx
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

export function OnlineStatus() {
  const isOnline = useSignal(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => { isOnline.value = true; };
    const handleOffline = () => { isOnline.value = false; };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 text-sm ${isOnline.value ? 'text-green-600' : 'text-red-600'}`}>
      <div className={`w-2 h-2 rounded-full ${isOnline.value ? 'bg-green-500' : 'bg-red-500'}`} />
      {isOnline.value ? 'Online' : 'Offline'}
    </div>
  );
}