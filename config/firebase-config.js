// Plik logiki modułu: konfiguracja, funkcje i obsługa zdarzeń / Module logic file: configuration, functions, and event handling
// config/firebase-config.js
// GLOBALNA konfiguracja Firebase dla GM.html i DataSlate.html
// (nie używamy "export", żeby działało też z firebase-*-compat)

// WAŻNE WDROŻENIE: Każda grupa (każdy serwer) powinna mieć własny projekt Firebase i własny komplet kluczy poniżej.
// IMPORTANT DEPLOYMENT: Each group (each server) should use its own Firebase project and its own full key set below.
window.firebaseConfig = {
apiKey: "AIzaSyDA0TbxOwO2rUbSIx7hm-lsbYVTmyepTZc",
authDomain: "rpg-dataslate-relay.firebaseapp.com",
projectId: "rpg-dataslate-relay",
storageBucket: "rpg-dataslate-relay.firebasestorage.app",
messagingSenderId: "874318505488",
appId: "1:874318505488:web:2366bc5a0adff7b7b44c95"
};
