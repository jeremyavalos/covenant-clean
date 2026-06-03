import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  router,
  useFocusEffect,
} from "expo-router";

import CovenantBackdrop from "../components/CovenantBackdrop";
import {
  SUPPORT_URL,
} from "../constants/legal";
import {
  useSubscription,
} from "../context/SubscriptionContext";
import {
  useAuthStore,
} from "../store/authStore";
import {
  clearLegacyFreeHabit,
} from "../utils/freeHabit";
import {
  clearProgressUser,
} from "../utils/progress";
import {
  getLanguage,
  Language,
  saveLanguage,
} from "../utils/language";
import {
  hasProAccess,
  restorePurchases,
} from "../services/revenuecat";

const COLORS = {
background: "#050505",
bronze: "#b87333",
bronzeBright: "#D88C3A",
text: "#f5f5f5",
muted: "#B8AEA4",
quiet: "#867D74",
border: "rgba(216,140,58,0.42)",
borderSoft: "rgba(255,232,200,0.12)",
panel: "rgba(8,7,6,0.82)",
danger: "#ffb08c",
};

const LANGUAGE_SAVE_TIMEOUT_MS = 2000;

function withTimeout<T>(
promise: Promise<T>,
timeoutMs: number
): Promise<T> {
return new Promise((resolve, reject) => {
const timeout =
setTimeout(
() => reject(new Error("Language save timed out.")),
timeoutMs
);

promise
.then(resolve)
.catch(reject)
.finally(() => clearTimeout(timeout));
});
}

