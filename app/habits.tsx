import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useFocusEffect,
  useRouter,
} from "expo-router";
import { usePostHog } from "posthog-react-native";

import CovenantBackdrop from "../components/CovenantBackdrop";
import {
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
  TERMS_OF_USE_URL,
} from "../constants/legal";

import {
  clearProgressUser,
  getProgress,
} from "../utils/progress";

import {
  clearLegacyFreeHabit,
  getOrCreateSelectedFreeHabit,
  saveSelectedFreeHabit,
} from "../utils/freeHabit";

import {
  getLanguage,
  Language,
} from "../utils/language";

import {
  ANDROID_MONTHLY_PRODUCT_IDENTIFIER,
  DEFAULT_OFFERING_IDENTIFIER,
  getDefaultOffering,
  getOfferings,
  hasProAccess,
  hasRevenueCatApiKeyForCurrentPlatform,
  initRevenueCat,
  isRevenueCatConfigured,
  purchasePackage,
  restorePurchases,
} from "../services/revenuecat";
import type {
  PurchasesPackage,
} from "react-native-purchases";

import {
  useSubscription,
} from "../context/SubscriptionContext";

import {
  useAuthStore,
} from "../store/authStore";

const COLORS = {
background: "#050505",
card: "rgba(11,10,8,0.84)",
bronze: "#b87333",
bronzeSoft: "rgba(216,140,58,0.13)",
text: "#f5f5f5",
muted: "#B8AEA4",
quiet: "#867D74",
border: "rgba(216,140,58,0.42)",
borderSoft: "rgba(255,232,200,0.10)",
panel: "rgba(8,7,6,0.74)",
panelStrong: "rgba(8,7,6,0.9)",
	};

type CovenantProPlan = "monthly";

function describePurchasePackage(packageToPurchase: PurchasesPackage | null) {
if (!packageToPurchase) {
return null;
}

return {
identifier: packageToPurchase.identifier,
packageType: packageToPurchase.packageType,
productIdentifier: packageToPurchase.product.identifier,
priceString: packageToPurchase.product.priceString,
title: packageToPurchase.product.title,
};
}

function getPurchaseAlertMessage(
error: unknown,
fallbackMessage: string
) {
const purchaseError = error as {
userCancelled?: boolean;
message?: string;
};

if (purchaseError.userCancelled) {
return null;
}

if (purchaseError.message === fallbackMessage) {
return fallbackMessage;
}

return fallbackMessage;
}

const habits = {

es: [

{
title: "Ducha fría",
slug: "coldShower",
description:
"Aprender a permanecer incluso en la incomodidad.",
},

{
title: "Ejercicio",
slug: "exercise",
description:
"La disciplina física revela disciplina interior.",
},

{
title: "Dominar mente",
slug: "dominateMind",
description:
"No todo pensamiento merece obediencia.",
},

{
title: "Fortaleza mental",
slug: "mentalStrength",
description:
"La resistencia interna se entrena.",
},

{
title: "Sin vicios",
slug: "noVices",
description:
"Aquello que no controlas termina controlándote.",
},

{
title: "Escritura",
slug: "writing",
description:
"Escribir revela lo que evitas mirar.",
},

{
title: "Gratitud",
slug: "gratitude",
description:
"La percepción cambia cuando recuerdas agradecer.",
},

{
title: "Silencio",
slug: "silence",
description:
"La quietud revela lo que el ruido esconde.",
},

{
title: "Dominio",
slug: "discipline",
description:
"La disciplina empieza donde termina el impulso.",
},

{
title: "Meditación",
slug: "meditation",
description:
"La atención también necesita entrenamiento.",
},

],

en: [

{
title: "Cold shower",
slug: "coldShower",
description:
"Learning to remain even in discomfort.",
},

{
title: "Exercise",
slug: "exercise",
description:
"Physical discipline reveals inner discipline.",
},

{
title: "Master the mind",
slug: "dominateMind",
description:
"Not every thought deserves obedience.",
},

{
title: "Mental strength",
slug: "mentalStrength",
description:
"Inner resistance must be trained.",
},

{
title: "No addictions",
slug: "noVices",
description:
"What you do not control eventually controls you.",
},

{
title: "Writing",
slug: "writing",
description:
"Writing reveals what you avoid seeing.",
},

{
title: "Gratitude",
slug: "gratitude",
description:
"Perception changes when you remember gratitude.",
},

{
title: "Silence",
slug: "silence",
description:
"Stillness reveals what noise hides.",
},

{
title: "Discipline",
slug: "discipline",
description:
"Discipline begins where impulse ends.",
},

{
title: "Meditation",
slug: "meditation",
description:
"Attention also requires training.",
},

],

};

function getFallbackFreeHabitSlugs(
progress: Record<string, any>
) {
return habits.es
.map((habit, index) => ({
slug: habit.slug,
index,
progress:
progress[habit.slug],
}))
.filter(({ progress }) =>
Boolean(
progress &&
(
(progress.completedDays || 0) > 0 ||
(progress.streak || 0) > 0 ||
(progress.sessions || 0) > 0 ||
progress.lastCompleted
)
)
)
.sort((a, b) => {
const completedDelta =
(b.progress?.completedDays || 0) -
(a.progress?.completedDays || 0);

if (completedDelta !== 0) {
return completedDelta;
}

const lastCompletedDelta =
String(b.progress?.lastCompleted || "")
.localeCompare(
String(a.progress?.lastCompleted || "")
);

if (lastCompletedDelta !== 0) {
return lastCompletedDelta;
}

return a.index - b.index;
})
.map(({ slug }) => slug);
}

