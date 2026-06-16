// src/components/layout/OnlineStatus.jsx
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

export function Onlinestatus() {

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
      <div class="ms-auto m-0 p-0 me-1">
          <button id="greenbtn" type="button" class="btn btn-sm" title="Status: Online">🟢</button>
          <button id="redbtn" type="button" class="d-none btn btn-sm" title="Status: Offline">🔴</button>
      </div>
    );

  // return (
  //   <div className={`flex items-center gap-2 text-sm ${isOnline.value ? 'text-green-600' : 'text-red-600'}`}>
  //     <div className={`w-2 h-2 rounded-full ${isOnline.value ? 'bg-green-500' : 'bg-red-500'}`} />
  //     {isOnline.value ? 'Online' : 'Offline'}
  //   </div>
  // );
}