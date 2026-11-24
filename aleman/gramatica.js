// Gramática de Täglich: cada tema tiene una explicación corta (con ejemplos que se pueden escuchar) y ejercicios.
// Ejercicios:  ? frase con ___ | respuesta (alternativas con /) | distractores, separados, por comas | traducción | por qué
//              O frase / otra frase correcta | traducción | por qué        (ordenar fichas)
// Explicar el porqué (feedback elaborado) ayuda más que solo decir «incorrecto».
const limpio = (s) => s.replace(/<[^>]+>/g, "").replace(/"/g, "&quot;");
const ej = (de, es) => `<div class="ej" data-say="${limpio(de)}"><span>${de}</span><i>${es}</i></div>`;
const tabla = (filas) => `<div class="tabla-wrap"><table class="tabla">${filas.map((f, i) => `<tr>${f.map((c) => (i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`).join("")}</table></div>`;
const BOMBILLA = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/></svg>`;
const tip = (s) => `<div class="tip">${BOMBILLA}<span>${s}</span></div>`;
const m = (s) => `<b class="g-m">${s}</b>`, f = (s) => `<b class="g-f">${s}</b>`, n = (s) => `<b class="g-n">${s}</b>`, pl = (s) => `<b class="g-pl">${s}</b>`;

export const TEMAS = {};

TEMAS.aussprache = {
  nivel: "A1", titulo: "Pronunciación",
  html: `
<p>El alemán se lee casi como se escribe. Si aprendes estas reglas desde el principio, podrás leer en voz alta cualquier palabra. Toca cada ejemplo para escucharlo.</p>
${tabla([["Se escribe", "Suena como", "Ejemplo"], ["ei", "«ai»", "mein, Wein"], ["ie", "«i» larga", "Liebe, Bier"], ["eu / äu", "«oi»", "neu, Häuser"], ["sch", "«sh» inglesa", "Schule"], ["sp / st (al inicio)", "«shp» / «sht»", "Sport, Straße"], ["z", "«ts»", "Zeit, zehn"], ["w", "«v» (labios y dientes)", "Wasser"], ["v", "«f»", "Vater, viel"], ["j", "«y»", "ja, Jahr"], ["ch (tras a, o, u)", "«j» española suave", "acht, Buch"], ["ch (tras e, i, ä, ö, ü)", "un siseo suave, como «sh» con sonrisa", "ich, Milch"]])}
${ej("Wein, Bier, neu", "vino, cerveza, nuevo")}
${ej("Die Schule beginnt um zehn.", "La escuela empieza a las diez.")}
<p><b>Las vocales con diéresis</b> (Umlaut) son sonidos distintos: <b>ä</b> ≈ «e» abierta; <b>ö</b> = di «e» con los labios en «o»; <b>ü</b> = di «i» con los labios en «u».</p>
${ej("schön, grün, Käse", "bonito, verde, queso")}
<p><b>ß</b> (Eszett) es una «s» fuerte. Va después de vocal larga o diptongo (Straße, heißen); tras vocal corta se escribe <b>ss</b> (Wasser, muss).</p>
${tip("Vocal + consonante doble = vocal corta (Bett, Mann). Vocal + h = vocal larga, la h no suena (Uhr, fahren). Al final de palabra, -er suena casi como «a»: Lehrer ≈ «léra».")}
${ej("Mein Vater fährt Fahrrad.", "Mi papá anda en bici.")}`,
  ejercicios: `
? Ich h___ße Maria. | ei | ie, eu | Me llamo Maria. | «ei» suena «ai»: heißen.
? Ich l___be dich. | ie | ei, eu | Te amo. | «ie» suena como una «i» larga: lieben.
? Das ist mein Fr___nd. | eu | ei, ie | Es mi amigo. | «eu» suena «oi»: Freund.
? Ein W___n, bitte. | ei | ie, eu | Un vino, por favor. | Wein se dice «vain».
? Die ___ule beginnt um acht. | Sch | Sh, Ch | La escuela empieza a las ocho. | El sonido «sh» se escribe «sch».
? Ich trinke Wa___er. | ss | ß, s | Tomo agua. | Tras vocal corta: ss.
? Die Stra___e ist lang. | ß | ss, s | La calle es larga. | Tras vocal larga: ß.
? Das Gras ist gr___n. | ü | u, ö | El pasto es verde. | grün con «ü».
? Das ist sehr sch___n! | ö | o, ü | ¡Qué bonito! | schön con «ö».
`,
};

TEMAS.sein = {
  nivel: "A1", titulo: "Pronombres y el verbo «sein»",
  html: `
<p><b>sein</b> significa <b>ser</b> y <b>estar</b> a la vez. Es irregular, pero es el verbo que más vas a usar.</p>
${tabla([["Pronombre", "sein", "Español"], ["ich", "bin", "yo soy/estoy"], ["du", "bist", "tú eres"], ["er / sie / es", "ist", "él / ella / ello es"], ["wir", "sind", "nosotros somos"], ["ihr", "seid", "ustedes (vosotros) son"], ["sie / Sie", "sind", "ellos son / usted es"]])}
${ej("Ich bin müde.", "Estoy cansado.")}
${ej("Wir sind Freunde.", "Somos amigos.")}
<p><b>du</b> se usa con amigos, familia y niños. <b>Sie</b> (con mayúscula) es «usted»: con desconocidos, en tiendas y en el trabajo. Se conjuga igual que «sie» (ellos).</p>
${ej("Sind Sie Frau Weber?", "¿Es usted la señora Weber?")}
${tip("En alemán siempre hay que decir el sujeto: «Bin müde» está mal; se dice «Ich bin müde».")}`,
  ejercicios: `
? Ich ___ müde. | bin | bist, ist, sind | Estoy cansado. | Con «ich» siempre «bin».
? Du ___ sehr nett. | bist | bin, ist, seid | Eres muy amable. | Con «du»: bist.
? Er ___ Lehrer. | ist | bin, sind, bist | Él es maestro. | er / sie / es → ist.
? Wir ___ Freunde. | sind | seid, ist, bin | Somos amigos. | wir → sind.
? Ihr ___ zu spät. | seid | sind, ist, bist | Llegan tarde. | ihr → seid.
? Sind ___ aus Mexiko, Frau Díaz? | Sie | du, ihr | ¿Usted es de México, señora Díaz? | Formal: Sie (con mayúscula).
? Anna ___ heute krank. | ist | sind, bin, seid | Anna está enferma hoy. | Una persona (ella) → ist.
? Das Kind ___ müde. | ist | sind, bist | El niño está cansado. | das Kind = es → ist.
? ___ du Student? | Bist | Bin, Ist, Seid | ¿Eres estudiante? | En las preguntas de sí/no el verbo va primero.
? Meine Eltern ___ in Berlin. | sind | ist, seid | Mis papás están en Berlín. | Plural (sie) → sind.
? ___ heiße Paul. | Ich | Du, Er | Me llamo Paul. | «heiße» va con ich.
? Wie heißt ___? | du | ich, wir | ¿Cómo te llamas? | «heißt» va con du.
`,
};

TEMAS.genero = {
  nivel: "A1", titulo: "der, die, das: el género",
  html: `
<p>Cada sustantivo alemán tiene un género: ${m("der")} (masculino), ${f("die")} (femenino) o ${n("das")} (neutro). El plural siempre es ${pl("die")}. El género casi nunca coincide con el español (${n("das")} Mädchen = la niña).</p>
${tip("Aprende cada sustantivo con su artículo, como si fuera una sola palabra: no «Tisch», sino «der Tisch». En esta app los colores te ayudan: azul = der, rojo = die, verde = das.")}
<p>Pero sí hay reglas que funcionan casi siempre:</p>
${tabla([["Siempre/casi siempre", "Terminación o tipo", "Ejemplos"], [f("die"), "-ung, -heit, -keit, -schaft, -tion, -tät, -ik, -ie, -ei", "die Zeitung, die Freiheit, die Universität"], [f("die"), "mujeres con -in", "die Lehrerin, die Ärztin"], [n("das"), "-chen, -lein, -ment, -um", "das Mädchen, das Museum"], [n("das"), "verbos usados como sustantivo", "das Essen, das Leben"], [m("der"), "días, meses, estaciones", "der Montag, der Mai, der Winter"], [m("der"), "-ling, -ismus, -or, personas en -er", "der Frühling, der Lehrer"]])}
<p>El artículo indefinido: ${m("ein")} Tisch, ${f("eine")} Lampe, ${n("ein")} Haus (en plural no hay).</p>
${ej("Die Zeitung ist neu.", "El periódico es nuevo.")}
${ej("Das Mädchen liest ein Buch.", "La niña lee un libro.")}`,
  ejercicios: `
? ___ Zeitung ist neu. | Die | Der, Das | El periódico es nuevo. | -ung → siempre die.
? ___ Mädchen liest. | Das | Die, Der | La niña lee. | -chen → siempre das, aunque sea una niña.
? ___ Montag ist lang. | Der | Die, Das | El lunes es largo. | Los días de la semana son der.
? ___ Freiheit ist wichtig. | Die | Der, Das | La libertad es importante. | -heit → die.
? ___ Brötchen ist frisch. | Das | Der, Die | El panecillo está fresco. | -chen → das.
? ___ Sommer ist heiß. | Der | Die, Das | El verano es caluroso. | Las estaciones son der.
? ___ Universität ist groß. | Die | Der, Das | La universidad es grande. | -tät → die.
? ___ Lehrer ist nett. | Der | Die, Das | El maestro es amable. | Personas en -er → der.
? ___ Lehrerin ist nett. | Die | Der, Das | La maestra es amable. | -in (mujeres) → die.
? ___ Museum ist zu. | Das | Der, Die | El museo está cerrado. | -um → das.
? Das ist ___ Apfel. | ein | eine | Es una manzana. | der Apfel → ein.
? Das ist ___ Lampe. | eine | ein | Es una lámpara. | die Lampe → eine.
? Das ist ___ Haus. | ein | eine | Es una casa. | das Haus → ein.
? ___ Kinder spielen. | Die | Der, Das | Los niños juegan. | El plural siempre es die.
`,
};

TEMAS.uhrzeit = {
  nivel: "A1", titulo: "Números y la hora",
  html: `
<p>Del 13 al 19 se dice la unidad + <b>zehn</b>: dreizehn, vierzehn… (ojo: <b>sechzehn</b>, <b>siebzehn</b>). Del 21 en adelante, ¡al revés!: <b>einundzwanzig</b> = «uno y veinte».</p>
${ej("dreizehn, sechzehn, siebzehn", "13, 16, 17")}
${ej("Er ist fünfundzwanzig Jahre alt.", "Tiene 25 años.")}
<p>Preguntar la hora: <b>Wie spät ist es?</b> o <b>Wie viel Uhr ist es?</b></p>
${tabla([["Hora", "Informal", "Formal (24 h)"], ["3:00", "drei Uhr", "drei Uhr"], ["3:10", "zehn nach drei", "drei Uhr zehn"], ["3:15", "Viertel nach drei", "drei Uhr fünfzehn"], ["3:30", "<b>halb vier</b> (¡!)", "drei Uhr dreißig"], ["3:45", "Viertel vor vier", "drei Uhr fünfundvierzig"], ["15:50", "zehn vor vier", "fünfzehn Uhr fünfzig"]])}
${tip("«halb drei» NO es 3:30: es «media hora antes de las tres» = 2:30. Es el error más común de los hispanohablantes.")}
<p>Preposiciones de tiempo: <b>um</b> + hora (um acht Uhr), <b>am</b> + día o parte del día (am Montag, am Abend), <b>im</b> + mes o estación (im Mai, im Winter).</p>
${ej("Der Kurs beginnt um halb neun.", "El curso empieza a las ocho y media.")}`,
  ejercicios: `
? 3:15 – Es ist Viertel ___ drei. | nach | vor, um | Son las tres y cuarto. | «nach» = después de.
? 3:45 – Es ist Viertel ___ vier. | vor | nach, halb | Es cuarto para las cuatro. | «vor» = antes de.
? 2:30 – Es ist ___ drei. | halb | Viertel, nach | Son las dos y media. | «halb drei» = media hora antes de las tres.
? 7:30 – Es ist halb ___. | acht | sieben, neun | Son las siete y media. | halb + la hora que sigue.
? Der Film beginnt ___ acht Uhr. | um | am, im | La película empieza a las ocho. | um + hora.
? Wir treffen uns ___ Montag. | am | um, im | Nos vemos el lunes. | am + día.
? Mein Geburtstag ist ___ Mai. | im | am, um | Mi cumpleaños es en mayo. | im + mes.
? 21 = ___ | einundzwanzig | zwanzigeins, zweiundzehn | 21 | Primero la unidad: «uno y veinte».
? 16:00 – Es ist ___ Uhr. | sechzehn | sechszehn, sechzig | Son las 16:00. | Se escribe sechzehn, sin la «s» de sechs.
? 10:05 – Es ist fünf ___ zehn. | nach | vor, um | Son las diez y cinco. | nach = y (después).
? 6:55 – Es ist fünf vor ___. | sieben | sechs, acht | Son cinco para las siete. | vor + la hora que viene.
`,
};

TEMAS.praesens = {
  nivel: "A1", titulo: "El presente",
  html: `
<p>Los verbos regulares se conjugan quitando <b>-en</b> al infinitivo (wohn-en) y añadiendo estas terminaciones:</p>
${tabla([["", "wohnen", "Terminación"], ["ich", "wohn<b>e</b>", "-e"], ["du", "wohn<b>st</b>", "-st"], ["er / sie / es", "wohn<b>t</b>", "-t"], ["wir", "wohn<b>en</b>", "-en"], ["ihr", "wohn<b>t</b>", "-t"], ["sie / Sie", "wohn<b>en</b>", "-en"]])}
${ej("Ich wohne in Berlin. Wo wohnst du?", "Vivo en Berlín. ¿Dónde vives tú?")}
<p>Si la raíz termina en <b>-t</b> o <b>-d</b>, se mete una <b>e</b>: du arbeit<b>e</b>st, er arbeit<b>e</b>t, ihr find<b>e</b>t. Si termina en <b>-s, -ß, -z</b>, con du solo se pone <b>-t</b>: du heißt, du tanzt.</p>
${ej("Er arbeitet viel.", "Él trabaja mucho.")}
${tip("La regla de oro del alemán: en una oración normal, el verbo conjugado va en la <b>posición 2</b>. Lo demás se puede mover: «Heute lerne ich Deutsch».")}
<p>El presente alemán también sirve para el futuro: «Morgen fahre ich nach Berlin» = Mañana voy a Berlín.</p>`,
  ejercicios: `
? Ich ___ in Berlin. (wohnen) | wohne | wohnst, wohnt, wohnen | Vivo en Berlín. | ich → -e.
? Du ___ schnell. (lernen) | lernst | lernt, lerne | Aprendes rápido. | du → -st.
? Er ___ Fußball. (spielen) | spielt | spielst, spielen | Él juega fútbol. | er → -t.
? Wir ___ zusammen. (kochen) | kochen | kocht, kochst | Cocinamos juntos. | wir → -en.
? Ihr ___ viel. (arbeiten) | arbeitet | arbeitt, arbeiten | Ustedes trabajan mucho. | Raíz en -t: se mete una e → arbeitet.
? Sie ___ Musik. (hören, ellos) | hören | hört, hörst | Ellos escuchan música. | sie (plural) → -en.
? Du ___ Maria, oder? (heißen) | heißt | heißst, heißest | Te llamas Maria, ¿verdad? | Raíz en -ß: con du solo -t.
? Was ___ du? (machen) | machst | macht, machen | ¿Qué haces? | du → -st.
? Er ___ seinen Schlüssel nicht. (finden) | findet | find, findt | No encuentra su llave. | Raíz en -d: findet.
? Ich ___ einen Kaffee. (kaufen) | kaufe | kaufst, kauft | Compro un café. | ich → -e.
? Sie ___ sehr gut. (tanzen, usted) | tanzen | tanzt, tanzst | Usted baila muy bien. | Sie (formal) → -en.
O Heute lerne ich Deutsch. / Ich lerne heute Deutsch. | Hoy aprendo alemán. | El verbo siempre va en la posición 2.
`,
};

TEMAS.haben = {
  nivel: "A1", titulo: "«haben» y el acusativo con «ein»",
  html: `
<p><b>haben</b> (tener) es irregular en du y er:</p>
${tabla([["", "haben"], ["ich", "habe"], ["du", "ha<b>st</b>"], ["er / sie / es", "ha<b>t</b>"], ["wir", "haben"], ["ihr", "habt"], ["sie / Sie", "haben"]])}
<p>Lo que tienes es el <b>complemento directo</b> y va en <b>acusativo</b>. La buena noticia: ¡solo cambia el masculino!</p>
${tabla([["", m("masculino"), f("femenino"), n("neutro")], ["sujeto (nominativo)", "ein / der", "eine / die", "ein / das"], ["acusativo", "<b>einen / den</b>", "eine / die", "ein / das"]])}
${ej("Ich habe einen Bruder und eine Schwester.", "Tengo un hermano y una hermana.")}
${ej("Ich möchte einen Kaffee, bitte.", "Quisiera un café, por favor.")}
${tip("Expresiones con haben: Hunger haben (tener hambre), Durst haben (tener sed), Zeit haben, Angst haben, Lust haben (tener ganas).")}`,
  ejercicios: `
? Ich ___ Hunger. | habe | hast, hat | Tengo hambre. | ich → habe.
? Du ___ einen Bruder. | hast | habt, hat | Tienes un hermano. | du → hast.
? Sie ___ ein Auto. (ella) | hat | haben, hast | Ella tiene un carro. | sie (ella) → hat.
? Wir ___ keine Zeit. | haben | habt, hat | No tenemos tiempo. | wir → haben.
? ___ ihr Kinder? | Habt | Haben, Hast | ¿Ustedes tienen hijos? | ihr → habt.
? Ich habe ___ Hund. | einen | ein, eine | Tengo un perro. | der Hund en acusativo → einen.
? Er hat ___ Schwester. | eine | einen, ein | Tiene una hermana. | Femenino: no cambia.
? Wir haben ___ Haus. | ein | einen, eine | Tenemos una casa. | Neutro: no cambia.
? Ich möchte ___ Kaffee. | einen | ein, eine | Quisiera un café. | der Kaffee → einen.
? Hast du ___ Schlüssel? | einen | ein, eine | ¿Tienes una llave? | der Schlüssel → einen.
? Ich nehme ___ Suppe. | die | den, das | Pido la sopa. | die Suppe no cambia.
? Ich nehme ___ Salat. | den | der, dem | Pido la ensalada. | der Salat → den.
`,
};

TEMAS.negacion = {
  nivel: "A1", titulo: "Decir que no: «nicht» y «kein»",
  html: `
<p>Hay dos formas de negar:</p>
${tabla([["", "Se usa para", "Ejemplo"], ["<b>kein</b>", "sustantivos con «ein» o sin artículo", "Ich habe <b>kein</b> Auto."], ["<b>nicht</b>", "todo lo demás: verbos, adjetivos, nombres, sustantivos con der/die/das", "Das ist <b>nicht</b> gut."]])}
<p><b>kein</b> cambia igual que «ein»: kein (m/n), keine (f y plural), keinen (m en acusativo).</p>
${ej("Ich habe keine Zeit und keinen Hunger.", "No tengo tiempo ni hambre.")}
<p><b>nicht</b> va al final de la oración o justo antes de lo que niegas (un adjetivo, un lugar):</p>
${ej("Er kommt heute nicht.", "Hoy no viene.")}
${ej("Das Hotel ist nicht teuer.", "El hotel no es caro.")}
${tip("Para decir «¡sí!» a una pregunta negativa se usa <b>doch</b>: «Kommst du nicht?» – «Doch!» (¡Claro que sí!).")}`,
  ejercicios: `
? Ich habe ___ Auto. | kein | nicht, keine | No tengo carro. | Sustantivo con «ein» → kein.
? Das ist ___ gut. | nicht | kein, keine | Eso no está bien. | Adjetivo → nicht.
? Ich habe ___ Zeit. | keine | kein, nicht | No tengo tiempo. | die Zeit → keine.
? Er kommt heute ___. | nicht | kein, keinen | Hoy no viene. | Para negar el verbo: nicht al final.
? Wir haben ___ Hund. | keinen | kein, keine | No tenemos perro. | der Hund en acusativo → keinen.
? Ich trinke ___ Kaffee. | keinen | nicht, kein | No tomo café. | Sustantivo sin artículo → kein (acusativo masculino: keinen).
? Das ist ___ Problem. | kein | nicht, keine | No hay problema. | das Problem → kein.
? Ich verstehe das ___. | nicht | kein, keine | No entiendo eso. | Verbo → nicht.
? Sie ist ___ müde. | nicht | kein, keine | Ella no está cansada. | Adjetivo → nicht.
? „Kommst du nicht?“ – „___! Ich komme.“ | Doch | Ja, Nein | —¿No vienes? —¡Claro que sí! | Sí a una pregunta negativa: doch.
? Ich habe ___ Geschwister. | keine | kein, nicht | No tengo hermanos. | Plural → keine.
`,
};

TEMAS.fragen = {
  nivel: "A1", titulo: "Preguntas y orden de la frase",
  html: `
<p><b>Preguntas con palabra W:</b> palabra W + verbo + sujeto.</p>
${tabla([["Palabra", "Significa", "Ejemplo"], ["was", "qué", "Was machst du?"], ["wer", "quién", "Wer ist das?"], ["wo", "dónde", "Wo wohnst du?"], ["woher", "de dónde", "Woher kommst du?"], ["wohin", "a dónde", "Wohin fährst du?"], ["wann", "cuándo", "Wann beginnt der Kurs?"], ["wie", "cómo", "Wie heißt du?"], ["warum", "por qué", "Warum lernst du Deutsch?"], ["wie viel", "cuánto", "Wie viel kostet das?"]])}
<p><b>Preguntas de sí o no:</b> el verbo va primero.</p>
${ej("Kommst du heute?", "¿Vienes hoy?")}
<p><b>Oraciones normales:</b> el verbo siempre en la posición 2. Si empiezas con otra cosa (heute, am Montag…), el sujeto pasa después del verbo.</p>
${ej("Ich gehe heute ins Kino. → Heute gehe ich ins Kino.", "Hoy voy al cine.")}
${tip("Piensa en el verbo como el «eje» de la frase: siempre en el lugar 2, pase lo que pase en el lugar 1.")}`,
  ejercicios: `
? ___ heißt du? | Wie | Was, Wo | ¿Cómo te llamas? | Para nombres se pregunta con wie.
? ___ kommst du? – Aus Peru. | Woher | Wo, Wohin | ¿De dónde eres? —De Perú. | Origen: woher.
? ___ gehst du? – Nach Hause. | Wohin | Wo, Woher | ¿A dónde vas? —A casa. | Destino: wohin.
? ___ ist das? – Mein Bruder. | Wer | Was, Wie | ¿Quién es? —Mi hermano. | Personas: wer.
? ___ kostet das? | Wie viel | Wie, Wann | ¿Cuánto cuesta eso? | Precio: wie viel.
? ___ beginnt der Film? – Um acht. | Wann | Wo, Wie | ¿Cuándo empieza la película? —A las ocho. | Tiempo: wann.
O Wo wohnst du? | ¿Dónde vives? | Palabra W + verbo + sujeto.
O Woher kommen Sie? | ¿De dónde es usted? | Palabra W + verbo + sujeto.
O Kommst du heute? | ¿Vienes hoy? | Pregunta de sí o no: el verbo va primero.
O Heute gehe ich ins Kino. / Ich gehe heute ins Kino. | Hoy voy al cine. | El verbo siempre en la posición 2.
O Am Montag arbeite ich nicht. / Ich arbeite am Montag nicht. | El lunes no trabajo. | Si empiezas con «am Montag», el sujeto va después del verbo.
`,
};

TEMAS.vokalwechsel = {
  nivel: "A1", titulo: "Verbos que cambian de vocal",
  html: `
<p>Algunos verbos muy comunes cambian la vocal, <b>pero solo con du y er/sie/es</b>. Con ich, wir, ihr y sie son normales.</p>
${tabla([["Cambio", "Infinitivo", "du", "er / sie / es"], ["a → ä", "fahren", "fährst", "fährt"], ["a → ä", "schlafen", "schläfst", "schläft"], ["au → äu", "laufen", "läufst", "läuft"], ["e → i", "sprechen", "sprichst", "spricht"], ["e → i", "essen", "isst", "isst"], ["e → i", "geben", "gibst", "gibt"], ["e → i", "nehmen", "nimmst", "nimmt"], ["e → ie", "sehen", "siehst", "sieht"], ["e → ie", "lesen", "liest", "liest"]])}
${ej("Ich fahre nach Hause, aber du fährst zur Arbeit.", "Yo voy a casa, pero tú vas al trabajo.")}
${ej("Sprichst du Deutsch?", "¿Hablas alemán?")}
${tip("En las palabras de esta app verás estas formas entre paréntesis: «fahren (fährt)». Practica diciéndolas en voz alta: decirlo ayuda a recordarlo (efecto de producción).")}`,
  ejercicios: `
? Du ___ zu schnell. (fahren) | fährst | fahrst, fährt | Manejas demasiado rápido. | a → ä con du.
? Er ___ ein Buch. (lesen) | liest | lest, lieset | Él lee un libro. | e → ie: er liest.
? ___ du Deutsch? (sprechen) | Sprichst | Sprechst, Spricht | ¿Hablas alemán? | e → i: du sprichst.
? Sie ___ viel. (schlafen, ella) | schläft | schlaft, schläfst | Ella duerme mucho. | a → ä: sie schläft.
? Was ___ du? (essen) | isst | esst, issst | ¿Qué comes? | essen → du isst.
? Er ___ mir das Buch. (geben) | gibt | gebt, gibst | Me da el libro. | e → i: er gibt.
? Ich ___ nach Hause. (fahren) | fahre | fähre, fährst | Me voy a casa. | Con ich no cambia.
? Wir ___ einen Film. (sehen) | sehen | sieht, siehen | Vemos una película. | Con wir no cambia.
? ___ du mir? (helfen) | Hilfst | Helfst, Hilft | ¿Me ayudas? | e → i: du hilfst.
? Sie ___ ein rotes Kleid. (tragen, ella) | trägt | tragt, trägst | Ella lleva un vestido rojo. | a → ä: sie trägt.
? Er ___ die Suppe. (nehmen) | nimmt | nehmt, nimmst | Él pide la sopa. | nehmen → er nimmt.
? Ihr ___ sehr schnell. (laufen) | lauft | läuft, läufst | Ustedes corren muy rápido. | Con ihr no cambia.
`,
};

TEMAS.plural = {
  nivel: "A1", titulo: "El plural",
  html: `
<p>El plural alemán tiene varias formas. Por eso en esta app cada sustantivo trae su plural: apréndelo junto con la palabra. El artículo del plural siempre es ${pl("die")}.</p>
${tabla([["Terminación", "Típico de", "Ejemplo"], ["-e (a veces con ¨)", "masculinos", "der Tag → die Tage, der Stuhl → die Stühle"], ["-er (con ¨ si se puede)", "neutros cortos", "das Kind → die Kinder, das Buch → die Bücher"], ["-n / -en", "casi todos los femeninos", "die Lampe → die Lampen, die Frau → die Frauen"], ["-nen", "mujeres en -in", "die Lehrerin → die Lehrerinnen"], ["-s", "palabras extranjeras, en -a, -o", "das Auto → die Autos"], ["sin cambio (a veces ¨)", "-er, -el, -en", "der Lehrer → die Lehrer, der Vater → die Väter"]])}
${ej("Die Kinder lesen Bücher.", "Los niños leen libros.")}
${tip("Truco: casi todos los femeninos hacen el plural con -(e)n. Si dudas con una palabra femenina, apuesta por -n.")}`,
  ejercicios: `
? ein Kind, zwei ___ | Kinder | Kinds, Kinden | un niño, dos niños | Neutro corto → -er.
? eine Frau, zwei ___ | Frauen | Fraus, Fräue | una mujer, dos mujeres | Femenino → -en.
? ein Auto, zwei ___ | Autos | Autoen, Auter | un carro, dos carros | Termina en -o → -s.
? ein Buch, zwei ___ | Bücher | Buche, Buchen | un libro, dos libros | -er con diéresis.
? ein Stuhl, zwei ___ | Stühle | Stuhle, Stühlen | una silla, dos sillas | Masculino → -e (aquí con diéresis).
? eine Lampe, zwei ___ | Lampen | Lampes, Lampe | una lámpara, dos lámparas | Femenino en -e → -n.
? ein Lehrer, zwei ___ | Lehrer | Lehrern, Lehrers | un maestro, dos maestros | En -er: no cambia.
? eine Lehrerin, zwei ___ | Lehrerinnen | Lehrerinen, Lehrerins | una maestra, dos maestras | -in → -innen.
? ein Apfel, zwei ___ | Äpfel | Apfels, Apfeln | una manzana, dos manzanas | Sin terminación, pero con diéresis.
? ein Tag, zwei ___ | Tage | Täge, Tagen | un día, dos días | Masculino → -e.
? ein Haus, zwei ___ | Häuser | Hause, Hausen | una casa, dos casas | -er con diéresis.
? ___ Kinder spielen im Park. | Die | Der, Das | Los niños juegan en el parque. | Plural → siempre die.
`,
};

TEMAS.akkusativ = {
  nivel: "A1", titulo: "El acusativo",
  html: `
<p>El <b>acusativo</b> es el complemento directo: lo que (o a quien) ves, compras, quieres… Solo cambia el <b>masculino</b>:</p>
${tabla([["", m("der"), f("die"), n("das"), pl("die")], ["nominativo", "der / ein / kein / mein", "die / eine", "das / ein", "die / keine"], ["acusativo", "<b>den / einen / keinen / meinen</b>", "die / eine", "das / ein", "die / keine"]])}
${ej("Ich sehe den Mann.", "Veo al hombre.")}
<p>Los pronombres también cambian:</p>
${tabla([["Nominativo", "Acusativo", "Español"], ["ich", "<b>mich</b>", "me"], ["du", "<b>dich</b>", "te"], ["er", "<b>ihn</b>", "lo (a él)"], ["sie", "sie", "la (a ella)"], ["es", "es", "lo"], ["wir", "<b>uns</b>", "nos"], ["ihr", "<b>euch</b>", "los (a ustedes)"], ["sie / Sie", "sie / Sie", "los (a ellos) / lo (a usted)"]])}
${ej("Liebst du mich? – Ja, ich liebe dich.", "¿Me amas? —Sí, te amo.")}
<p>Estas preposiciones <b>siempre</b> llevan acusativo: <b>durch, für, gegen, ohne, um</b>.</p>
${ej("Das Geschenk ist für dich.", "El regalo es para ti.")}`,
  ejercicios: `
? Ich sehe ___ Mann. | den | der, dem | Veo al hombre. | Masculino en acusativo: der → den.
? Ich kaufe ___ Tisch. | einen | ein, einem | Compro una mesa. | der Tisch: ein → einen.
? Sie liebt ___. (a él) | ihn | er, ihm | Ella lo ama. | er → ihn.
? Kennst du ___? (a mí) | mich | mir, ich | ¿Me conoces? | ich → mich.
? Das Geschenk ist für ___. (tú) | dich | dir, du | El regalo es para ti. | für + acusativo.
? Ich gehe ohne ___ Bruder. | meinen | mein, meinem | Voy sin mi hermano. | ohne + acusativo: mein → meinen.
? Wir besuchen ___ Oma. | die | der, den | Visitamos a la abuela. | El femenino no cambia.
? Ich lese ___ Buch. | das | den, dem | Leo el libro. | El neutro no cambia.
? Wir gehen durch ___ Park. | den | der, dem | Caminamos por el parque. | durch + acusativo.
? Ich rufe ___ morgen an. (a ustedes) | euch | ihr, uns | Les llamo mañana. | ihr → euch.
? Siehst du ___ Hund? | den | der, dem | ¿Ves al perro? | der Hund → den.
? Ich brauche ___ Hilfe. (tu) | deine | deinen, dein | Necesito tu ayuda. | die Hilfe → deine (no cambia).
`,
};

TEMAS.trennbar = {
  nivel: "A1", titulo: "Verbos separables",
  html: `
<p>Muchos verbos tienen un prefijo que se <b>separa</b> y se va al <b>final</b> de la frase: auf·stehen → Ich stehe um sieben Uhr <b>auf</b>.</p>
${tabla([["Infinitivo", "Presente", "Significa"], ["aufstehen", "ich stehe … auf", "levantarse"], ["einkaufen", "ich kaufe … ein", "hacer las compras"], ["anrufen", "ich rufe … an", "llamar por teléfono"], ["fernsehen", "ich sehe … fern", "ver la tele"], ["anfangen", "es fängt … an", "empezar"], ["mitkommen", "ich komme … mit", "venir con alguien"]])}
${ej("Ich stehe um sieben Uhr auf.", "Me levanto a las siete.")}
${ej("Rufst du mich morgen an?", "¿Me llamas mañana?")}
<p>Con un verbo modal, el separable va <b>junto</b> y al final: Ich muss früh <b>aufstehen</b>. En el Perfekt, el ge- va en medio: auf<b>ge</b>standen.</p>
${tip("Los prefijos be-, ver-, er-, ent-, emp-, ge-, zer- NUNCA se separan: verstehen → ich verstehe.")}`,
  ejercicios: `
O Ich stehe um sieben Uhr auf. | Me levanto a las siete. | El prefijo «auf» se va al final.
O Am Samstag kaufen wir ein. / Wir kaufen am Samstag ein. | El sábado hacemos las compras. | «ein» se va al final.
O Rufst du mich morgen an? | ¿Me llamas mañana? | Pregunta: verbo primero, prefijo al final.
? Der Film fängt um acht ___. | an | auf, ein | La película empieza a las ocho. | anfangen → fängt … an.
? Ich ___ heute Abend fern. | sehe | fernsehe, sieht | Hoy en la noche veo la tele. | Verbo en posición 2, «fern» al final.
? Kommst du ___? | mit | an, auf | ¿Vienes conmigo? | mitkommen → kommst … mit.
? Ich muss morgen früh ___. | aufstehen | stehe auf, aufstehe | Mañana tengo que levantarme temprano. | Con modal: infinitivo completo al final.
? Wann ___ der Zug an? | kommt | ankommt, kommen | ¿Cuándo llega el tren? | ankommen → kommt … an.
? Ich ___ mein Zimmer auf. | räume | aufräume, räumt | Ordeno mi cuarto. | aufräumen → räume … auf.
? Er ___ seine Mutter an. | ruft | anruft, rufen | Le llama a su mamá. | anrufen → ruft … an.
? Ich ___ das nicht. (verstehen) | verstehe | stehe, verstehst | No lo entiendo. | «ver-» no se separa nunca.
`,
};

TEMAS.possessiv = {
  nivel: "A1", titulo: "Mi, tu, su: los posesivos",
  html: `
${tabla([["Persona", "Posesivo", "Español"], ["ich", "mein", "mi"], ["du", "dein", "tu"], ["er / es", "sein", "su (de él)"], ["sie", "ihr", "su (de ella)"], ["wir", "unser", "nuestro"], ["ihr", "euer", "su (de ustedes) / vuestro"], ["sie / Sie", "ihr / Ihr", "su (de ellos) / su (de usted)"]])}
<p>Llevan las mismas terminaciones que <b>ein</b>: mein (m, n), mein<b>e</b> (f y plural), mein<b>en</b> (masculino en acusativo).</p>
${ej("Das ist mein Vater und das ist meine Mutter.", "Este es mi papá y esta es mi mamá.")}
${ej("Ich besuche meinen Bruder.", "Visito a mi hermano.")}
${tip("En español «su» sirve para todo; en alemán debes saber de quién es: sein (de él) o ihr (de ella). «Lisa und ihr Hund» = Lisa y su perro.")}`,
  ejercicios: `
? Das ist ___ Mutter. (mi) | meine | mein, meinen | Ella es mi mamá. | die Mutter → meine.
? Wo ist ___ Schlüssel? (tu) | dein | deine, deinen | ¿Dónde está tu llave? | der Schlüssel (sujeto) → dein.
? Das ist Tom und das ist ___ Auto. | sein | ihr, seine | Este es Tom y este es su carro. | De él → sein.
? Das ist Lisa und das ist ___ Hund. | ihr | sein, ihre | Esta es Lisa y este es su perro. | De ella → ihr.
? Wir lieben ___ Kinder. | unsere | unser, unseren | Amamos a nuestros hijos. | Plural → unsere.
? Ich besuche ___ Bruder. | meinen | mein, meine | Visito a mi hermano. | Masculino en acusativo → meinen.
? Ist das ___ Haus? (de ustedes) | euer | eure, euren | ¿Es su casa (de ustedes)? | das Haus → euer.
? Frau Weber, ist das ___ Tasche? | Ihre | ihre, deine | Señora Weber, ¿es su bolsa? | Formal: Ihr con mayúscula; die Tasche → Ihre.
? ___ Eltern wohnen in Wien. (mis) | Meine | Mein, Meinen | Mis papás viven en Viena. | Plural → meine.
? Er sucht ___ Brille. (su, de él) | seine | sein, seinen | Él busca sus lentes. | die Brille → seine.
`,
};

/* ============================ A2 ============================ */
TEMAS.modal = {
  nivel: "A2", titulo: "Verbos modales",
  html: `
${tabla([["", "können", "müssen", "wollen", "dürfen", "sollen", "möchten"], ["ich", "kann", "muss", "will", "darf", "soll", "möchte"], ["du", "kannst", "musst", "willst", "darfst", "sollst", "möchtest"], ["er / sie / es", "kann", "muss", "will", "darf", "soll", "möchte"], ["wir / sie / Sie", "können", "müssen", "wollen", "dürfen", "sollen", "möchten"], ["ihr", "könnt", "müsst", "wollt", "dürft", "sollt", "möchtet"]])}
<p>Fíjate: con ich y er son iguales y no llevan -t. La estructura es como un sándwich: <b>modal en posición 2</b> … <b>infinitivo al final</b>.</p>
${ej("Ich kann gut schwimmen.", "Sé nadar bien.")}
${ej("Du musst jetzt nach Hause gehen.", "Ahora tienes que irte a casa.")}
${tabla([["Modal", "Significa"], ["können", "poder, saber hacer algo"], ["müssen", "tener que (obligación, necesidad)"], ["wollen", "querer (decidido)"], ["möchten", "querer (amable: quisiera)"], ["dürfen", "tener permiso; nicht dürfen = estar prohibido"], ["sollen", "deber (porque otra persona lo dice)"]])}
${tip("«Du musst nicht kommen» = no tienes que venir (no es necesario). «Du darfst nicht kommen» = no puedes venir (está prohibido).")}`,
  ejercicios: `
O Ich kann gut schwimmen. | Sé nadar bien. | Modal en posición 2, infinitivo al final.
O Du musst jetzt nach Hause gehen. | Ahora tienes que irte a casa. | El infinitivo «gehen» va hasta el final.
O Morgen wollen wir ins Kino gehen. / Wir wollen morgen ins Kino gehen. | Mañana queremos ir al cine. | Modal en posición 2.
? Ich ___ heute nicht kommen. (können) | kann | könne, kannst | Hoy no puedo venir. | ich kann (sin terminación).
? Er ___ viel arbeiten. (müssen) | muss | müsst, musst | Él tiene que trabajar mucho. | er muss.
? ___ du Deutsch sprechen? (können) | Kannst | Könnst, Kann | ¿Sabes hablar alemán? | du kannst.
? Hier ___ man nicht parken. (dürfen) | darf | dürft, darfst | Aquí no se puede estacionar. | nicht dürfen = prohibido.
? Ich ___ einen Tee, bitte. (möchten) | möchte | möchten, möchtest | Quisiera un té, por favor. | ich möchte.
? Wir ___ nach Spanien fahren. (wollen) | wollen | wollt, will | Queremos ir a España. | wir wollen.
? Du ___ nicht kommen, wenn du keine Zeit hast. | musst | darfst, kannst | No tienes que venir si no tienes tiempo. | «nicht müssen» = no es necesario.
? Der Arzt sagt, ich ___ weniger rauchen. | soll | will, darf | El médico dice que debo fumar menos. | sollen: deber porque otro lo dice.
? Kannst du mir ___? | helfen | hilfst, hilft | ¿Me puedes ayudar? | Después del modal va el infinitivo.
`,
};

TEMAS.dativ = {
  nivel: "A2", titulo: "El dativo",
  html: `
<p>El <b>dativo</b> responde a «¿a quién?» o «¿para quién?» (el complemento indirecto). También va después de algunas preposiciones y verbos.</p>
${tabla([["", m("der"), f("die"), n("das"), pl("die")], ["nominativo", "der / ein", "die / eine", "das / ein", "die"], ["dativo", "<b>dem / einem</b>", "<b>der / einer</b>", "<b>dem / einem</b>", "<b>den</b> + -n"]])}
${ej("Ich gebe dem Mann das Buch.", "Le doy el libro al hombre.")}
${ej("Wir schenken den Kindern Bücher.", "Les regalamos libros a los niños.")}
${tabla([["Nominativo", "Dativo", "Español"], ["ich", "<b>mir</b>", "me / a mí"], ["du", "<b>dir</b>", "te / a ti"], ["er", "<b>ihm</b>", "le / a él"], ["sie", "<b>ihr</b>", "le / a ella"], ["es", "<b>ihm</b>", "le"], ["wir", "uns", "nos"], ["ihr", "euch", "les / a ustedes"], ["sie / Sie", "<b>ihnen / Ihnen</b>", "les / a ellos / a usted"]])}
<p>Verbos que siempre llevan dativo: <b>helfen, danken, gefallen, gehören, schmecken, antworten, gratulieren</b>.</p>
${ej("Das Kleid gefällt mir.", "Me gusta el vestido.")}
${tip("Truco: en las terminaciones del dativo aparecen mucho la <b>m</b> y la <b>r</b>: dem, einem, der, einer, mir, ihm, ihr.")}`,
  ejercicios: `
? Ich helfe ___ Mann. | dem | den, der | Ayudo al hombre. | helfen + dativo: der → dem.
? Ich gebe ___ Frau das Buch. | der | die, dem | Le doy el libro a la mujer. | Femenino en dativo: die → der.
? Das Auto gehört ___ Kind. | dem | das, den | El carro es del niño. | gehören + dativo: das → dem.
? Wie geht es ___? (a ti) | dir | dich, du | ¿Cómo estás? | du → dir.
? Das Essen schmeckt ___. (a mí) | mir | mich, ich | La comida me sabe rica. | ich → mir.
? Ich danke ___. (a usted) | Ihnen | Sie, Ihr | Le agradezco. | Sie → Ihnen.
? Gefällt ___ das Kleid? (a ella) | ihr | sie, ihm | ¿A ella le gusta el vestido? | sie → ihr.
? Wir schenken ___ Kindern Bücher. | den | die, dem | Les regalamos libros a los niños. | Plural en dativo: den + -n.
? Ich schreibe ___ Freund eine E-Mail. | meinem | meinen, mein | Le escribo un correo a mi amigo. | mein → meinem.
? Kannst du ___ helfen? (a nosotros) | uns | wir, euch | ¿Nos puedes ayudar? | wir → uns.
? Ich antworte ___ Lehrerin. | der | die, den | Le respondo a la maestra. | antworten + dativo: die → der.
`,
};

TEMAS.praep = {
  nivel: "A2", titulo: "Preposiciones con caso fijo",
  html: `
<p>Algunas preposiciones <b>siempre</b> llevan el mismo caso. Apréndetelas como canción:</p>
${tabla([["Siempre dativo", "Siempre acusativo"], ["<b>aus</b> (de, procedencia)", "<b>durch</b> (a través de)"], ["<b>bei</b> (en casa de, en)", "<b>für</b> (para)"], ["<b>mit</b> (con)", "<b>gegen</b> (contra)"], ["<b>nach</b> (después de, hacia)", "<b>ohne</b> (sin)"], ["<b>seit</b> (desde hace)", "<b>um</b> (a las, alrededor)"], ["<b>von</b> (de, desde)", ""], ["<b>zu</b> (a, hacia personas/lugares)", ""]])}
${ej("Ich fahre mit dem Bus zur Arbeit.", "Voy en autobús al trabajo.")}
${ej("Ich wohne seit einem Jahr hier.", "Vivo aquí desde hace un año.")}
<p>Contracciones muy usadas: zu + dem = <b>zum</b>, zu + der = <b>zur</b>, bei + dem = <b>beim</b>, von + dem = <b>vom</b>, in + dem = <b>im</b>, an + dem = <b>am</b>, in + das = <b>ins</b>.</p>
${ej("Ich gehe zum Arzt und dann zur Apotheke.", "Voy al médico y luego a la farmacia.")}
${tip("«nach» para ciudades y países sin artículo (nach Berlin), «zu» para personas y lugares (zu meiner Oma, zum Bahnhof) y «nach Hause» para ir a casa.")}`,
  ejercicios: `
? Ich fahre mit ___ Bus. | dem | den, der | Voy en autobús. | mit + dativo: der Bus → dem.
? Das ist ein Geschenk für ___ Mutter. | meine | meiner, meinem | Es un regalo para mi mamá. | für + acusativo.
? Ich gehe ___ Arzt. | zum | zur, zu den | Voy al médico. | zu + dem = zum.
? Ich gehe ___ Apotheke. | zur | zum, zu | Voy a la farmacia. | zu + der = zur.
? Er kommt ___ der Schweiz. | aus | von, bei | Él es de Suiza. | aus + dativo: procedencia.
? Ich wohne seit ___ Jahr hier. | einem | ein, einen | Vivo aquí desde hace un año. | seit + dativo.
? Wir gehen ohne ___ Hund. | den | dem, der | Vamos sin el perro. | ohne + acusativo.
? Ich arbeite ___ einer Bank. | bei | mit, zu | Trabajo en un banco. | bei: lugar de trabajo.
? Nach ___ Arbeit gehe ich schlafen. | der | die, dem | Después del trabajo me voy a dormir. | nach + dativo: die Arbeit → der.
? Ich komme gerade ___ Supermarkt. | vom | von, zum | Vengo del súper. | von + dem = vom.
? Der Kurs beginnt ___ neun Uhr. | um | am, im | El curso empieza a las nueve. | um + hora (acusativo).
? Wir fliegen ___ Spanien. | nach | zu, in | Volamos a España. | Países sin artículo: nach.
`,
};

TEMAS.perfekt = {
  nivel: "A2", titulo: "El pasado hablado: Perfekt",
  html: `
<p>Para contar lo que pasó, en la conversación se usa el <b>Perfekt</b>: <b>haben</b> o <b>sein</b> en posición 2 + <b>participio</b> al final.</p>
${ej("Ich habe gestern Pizza gegessen.", "Ayer comí pizza.")}
${ej("Wir sind nach Berlin gefahren.", "Fuimos a Berlín.")}
${tabla([["Tipo", "Forma", "Ejemplos"], ["regular", "ge- … -t", "machen → gemacht, kaufen → gekauft"], ["raíz en -t/-d", "ge- … -et", "arbeiten → gearbeitet"], ["irregular", "ge- … -en (a veces cambia la vocal)", "essen → gegessen, schreiben → geschrieben"], ["separable", "prefijo + ge + …", "aufstehen → aufgestanden, einkaufen → eingekauft"], ["be-, ver-, er-… y -ieren", "sin ge-", "besuchen → besucht, verstehen → verstanden, studieren → studiert"]])}
<p><b>sein</b> se usa con verbos de <b>movimiento</b> (gehen, fahren, fliegen, kommen) o <b>cambio de estado</b> (aufstehen, einschlafen), y además con sein, bleiben y werden. Todo lo demás usa <b>haben</b>.</p>
${tip("Cada verbo de esta app trae su Perfekt entre paréntesis (ist gefahren, hat gegessen). En los repasos avanzados te pediremos conjugarlo.")}`,
  ejercicios: `
? Ich ___ Pizza gegessen. | habe | bin, hat | Comí pizza. | essen → con haben.
? Wir ___ nach Berlin gefahren. | sind | haben, seid | Fuimos a Berlín. | Movimiento → sein.
? Hast du den Film ___? (sehen) | gesehen | gesieht, geseht | ¿Viste la película? | sehen → gesehen.
? Ich habe gestern viel ___. (arbeiten) | gearbeitet | gearbeit, arbeitet | Ayer trabajé mucho. | Raíz en -t: ge…et.
? Er ist um sieben Uhr ___. (aufstehen) | aufgestanden | geaufstanden, aufgesteht | Se levantó a las siete. | Separable: auf + ge + standen.
? Sie hat Medizin ___. (studieren) | studiert | gestudiert, studieret | Ella estudió medicina. | -ieren: sin ge-.
? Ich habe das nicht ___. (verstehen) | verstanden | geverstanden, verstehen | No entendí eso. | ver-: sin ge-.
? Wir ___ zu Hause geblieben. | sind | haben, hat | Nos quedamos en casa. | bleiben → con sein.
? Was hast du am Wochenende ___? (machen) | gemacht | gemachen, macht | ¿Qué hiciste el fin de semana? | Regular: ge…t.
? Er ___ seine Oma besucht. | hat | ist, habt | Visitó a su abuela. | besuchen → con haben.
O Gestern habe ich Deutsch gelernt. / Ich habe gestern Deutsch gelernt. | Ayer estudié alemán. | Auxiliar en posición 2, participio al final.
? Wann ___ du angekommen? | bist | hast, ist | ¿Cuándo llegaste? | ankommen → con sein.
`,
};

TEMAS.wechsel = {
  nivel: "A2", titulo: "¿Dónde o a dónde? (Wechselpräpositionen)",
  html: `
<p>Nueve preposiciones pueden llevar <b>dativo</b> o <b>acusativo</b>: <b>in, an, auf, über, unter, vor, hinter, neben, zwischen</b>.</p>
${tabla([["Pregunta", "Caso", "Idea", "Ejemplo"], ["<b>Wo?</b> ¿dónde?", "dativo", "estar en un lugar (quieto)", "Das Buch liegt auf <b>dem</b> Tisch."], ["<b>Wohin?</b> ¿a dónde?", "acusativo", "moverse hacia un lugar", "Ich lege das Buch auf <b>den</b> Tisch."]])}
${ej("Wir sind im Kino. – Wir gehen ins Kino.", "Estamos en el cine. —Vamos al cine.")}
<p>Parejas de verbos que van con esto:</p>
${tabla([["Estar (Wo? + dativo)", "Poner (Wohin? + acusativo)"], ["liegen (estar acostado)", "legen (poner acostado)"], ["stehen (estar de pie)", "stellen (poner de pie)"], ["sitzen (estar sentado)", "sich setzen (sentarse)"], ["hängen (estar colgado)", "hängen (colgar)"]])}
${ej("Ich stelle die Flasche in den Kühlschrank. Jetzt steht sie im Kühlschrank.", "Pongo la botella en el refri. Ahora está en el refri.")}`,
  ejercicios: `
? Das Buch liegt auf ___ Tisch. | dem | den, der | El libro está sobre la mesa. | ¿Dónde? → dativo.
? Ich lege das Buch auf ___ Tisch. | den | dem, der | Pongo el libro sobre la mesa. | ¿A dónde? → acusativo.
? Wir gehen ___ Kino. | ins | im, in | Vamos al cine. | Movimiento: in + das = ins.
? Wir sind ___ Kino. | im | ins, in | Estamos en el cine. | Lugar: in + dem = im.
? Die Katze schläft unter ___ Bett. | dem | das, den | El gato duerme debajo de la cama. | Lugar → dativo.
? Ich hänge das Bild an ___ Wand. | die | der, den | Cuelgo el cuadro en la pared. | Movimiento → acusativo.
? Das Bild hängt an ___ Wand. | der | die, dem | El cuadro está en la pared. | Lugar → dativo: die → der.
? Ich stelle die Flasche in ___ Kühlschrank. | den | dem, der | Pongo la botella en el refri. | stellen (movimiento) → acusativo.
? Die Flasche steht ___ Kühlschrank. | im | ins, in den | La botella está en el refri. | stehen (lugar) → dativo: im.
? Er setzt sich neben ___ Frau. | die | der, den | Se sienta junto a la mujer. | sich setzen (movimiento) → acusativo.
? Er sitzt neben ___ Frau. | der | die, dem | Está sentado junto a la mujer. | sitzen (lugar) → dativo.
`,
};

TEMAS.reflexiv = {
  nivel: "A2", titulo: "Verbos reflexivos",
  html: `
<p>Como en español (alegrarse, sentirse), algunos verbos llevan un pronombre reflexivo:</p>
${tabla([["", "sich freuen", "Pronombre"], ["ich", "freue <b>mich</b>", "mich"], ["du", "freust <b>dich</b>", "dich"], ["er / sie / es", "freut <b>sich</b>", "sich"], ["wir", "freuen <b>uns</b>", "uns"], ["ihr", "freut <b>euch</b>", "euch"], ["sie / Sie", "freuen <b>sich</b>", "sich"]])}
${ej("Ich freue mich auf das Wochenende.", "Ya quiero que llegue el fin de semana.")}
<p>Muchos van con una preposición fija: sich freuen <b>auf</b> (algo futuro) / <b>über</b> (algo que pasó), sich interessieren <b>für</b>, sich ärgern <b>über</b>.</p>
<p>Si hay otro complemento (las manos, los dientes), el reflexivo va en <b>dativo</b>: Ich wasche <b>mir</b> die Hände.</p>
${ej("Ich putze mir die Zähne.", "Me lavo los dientes.")}
${tip("No todos coinciden con el español: «sich beeilen» (apurarse) sí, pero «aufstehen» (levantarse) no es reflexivo en alemán.")}`,
  ejercicios: `
? Ich freue ___ auf die Ferien. | mich | mir, sich | Ya quiero que lleguen las vacaciones. | ich → mich.
? Du musst ___ beeilen. | dich | dir, sich | Tienes que apurarte. | du → dich.
? Er interessiert ___ für Musik. | sich | ihn, ihm | Le interesa la música. | er → sich.
? Wir treffen ___ um acht. | uns | euch, sich | Nos vemos a las ocho. | wir → uns.
? Freut ihr ___? | euch | uns, sich | ¿Están contentos? | ihr → euch.
? Sie fühlt ___ nicht gut. | sich | ihr, sie | Ella no se siente bien. | sie → sich.
? Ich wasche ___ die Hände. | mir | mich, mein | Me lavo las manos. | Con otro complemento, el reflexivo va en dativo: mir.
? Setzen Sie ___, bitte! | sich | Sie, Ihnen | ¡Siéntese, por favor! | Sie → sich.
? Ich ärgere mich ___ den Lärm. | über | auf, für | Me enoja el ruido. | sich ärgern über.
? Ich interessiere mich ___ Kunst. | für | über, an | Me interesa el arte. | sich interessieren für.
`,
};

TEMAS.komparativ = {
  nivel: "A2", titulo: "Comparar: más que, el más",
  html: `
${tabla([["", "Comparativo (+er)", "Superlativo (am …sten)"], ["schnell", "schnell<b>er</b>", "am schnell<b>sten</b>"], ["klein", "klein<b>er</b>", "am klein<b>sten</b>"], ["alt", "<b>ä</b>lter", "am <b>ä</b>lte<b>sten</b>"], ["groß", "gr<b>ö</b>ßer", "am gr<b>ö</b>ßten"], ["kalt", "k<b>ä</b>lter", "am k<b>ä</b>ltesten"], ["gut", "<b>besser</b>", "am <b>besten</b>"], ["viel", "<b>mehr</b>", "am <b>meisten</b>"], ["gern", "<b>lieber</b>", "am <b>liebsten</b>"], ["hoch", "<b>höher</b>", "am <b>höchsten</b>"]])}
<p>Nunca se dice «mehr schnell»: siempre <b>-er</b>. Los adjetivos cortos con a, o, u suelen llevar diéresis.</p>
${ej("Der Zug ist schneller als der Bus.", "El tren es más rápido que el autobús.")}
${ej("Er ist so groß wie sein Vater.", "Es tan alto como su papá.")}
<p>Para comparar: <b>als</b> (más … que) y <b>so … wie</b> (tan … como).</p>
${tip("Delante de un sustantivo, el superlativo lleva terminación de adjetivo: der schönste Tag, die beste Idee.")}`,
  ejercicios: `
? Mein Bruder ist ___ als ich. (alt) | älter | alter, mehr alt | Mi hermano es mayor que yo. | alt → älter (con diéresis).
? Der Zug ist ___ als der Bus. (schnell) | schneller | schnellerer, mehr schnell | El tren es más rápido que el autobús. | +er.
? Das ist gut, aber das ist ___. | besser | guter, güter | Eso está bien, pero esto está mejor. | gut → besser.
? Ich trinke ___ Tee als Kaffee. | lieber | gerner, mehr gern | Prefiero el té al café. | gern → lieber.
? Berlin ist größer ___ München. | als | wie, dann | Berlín es más grande que Múnich. | Comparativo + als.
? Er ist so groß ___ sein Vater. | wie | als, so | Es tan alto como su papá. | so … wie.
? Im Winter ist es ___ als im Sommer. (kalt) | kälter | kalter, kältest | En invierno hace más frío que en verano. | kalt → kälter.
? Der Mount Everest ist am ___. (hoch) | höchsten | hochsten, höhesten | El Everest es el más alto. | hoch → am höchsten.
? Ich esse am ___ Pizza. (gern) | liebsten | gernsten, meisten | Lo que más me gusta comer es pizza. | gern → am liebsten.
? Wer hat ___ Geld? (viel → más) | mehr | vieler, mehrer | ¿Quién tiene más dinero? | viel → mehr.
? Das ist der ___ Tag des Jahres. (schön) | schönste | schönsten, schöner | Es el día más bonito del año. | der + superlativo + -e.
`,
};

TEMAS.imperativ = {
  nivel: "A2", titulo: "Dar órdenes: el imperativo",
  html: `
${tabla([["", "kommen", "sprechen", "fahren", "sein"], ["du", "Komm!", "Sprich!", "Fahr!", "Sei!"], ["ihr", "Kommt!", "Sprecht!", "Fahrt!", "Seid!"], ["Sie", "Kommen Sie!", "Sprechen Sie!", "Fahren Sie!", "Seien Sie!"]])}
<p><b>du:</b> la raíz del verbo, sin -st y sin pronombre. Los verbos e → i conservan la i (Gib! Nimm! Lies!), pero los a → ä pierden la diéresis (Fahr! Schlaf!).</p>
<p><b>ihr:</b> igual que el presente, sin «ihr». <b>Sie:</b> verbo + Sie.</p>
${ej("Sprich bitte langsam!", "¡Habla despacio, por favor!")}
${ej("Ruf mich morgen an!", "¡Llámame mañana!")}
${tip("Para sonar amable añade «bitte», «doch» o «mal»: «Komm doch mal vorbei!» = ¡Pásate por aquí!")}`,
  ejercicios: `
? ___ bitte langsam! (sprechen, du) | Sprich | Sprechst, Spreche | ¡Habla despacio, por favor! | e → i se mantiene: Sprich!
? ___ mir das Buch! (geben, du) | Gib | Gebe, Gibst | ¡Dame el libro! | geben → Gib!
? ___ Sie bitte! (kommen, usted) | Kommen | Komm, Kommt | ¡Venga, por favor! | Formal: verbo + Sie.
? ___ leise, Kinder! (sein, ihr) | Seid | Sind, Sei | ¡Silencio, niños! | sein con ihr → Seid!
? ___ ruhig! (sein, du) | Sei | Bist, Seid | ¡Tranquilo! | sein con du → Sei!
? ___ nicht so schnell! (fahren, du) | Fahr | Fähr, Fährst | ¡No manejes tan rápido! | a → ä pierde la diéresis.
? ___ den Müll raus! (bringen, du) | Bring | Bringst, Bringe | ¡Saca la basura! | Raíz del verbo.
? ___ die Tür zu, bitte! (machen, ihr) | Macht | Machen, Mach | ¡Cierren la puerta, por favor! | ihr → Macht!
? ___ Sie Platz! (nehmen, usted) | Nehmen | Nimm, Nehmt | ¡Tome asiento! | Formal: Nehmen Sie.
? ___ mal! (schauen, du) | Schau | Schaust, Schaue | ¡Mira! | Raíz: Schau!
O Ruf mich morgen an! | ¡Llámame mañana! | Imperativo con separable: el prefijo va al final.
`,
};

TEMAS.praeteritum = {
  nivel: "A2", titulo: "El pasado simple de sein, haben y modales",
  html: `
<p>El <b>Präteritum</b> se usa sobre todo al escribir. Pero con <b>sein, haben</b> y los <b>modales</b> se usa también al hablar (es más corto que el Perfekt).</p>
${tabla([["", "sein", "haben", "können", "müssen", "wollen"], ["ich", "war", "hatte", "konnte", "musste", "wollte"], ["du", "warst", "hattest", "konntest", "musstest", "wolltest"], ["er / sie / es", "war", "hatte", "konnte", "musste", "wollte"], ["wir / sie / Sie", "waren", "hatten", "konnten", "mussten", "wollten"], ["ihr", "wart", "hattet", "konntet", "musstet", "wolltet"]])}
${ej("Gestern war ich krank und hatte Fieber.", "Ayer estaba enfermo y tenía fiebre.")}
${ej("Ich konnte nicht schlafen.", "No pude dormir.")}
<p>Los modales pierden la diéresis: können → konnte, müssen → musste, dürfen → durfte. Y «es gibt» → <b>es gab</b> (había).</p>
${tip("No confundas: «ich konnte» (pude) con «ich könnte» (podría). La diéresis cambia el tiempo.")}`,
  ejercicios: `
? Gestern ___ ich krank. (sein) | war | bin, wart | Ayer estuve enfermo. | ich war.
? Wir ___ keine Zeit. (haben) | hatten | haben, hattet | No teníamos tiempo. | wir hatten.
? ___ du schon in Berlin? (sein) | Warst | Wart, War | ¿Ya habías estado en Berlín? | du warst.
? Ich ___ nicht schlafen. (können) | konnte | kann, könnte | No pude dormir. | Präteritum sin diéresis: konnte.
? Er ___ früh aufstehen. (müssen) | musste | muss, müsste | Tuvo que levantarse temprano. | er musste.
? Früher ___ es hier ein Kino. (es gibt) | gab | gibt, gebt | Antes había un cine aquí. | es gibt → es gab.
? Ihr ___ sehr müde. (sein) | wart | waren, war | Ustedes estaban muy cansados. | ihr wart.
? Sie ___ Ärztin werden. (wollen, ella) | wollte | will, wolltet | Ella quería ser doctora. | sie wollte.
? Als Kind ___ ich einen Hund. (haben) | hatte | habe, hätte | De niño tenía un perro. | ich hatte.
? Wo ___ ihr am Wochenende? (sein) | wart | waren, wärt | ¿Dónde estuvieron el fin de semana? | ihr wart.
`,
};

/* ============================ B1 ============================ */
TEMAS.nebensatz = {
  nivel: "B1", titulo: "Oraciones con weil, dass, wenn, ob",
  html: `
<p>Con <b>weil</b> (porque), <b>dass</b> (que), <b>wenn</b> (cuando / si), <b>ob</b> (si, en preguntas indirectas), <b>obwohl</b> (aunque), <b>als</b> (cuando, una vez en el pasado)… el verbo conjugado se va al <b>FINAL</b>.</p>
${ej("Ich bleibe zu Hause, weil ich krank bin.", "Me quedo en casa porque estoy enfermo.")}
${ej("Ich weiß, dass du recht hast.", "Sé que tienes razón.")}
<p>Si la oración subordinada va primero, la principal empieza con el verbo (verbo, verbo):</p>
${ej("Wenn ich Zeit habe, lese ich.", "Cuando tengo tiempo, leo.")}
${tabla([["Caso", "Ejemplo"], ["con modal", "…, weil ich arbeiten <b>muss</b>."], ["con separable", "…, weil ich früh <b>aufstehe</b>."], ["en Perfekt", "…, dass er gekommen <b>ist</b>."]])}
${tip("«denn» también significa «porque», pero NO manda el verbo al final: «…, denn ich bin müde». Y «deshalb» (por eso) pone el verbo justo después: «…, deshalb gehe ich».")}`,
  ejercicios: `
O Ich bleibe zu Hause, weil ich krank bin. | Me quedo en casa porque estoy enfermo. | Con «weil», el verbo al final.
O Ich weiß, dass du recht hast. | Sé que tienes razón. | Con «dass», el verbo al final.
O Wenn ich Zeit habe, lese ich. / Ich lese, wenn ich Zeit habe. | Cuando tengo tiempo, leo. | Subordinada primero → la principal empieza con verbo.
O Ich frage, ob er morgen kommt. | Pregunto si viene mañana. | Con «ob», el verbo al final.
? Ich lerne Deutsch, weil ich in Wien ___. (arbeiten) | arbeite | arbeitet, arbeiten | Aprendo alemán porque trabajo en Viena. | Verbo conjugado al final.
? Er sagt, dass er keine Zeit ___. | hat | haben, hast | Dice que no tiene tiempo. | Verbo conjugado al final.
? Ich komme nicht, ___ ich arbeiten muss. | weil | denn, deshalb | No voy porque tengo que trabajar. | Verbo al final → weil.
? Ich komme nicht, ___ ich muss arbeiten. | denn | weil, dass | No voy, pues tengo que trabajar. | Orden normal → denn.
? ___ es regnet, bleiben wir zu Hause. | Wenn | Ob, Denn | Si llueve, nos quedamos en casa. | Condición: wenn.
? Weißt du, ___ der Laden offen ist? | ob | dass, wenn | ¿Sabes si la tienda está abierta? | Pregunta indirecta de sí/no → ob.
? Ich glaube, ___ er recht hat. | dass | ob, weil | Creo que tiene razón. | «que» → dass.
? Wenn ich Zeit habe, ___ ich ins Kino. | gehe | ich gehe, gehen | Si tengo tiempo, voy al cine. | Después de la subordinada, el verbo principal va primero.
`,
};

TEMAS.adjektiv = {
  nivel: "B1", titulo: "Terminaciones del adjetivo",
  html: `
<p>Después del verbo, el adjetivo no cambia: «Das Auto ist <b>neu</b>». Pero delante de un sustantivo lleva terminación.</p>
<p><b>Regla simple con der/die/das:</b> en nominativo singular (y en acusativo femenino y neutro) es <b>-e</b>; en todo lo demás, <b>-en</b>.</p>
${tabla([["", m("masculino"), f("femenino"), n("neutro"), pl("plural")], ["nominativo", "der neu<b>e</b> Tisch", "die neu<b>e</b> Lampe", "das neu<b>e</b> Auto", "die neu<b>en</b> Autos"], ["acusativo", "den neu<b>en</b> Tisch", "die neu<b>e</b> Lampe", "das neu<b>e</b> Auto", "die neu<b>en</b> Autos"], ["dativo", "dem neu<b>en</b> Tisch", "der neu<b>en</b> Lampe", "dem neu<b>en</b> Auto", "den neu<b>en</b> Autos"]])}
<p><b>Con ein:</b> como «ein» no dice el género, lo dice el adjetivo:</p>
${tabla([["", m("masculino"), f("femenino"), n("neutro")], ["nominativo", "ein neu<b>er</b> Tisch", "eine neu<b>e</b> Lampe", "ein neu<b>es</b> Auto"], ["acusativo", "einen neu<b>en</b> Tisch", "eine neu<b>e</b> Lampe", "ein neu<b>es</b> Auto"], ["dativo", "einem neu<b>en</b> Tisch", "einer neu<b>en</b> Lampe", "einem neu<b>en</b> Auto"]])}
<p><b>Sin artículo</b>, el adjetivo toma la letra del artículo: kalt<b>er</b> Kaffee (der), kalt<b>e</b> Milch (die), kalt<b>es</b> Wasser (das).</p>
${ej("Ich habe ein neues Auto und einen alten Hund.", "Tengo un carro nuevo y un perro viejo.")}
${tip("No memorices toda la tabla de golpe: el ejercicio repetido y espaciado hace que «suene bien» o «suene mal». Eso es aprendizaje implícito.")}`,
  ejercicios: `
? Das ist ein ___ Tisch. (neu) | neuer | neue, neues | Es una mesa nueva. | ein + masculino (nominativo) → -er.
? Ich habe ein ___ Auto. (neu) | neues | neuer, neuen | Tengo un carro nuevo. | ein + neutro → -es.
? Die ___ Lampe ist schön. (neu) | neue | neuen, neuer | La lámpara nueva es bonita. | die + nominativo singular → -e.
? Ich kaufe einen ___ Mantel. (warm) | warmen | warmer, warme | Compro un abrigo calientito. | Masculino acusativo → -en.
? Ich trinke ___ Kaffee. (heiß) | heißen | heißer, heiße | Tomo café caliente. | Sin artículo, masculino acusativo → -en.
? Das ist eine ___ Idee. (gut) | gute | guter, gutes | Es una buena idea. | eine + femenino → -e.
? Wir wohnen in einem ___ Haus. (groß) | großen | großem, großes | Vivimos en una casa grande. | Dativo → -en.
? Die ___ Kinder spielen. (klein) | kleinen | kleine, kleiner | Los niños pequeños juegan. | Plural con artículo → -en.
? ___ Wasser ist gesund. (kalt) | Kaltes | Kalte, Kalter | El agua fría es sana. | Sin artículo: das → -es.
? Ich mag den ___ Film. (alt) | alten | alte, alter | Me gusta la película vieja. | den → -en.
? Er trägt ein ___ Hemd. (weiß) | weißes | weißer, weiße | Lleva una camisa blanca. | ein + neutro → -es.
`,
};

TEMAS.konjunktiv = {
  nivel: "B1", titulo: "Deseos y cortesía: Konjunktiv II",
  html: `
<p>El <b>Konjunktiv II</b> es como el condicional y el subjuntivo del español: deseos, hipótesis y peticiones amables.</p>
${tabla([["Verbo", "Konjunktiv II", "Español"], ["sein", "ich wäre", "sería / estaría / fuera"], ["haben", "ich hätte", "tendría / tuviera"], ["können", "ich könnte", "podría"], ["müssen", "ich müsste", "tendría que"], ["sollen", "ich sollte", "debería"], ["los demás", "ich würde + infinitivo", "ich würde reisen = viajaría"]])}
${ej("Wenn ich reich wäre, würde ich die Welt bereisen.", "Si fuera rico, viajaría por el mundo.")}
${ej("Könnten Sie mir bitte helfen?", "¿Me podría ayudar, por favor?")}
${ej("Ich hätte gern einen Kaffee.", "Me gustaría un café.")}
${tip("Para dar consejos: «An deiner Stelle würde ich…» (Yo que tú…) o «Du solltest…» (Deberías…).")}`,
  ejercicios: `
? Wenn ich Zeit ___, würde ich mehr lesen. (haben) | hätte | habe, hatte | Si tuviera tiempo, leería más. | haben → hätte.
? Wenn ich reich ___, würde ich reisen. (sein) | wäre | war, bin | Si fuera rico, viajaría. | sein → wäre.
? Ich ___ gern einen Kaffee. (pedido amable) | hätte | habe, hatte | Me gustaría un café. | Ich hätte gern… = me gustaría.
? ___ Sie mir bitte helfen? (können, cortés) | Könnten | Können, Konnten | ¿Me podría ayudar, por favor? | können → könnten.
? An deiner Stelle ___ ich zum Arzt gehen. | würde | werde, wurde | Yo que tú iría al médico. | würde + infinitivo.
? Das ___ schön! (sein) | wäre | war, ist | ¡Eso sería bonito! | sein → wäre.
? Ich würde gern in Berlin ___. | leben | lebe, gelebt | Me gustaría vivir en Berlín. | würde + infinitivo al final.
? Du ___ mehr schlafen. (consejo) | solltest | sollst, solltet | Deberías dormir más. | sollen → solltest.
O Ich würde gern nach Japan reisen. | Me gustaría viajar a Japón. | würde en posición 2, infinitivo al final.
? Wenn ich du ___, würde ich das nicht machen. | wäre | bin, würde | Si yo fuera tú, no lo haría. | sein → wäre.
`,
};

TEMAS.futur = {
  nivel: "B1", titulo: "El futuro con «werden»",
  html: `
${tabla([["", "werden"], ["ich", "werde"], ["du", "wirst"], ["er / sie / es", "wird"], ["wir / sie / Sie", "werden"], ["ihr", "werdet"]])}
<p>Futuro = <b>werden</b> en posición 2 + <b>infinitivo</b> al final.</p>
${ej("Ich werde morgen mehr lernen.", "Mañana estudiaré más.")}
<p>Pero muchas veces el alemán usa el <b>presente</b> con una palabra de tiempo: «Morgen fahre ich nach Berlin». El Futur se usa sobre todo para promesas, predicciones y suposiciones:</p>
${ej("Er ist nicht da. Er wird wohl krank sein.", "No está. Seguramente está enfermo.")}
${tip("«werden» solo también significa «convertirse en / llegar a ser»: Ich werde Ärztin = Voy a ser doctora.")}`,
  ejercicios: `
? Ich ___ morgen anrufen. | werde | wird, wirst | Llamaré mañana. | ich werde.
? Es ___ bald regnen. | wird | werdet, werde | Pronto va a llover. | es wird.
? ___ du mir helfen? | Wirst | Wird, Werdest | ¿Me ayudarás? | du wirst.
? Wir werden nächstes Jahr nach Österreich ___. | fahren | fahrt, gefahren | El próximo año iremos a Austria. | Infinitivo al final.
? Ihr ___ das schaffen! | werdet | werden, wird | ¡Ustedes lo van a lograr! | ihr werdet.
? Sie ___ Ärztin. (ella) | wird | werdet, werde | Ella va a ser doctora. | werden = llegar a ser.
O Morgen werde ich mehr lernen. / Ich werde morgen mehr lernen. | Mañana estudiaré más. | werden en posición 2, infinitivo al final.
? Er ist nicht da. Er ___ wohl krank sein. | wird | werdet, würde | No está. Seguramente está enfermo. | Futur para suponer.
`,
};

TEMAS.relativ = {
  nivel: "B1", titulo: "Oraciones de relativo",
  html: `
<p>«El hombre <b>que</b> vive aquí». En alemán el «que» cambia según el género y el caso, y el verbo va al <b>final</b>.</p>
${tabla([["", m("masculino"), f("femenino"), n("neutro"), pl("plural")], ["nominativo", "der", "die", "das", "die"], ["acusativo", "<b>den</b>", "die", "das", "die"], ["dativo", "<b>dem</b>", "<b>der</b>", "<b>dem</b>", "<b>denen</b>"]])}
<p>El <b>género</b> lo da la palabra a la que se refiere; el <b>caso</b>, su función dentro de la oración de relativo.</p>
${ej("Das ist der Mann, der in Berlin wohnt.", "Ese es el hombre que vive en Berlín.")}
${ej("Das ist der Film, den ich gestern gesehen habe.", "Esa es la película que vi ayer.")}
${ej("Die Freunde, mit denen ich reise, sind lustig.", "Los amigos con los que viajo son divertidos.")}
${tip("Si hay preposición, va delante del relativo: «die Kollegin, mit der ich arbeite».")}`,
  ejercicios: `
? Das ist der Mann, ___ in Berlin wohnt. | der | den, dem | Ese es el hombre que vive en Berlín. | Sujeto masculino → der.
? Das ist die Frau, ___ ich liebe. | die | der, den | Esa es la mujer a la que amo. | Femenino acusativo → die.
? Das ist der Film, ___ ich gestern gesehen habe. | den | der, dem | Esa es la película que vi ayer. | der Film como complemento → den.
? Das ist das Kind, ___ ich helfe. | dem | das, den | Ese es el niño al que ayudo. | helfen + dativo → dem.
? Die Leute, ___ hier wohnen, sind nett. | die | denen, der | La gente que vive aquí es amable. | Plural sujeto → die.
? Das Buch, ___ auf dem Tisch liegt, ist neu. | das | der, dem | El libro que está sobre la mesa es nuevo. | Neutro sujeto → das.
? Das ist die Kollegin, mit ___ ich arbeite. | der | die, dem | Esa es la compañera con la que trabajo. | mit + dativo femenino → der.
? Die Freunde, mit ___ ich reise, sind lustig. | denen | den, die | Los amigos con los que viajo son divertidos. | Dativo plural → denen.
O Das ist der Hund, der immer bellt. | Ese es el perro que siempre ladra. | Verbo al final de la oración de relativo.
? Wie heißt das Restaurant, ___ du so magst? | das | den, dem | ¿Cómo se llama el restaurante que tanto te gusta? | Neutro acusativo → das.
`,
};

TEMAS.genitiv = {
  nivel: "B1", titulo: "El genitivo",
  html: `
<p>El <b>genitivo</b> expresa posesión («de»). Al hablar se usa mucho <b>von + dativo</b>, pero al escribir y en el B1 necesitas el genitivo.</p>
${tabla([["", m("masculino"), f("femenino"), n("neutro"), pl("plural")], ["genitivo", "<b>des</b> Mann<b>es</b>", "<b>der</b> Frau", "<b>des</b> Kind<b>es</b>", "<b>der</b> Kinder"], ["con ein", "<b>eines</b> Mann<b>es</b>", "<b>einer</b> Frau", "<b>eines</b> Kind<b>es</b>", "—"]])}
${ej("Das ist das Auto meines Vaters.", "Es el carro de mi papá.")}
<p>Con nombres propios solo se agrega <b>-s</b>, sin apóstrofo: <b>Annas</b> Auto.</p>
<p>Preposiciones con genitivo: <b>wegen</b> (a causa de), <b>trotz</b> (a pesar de), <b>während</b> (durante), <b>statt</b> (en lugar de).</p>
${ej("Wegen des Regens bleiben wir zu Hause.", "Por la lluvia nos quedamos en casa.")}`,
  ejercicios: `
? Das ist das Auto ___ Vaters. | des | der, dem | Es el carro del papá. | Masculino: des + -s.
? Das ist die Tasche ___ Frau. | der | des, die | Es la bolsa de la mujer. | Femenino: der.
? Das ist das Haus meines ___. (Bruder) | Bruders | Bruder, Brudern | Es la casa de mi hermano. | Masculino: + -s.
? ___ Auto ist rot. (de Anna) | Annas | Anna, Annes | El carro de Anna es rojo. | Nombres: -s sin apóstrofo.
? ___ des Regens bleiben wir zu Hause. | Wegen | Trotz, Während | Por la lluvia nos quedamos en casa. | wegen = a causa de.
? ___ des Regens gehen wir spazieren. | Trotz | Wegen, Statt | A pesar de la lluvia salimos a caminar. | trotz = a pesar de.
? ___ des Essens spricht er nicht. | Während | Wegen, Trotz | Durante la comida no habla. | während = durante.
? Das ist das Ende ___ Films. | des | der, dem | Es el final de la película. | der Film → des Films.
? Die Farbe ___ Autos gefällt mir. | des | der, das | Me gusta el color del carro. | Neutro: des + -s.
? Die Zimmer ___ Kinder sind groß. | der | des, den | Los cuartos de los niños son grandes. | Plural: der.
`,
};

TEMAS.konnektoren = {
  nivel: "B1", titulo: "Conectores: cómo cambian el orden",
  html: `
${tabla([["Grupo", "Conectores", "Orden"], ["Posición 0", "und, aber, oder, denn, sondern", "no cambia nada: …, aber ich <b>bin</b> müde"], ["Adverbios", "deshalb, trotzdem, dann, außerdem, sonst", "ocupan la posición 1 → el verbo justo después: …, deshalb <b>gehe</b> ich"], ["Subordinantes", "weil, obwohl, damit, als, wenn, bevor, nachdem, während", "verbo al final: …, obwohl es kalt <b>ist</b>"]])}
${ej("Ich bin müde, deshalb gehe ich ins Bett.", "Estoy cansado, por eso me voy a la cama.")}
${ej("Obwohl es kalt ist, trägt er keine Jacke.", "Aunque hace frío, no trae chamarra.")}
<p><b>um … zu</b> + infinitivo (mismo sujeto) frente a <b>damit</b> (sujetos distintos):</p>
${ej("Ich lerne Deutsch, um in Deutschland zu arbeiten.", "Aprendo alemán para trabajar en Alemania.")}
<p>Conectores dobles: <b>entweder … oder</b> (o … o), <b>sowohl … als auch</b> (tanto … como), <b>weder … noch</b> (ni … ni), <b>nicht nur … sondern auch</b>.</p>
${tip("«als» = cuando (una sola vez en el pasado); «wenn» = cuando (presente, futuro o cada vez que); «wann» = cuándo (pregunta).")}`,
  ejercicios: `
O Ich bin müde, deshalb gehe ich ins Bett. | Estoy cansado, por eso me voy a la cama. | Después de «deshalb» viene el verbo.
O Es regnet, trotzdem gehen wir spazieren. | Llueve; aun así salimos a caminar. | Después de «trotzdem» viene el verbo.
O Obwohl es kalt ist, trägt er keine Jacke. | Aunque hace frío, no trae chamarra. | obwohl: verbo al final; luego verbo + sujeto.
? Ich lerne Deutsch, ___ in Deutschland zu arbeiten. | um | damit, weil | Aprendo alemán para trabajar en Alemania. | Mismo sujeto + zu → um … zu.
? Ich spreche langsam, ___ du mich verstehst. | damit | um, weil | Hablo despacio para que me entiendas. | Sujetos distintos → damit.
? Ich trinke ___ Kaffee noch Tee. | weder | nicht, kein | No tomo ni café ni té. | weder … noch = ni … ni.
? Sie spricht nicht nur Deutsch, ___ auch Französisch. | sondern | aber, oder | No solo habla alemán, sino también francés. | nicht nur … sondern auch.
? ___ ich nach Hause kam, war es schon dunkel. | Als | Wenn, Wann | Cuando llegué a casa ya estaba oscuro. | Una vez en el pasado → als.
? Ich putze mir die Zähne, ___ ich ins Bett gehe. | bevor | nachdem, während | Me lavo los dientes antes de acostarme. | bevor = antes de que.
? Ich bin müde, ___ ich gehe nicht ins Bett. | aber | deshalb, obwohl | Estoy cansado, pero no me voy a dormir. | «aber» no cambia el orden.
? Beeil dich, ___ verpassen wir den Zug! | sonst | deshalb, aber | Apúrate, si no perdemos el tren. | sonst = si no / de lo contrario.
`,
};

TEMAS.passiv = {
  nivel: "B1", titulo: "La voz pasiva",
  html: `
<p>La pasiva pone el foco en la <b>acción</b>, no en quién la hace: <b>werden</b> + <b>participio</b>.</p>
${tabla([["Tiempo", "Forma", "Ejemplo"], ["presente", "wird + participio", "Das Haus <b>wird</b> gebaut."], ["Präteritum", "wurde + participio", "Das Haus <b>wurde</b> 1900 gebaut."], ["Perfekt", "ist + participio + worden", "Das Haus <b>ist</b> gebaut <b>worden</b>."], ["con modal", "modal + participio + werden", "Der Müll <b>muss</b> getrennt <b>werden</b>."]])}
${ej("In Deutschland wird viel Brot gegessen.", "En Alemania se come mucho pan.")}
${ej("Das Buch wurde von Goethe geschrieben.", "El libro fue escrito por Goethe.")}
<p>Quién hace la acción va con <b>von + dativo</b>. Muchas veces la pasiva alemana se traduce con «se»: Hier wird Deutsch gesprochen = Aquí se habla alemán.</p>`,
  ejercicios: `
? Das Auto ___ repariert. | wird | werden, ist | El carro está siendo reparado. | Presente pasivo: wird + participio.
? Die Häuser ___ gebaut. | werden | wird, wurde | Las casas están siendo construidas. | Plural → werden.
? Das Haus ___ 1900 gebaut. | wurde | wird, würde | La casa fue construida en 1900. | Pasado: wurde.
? In Deutschland wird viel Bier ___. (trinken) | getrunken | trinken, getrinkt | En Alemania se toma mucha cerveza. | trinken → getrunken.
? Der Müll muss ___ werden. (trennen) | getrennt | trennen, getrennen | La basura se tiene que separar. | Modal + participio + werden.
? Das Buch wurde ___ Goethe geschrieben. | von | durch, mit | El libro fue escrito por Goethe. | Quién lo hace: von + dativo.
? Hier ___ Deutsch gesprochen. | wird | werden, ist | Aquí se habla alemán. | wird + participio.
O Die E-Mail wird morgen geschickt. / Morgen wird die E-Mail geschickt. | El correo se enviará mañana. | wird en posición 2, participio al final.
? Der Brief ist gestern geschickt ___. | worden | geworden, werden | La carta fue enviada ayer. | Perfekt pasivo: ist + participio + worden.
`,
};
