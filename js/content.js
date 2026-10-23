/* ==========================================================================
   Programmering – GitHub för designers
   --------------------------------------------------------------------------
   Allt kursinnehåll ligger i den här filen.

   Varje kapitel:
     id, part, title, summary, time, blocks: [...], quiz: [...] (högst 3 frågor)

   Blocktyper:
     { t: "h",     text }                         underrubrik
     { t: "p",     html }                         stycke
     { t: "list",  items: [...], ordered }        punktlista
     { t: "table", head: [...], rows: [[...]] }   tabell
     { t: "tip",   kind: "ux"|"info"|"warn", title, html }
     { t: "code",  lang: "terminal"|"markdown"|"mappar", code }
     { t: "steps", id, title, items: [...] }      bockbar checklista (sparas)
     { t: "ui",    kind, caption }                förenklad skiss av GitHub / VS Code (se app.js → UI)
     { t: "figure", kind, caption }               förklarande bild (se app.js → FIGURES)
     { t: "more",  title, blocks: [...] }         fördjupning, hopfälld

   Knappnamnen på GitHub och i VS Code är på engelska – skriv dem exakt som
   de står i programmet, i <strong>, så att eleverna känner igen dem.
   ========================================================================== */

window.KURS = {
  parts: [
    { id: "start",  title: "Kom igång" },
    { id: "repo",   title: "Ditt första repo" },
    { id: "arbeta", title: "Spara och synka" },
    { id: "dela",   title: "Samarbeta" },
    { id: "ref",    title: "Ordlista" }
  ],
  chapters: [],
  library: []
};

