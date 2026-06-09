import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
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
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { usePostHog } from "posthog-react-native";
import { captureRef } from "react-native-view-shot";

import CovenantBackdrop from "../components/CovenantBackdrop";
import {
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
  TERMS_OF_USE_URL,
} from "../constants/legal";
import {
  OracleNumberDraw,
  OracleCounselDraw,
  OracleTarotDraw,
  getDailyNumberDraw,
  getDailyCounselDraw,
  getDailyTarotDraw,
  getOracleUserKey,
  revealDailyCounselDraw,
  revealDailyNumberDraw,
  revealDailyTarotDraw,
} from "../utils/oracle";

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
import { getLocalDateKey } from "../utils/dates";

import {
  ANDROID_MONTHLY_PRODUCT_IDENTIFIER,
  DEFAULT_OFFERING_IDENTIFIER,
  IOS_MONTHLY_PRODUCT_IDENTIFIER,
  getDefaultOffering,
  getMonthlyPackageFromOffering,
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
import type {
  TarotVisualSymbol,
} from "../data/oracle";

import {
  useAuthStore,
} from "../store/authStore";

import {
  getGuestStorageKey,
} from "../utils/guestMode";

function localize(
value: {
en: string;
es: string;
},
language: Language
) {
return language === "es"
? value.es
: value.en;
}

function TarotSigil({
symbol,
}: {
symbol: TarotVisualSymbol;
}) {
return (
<View style={styles.tarotSigil}>
<View style={styles.tarotSigilOrbit} />
<View style={styles.tarotSigilOrbitTilt} />
{(symbol === "moon" || symbol === "veil" || symbol === "threshold") && (
<View style={styles.tarotSigilCrescent} />
)}
{(symbol === "sun" || symbol === "star" || symbol === "world") && (
<View style={styles.tarotSigilRay} />
)}
<View style={styles.tarotSigilCore} />
</View>
);
}

function DailyTarotArtwork({
card,
language,
}: {
card: OracleTarotDraw;
language: Language;
}) {
return (
<View style={styles.tarotArtwork}>
<View style={styles.tarotCornerTopLeft} />
<View style={styles.tarotCornerTopRight} />
<View style={styles.tarotCornerBottomLeft} />
<View style={styles.tarotCornerBottomRight} />
<Text style={styles.tarotArtworkRoman}>{card.romanNumeral}</Text>
<TarotSigil symbol={card.visualSymbol} />
<Text style={styles.tarotArtworkName}>
{localize(card.name, language)}
</Text>
</View>
);
}

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
const params = useLocalSearchParams<{
showPaywall?: string;
}>();
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

const isGuest =
!user;

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
dailyNumberDraw,
setDailyNumberDraw,
] = useState<OracleNumberDraw | null>(
null
);

const [
dailyTarotDraw,
setDailyTarotDraw,
] = useState<OracleTarotDraw | null>(
null
);

const [
dailyCounselDraw,
setDailyCounselDraw,
] = useState<OracleCounselDraw | null>(
null
);

const [
isRevealingGuidance,
setIsRevealingGuidance,
] = useState(false);

const [
isSharingProgress,
setIsSharingProgress,
] = useState(false);

const [
isShareCardMounted,
setIsShareCardMounted,
] = useState(false);

const [
oracleModalVisible,
setOracleModalVisible,
] = useState(false);

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
isPaywallLoading,
setIsPaywallLoading,
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
paywallPackage,
setPaywallPackage,
] = useState<PurchasesPackage | null>(null);

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
const shareCardRef = useRef<View | null>(null);
const shareCardLayoutResolverRef = useRef<(() => void) | null>(null);

useEffect(() => {
return () => {
mountedRef.current = false;
};
}, []);

