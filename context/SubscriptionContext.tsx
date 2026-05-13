import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";

import {
  getCustomerInfo,
  hasProAccess,
  initRevenueCat,
} from "../services/revenuecat";

type SubscriptionContextValue = {
  isPro: boolean;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
};

const SubscriptionContext =
  createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [customerInfo, setCustomerInfo] =
    useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    setLoading(true);

    try {
      console.log("[Subscription] Refreshing RevenueCat status.");
      await initRevenueCat();

      const info = await getCustomerInfo();
      setCustomerInfo(info);

      console.log("[Subscription] Pro access:", hasProAccess(info));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSubscription();

    const listener = (info: CustomerInfo) => {
      console.log("[Subscription] Customer info updated.");
      setCustomerInfo(info);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [refreshSubscription]);

  const value = useMemo(
    () => ({
      isPro: hasProAccess(customerInfo),
      loading,
      refreshSubscription,
    }),
    [customerInfo, loading, refreshSubscription]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      "useSubscription must be used inside SubscriptionProvider."
    );
  }

  return context;
}