export default function HabitsScreen() {

const router = useRouter();
const posthog = usePostHog();
const {
isPro,
refreshSubscription,
} = useSubscription();
const logout =
useAuthStore(
(state) => state.logout
);

const user =
useAuthStore(
(state) => state.user
);

const [
progressMap,
setProgressMap,
] = useState<any>({});

const [
language,
setLanguage,
] = useState<Language>(
"es"
);

const [
selectedFreeHabit,
setSelectedFreeHabit,
] = useState<string | null>(
null
);

const [
isFreeHabitReady,
setIsFreeHabitReady,
] = useState(false);

const [
paywallVisible,
setPaywallVisible,
] = useState(false);

const [
isPurchasing,
setIsPurchasing,
] = useState(false);

const [
purchaseErrorModal,
setPurchaseErrorModal,
] = useState<{
title: string;
message: string;
} | null>(null);

const [
isRestoring,
setIsRestoring,
] = useState(false);

const [
selectedPlan,
setSelectedPlan,
] = useState<CovenantProPlan>(
"monthly"
);

const [
selectedLockedHabit,
setSelectedLockedHabit,
	] = useState<string | null>(
	null
	);

const [
isSyncingProgress,
setIsSyncingProgress,
] = useState(false);

const mountedRef = useRef(true);

useEffect(() => {
return () => {
mountedRef.current = false;
};
}, []);

const getUserStorageKey = useCallback(() => {
if (!user) {
return null;
}

return String(user.id || user.email);
}, [user]);

const loadLanguage = useCallback(async () => {
const currentLanguage =
await getLanguage();

if (!mountedRef.current) {
return;
}

setLanguage(
currentLanguage
);
}, []);

	const loadSelectedFreeHabit = useCallback(async () => {

	setIsFreeHabitReady(false);

	try {

	const userStorageKey =
	getUserStorageKey();

	if (!userStorageKey) {
	setSelectedFreeHabit(null);
	return;
	}

	const remoteOrCachedProgress =
	await getProgress();

	const validSlugs =
	habits.es.map(
	(habit) => habit.slug
	);

	const selectedHabit =
	await getOrCreateSelectedFreeHabit(
	userStorageKey,
	getFallbackFreeHabitSlugs(
	remoteOrCachedProgress
	),
	validSlugs
	);

	if (!mountedRef.current) {
	return;
	}

	setSelectedFreeHabit(
	selectedHabit
	);

	} catch (error) {
	console.warn("[Habits] Could not hydrate selected free habit.", error);
	} finally {
	if (mountedRef.current) {
	setIsFreeHabitReady(true);
	}
	}

	}, [getUserStorageKey]);

useEffect(() => {

loadLanguage();

loadProgress();

loadSelectedFreeHabit();

	}, [loadLanguage, loadSelectedFreeHabit]);

useFocusEffect(
useCallback(() => {
loadLanguage()
.catch((error) => {
console.warn("[Habits] Could not refresh language on focus.", error);
});
}, [loadLanguage])
);

async function loadProgress() {

setIsSyncingProgress(
true
);

try {

const remoteOrCachedProgress =
await getProgress();

const allProgress =
remoteOrCachedProgress;

const currentHabits =
habits.es;

for (const habit of currentHabits) {

allProgress[
habit.slug
] =
remoteOrCachedProgress[
habit.slug
] || {
streak: 0,
completedDays: 0,
lastCompleted: null,
completionDates: [],
totalProgress: 0,
sessions: 0,
};

}

if (!mountedRef.current) {
return;
}

setProgressMap(
allProgress
);

} finally {

if (!mountedRef.current) {
return;
}

setIsSyncingProgress(
false
);

}

}

function canOpenHabit(
slug: string
) {

if (isPro) {
return currentHabits.some(
(habit) => habit.slug === slug
);
}

if (!isFreeHabitReady) {
return false;
}

return (
selectedFreeHabit ===
slug
);

}

function closePaywall() {
setIsPurchasing(false);
setIsRestoring(false);
setPurchaseErrorModal(null);
setPaywallVisible(false);
}

function closePurchaseError() {
setIsPurchasing(false);
setIsRestoring(false);
setPurchaseErrorModal(null);
}

async function openHabit(
slug: string
) {

if (!isPro && !isFreeHabitReady) {
return;
}

if (!canOpenHabit(slug)) {
await initRevenueCat();
setSelectedLockedHabit(
slug
);
setPaywallVisible(
true
);
posthog.capture("paywall_shown", {
habit_slug: slug,
is_pro: isPro,
});
return;
}

if (
!isPro &&
!selectedFreeHabit
) {
const userStorageKey =
getUserStorageKey();

if (!userStorageKey) {
return;
}

const savedHabit =
await saveSelectedFreeHabit(
userStorageKey,
slug
);

setSelectedFreeHabit(
savedHabit
);

if (savedHabit !== slug) {
await initRevenueCat();
setSelectedLockedHabit(
slug
);
setPaywallVisible(
true
);
posthog.capture("paywall_shown", {
habit_slug: slug,
is_pro: isPro,
});
return;
}
}

posthog.capture("habit_opened", {
habit_slug: slug,
is_pro: isPro,
});

router.push({
pathname:
"/habit/[habit]",

params: {
habit: slug,
},
});

}

async function handleLogout() {

setSelectedFreeHabit(null);
setIsFreeHabitReady(false);

await logout();
await clearProgressUser();
await clearLegacyFreeHabit();

router.replace(
"/auth" as never
);

}

async function openSubscriptionReviewPath() {

setSelectedLockedHabit(null);
setSelectedPlan("monthly");
await initRevenueCat();
setPaywallVisible(true);

posthog.capture("paywall_shown", {
source: "pro_card",
is_pro: isPro,
});

}

async function purchaseSelectedPlan(
plan: CovenantProPlan
) {
console.log("[Paywall] Loading RevenueCat offerings for selected plan.", {
plan,
platform: Platform.OS,
iOSRevenueCatApiKeyPresent:
Platform.OS === "ios" ? hasRevenueCatApiKeyForCurrentPlatform() : null,
androidRevenueCatApiKeyPresent:
Platform.OS === "android" ? hasRevenueCatApiKeyForCurrentPlatform() : null,
revenueCatConfigured: isRevenueCatConfigured(),
});

const offerings =
await getOfferings();

const defaultOffering =
offerings?.all[DEFAULT_OFFERING_IDENTIFIER] ?? null;

const offering =
getDefaultOffering(
offerings
);

const monthlyFromOfferingProperty =
offering?.monthly ?? null;

const monthlyByRevenueCatIdentifier =
offering?.availablePackages.find(
(item) => item.identifier === "$rc_monthly"
) ?? null;

const monthlyByPackageType =
offering?.availablePackages.find(
(item) => item.packageType === "MONTHLY"
) ?? null;

const androidMonthlyByProductIdentifier =
offering?.availablePackages.find(
(item) =>
item.product.identifier ===
ANDROID_MONTHLY_PRODUCT_IDENTIFIER
) ?? null;

const packageToPurchase =
Platform.OS === "android"
? androidMonthlyByProductIdentifier
:
monthlyFromOfferingProperty ??
monthlyByRevenueCatIdentifier ??
monthlyByPackageType ??
null;

console.log("[Paywall] RevenueCat diagnostics.", {
plan,
platform: Platform.OS,
iOSRevenueCatApiKeyPresent:
Platform.OS === "ios" ? hasRevenueCatApiKeyForCurrentPlatform() : null,
androidRevenueCatApiKeyPresent:
Platform.OS === "android" ? hasRevenueCatApiKeyForCurrentPlatform() : null,
revenueCatConfigured: isRevenueCatConfigured(),
defaultOfferingIdentifier: DEFAULT_OFFERING_IDENTIFIER,
expectedAndroidMonthlyProductIdentifier:
ANDROID_MONTHLY_PRODUCT_IDENTIFIER,
offeringsAllKeys: offerings ? Object.keys(offerings.all) : [],
offeringsCurrentIdentifier: offerings?.current?.identifier ?? null,
offeringsAllDefaultExists: Boolean(defaultOffering),
selectedOfferingIdentifier: offering?.identifier ?? null,
defaultAvailablePackageIdentifiers:
defaultOffering?.availablePackages.map((item) => item.identifier) ?? [],
defaultAvailablePackages:
defaultOffering?.availablePackages.map((item) =>
describePurchasePackage(item)
) ?? [],
defaultMonthlyExists: Boolean(defaultOffering?.monthly),
offeringMonthlyExists: Boolean(monthlyFromOfferingProperty),
rcMonthlyPackageExists: Boolean(monthlyByRevenueCatIdentifier),
monthlyPackageTypeExists: Boolean(monthlyByPackageType),
androidMonthlyProductExists: Boolean(androidMonthlyByProductIdentifier),
selectedMonthlyPackageIdentifier: packageToPurchase?.identifier ?? null,
selectedProductIdentifier: packageToPurchase?.product.identifier ?? null,
});

if (!offering) {
console.warn("[Paywall] RevenueCat default offering not found.", {
plan,
platform: Platform.OS,
reason: "offerings.all.default was not found, so no default monthly package can be selected.",
defaultOfferingIdentifier: DEFAULT_OFFERING_IDENTIFIER,
iOSRevenueCatApiKeyPresent:
Platform.OS === "ios" ? hasRevenueCatApiKeyForCurrentPlatform() : null,
androidRevenueCatApiKeyPresent:
Platform.OS === "android" ? hasRevenueCatApiKeyForCurrentPlatform() : null,
revenueCatConfigured: isRevenueCatConfigured(),
offeringsAllKeys: offerings ? Object.keys(offerings.all) : [],
offeringsCurrentIdentifier: offerings?.current?.identifier ?? null,
offeringsAllDefaultExists: Boolean(defaultOffering),
});

throw new Error(t.paywallPurchaseUnavailableText);
}

if (!packageToPurchase) {
console.warn("[Paywall] No monthly RevenueCat package available to purchase.", {
plan,
platform: Platform.OS,
reason:
Platform.OS === "android"
? "No package matched the required Android product identifier. Purchase sheet will not open."
: "No package was found through offering.monthly, identifier $rc_monthly, or packageType MONTHLY. Purchase sheet will not open.",
defaultOfferingIdentifier: DEFAULT_OFFERING_IDENTIFIER,
expectedAndroidMonthlyProductIdentifier:
ANDROID_MONTHLY_PRODUCT_IDENTIFIER,
offeringIdentifier: offering?.identifier ?? null,
offeringsAllKeys: offerings ? Object.keys(offerings.all) : [],
offeringsCurrentIdentifier: offerings?.current?.identifier ?? null,
offeringsAllDefaultExists: Boolean(defaultOffering),
defaultMonthlyExists: Boolean(defaultOffering?.monthly),
availablePackageIdentifiers:
offering?.availablePackages.map((item) => item.identifier) ?? [],
availablePackageTypes:
offering?.availablePackages.map((item) => item.packageType) ?? [],
availableProductIdentifiers:
offering?.availablePackages.map((item) => item.product.identifier) ?? [],
availablePackages:
offering?.availablePackages.map((item) =>
describePurchasePackage(item)
) ?? [],
});

throw new Error(t.paywallPurchaseUnavailableText);
}

console.log("[Paywall] Selected monthly RevenueCat package.", {
plan,
offeringIdentifier: offering.identifier,
availablePackageIdentifiers:
offering.availablePackages.map((item) => item.identifier),
selectedPackageIdentifier: packageToPurchase.identifier,
selectedPackageType: packageToPurchase.packageType,
selectedProductIdentifier: packageToPurchase.product.identifier,
selectedProductPrice: packageToPurchase.product.priceString,
});

return purchasePackage(
packageToPurchase
);
}

async function activateCovenantPro(
plan: CovenantProPlan
) {
console.log("[Paywall] Purchase button pressed.", {
plan,
});

setIsPurchasing(
true
);
setPurchaseErrorModal(null);

try {

const customerInfo =
await purchaseSelectedPlan(
plan
);

console.log("[Paywall] purchasePackage responded.", {
plan,
hasCustomerInfo: Boolean(customerInfo),
activeEntitlements: customerInfo
? Object.keys(customerInfo.entitlements.active)
: [],
});

if (!customerInfo) {
console.log("[Paywall] Purchase finished without customerInfo.", {
plan,
});
return;
}

if (
customerInfo &&
hasProAccess(
customerInfo
)
) {
await refreshSubscription();
setPaywallVisible(
false
);

posthog.capture("subscription_started", {
plan,
habit_slug: selectedLockedHabit ?? null,
});

if (selectedLockedHabit) {
router.push({
pathname:
"/habit/[habit]",

params: {
habit:
selectedLockedHabit,
},
});
}
}

} catch (error) {
console.error("[Paywall] purchasePackage error.", error);

const alertMessage =
getPurchaseAlertMessage(
error,
t.paywallPurchaseErrorText
);

if (!alertMessage) {
return;
}

if (error instanceof Error) {
posthog.capture("$exception", {
$exception_list: [
{
type: error.name,
value: error.message,
stacktrace: {
type: "raw",
frames: error.stack ?? "",
},
},
],
$exception_source: "subscription",
plan,
});
}

if (mountedRef.current) {
setPaywallVisible(false);
setPurchaseErrorModal({
title: t.paywallPurchaseErrorTitle,
message: alertMessage,
});
}

} finally {

if (!mountedRef.current) {
return;
}

setIsPurchasing(
false
);

}

}

async function handleRestorePurchases() {

setIsRestoring(
true
);

try {

const customerInfo =
await restorePurchases();

if (
customerInfo &&
hasProAccess(
customerInfo
)
) {
await refreshSubscription();
setPaywallVisible(
false
);
}

} finally {

if (!mountedRef.current) {
return;
}

setIsRestoring(
false
);

}

}

function openLegalUrl(
url: string
) {
Linking.openURL(
url
).catch(() => undefined);
}

const currentHabits =
language === "es"
? habits.es
: habits.en;

const t =
language === "es"

? {

title:
"Lo que repites termina\nconstruyéndote.",

subtitle:
"Escoge el hábito que más necesita\ndisciplina en tu vida.",

proTitle:
"Más profundidad.\nMás disciplina.\nMás claridad.",

pro1:
"• múltiples hábitos",

pro2:
"• historial completo",

pro3:
"• sesiones nocturnas",

pro4:
"• confrontaciones profundas",

	pro5:
	"• progreso extendido",

	price:
	"$1.99 USD / MES",

monthlyPlan:
"Mensual",

monthlyPrice:
"$1.99 USD / mes",

free:
"1 hábito / 24 hrs",

logout:
"CERRAR SESIÓN",

completed:
"COMPLETADO",

pending:
"PENDIENTE",

streak:
"RACHA",

locked:
"BLOQUEADO",

paywallLabel:
"COVENANT PRO",

paywallTitle:
"La profundidad completa\nrequiere compromiso.",

paywallText:
`La versión gratis abre 1 hábito cada 24 horas. Covenant Pro cuesta $1.99 USD al mes como suscripción mensual auto-renovable. Puedes cancelar cuando quieras desde ${
Platform.OS === "ios"
? "los ajustes de Apple"
: "los ajustes de suscripción de tu tienda"
}.`,

paywallButton:
"INICIAR PRO MENSUAL",

paywallLoading:
"CONECTANDO CON APPLE...",

paywallPurchaseUnavailableText:
Platform.OS === "ios"
? "Monthly Pro is temporarily unavailable. Please try again later."
: "Las compras no están disponibles temporalmente. Inténtalo de nuevo más tarde.",

paywallPurchaseErrorTitle:
Platform.OS === "ios"
? "Monthly Pro unavailable"
: "No se pudo iniciar la compra",

paywallPurchaseErrorText:
Platform.OS === "ios"
? "Monthly Pro is temporarily unavailable. Please try again later."
: "Las compras no están disponibles temporalmente. Inténtalo de nuevo más tarde.",

paywallCancel:
"VOLVER",

restore:
"RESTAURAR COMPRAS",

privacy:
"Privacidad",

terms:
"Términos de uso",

support:
"Soporte",

creator:
"EL CREADOR",

settings:
"CONFIGURACION",

subscriptionButton:
"VER SUSCRIPCION MENSUAL",

deleteAccount:
"Eliminar cuenta",

deleteAccountTitle:
"Eliminar cuenta",

deleteAccountText:
"Esto eliminara permanentemente tu cuenta, progreso y datos asociados. Ingresa tu contrasena para confirmar.",

deletePasswordPlaceholder:
"Contrasena",

deleteAccountCancel:
"CANCELAR",

deleteAccountConfirm:
"ELIMINAR CUENTA",

deleteAccountErrorTitle:
"No se pudo eliminar la cuenta",

deletePasswordRequired:
"Ingresa tu contrasena para eliminar tu cuenta.",

accountDeletedTitle:
"Cuenta eliminada",

accountDeletedText:
"Tu cuenta y progreso fueron eliminados.",

deleteAccountDone:
"OK",

processing:
"PROCESANDO",

syncing:
"SINCRONIZANDO PROGRESO",

dashboardProgress:
"PROGRESO TOTAL",

dashboardToday:
"HOY",

dashboardFocus:
"ENFOQUE",

dashboardPro:
"TODOS",

dashboardFree:
"1 HABITO",

dayUnit:
"DIAS",

todayPanelTitle:
"PANEL DE HOY",

todayPanelText:
"Completa tu practica diaria y conserva la racha viva.",

openAction:
"ABRIR",

proAction:
"PRO",

progressLabel:
"AVANCE",

}

: {

title:
"What you repeat slowly\nbecomes you.",

subtitle:
"Choose the habit that needs\nthe most discipline in your life.",

proTitle:
"More depth.\nMore discipline.\nMore clarity.",

pro1:
"• multiple habits",

pro2:
"• full history",

pro3:
"• night sessions",

pro4:
"• deeper confrontations",

	pro5:
	"• extended progress",

	price:
	"$1.99 USD / MONTH",

monthlyPlan:
"Monthly",

monthlyPrice:
"$1.99 USD / month",

free:
"1 habit / 24 hrs",

logout:
"SIGN OUT",

completed:
"COMPLETED",

pending:
"PENDING",

streak:
"STREAK",

locked:
"LOCKED",

paywallLabel:
"COVENANT PRO",

paywallTitle:
"Full depth\nrequires commitment.",

paywallText:
`The free version opens 1 habit every 24 hours. Covenant Pro is $1.99 USD per month as an auto-renewing monthly subscription. Cancel anytime through ${
Platform.OS === "ios"
? "Apple settings"
: "your app store subscription settings"
}.`,

paywallButton:
"START MONTHLY PRO",

paywallLoading:
"CONNECTING TO APPLE...",

paywallPurchaseUnavailableText:
Platform.OS === "ios"
? "Monthly Pro is temporarily unavailable. Please try again later."
: "Purchases are temporarily unavailable. Please try again later.",

paywallPurchaseErrorTitle:
Platform.OS === "ios"
? "Monthly Pro unavailable"
: "Could not start purchase",

paywallPurchaseErrorText:
Platform.OS === "ios"
? "Monthly Pro is temporarily unavailable. Please try again later."
: "Purchases are temporarily unavailable. Please try again later.",

paywallCancel:
"RETURN",

restore:
"RESTORE PURCHASES",

privacy:
"Privacy",

terms:
"Terms of Use",

support:
"Support",

creator:
"THE CREATOR",

settings:
"SETTINGS",

subscriptionButton:
"VIEW MONTHLY SUBSCRIPTION",

deleteAccount:
"Delete Account",

deleteAccountTitle:
"Delete Account",

deleteAccountText:
"This will permanently delete your account, progress, and associated data. Enter your password to confirm.",

deletePasswordPlaceholder:
"Password",

deleteAccountCancel:
"CANCEL",

deleteAccountConfirm:
"DELETE ACCOUNT",

deleteAccountErrorTitle:
"Could not delete account",

deletePasswordRequired:
"Enter your password to delete your account.",

accountDeletedTitle:
"Account deleted",

accountDeletedText:
"Your account and progress were deleted.",

deleteAccountDone:
"OK",

processing:
"PROCESSING",

syncing:
"SYNCING PROGRESS",

dashboardProgress:
"TOTAL PROGRESS",

dashboardToday:
"TODAY",

dashboardFocus:
"FOCUS",

dashboardPro:
"ALL",

dashboardFree:
"1 HABIT",

dayUnit:
"DAYS",

todayPanelTitle:
"TODAY PANEL",

todayPanelText:
"Complete your daily practice and keep the streak alive.",

openAction:
"OPEN",

proAction:
"PRO",

progressLabel:
"PROGRESS",

};

const today =
new Date()
.toISOString()
.split("T")[0];

const totalCompletedDays =
currentHabits.reduce(
(sum, habit) =>
sum +
(progressMap[habit.slug]?.completedDays || 0),
0
);

const completedTodayCount =
currentHabits.filter(
(habit) =>
progressMap[habit.slug]?.lastCompleted === today
).length;

const averageProgress =
Math.min(
Math.round(
totalCompletedDays /
Math.max(currentHabits.length * 30, 1) *
100
),
100
);

return (

	<View style={styles.container}>

	<CovenantBackdrop intensity="strong" variant="habits" />

	<ScrollView
showsVerticalScrollIndicator={
false
}
contentContainerStyle={{
paddingBottom: 180,
}}
>

<View style={styles.headerRow}>

<Text style={styles.topLabel}>
COVENANT
</Text>

<TouchableOpacity
activeOpacity={0.78}
onPress={handleLogout}
style={styles.logoutButton}
>

<Text style={styles.logoutText}>
{t.logout}
</Text>

</TouchableOpacity>

</View>

<Text style={styles.title}>
{t.title}
</Text>

<Text style={styles.subtitle}>
{t.subtitle}
</Text>

<View style={styles.dashboardCard}>
<View style={styles.dashboardMetric}>
<Text style={styles.dashboardLabel}>
{t.dashboardProgress}
</Text>
<Text style={styles.dashboardValue}>
{averageProgress}%
</Text>
</View>

<View style={styles.dashboardDivider} />

<View style={styles.dashboardMetric}>
<Text style={styles.dashboardLabel}>
{t.dashboardToday}
</Text>
<Text style={styles.dashboardValue}>
{completedTodayCount}/{currentHabits.length}
</Text>
</View>

<View style={styles.dashboardDivider} />

<View style={styles.dashboardMetric}>
<Text style={styles.dashboardLabel}>
{t.dashboardFocus}
</Text>
<Text style={styles.dashboardValue}>
{isPro ? t.dashboardPro : t.dashboardFree}
</Text>
</View>
</View>

<View style={styles.proCard}>

<Text style={styles.proMini}>
COVENANT PRO
</Text>

<Text style={styles.proTitle}>
{t.proTitle}
</Text>

<View style={styles.divider} />

<Text style={styles.proText}>
{t.pro1}
</Text>

<Text style={styles.proText}>
{t.pro2}
</Text>

<Text style={styles.proText}>
{t.pro3}
</Text>

<Text style={styles.proText}>
{t.pro4}
</Text>

<Text style={styles.proText}>
{t.pro5}
</Text>

	<Text style={styles.price}>
	{t.price}
	</Text>

<TouchableOpacity
activeOpacity={0.84}
onPress={openSubscriptionReviewPath}
style={styles.subscriptionButton}
>
<Text style={styles.subscriptionButtonText}>
{t.subscriptionButton}
</Text>
</TouchableOpacity>

</View>

<View style={styles.todayPanel}>
<View>
<Text style={styles.todayPanelLabel}>
{t.todayPanelTitle}
</Text>
<Text style={styles.todayPanelText}>
{t.todayPanelText}
</Text>
</View>

<View style={styles.todayPanelBadge}>
<Text style={styles.todayPanelBadgeValue}>
{completedTodayCount}
</Text>
<Text style={styles.todayPanelBadgeLabel}>
{t.completed}
</Text>
</View>
</View>

{isSyncingProgress && (

<View style={styles.syncStrip}>

<ActivityIndicator
color={COLORS.bronze}
size="small"
/>

<Text style={styles.syncText}>
{t.syncing}
</Text>

</View>

)}

{currentHabits.map((habit) => {

const progress =
progressMap[
habit.slug
];

const streak =
progress?.streak || 0;

const completedDays =
progress?.completedDays || 0;

const completedToday =
progress?.lastCompleted ===
today;

const habitPercent =
Math.min(
Math.round(
(completedDays / 30) *
100
),
100
);

const locked =
!canOpenHabit(
habit.slug
);

return (

<TouchableOpacity
key={habit.slug}
activeOpacity={0.88}
onPress={() =>
openHabit(
habit.slug
)
}
style={[

styles.habitCard,

completedToday && {
borderColor:
COLORS.border,

backgroundColor:
"rgba(184,115,51,0.06)",
},

locked && {
opacity: 0.62,
},

]}
>

{locked && (

<View
style={
styles.lockBadge
}
>

<Text
style={
styles.lockBadgeText
}
>
{t.locked}
</Text>

</View>

)}

<View style={styles.habitTopRow}>
<View style={styles.habitIdentity}>
<Text
style={
styles.habitTitle
}
>
{habit.title}
</Text>

<Text
style={
styles.habitDescription
}
>
{
habit.description
}
</Text>
</View>

<View style={[
styles.actionBadge,
locked && styles.actionBadgeLocked,
completedToday && styles.actionBadgeComplete,
]}>
<Text style={[
styles.actionBadgeText,
locked && styles.actionBadgeTextLocked,
]}>
{locked ? t.proAction : t.openAction}
</Text>
</View>
</View>

<View
style={
styles.statusRow
}
>

<Text
style={[

styles.status,

completedToday && {
color:
COLORS.bronze,
},

]}
>

{
completedToday

? t.completed

: t.pending
}

</Text>

<Text
style={
styles.streak
}
>
{t.streak} {streak}
</Text>

</View>

<View style={styles.progressHeaderRow}>
<Text style={styles.progressLabel}>
{t.progressLabel}
</Text>
<Text style={styles.progressPercentText}>
{habitPercent}%
</Text>
</View>

<View
style={
styles.progressContainer
}
>

<View
style={[
styles.progressBar,

{
width: `${
habitPercent
}%`,
shadowOpacity:
0.16 + habitPercent / 260,
},

]}
/>

</View>

<View style={styles.progressMetaRow}>

<Text
style={
styles.progressText
}
>
{completedDays}/30 {t.dayUnit}
</Text>

</View>

</TouchableOpacity>

);

})}

<View style={styles.accountLinks}>
<TouchableOpacity
activeOpacity={0.72}
onPress={() => openLegalUrl(PRIVACY_POLICY_URL)}
>
<Text style={styles.accountLinkText}>{t.privacy}</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.72}
onPress={() => openLegalUrl(TERMS_OF_USE_URL)}
>
<Text style={styles.accountLinkText}>{t.terms}</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.72}
onPress={() => openLegalUrl(SUPPORT_URL)}
>
<Text style={styles.accountLinkText}>{t.support}</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.72}
onPress={() => router.push("/creator" as never)}
style={styles.creatorLink}
>
<Text style={styles.creatorLinkText}>{t.creator}</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.72}
onPress={() => router.push("/settings" as never)}
style={styles.settingsLink}
>
<Text style={styles.settingsLinkText}>{t.settings}</Text>
</TouchableOpacity>
</View>