export default function SettingsScreen() {
const {
refreshSubscription,
} = useSubscription();

const deleteAccount =
useAuthStore(
(state) => state.deleteAccount
);

const [
language,
setLanguage,
] = useState<Language>("es");

const [
isSavingLanguage,
setIsSavingLanguage,
] = useState(false);

const [
isRestoring,
setIsRestoring,
] = useState(false);

const [
deleteVisible,
setDeleteVisible,
] = useState(false);

const [
deletePassword,
setDeletePassword,
] = useState("");

const [
isDeleting,
setIsDeleting,
] = useState(false);

const mountedRef = useRef(true);

useEffect(() => {
return () => {
mountedRef.current = false;
};
}, []);

const loadLanguage =
useCallback(async () => {
const currentLanguage =
await getLanguage();

if (!mountedRef.current) {
return;
}

setLanguage(currentLanguage);
}, []);

useFocusEffect(
useCallback(() => {
loadLanguage().catch(() => undefined);
}, [loadLanguage])
);

useEffect(() => {
loadLanguage().catch(() => undefined);
}, [loadLanguage]);

const t =
language === "es"
? {
title: "Configuracion",
subtitle: "Ajusta Covenant sin romper tu progreso.",
language: "Idioma",
spanish: "Español",
english: "English",
restore: "Restaurar compras",
support: "Soporte / contacto",
deleteAccount: "Eliminar cuenta",
deleteTitle: "Eliminar cuenta",
deleteText:
"Esto eliminara permanentemente tu cuenta, progreso y datos asociados. Ingresa tu contrasena para confirmar.",
password: "Contrasena",
cancel: "Cancelar",
deleteConfirm: "Eliminar cuenta",
deleteError: "No se pudo eliminar la cuenta",
passwordRequired:
"Ingresa tu contrasena para eliminar tu cuenta.",
deletedTitle: "Cuenta eliminada",
deletedText: "Tu cuenta y progreso fueron eliminados.",
restoreActive: "Tus compras fueron restauradas.",
restoreInactive:
"No encontramos una suscripcion Pro activa para restaurar.",
restoreError:
"No se pudieron restaurar las compras. Intenta de nuevo.",
done: "OK",
back: "Volver",
processing: "Procesando",
}
: {
title: "Settings",
subtitle: "Adjust Covenant without disturbing your progress.",
language: "Language",
spanish: "Español",
english: "English",
restore: "Restore purchases",
support: "Support / contact",
deleteAccount: "Delete account",
deleteTitle: "Delete account",
deleteText:
"This will permanently delete your account, progress, and associated data. Enter your password to confirm.",
password: "Password",
cancel: "Cancel",
deleteConfirm: "Delete account",
deleteError: "Could not delete account",
passwordRequired:
"Enter your password to delete your account.",
deletedTitle: "Account deleted",
deletedText: "Your account and progress were deleted.",
restoreActive: "Your purchases were restored.",
restoreInactive:
"No active Pro subscription was found to restore.",
restoreError:
"Could not restore purchases. Please try again.",
done: "OK",
back: "Back",
processing: "Processing",
};

async function changeLanguage(
nextLanguage: Language
) {
if (
isSavingLanguage ||
nextLanguage === language
) {
return;
}

setIsSavingLanguage(true);
setLanguage(nextLanguage);

try {
await withTimeout(
saveLanguage(nextLanguage),
LANGUAGE_SAVE_TIMEOUT_MS
);
} catch (error) {
console.warn("[Settings] Could not persist language.", error);
} finally {
if (!mountedRef.current) {
return;
}

setIsSavingLanguage(false);
}
}

async function handleRestorePurchases() {
setIsRestoring(true);

try {
const customerInfo =
await restorePurchases();

if (
customerInfo &&
hasProAccess(customerInfo)
) {
await refreshSubscription();
Alert.alert(t.restore, t.restoreActive);
return;
}

Alert.alert(t.restore, t.restoreInactive);
} catch (error) {
console.error("[Settings] Restore purchases failed.", error);
Alert.alert(t.restore, t.restoreError);
} finally {
if (!mountedRef.current) {
return;
}

setIsRestoring(false);
}
}

function openSupport() {
Linking.openURL(SUPPORT_URL)
.catch(() => undefined);
}

function openDeleteAccount() {
setDeletePassword("");
setDeleteVisible(true);
}

function closeDeleteAccount() {
setDeleteVisible(false);
setDeletePassword("");
}

async function confirmDeleteAccount() {
const password =
deletePassword.trim();

if (!password) {
Alert.alert(t.deleteError, t.passwordRequired);
return;
}

setIsDeleting(true);

try {
await deleteAccount(password);
await clearProgressUser();
await clearLegacyFreeHabit();

setDeleteVisible(false);
setDeletePassword("");

Alert.alert(
t.deletedTitle,
t.deletedText,
[
{
text: t.done,
onPress: () =>
router.replace("/auth" as never),
},
]
);
} catch (error) {
Alert.alert(
t.deleteError,
error instanceof Error
? error.message
: t.deleteError
);
} finally {
if (!mountedRef.current) {
return;
}

setIsDeleting(false);
}
}

return (
<View style={styles.container}>
<CovenantBackdrop intensity="medium" variant="habits" />

<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={styles.scrollContent}
>
<View style={styles.headerRow}>
<TouchableOpacity
activeOpacity={0.72}
onPress={() => router.back()}
style={styles.backButton}
>
<Text style={styles.backText}>{t.back}</Text>
</TouchableOpacity>
</View>

<Text style={styles.kicker}>COVENANT</Text>
<Text style={styles.title}>{t.title}</Text>
<Text style={styles.subtitle}>{t.subtitle}</Text>

<View style={styles.panel}>
<Text style={styles.sectionLabel}>{t.language}</Text>

<View style={styles.languageRow}>
<TouchableOpacity
activeOpacity={0.82}
onPress={() => changeLanguage("es")}
disabled={isSavingLanguage}
style={[
styles.languageButton,
language === "es" && styles.languageButtonActive,
]}
>
<Text
style={[
styles.languageText,
language === "es" && styles.languageTextActive,
]}
>
{t.spanish}
</Text>
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.82}
onPress={() => changeLanguage("en")}
disabled={isSavingLanguage}
style={[
styles.languageButton,
language === "en" && styles.languageButtonActive,
]}
>
<Text
style={[
styles.languageText,
language === "en" && styles.languageTextActive,
]}
>
{t.english}
</Text>
</TouchableOpacity>
</View>

{isSavingLanguage && (
<ActivityIndicator
color={COLORS.bronzeBright}
style={styles.inlineSpinner}
/>
)}
</View>

<View style={styles.panel}>
<TouchableOpacity
activeOpacity={0.78}
onPress={handleRestorePurchases}
disabled={isRestoring}
style={styles.rowButton}
>
<Text style={styles.rowText}>
{isRestoring ? t.processing : t.restore}
</Text>
{isRestoring && (
<ActivityIndicator color={COLORS.bronzeBright} />
)}
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.78}
onPress={openSupport}
style={styles.rowButton}
>
<Text style={styles.rowText}>{t.support}</Text>
</TouchableOpacity>
</View>

<View style={styles.dangerPanel}>
<TouchableOpacity
activeOpacity={0.78}
onPress={openDeleteAccount}
style={styles.dangerButton}
>
<Text style={styles.dangerText}>{t.deleteAccount}</Text>
</TouchableOpacity>
</View>
</ScrollView>

<Modal
visible={deleteVisible}
transparent
animationType="fade"
onRequestClose={closeDeleteAccount}
>
<View style={styles.deleteOverlay}>
<View style={styles.deletePanel}>
<Text style={styles.deleteTitle}>{t.deleteTitle}</Text>
<Text style={styles.deleteBody}>{t.deleteText}</Text>

<TextInput
value={deletePassword}
onChangeText={setDeletePassword}
placeholder={t.password}
placeholderTextColor="rgba(245,245,245,0.38)"
secureTextEntry
autoCapitalize="none"
autoCorrect={false}
editable={!isDeleting}
style={styles.deleteInput}
/>