const getUserStorageKey = useCallback(() => {
if (!user) {
return getGuestStorageKey();
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

const loadOracleSummary = useCallback(async () => {
const userStorageKey =
getUserStorageKey();

const oracleUserKey =
await getOracleUserKey(
userStorageKey
);

const [
numberDraw,
tarotDraw,
counselDraw,
] =
await Promise.all([
getDailyNumberDraw(
oracleUserKey
),
getDailyTarotDraw(
oracleUserKey
),
getDailyCounselDraw(
oracleUserKey
),
]);

if (!mountedRef.current) {
return;
}

setDailyNumberDraw(
numberDraw
);
setDailyTarotDraw(
tarotDraw
);
setDailyCounselDraw(
counselDraw
);
}, [getUserStorageKey]);

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

loadOracleSummary();

	}, [loadLanguage, loadOracleSummary, loadSelectedFreeHabit]);

useEffect(() => {
if (params.showPaywall !== "oracle") {
return;
}

setSelectedLockedHabit(null);
setSelectedPlan("monthly");
initRevenueCat().catch(() => undefined);
setPaywallVisible(true);
}, [params.showPaywall]);

useFocusEffect(
useCallback(() => {
loadLanguage()
.catch((error) => {
console.warn("[Habits] Could not refresh language on focus.", error);
});

loadProgress()
.catch((error) => {
console.warn("[Habits] Could not refresh progress on focus.", error);
});

loadOracleSummary()
.catch((error) => {
console.warn("[Habits] Could not refresh oracle on focus.", error);
});

}, [loadLanguage, loadOracleSummary])
);

async function loadProgress() {

setIsSyncingProgress(
true
);

try {

const remoteOrCachedProgress =
await getProgress();

const allProgress = {
...remoteOrCachedProgress,
};

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
setIsPaywallLoading(false);
setIsRestoring(false);
setPurchaseErrorModal(null);
setPaywallPackage(null);
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

if (!user) {
router.push(
"/auth" as never
);
return;
}

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

const loadSelectedMonthlyPackage = useCallback(async () => {
setIsPaywallLoading(true);

try {
const offerings =
await getOfferings();

const defaultOffering =
offerings?.all[DEFAULT_OFFERING_IDENTIFIER] ?? null;

const offering =
getDefaultOffering(
offerings
);

const resolvedMonthlyPackage =
getMonthlyPackageFromOffering(
offering
);

if (mountedRef.current) {
setPaywallPackage(
resolvedMonthlyPackage
);
}

if (!offering) {
console.warn("[Paywall] RevenueCat default offering not found.", {
platform: Platform.OS,
reason: "offerings.all.default was not found, so no default monthly package can be selected.",
defaultOfferingIdentifier: DEFAULT_OFFERING_IDENTIFIER,
revenueCatReady: isRevenueCatConfigured(),
iosKeyPresent:
Platform.OS === "ios" ? hasRevenueCatApiKeyForCurrentPlatform() : null,
iOSRevenueCatApiKeyPresent:
Platform.OS === "ios" ? hasRevenueCatApiKeyForCurrentPlatform() : null,
androidRevenueCatApiKeyPresent:
Platform.OS === "android" ? hasRevenueCatApiKeyForCurrentPlatform() : null,
revenueCatConfigured: isRevenueCatConfigured(),
offeringsAllKeys: offerings ? Object.keys(offerings.all) : [],
offeringsCurrentIdentifier: offerings?.current?.identifier ?? null,
offeringsAllDefaultExists: Boolean(defaultOffering),
});

return null;
}

if (!resolvedMonthlyPackage) {
console.warn("[Paywall] No monthly RevenueCat package available to purchase.", {
platform: Platform.OS,
reason:
Platform.OS === "android"
? "No package matched the required Android product identifier. Purchase sheet will not open."
: "No package matched the required iOS product identifier or monthly fallback. Purchase sheet will not open.",
defaultOfferingIdentifier: DEFAULT_OFFERING_IDENTIFIER,
expectedAndroidMonthlyProductIdentifier:
ANDROID_MONTHLY_PRODUCT_IDENTIFIER,
expectedIosMonthlyProductIdentifier:
IOS_MONTHLY_PRODUCT_IDENTIFIER,
offeringIdentifier: offering?.identifier ?? null,
offeringsAllKeys: offerings ? Object.keys(offerings.all) : [],
offeringsKeys: offerings ? Object.keys(offerings.all) : [],
offeringsCurrentIdentifier: offerings?.current?.identifier ?? null,
offeringsAllDefaultExists: Boolean(defaultOffering),
defaultMonthlyExists: Boolean(defaultOffering?.monthly),
availablePackageIdentifiers:
offering?.availablePackages.map((item) => item.identifier) ?? [],
availablePackageTypes:
offering?.availablePackages.map((item) => item.packageType) ?? [],
availableProductIdentifiers:
offering?.availablePackages.map((item) => item.product.identifier) ?? [],
selectedProductId: null,
availablePackages:
offering?.availablePackages.map((item) =>
describePurchasePackage(item)
) ?? [],
});

return null;
}

return resolvedMonthlyPackage;
} finally {
if (mountedRef.current) {
setIsPaywallLoading(false);
}
}
}, []);

useEffect(() => {
if (!paywallVisible) {
return;
}

setPaywallPackage(null);

loadSelectedMonthlyPackage().catch((error) => {
console.warn("[Paywall] Could not load selected monthly package.", error);
});
}, [loadSelectedMonthlyPackage, paywallVisible]);

async function activateCovenantPro(
packageToPurchase: PurchasesPackage | null
) {
if (!packageToPurchase) {
console.warn("[Paywall] Purchase clicked with null package.", {
paywallPackageExists: Boolean(paywallPackage),
priceVisible: Boolean(paywallPackage?.product.priceString),
isPaywallLoading,
});
return;
}

setIsPurchasing(
true
);
setPurchaseErrorModal(null);

try {

console.log("[PURCHASE ATTEMPT]");

const customerInfo =
await purchasePackage(
packageToPurchase
);

if (!customerInfo) {
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
plan: selectedPlan,
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
plan: selectedPlan,
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

pro6:
"• ritual diario de tarot",

pro7:
"• reflexiones simbólicas diarias",

pro8:
"• lecturas más profundas del hábito",

	price:
	"$1.99 USD / MES",

monthlyPlan:
"Mensual",

monthlyPrice:
"$1.99 USD / mes",

free:
"1 hábito / 24 hrs",

logout:
isGuest
? "INICIAR SESIÓN"
: "CERRAR SESIÓN",

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
? "No pudimos cargar la suscripción mensual. Inténtalo de nuevo."
: "Las compras no están disponibles temporalmente. Inténtalo de nuevo más tarde.",

paywallPurchaseErrorTitle:
Platform.OS === "ios"
? "No se pudo completar la compra"
: "No se pudo iniciar la compra",

paywallPurchaseErrorText:
Platform.OS === "ios"
? "No se pudo completar la compra. Inténtalo de nuevo."
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
"CONFIGURACIÓN",

subscriptionButton:
"VER SUSCRIPCIÓN MENSUAL",

deleteAccount:
"Eliminar cuenta",

deleteAccountTitle:
"Eliminar cuenta",

deleteAccountText:
"Esto eliminará permanentemente tu cuenta, progreso y datos asociados. Ingresa tu contraseña para confirmar.",

deletePasswordPlaceholder:
"Contraseña",

deleteAccountCancel:
"CANCELAR",

deleteAccountConfirm:
"ELIMINAR CUENTA",

deleteAccountErrorTitle:
"No se pudo eliminar la cuenta",

deletePasswordRequired:
"Ingresa tu contraseña para eliminar tu cuenta.",

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
"1 HÁBITO",

dayUnit:
"DÍAS",

todayPanelTitle:
"PANEL DE HOY",

todayPanelText:
"Completa tu práctica diaria y conserva la racha viva.",

monthlyPath:
"CAMINO MENSUAL",

monthlyPathSubtext:
"constancia del mes",

oracleSummary:
"GUÍA DE HOY",

todayNumber:
"NÚMERO",

todayCard:
"CARTA",

todayCounsel:
"LEY / CONSEJO",

revealGuidance:
"Revelar la guía de hoy",

shareProgress:
"Compartir progreso",

shareSocials:
"Compartir en redes",

sharingProgress:
"Preparando imagen",

copySummary:
"Copiar resumen",

copiedSummary:
"Resumen copiado.",

shareUnavailable:
"No se pudo compartir el resumen.",

dailyCompletion:
"CIERRE DIARIO",

oracleModalTitle:
"GUÍA DE HOY",

oracleModalClose:
"CERRAR",

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

pro6:
"• daily tarot ritual",

pro7:
"• symbolic daily reflections",

pro8:
"• deeper habit insights",

	price:
	"$1.99 USD / MONTH",

monthlyPlan:
"Monthly",

monthlyPrice:
"$1.99 USD / month",

free:
"1 habit / 24 hrs",

logout:
isGuest
? "SIGN IN"
: "SIGN OUT",

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
? "We could not load the monthly subscription. Please try again."
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

monthlyPath:
"MONTHLY PATH",

monthlyPathSubtext:
"consistency this month",

oracleSummary:
"TODAY'S GUIDANCE",

todayNumber:
"NUMBER",

todayCard:
"CARD",

todayCounsel:
"LAW / COUNSEL",

revealGuidance:
"Reveal today's guidance",

shareProgress:
"Share progress",

shareSocials:
"Share on socials",

sharingProgress:
"Preparing image",

copySummary:
"Copy summary",

copiedSummary:
"Summary copied.",

shareUnavailable:
"Could not share the summary.",

dailyCompletion:
"DAILY COMPLETION",

oracleModalTitle:
"TODAY'S GUIDANCE",

oracleModalClose:
"CLOSE",

openAction:
"OPEN",

proAction:
"PRO",

progressLabel:
"PROGRESS",

};

const today =
getLocalDateKey();

const dashboardHabits =
isPro
? currentHabits
: selectedFreeHabit
? currentHabits.filter(
(habit) => habit.slug === selectedFreeHabit
)
: currentHabits.slice(0, 1);

const totalCompletedDays =
dashboardHabits.reduce(
(sum, habit) =>
sum +
(progressMap[habit.slug]?.completedDays || 0),
0
);

const completedTodayCount =
dashboardHabits.filter(
(habit) =>
progressMap[habit.slug]?.lastCompleted === today
).length;

const currentStreak =
Math.max(
...dashboardHabits.map(
(habit) => progressMap[habit.slug]?.streak || 0
),
0
);

const averageProgress =
Math.min(
Math.round(
totalCompletedDays /
Math.max(dashboardHabits.length * 30, 1) *
100
),
100
);

const currentMonth =
today.slice(0, 7);

const monthlyCompletedCount =
dashboardHabits.reduce(
(sum, habit) => {
const progress =
progressMap[habit.slug];
const completionDates =
Array.isArray(progress?.completionDates)
? progress.completionDates
: [];
const uniqueMonthlyDates =
new Set(
completionDates.filter(
(date: string) =>
typeof date === "string" &&
date.startsWith(currentMonth)
)
);

if (
uniqueMonthlyDates.size === 0 &&
typeof progress?.lastCompleted === "string" &&
progress.lastCompleted.startsWith(currentMonth)
) {
uniqueMonthlyDates.add(
progress.lastCompleted
);
}

return sum + uniqueMonthlyDates.size;
},
0
);

const monthlyPossibleCount =
Math.max(
dashboardHabits.length * 30,
1
);

const monthlyProgress =
Math.min(
Math.round(
(monthlyCompletedCount / monthlyPossibleCount) *
100
),
100
);

const hasOracleSummary =
Boolean(
dailyNumberDraw ||
(isPro && dailyTarotDraw) ||
(isPro && dailyCounselDraw)
);

const openOraclePaywall = async () => {
setOracleModalVisible(false);
setSelectedLockedHabit(null);
setSelectedPlan("monthly");
await initRevenueCat();
setPaywallVisible(true);
posthog.capture("paywall_shown", {
source: "daily_guidance",
is_pro: isPro,
});
};

const openTodayGuidance = async () => {
if (hasOracleSummary || isRevealingGuidance) {
setOracleModalVisible(true);
return;
}

setIsRevealingGuidance(true);

try {
const userStorageKey =
getUserStorageKey();
const oracleUserKey =
await getOracleUserKey(userStorageKey);

const numberDraw =
await revealDailyNumberDraw(oracleUserKey);
setDailyNumberDraw(numberDraw);

if (isPro) {
const [
tarotDraw,
counselDraw,
] = await Promise.all([
revealDailyTarotDraw(oracleUserKey),
revealDailyCounselDraw(oracleUserKey),
]);

setDailyTarotDraw(tarotDraw);
setDailyCounselDraw(counselDraw);
}

setOracleModalVisible(true);
} finally {
if (mountedRef.current) {
setIsRevealingGuidance(false);
}
}
};

function buildShareSummary() {
const lines =
language === "es"
? [
"Covenant",
`Progreso mensual: ${monthlyProgress}%`,
`Racha actual: ${currentStreak}`,
`Hábitos completados hoy: ${completedTodayCount}/${dashboardHabits.length}`,
]
: [
"Covenant",
`Monthly progress: ${monthlyProgress}%`,
`Current streak: ${currentStreak}`,
`Completed today: ${completedTodayCount}/${dashboardHabits.length}`,
];

if (dailyNumberDraw) {
lines.push(
language === "es"
? `Número del día: ${dailyNumberDraw.number} - ${localize(dailyNumberDraw.title, language)}`
: `Number of the day: ${dailyNumberDraw.number} - ${localize(dailyNumberDraw.title, language)}`
);
}

if (isPro && dailyTarotDraw) {
lines.push(
language === "es"
? `Carta del día: ${localize(dailyTarotDraw.name, language)}`
: `Card of the day: ${localize(dailyTarotDraw.name, language)}`
);
}

if (isPro && dailyCounselDraw) {
lines.push(
language === "es"
? `Ley / Consejo del día: ${localize(dailyCounselDraw.title, language)}`
: `Law / Counsel of the day: ${localize(dailyCounselDraw.title, language)}`
);
}

lines.push("joincovenant.app");

return lines.join("\n");
}

async function shareProgressTextFallback() {
const message =
buildShareSummary();

try {
if (
Platform.OS === "web" &&
typeof navigator !== "undefined" &&
"share" in navigator
) {
await navigator.share({
text: message,
title: "Covenant",
});
return;
}

await Share.share({
message,
title: "Covenant",
});
} catch {
Alert.alert(t.shareProgress, t.shareUnavailable);
}
}

function waitForShareCardLayout() {
return new Promise<void>((resolve) => {
let didResolve = false;

const finish = () => {
if (didResolve) {
return;
}

didResolve = true;
shareCardLayoutResolverRef.current = null;
resolve();
};

shareCardLayoutResolverRef.current = finish;
setIsShareCardMounted(true);
setTimeout(finish, 220);
});
}

function waitForNextFrame() {
return new Promise<void>((resolve) => {
requestAnimationFrame(() => resolve());
});
}

async function shareProgressImage() {
const message =
buildShareSummary();

if (Platform.OS === "web") {
await shareProgressTextFallback();
return;
}

if (isSharingProgress) {
return;
}

setIsSharingProgress(true);

try {
await waitForShareCardLayout();
await waitForNextFrame();

if (!shareCardRef.current) {
throw new Error("Progress share card is not mounted.");
}

const uri =
await captureRef(shareCardRef, {
format: "png",
quality: 1,
result: "tmpfile",
});

const canShareFile =
await Sharing.isAvailableAsync();

if (canShareFile) {
await Sharing.shareAsync(uri, {
dialogTitle: t.shareProgress,
mimeType: "image/png",
});
return;
}

await Share.share({
message,
title: "Covenant",
url: uri,
});
} catch (error) {
console.warn(
"[Share] Could not share progress image.",
error
);
await shareProgressTextFallback();
} finally {
if (mountedRef.current) {
setIsShareCardMounted(false);
setIsSharingProgress(false);
}
}
}

async function copyProgressSummary() {
const message =
buildShareSummary();

try {
if (Platform.OS !== "web") {
await Clipboard.setStringAsync(message);
Alert.alert(t.copySummary, t.copiedSummary);
return;
}

const clipboard =
Platform.OS === "web" &&
typeof navigator !== "undefined"
? navigator.clipboard
: null;

if (clipboard?.writeText) {
await clipboard.writeText(message);
Alert.alert(t.copySummary, t.copiedSummary);
return;
}

await Clipboard.setStringAsync(message);
Alert.alert(t.copySummary, t.copiedSummary);
} catch {
Alert.alert(t.copySummary, t.shareUnavailable);
}
};

return (

	<View style={styles.container}>

	<CovenantBackdrop intensity="strong" variant="habits" />

{isShareCardMounted && (
<View
pointerEvents="none"
style={styles.shareCardHost}
>
<View
ref={shareCardRef}
collapsable={false}
onLayout={() => {
shareCardLayoutResolverRef.current?.();
}}
style={styles.progressShareCard}
>
<View style={styles.progressShareGlowTop} />
<View style={styles.progressShareGlowBottom} />

<View style={styles.progressShareHeader}>
<View style={styles.progressShareSeal}>
<View style={styles.progressShareSealRing} />
<View style={styles.progressShareSealCore} />
</View>
<View style={styles.progressShareHeaderCopy}>
<Text style={styles.progressShareBrand}>
COVENANT
</Text>
<Text style={styles.progressShareSubtitle}>
{language === "es" ? "GUÍA DEL DÍA" : "GUIDE OF THE DAY"}
</Text>
</View>
<Text style={styles.progressShareLanguageText}>
{language === "es" ? "ES" : "EN"}
</Text>
</View>

<View style={styles.progressShareHero}>
<Text style={styles.progressShareQuote}>
{language === "es"
? "Lo que dominas en silencio se vuelve visible bajo presión."
: "What you master in silence becomes visible under pressure."}
</Text>
</View>

<View style={styles.progressShareRitualRow}>
<View style={styles.progressShareNumberPanel}>
<Text style={styles.progressShareGuidanceLabel}>
{t.todayNumber}
</Text>
<Text style={styles.progressShareNumberValue}>
{dailyNumberDraw ? dailyNumberDraw.number : "—"}
</Text>
<Text style={styles.progressShareGuidanceTitle}>
{dailyNumberDraw
? localize(dailyNumberDraw.title, language)
: t.revealGuidance}
</Text>
<Text style={styles.progressShareGuidanceBody}>
{dailyNumberDraw
? localize(dailyNumberDraw.meaning, language)
: language === "es"
? "Revela la guía para completar el ritual."
: "Reveal guidance to complete the ritual."}
</Text>
</View>

<View style={styles.progressShareTarotPanel}>
<Text style={styles.progressShareGuidanceLabel}>
{t.todayCard}
</Text>
{isPro && dailyTarotDraw ? (
<>
<DailyTarotArtwork
card={dailyTarotDraw}
language={language}
/>
<Text style={styles.progressShareTarotTitle}>
{dailyTarotDraw.romanNumeral} {localize(dailyTarotDraw.name, language)}
</Text>
<Text style={styles.progressShareTarotBody}>
{localize(dailyTarotDraw.meaning, language)}
</Text>
</>
) : (
<View style={styles.progressShareLockedTarot}>
<View style={styles.progressShareLockedTarotRing} />
<Text style={styles.progressShareLockedText}>
{t.locked} / {t.proAction}
</Text>
</View>
)}
</View>
</View>

<View style={styles.progressShareLawPanel}>
<Text style={styles.progressShareGuidanceLabel}>
{t.todayCounsel}
</Text>
<Text style={styles.progressShareLawTitle}>
{isPro && dailyCounselDraw
? `${dailyCounselDraw.number}. ${localize(dailyCounselDraw.title, language)}`
: `${t.locked} / ${t.proAction}`}
</Text>
{isPro && dailyCounselDraw ? (
<>
<Text style={styles.progressShareLawPrinciple}>
{localize(dailyCounselDraw.statement, language)}
</Text>
<Text style={styles.progressShareLawAction}>
{localize(dailyCounselDraw.action, language)}
</Text>
</>
) : (
<Text style={styles.progressShareGuidanceBody}>
{language === "es"
? "La ley del día pertenece a Covenant Pro."
: "The law of the day belongs to Covenant Pro."}
</Text>
)}
</View>

<View style={styles.progressShareProgressRow}>
<View style={styles.progressShareStat}>
<Text style={styles.progressShareStatLabel}>
{language === "es" ? "PROGRESO MENSUAL" : "MONTHLY PROGRESS"}
</Text>
<Text style={styles.progressShareStatValue}>
{monthlyProgress}%
</Text>
</View>
<View style={styles.progressShareStat}>
<Text style={styles.progressShareStatLabel}>
{language === "es" ? "RACHA ACTUAL" : "CURRENT STREAK"}
</Text>
<Text style={styles.progressShareStatValue}>
{currentStreak}
</Text>
</View>
</View>

<View style={styles.progressShareFooter}>
<Text style={styles.progressShareFooterText}>
joincovenant.app
</Text>
</View>
</View>
</View>
)}

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
{completedTodayCount}/{dashboardHabits.length}
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

<Text style={styles.proText}>
{t.pro6}
</Text>

<Text style={styles.proText}>
{t.pro7}
</Text>

<Text style={styles.proText}>
{t.pro8}
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
<View style={styles.monthlyPathHeader}>
<View style={styles.monthlyPathCopy}>
<Text style={styles.todayPanelLabel}>
{t.monthlyPath}
</Text>
<View style={styles.monthlyPathValueRow}>
<Text style={styles.monthlyPathValue}>
{monthlyProgress}%
</Text>
<Text style={styles.monthlyPathCount}>
{monthlyCompletedCount}/{monthlyPossibleCount}
</Text>
</View>
<Text style={styles.monthlyPathSubtext}>
{t.monthlyPathSubtext}
</Text>
</View>

<View style={styles.dailyCompletionPill}>
<Text style={styles.dailyCompletionPillLabel}>
{t.dailyCompletion}
</Text>
<Text style={styles.dailyCompletionPillValue}>
{completedTodayCount}/{dashboardHabits.length}
</Text>
</View>
</View>

<View style={styles.monthlyTrack}>
<View
style={[
styles.monthlyTrackFill,
{
width: `${monthlyProgress}%`,
},
]}
/>
</View>

<View style={styles.todayPanelDivider} />

<View style={styles.guideHeaderRow}>
<View>
<Text style={styles.todayPanelLabel}>
{t.oracleSummary}
</Text>
<Text style={styles.guideHeaderTitle}>
{language === "es" ? "Ritual diario" : "Daily ritual"}
</Text>
</View>
<View style={styles.oracleSummaryGlyph}>
<View style={styles.oracleSummaryGlyphRing} />
<View style={styles.oracleSummaryGlyphCore} />
</View>
</View>

<View style={styles.oracleSummaryItems}>
<Text style={styles.oracleSummaryText}>
{dailyNumberDraw
? `${t.todayNumber} ${dailyNumberDraw.number} - ${localize(dailyNumberDraw.title, language)}`
: `${t.todayNumber} - ${isRevealingGuidance ? t.processing : t.revealGuidance}`}
</Text>

{isPro ? (
<Text style={styles.oracleSummaryText}>
{dailyTarotDraw
? `${t.todayCard} ${localize(dailyTarotDraw.name, language)}`
: `${t.todayCard} - ${isRevealingGuidance ? t.processing : t.revealGuidance}`}
</Text>
) : (
<TouchableOpacity
activeOpacity={0.78}
onPress={openOraclePaywall}
style={styles.lockedGuidanceRow}
>
<Text style={styles.lockedGuidanceText}>{t.todayCard}</Text>
<Text style={styles.lockedGuidanceBadge}>{t.proAction}</Text>
</TouchableOpacity>
)}

{isPro ? (
<Text style={styles.oracleSummaryText}>
{dailyCounselDraw
? `${t.todayCounsel} ${localize(dailyCounselDraw.title, language)}`
: `${t.todayCounsel} - ${isRevealingGuidance ? t.processing : t.revealGuidance}`}
</Text>
) : (
<TouchableOpacity
activeOpacity={0.78}
onPress={openOraclePaywall}
style={styles.lockedGuidanceRow}
>
<Text style={styles.lockedGuidanceText}>{t.todayCounsel}</Text>
<Text style={styles.lockedGuidanceBadge}>{t.proAction}</Text>
</TouchableOpacity>
)}
</View>

<TouchableOpacity
activeOpacity={0.82}
onPress={openTodayGuidance}
disabled={isRevealingGuidance}
style={[
styles.guidanceButton,
isRevealingGuidance && {
opacity: 0.72,
},
]}
>
<Text style={styles.guidanceButtonText}>
{hasOracleSummary ? t.openAction : t.revealGuidance}
</Text>
</TouchableOpacity>

<View style={styles.shareRow}>
<TouchableOpacity
activeOpacity={0.78}
onPress={shareProgressImage}
disabled={isSharingProgress}
style={[
styles.shareButton,
isSharingProgress && styles.shareButtonDisabled,
]}
>
<Text style={styles.shareButtonText}>
{isSharingProgress ? t.sharingProgress : t.shareProgress}
</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.78}
onPress={shareProgressImage}
disabled={isSharingProgress}
style={[
styles.shareButton,
isSharingProgress && styles.shareButtonDisabled,
]}
>
<Text style={styles.shareButtonText}>
{isSharingProgress ? t.sharingProgress : t.shareSocials}
</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.78}
onPress={copyProgressSummary}
style={styles.shareButton}
>
<Text style={styles.shareButtonText}>{t.copySummary}</Text>
</TouchableOpacity>
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
{locked ? t.locked : t.openAction}
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
<View style={styles.paywallFeaturePill}>
<Text style={styles.paywallFeatureText}>
{t.pro6.replace("• ", "")}
</Text>
</View>
<View style={styles.paywallFeaturePill}>
<Text style={styles.paywallFeatureText}>
{t.pro7.replace("• ", "")}
</Text>
</View>
<View style={styles.paywallFeaturePill}>
<Text style={styles.paywallFeatureText}>
{t.pro8.replace("• ", "")}
</Text>
</View>
</View>

<View style={styles.planRow}>

{paywallPackage ? (

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
{paywallPackage?.product.priceString ?? ""}
</Text>

</TouchableOpacity>

) : null}

</View>

{!isPaywallLoading && !paywallPackage ? (

<Text style={styles.paywallUnavailableText}>
{t.paywallPurchaseUnavailableText}
</Text>

) : null}

<TouchableOpacity
activeOpacity={0.86}
onPress={
() => activateCovenantPro(
paywallPackage
)
}
disabled={
isPurchasing ||
isPaywallLoading ||
!paywallPackage
}
style={[
styles.paywallButton,
(
isPurchasing ||
isPaywallLoading ||
!paywallPackage
) && {
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
visible={oracleModalVisible}
transparent
animationType="fade"
onRequestClose={() => setOracleModalVisible(false)}
>
<View style={styles.oracleModalOverlay}>
<View style={styles.oracleModalPanel}>
<Text style={styles.oracleModalLabel}>
{t.oracleModalTitle}
</Text>

<ScrollView
style={styles.oracleModalScroll}
contentContainerStyle={styles.oracleModalScrollContent}
showsVerticalScrollIndicator={false}
bounces
>

{dailyNumberDraw && (
<View style={styles.oracleModalBlock}>
<Text style={styles.oracleModalKicker}>
{t.todayNumber}
</Text>
<Text style={styles.oracleModalTitleText}>
{dailyNumberDraw.number} — {localize(dailyNumberDraw.title, language)}
</Text>
<Text style={styles.oracleModalBody}>
{localize(dailyNumberDraw.meaning, language)}
</Text>
<Text style={styles.oracleModalQuestion}>
{localize(dailyNumberDraw.reflection, language)}
</Text>
</View>
)}

{isPro && dailyTarotDraw && (
<View style={styles.oracleModalBlock}>
<Text style={styles.oracleModalKicker}>
{t.todayCard}
</Text>
<DailyTarotArtwork
card={dailyTarotDraw}
language={language}
/>
<Text style={styles.oracleModalTitleText}>
{dailyTarotDraw.romanNumeral} {localize(dailyTarotDraw.name, language)}
</Text>
<Text style={styles.oracleModalBody}>
{localize(dailyTarotDraw.meaning, language)}
</Text>
<Text style={styles.oracleModalQuestion}>
{localize(dailyTarotDraw.todayReflection, language)}
</Text>
<Text style={styles.oracleModalBody}>
{localize(dailyTarotDraw.question, language)}
</Text>
</View>
)}

{isPro && dailyCounselDraw && (
<View style={styles.oracleModalBlock}>
<Text style={styles.oracleModalKicker}>
{t.todayCounsel}
</Text>
<Text style={styles.oracleModalTitleText}>
{dailyCounselDraw.number}. {localize(dailyCounselDraw.title, language)}
</Text>
<Text style={styles.oracleModalQuestion}>
{localize(dailyCounselDraw.statement, language)}
</Text>
<Text style={styles.oracleModalBody}>
{localize(dailyCounselDraw.explanation, language)}
</Text>
<Text style={styles.oracleModalQuestion}>
{localize(dailyCounselDraw.action, language)}
</Text>
<Text style={styles.oracleModalWarning}>
{localize(dailyCounselDraw.warning, language)}
</Text>
</View>
)}

{!isPro && (
<View style={styles.oracleModalBlock}>
<Text style={styles.oracleModalKicker}>
{t.todayCard} / {t.todayCounsel}
</Text>
<Text style={styles.oracleModalBody}>
{language === "es"
? "La carta y el consejo del día pertenecen a Covenant Pro."
: "The card and counsel of the day belong to Covenant Pro."}
</Text>
<TouchableOpacity
activeOpacity={0.82}
onPress={openOraclePaywall}
style={styles.oracleModalSecondaryButton}
>
<Text style={styles.oracleModalSecondaryButtonText}>
{t.proAction}
</Text>
</TouchableOpacity>
</View>
)}

</ScrollView>

<View style={styles.shareRow}>
<TouchableOpacity
activeOpacity={0.78}
onPress={shareProgressImage}
disabled={isSharingProgress}
style={[
styles.shareButton,
isSharingProgress && styles.shareButtonDisabled,
]}
>
<Text style={styles.shareButtonText}>
{isSharingProgress ? t.sharingProgress : t.shareSocials}
</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.78}
onPress={copyProgressSummary}
style={styles.shareButton}
>
<Text style={styles.shareButtonText}>{t.copySummary}</Text>
</TouchableOpacity>
</View>

<TouchableOpacity
activeOpacity={0.82}
onPress={() => setOracleModalVisible(false)}
style={styles.oracleModalButton}
>
<Text style={styles.oracleModalButtonText}>
{t.oracleModalClose}
</Text>
</TouchableOpacity>
</View>
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

shareCardHost: {
position: "absolute",
left: -10000,
top: 0,
width: 390,
height: 694,
opacity: 1,
},

progressShareCard: {
width: 390,
height: 694,
backgroundColor: "#050403",
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.72)",
paddingHorizontal: 22,
paddingVertical: 22,
overflow: "hidden",
},

progressShareGlowTop: {
position: "absolute",
top: -60,
left: 30,
width: 260,
height: 160,
borderRadius: 130,
backgroundColor:
"rgba(216,140,58,0.12)",
},

progressShareGlowBottom: {
position: "absolute",
bottom: -70,
right: -20,
width: 240,
height: 170,
borderRadius: 120,
backgroundColor:
"rgba(112,70,32,0.18)",
},

progressShareHeader: {
flexDirection: "row",
alignItems: "center",
gap: 12,
marginBottom: 14,
},

progressShareHeaderCopy: {
flex: 1,
},

progressShareBrand: {
color: "#F3D3A5",
fontSize: 23,
lineHeight: 28,
letterSpacing: 6,
fontWeight: "300",
},

progressShareSubtitle: {
color: COLORS.quiet,
fontSize: 9,
lineHeight: 13,
letterSpacing: 2.6,
fontWeight: "800",
},

progressShareSeal: {
width: 45,
height: 45,
borderRadius: 23,
alignItems: "center",
justifyContent: "center",
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.58)",
backgroundColor:
"rgba(216,140,58,0.10)",
},

progressShareSealRing: {
position: "absolute",
width: 29,
height: 29,
borderRadius: 15,
borderWidth: 1,
borderColor:
"rgba(255,232,200,0.20)",
},

progressShareSealCore: {
width: 9,
height: 9,
borderRadius: 5,
backgroundColor:
"rgba(216,140,58,0.28)",
borderWidth: 1,
borderColor:
"rgba(243,211,165,0.80)",
},

progressShareLanguageText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 2,
fontWeight: "800",
},

progressShareHero: {
borderTopWidth: 1,
borderBottomWidth: 1,
borderColor:
"rgba(255,232,200,0.13)",
paddingVertical: 13,
marginBottom: 14,
},

progressShareQuote: {
color: COLORS.text,
fontSize: 22,
lineHeight: 29,
fontWeight: "300",
textAlign: "center",
},

progressShareRitualRow: {
flexDirection: "row",
gap: 12,
marginBottom: 13,
},

progressShareNumberPanel: {
flex: 1,
minHeight: 218,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.28)",
backgroundColor:
"rgba(255,255,255,0.035)",
padding: 12,
},

progressShareNumberValue: {
color: "#F3D3A5",
fontSize: 52,
lineHeight: 58,
fontWeight: "200",
marginBottom: 5,
},

progressShareTarotPanel: {
width: 154,
alignItems: "center",
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.28)",
backgroundColor:
"rgba(216,140,58,0.07)",
paddingHorizontal: 8,
paddingTop: 10,
paddingBottom: 9,
},

progressShareTarotTitle: {
color: "#F4E8DA",
fontSize: 12,
lineHeight: 16,
fontWeight: "700",
textAlign: "center",
marginTop: 7,
},

progressShareTarotBody: {
color: "#BFAF9F",
fontSize: 10,
lineHeight: 14,
textAlign: "center",
marginTop: 4,
},

progressShareLockedTarot: {
width: 116,
height: 180,
alignItems: "center",
justifyContent: "center",
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.45)",
backgroundColor:
"rgba(5,4,3,0.62)",
marginTop: 7,
},