</ScrollView>

<Modal
visible={
paywallVisible
}
transparent
animationType="fade"
onRequestClose={closePaywall}
>

<View
style={
styles.paywallOverlay
}
>

<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={styles.paywallScroll}
>

<View
style={
styles.paywallPanel
}
>

<Text
style={
styles.paywallLabel
}
>
{t.paywallLabel}
</Text>

<Text
style={
styles.paywallTitle
}
>
{t.paywallTitle}
</Text>

<View
style={
styles.paywallLine
}
/>

<Text
style={
styles.paywallText
}
>
{t.paywallText}
</Text>

<View style={styles.paywallFeatureGrid}>
<View style={styles.paywallFeaturePill}>
<Text style={styles.paywallFeatureText}>
{t.pro1.replace("• ", "")}
</Text>
</View>
<View style={styles.paywallFeaturePill}>
<Text style={styles.paywallFeatureText}>
{t.pro2.replace("• ", "")}
</Text>
</View>
<View style={styles.paywallFeaturePill}>
<Text style={styles.paywallFeatureText}>
{t.pro5.replace("• ", "")}
</Text>
</View>
</View>

<View style={styles.planRow}>

<TouchableOpacity
activeOpacity={0.84}
onPress={() =>
setSelectedPlan(
"monthly"
)
}
disabled={
isPurchasing
}
style={[
styles.planOption,
selectedPlan === "monthly" &&
styles.planOptionActive,
]}
>

