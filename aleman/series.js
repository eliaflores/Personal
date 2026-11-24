// «Aprende viendo»: series y canales en alemán para aprender con contexto visual (input comprensible).
// Cada capítulo es una lección corta: un objetivo, qué hacer antes, mientras y después de verlo, y dónde encontrarlo.
// Las plataformas cambian según el país y con el tiempo: los botones abren la búsqueda del título en cada plataforma.
//
// donde: { tipo: "youtube" | "netflix" | "web", nombre, nota, url (solo web) }
// capítulo: { id, titulo, foco, antes, durante, despues, min, busca (búsqueda en YouTube), unidad (opcional), nivel (opcional) }

export const SERIES = [
  /* ============================ A1 ============================ */
  {
    id: "nicos-weg", titulo: "Nicos Weg", nivel: "A1", niveles: "A1 → B1", tipo: "Serie para aprender", gratis: true,
    desc: "Telenovela de Deutsche Welle hecha para aprender alemán: Nico llega a Alemania casi sin saber el idioma y tiene que arreglárselas. Episodios cortos, con subtítulos y ejercicios.",
    porque: "Está grabada para tu nivel: hablan claro, repiten las frases clave y cada episodio trabaja un tema del curso.",
    donde: [
      { tipo: "web", nombre: "DW Learn German", url: "https://learngerman.dw.com/", nota: "Gratis, con ejercicios por episodio" },
      { tipo: "youtube", nombre: "YouTube · DW Learn German", nota: "Gratis" },
    ],
    capitulos: [
      { id: "nw-1", titulo: "A1 · primeros 5 episodios", unidad: "u01", min: 15, busca: "Nicos Weg A1 Folge 1",
        foco: "Entender saludos y presentaciones.", antes: "Repasa «Hallo», «Ich heiße…» y «Woher kommst du?».",
        durante: "Míralos con subtítulos en alemán. Pausa cada vez que alguien se presente y repítelo en voz alta.", despues: "Escribe cómo te presentarías tú en 3 frases." },
      { id: "nw-2", titulo: "A1 · episodios 6 a 10", unidad: "u03", min: 15, busca: "Nicos Weg A1 Folge 6",
        foco: "Reconocer números, días y horas.", antes: "Repasa los números del 1 al 20 y los días de la semana.",
        durante: "Cada vez que oigas un número o una hora, dilo en español en voz baja.", despues: "Anota 5 palabras nuevas y búscalas en «Palabras»." },
      { id: "nw-3", titulo: "A1 · episodios 11 a 20", unidad: "u04", min: 30, busca: "Nicos Weg A1 Folge 11",
        foco: "Oír los verbos en presente (ich trinke, du hast…).", antes: "Repasa el tema de gramática «El presente».",
        durante: "Elige 3 frases cortas y repítelas justo después del personaje (shadowing).", despues: "Escribe 3 frases sobre tu día con verbos en presente." },
      { id: "nw-4", titulo: "A2 · primeros episodios", nivel: "A2", unidad: "u14", min: 20, busca: "Nicos Weg A2 Folge 1",
        foco: "Detectar el pasado con haben/sein + participio.", antes: "Repasa el tema «El pasado hablado: Perfekt».",
        durante: "Cada vez que oigas «habe… gemacht» o «bin… gegangen», pausa y repítelo.", despues: "Cuenta en 3 frases qué hiciste ayer." },
      { id: "nw-5", titulo: "B1 · primeros episodios", nivel: "B1", unidad: "u19", min: 20, busca: "Nicos Weg B1 Folge 1",
        foco: "Entender oraciones con weil y dass (verbo al final).", antes: "Repasa «Oraciones con weil, dass, wenn, ob».",
        durante: "Primero sin subtítulos; luego otra vez con subtítulos en alemán.", despues: "Escribe 2 frases con «weil» sobre por qué aprendes alemán." },
    ],
  },
  {
    id: "extra", titulo: "Extr@ auf Deutsch", nivel: "A1", niveles: "A1 → A2", tipo: "Comedia para aprender", gratis: true,
    desc: "Comedia de situación hecha para estudiantes: Sam, un joven estadounidense, se va a vivir con tres jóvenes alemanes. Diálogos lentos, muy visuales y divertidos.",
    porque: "Las bromas se entienden por la imagen, así que adivinas el significado por el contexto. Eso fija mucho las palabras.",
    donde: [{ tipo: "youtube", nombre: "YouTube", nota: "Gratis" }],
    capitulos: [
      { id: "ex-1", titulo: "Episodio 1", unidad: "u01", min: 25, busca: "Extra auf Deutsch Folge 1",
        foco: "Entender quién es quién: nombres, de dónde son, qué hacen.", antes: "Repasa la unidad 1 (saludos y presentarse).",
        durante: "Mira una vez sin pausas. Luego vuelve a ver 5 minutos con subtítulos en alemán.", despues: "Escribe una frase sobre cada personaje." },
      { id: "ex-2", titulo: "Episodio 2", unidad: "u05", min: 25, busca: "Extra auf Deutsch Folge 2",
        foco: "Vocabulario de la casa y de las cosas de todos los días.", antes: "Repasa «En casa» (Zimmer, Küche, Tisch…).",
        durante: "Señala (o anota) cada objeto de la casa que reconozcas.", despues: "Describe tu cuarto en 3 frases." },
      { id: "ex-3", titulo: "Episodio 3", unidad: "u04", min: 25, busca: "Extra auf Deutsch Folge 3",
        foco: "Pedir, ofrecer y decir qué te gusta.", antes: "Repasa «möchten», «gern» y «mögen».",
        durante: "Haz shadowing de 3 frases con «Ich möchte…» o «Ich mag…».", despues: "Escribe 3 cosas que te gustan con «gern»." },
      { id: "ex-4", titulo: "Episodios 4 y 5", unidad: "u09", min: 50, busca: "Extra auf Deutsch Folge 4",
        foco: "Planes, tiempo libre y quedar con amigos.", antes: "Repasa la unidad «Tiempo libre».",
        durante: "Usa subtítulos en alemán y pausa cuando no entiendas una frase entera.", despues: "Escribe qué harías tú en su fin de semana." },
    ],
  },
  {
    id: "peppa", titulo: "Peppa Wutz", nivel: "A1", niveles: "A1", tipo: "Caricatura", gratis: true,
    desc: "Peppa Pig en alemán. Frases cortas, mucha repetición y temas de familia, casa, comida y juegos.",
    porque: "Al principio el oído es lo más difícil. Las caricaturas para niños son el input más comprensible que hay: todo se ve.",
    donde: [{ tipo: "youtube", nombre: "YouTube", nota: "Episodios cortos gratis" }],
    capitulos: [
      { id: "pe-1", titulo: "3 episodios cortos sobre la familia", unidad: "u02", min: 15, busca: "Peppa Wutz deutsch ganze Folgen",
        foco: "Reconocer a la familia: Mama, Papa, Bruder, Oma, Opa.", antes: "Repasa «Familia y personas».",
        durante: "Cada vez que digan un miembro de la familia, repítelo con su artículo (die Mutter, der Bruder…).", despues: "Dibuja tu familia y escribe der/die/das + nombre." },
      { id: "pe-2", titulo: "3 episodios sobre comida y casa", unidad: "u04", min: 15, busca: "Peppa Wutz deutsch essen",
        foco: "Palabras de comida y de la casa.", antes: "Repasa «Comer y beber».",
        durante: "Míralos dos veces: la segunda, repite en voz alta todo lo que diga Peppa.", despues: "Anota 5 palabras que oíste y practícalas en «Palabras»." },
    ],
  },
  {
    id: "super-easy", titulo: "Super Easy German", nivel: "A1", niveles: "A1 → A2", tipo: "Canal de YouTube", gratis: true,
    desc: "La serie para principiantes del canal Easy German: alemán despacio, temas cotidianos y subtítulos en alemán e inglés.",
    porque: "Escuchas alemán real (no actuado) pero adaptado a tu nivel, con la transcripción en pantalla.",
    donde: [{ tipo: "youtube", nombre: "YouTube · Easy German", nota: "Gratis" }],
    capitulos: [
      { id: "se-1", titulo: "Un video para presentarte", unidad: "u01", min: 10, busca: "Super Easy German sich vorstellen",
        foco: "Cómo se presenta la gente de verdad.", antes: "Repasa «Presentarte».",
        durante: "Activa subtítulos en alemán. Haz shadowing de la presentación completa.", despues: "Graba (o di en voz alta) tu propia presentación." },
      { id: "se-2", titulo: "Un video sobre comida", unidad: "u04", min: 10, busca: "Super Easy German Essen",
        foco: "Vocabulario de comida en contexto real.", antes: "Repasa «Comer y beber».",
        durante: "Anota cada comida que reconozcas con su artículo.", despues: "Escribe qué desayunaste hoy en alemán." },
      { id: "se-3", titulo: "Un video sobre la rutina diaria", unidad: "u10", min: 10, busca: "Super Easy German Tagesablauf",
        foco: "Verbos separables (aufstehen, einkaufen…).", antes: "Repasa «Verbos separables».",
        durante: "Fíjate dónde queda el prefijo (auf, ein, an) al final de la frase.", despues: "Cuenta tu mañana en 4 frases." },
    ],
  },

  /* ============================ A2 ============================ */
  {
    id: "maus", titulo: "Die Sendung mit der Maus", nivel: "A2", niveles: "A2", tipo: "Programa infantil", gratis: true,
    desc: "El programa clásico de la tele alemana que explica cómo funcionan las cosas, con el ratón naranja. Lenguaje claro y muy visual.",
    porque: "Explica con imágenes paso a paso: puedes seguir la idea aunque no entiendas cada palabra (input comprensible).",
    donde: [
      { tipo: "youtube", nombre: "YouTube · Die Maus", nota: "Videos cortos gratis" },
      { tipo: "web", nombre: "ARD Mediathek", url: "https://www.ardmediathek.de/", nota: "Puede no estar disponible fuera de Alemania" },
    ],
    capitulos: [
      { id: "ma-1", titulo: "Una «Sachgeschichte» (explicación)", unidad: "u07", min: 10, busca: "Sendung mit der Maus Sachgeschichte",
        foco: "Seguir una explicación paso a paso.", antes: "Repasa «Verbos de todos los días».",
        durante: "Primero sin subtítulos; intenta contar con tus palabras qué se explicó.", despues: "Escribe en 3 frases cómo se hace eso." },
      { id: "ma-2", titulo: "Una «Lachgeschichte» (historia)", unidad: "u09", min: 10, busca: "Sendung mit der Maus Lachgeschichte",
        foco: "Entender una historia por la imagen.", antes: "Repasa «Tiempo libre».",
        durante: "Pausa en 3 momentos y adivina qué va a pasar.", despues: "Cuéntale la historia a alguien (en español o alemán)." },
    ],
  },
  {
    id: "easy-german", titulo: "Easy German", nivel: "A2", niveles: "A2 → B1", tipo: "Canal de YouTube", gratis: true,
    desc: "Entrevistas en la calle a gente de Alemania sobre temas de todos los días, con subtítulos en alemán e inglés.",
    porque: "Es alemán real, con distintos acentos y velocidades: entrena el oído para el mundo de verdad.",
    donde: [{ tipo: "youtube", nombre: "YouTube · Easy German", nota: "Gratis" }],
    capitulos: [
      { id: "eg-1", titulo: "Entrevista sobre el trabajo", unidad: "u13", min: 15, busca: "Easy German Arbeit Beruf",
        foco: "Profesiones y cómo habla la gente de su trabajo.", antes: "Repasa «El trabajo».",
        durante: "Anota 3 profesiones con su artículo y si es hombre o mujer (-in).", despues: "Escribe qué haces tú (o qué te gustaría hacer)." },
      { id: "eg-2", titulo: "Entrevista sobre vacaciones", unidad: "u14", min: 15, busca: "Easy German Urlaub",
        foco: "Oír el Perfekt en conversaciones reales.", antes: "Repasa «De viaje» y el Perfekt.",
        durante: "Cada vez que alguien cuente algo en pasado, repítelo en voz alta.", despues: "Cuenta tus últimas vacaciones en 4 frases." },
      { id: "eg-3", titulo: "Entrevista sobre la comida alemana", unidad: "u04", min: 15, busca: "Easy German deutsches Essen",
        foco: "Opiniones: «Ich finde…», «Ich mag…», «Mir schmeckt…».", antes: "Repasa el dativo (mir, dir).",
        durante: "Haz shadowing de 3 opiniones que te gusten.", despues: "Da tu opinión sobre una comida con «Ich finde…»." },
    ],
  },
  {
    id: "logo", titulo: "logo!", nivel: "A2", niveles: "A2 → B1", tipo: "Noticias para niños", gratis: true,
    desc: "Las noticias para niños de la tele pública ZDF: temas actuales explicados con palabras sencillas y dibujos.",
    porque: "Vocabulario de actualidad en versión fácil: el paso perfecto antes de las noticias para adultos.",
    donde: [
      { tipo: "web", nombre: "ZDFtivi · logo!", url: "https://www.zdf.de/kinder/logo", nota: "Gratis" },
      { tipo: "youtube", nombre: "YouTube", nota: "Algunos videos" },
    ],
    capitulos: [
      { id: "lo-1", titulo: "Una emisión del día", unidad: "u20", min: 10, busca: "logo! Nachrichten für Kinder",
        foco: "Entender la idea general de cada noticia.", antes: "Repasa «Sociedad y medio ambiente».",
        durante: "Después de cada noticia, pausa y resúmela en una frase (en español o alemán).", despues: "Escribe 3 palabras de actualidad que aprendiste." },
    ],
  },

  /* ============================ B1 ============================ */
  {
    id: "jojo", titulo: "Jojo sucht das Glück", nivel: "B1", niveles: "B1", tipo: "Serie para aprender", gratis: true,
    desc: "Telenovela de Deutsche Welle: Jojo se muda a Colonia para estudiar y empezar una vida nueva. Hecha para estudiantes de nivel intermedio.",
    porque: "Conversaciones naturales a una velocidad todavía manejable, con ejercicios por episodio.",
    donde: [
      { tipo: "web", nombre: "DW Learn German", url: "https://learngerman.dw.com/", nota: "Gratis, con ejercicios" },
      { tipo: "youtube", nombre: "YouTube · DW Learn German", nota: "Gratis" },
    ],
    capitulos: [
      { id: "jo-1", titulo: "Temporada 1 · episodios 1 a 3", unidad: "u19", min: 30, busca: "Jojo sucht das Glück Folge 1",
        foco: "Seguir una conversación entre varias personas.", antes: "Repasa los conectores weil, dass, obwohl.",
        durante: "Usa subtítulos en alemán. Anota cada «weil» o «dass» que oigas.", despues: "Resume cada episodio en 2 frases." },
      { id: "jo-2", titulo: "Temporada 1 · episodios 4 a 6", unidad: "u22", min: 30, busca: "Jojo sucht das Glück Folge 4",
        foco: "Relaciones y sentimientos.", antes: "Repasa «Relaciones» y «Emociones».",
        durante: "Haz shadowing de una discusión o de una frase emotiva.", despues: "Escribe qué harías tú en lugar de Jojo (würde…)." },
    ],
  },
  {
    id: "hsdof", titulo: "How to Sell Drugs Online (Fast)", nivel: "B1", niveles: "B1 → B2", tipo: "Serie de Netflix", gratis: false,
    desc: "Comedia juvenil alemana: un estudiante de prepa arma un negocio en línea desde su cuarto. Mucho alemán coloquial de jóvenes.",
    porque: "Te enseña cómo hablan de verdad los jóvenes alemanes, con un ritmo rápido y mucho humor visual.",
    donde: [{ tipo: "netflix", nombre: "Netflix", nota: "Serie original de Netflix" }],
    capitulos: [
      { id: "hs-1", titulo: "Temporada 1 · episodio 1", unidad: "u19", min: 30, foco: "Entender la idea general, sin traducir todo.",
        antes: "En Netflix pon audio en alemán y subtítulos en alemán.", durante: "No pauses: solo intenta seguir la historia.", despues: "Anota 5 expresiones coloquiales que oíste y búscalas." },
      { id: "hs-2", titulo: "Temporada 1 · episodio 2", unidad: "u19", min: 30, foco: "Vocabulario de internet y tecnología.",
        antes: "Repasa «Medios y tecnología».", durante: "Pausa cada vez que oigas una palabra de tecnología y repítela.", despues: "Escribe 3 frases sobre cómo usas tu celular." },
      { id: "hs-3", titulo: "Temporada 1 · episodio 3", unidad: "u23", min: 30, foco: "Expresiones y modismos.",
        antes: "Repasa «Hablar como alemán».", durante: "Haz shadowing de 3 frases muy coloquiales.", despues: "Usa una de esas expresiones en una frase tuya." },
    ],
  },
  {
    id: "welle", titulo: "Wir sind die Welle", nivel: "B1", niveles: "B1 → B2", tipo: "Serie de Netflix", gratis: false,
    desc: "Serie alemana sobre un grupo de jóvenes que forma un movimiento de protesta.",
    porque: "Temas de sociedad y opinión: vocabulario que piden los exámenes B1.",
    donde: [{ tipo: "netflix", nombre: "Netflix", nota: "Serie original de Netflix" }],
    capitulos: [
      { id: "we-1", titulo: "Temporada 1 · episodio 1", unidad: "u20", min: 45, foco: "Vocabulario de sociedad y opinión.",
        antes: "Repasa «Sociedad y medio ambiente».", durante: "Subtítulos en alemán. Anota cada opinión («Ich finde…», «Ich glaube…»).", despues: "Escribe tu opinión sobre el tema del episodio." },
      { id: "we-2", titulo: "Temporada 1 · episodio 2", unidad: "u20", min: 45, foco: "Terminaciones del adjetivo en contexto.",
        antes: "Repasa «Terminaciones del adjetivo».", durante: "Fíjate en frases como «ein großes Problem» y repítelas.", despues: "Escribe 3 frases con adjetivo + sustantivo." },
    ],
  },
  {
    id: "tagesschau", titulo: "Tagesschau in 100 Sekunden", nivel: "B1", niveles: "B1 → B2", tipo: "Noticias", gratis: true,
    desc: "El noticiero más visto de Alemania en versión de 100 segundos. Corto, actual y con imágenes.",
    porque: "Un video al día es una dosis perfecta de repetición espaciada de vocabulario de actualidad.",
    donde: [
      { tipo: "youtube", nombre: "YouTube · tagesschau", nota: "Gratis" },
      { tipo: "web", nombre: "tagesschau.de", url: "https://www.tagesschau.de/", nota: "Gratis" },
    ],
    capitulos: [
      { id: "ts-1", titulo: "La emisión de hoy", unidad: "u20", min: 5, busca: "Tagesschau in 100 Sekunden",
        foco: "Captar de qué trata cada noticia.", antes: "No hace falta preparar nada.",
        durante: "Míralo 2 veces: la primera sin subtítulos, la segunda con subtítulos en alemán.", despues: "Di en voz alta 1 frase sobre cada noticia." },
    ],
  },

  /* ============================ B2 ============================ */
  {
    id: "dark", titulo: "Dark", nivel: "B2", niveles: "B2 → C1", tipo: "Serie de Netflix", gratis: false,
    desc: "Misterio y viajes en el tiempo en un pueblo alemán. Es difícil, pero es una de las series alemanas más famosas del mundo.",
    porque: "Es un gran reto para el oído y la motivación: cuando la entiendes en alemán, sabes que avanzaste.",
    donde: [{ tipo: "netflix", nombre: "Netflix", nota: "Serie original de Netflix" }],
    capitulos: [
      { id: "da-1", titulo: "Temporada 1 · episodio 1", min: 50, foco: "Solo seguir la historia en alemán.",
        antes: "Audio en alemán y subtítulos en alemán (no en español).", durante: "Si te pierdes, está bien: no pauses, deja que el contexto te ayude.", despues: "Anota los nombres de las familias y quién es quién." },
      { id: "da-2", titulo: "Temporada 1 · episodio 2", min: 50, foco: "Preguntas y frases cortas en tensión.",
        antes: "Repasa las preguntas con W (wer, wo, wann, warum).", durante: "Anota cada pregunta que oigas.", despues: "Escribe 5 preguntas que te harías sobre el misterio." },
      { id: "da-3", titulo: "Temporada 1 · episodio 3", min: 50, foco: "Oír el Präteritum y el Perfekt al contar el pasado.",
        antes: "Repasa «El pasado simple» (war, hatte, konnte).", durante: "Cada «war» o «hatte» que oigas, repítelo con su frase.", despues: "Resume el episodio en pasado en 4 frases." },
    ],
  },
  {
    id: "kaiserin", titulo: "Die Kaiserin", nivel: "B2", niveles: "B2", tipo: "Serie de Netflix", gratis: false,
    desc: "Serie histórica sobre la emperatriz Isabel de Austria (Sisi) y la corte de Viena.",
    porque: "Alemán más formal y cuidado, ideal para oír el «Sie», el Konjunktiv y frases largas.",
    donde: [{ tipo: "netflix", nombre: "Netflix", nota: "Serie original de Netflix" }],
    capitulos: [
      { id: "ka-1", titulo: "Temporada 1 · episodio 1", min: 50, foco: "El trato formal: Sie, Ihnen, Ihr.",
        antes: "Repasa los posesivos y el «Sie» formal.", durante: "Anota cada frase muy formal o cortés que oigas.", despues: "Escribe una carta corta y formal (3 frases)." },
      { id: "ka-2", titulo: "Temporada 1 · episodio 2", min: 50, foco: "Deseos y cortesía con Konjunktiv II.",
        antes: "Repasa «Deseos y cortesía: Konjunktiv II».", durante: "Fíjate en «würde», «hätte», «könnte» y repite esas frases.", despues: "Escribe 3 deseos con «Ich würde gern…»." },
    ],
  },
  {
    id: "biohackers", titulo: "Biohackers", nivel: "B2", niveles: "B2", tipo: "Serie de Netflix", gratis: false,
    desc: "Thriller alemán en una universidad de Friburgo sobre una estudiante de medicina y la biotecnología.",
    porque: "Vocabulario universitario y científico, con diálogos claros y ritmo de suspenso que engancha.",
    donde: [{ tipo: "netflix", nombre: "Netflix", nota: "Serie original de Netflix" }],
    capitulos: [
      { id: "bh-1", titulo: "Temporada 1 · episodio 1", unidad: "u21", min: 45, foco: "Vida universitaria y estudios.",
        antes: "Repasa «Estudios y futuro».", durante: "Subtítulos en alemán. Anota palabras de la universidad.", despues: "Escribe qué estudiarías tú y por qué (weil…)." },
    ],
  },
];

export const CIENCIA_VER = "Ver series con subtítulos en alemán ayuda a aprender vocabulario y a entender de oído (Montero Perez, Van Den Noortgate y Desmet, 2013; Peters y Webb, 2018). Funciona mejor si eliges algo un poco por encima de tu nivel, usas subtítulos en alemán (no en español), repites en voz alta algunas frases y vuelves a ver lo que no entendiste.";
