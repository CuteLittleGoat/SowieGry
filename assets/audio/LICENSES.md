# Dźwięki SowieGry — pochodzenie i licencje

Wszystkie pliki w `assets/audio/sfx/` i `assets/audio/music/` zostały **wygenerowane kodem** skryptu
`scripts/make-audio.mjs` (syntezator zapisany w tym repozytorium, stałe ziarno losowania — wynik jest powtarzalny).
Nie zawierają cudzych nagrań, próbek ani fragmentów utworów. Melodie „Motyw menu”, „Pieśń humbaka”, motyw
Sowiej Ucieczki i cztery motywy plansz Sowich Torów to własne kompozycje zapisane w tym samym skrypcie.

- Licencja plików dźwiękowych: **CC0 1.0** (domena publiczna) — jak paczki CC0 wymienione w Analizie 2 (rozdz. 2.4);
  właściciel projektu może ją zmienić.
- Narzędzie do kodowania MP3: `@breezystack/lamejs` 1.2.7 (LGPL-3.0) — używane wyłącznie przy budowie plików
  (zależność deweloperska), nie jest dołączane do strony; licencja narzędzia nie obejmuje wygenerowanych plików.

## Pliki

| Plik | Opis |
|---|---|
| `sfx/*.mp3` | 27 efektów (mono, 64 kb/s, 44,1 kHz): skok, podwójny skok, szybowanie (pętla), ślizg, lądowanie, liść, złoty liść, tęczowy liść, start Gorączki Monster, trafienie przez Pracu („pracu!”), trafienie przez Amic (bonk), kózka („meee”), start i koniec power-upu, plusk humbaka, zawołanie humbaka, start bonusu, dodatkowe życie, nowy rekord, kliknięcie, zakup, połączenie (merge), odliczanie, odliczanie — start, koniec gry (smutne „hu-hu”), sowa „hu-hu!”, dzwonek (zapowiedź Pracu) |
| `music/menu.mp3` | motyw menu — 112 BPM, C-dur, 8 taktów, pętla bez szwu (stereo, 96 kb/s) |
| `music/humbak.mp3` | pieśń humbaka (bonus) — 72 BPM, D-dur, 8 taktów, pady, pieśń wieloryba, krople, szum fal (stereo, 64 kb/s) |
| `music/ucieczka.mp3` | motyw Sowiej Ucieczki (bieg) — 125 BPM, G-dur (G–e–C–D), 8 taktów, bas ósemkami, marimba, melodia, perkusja (stereo, 80 kb/s) |
| `music/tory-biedronka.mp3` | Sowie Tory, plansza 1 (sklep Biedronka) — 118 BPM, F-dur (F–d–B–C), 8 taktów, sklepowy dżingiel: melodia trójkątną falą, bas ósemkami, marimba, perkusja (stereo, 48 kb/s) |
| `music/tory-festiwal.mp3` | Sowie Tory, plansza 2 (festiwal roślin) — 104 BPM, A-dur (A–fis–D–E), 8 taktów, flet (sinus z vibrato), bas półnutami, lekka perkusja (stereo, 48 kb/s) |
| `music/tory-prl.mp3` | Sowie Tory, plansza 3 (blokowisko PRL, pościg dzików) — 132 BPM, a-moll (a–F–G–E), 8 taktów, kwadratowy syntezator, gęsta perkusja (stereo, 48 kb/s) |
| `music/tory-amic.mp3` | Sowie Tory, plansza 4 (stacja Amic) — 126 BPM, D-dur (D–h–G–A), 8 taktów, piłokształtny syntezator z filtrem, bas ósemkami (stereo, 48 kb/s) |
| `music/chmury.mp3` | Sowa w Chmurach (lot) — 100 BPM, G-dur (G–e–C–D), 8 taktów, flet (sinus z vibrato) wznoszący się po akordach, bas półnutami, delikatna perkusja (stereo, 48 kb/s) |
| `music/ogrod.mp3` | Sowie Ogrody (ogród) — 84 BPM, F-dur (F–d–B–C), 8 taktów, miękki trójkąt z filtrem, bas półnutami, cicha perkusja (stereo, 48 kb/s) |
| `music/szklarnia.mp3` | Łącz i Hoduj (szklarnia) — 76 BPM, G-dur (G–e–C–D), 8 taktów, łagodna sinusoida z filtrem, bas półnutami, ledwie słyszalna perkusja (stereo, 48 kb/s) |
| `audio.json` | manifest: plik, rozmiar, długość, liczba próbek, początek dźwięku, podpis, głośność, pętla, limit głosów, odstęp, odcisk początku pętli |

## Nagrania właściciela (opcjonalne)

Własne nagrania „Hu-hu!” i „Pracu pracu!” (np. dyktafonem w telefonie) można podmienić bez programowania:

1. Zapisz nagranie jako WAV PCM 16 bit (np. w Audacity: „Eksportuj → WAV (16-bit PCM)”).
2. Umieść plik jako `assets/audio/glosy/hu-hu.wav` (sowa), `assets/audio/glosy/koniec-gry.wav` (smutne „hu-hu” po przegranej)
   albo `assets/audio/glosy/trafienie-pracu.wav` („pracu pracu!”). Nazwa pliku = nazwa efektu z `audio.json`.
3. Uruchom `node scripts/make-audio.mjs` — nagranie zastąpi syntezowany efekt (w manifeście pojawi się `"recorded": true`).
4. Podnieś `VERSION` w `sw.js`, żeby zainstalowana aplikacja pobrała nowe pliki.

Nagrania właściciela należą do właściciela projektu.