<Text
style={[
styles.planName,
selectedPlan === "monthly" &&
styles.planNameActive,
]}
>
{t.monthlyPlan}
</Text>

<Text
style={[
styles.planPrice,
selectedPlan === "monthly" &&
styles.planPriceActive,
]}
>
{t.monthlyPrice}
</Text>

</TouchableOpacity>

</View>

<TouchableOpacity
activeOpacity={0.86}
onPress={
() => activateCovenantPro(
selectedPlan
)
}
disabled={
isPurchasing
}
style={[
styles.paywallButton,
isPurchasing && {
opacity: 0.72,
},
]}
>

{isPurchasing ? (

<View style={styles.paywallLoadingRow}>
<ActivityIndicator
color={
COLORS.background
}
/>
<Text style={styles.paywallLoadingText}>
{t.paywallLoading}
</Text>
</View>

) : (

<Text
style={
styles.paywallButtonText
}
>
{t.paywallButton}
</Text>

)}

</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.72}
onPress={handleRestorePurchases}
disabled={
isPurchasing ||
isRestoring
}
style={
styles.restoreButton
}
>

<Text
style={
styles.restoreText
}
>
{isRestoring
? t.processing
: t.restore}
</Text>

</TouchableOpacity>

<View style={styles.paywallLegalLinks}>
<TouchableOpacity
activeOpacity={0.72}
onPress={() => openLegalUrl(PRIVACY_POLICY_URL)}
>
<Text style={styles.paywallLegalText}>{t.privacy}</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.72}
onPress={() => openLegalUrl(TERMS_OF_USE_URL)}
>
<Text style={styles.paywallLegalText}>{t.terms}</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.72}
onPress={() => openLegalUrl(SUPPORT_URL)}
>
<Text style={styles.paywallLegalText}>{t.support}</Text>
</TouchableOpacity>
</View>

