# TODO:

    X zmenšit písmo v tabulce, nižší řádky, padding, ...
    X červeně obarvit čas v operacích (přebytek modře, zbývá červeně)
    X tooltip s časem přesunout pod událost (ne nad)
    X zrušit celkový čas na zakázku a dát to přímo k zakázce (možná do tooltipu)
    X sloupec ukončení výroby - vyplnit poslední napolánované datum výrobku v zakázce
    X přidat popis operace do popupu
    X přidat volbu pro 7. operaci - Kooperace (stačí zapsat počet kusů, časy tam být nemusí, skrývat je?), označit výrobek že se jedná o kooperaci
    X do tooltipu v OrderTable vypsat datum(y) operací, aby věděli, kde to hledat + připsat popis operace
    X po najetí myší na název výrobku zobrazit informace v tooltipu (jedná se o kooperaci, nebo seznam operací i s popiskem)
    - zobrazit naplánovou a skutečnou dobu do náhledu (vztahuje se pouze pro danou eventu)
    - změnit uspořádání informací v popupu s informací o události (po najetí na eventu v kalendáři)
    - povolit znovuotevření zakázek a výrobků

    - špatné výpočty zbývajícího času v OrderPopup
    - zkontrolovat groupování zakázka v helpers, jestli se něco nepočítá zbytečně několikrát + kontrola toho jak ukládám info do objektů

    X - zjednodušit výpis operačních sloupců v render table, použil jsem const se sloupci, které pak mapuji
    X přidat možnost skrytí sloupců
    X ukládat nastavení aplikace do localStorage a ne do souboru
    X zůžit sloupce a roztáhnout sloupce s operacemi
    X přidat do nastavení zobrazení total row
    X opravit přesun události v 20:00, událost se zkrátí
    X ztmavit rámeček při pokládání události
    X úprava času výpočtu na operaci
    X zobrazení operace v tabulce
    X zobrazení času jednotlivých operací
    X zadání času ukončení výroby výrobku
    X oprava výpočtu šířek (občas se rozpadne)
    X opravit dopočet zbývajících hodin v popup
    X když je prázdná objednávka a zadávám novou zakázku s operací, tak se špatně (opět) vypočítá zbývajíécí doba k naplánování
    x scrollování spodní tabulky, i pokud je tam jen jeden záznam
    X položení události na 30 minutu se nenatáhne
    X oprava refreshe OrderTable
    X opravit sčítání počtu kusů u zakázek na více strojích
    X zkontrolovat proč se ukládají u products "-"
    X opravit pozici tooltipu
    X možnost nastavení času po půl hodině
    X opravit časový posun při změně události
    X kontrola vykreslení objednávek, které se táhnou přes více týdnů
    X možnost zvětšení eventy
    X možnost přidání strojů a jejich barev
    X pod jakým IDčkem ukládat zakázky? datum? nějaké číslo co si oni vymyslí?


### Nespěchá
    - možnost definovat pracovní dobu
    - v kalendáři možnost nastavení pauzy (čas od-do, opakující se pro každý den)


## INFO

    X Zakázka - doplnit do popupu (zakázka === ID)
    - názvy výrobků ukládat (přidat do nastavení, v nastavení bude správa strojů, pracovníků, výrobků) (+ ukládat i jejich časy)
    X jedna zakázka může pracovat na více strojích (vytvořit nějaké ID a párovat podle strojů - Zakázka je ID a páruje se podle toho)