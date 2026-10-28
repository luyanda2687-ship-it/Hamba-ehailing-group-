import { useEffect, useState, useCallback } from 'react';
import { offlineStorage } from '../services/offlineStorage';

export function useOnlineStatus() {
  const [isSimulatedOffline, setIsSimulatedOfflineState] = useState(() =>
    offlineStorage.isSimulatedOffline()
  );
  const [isHardwareOnline, setIsHardwareOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsHardwareOnline(true);
    const handleOffline = () => setIsHardwareOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleSimulatedChange = () => {
      setIsSimulatedOfflineState(offlineStorage.isSimulatedOffline());
    };
    window.addEventListener('hamba_network_change', handleSimulatedChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('hamba_network_change', handleSimulatedChange);
    };
  }, []);

  const toggleSimulatedOffline = useCallback(() => {
    const nextState = !isSimulatedOffline;
    offlineStorage.setSimulatedOffline(nextState);
    setIsSimulatedOfflineState(nextState);
    window.dispatchEvent(new Event('hamba_network_change'));
  }, [isSimulatedOffline]);

  // Actual effective status: online only if hardware has connection AND user has not simulated remote offline mode
  const effectiveIsOnline = isHardwareOnline && !isSimulatedOffline;

  return {
    isOnline: effectiveIsOnline,
    isHardwareOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
  };
}
