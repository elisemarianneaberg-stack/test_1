# Programmering – GitHub för designers

En enkel kurs i GitHub för UX-designers, ungefär 3 timmar. Eleverna lägger upp sin onepager från HTML/CSS-kursen och lär sig:

| Del | Kapitel |
|---|---|
| Kom igång | Vad är Git och GitHub? · Förberedelser: konto och verktyg |
| Ditt första repo | Skapa ett repo · Inställningar: synlighet, README och licens |
| Spara och synka | Hämta repot till datorn · Commit · Push och pull · Branch |
| Samarbeta | Bjud in och dela · Forka någon annans repo |
| Ordlista | Det dagliga flödet · alla ord och knappar |

Allt görs med knappar i **VS Code** (eller Cursor, som ser likadan ut) och på **github.com**. De enda kommandona är två rader `git config` i kapitel 2.

## Kom igång

Öppna mappen i VS Code och starta **Live Server** på `index.html`, eller lägg upp den med GitHub Pages. Inga beroenden, ingen build.

## Filer

```
├── index.html
├── css/style.css     ← samma design som HTML/CSS-kursen + skisser och checklistor längst ner
├── images/brand-mark.svg
└── js/
    ├── content.js    ← alla kapitel, quiz och ordlistan
    └── app.js        ← logiken, skisserna (UI) och bilderna (FIGURES)
```

## Ändra innehållet

Allt innehåll ligger i `js/content.js`. Blocktyperna beskrivs högst upp i filen. Nytt för den här kursen:

- `{ t: "steps", id, title, items }` – en checklista där eleven bockar av stegen. Bockarna sparas i webbläsaren.
- `{ t: "ui", kind, caption }` – en förenklad skiss av GitHub eller VS Code. Skisserna finns i `UI` i `app.js`.
- `{ t: "figure", kind, caption }` – en förklarande bild (`flow` eller `branch`).

## Bra att veta

GitHub uppdaterar sitt gränssnitt då och då. Skisserna är förenklade och visar var knapparna sitter – knappnamnen i texten är det viktiga. Stäm av mot github.com innan kursen och ändra texten i `content.js` om något har bytt namn.
