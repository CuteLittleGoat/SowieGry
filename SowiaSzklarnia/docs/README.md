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

Gra zapisuje się automatycznie w `localStorage` pod kluczem:

```txt
sowiaSzklarniaSave
```

Zapis przetrwa odświeżenie strony i zamknięcie przeglądarki. W zakładce **Staty** jest też przycisk ręcznego zapisu oraz resetu lokalnego zapisu.

## Offline progress

Po powrocie do gry sowa podsumuje, ile zebrała podczas nieobecności. Offline progress nalicza liście, wodę, nasiona, pyłek, kompost i postęp wzrostu roślin.