progressShareLockedTarotRing: {
width: 56,
height: 56,
borderRadius: 28,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.44)",
marginBottom: 12,
},

progressShareLockedText: {
color: COLORS.bronze,
fontSize: 10,
lineHeight: 14,
letterSpacing: 1.5,
fontWeight: "800",
textAlign: "center",
},

progressShareLawPanel: {
borderLeftWidth: 1,
borderLeftColor:
"rgba(216,140,58,0.58)",
paddingLeft: 13,
paddingBottom: 10,
marginBottom: 12,
},

progressShareLawTitle: {
color: "#F4E8DA",
fontSize: 17,
lineHeight: 22,
fontWeight: "700",
marginBottom: 6,
},

progressShareLawPrinciple: {
color: "#F0C892",
fontSize: 13,
lineHeight: 18,
fontWeight: "600",
marginBottom: 5,
},

progressShareLawAction: {
color: "#C8B9A8",
fontSize: 12,
lineHeight: 17,
},

progressShareProgressRow: {
flexDirection: "row",
gap: 10,
marginTop: "auto",
marginBottom: 12,
},

progressShareStat: {
flex: 1,
minHeight: 64,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.24)",
backgroundColor:
"rgba(216,140,58,0.09)",
paddingHorizontal: 12,
paddingVertical: 10,
justifyContent: "space-between",
},