<TouchableOpacity
activeOpacity={0.72}
onPress={closePaywall}
style={
styles.paywallCancel
}
>

<Text
style={
styles.paywallCancelText
}
>
{t.paywallCancel}
</Text>

</TouchableOpacity>

</View>

</ScrollView>

</View>

</Modal>

<Modal
visible={Boolean(purchaseErrorModal)}
transparent
animationType="fade"
onRequestClose={closePurchaseError}
>
<View style={styles.purchaseErrorOverlay}>
<View style={styles.purchaseErrorPanel}>
<Text style={styles.purchaseErrorLabel}>
COVENANT PRO
</Text>

<Text style={styles.purchaseErrorTitle}>
{purchaseErrorModal?.title}
</Text>

<View style={styles.purchaseErrorLine} />

<Text style={styles.purchaseErrorBody}>
{purchaseErrorModal?.message}
</Text>

<TouchableOpacity
activeOpacity={0.82}
onPress={() =>
closePurchaseError()
}
style={styles.purchaseErrorButton}
>
<Text style={styles.purchaseErrorButtonText}>
{t.paywallCancel}
</Text>
</TouchableOpacity>
</View>
</View>
</Modal>

</View>

);

}

const styles = StyleSheet.create({

container: {
flex: 1,
backgroundColor:
COLORS.background,
paddingHorizontal: 22,
paddingTop: 62,
},

headerRow: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
marginBottom: 34,
gap: 14,
},

topLabel: {
color: COLORS.bronze,
letterSpacing: 11,
fontSize: 10,
textAlign: "left",
flexShrink: 1,
},

logoutButton: {
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 999,
paddingHorizontal: 14,
paddingVertical: 10,
backgroundColor:
"rgba(10,8,6,0.64)",
shadowColor:
COLORS.bronze,
shadowOpacity: 0.12,
shadowRadius: 18,
shadowOffset: {
width: 0,
height: 8,
},
},

logoutText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 2,
fontWeight: "600",
},

