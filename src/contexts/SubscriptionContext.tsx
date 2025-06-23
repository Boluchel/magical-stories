import React, { createContext, useContext, useEffect, useState } from 'react';
import { Purchases } from '@revenuecat/purchases-js';
import type { PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-js';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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

  // Sync subscription status with Supabase
  const syncSubscriptionStatus = async (info: CustomerInfo) => {
    if (!user) return;

    try {
      const hasActiveSubscription = Object.keys(info.entitlements.active).length > 0;
      const subscriptionType = hasActiveSubscription 
        ? Object.keys(info.entitlements.active)[0] 
        : null;
      
      // Get expiration date from the first active entitlement
      let expiresAt = null;
      if (hasActiveSubscription) {
        const firstEntitlement = Object.values(info.entitlements.active)[0];
        expiresAt = firstEntitlement.expirationDate;
      }

      // Update subscription status in Supabase
      const { error: updateError } = await supabase
        .rpc('update_subscription_status', {
          user_uuid: user.id,
          rc_user_id: info.originalAppUserId,
          subscribed: hasActiveSubscription,
          sub_type: subscriptionType,
          expires: expiresAt
        });

      if (updateError) {
        console.error('Failed to sync subscription status:', updateError);
      }

      setIsSubscribed(hasActiveSubscription);
    } catch (err) {
      console.error('Error syncing subscription status:', err);
    }
  };

  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Wait for auth loading to complete
        if (authLoading) {
          return;
        }

        // Initialize RevenueCat with Paddle configuration (only once)
        if (!isInitialized) {
          // Use the Paddle public key for RevenueCat Web
          const paddlePublicKey = 'pdl_sdbx_apikey_01jye7n5adfb5z4jpqzchwp847_Q8SM3abTbQRSQffRQHdxeQ_A2B';
          
          if (!paddlePublicKey) {
            throw new Error('Paddle public key not found. Please check your configuration.');
          }

          // Determine user ID for initial configuration
          let appUserId = null;
          if (user && user.id) {
            const userId = String(user.id).trim();
            if (userId && userId !== '' && userId !== 'undefined' && userId !== 'null') {
              appUserId = userId;
            }
          }

          console.log('Configuring RevenueCat with Paddle and user ID:', appUserId || 'anonymous');

          // Configure RevenueCat with Paddle
          await Purchases.configure({
            apiKey: paddlePublicKey,
            appUserId: appUserId // null for anonymous, or valid user ID
          });
          
          setIsInitialized(true);
        } else {
          // If already initialized, handle user login/logout
          if (user && user.id) {
            const userId = String(user.id).trim();
            
            if (userId && userId !== '' && userId !== 'undefined' && userId !== 'null') {
              console.log('Logging in RevenueCat user with ID:', userId);
              await Purchases.logIn(userId);
            } else {
              console.log('Invalid user ID, logging out to anonymous mode');
              await Purchases.logOut();
            }
          } else {
            console.log('No user, logging out to anonymous mode');
            await Purchases.logOut();
          }
        }

        // Get customer info after initialization/login
        try {
          const info = await Purchases.getCustomerInfo();
          setCustomerInfo(info);
          if (user) {
            await syncSubscriptionStatus(info);
          } else {
            setIsSubscribed(false);
          }
        } catch (customerInfoError) {
          console.warn('Failed to get customer info:', customerInfoError);
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
      await syncSubscriptionStatus(updatedCustomerInfo);
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
      await syncSubscriptionStatus(info);
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
      await syncSubscriptionStatus(info);
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