<TouchableOpacity
activeOpacity={0.82}
onPress={confirmDeleteAccount}
disabled={isDeleting}
style={[
styles.deleteConfirm,
isDeleting && styles.disabled,
]}
>
{isDeleting ? (
<ActivityIndicator color={COLORS.background} />
) : (
<Text style={styles.deleteConfirmText}>
{t.deleteConfirm}
</Text>
)}
</TouchableOpacity>

<TouchableOpacity
activeOpacity={0.72}
onPress={closeDeleteAccount}
style={styles.deleteCancel}
>
<Text style={styles.deleteCancelText}>
{isDeleting ? t.processing : t.cancel}
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
backgroundColor: COLORS.background,
},

scrollContent: {
paddingHorizontal: 22,
paddingTop: 58,
paddingBottom: 90,
},

headerRow: {
alignItems: "flex-start",
marginBottom: 28,
},

backButton: {
borderWidth: 1,
borderColor: COLORS.border,
borderRadius: 999,
paddingHorizontal: 16,
paddingVertical: 10,
backgroundColor: "rgba(10,8,6,0.66)",
},

backText: {
color: COLORS.bronze,
fontSize: 11,
letterSpacing: 2.4,
fontWeight: "700",
},

kicker: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 8,
marginBottom: 18,
},

title: {
color: COLORS.text,
fontSize: 38,
lineHeight: 48,
fontWeight: "300",
marginBottom: 12,
},

subtitle: {
color: COLORS.muted,
fontSize: 16,
lineHeight: 26,
marginBottom: 30,
},

panel: {
backgroundColor: COLORS.panel,
borderWidth: 1,
borderColor: COLORS.borderSoft,
borderRadius: 22,
padding: 20,
marginBottom: 18,
shadowColor: COLORS.bronze,
shadowOpacity: 0.12,
shadowRadius: 24,
shadowOffset: {
width: 0,
height: 14,
},
elevation: 5,
},

sectionLabel: {
color: COLORS.bronze,
fontSize: 10,
letterSpacing: 4,
fontWeight: "700",
marginBottom: 16,
},

languageRow: {
flexDirection: "row",
gap: 12,
},

languageButton: {
flex: 1,
minHeight: 54,
borderRadius: 16,
borderWidth: 1,
borderColor: COLORS.borderSoft,
alignItems: "center",
justifyContent: "center",
backgroundColor: "rgba(255,255,255,0.04)",
},

languageButtonActive: {
borderColor: COLORS.border,
backgroundColor: "rgba(216,140,58,0.16)",
},

languageText: {
color: COLORS.muted,
fontSize: 15,
fontWeight: "500",
},

languageTextActive: {
color: COLORS.text,
},

inlineSpinner: {
marginTop: 16,
},

rowButton: {
minHeight: 58,
borderBottomWidth: 1,
borderBottomColor: "rgba(255,232,200,0.08)",
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
gap: 14,
},

rowText: {
color: COLORS.text,
fontSize: 15,
letterSpacing: 1.2,
},

dangerPanel: {
marginTop: 8,
alignItems: "center",
},

dangerButton: {
paddingHorizontal: 18,
paddingVertical: 14,
},

dangerText: {
color: COLORS.danger,
fontSize: 12,
letterSpacing: 2,
},

deleteOverlay: {
flex: 1,
backgroundColor: "rgba(0,0,0,0.82)",
paddingHorizontal: 24,
alignItems: "center",
justifyContent: "center",
},

deletePanel: {
width: "100%",
backgroundColor: "#070707",
borderWidth: 1,
borderColor: "rgba(255,176,140,0.42)",
borderRadius: 24,
padding: 26,
},

deleteTitle: {
color: COLORS.text,
fontSize: 28,
lineHeight: 36,
fontWeight: "300",
marginBottom: 16,
},

deleteBody: {
color: COLORS.muted,
fontSize: 15,
lineHeight: 25,
marginBottom: 20,
},

deleteInput: {
height: 54,
borderWidth: 1,
borderColor: "rgba(255,255,255,0.12)",
borderRadius: 14,
paddingHorizontal: 15,
color: COLORS.text,
backgroundColor: "rgba(255,255,255,0.03)",
fontSize: 16,
marginBottom: 16,
},

deleteConfirm: {
height: 56,
borderRadius: 999,
backgroundColor: COLORS.danger,
alignItems: "center",
justifyContent: "center",
marginBottom: 12,
},

deleteConfirmText: {
color: COLORS.background,
fontSize: 11,
letterSpacing: 2.4,
fontWeight: "700",
textAlign: "center",
},

deleteCancel: {
alignItems: "center",
paddingVertical: 12,
},

deleteCancelText: {
color: COLORS.muted,
fontSize: 12,
letterSpacing: 3,
},

disabled: {
opacity: 0.72,
},
});
