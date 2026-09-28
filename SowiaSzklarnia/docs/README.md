# Sowia Szklarnia — instrukcja gracza

**Sowia Szklarnia** to cute idle-management w stylu lekkiego przekroju budynku: budujesz pomieszczenia szklarni, sadzisz rośliny, produkujesz wodę, nasiona, pyłek i kompost, krzyżujesz gatunki oraz przeganiasz kozy podgryzające liście.

## Jak grać

1. Klikaj **Zbierz liście**, żeby zdobyć pierwsze liście.
2. W zakładce **Budowa** buduj nowe pomieszczenia.
3. W zakładce **Rośliny** sadź gatunki, na które masz nasiona i wodę.
4. Zbuduj **Zraszalnię**, żeby produkować wodę.
5. Zbuduj **Sadzonkarnię**, żeby produkować nasiona.
6. Zbuduj **Krzyżówkarium**, żeby krzyżować dojrzałe rośliny.
7. Gdy pojawi się koza, kliknij ją albo użyj przycisku **SIO! SIO!**.

## Kozy

Kozy pojawiają się co jakiś czas i podgryzają liście. Po kliknięciu sowa mówi:

```txt
SIO! SIO!
```

Koza ucieka, a gracz dostaje małą nagrodę: odzyskane liście, kompost albo nasiona.

## Zapis

Gra zapisuje się automatycznie w chmurze (Firestore) — ta sama szklarnia na telefonie i komputerze. Przy pierwszym wejściu na nowym urządzeniu trzeba raz wpisać hasło `huhu`.

- zwykła gra zapisuje się co pół minuty, a ważne akcje (budowa, ulepszenia, badania, krzyżowanie) po 2 sekundach;
- przejście do innej aplikacji lub zablokowanie telefonu zapisuje postęp od razu;
- bez internetu gra działa dalej, a zapis wyśle się, gdy wróci zasięg;
- jeśli grasz jednocześnie na drugim urządzeniu, gra zapyta, czy wczytać nowszy postęp.

W zakładce **Staty** jest przycisk ręcznego zapisu oraz reset szklarni. **Reset usuwa zapis na wszystkich urządzeniach.**

## Offline progress

Po powrocie do gry (także po przełączeniu się na inną aplikację na telefonie) sowa podsumuje, ile zebrała podczas nieobecności. Offline progress nalicza liście, wodę, nasiona, pyłek, kompost i postęp wzrostu roślin.

## Okno rekordów

Przycisk **🏆** w prawym górnym rogu pokazuje podsumowanie postępu zapisane w chmurze (np. liście zebrane w całej grze).

## Gra jako aplikacja na telefonie

SowieGry można dodać do ekranu głównego (Android: menu ⋮ → „Zainstaluj aplikację”; iPhone: „Udostępnij” → „Do ekranu początkowego”). Gra otwierana wcześniej uruchomi się wtedy także bez zasięgu.
