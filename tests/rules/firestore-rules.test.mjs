// Testy reguł Firestore (firestore.rules = reguły projektu sowiegry-1e1f9, opublikowane 2026-11-23) na emulatorze.
// Od przeniesienia SowieGry do własnego projektu (2026-11-23) reguły obejmują tylko SowieGry — reszta jest zamknięta.
// Uruchamiane przez `npm run test:e2e` (firebase emulators:exec ustawia FIRESTORE_EMULATOR_HOST).
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";

let env;
let db;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-sowiegry-reguly",
    firestore: { rules: await readFile("firestore.rules", "utf8") },
  });
});

after(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  // Stan początkowy zapisany z pominięciem reguł (jak dane w bazie produkcyjnej).
  await env.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore();
    await setDoc(doc(admin, "audio/favorites"), { list: [1, 2] });
    await setDoc(doc(admin, "sowiegry/meta"), { schemaVersion: 1 });
    await setDoc(doc(admin, "sowiegry/profil"), { schemaVersion: 1, name: "Sowa" });
    await setDoc(doc(admin, "sowiegry/profil/sowiegry_gry/runner/sowiegry_historia/stary"), { score: 5 });
  });
  db = env.unauthenticatedContext().firestore();
});

const fields = (count) => Object.fromEntries(Array.from({ length: count }, (_, index) => [`pole${index}`, index]));

test("kolekcje spoza SowieGry są zamknięte (projekt tylko dla SowieGry)", async () => {
  await assertFails(getDoc(doc(db, "audio/favorites")));
  await assertFails(setDoc(doc(db, "dataslate/test"), { x: 1 }));
  await assertFails(updateDoc(doc(db, "audio/favorites"), { list: [3] }));
  await assertFails(deleteDoc(doc(db, "audio/favorites")));
  await assertFails(setDoc(doc(db, "character_builder/postac/wersje/v1"), { x: 1 }));
  await assertFails(setDoc(doc(db, "nowa_kolekcja/dok"), { x: 1 }));
  await assertFails(getDocs(query(collectionGroup(db, "wersje"))));
});

test("sowiegry/meta: zapis tylko z całkowitym schemaVersion, bez kasowania", async () => {
  await assertSucceeds(getDoc(doc(db, "sowiegry/meta")));
  await assertSucceeds(setDoc(doc(db, "sowiegry/meta"), { schemaVersion: 1, games: ["runner"] }, { merge: true }));
  await assertFails(setDoc(doc(db, "sowiegry/meta"), { x: 1 }));
  await assertFails(setDoc(doc(db, "sowiegry/meta"), { schemaVersion: 1.5 }));
  await assertFails(deleteDoc(doc(db, "sowiegry/meta")));
});

test("sowiegry/profil: schemaVersion i najwyżej 30 pól, bez kasowania", async () => {
  await assertSucceeds(getDoc(doc(db, "sowiegry/profil")));
  await assertSucceeds(setDoc(doc(db, "sowiegry/profil"), { settings: { music: false } }, { merge: true }));
  await assertSucceeds(setDoc(doc(db, "sowiegry/profil"), { schemaVersion: 1, ...fields(29) }));
  await assertFails(setDoc(doc(db, "sowiegry/profil"), { schemaVersion: 1, ...fields(30) }));
  await assertFails(setDoc(doc(db, "sowiegry/profil"), { name: "bez wersji" }));
  await assertFails(deleteDoc(doc(db, "sowiegry/profil")));
});

test("inne ścieżki pod sowiegry są odrzucane", async () => {
  await assertFails(setDoc(doc(db, "sowiegry/cokolwiek"), { schemaVersion: 1 }));
  await assertFails(getDoc(doc(db, "sowiegry/cokolwiek")));
  await assertFails(setDoc(doc(db, "inny/dokument/sowiegry_gry/runner"), { x: 1 }));
});

test("sowiegry_gry: tylko sześć stałych identyfikatorów gier (także trojki)", async () => {
  for (const gameId of ["runner", "jumper", "sowa3", "ogrody", "szklarnia", "trojki"]) {
    await assertSucceeds(setDoc(doc(db, `sowiegry/profil/sowiegry_gry/${gameId}`), { difficulty: "arcade" }));
    await assertSucceeds(getDoc(doc(db, `sowiegry/profil/sowiegry_gry/${gameId}`)));
  }
  await assertFails(setDoc(doc(db, "sowiegry/profil/sowiegry_gry/tetris"), { x: 1 }));
  await assertFails(setDoc(doc(db, "sowiegry/profil/sowiegry_gry/SowaRunner"), { x: 1 }));
});

