// config/firebase-config.js
// Konfiguracja Firebase dla SowieGry: ustawia window.firebaseConfig (zwykły skrypt, bez "export").
// Czyta ją wyłącznie shared/sowie-cloud.js (Firebase JS SDK 12.19.0, nazwana aplikacja "sowiegry").
// Projekt rpg-dataslate-relay i jego baza Firestore są współdzielone z innym projektem właściciela
// (kolekcje audio, character_builder, dataslate). SowieGry używają tylko kolekcji "sowiegry"
// i jej podkolekcji "sowiegry_gry" oraz "sowiegry_historia".
// apiKey nie jest tajny — o dostępie decydują reguły Firestore (kopia w firestore.rules).
window.firebaseConfig = {
apiKey: "AIzaSyDA0TbxOwO2rUbSIx7hm-lsbYVTmyepTZc",
authDomain: "rpg-dataslate-relay.firebaseapp.com",
projectId: "rpg-dataslate-relay",
storageBucket: "rpg-dataslate-relay.firebasestorage.app",
messagingSenderId: "874318505488",
appId: "1:874318505488:web:2366bc5a0adff7b7b44c95"
};