title: {
color: COLORS.text,
fontSize: 42,
lineHeight: 56,
textAlign: "center",
fontWeight: "300",
marginBottom: 24,
},

subtitle: {
color: COLORS.muted,
fontSize: 18,
lineHeight: 31,
textAlign: "center",
marginBottom: 24,
paddingHorizontal: 4,
},

dashboardCard: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
backgroundColor:
"rgba(9,8,7,0.72)",
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.30)",
borderRadius: 24,
paddingVertical: 18,
paddingHorizontal: 16,
marginBottom: 26,
shadowColor:
COLORS.bronze,
shadowOpacity: 0.2,
shadowRadius: 30,
shadowOffset: {
width: 0,
height: 16,
},
elevation: 7,
},

dashboardMetric: {
flex: 1,
alignItems: "center",
gap: 8,
},

dashboardLabel: {
color: COLORS.quiet,
fontSize: 9,
letterSpacing: 2.2,
fontWeight: "700",
textAlign: "center",
},

dashboardValue: {
color: COLORS.text,
fontSize: 18,
lineHeight: 24,
fontWeight: "600",
textAlign: "center",
},

dashboardDivider: {
width: 1,
height: 38,
backgroundColor:
"rgba(255,232,200,0.12)",
},

proCard: {
backgroundColor:
"rgba(13,10,8,0.80)",
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 24,
padding: 24,
marginBottom: 30,
shadowColor:
COLORS.bronze,
shadowOpacity: 0.18,
shadowRadius: 42,
shadowOffset: {
width: 0,
height: 18,
},
elevation: 8,
},