test("sowiegry_historia: tworzenie z liczbowym score, kasowanie tak, edycja nie", async () => {
  const history = collection(db, "sowiegry/profil/sowiegry_gry/runner/sowiegry_historia");
  await assertSucceeds(addDoc(history, { score: 4210, distance: 1180, difficulty: "arcade" }));
  await assertFails(addDoc(history, { score: "dużo" }));
  await assertFails(addDoc(history, { distance: 5 }));
  await assertSucceeds(getDoc(doc(history, "stary")));
  await assertFails(updateDoc(doc(history, "stary"), { score: 9999 }));
  await assertSucceeds(deleteDoc(doc(history, "stary")));
});

// Wypluffki (Analiza 7b, Załącznik B): jeden gracz i jeden admin — reguły sprawdzają tylko poprawność danych.
const WALLET = "sowiegry_wypluffki/portfel";

async function seedWallet() {
  await env.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore();
    await setDoc(doc(admin, WALLET), { schemaVersion: 1, saldo: 1000, doladowano: 1000, wydano: 0, kupione: {} });
  });
}

test("Wypluffki — portfel: odczyt i poprawne zapisy bez logowania (zakup, doładowanie, założenie)", async () => {
  await seedWallet();
  await assertSucceeds(getDoc(doc(db, WALLET)));
  await assertSucceeds(
    updateDoc(doc(db, WALLET), { saldo: 501, wydano: 499, "kupione.skorka:zlota": { at: 1, cena: 499 } }),
  );
  await assertSucceeds(updateDoc(doc(db, WALLET), { saldo: 1051, doladowano: 1550 }));
  await assertSucceeds(setDoc(doc(db, WALLET), { schemaVersion: 1, saldo: 0, kupione: {} }));
});

test("Wypluffki — portfel: saldo ujemne, ułamek albo tekst, brak schemaVersion i kasowanie odrzucone", async () => {
  await seedWallet();
  await assertFails(updateDoc(doc(db, WALLET), { saldo: -1 }));
  await assertFails(updateDoc(doc(db, WALLET), { saldo: 10.5 }));
  await assertFails(updateDoc(doc(db, WALLET), { saldo: "100" }));
  await assertFails(setDoc(doc(db, WALLET), { saldo: 5 }));
  await assertFails(deleteDoc(doc(db, WALLET)));
});

test("Wypluffki — prośby i historia: zapis z liczbą całkowitą, kasowanie (przywracanie kopii)", async () => {
  await seedWallet();
  const request = doc(db, `${WALLET}/wypluffki_prosby/HU-7F3K-2Q`);
  const entry = doc(db, `${WALLET}/wypluffki_historia/w1`);
  await assertSucceeds(setDoc(request, { kod: "HU-7F3K-2Q", pakiet: "kieszen", kwota: 550, status: "czeka" }));
  await assertSucceeds(updateDoc(request, { status: "zatwierdzone", kwotaPrzyznana: 550 }));
  await assertFails(setDoc(doc(db, `${WALLET}/wypluffki_prosby/HU-AAAA-BB`), { kwota: "550" }));
  await assertSucceeds(deleteDoc(request));
  await assertSucceeds(setDoc(entry, { zmiana: 550, saldoPo: 1550, rodzaj: "doladowanie" }));
  await assertFails(setDoc(doc(db, `${WALLET}/wypluffki_historia/w2`), { saldoPo: 1 }));
  await assertSucceeds(getDocs(collection(db, `${WALLET}/wypluffki_historia`)));
  await assertSucceeds(deleteDoc(entry));
});

test("Wypluffki — inne dokumenty kolekcji sowiegry_wypluffki są zamknięte", async () => {
  await assertFails(setDoc(doc(db, "sowiegry_wypluffki/inny"), { saldo: 1 }));
  await assertFails(getDoc(doc(db, "sowiegry_wypluffki/inny")));
});
