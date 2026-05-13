import Constants from "expo-constants";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";

type RevenueCatEnvKey =
  | "EXPO_PUBLIC_REVENUECAT_IOS_API_KEY"
  | "EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY";

type RevenueCatExtra = {
  revenueCatIosApiKey?: string;
  revenueCatAndroidApiKey?: string;
};

type PurchaseError = {
  code?: string;
  userCancelled?: boolean;
};

declare const __DEV__: boolean;

declare const process:
  | {
      env?: Partial<Record<RevenueCatEnvKey, string>>;
    }
  | undefined;

export const COVENANT_PRO_ENTITLEMENT_ID = "covenant_pro";

const MONTHLY_PACKAGE_IDENTIFIER = "$rc_monthly";
const ANNUAL_PACKAGE_IDENTIFIER = "$rc_annual";

export type CovenantProPlan = "monthly" | "annual";

let isConfigured = false;
let configurePromise: Promise<boolean> | null = null;

function getExpoExtra(): RevenueCatExtra {
  return (Constants.expoConfig?.extra ?? {}) as RevenueCatExtra;
}

function getEnvValue(key: RevenueCatEnvKey): string | undefined {
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
}

function cleanApiKey(apiKey?: string): string | null {
  const value = apiKey?.trim();
  return value ? value : null;
}

export function getRevenueCatApiKey(): string | null {
  const extra = getExpoExtra();

  if (Platform.OS === "ios") {
    return cleanApiKey(
      getEnvValue("EXPO_PUBLIC_REVENUECAT_IOS_API_KEY") ??
        extra.revenueCatIosApiKey
    );
  }

  if (Platform.OS === "android") {
    return cleanApiKey(
      getEnvValue("EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY") ??
        extra.revenueCatAndroidApiKey
    );
  }

  return null;
}

function warnRevenueCat(message: string, error?: unknown): void {
  if (!__DEV__) return;

  if (error) {
    console.warn(`[RevenueCat] ${message}`, error);
    return;
  }

  console.warn(`[RevenueCat] ${message}`);
}

export async function initializeRevenueCat(appUserID?: string): Promise<boolean> {
  if (isConfigured) return true;
  if (configurePromise) return configurePromise;

  configurePromise = (async () => {
    const apiKey = getRevenueCatApiKey();

    if (!apiKey) {
      warnRevenueCat(
        "Missing API key. Set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY or app.json extra revenueCatIosApiKey / revenueCatAndroidApiKey."
      );
      configurePromise = null;
      return false;
    }

    try {
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({ apiKey, appUserID });
      isConfigured = true;
      return true;
    } catch (error) {
      configurePromise = null;
      warnRevenueCat("Could not initialize Purchases.", error);
      return false;
    }
  })();

  return configurePromise;
}

async function ensureRevenueCat(): Promise<boolean> {
  return initializeRevenueCat();
}

export function customerHasCovenantPro(customerInfo: CustomerInfo): boolean {
  return Boolean(
    customerInfo.entitlements.active[COVENANT_PRO_ENTITLEMENT_ID]?.isActive
  );
}

export async function hasCovenantPro(): Promise<boolean> {
  const configured = await ensureRevenueCat();
  if (!configured) return false;

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerHasCovenantPro(customerInfo);
  } catch (error) {
    warnRevenueCat("Could not load customer info.", error);
    return false;
  }
}

export async function getRevenueCatOfferings(): Promise<PurchasesOfferings | null> {
  const configured = await ensureRevenueCat();
  if (!configured) return null;

  try {
    return await Purchases.getOfferings();
  } catch (error) {
    warnRevenueCat("Could not load offerings.", error);
    return null;
  }
}

export async function getCurrentRevenueCatOffering(): Promise<PurchasesOffering | null> {
  const offerings = await getRevenueCatOfferings();
  return offerings?.current ?? null;
}

export async function getMonthlySubscriptionPackage(): Promise<PurchasesPackage | null> {
  const offering = await getCurrentRevenueCatOffering();
  if (!offering) return null;

  return (
    offering.monthly ??
    offering.availablePackages.find(
      (item) => item.identifier === MONTHLY_PACKAGE_IDENTIFIER
    ) ??
    null
  );
}

export async function getAnnualSubscriptionPackage(): Promise<PurchasesPackage | null> {
  const offering = await getCurrentRevenueCatOffering();
  if (!offering) return null;

  return (
    offering.annual ??
    offering.availablePackages.find(
      (item) => item.identifier === ANNUAL_PACKAGE_IDENTIFIER
    ) ??
    null
  );
}

export async function getSubscriptionPackage(
  plan: CovenantProPlan
): Promise<PurchasesPackage | null> {
  if (plan === "annual") {
    return getAnnualSubscriptionPackage();
  }

  return getMonthlySubscriptionPackage();
}

function isPurchaseCancelledError(error: unknown): boolean {
  const purchaseError = error as PurchaseError;

  return (
    purchaseError.userCancelled === true ||
    purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  );
}

export async function purchaseMonthlySubscription(): Promise<CustomerInfo | null> {
  return purchaseSubscription("monthly");
}

export async function purchaseSubscription(
  plan: CovenantProPlan
): Promise<CustomerInfo | null> {
  const subscriptionPackage = await getSubscriptionPackage(plan);
  if (!subscriptionPackage) return null;

  try {
    const { customerInfo } = await Purchases.purchasePackage(subscriptionPackage);
    return customerInfo;
  } catch (error) {
    if (isPurchaseCancelledError(error)) return null;

    warnRevenueCat(`Could not purchase ${plan} subscription.`, error);
    throw error;
  }
}