proMini: {
color: COLORS.bronze,
letterSpacing: 8,
fontSize: 10,
marginBottom: 22,
},

proTitle: {
color: COLORS.text,
fontSize: 28,
lineHeight: 40,
fontWeight: "300",
marginBottom: 26,
},

divider: {
height: 1,
backgroundColor:
"rgba(255,232,200,0.14)",
marginBottom: 26,
},

proText: {
color: COLORS.text,
fontSize: 16,
lineHeight: 28,
marginBottom: 8,
fontWeight: "300",
},

price: {
color: COLORS.text,
marginTop: 28,
fontSize: 16,
letterSpacing: 5,
},

subscriptionButton: {
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 999,
alignItems: "center",
justifyContent: "center",
paddingVertical: 13,
paddingHorizontal: 16,
marginTop: 22,
backgroundColor:
"rgba(216,140,58,0.16)",
shadowColor:
COLORS.bronze,
shadowOpacity: 0.16,
shadowRadius: 18,
shadowOffset: {
width: 0,
height: 10,
},
},

subscriptionButtonText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 2.4,
fontWeight: "600",
textAlign: "center",
},

todayPanel: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
gap: 18,
backgroundColor:
"rgba(16,13,10,0.78)",
borderWidth: 1,
borderColor:
"rgba(255,232,200,0.13)",
borderRadius: 22,
padding: 20,
marginBottom: 24,
shadowColor:
COLORS.bronze,
shadowOpacity: 0.14,
shadowRadius: 26,
shadowOffset: {
width: 0,
height: 14,
},
elevation: 5,
},

todayPanelLabel: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 3,
fontWeight: "800",
marginBottom: 8,
},

todayPanelText: {
color: "#D5C9BD",
fontSize: 15,
lineHeight: 23,
maxWidth: 220,
},

todayPanelBadge: {
width: 72,
height: 72,
borderRadius: 36,
alignItems: "center",
justifyContent: "center",
borderWidth: 1,
borderColor:
COLORS.border,
backgroundColor:
"rgba(216,140,58,0.13)",
},

todayPanelBadgeValue: {
color: COLORS.text,
fontSize: 24,
fontWeight: "700",
lineHeight: 29,
},

todayPanelBadgeLabel: {
color: COLORS.bronze,
fontSize: 8,
letterSpacing: 1.4,
fontWeight: "700",
},

habitCard: {
backgroundColor:
"rgba(12,11,10,0.82)",
borderRadius: 22,
padding: 22,
marginBottom: 18,
borderWidth: 1,
borderColor:
"rgba(255,232,200,0.14)",
position: "relative",
shadowColor:
COLORS.bronze,
shadowOpacity: 0.12,
shadowRadius: 28,
shadowOffset: {
width: 0,
height: 14,
},
elevation: 5,
},

habitTopRow: {
flexDirection: "row",
alignItems: "flex-start",
justifyContent: "space-between",
gap: 14,
},

habitIdentity: {
flex: 1,
},

actionBadge: {
minWidth: 58,
borderRadius: 999,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.52)",
backgroundColor:
"rgba(216,140,58,0.16)",
paddingHorizontal: 12,
paddingVertical: 8,
alignItems: "center",
},

actionBadgeLocked: {
borderColor:
"rgba(255,232,200,0.16)",
backgroundColor:
"rgba(255,255,255,0.045)",
},

actionBadgeComplete: {
backgroundColor:
"rgba(63,175,98,0.16)",
borderColor:
"rgba(111,222,145,0.42)",
},

actionBadgeText: {
color: COLORS.bronze,
fontSize: 9,
letterSpacing: 1.8,
fontWeight: "800",
},

actionBadgeTextLocked: {
color: COLORS.quiet,
},

lockBadge: {
position: "absolute",
top: 24,
right: 18,
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 999,
paddingHorizontal: 12,
paddingVertical: 7,
backgroundColor:
"rgba(12,10,8,0.84)",
},

lockBadgeText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 2,
},

habitTitle: {
color: COLORS.text,
fontSize: 25,
marginBottom: 14,
fontWeight: "300",
paddingRight: 0,
},

habitDescription: {
color: "#BDB2A8",
fontSize: 16,
lineHeight: 27,
marginBottom: 22,
},

statusRow: {
flexDirection: "row",
justifyContent:
"space-between",
alignItems: "center",
marginBottom: 16,
gap: 12,
},

status: {
color: COLORS.muted,
fontSize: 12,
letterSpacing: 3,
flexShrink: 1,
},

streak: {
color: COLORS.muted,
fontSize: 12,
letterSpacing: 2,
flexShrink: 0,
},

progressContainer: {
height: 8,
backgroundColor:
"rgba(255,255,255,0.10)",
borderRadius: 999,
overflow: "hidden",
marginBottom: 14,
},

progressHeaderRow: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
marginBottom: 10,
},

progressLabel: {
color: COLORS.quiet,
fontSize: 10,
letterSpacing: 2.6,
fontWeight: "700",
},

progressBar: {
height: "100%",
backgroundColor:
"#D88C3A",
borderRadius: 999,
shadowColor:
"#D88C3A",
shadowRadius: 12,
shadowOffset: {
width: 0,
height: 0,
},
elevation: 3,
},

progressMetaRow: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
},

progressText: {
color: "#D4C8BB",
fontSize: 13,
letterSpacing: 3,
},