progressShareStatLabel: {
color: COLORS.quiet,
fontSize: 8,
lineHeight: 12,
letterSpacing: 1.5,
fontWeight: "800",
},

progressShareStatValue: {
color: "#F3D3A5",
fontSize: 24,
lineHeight: 29,
fontWeight: "300",
},

progressShareGuidanceLabel: {
color: COLORS.bronze,
fontSize: 8,
lineHeight: 12,
letterSpacing: 1.8,
fontWeight: "800",
marginBottom: 5,
},

progressShareGuidanceTitle: {
color: "#F4E8DA",
fontSize: 15,
lineHeight: 20,
fontWeight: "600",
marginBottom: 6,
},

progressShareGuidanceBody: {
color: "#C8B9A8",
fontSize: 11,
lineHeight: 16,
},

progressShareFooter: {
borderTopWidth: 1,
borderTopColor:
"rgba(255,232,200,0.12)",
paddingTop: 10,
},

progressShareFooterText: {
color: COLORS.bronze,
fontSize: 12,
lineHeight: 16,
letterSpacing: 2.6,
fontWeight: "800",
textAlign: "center",
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
backgroundColor:
"rgba(12,9,7,0.86)",
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.30)",
borderRadius: 26,
padding: 20,
marginBottom: 28,
shadowColor:
COLORS.bronze,
shadowOpacity: 0.22,
shadowRadius: 34,
shadowOffset: {
width: 0,
height: 18,
},
elevation: 5,
},

