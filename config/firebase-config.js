// config/firebase-config.js
// Konfiguracja Firebase dla SowieGry: ustawia window.firebaseConfig (zwykły skrypt, bez "export").
// Czyta ją wyłącznie shared/sowie-cloud.js (Firebase JS SDK 12.19.0, nazwana aplikacja "sowiegry").
// Od 2026-11-23 SowieGry mają własny projekt sowiegry-1e1f9 (konto właściciela, aplikacja internetowa „SowieGry”,
// darmowy plan Spark): kolekcja "sowiegry" i jej podkolekcje "sowiegry_gry" oraz "sowiegry_historia".
// Do 2026-11-23 był to projekt rpg-dataslate-relay, współdzielony z innym projektem właściciela — dane SowieGry
// zostały tam jako archiwum, nic nie zostało skasowane (Analizy/PRZENIESIENIE_FIRESTORE.md).
// apiKey nie jest tajny — o dostępie decydują reguły Firestore (kopia w firestore.rules).
window.firebaseConfig = {
apiKey: "AIzaSyD4e0qJ8AMbBJ1aLZUteOpLdTPPuG5PuAo",
authDomain: "sowiegry-1e1f9.firebaseapp.com",
projectId: "sowiegry-1e1f9",
storageBucket: "sowiegry-1e1f9.firebasestorage.app",
messagingSenderId: "927017889038",
appId: "1:927017889038:web:e47e5838039354e9c0fb5f"
};
