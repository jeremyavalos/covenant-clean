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
import {
  hasManualProAccess,
} from "../utils/manualProAccess";

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
  const [manualProAccess, setManualProAccess] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const refreshSubscription = useCallback(async () => {
    setLoading(true);

    try {
      const manualAccess = await hasManualProAccess();
      setManualProAccess(manualAccess);

      try {
        await initRevenueCat();

        const info = await getCustomerInfo();
        setCustomerInfo(info);
      } catch {
        // Manual access is local and must not depend on RevenueCat availability.
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hasManualProAccess()
      .then(setManualProAccess)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
    };

    try {
      Purchases.addCustomerInfoUpdateListener(listener);
    } catch {
      return;
    }

    return () => {
      try {
        Purchases.removeCustomerInfoUpdateListener(listener);
      } catch {
        // RevenueCat may not be configured during first launch.
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      isPro: hasProAccess(customerInfo) || manualProAccess,
      loading,
      refreshSubscription,
    }),
    [customerInfo, loading, manualProAccess, refreshSubscription]
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