monthlyPathHeader: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
gap: 14,
marginBottom: 18,
},

monthlyPathCopy: {
flex: 1,
},

todayPanelLabel: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 3.4,
fontWeight: "800",
marginBottom: 7,
},

monthlyPathValue: {
color: COLORS.text,
fontSize: 38,
lineHeight: 43,
fontWeight: "300",
letterSpacing: 1,
},

monthlyPathValueRow: {
flexDirection: "row",
alignItems: "flex-end",
gap: 10,
marginBottom: 3,
},

monthlyPathCount: {
color: COLORS.bronze,
fontSize: 13,
lineHeight: 24,
letterSpacing: 1.6,
fontWeight: "700",
},

monthlyPathSubtext: {
color: COLORS.quiet,
fontSize: 11,
lineHeight: 17,
letterSpacing: 1.4,
},

dailyCompletionPill: {
minWidth: 74,
borderRadius: 999,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.30)",
backgroundColor:
"rgba(216,140,58,0.085)",
paddingHorizontal: 12,
paddingVertical: 9,
alignItems: "center",
justifyContent: "center",
},

dailyCompletionPillLabel: {
color: COLORS.quiet,
fontSize: 8,
lineHeight: 12,
letterSpacing: 1.8,
fontWeight: "800",
},

dailyCompletionPillValue: {
color: "#F3D3A5",
fontSize: 17,
lineHeight: 22,
fontWeight: "600",
},