KURS.chapters.push(

  /* ================================================================== */
  {
    id: "git-och-github",
    part: "start",
    title: "Vad är Git och GitHub?",
    summary: "Två verktyg som sparar alla versioner av ditt projekt och låter dig dela det.",
    time: "15 min",
    blocks: [
      { t: "p", html: "Känner du igen filnamn som <code>onepager_final_v3_RIKTIGT_FINAL.html</code>? Git löser det problemet. Istället för nya filer sparar du <strong>versioner</strong> av samma fil – och kan alltid gå tillbaka." },
      { t: "h", text: "Två olika saker" },
      { t: "table", head: ["", "Vad det är"], rows: [
        ["<strong>Git</strong>", "Ett program på din dator som sparar versioner av en mapp."],
        ["<strong>GitHub</strong>", "En webbplats där du lägger upp mappen och dess versioner – så att andra kan se den och jobba med den."]
      ]},
      { t: "p", html: "Du jobbar i <strong>VS Code</strong> (eller Cursor – de ser likadana ut). VS Code har Git inbyggt, så du behöver aldrig skriva kommandon för det vi gör idag." },
      { t: "h", text: "Fem ord du behöver idag" },
      { t: "table", head: ["Ord", "Betyder"], rows: [
        ["<strong>Repo</strong>", "En projektmapp som Git håller koll på."],
        ["<strong>Commit</strong>", "En sparad version, med ett meddelande om vad du ändrade."],
        ["<strong>Push</strong>", "Skicka dina commits från datorn till GitHub."],
        ["<strong>Pull</strong>", "Hämta andras ändringar från GitHub till datorn."],
        ["<strong>Branch</strong>", "En parallell version där du kan testa utan att förstöra."]
      ]},
      { t: "figure", kind: "flow", caption: "Din dator och GitHub. Commit sparar på datorn. Push skickar upp. Pull hämtar ner." },
      { t: "tip", kind: "info", title: "Vad hör hemma i repot?", html: "Allt som sidan behöver för att fungera: HTML, CSS, bilder, SVG-ikoner och typsnitt. För kodfiler visar Git exakt vilka rader som har ändrats. För bilder ser Git bara att filen har bytts ut." }
    ],
    quiz: [
      { q: "Vad är skillnaden mellan Git och GitHub?", options: ["Ingen – det är samma sak", "Git sparar versioner på din dator, GitHub är webbplatsen där de delas", "GitHub är ett program, Git är en webbplats"], answer: 1, explain: "Git är programmet som sparar versioner. GitHub är webbplatsen där repot ligger online." },
      { q: "Vad är en commit?", options: ["En sparad version med ett meddelande", "En uppladdning till GitHub", "En kopia av någon annans projekt"], answer: 0, explain: "En commit är en sparpunkt. Den laddas upp först när du gör push." },
      { q: "Du vill hämta ändringar som någon annan har gjort på GitHub. Vad gör du?", options: ["Push", "Commit", "Pull"], answer: 2, explain: "Pull hämtar ner. Push skickar upp." }
    ]
  },

  /* ================================================================== */
  {
    id: "forberedelser",
    part: "start",
    title: "Förberedelser: konto och verktyg",
    summary: "Skapa ett GitHub-konto, installera Git och koppla ihop VS Code med GitHub.",
    time: "20 min",
    blocks: [
      { t: "p", html: "Det här gör du en gång. Sedan är datorn redo för alla framtida projekt." },
      { t: "h", text: "1. Skapa ett GitHub-konto" },
      { t: "steps", id: "konto", items: [
        "Gå till <a href=\"https://github.com\" target=\"_blank\" rel=\"noopener\">github.com</a> och klicka <strong>Sign up</strong>.",
        "Välj ett <strong>användarnamn</strong> du kan stå för – det syns i alla länkar, t.ex. <code>github.com/anna-andersson</code>.",
        "Bekräfta din e-postadress via mejlet som GitHub skickar."
      ]},
      { t: "h", text: "2. Installera Git" },
      { t: "table", head: ["Dator", "Gör så här"], rows: [
        ["<strong>Mac</strong>", "Öppna VS Code → <strong>Terminal → New Terminal</strong>. Skriv <code>git --version</code> och tryck <kbd>Enter</kbd>. Om Git saknas frågar macOS om du vill installera <em>Command Line Developer Tools</em> – klicka <strong>Install</strong>."],
        ["<strong>Windows</strong>", "Ladda ner Git från <a href=\"https://git-scm.com\" target=\"_blank\" rel=\"noopener\">git-scm.com</a> och installera. Du kan klicka <strong>Next</strong> på alla steg. Starta om VS Code efteråt."]
      ]},
      { t: "p", html: "Klart när <code>git --version</code> svarar med ett versionsnummer, t.ex. <code>git version 2.47.0</code>." },
      { t: "h", text: "3. Berätta för Git vem du är" },
      { t: "p", html: "Varje commit märks med ditt namn. Skriv de här två raderna i terminalen i VS Code – en i taget, med ditt namn och <strong>samma e-post som på GitHub</strong>:" },
      { t: "code", lang: "terminal", code: `git config --global user.name "Anna Andersson"
git config --global user.email "anna@exempel.se"` },
      { t: "p", html: "Det är de enda kommandona i hela kursen. Resten gör du med knappar." },
      { t: "h", text: "4. Logga in på GitHub i VS Code" },
      { t: "steps", id: "logga-in", items: [
        "Klicka på <strong>personikonen</strong> (Accounts) längst ner i vänsterkanten av VS Code.",
        "Välj att logga in med <strong>GitHub</strong>. Webbläsaren öppnas.",
        "Godkänn i webbläsaren och gå tillbaka till VS Code."
      ]},
      { t: "tip", kind: "info", title: "Hoppade du över steg 4?", html: "Ingen fara. VS Code ber dig logga in automatiskt första gången du hämtar eller laddar upp ett repo." }
    ],
    quiz: [
      { q: "Varför spelar ditt GitHub-användarnamn roll?", options: ["Det syns i alla länkar till dina repon", "Det går inte att logga in utan det", "Det bestämmer vilka färger GitHub har"], answer: 0, explain: "Länken till ditt repo blir github.com/användarnamn/repo-namn. Välj något du kan visa en arbetsgivare." },
      { q: "Vilken e-post ska du ange i <code>git config</code>?", options: ["Vilken som helst", "Samma som på ditt GitHub-konto", "Lärarens"], answer: 1, explain: "Då kopplar GitHub dina commits till ditt konto." }
    ]
  },

  /* ================================================================== */
  {
    id: "skapa-repo",
    part: "repo",
    title: "Skapa ett repo",
    summary: "Gör ett nytt repo på GitHub för din onepager.",
    time: "15 min",
    blocks: [
      { t: "p", html: "Ett repo är en projektmapp som Git håller koll på. Du skapar det på GitHub och hämtar det sedan till datorn." },
      { t: "h", text: "Hitta knappen" },
      { t: "ui", kind: "gh-new-menu", caption: "Plustecknet uppe till höger på github.com." },
      { t: "h", text: "Fyll i formuläret" },
      { t: "ui", kind: "gh-new-repo", caption: "Sidan Create a new repository. Siffrorna är samma som stegen nedan." },
      { t: "steps", id: "skapa-repo", items: [
        "Klicka på <strong>+</strong> uppe till höger och välj <strong>New repository</strong>.",
        "<strong>Repository name:</strong> skriv <code>min-onepager</code>. Små bokstäver och bindestreck – inga mellanslag eller å, ä, ö.",
        "<strong>Description:</strong> en mening, t.ex. <em>Min onepager från kursen Programmering</em>. Valfritt.",
        "<strong>Choose visibility:</strong> välj <strong>Public</strong>. Vi går igenom valet i nästa kapitel.",
        "Slå på <strong>Add README</strong>.",
        "Låt <strong>.gitignore</strong> och <strong>license</strong> vara som de är just nu.",
        "Klicka <strong>Create repository</strong>."
      ]},
      { t: "h", text: "Så ser ditt repo ut" },
      { t: "ui", kind: "gh-repo", caption: "Repots startsida. README visas under fillistan." },
      { t: "list", items: [
        "Överst: <strong>ditt-namn / min-onepager</strong> och en etikett som visar att det är <em>Public</em>.",
        "Flikarna. Idag använder du bara <strong>Code</strong> och <strong>Settings</strong>.",
        "Fillistan. Just nu finns bara <code>README.md</code>.",
        "Längst ner visas innehållet i README – repots framsida."
      ]},
      { t: "tip", kind: "info", title: "Gränssnittet ändras ibland", html: "GitHub uppdaterar sitt utseende då och då. Skisserna här är förenklade – leta efter samma <strong>ord</strong> på knapparna om något ser annorlunda ut." }
    ],
    quiz: [
      { q: "Vilket repo-namn är bäst?", options: ["Min Onepager!", "min-onepager", "mín_önepäger"], answer: 1, explain: "Små bokstäver och bindestreck. Namnet blir en del av webbadressen." },
      { q: "Var hittar du <strong>New repository</strong>?", options: ["Under plustecknet uppe till höger", "I Settings", "I VS Code"], answer: 0, explain: "Plustecknet (+) uppe till höger finns på alla sidor på GitHub." }
    ]
  },

  /* ================================================================== */
  {
    id: "installningar",
    part: "repo",
    title: "Inställningar: synlighet, README och licens",
    summary: "Offentligt eller privat, en framsida för repot och vem som får använda din kod.",
    time: "20 min",
    blocks: [
      { t: "h", text: "Public eller Private" },
      { t: "table", head: ["", "Public – offentligt", "Private – privat"], rows: [
        ["Vem kan se koden?", "Alla på internet", "Bara du och de du bjuder in"],
        ["Vem kan ändra?", "Bara du och de du bjuder in", "Bara du och de du bjuder in"],
        ["Passar för", "Portfolio, skolprojekt du vill visa", "Kundprojekt, sådant som inte är klart"]
      ]},
      { t: "p", html: "Public betyder att alla kan <em>läsa</em> – inte att alla kan <em>ändra</em>. Ingen kan ändra i ditt repo utan att du bjuder in dem." },
      { t: "steps", id: "synlighet", title: "Byta synlighet i efterhand", items: [
        "Öppna repot och klicka på fliken <strong>Settings</strong>.",
        "Scrolla längst ner till den röda rutan <strong>Danger Zone</strong>.",
        "Klicka <strong>Change visibility</strong> och följ stegen."
      ]},
      { t: "tip", kind: "warn", title: "Lägg aldrig lösenord i ett repo", html: "Inte ens i ett privat. Det som ligger i ett repo ska du kunna visa för vem som helst." },

      { t: "h", text: "README – repots framsida" },
      { t: "p", html: "<code>README.md</code> är det första man ser när man öppnar repot. Skriv vad projektet är och vem du är. Filen skrivs i <strong>Markdown</strong> – vanlig text med några enkla tecken för formatering:" },
      { t: "code", lang: "markdown", code: `# Min onepager

En sida jag byggde i kursen Programmering.

## Byggd med
- HTML
- CSS

Gjord av **Anna Andersson**. Se mer på [min portfolio](https://exempel.se).` },
      { t: "table", head: ["Du skriver", "Det blir"], rows: [
        ["<code># Text</code>", "Stor rubrik"],
        ["<code>## Text</code>", "Mindre rubrik"],
        ["<code>- Text</code>", "Punktlista"],
        ["<code>**Text**</code>", "<strong>Fet text</strong>"],
        ["<code>[Text](https://…)</code>", "En länk"]
      ]},
      { t: "steps", id: "readme", title: "Skriv din README direkt på GitHub", items: [
        "Klicka på <code>README.md</code> i fillistan.",
        "Klicka på <strong>pennan</strong> (Edit) uppe till höger om filen.",
        "Skriv din text. Titta under fliken <strong>Preview</strong> hur det blir.",
        "Klicka <strong>Commit changes…</strong>, skriv ett kort meddelande, t.ex. <em>Skriv README</em>, och klicka <strong>Commit changes</strong>."
      ]},
      { t: "p", html: "Du gjorde nyss din första <strong>commit</strong> – direkt på GitHub. Mer om commits i kapitel 6." },

      { t: "h", text: "Licens – vem får använda koden?" },
      { t: "p", html: "Utan licens får ingen återanvända din kod, även om repot är public. Med en licens bestämmer du vad andra får göra." },
      { t: "table", head: ["Val", "Betyder"], rows: [
        ["<strong>Ingen licens</strong>", "Andra får titta, men inte kopiera eller återanvända."],
        ["<strong>MIT License</strong>", "Alla får använda koden fritt, så länge ditt namn står kvar. Vanligast för små projekt."]
      ]},
      { t: "steps", id: "licens", title: "Lägg till en licens i efterhand", items: [
        "Klicka <strong>Add file → Create new file</strong> i repot.",
        "Skriv filnamnet <code>LICENSE</code>. En knapp, <strong>Choose a license template</strong>, dyker upp.",
        "Välj <strong>MIT License</strong>, klicka <strong>Review and submit</strong> och sedan <strong>Commit changes</strong>."
      ]},
      { t: "tip", kind: "ux", title: "För en portfolio räcker det", html: "Ska du bara visa upp ditt arbete fungerar både MIT och ingen licens. Välj MIT om du gärna ser att andra lär sig av din kod." },

      { t: "more", title: "Vill du veta mer? .gitignore", blocks: [
        { t: "p", html: "<code>.gitignore</code> är en lista över filer som Git ska strunta i. Ett vanligt exempel på Mac är den osynliga filen <code>.DS_Store</code>, som macOS skapar i varje mapp:" },
        { t: "code", lang: "text", code: `.DS_Store` },
        { t: "p", html: "Skapa filen med <strong>Add file → Create new file</strong>, döp den till <code>.gitignore</code> och skriv en rad per fil som ska ignoreras." }
      ]}
    ],
    quiz: [
      { q: "Ditt repo är <strong>Public</strong>. Vem kan ändra i koden?", options: ["Alla på internet", "Bara du och de du bjuder in", "Ingen, inte ens du"], answer: 1, explain: "Public betyder att alla kan läsa. Bara inbjudna kan ändra." },
      { q: "Vad är README.md?", options: ["En lista över filer som ska ignoreras", "Repots framsida, skriven i Markdown", "Licensen"], answer: 1, explain: "README visas under fillistan och berättar vad projektet är." },
      { q: "Repot är public men har ingen licens. Får andra återanvända koden?", options: ["Ja, allt public är fritt", "Nej, utan licens får de bara titta"], answer: 1, explain: "Utan licens behåller du alla rättigheter. MIT ger andra lov att återanvända." }
    ]
  },

  /* ================================================================== */
  {
    id: "klona",
    part: "arbeta",
    title: "Hämta repot till datorn",
    summary: "Klona repot i VS Code och flytta in din onepager.",
    time: "15 min",
    blocks: [
      { t: "p", html: "Att <strong>klona</strong> betyder att hämta en kopia av repot till datorn – en kopia som är kopplad till GitHub, så att du kan skicka upp ändringar senare." },
      { t: "ui", kind: "vs-clone", caption: "Source Control i VS Code när ingen mapp är öppen." },
      { t: "steps", id: "klona", items: [
        "Öppna ett nytt fönster i VS Code: <strong>File → New Window</strong>.",
        "Klicka på ikonen <strong>Source Control</strong> i vänsterkanten (tre prickar som sitter ihop med streck). Kortkommando: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>G</kbd>, på Mac <kbd>⌃</kbd><kbd>⇧</kbd><kbd>G</kbd>.",
        "Klicka <strong>Clone Repository</strong> och välj <strong>Clone from GitHub</strong>. Logga in om du blir tillfrågad.",
        "Välj <code>ditt-namn/min-onepager</code> i listan.",
        "Välj var mappen ska ligga, t.ex. <em>Dokument</em>, och klicka <strong>Select as Repository Destination</strong>.",
        "VS Code frågar om du vill öppna repot – klicka <strong>Open</strong>."
      ]},
      { t: "p", html: "Nu ser du <code>README.md</code> i Explorer. Det är samma fil som på GitHub." },
      { t: "h", text: "Flytta in din onepager" },
      { t: "p", html: "Kopiera filerna från din onepager-mapp <strong>in i</strong> den klonade mappen, i Finder eller Utforskaren. Så här ska det se ut efteråt:" },
      { t: "code", lang: "mappar", code: `min-onepager/
├── README.md       ← fanns redan
├── index.html      ← från din onepager
├── css/
│   └── style.css
└── images/
    └── (dina bilder)` },
      { t: "tip", kind: "warn", title: "index.html bredvid README.md", html: "Kopiera in <em>filerna</em>, inte hela mappen. Annars hamnar allt i en undermapp, t.ex. <code>min-onepager/onepager/index.html</code>." }
    ],
    quiz: [
      { q: "Vad betyder att klona ett repo?", options: ["Göra en kopia på GitHub under ditt namn", "Hämta en kopia till datorn som är kopplad till GitHub", "Radera repot"], answer: 1, explain: "Klona = hämta till datorn. En kopia på GitHub heter fork – den kommer i kapitel 10." },
      { q: "Var ska <code>index.html</code> ligga?", options: ["I en undermapp", "Bredvid README.md, direkt i repots mapp", "Inuti .git-mappen"], answer: 1, explain: "Direkt i repots mapp, bredvid README.md." }
    ]
  },

  /* ================================================================== */
  {
    id: "commit",
    part: "arbeta",
    title: "Commit – spara en version",
    summary: "Spara en version av ditt projekt med ett tydligt meddelande.",
    time: "20 min",
    blocks: [
      { t: "p", html: "När du har ändrat filer visar ikonen <strong>Source Control</strong> en siffra – antalet ändrade filer. Git har märkt ändringarna, men inte sparat någon version än." },
      { t: "ui", kind: "vs-changes", caption: "Source Control med tre nya filer som inte är sparade som version än." },
      { t: "table", head: ["Bokstav", "Betyder"], rows: [
        ["<strong>U</strong>", "Ny fil som Git inte har sett förut (untracked)"],
        ["<strong>M</strong>", "Ändrad fil (modified)"],
        ["<strong>D</strong>", "Borttagen fil (deleted)"]
      ]},
      { t: "steps", id: "commit", items: [
        "Öppna <strong>Source Control</strong>.",
        "Skriv ett meddelande i rutan överst, t.ex. <em>Lägg till min onepager</em>.",
        "Klicka <strong>Commit</strong>.",
        "Frågar VS Code <em>There are no staged changes to commit</em>? Klicka <strong>Yes</strong>. Då kommer alla ändrade filer med.",
        "Listan töms. Versionen är sparad – på din dator."
      ]},
      { t: "h", text: "Skriv bra meddelanden" },
      { t: "p", html: "Meddelandet är till för dig om tre veckor. Skriv vad du gjorde, inte hur." },
      { t: "table", head: ["Bra", "Dåligt"], rows: [
        ["Lägg till kontaktsektion", "uppdatering"],
        ["Byt accentfärg till grön", "fix"],
        ["Ta bort gammal bild", "asdfgh"]
      ]},
      { t: "tip", kind: "ux", title: "Commita ofta", html: "Gör en commit varje gång något fungerar, och alltid innan du testar något vågat. Små commits är lätta att gå tillbaka till." },
      { t: "more", title: "Vill du veta mer? Stage – välj vilka filer som ska med", blocks: [
        { t: "p", html: "Håll musen över en fil i listan och klicka <strong>+</strong> (Stage Changes). Då flyttas den till <em>Staged Changes</em>, och bara de filerna kommer med i nästa commit. Bra när du har ändrat två olika saker och vill spara dem som två versioner." }
      ]}
    ],
    quiz: [
      { q: "Du har gjort en commit. Syns ändringen på GitHub nu?", options: ["Ja, direkt", "Nej, den är bara sparad på din dator"], answer: 1, explain: "En commit sparar på datorn. Push skickar upp den – det är nästa kapitel." },
      { q: "Vilket commit-meddelande är bäst?", options: ["ändringar", "Lägg till kontaktformulär", "test123"], answer: 1, explain: "Det säger vad som ändrades, så du hittar versionen senare." },
      { q: "Vad betyder <strong>U</strong> bredvid en fil?", options: ["En ny fil som Git inte har sett förut", "En uppladdad fil", "En fil med fel"], answer: 0, explain: "U = untracked, ny fil. M = ändrad. D = borttagen." }
    ]
  },

  /* ================================================================== */
  {
    id: "push-pull",
    part: "arbeta",
    title: "Push och pull",
    summary: "Skicka upp dina versioner till GitHub och hämta ner ändringar.",
    time: "20 min",
    blocks: [
      { t: "figure", kind: "flow", caption: "Push skickar dina commits upp. Pull hämtar nya commits ner." },
      { t: "h", text: "Push – skicka upp" },
      { t: "p", html: "Efter en commit visar Source Control knappen <strong>Sync Changes</strong> med en pil upp och en siffra: så många commits väntar på att skickas upp." },
      { t: "ui", kind: "vs-sync", caption: "En commit väntar på att skickas upp till GitHub." },
      { t: "steps", id: "push", items: [
        "Klicka <strong>Sync Changes</strong>.",
        "Första gången frågar VS Code om det är okej att göra pull och push – klicka <strong>OK</strong>.",
        "Gå till ditt repo på github.com och ladda om sidan. Nu ligger <code>index.html</code>, <code>css</code> och <code>images</code> där."
      ]},
      { t: "p", html: "<strong>Sync</strong> gör två saker i rad: först pull, sedan push. Därför räcker det med en knapp." },
      { t: "h", text: "Pull – hämta ner" },
      { t: "p", html: "Ändringar kan komma från andra håll: från GitHub, från en kurskamrat eller från din andra dator. Pull hämtar dem." },
      { t: "steps", id: "pull", title: "Prova: ändra på GitHub och hämta till datorn", items: [
        "På github.com: öppna <code>README.md</code>, klicka på <strong>pennan</strong> och lägg till en rad. Klicka <strong>Commit changes…</strong> och sedan <strong>Commit changes</strong>.",
        "I VS Code: klicka på <strong>Sync</strong>-ikonen i statusraden längst ner till vänster (två pilar i en cirkel). Pilen ner visar att en commit finns att hämta.",
        "Öppna <code>README.md</code> i VS Code. Raden du skrev på GitHub finns nu där."
      ]},
      { t: "tip", kind: "warn", title: "Börja alltid med Sync", html: "Gör en <strong>Sync</strong> innan du börjar jobba. Då har du alltid den senaste versionen och slipper krockar." },
      { t: "more", title: "Vill du veta mer? Vad är en konflikt?", blocks: [
        { t: "p", html: "Om du och någon annan ändrar <em>samma rad</em> i samma fil, vet inte Git vilken version som gäller. Det kallas en <strong>konflikt</strong>. VS Code visar båda versionerna och knappar som <strong>Accept Current Change</strong> och <strong>Accept Incoming Change</strong>. Du väljer, sparar och gör en commit. Det bästa sättet att undvika konflikter är att alltid börja med Sync." }
      ]}
    ],
    quiz: [
      { q: "Vad gör <strong>Sync Changes</strong>?", options: ["Bara push", "Bara pull", "Först pull, sedan push"], answer: 2, explain: "Sync hämtar först ner, sedan skickar den upp. Två steg, en knapp." },
      { q: "Du har gjort tre commits men inte synkat. Hur många syns på GitHub?", options: ["Tre", "Ingen", "En"], answer: 1, explain: "Commits ligger på datorn tills du gör push eller sync." },
      { q: "Vad är det första du gör när du sätter dig och ska jobba?", options: ["Sync, så att jag har den senaste versionen", "Commit", "Skapar ett nytt repo"], answer: 0, explain: "Börja med Sync, så slipper du krockar med ändringar som gjorts någon annanstans." }
    ]
  },

  /* ================================================================== */
  {
    id: "branch",
    part: "arbeta",
    title: "Branch – en säker plats att testa",
    summary: "Testa en idé i en egen gren utan att röra huvudversionen.",
    time: "25 min",
    blocks: [
      { t: "p", html: "Ditt repo har en huvudversion som heter <strong>main</strong>. En <strong>branch</strong> (gren) är en parallell version där du kan testa en idé. Huvudversionen påverkas inte." },
      { t: "figure", kind: "branch", caption: "main fortsätter som vanligt. I grenen ny-farg testar du en idé med egna commits." },
      { t: "h", text: "Skapa en branch" },
      { t: "ui", kind: "vs-branch", caption: "Klicka på branch-namnet i statusraden för att skapa eller byta branch." },
      { t: "steps", id: "branch", items: [
        "Klicka på <strong>main</strong> i statusraden längst ner till vänster i VS Code.",
        "Välj <strong>Create new branch…</strong>",
        "Skriv namnet <code>ny-farg</code> och tryck <kbd>Enter</kbd>. Statusraden visar nu <strong>ny-farg</strong>.",
        "Öppna <code>css/style.css</code> och byt en färg. Spara.",
        "Gör en commit: <em>Testa ny accentfärg</em>.",
        "Klicka <strong>Publish Branch</strong>. Nu finns grenen på GitHub också."
      ]},
      { t: "h", text: "Byt tillbaka – och se magin" },
      { t: "steps", id: "byt-branch", items: [
        "Klicka på <strong>ny-farg</strong> i statusraden och välj <strong>main</strong>.",
        "Titta i <code>style.css</code>: den gamla färgen är tillbaka.",
        "Byt till <strong>ny-farg</strong> igen: den nya färgen är tillbaka."
      ]},
      { t: "p", html: "Git byter innehållet i filerna åt dig när du byter branch. Båda versionerna finns kvar, sida vid sida." },
      { t: "p", html: "På GitHub hittar du grenen i rullgardinen <strong>main</strong> ovanför fillistan." },
      { t: "tip", kind: "ux", title: "När ska jag använda en branch?", html: "När du vill testa något du inte är säker på: en ny layout, ett nytt typsnitt, en ny sektion. Blev det bra? Slå ihop den med main. Blev det dåligt? Byt tillbaka till main och glöm grenen." },
      { t: "more", title: "Vill du veta mer? Slå ihop en branch med main (merge)", blocks: [
        { t: "p", html: "När idén är bra vill du föra in den i main. Det kallas <strong>merge</strong>." },
        { t: "list", ordered: true, items: [
          "Byt till <strong>main</strong> i statusraden.",
          "Öppna kommandopaletten: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>, på Mac <kbd>⌘</kbd><kbd>⇧</kbd><kbd>P</kbd>.",
          "Skriv <strong>Git: Merge Branch…</strong> och välj <strong>ny-farg</strong>.",
          "Klicka <strong>Sync Changes</strong> för att skicka upp."
        ]},
        { t: "p", html: "I team gör man oftast en <strong>pull request</strong> på GitHub istället, så att någon annan kan titta på ändringen först. Det är överkurs idag." }
      ]}
    ],
    quiz: [
      { q: "Vad heter huvudversionen i ett nytt repo?", options: ["master", "main", "start"], answer: 1, explain: "Nya repon på GitHub får grenen main." },
      { q: "Du byter från <strong>ny-farg</strong> till <strong>main</strong>. Vad händer med filerna?", options: ["Ändringarna från ny-farg försvinner för alltid", "Filerna visar main-versionen – ny-farg finns kvar och går att byta tillbaka till", "Ingenting"], answer: 1, explain: "Båda versionerna finns kvar. Git byter innehållet när du byter branch." },
      { q: "Var skapar du en ny branch i VS Code?", options: ["Klicka på branch-namnet i statusraden längst ner", "I Settings på GitHub", "Högerklicka på en fil"], answer: 0, explain: "Branch-namnet i statusraden öppnar menyn med Create new branch…" }
    ]
  },

  /* ================================================================== */
  {
    id: "bjud-in",
    part: "dela",
    title: "Bjud in och dela",
    summary: "Dela en länk till ditt repo och bjud in någon som får jobba i det.",
    time: "15 min",
    blocks: [
      { t: "h", text: "Dela en länk" },
      { t: "p", html: "Ett public repo kan du dela med en vanlig länk, t.ex. <code>github.com/anna-andersson/min-onepager</code>. Ett private repo kan bara de du bjuder in öppna." },
      { t: "h", text: "Bjud in någon som får ändra" },
      { t: "p", html: "En inbjuden person kallas <strong>collaborator</strong>. Hen kan göra push till ditt repo, precis som du." },
      { t: "ui", kind: "gh-collab", caption: "Settings → Collaborators. Bara du som äger repot ser Settings." },
      { t: "steps", id: "bjud-in", items: [
        "Öppna repot och klicka på fliken <strong>Settings</strong>.",
        "I menyn till vänster, under <strong>Access</strong>: klicka <strong>Collaborators</strong>. Du kan behöva bekräfta med ditt lösenord.",
        "Klicka <strong>Add people</strong>.",
        "Sök på personens användarnamn eller e-post och klicka på rätt person.",
        "Klicka den gröna knappen <strong>Add <em>namn</em> to <em>repo</em></strong>.",
        "Personen får ett mejl och måste klicka <strong>Accept invitation</strong> innan inbjudan gäller."
      ]},
      { t: "table", head: ["En collaborator kan", "En collaborator kan inte"], rows: [
        ["Se koden, även i ett private repo", "Ändra inställningar under Settings"],
        ["Ändra filer och göra push", "Radera repot"],
        ["Skapa branches", "Bjuda in fler personer"]
      ]},
      { t: "tip", kind: "warn", title: "Bjud bara in de du litar på", html: "En collaborator kan ändra och ta bort filer. Allt går att återställa med Git, men det är krångligt. Vill någon bara titta – skicka en länk istället." },
      { t: "steps", id: "par-ovning", title: "Övning i par", items: [
        "Bjud in din bänkgranne till ditt repo, och tvärtom.",
        "Acceptera inbjudan i mejlet.",
        "Öppna grannens repo på GitHub och lägg till en rad i hens <code>README.md</code>: <em>Hälsningar från …</em>",
        "Gå tillbaka till ditt eget repo i VS Code och gör <strong>Sync</strong>. Grannens rad dyker upp."
      ]}
    ],
    quiz: [
      { q: "Ditt repo är <strong>private</strong>. Hur delar du det med din lärare?", options: ["Skickar länken – det räcker", "Bjuder in läraren som collaborator", "Det går inte"], answer: 1, explain: "Ett private repo kan bara inbjudna öppna." },
      { q: "När gäller inbjudan?", options: ["Direkt när du klickar Add", "När personen har klickat Accept invitation"], answer: 1, explain: "Personen måste acceptera först." }
    ]
  },

  /* ================================================================== */
  {
    id: "fork",
    part: "dela",
    title: "Forka någon annans repo",
    summary: "Gör en egen kopia av någon annans repo på ditt GitHub-konto.",
    time: "15 min",
    blocks: [
      { t: "p", html: "En <strong>fork</strong> är din egen kopia av någon annans repo – på GitHub, under ditt namn. Du kan ändra vad du vill i din kopia. Originalet påverkas inte." },
      { t: "h", text: "Tre sätt att få tag i ett repo" },
      { t: "table", head: ["", "Vad händer", "När"], rows: [
        ["<strong>Clone</strong>", "En kopia hamnar på din dator", "Ditt eget repo, eller ett du är inbjuden till"],
        ["<strong>Fork</strong>", "En kopia hamnar på ditt GitHub-konto", "Någon annans repo som du vill bygga vidare på"],
        ["<strong>Collaborator</strong>", "Ni jobbar i samma repo", "När ägaren har bjudit in dig"]
      ]},
      { t: "ui", kind: "gh-fork", caption: "Knappen Fork uppe till höger, och formuläret som öppnas." },
      { t: "steps", id: "fork", items: [
        "Öppna repot du vill forka, t.ex. lärarens exempel eller en kurskamrats onepager.",
        "Klicka <strong>Fork</strong> uppe till höger.",
        "Kontrollera att <strong>Owner</strong> är du. Behåll namnet eller skriv ett nytt, t.ex. <code>onepager-remix</code>.",
        "Låt <strong>Copy the main branch only</strong> vara ikryssad.",
        "Klicka <strong>Create fork</strong>.",
        "Nu finns repot under ditt namn, med texten <em>forked from …</em> under namnet.",
        "Klona din fork till datorn som i kapitel 5, och jobba som vanligt med commit och sync."
      ]},
      { t: "tip", kind: "warn", title: "Kolla licensen", html: "Att ett repo är public betyder inte att du får använda koden hur du vill. Titta efter filen <code>LICENSE</code>. Står det MIT får du bygga vidare, så länge originalskaparens namn står kvar." },
      { t: "more", title: "Vill du veta mer? Föreslå en ändring till originalet", blocks: [
        { t: "p", html: "Har du förbättrat något i din fork kan du föreslå ändringen för ägaren. Klicka <strong>Contribute</strong> ovanför fillistan i din fork och sedan <strong>Open pull request</strong>. Ägaren bestämmer om ändringen ska in. Det är så öppen källkod fungerar." }
      ]}
    ],
    quiz: [
      { q: "Vad är skillnaden mellan fork och clone?", options: ["Fork = kopia på ditt GitHub-konto, clone = kopia på din dator", "Det är samma sak", "Clone = kopia på GitHub, fork = kopia på datorn"], answer: 0, explain: "Fork sker på GitHub. Clone hämtar till datorn. Ofta gör man båda: först fork, sedan clone." },
      { q: "Du ändrar i din fork. Vad händer med originalet?", options: ["Det ändras också", "Ingenting – originalet påverkas inte"], answer: 1, explain: "En fork är en fristående kopia." }
    ]
  }
);

