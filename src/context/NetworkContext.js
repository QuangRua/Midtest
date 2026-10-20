import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { storageService } from '../services/storageService';
import { syncService } from '../services/syncService';

const NetworkContext = createContext(null);

export const NetworkProvider = ({ children }) => {
  const [realIsConnected, setRealIsConnected] = useState(true);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const isInitialMount = useRef(true);

  // Effective online state: real connectivity AND not simulated offline
  const isOnline = realIsConnected && !simulateOffline;

  // Update pending queue count
  const refreshPendingCount = useCallback(async () => {
    const queue = await storageService.getSyncQueue();
    setPendingSyncCount(queue.length);
  }, []);

  // Sync execution
  const runAutoSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    try {
      setIsSyncing(true);
      const result = await syncService.processSyncQueue();
      if (result.success && result.count > 0) {
        setLastSyncTime(new Date());
      }
    } catch (e) {
      console.warn('Auto sync execution error:', e);
    } finally {
      setIsSyncing(false);
      refreshPendingCount();
    }
  }, [isOnline, isSyncing, refreshPendingCount]);

  // Load initial offline simulation preference
  useEffect(() => {
    (async () => {
      const sim = await storageService.getSimulateOffline();
      setSimulateOffline(sim);
      await refreshPendingCount();
    })();
  }, [refreshPendingCount]);

  // Listen to NetInfo
  useEffect(() => {
    let unsubscribe = () => {};
    if (Platform.OS === 'web') {
      const handleOnline = () => setRealIsConnected(true);
      const handleOffline = () => setRealIsConnected(false);
      if (typeof window !== 'undefined') {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setRealIsConnected(navigator.onLine ?? true);
        unsubscribe = () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    } else {
      unsubscribe = NetInfo.addEventListener((state) => {
        setRealIsConnected(state.isConnected ?? true);
      });
    }
    return () => unsubscribe();
  }, []);

  // When connection transitions to ONLINE -> auto trigger sync
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // On app startup, if online, attempt auto sync
      if (isOnline) {
        runAutoSync();
      }
      return;
    }

    if (isOnline) {
      console.log('Network is ONLINE -> Triggering automatic sync with MockAPI');
      runAutoSync();
    }
  }, [isOnline, runAutoSync]);

  const toggleSimulateOffline = async (forceVal) => {
    const nextVal = typeof forceVal === 'boolean' ? forceVal : !simulateOffline;
    setSimulateOffline(nextVal);
    await storageService.saveSimulateOffline(nextVal);
  };

  const triggerManualSync = async () => {
    if (!isOnline) return;
    await runAutoSync();
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        realIsConnected,
        simulateOffline,
        isSyncing,
        pendingSyncCount,
        lastSyncTime,
        toggleSimulateOffline,
        triggerManualSync,
        refreshPendingCount,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};