monthlyTrack: {
height: 8,
borderRadius: 999,
overflow: "hidden",
backgroundColor:
"rgba(255,255,255,0.08)",
marginBottom: 18,
},

monthlyTrackFill: {
height: "100%",
borderRadius: 999,
backgroundColor:
"#D88C3A",
shadowColor:
COLORS.bronze,
shadowOpacity: 0.35,
shadowRadius: 12,
shadowOffset: {
width: 0,
height: 0,
},
},

todayPanelDivider: {
height: 1,
backgroundColor:
"rgba(255,232,200,0.12)",
marginBottom: 17,
},

guideHeaderRow: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
marginBottom: 13,
},

oracleSummaryGlyph: {
width: 36,
height: 36,
borderRadius: 18,
alignItems: "center",
justifyContent: "center",
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.42)",
backgroundColor:
"rgba(216,140,58,0.10)",
},

oracleSummaryGlyphRing: {
position: "absolute",
width: 25,
height: 25,
borderRadius: 13,
borderWidth: 1,
borderColor:
"rgba(255,232,200,0.18)",
},

oracleSummaryGlyphCore: {
width: 8,
height: 8,
borderRadius: 4,
borderWidth: 1,
borderColor:
"rgba(241,197,142,0.72)",
backgroundColor:
"rgba(216,140,58,0.16)",
},

