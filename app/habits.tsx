import {
  ActivityIndicator,
  Alert,
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
  useState,
} from "react";

import { useRouter } from "expo-router";
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
  getSelectedFreeHabit,
  saveSelectedFreeHabit,
} from "../utils/freeHabit";

import {
  getLanguage,
  Language,
} from "../utils/language";

import {
  getOfferings,
  hasProAccess,
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
card: "#0b0b0b",
bronze: "#b87333",
bronzeSoft: "rgba(184,115,51,0.10)",
text: "#f5f5f5",
muted: "#8e8e93",
border: "rgba(184,115,51,0.38)",
	};

const PRO_HABIT_LIMIT = 4;

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

	const loadSelectedFreeHabit = useCallback(async () => {

	setIsFreeHabitReady(false);

	if (!user) {
	setSelectedFreeHabit(null);
	setIsFreeHabitReady(true);
	return;
	}

	const selectedHabit =
	await getSelectedFreeHabit(
	String(user.id || user.id)
	);

	setSelectedFreeHabit(
	selectedHabit
	);

	setIsFreeHabitReady(true);

	}, [user]);

	useEffect(() => {

loadLanguage();

loadProgress();

loadSelectedFreeHabit();

	}, [loadSelectedFreeHabit]);

async function loadLanguage() {

const currentLanguage =
await getLanguage();

setLanguage(
currentLanguage
);

}

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

setProgressMap(
allProgress
);

} finally {

setIsSyncingProgress(
false
);

}

}

function canOpenHabit(
slug: string
) {

if (isPro) {
const index =
currentHabits.findIndex(
(habit) => habit.slug === slug
);

return (
index >= 0 &&
index < PRO_HABIT_LIMIT
);
}

if (!isFreeHabitReady) {
return false;
}

if (!selectedFreeHabit) {
return true;
}

return (
selectedFreeHabit ===
slug
);

}