progressPercentText: {
color: COLORS.bronze,
fontSize: 12,
letterSpacing: 2.6,
fontWeight: "600",
},

syncStrip: {
alignSelf: "center",
flexDirection: "row",
alignItems: "center",
gap: 10,
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 999,
paddingHorizontal: 16,
paddingVertical: 10,
marginBottom: 26,
backgroundColor:
"rgba(10,8,6,0.72)",
},

syncText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 3,
},

accountLinks: {
alignItems: "center",
gap: 14,
paddingTop: 24,
paddingBottom: 8,
},

accountLinkText: {
color: COLORS.quiet,
fontSize: 12,
letterSpacing: 2,
},

creatorLink: {
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 999,
paddingHorizontal: 18,
paddingVertical: 12,
marginTop: 8,
backgroundColor:
"rgba(216,140,58,0.10)",
shadowColor:
COLORS.bronze,
shadowOpacity: 0.12,
shadowRadius: 16,
shadowOffset: {
width: 0,
height: 8,
},
},

creatorLinkText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 3,
},

settingsLink: {
paddingVertical: 12,
paddingHorizontal: 18,
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 999,
backgroundColor:
"rgba(216,140,58,0.10)",
},

settingsLinkText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 3,
fontWeight: "700",
},

purchaseErrorOverlay: {
flex: 1,
backgroundColor:
"rgba(0,0,0,0.8)",
paddingHorizontal: 24,
alignItems: "center",
justifyContent: "center",
},

purchaseErrorPanel: {
width: "100%",
backgroundColor:
COLORS.panelStrong,
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 24,
padding: 28,
shadowColor:
COLORS.bronze,
shadowOpacity: 0.22,
shadowRadius: 34,
shadowOffset: {
width: 0,
height: 18,
},
elevation: 10,
},

purchaseErrorLabel: {
color: COLORS.bronze,
letterSpacing: 7,
fontSize: 10,
marginBottom: 20,
},

purchaseErrorTitle: {
color: COLORS.text,
fontSize: 25,
lineHeight: 34,
fontWeight: "300",
marginBottom: 18,
},

purchaseErrorLine: {
height: 1,
backgroundColor:
COLORS.border,
marginBottom: 20,
},

purchaseErrorBody: {
color: COLORS.muted,
fontSize: 15,
lineHeight: 25,
marginBottom: 24,
},

purchaseErrorButton: {
height: 54,
borderRadius: 999,
backgroundColor:
COLORS.bronze,
alignItems: "center",
justifyContent: "center",
shadowColor:
COLORS.bronze,
shadowOpacity: 0.2,
shadowRadius: 18,
shadowOffset: {
width: 0,
height: 10,
},
},

purchaseErrorButtonText: {
color: COLORS.background,
fontSize: 11,
letterSpacing: 3,
fontWeight: "700",
},

paywallOverlay: {
flex: 1,
backgroundColor:
"rgba(0,0,0,0.76)",
paddingHorizontal: 24,
},

paywallScroll: {
flexGrow: 1,
justifyContent: "center",
paddingVertical: 32,
},

paywallPanel: {
width: "100%",
backgroundColor:
COLORS.panelStrong,
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 28,
padding: 30,
shadowColor:
COLORS.bronze,
shadowOpacity: 0.24,
shadowRadius: 42,
shadowOffset: {
width: 0,
height: 18,
},
elevation: 10,
},

paywallLabel: {
color: COLORS.bronze,
letterSpacing: 8,
fontSize: 11,
marginBottom: 26,
},

paywallTitle: {
color: COLORS.text,
fontSize: 28,
lineHeight: 38,
fontWeight: "300",
marginBottom: 24,
},

paywallLine: {
height: 1,
backgroundColor:
COLORS.border,
marginBottom: 26,
},

paywallText: {
color: "#C4B8AC",
fontSize: 15,
lineHeight: 26,
marginBottom: 18,
},

paywallFeatureGrid: {
flexDirection: "row",
flexWrap: "wrap",
gap: 10,
marginBottom: 22,
},

paywallFeaturePill: {
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.28)",
borderRadius: 999,
paddingHorizontal: 12,
paddingVertical: 8,
backgroundColor:
"rgba(216,140,58,0.08)",
},

paywallFeatureText: {
color: "#E7D7C6",
fontSize: 11,
letterSpacing: 1,
fontWeight: "600",
},

planRow: {
flexDirection: "column",
gap: 12,
marginBottom: 22,
},

planOption: {
flex: 1,
borderWidth: 1,
borderColor:
"rgba(255,232,200,0.12)",
borderRadius: 16,
paddingVertical: 16,
paddingHorizontal: 12,
backgroundColor:
"rgba(255,255,255,0.045)",
},

planOptionActive: {
borderColor:
COLORS.border,
backgroundColor:
COLORS.bronzeSoft,
},

planName: {
color: COLORS.muted,
fontSize: 12,
letterSpacing: 2,
fontWeight: "600",
marginBottom: 10,
},

planNameActive: {
color: COLORS.bronze,
},

planPrice: {
color: COLORS.text,
fontSize: 15,
lineHeight: 22,
},

planPriceActive: {
color: COLORS.text,
},

paywallButton: {
height: 58,
borderRadius: 999,
backgroundColor:
"#D88C3A",
alignItems: "center",
justifyContent: "center",
marginBottom: 18,
shadowColor:
"#D88C3A",
shadowOpacity: 0.34,
shadowRadius: 22,
shadowOffset: {
width: 0,
height: 12,
},
},

paywallButtonText: {
color: COLORS.background,
fontSize: 12,
letterSpacing: 2.4,
fontWeight: "600",
textAlign: "center",
paddingHorizontal: 16,
},

paywallLoadingRow: {
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
gap: 10,
},

paywallLoadingText: {
color: COLORS.background,
fontSize: 10,
letterSpacing: 1.8,
fontWeight: "800",
},

restoreButton: {
alignItems: "center",
paddingVertical: 11,
},

restoreText: {
color: COLORS.bronze,
fontSize: 11,
letterSpacing: 3,
},

paywallLegalLinks: {
flexDirection: "row",
flexWrap: "wrap",
justifyContent: "center",
gap: 14,
paddingVertical: 8,
},

paywallLegalText: {
color: COLORS.quiet,
fontSize: 11,
letterSpacing: 1.4,
},

paywallCancel: {
alignItems: "center",
paddingVertical: 12,
},

paywallCancelText: {
color: COLORS.muted,
fontSize: 12,
letterSpacing: 4,
},

});