oracleSummaryCopy: {
flex: 1,
},

guideHeaderTitle: {
color: COLORS.text,
fontSize: 20,
lineHeight: 26,
fontWeight: "300",
marginTop: -2,
},

oracleSummaryItems: {
gap: 8,
marginBottom: 16,
},

oracleSummaryText: {
color: "#F2E5D7",
fontSize: 14,
lineHeight: 20,
fontWeight: "500",
borderLeftWidth: 1,
borderLeftColor:
"rgba(216,140,58,0.35)",
paddingLeft: 12,
},

todayPanelText: {
color: "#D5C9BD",
fontSize: 15,
lineHeight: 23,
},

lockedGuidanceRow: {
minHeight: 34,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.24)",
borderRadius: 999,
paddingHorizontal: 12,
paddingVertical: 7,
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
backgroundColor:
"rgba(216,140,58,0.055)",
},

lockedGuidanceText: {
color: "#CFC0B0",
fontSize: 11,
letterSpacing: 1.7,
fontWeight: "700",
flexShrink: 1,
},

lockedGuidanceBadge: {
color: "#F0C892",
fontSize: 10,
letterSpacing: 1.8,
fontWeight: "800",
},

shareRow: {
flexDirection: "row",
flexWrap: "wrap",
gap: 8,
marginTop: 12,
},

guidanceButton: {
minHeight: 50,
borderRadius: 999,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.62)",
alignItems: "center",
justifyContent: "center",
paddingHorizontal: 16,
paddingVertical: 12,
marginTop: 2,
backgroundColor:
"rgba(216,140,58,0.20)",
shadowColor:
COLORS.bronze,
shadowOpacity: 0.20,
shadowRadius: 18,
shadowOffset: {
width: 0,
height: 8,
},
},

guidanceButtonText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 2.4,
fontWeight: "800",
textAlign: "center",
},

shareButton: {
minHeight: 36,
borderRadius: 999,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.24)",
paddingHorizontal: 11,
paddingVertical: 8,
alignItems: "center",
justifyContent: "center",
backgroundColor:
"rgba(255,255,255,0.025)",
},

shareButtonDisabled: {
opacity: 0.66,
},

shareButtonText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 1.4,
fontWeight: "800",
textAlign: "center",
},

dailyCompletionRow: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
borderTopWidth: 1,
borderTopColor:
"rgba(255,232,200,0.10)",
paddingTop: 16,
gap: 12,
},

