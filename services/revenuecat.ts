import Constants from "expo-constants";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";

type RevenueCatExtra = {
  revenueCatAndroidApiKey?: string;
  revenueCatIosApiKey?: string;
};

type RevenueCatEnv = {
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?: string;
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?: string;
};

declare const __DEV__: boolean;

declare const process:
  | {
      env?: RevenueCatEnv;
    }
  | undefined;

const IOS_API_KEY_PLACEHOLDER = "ios api key";
const ANDROID_API_KEY_PLACEHOLDER = "android api key";
export const DEFAULT_OFFERING_IDENTIFIER = "default";
export const ANDROID_MONTHLY_PRODUCT_IDENTIFIER =
  "com.joincovenantapp.covenant.pro.monthly:monthly";
export const PRO_ENTITLEMENT_IDS = ["covenant Pro", "covenant_pro"];

type RevenueCatOffering = NonNullable<PurchasesOfferings["current"]>;

let initialized = false;
let initPromise: Promise<boolean> | null = null;
let configuredPlatform: string | null = null;

const OFFERINGS_TIMEOUT_MS = 12000;

function warnRevenueCat(message: string, error?: unknown) {
  if (!__DEV__) {
    return;
  }

  if (error) {
    console.warn(`[RevenueCat] ${message}`, error);
    return;
  }

  console.warn(`[RevenueCat] ${message}`);
}

function getExpoExtra(): RevenueCatExtra {
  return (Constants.expoConfig?.extra ?? {}) as RevenueCatExtra;
}

function cleanApiKey(value?: string | null) {
  const apiKey = value?.trim();

  if (
    !apiKey ||
    apiKey === IOS_API_KEY_PLACEHOLDER ||
    apiKey === ANDROID_API_KEY_PLACEHOLDER
  ) {
    return null;
  }

  return apiKey;
}

function getRevenueCatApiKey() {
  const extra = getExpoExtra();

  if (Platform.OS === "ios") {
    return cleanApiKey(
      process?.env?.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ??
        extra.revenueCatIosApiKey ??
        IOS_API_KEY_PLACEHOLDER
    );
  }

  if (Platform.OS === "android") {
    return cleanApiKey(
      process?.env?.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ??
        extra.revenueCatAndroidApiKey ??
        ANDROID_API_KEY_PLACEHOLDER
    );
  }

  warnRevenueCat(`Unsupported platform: ${Platform.OS}.`);
  return null;
}

function getRevenueCatApiKeyDiagnostics() {
  const extra = getExpoExtra();

  return {
    platform: Platform.OS,
    iOSProcessEnvKeyPresent: Boolean(
      process?.env?.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    ),
    iOSExpoExtraKeyPresent: Boolean(extra.revenueCatIosApiKey),
    androidProcessEnvKeyPresent: Boolean(
      process?.env?.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
    ),
    androidExpoExtraKeyPresent: Boolean(extra.revenueCatAndroidApiKey),
    currentPlatformKeyPresent: Boolean(getRevenueCatApiKey()),
  };
}

export function hasRevenueCatApiKeyForCurrentPlatform() {
  return Boolean(getRevenueCatApiKey());
}

export function isRevenueCatConfigured() {
  return initialized;
}

export async function initRevenueCat(appUserID?: string): Promise<boolean> {
  if (initialized) {
      console.log("[RevenueCat] SDK already configured.", {
        platform: configuredPlatform ?? Platform.OS,
        requestedPlatform: Platform.OS,
      });
      return true;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const apiKey = getRevenueCatApiKey();

    if (!apiKey) {
      console.warn("[RevenueCat] Missing API key.", {
        ...getRevenueCatApiKeyDiagnostics(),
      });
      warnRevenueCat(
        "Missing RevenueCat API key. Set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY."
      );
      initPromise = null;
      return false;
    }

    try {
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({
        apiKey,
        appUserID,
      });

      initialized = true;
      configuredPlatform = Platform.OS;

      console.log("[RevenueCat] SDK configured.", {
        appUserIDPresent: Boolean(appUserID),
        ...getRevenueCatApiKeyDiagnostics(),
      });

      return true;
    } catch (error) {
      initPromise = null;
      warnRevenueCat("Could not initialize Purchases.", error);
      return false;
    }
  })();

  return initPromise;
}

