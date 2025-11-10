import React, { useEffect, useState } from 'react';
import { View, StyleSheet, DeviceEventEmitter } from 'react-native';
import { getDemoModeFromStorage, DEMO_MODE_CHANGED_EVENT } from './ConnectionHeader';

interface DemoBorderWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that adds a green border around the app when demo mode is active
 * Usage: Wrap your main screen content with this component
 */
export const DemoBorderWrapper: React.FC<DemoBorderWrapperProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check demo mode on mount
    const checkDemoMode = async () => {
      const demoEnabled = await getDemoModeFromStorage();
      setIsDemoMode(demoEnabled);
    };
    checkDemoMode();

    // Listen for demo mode changes
    const subscription = DeviceEventEmitter.addListener(
      DEMO_MODE_CHANGED_EVENT,
      (event: { isDemoMode: boolean }) => {
        setIsDemoMode(event.isDemoMode);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={[styles.wrapper, isDemoMode && styles.demoBorder]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  demoBorder: {
    borderWidth: 8,
    borderColor: '#28A745',
    borderRadius: 4,
  },
});