async function openHabit(
slug: string
) {

if (!isPro && !isFreeHabitReady) {
return;
}

if (!canOpenHabit(slug)) {
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
if (!user) {
return;
}

const savedHabit =
await saveSelectedFreeHabit(
String(user.id || user.id),
slug
);

setSelectedFreeHabit(
savedHabit
);

if (savedHabit !== slug) {
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

async function purchaseSelectedPlan(
plan: CovenantProPlan
) {
console.log("[Paywall] Loading RevenueCat offerings for selected plan.", {
plan,
});

const offerings =
await getOfferings();

const offering =
offerings?.all.default ??
offerings?.current ??
null;

console.log("[Paywall] RevenueCat offering selected.", {
plan,
offeringIdentifier: offering?.identifier ?? null,
availablePackages:
offering?.availablePackages.map((item) =>
describePurchasePackage(item)
) ?? [],
});

const packageToPurchase =
offering?.monthly ??
offering?.availablePackages.find(
(item) =>
item.identifier === "$rc_monthly" ||
item.packageType === "MONTHLY"
) ??
offering?.availablePackages[0] ??
null;

if (!packageToPurchase) {
console.warn("[Paywall] No RevenueCat package available to purchase.", {
plan,
offeringIdentifier: offering?.identifier ?? null,
});

throw new Error(t.paywallPurchaseUnavailableText);
}

console.log("[Paywall] Attempting purchasePackage.", {
plan,
package: describePurchasePackage(packageToPurchase),
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

Alert.alert(
t.paywallPurchaseErrorTitle,
t.paywallPurchaseErrorText
);

} finally {

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

paywallPurchaseUnavailableText:
"Las compras no están disponibles temporalmente. Inténtalo de nuevo más tarde.",

paywallPurchaseErrorTitle:
"No se pudo iniciar la compra",

paywallPurchaseErrorText:
"Las compras no están disponibles temporalmente. Inténtalo de nuevo más tarde.",

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

processing:
"PROCESANDO",

syncing:
"SINCRONIZANDO PROGRESO",

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

paywallPurchaseUnavailableText:
"Purchases are temporarily unavailable. Please try again later.",

paywallPurchaseErrorTitle:
"Could not start purchase",

paywallPurchaseErrorText:
"Purchases are temporarily unavailable. Please try again later.",

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
"EL CREADOR",

processing:
"PROCESSING",

syncing:
"SYNCING PROGRESS",

};

const today =
new Date()
.toISOString()
.split("T")[0];

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

</View>

<View style={styles.freeCard}>

<Text style={styles.freeLabel}>
FREE VERSION
</Text>

<Text style={styles.freeText}>
{t.free}
</Text>

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
(completedDays /
30) *
100
}%`,
},

]}
/>

</View>

<Text
style={
styles.progressText
}
>
{completedDays}/30
</Text>

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
</View>

</ScrollView>

<Modal
visible={
paywallVisible
}
transparent
animationType="fade"
onRequestClose={() =>
setPaywallVisible(
false
)
}
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

<ActivityIndicator
color={
COLORS.background
}
/>

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
onPress={() =>
setPaywallVisible(
false
)
}
style={
styles.paywallCancel
}
>

<Text
style={
styles.paywallCancelText
}
>
{isPurchasing
? t.processing
: t.paywallCancel}
</Text>

</TouchableOpacity>

</View>

</ScrollView>

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
"rgba(5,5,5,0.72)",
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
marginBottom: 42,
paddingHorizontal: 4,
},

proCard: {
backgroundColor:
COLORS.bronzeSoft,
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 24,
padding: 24,
marginBottom: 30,
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
COLORS.border,
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

freeCard: {
alignItems: "center",
marginBottom: 32,
},

freeLabel: {
color: COLORS.bronze,
letterSpacing: 9,
fontSize: 10,
marginBottom: 14,
},

freeText: {
color: COLORS.muted,
fontSize: 16,
letterSpacing: 2,
},

habitCard: {
backgroundColor:
COLORS.card,
borderRadius: 24,
padding: 22,
marginBottom: 18,
borderWidth: 1,
borderColor:
"rgba(255,255,255,0.04)",
position: "relative",
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
"rgba(5,5,5,0.78)",
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
paddingRight: 94,
},

habitDescription: {
color: COLORS.muted,
fontSize: 16,
lineHeight: 27,
marginBottom: 22,
},

statusRow: {
flexDirection: "row",
justifyContent:
"space-between",
alignItems: "center",
marginBottom: 24,
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
height: 6,
backgroundColor:
"rgba(255,255,255,0.05)",
borderRadius: 999,
overflow: "hidden",
marginBottom: 14,
},

progressBar: {
height: "100%",
backgroundColor:
COLORS.bronze,
borderRadius: 999,
},

progressText: {
color: COLORS.muted,
fontSize: 13,
letterSpacing: 3,
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
"rgba(5,5,5,0.72)",
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
color: COLORS.muted,
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
"rgba(184,115,51,0.06)",
},

creatorLinkText: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 3,
},

paywallOverlay: {
flex: 1,
backgroundColor:
"rgba(0,0,0,0.82)",
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
"#070707",
borderWidth: 1,
borderColor:
COLORS.border,
borderRadius: 28,
padding: 30,
shadowColor:
COLORS.bronze,
shadowOpacity: 0.12,
shadowRadius: 24,
shadowOffset: {
width: 0,
height: 18,
},
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
color: COLORS.muted,
fontSize: 15,
lineHeight: 26,
marginBottom: 24,
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
"rgba(255,255,255,0.08)",
borderRadius: 16,
paddingVertical: 16,
paddingHorizontal: 12,
backgroundColor:
"rgba(255,255,255,0.03)",
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
COLORS.bronze,
alignItems: "center",
justifyContent: "center",
marginBottom: 18,
},

paywallButtonText: {
color: COLORS.background,
fontSize: 12,
letterSpacing: 2.4,
fontWeight: "600",
textAlign: "center",
paddingHorizontal: 16,
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
color: COLORS.muted,
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