dailyCompletionLabel: {
color: COLORS.quiet,
fontSize: 10,
letterSpacing: 2.6,
fontWeight: "800",
},

dailyCompletionValue: {
color: COLORS.bronze,
fontSize: 17,
lineHeight: 22,
letterSpacing: 2,
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
minWidth: 82,
maxWidth: 96,
borderRadius: 999,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.52)",
backgroundColor:
"rgba(216,140,58,0.16)",
paddingHorizontal: 14,
paddingVertical: 8,
alignItems: "center",
justifyContent: "center",
flexShrink: 0,
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
letterSpacing: 1.2,
fontWeight: "800",
textAlign: "center",
},

actionBadgeTextLocked: {
color: COLORS.quiet,
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

oracleModalOverlay: {
flex: 1,
backgroundColor:
"rgba(0,0,0,0.82)",
paddingHorizontal: 24,
paddingVertical: 28,
alignItems: "center",
justifyContent: "center",
},

oracleModalPanel: {
width: "100%",
backgroundColor:
"rgba(8,7,6,0.96)",
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.38)",
borderRadius: 26,
paddingHorizontal: 24,
paddingTop: 24,
paddingBottom: 20,
maxHeight: "88%",
shadowColor:
COLORS.bronze,
shadowOpacity: 0.24,
shadowRadius: 38,
shadowOffset: {
width: 0,
height: 18,
},
elevation: 10,
},

oracleModalLabel: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 6,
fontWeight: "800",
marginBottom: 14,
},

oracleModalScroll: {
width: "100%",
flexGrow: 0,
},

oracleModalScrollContent: {
paddingBottom: 2,
},

oracleModalBlock: {
borderTopWidth: 1,
borderTopColor:
"rgba(255,232,200,0.10)",
paddingTop: 18,
marginBottom: 20,
},

oracleModalKicker: {
color: COLORS.quiet,
fontSize: 10,
letterSpacing: 3,
fontWeight: "800",
marginBottom: 8,
},

oracleModalTitleText: {
color: COLORS.text,
fontSize: 22,
lineHeight: 29,
fontWeight: "300",
marginBottom: 12,
},

oracleModalBody: {
color: "#D8CCC0",
fontSize: 15,
lineHeight: 25,
marginBottom: 12,
},

oracleModalQuestion: {
color: "#F0C892",
fontSize: 14,
lineHeight: 23,
},

oracleModalWarning: {
color: "#C4B3A3",
fontSize: 13,
lineHeight: 22,
borderLeftWidth: 1,
borderLeftColor:
"rgba(216,140,58,0.48)",
paddingLeft: 12,
marginTop: 2,
},

tarotArtwork: {
alignSelf: "center",
width: 138,
height: 214,
borderRadius: 18,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.56)",
backgroundColor:
"rgba(10,7,5,0.94)",
alignItems: "center",
justifyContent: "space-between",
paddingVertical: 18,
marginBottom: 18,
shadowColor:
COLORS.bronze,
shadowOpacity: 0.28,
shadowRadius: 24,
shadowOffset: {
width: 0,
height: 12,
},
},

tarotCornerTopLeft: {
position: "absolute",
top: 10,
left: 10,
width: 18,
height: 18,
borderLeftWidth: 1,
borderTopWidth: 1,
borderColor:
"rgba(255,232,200,0.28)",
},

tarotCornerTopRight: {
position: "absolute",
top: 10,
right: 10,
width: 18,
height: 18,
borderRightWidth: 1,
borderTopWidth: 1,
borderColor:
"rgba(255,232,200,0.28)",
},

tarotCornerBottomLeft: {
position: "absolute",
bottom: 10,
left: 10,
width: 18,
height: 18,
borderLeftWidth: 1,
borderBottomWidth: 1,
borderColor:
"rgba(255,232,200,0.28)",
},

tarotCornerBottomRight: {
position: "absolute",
bottom: 10,
right: 10,
width: 18,
height: 18,
borderRightWidth: 1,
borderBottomWidth: 1,
borderColor:
"rgba(255,232,200,0.28)",
},

tarotArtworkRoman: {
color: COLORS.bronze,
fontSize: 13,
letterSpacing: 3,
fontWeight: "800",
},

tarotArtworkName: {
color: "#F2E5D7",
fontSize: 11,
lineHeight: 15,
letterSpacing: 1.4,
textAlign: "center",
paddingHorizontal: 18,
fontWeight: "700",
},

tarotSigil: {
width: 88,
height: 88,
borderRadius: 44,
alignItems: "center",
justifyContent: "center",
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.46)",
backgroundColor:
"rgba(216,140,58,0.08)",
},

tarotSigilOrbit: {
position: "absolute",
width: 64,
height: 64,
borderRadius: 32,
borderWidth: 1,
borderColor:
"rgba(255,232,200,0.18)",
},

tarotSigilOrbitTilt: {
position: "absolute",
width: 70,
height: 34,
borderRadius: 35,
borderWidth: 1,
borderColor:
"rgba(216,140,58,0.30)",
transform: [
{
rotate: "-28deg",
},
],
},

tarotSigilCrescent: {
position: "absolute",
width: 38,
height: 38,
borderRadius: 19,
borderRightWidth: 7,
borderColor:
"rgba(255,209,160,0.72)",
},

tarotSigilRay: {
position: "absolute",
width: 2,
height: 78,
backgroundColor:
"rgba(255,209,160,0.38)",
transform: [
{
rotate: "42deg",
},
],
},

tarotSigilCore: {
width: 22,
height: 22,
borderRadius: 11,
borderWidth: 1,
borderColor:
"rgba(255,232,200,0.58)",
backgroundColor:
"rgba(216,140,58,0.22)",
},

oracleModalSecondaryButton: {
height: 48,
borderRadius: 999,
borderWidth: 1,
borderColor:
COLORS.border,
alignItems: "center",
justifyContent: "center",
backgroundColor:
"rgba(216,140,58,0.14)",
},

oracleModalSecondaryButtonText: {
color: COLORS.bronze,
fontSize: 11,
letterSpacing: 3,
fontWeight: "800",
},

oracleModalButton: {
height: 54,
borderRadius: 999,
alignItems: "center",
justifyContent: "center",
backgroundColor:
COLORS.bronze,
shadowColor:
COLORS.bronze,
shadowOpacity: 0.22,
shadowRadius: 18,
shadowOffset: {
width: 0,
height: 10,
},
},

oracleModalButtonText: {
color: COLORS.background,
fontSize: 11,
letterSpacing: 3,
fontWeight: "800",
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

paywallUnavailableText: {
color: COLORS.muted,
fontSize: 12,
lineHeight: 18,
textAlign: "center",
marginBottom: 14,
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
