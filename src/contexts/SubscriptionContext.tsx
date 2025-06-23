import React, { createContext, useContext, useEffect, useState } from 'react';
import { Purchases } from '@revenuecat/purchases-js';
import type { PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-js';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  isSubscribed: boolean;
  packages: PurchasesPackage[];
  customerInfo: CustomerInfo | null;
  loading: boolean;
  error: string | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Wait for auth loading to complete
        if (authLoading) {
          return;
        }

        // Initialize RevenueCat with your public API key (only once)
        if (!isInitialized) {
          const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
          if (!apiKey) {
            throw new Error('RevenueCat API key not found. Please add VITE_REVENUECAT_PUBLIC_KEY to your environment variables.');
          }

          await Purchases.configure(apiKey);
          setIsInitialized(true);
        }

        // Handle user identification
        if (user && user.id) {
          // Ensure we have a valid string user ID
          const userId = String(user.id).trim();
          
          if (userId && userId !== '' && userId !== 'undefined' && userId !== 'null') {
            console.log('Identifying RevenueCat user with ID:', userId);
            
            // Identify the user with RevenueCat
            await Purchases.logIn(userId);
            
            // Get customer info
            const info = await Purchases.getCustomerInfo();
            setCustomerInfo(info);
            setIsSubscribed(Object.keys(info.entitlements.active).length > 0);
          } else {
            console.log('Invalid user ID, using anonymous mode');
            // Log out to ensure we're in anonymous mode
            await Purchases.logOut();
            setCustomerInfo(null);
            setIsSubscribed(false);
          }
        } else {
          console.log('No user, using anonymous mode');
          // Explicitly log out to ensure anonymous state
          await Purchases.logOut();
          setCustomerInfo(null);
          setIsSubscribed(false);
        }

        // Get available packages (works for both authenticated and anonymous users)
        try {
          const offerings = await Purchases.getOfferings();
          if (offerings.current) {
            setPackages(offerings.current.availablePackages);
          } else {
            console.log('No current offering found');
            setPackages([]);
          }
        } catch (offeringsError) {
          console.warn('Failed to load offerings:', offeringsError);
          setPackages([]);
        }

      } catch (err) {
        console.error('RevenueCat initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize subscription service');
      } finally {
        setLoading(false);
      }
    };

    initializeRevenueCat();
  }, [user, authLoading, isInitialized]);

  const purchasePackage = async (pkg: PurchasesPackage) => {
    try {
      setLoading(true);
      setError(null);

      const { customerInfo: updatedCustomerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(updatedCustomerInfo);
      setIsSubscribed(Object.keys(updatedCustomerInfo.entitlements.active).length > 0);
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      setIsSubscribed(Object.keys(info.entitlements.active).length > 0);
    } catch (err) {
      console.error('Restore purchases error:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore purchases');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      setIsSubscribed(Object.keys(info.entitlements.active).length > 0);
    } catch (err) {
      console.error('Refresh customer info error:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh subscription status');
    }
  };

  const value = {
    isSubscribed,
    packages,
    customerInfo,
    loading,
    error,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};