async function ensureRevenueCat() {
  return initRevenueCat();
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)),
      timeoutMs
    );

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  const ready = await ensureRevenueCat();

  if (!ready) {
    return null;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    warnRevenueCat("Could not load customer info.", error);
    return null;
  }
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  const ready = await ensureRevenueCat();

  if (!ready) {
    console.warn("[RevenueCat] getOfferings skipped because SDK is not ready.", {
      configured: initialized,
      ...getRevenueCatApiKeyDiagnostics(),
    });
    return null;
  }

  try {
    console.log("[RevenueCat] Calling Purchases.getOfferings.", {
      configured: initialized,
      configuredPlatform,
      ...getRevenueCatApiKeyDiagnostics(),
    });

    const offerings = await withTimeout(
      Purchases.getOfferings(),
      OFFERINGS_TIMEOUT_MS,
      "Purchases.getOfferings"
    );

    console.log("[RevenueCat] getOfferings responded.", {
      configured: initialized,
      offeringsAllKeys: Object.keys(offerings.all),
      offeringsCurrentIdentifier: offerings.current?.identifier ?? null,
      defaultOfferingExists: Boolean(
        offerings.all[DEFAULT_OFFERING_IDENTIFIER]
      ),
      defaultAvailablePackageIdentifiers:
        offerings.all[DEFAULT_OFFERING_IDENTIFIER]?.availablePackages.map(
          (item) => item.identifier
        ) ?? [],
      defaultAvailableProductIdentifiers:
        offerings.all[DEFAULT_OFFERING_IDENTIFIER]?.availablePackages.map(
          (item) => item.product.identifier
        ) ?? [],
      defaultMonthlyExists: Boolean(
        offerings.all[DEFAULT_OFFERING_IDENTIFIER]?.monthly
      ),
      ...getRevenueCatApiKeyDiagnostics(),
    });

    return offerings;
  } catch (error) {
    console.error("[RevenueCat] Full getOfferings error object.", {
      error,
      configured: initialized,
      ...getRevenueCatApiKeyDiagnostics(),
    });
    warnRevenueCat("Could not load offerings.", error);
    return null;
  }
}

export async function purchasePackage(
  packageToPurchase: PurchasesPackage
): Promise<CustomerInfo | null> {
  const ready = await ensureRevenueCat();

  if (!ready) {
    console.warn("[RevenueCat] purchasePackage skipped because SDK is not ready.");
    throw new Error(
      "RevenueCat SDK is not ready. Check the RevenueCat API key configuration."
    );
  }

  try {
    console.log("[RevenueCat] Calling Purchases.purchasePackage.", {
      platform: Platform.OS,
      identifier: packageToPurchase.identifier,
      packageType: packageToPurchase.packageType,
      productIdentifier: packageToPurchase.product.identifier,
      priceString: packageToPurchase.product.priceString,
      title: packageToPurchase.product.title,
    });

    const { customerInfo } =
      await Purchases.purchasePackage(packageToPurchase);

    console.log("[RevenueCat] Purchases.purchasePackage responded.", {
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
    });

    return customerInfo;
  } catch (error) {
    const purchaseError = error as {
      userCancelled?: boolean;
    };

    if (purchaseError.userCancelled) {
      console.log("[RevenueCat] Purchases.purchasePackage cancelled by user.");
      return null;
    }

    console.error("[RevenueCat] Purchases.purchasePackage error.", error);
    warnRevenueCat("Purchase failed.", error);
    throw error;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  const ready = await ensureRevenueCat();

  if (!ready) {
    return null;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    warnRevenueCat("Could not restore purchases.", error);
    return null;
  }
}

export function hasProAccess(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) {
    return false;
  }

  return PRO_ENTITLEMENT_IDS.some(
    (entitlementId) =>
      customerInfo.entitlements.active[entitlementId]?.isActive === true
  );
}

export function getDefaultOffering(offerings: PurchasesOfferings | null) {
  return (
    offerings?.all[DEFAULT_OFFERING_IDENTIFIER] ??
    null
  );
}

export function getMonthlyPackageFromOffering(
  offering: RevenueCatOffering | null
): PurchasesPackage | null {
  return (
    offering?.monthly ??
    offering?.availablePackages.find(
      (item) =>
        item.identifier === "$rc_monthly" ||
        item.packageType === "MONTHLY"
    ) ??
    null
  );
}

export async function getDefaultOfferingPackages() {
  const offerings = await getOfferings();
  const offering = getDefaultOffering(offerings);

  return offering?.availablePackages ?? [];
}
