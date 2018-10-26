# Instalace
  `yarn install`

# MacOS
  - spustit pomocí `yarn dev`
  1. build: `yarn build-mac` (spustí se i build React)

# Windows

  - spustit pomocí `yarn start` a `yarn electron`
  1. build React: `yarn build-react`
  1. build: `yarn build-windows`

# TODO:

  ## 20.7.2018, 25.10.2018
  - [x] zrušit findDOMNode
  - [x] aktualizovat React, ReactDOM, electron
  - [x] disablovat, nebo opravit eslint hlášky
  - [ ] zatím minifikovat JSON, později ukládat nějak jinak
  - [ ] opravit nefukční klávesové zkratky (?)
  - [ ] postup řazení časů u operací (podle posloupnosti časů/hodin)
  - [ ] menu výrobku jako u kooperace + doplnit poznámku
  - [ ] předělat context menu na normální systémové context menu
  - [ ] testovat aspoň některé funkce
  - [ ] urychlit renderování spodní tabulky
  - [x] když se blíží termín, tak obarvit
    - den před - oranžová
    - týden před - žlutá
    - ten den - červená
  - [ ] prodloužit čas zobrazení menu u operace (cca 2 s.)
  - [ ] Zakázky
    - řazení podle stavu dokončení (prvně nedokončené) + podle čísla zakázky
    - možnost zobrazit jen nedokončené
  - [ ] Možnost uzavření operace
  - [x] Kopírování práce - události, např.při rozdělení jedné operace (pravý klik na událost -> kopírovat -> otevře se okno, změním jenom datum)
  - [ ] Zborazovat stoj u operace
  - [x] Možnost zadání výrobku do zakázky ještě bez práce - vyřešili pomocí nového řádku, kam "odkládají" nezařazené zakázky

  ## Bugy a dodělávky
  - [x] opravit první spuštění bez nastavení skrytých sloupců
  - [x] zčernat čas v OrderTable, který je 0
  - [x] zmenšit písmo v tabulce, nižší řádky, padding, ...
  - [x] červeně obarvit čas v operacích (přebytek modře, zbývá červeně)
  - [x] tooltip s časem přesunout pod událost (ne nad)
  - [x] zrušit celkový čas na zakázku a dát to přímo k zakázce (možná do tooltipu)
  - [x] sloupec ukončení výroby - vyplnit poslední napolánované datum výrobku v zakázce
  - [x] přidat popis operace do popupu
  - [x] přidat volbu pro 7. operaci - Kooperace (stačí zapsat počet kusů, časy tam být nemusí, skrývat je?), označit výrobek že se jedná o kooperaci
  - [x] do tooltipu v OrderTable vypsat datum(y) operací, aby věděli, kde to hledat + připsat popis operace
  - [x] po najetí myší na název výrobku zobrazit informace v tooltipu (jedná se o kooperaci, nebo seznam operací i s popiskem)
  - [x] povolit znovuotevření zakázek a výrobků
  - [x] změnit uspořádání informací v popupu s informací o události (po najetí na eventu v kalendáři)
  - [x] zobrazit naplánovou a skutečnou dobu do náhledu (vztahuje se pouze pro danou eventu)
  - [x] špatné výpočty zbývajícího času v OrderPopup
  - [x] aplikace spadne, pokud najedu na ukončenou zakázku a mám skryté dokončené zakázky
  - [x] zkontrolovat groupování zakázka v helpers, jestli se něco nepočítá zbytečně několikrát + kontrola toho jak ukládám info do objektů
  - [x] - zjednodušit výpis operačních sloupců v render table, použil jsem const se sloupci, které pak mapuji
  - [x] přidat možnost skrytí sloupců
  - [x] ukládat nastavení aplikace do localStorage a ne do souboru
  - [x] zůžit sloupce a roztáhnout sloupce s operacemi
  - [x] přidat do nastavení zobrazení total row
  - [x] opravit přesun události v 20:00, událost se zkrátí
  - [x] ztmavit rámeček při pokládání události
  - [x] úprava času výpočtu na operaci
  - [x] zobrazení operace v tabulce
  - [x] zobrazení času jednotlivých operací
  - [x] zadání času ukončení výroby výrobku
  - [x] oprava výpočtu šířek (občas se rozpadne)
  - [x] opravit dopočet zbývajících hodin v popup
  - [x] když je prázdná objednávka a zadávám novou zakázku s operací, tak se špatně (opět) vypočítá zbývajíécí doba k naplánování
  - [x] scrollování spodní tabulky, i pokud je tam jen jeden záznam
  - [x] položení události na 30 minutu se nenatáhne
  - [x] oprava refreshe OrderTable
  - [x] opravit sčítání počtu kusů u zakázek na více strojích
  - [x] zkontrolovat proč se ukládají u products "-"
  - [x] opravit pozici tooltipu
  - [x] možnost nastavení času po půl hodině
  - [x] opravit časový posun při změně události
  - [x] kontrola vykreslení objednávek, které se táhnou přes více týdnů
  - [x] možnost zvětšení eventy
  - [x] možnost přidání strojů a jejich barev
  - [x] pod jakým IDčkem ukládat zakázky? datum? nějaké číslo co si oni vymyslí?


### Nespěchá
  - možnost definovat pracovní dobu
  - v kalendáři možnost nastavení pauzy (čas od-do, opakující se pro každý den)


## INFO
  - [x] Zakázka - doplnit do popupu (zakázka === ID)
  - názvy výrobků ukládat (přidat do nastavení, v nastavení bude správa strojů, pracovníků, výrobků) (+ ukládat i jejich časy)
  - [x] jedna zakázka může pracovat na více strojích (vytvořit nějaké ID a párovat podle strojů - Zakázka je ID a páruje se podle toho)