/* ==========================================================================
   ORDLISTA
   kind: "Begrepp" | "GitHub" | "VS Code"
   ex = var man hittar det, ch = kapitlet där det förklaras
   ========================================================================== */
KURS.library = [
  { kind: "Begrepp", name: "Git", desc: "Programmet på din dator som sparar versioner av en mapp.", ex: "Installeras en gång", ch: "git-och-github" },
  { kind: "Begrepp", name: "GitHub", desc: "Webbplatsen där repon ligger online och delas.", ex: "github.com", ch: "git-och-github" },
  { kind: "Begrepp", name: "Repo (repository)", desc: "En projektmapp som Git håller koll på.", ex: "github.com/namn/repo", ch: "skapa-repo" },
  { kind: "Begrepp", name: "Commit", desc: "En sparad version med ett meddelande om vad som ändrats.", ex: "Source Control → Commit", ch: "commit" },
  { kind: "Begrepp", name: "Commit-meddelande", desc: "En kort mening om vad du ändrade.", ex: "Lägg till kontaktsektion", ch: "commit" },
  { kind: "Begrepp", name: "Push", desc: "Skicka dina commits från datorn upp till GitHub.", ex: "Ingår i Sync Changes", ch: "push-pull" },
  { kind: "Begrepp", name: "Pull", desc: "Hämta nya commits från GitHub ner till datorn.", ex: "Ingår i Sync Changes", ch: "push-pull" },
  { kind: "Begrepp", name: "Clone", desc: "Hämta en kopia av ett repo till datorn, kopplad till GitHub.", ex: "Source Control → Clone Repository", ch: "klona" },
  { kind: "Begrepp", name: "Branch", desc: "En parallell version där du kan testa utan att röra main.", ex: "Statusraden i VS Code", ch: "branch" },
  { kind: "Begrepp", name: "main", desc: "Huvudversionen i ett repo.", ex: "Statusraden i VS Code", ch: "branch" },
  { kind: "Begrepp", name: "Merge", desc: "Slå ihop en branch med en annan, oftast med main.", ex: "Git: Merge Branch…", ch: "branch" },
  { kind: "Begrepp", name: "Fork", desc: "En egen kopia av någon annans repo, på ditt GitHub-konto.", ex: "Fork-knappen på GitHub", ch: "fork" },
  { kind: "Begrepp", name: "Collaborator", desc: "En person du har bjudit in som får ändra i ditt repo.", ex: "Settings → Collaborators", ch: "bjud-in" },
  { kind: "Begrepp", name: "Public", desc: "Alla kan se repot. Bara inbjudna kan ändra.", ex: "Choose visibility", ch: "installningar" },
  { kind: "Begrepp", name: "Private", desc: "Bara du och inbjudna kan se repot.", ex: "Choose visibility", ch: "installningar" },
  { kind: "Begrepp", name: "README.md", desc: "Repots framsida. Visas under fillistan på GitHub.", ex: "Add README", ch: "installningar" },
  { kind: "Begrepp", name: "Markdown", desc: "Enkelt textformat: # rubrik, - lista, **fet**.", ex: "# Min onepager", ch: "installningar" },
  { kind: "Begrepp", name: "Licens", desc: "Bestämmer vad andra får göra med din kod. MIT = fritt med ditt namn kvar.", ex: "Filen LICENSE", ch: "installningar" },
  { kind: "Begrepp", name: ".gitignore", desc: "Lista över filer som Git ska strunta i.", ex: ".DS_Store", ch: "installningar" },
  { kind: "Begrepp", name: "Konflikt", desc: "Två personer har ändrat samma rad. Du väljer vilken version som gäller.", ex: "Accept Current / Incoming Change", ch: "push-pull" },
  { kind: "Begrepp", name: "Pull request", desc: "Ett förslag om att föra in ändringar från en branch eller fork.", ex: "Överkurs", ch: "fork" },
  { kind: "GitHub", name: "New repository", desc: "Skapar ett nytt repo.", ex: "+ uppe till höger", ch: "skapa-repo" },
  { kind: "GitHub", name: "Settings", desc: "Repots inställningar. Bara ägaren ser fliken.", ex: "Flik under repo-namnet", ch: "installningar" },
  { kind: "GitHub", name: "Danger Zone", desc: "Längst ner i Settings: byt synlighet eller radera repot.", ex: "Settings → Change visibility", ch: "installningar" },
  { kind: "GitHub", name: "Add people", desc: "Bjud in en collaborator.", ex: "Settings → Collaborators", ch: "bjud-in" },
  { kind: "GitHub", name: "Fork / Create fork", desc: "Gör en kopia av repot på ditt konto.", ex: "Uppe till höger i repot", ch: "fork" },
  { kind: "GitHub", name: "Commit changes…", desc: "Spara en ändring du gjort direkt på GitHub.", ex: "Efter Edit (pennan)", ch: "installningar" },
  { kind: "VS Code", name: "Source Control", desc: "Panelen där du gör commit och sync.", ex: "Ctrl+Shift+G / ⌃⇧G", ch: "commit" },
  { kind: "VS Code", name: "Clone Repository", desc: "Hämta ett repo från GitHub till datorn.", ex: "Source Control", ch: "klona" },
  { kind: "VS Code", name: "Commit", desc: "Sparar en version med meddelandet du skrivit.", ex: "Source Control", ch: "commit" },
  { kind: "VS Code", name: "Sync Changes", desc: "Gör först pull, sedan push.", ex: "Source Control eller statusraden", ch: "push-pull" },
  { kind: "VS Code", name: "Create new branch…", desc: "Skapar en ny branch.", ex: "Klicka på branch-namnet i statusraden", ch: "branch" },
  { kind: "VS Code", name: "Publish Branch", desc: "Lägger upp en ny branch på GitHub.", ex: "Source Control", ch: "branch" },
  { kind: "VS Code", name: "Stage Changes (+)", desc: "Välj vilka filer som ska med i nästa commit.", ex: "Håll musen över en fil", ch: "commit" }
];
