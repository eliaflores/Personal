// Vocabulario A1 (principiante). Formato de cada línea:
// TIPO alemán | español (alternativas con /) | emoji | ejemplo con la *palabra* marcada | traducción | nota
// N sustantivo (con artículo y plural) · V verbo (formas irregulares entre paréntesis) · A adjetivo · W palabra · P frase
// Las palabras van de las más frecuentes y útiles a las menos: así entiendes más alemán desde el primer día.
export const A1 = [
  {
    id: "u01", nivel: "A1", emoji: "👋", titulo: "¡Hallo!", desc: "Saludar, despedirte y presentarte.",
    gramatica: ["aussprache", "sein"], lectura: "lena",
    lecciones: `
# Saludos
P Hallo! | ¡Hola! | 👋 | *Hallo*, ich bin Anna. | Hola, soy Anna.
P Guten Morgen! | ¡Buenos días! | 🌅 | *Guten Morgen*, Herr Weber! | ¡Buenos días, señor Weber! | Se usa hasta las 10 u 11 de la mañana.
P Guten Tag! | ¡Buen día!/¡Buenas tardes! | ☀️ | *Guten Tag*, Frau Schmidt. | Buen día, señora Schmidt. | Saludo formal para casi todo el día.
P Guten Abend! | ¡Buenas noches! (al llegar) | 🌆 | *Guten Abend*, wie geht es Ihnen? | Buenas noches, ¿cómo está usted?
P Gute Nacht! | ¡Buenas noches! (al despedirte) | 🌙 | *Gute Nacht* und schlaf gut! | ¡Buenas noches y que duermas bien! | Solo para despedirte antes de dormir.
P Tschüss! | ¡Adiós!/¡Chao! | 🙋 | *Tschüss*, bis morgen! | ¡Adiós, hasta mañana! | Informal, entre amigos.
P Auf Wiedersehen! | ¡Adiós! (formal)/¡Hasta la vista! | 🤝 | *Auf Wiedersehen*, Frau Doktor. | Adiós, doctora. | Literalmente «hasta volver a vernos».
P Bis später! | ¡Hasta luego! | ⏰ | Ich gehe jetzt. *Bis später*! | Ya me voy. ¡Hasta luego!
# Cortesía
W ja | sí | ✅ | *Ja*, das ist richtig. | Sí, eso es correcto.
W nein | no | ❌ | *Nein*, danke. | No, gracias.
P Danke! | ¡Gracias! | 🙏 | *Danke* für den Kaffee! | ¡Gracias por el café!
P Bitte! | ¡Por favor!/¡De nada! | 😊 | Ein Wasser, *bitte*. | Un agua, por favor. | «Bitte» sirve para «por favor» y para «de nada».
P Danke schön! | ¡Muchas gracias! | 💐 | *Danke schön* für die Hilfe! | ¡Muchas gracias por la ayuda!
P Entschuldigung! | ¡Perdón!/¡Disculpe! | 🙇 | *Entschuldigung*, wo ist der Bahnhof? | Disculpe, ¿dónde está la estación?
P Kein Problem! | ¡No hay problema! | 👌 | „Danke!“ – „*Kein Problem*!“ | —¡Gracias! —¡No hay problema!
# ¿Qué tal?
P Wie geht's? | ¿Qué tal?/¿Cómo estás? | 🤔 | Hallo Tom, *wie geht's*? | Hola Tom, ¿qué tal? | Informal. Formal: «Wie geht es Ihnen?»
A gut | bien/bueno | 👍 | Mir geht es *gut*, danke. | Estoy bien, gracias.
A schlecht | mal/malo | 👎 | Heute geht es mir *schlecht*. | Hoy me siento mal.
W sehr | muy | 💯 | Das ist *sehr* gut! | ¡Eso está muy bien!
W auch | también | ➕ | Ich bin *auch* müde. | Yo también estoy cansado.
W und | y | 🔗 | Anna *und* Tom sind Freunde. | Anna y Tom son amigos.
W aber | pero | ↔️ | Ich bin müde, *aber* glücklich. | Estoy cansado, pero feliz.
W oder | o | 🔀 | Tee *oder* Kaffee? | ¿Té o café?
A müde | cansado | 😴 | Ich bin heute sehr *müde*. | Hoy estoy muy cansado.
# Presentarte
W ich | yo | 🙋 | *Ich* bin Lukas. | Yo soy Lukas.
W du | tú | 👉 | Bist *du* Anna? | ¿Eres Anna?
V sein (; ist gewesen) | ser/estar | 🟰 | Ich *bin* Student. | Soy estudiante. | Irregular: ich bin, du bist, er ist, wir sind, ihr seid, sie sind.
V heißen (; hat geheißen) | llamarse | 📛 | Ich *heiße* Maria. | Me llamo Maria.
N der Name, Namen | nombre | 🏷️ | Mein *Name* ist Paul. | Mi nombre es Paul.
P Freut mich! | ¡Mucho gusto! | 🤝 | „Ich bin Lea.“ – „*Freut mich*!“ | —Soy Lea. —¡Mucho gusto!
W woher | de dónde | 🌍 | *Woher* kommst du? | ¿De dónde eres?
V kommen (; ist gekommen) | venir/ser de | 🚶 | Ich *komme* aus Mexiko. | Soy de México.
W aus | de (procedencia) | 📍 | Sie kommt *aus* Spanien. | Ella es de España.
N der Herr, Herren | señor | 🎩 | Guten Tag, *Herr* Müller! | ¡Buen día, señor Müller!
N die Frau, Frauen | mujer/señora | 👩 | Die *Frau* heißt Julia. | La mujer se llama Julia. | También es «señora» (Frau Müller) y «esposa» (meine Frau).
`,
  },
  {
    id: "u02", nivel: "A1", emoji: "👨‍👩‍👧", titulo: "Familia y personas", desc: "Tu familia, tus amigos y los pronombres.",
    gramatica: ["genero"], lectura: "familie",
    lecciones: `
# La familia
N die Familie, Familien | familia | 👨‍👩‍👧 | Meine *Familie* ist groß. | Mi familia es grande.
N die Mutter, Mütter | madre/mamá | 👩 | Meine *Mutter* heißt Rosa. | Mi mamá se llama Rosa.
N der Vater, Väter | padre/papá | 👨 | Der *Vater* kocht heute. | El papá cocina hoy.
N die Eltern (Pl.) | padres | 👨‍👩 | Meine *Eltern* wohnen in Puebla. | Mis papás viven en Puebla. | Solo existe en plural.
N der Bruder, Brüder | hermano | 👦 | Mein *Bruder* ist zehn. | Mi hermano tiene diez años.
N die Schwester, Schwestern | hermana | 👧 | Meine *Schwester* lernt Deutsch. | Mi hermana aprende alemán.
N die Geschwister (Pl.) | hermanos (y hermanas) | 👫 | Hast du *Geschwister*? | ¿Tienes hermanos?
N der Sohn, Söhne | hijo | 👶 | Ihr *Sohn* ist sehr nett. | Su hijo es muy amable.
N die Tochter, Töchter | hija | 👧 | Unsere *Tochter* spielt Klavier. | Nuestra hija toca el piano.
# Personas
N der Mann, Männer | hombre/esposo | 👨 | Der *Mann* trinkt Kaffee. | El hombre toma café. | También es «esposo»: mein Mann.
N das Kind, Kinder | niño/niña | 🧒 | Das *Kind* spielt im Park. | El niño juega en el parque.
N der Junge, Jungen | chico/niño | 👦 | Der *Junge* ist acht Jahre alt. | El niño tiene ocho años.
N das Mädchen, Mädchen | chica/niña | 👧 | Das *Mädchen* liest ein Buch. | La niña lee un libro. | ¡Es neutro! Todo lo que termina en -chen es «das».
N das Baby, Babys | bebé | 👶 | Das *Baby* schläft. | El bebé duerme.
N der Freund, Freunde | amigo/novio | 🧑‍🤝‍🧑 | Mein *Freund* kommt aus Berlin. | Mi amigo es de Berlín.
N die Freundin, Freundinnen | amiga/novia | 👭 | Das ist meine *Freundin* Lisa. | Ella es mi amiga Lisa.
N der Mensch, Menschen | persona/ser humano | 🧍 | Jeder *Mensch* ist anders. | Cada persona es diferente.
N die Leute (Pl.) | gente | 👥 | Die *Leute* hier sind freundlich. | La gente de aquí es amable.
# Abuelos, tíos y primos
N die Oma, Omas | abuela | 👵 | Meine *Oma* backt Kuchen. | Mi abuela hornea pasteles.
N der Opa, Opas | abuelo | 👴 | Der *Opa* erzählt Geschichten. | El abuelo cuenta historias.
N der Onkel, Onkel | tío | 🧔 | Mein *Onkel* wohnt in Köln. | Mi tío vive en Colonia.
N die Tante, Tanten | tía | 👩‍🦰 | Die *Tante* ist sehr lustig. | La tía es muy divertida.
N der Cousin, Cousins | primo | 🧑 | Mein *Cousin* studiert Medizin. | Mi primo estudia medicina.
N die Cousine, Cousinen | prima | 👩 | Meine *Cousine* heiratet bald. | Mi prima se casa pronto.
# Pronombres y posesivos
W er | él | 👨 | *Er* heißt Jonas. | Él se llama Jonas.
W sie | ella/ellos | 👩 | *Sie* ist meine Schwester. | Ella es mi hermana. | «sie» = ella o ellos; «Sie» con mayúscula = usted.
W es | ello (neutro) | 🔹 | Das Kind? *Es* schläft. | ¿El niño? Está dormido.
W wir | nosotros | 👨‍👩‍👧 | *Wir* sind eine Familie. | Somos una familia.
W ihr | ustedes/vosotros | 👥 | Seid *ihr* Geschwister? | ¿Ustedes son hermanos?
W mein | mi | 🫵 | Das ist *mein* Vater. | Este es mi papá.
W dein | tu | 👉 | Ist das *dein* Bruder? | ¿Es tu hermano?
W das | eso/esto/este | 👆 | *Das* ist meine Mutter. | Ella es mi mamá. | «Das ist…» sirve para presentar: «Este/Esta es…».
`,
  },
  {
    id: "u03", nivel: "A1", emoji: "🔢", titulo: "Números y tiempo", desc: "Contar, los días y decir la hora.",
    gramatica: ["uhrzeit"],
    lecciones: `
# Del 0 al 10
W null | cero | 0️⃣ | Es sind *null* Grad. | Hace cero grados.
W eins | uno | 1️⃣ | Ein Kaffee kostet *eins* fünfzig. | Un café cuesta uno cincuenta.
W zwei | dos | 2️⃣ | Ich habe *zwei* Brüder. | Tengo dos hermanos.
W drei | tres | 3️⃣ | Wir sind *drei* Freunde. | Somos tres amigos.
W vier | cuatro | 4️⃣ | Das Kind ist *vier* Jahre alt. | El niño tiene cuatro años.
W fünf | cinco | 5️⃣ | Ich arbeite *fünf* Tage pro Woche. | Trabajo cinco días a la semana.
W sechs | seis | 6️⃣ | Es ist *sechs* Uhr. | Son las seis.
W sieben | siete | 7️⃣ | Die Woche hat *sieben* Tage. | La semana tiene siete días.
W acht | ocho | 8️⃣ | Der Zug kommt um *acht*. | El tren llega a las ocho.
W neun | nueve | 9️⃣ | Meine Tochter ist *neun*. | Mi hija tiene nueve.
W zehn | diez | 🔟 | Ich zähle bis *zehn*. | Cuento hasta diez.
# Números grandes
W elf | once | 🔢 | Der Film beginnt um *elf*. | La película empieza a las once.
W zwölf | doce | 🕛 | Das Jahr hat *zwölf* Monate. | El año tiene doce meses.
W zwanzig | veinte | 🔢 | Ich bin *zwanzig* Jahre alt. | Tengo veinte años.
W einundzwanzig | veintiuno | 🔢 | Er ist *einundzwanzig*. | Él tiene veintiuno. | Al revés que en español: «uno y veinte».
W dreißig | treinta | 🔢 | Der Monat hat *dreißig* Tage. | El mes tiene treinta días.
W hundert | cien | 💯 | Das kostet *hundert* Euro. | Eso cuesta cien euros.
W tausend | mil | 🔢 | *Tausend* Dank! | ¡Mil gracias!
# El tiempo
N der Tag, Tage | día | 📅 | Der *Tag* ist lang. | El día es largo.
N die Woche, Wochen | semana | 🗓️ | Die *Woche* hat sieben Tage. | La semana tiene siete días.
N der Monat, Monate | mes | 📆 | Der *Monat* ist fast vorbei. | El mes ya casi termina.
N das Jahr, Jahre | año | 🎆 | Das *Jahr* hat zwölf Monate. | El año tiene doce meses.
N die Uhr, Uhren | reloj/hora (del reloj) | ⏰ | Es ist drei *Uhr*. | Son las tres. | «Uhr» es la hora del reloj; «Stunde» es la duración.
N die Stunde, Stunden | hora (duración) | ⏳ | Der Film dauert zwei *Stunden*. | La película dura dos horas.
N die Minute, Minuten | minuto | ⏱️ | Ich komme in fünf *Minuten*. | Llego en cinco minutos.
N die Zeit, Zeiten | tiempo | ⌛ | Ich habe keine *Zeit*. | No tengo tiempo.
W heute | hoy | 📍 | *Heute* ist Montag. | Hoy es lunes.
W morgen | mañana | ➡️ | *Morgen* habe ich frei. | Mañana tengo el día libre.
W gestern | ayer | ⬅️ | *Gestern* war ich müde. | Ayer estaba cansado.
W jetzt | ahora | ⚡ | Ich habe *jetzt* Zeit. | Ahora tengo tiempo.
# Los días de la semana
N der Montag, Montage | lunes | 📅 | Am *Montag* arbeite ich. | El lunes trabajo. | Todos los días de la semana son «der».
N der Dienstag, Dienstage | martes | 📅 | Am *Dienstag* habe ich Deutschkurs. | El martes tengo clase de alemán.
N der Mittwoch, Mittwoche | miércoles | 📅 | Am *Mittwoch* gehe ich schwimmen. | El miércoles voy a nadar. | Mitt-woch = «mitad de la semana».
N der Donnerstag, Donnerstage | jueves | 📅 | Am *Donnerstag* kommt meine Oma. | El jueves viene mi abuela. | Viene de Donar (Thor), el dios del trueno.
N der Freitag, Freitage | viernes | 📅 | Am *Freitag* gehen wir tanzen. | El viernes vamos a bailar.
N der Samstag, Samstage | sábado | 📅 | Am *Samstag* schlafe ich lange. | El sábado duermo hasta tarde.
N der Sonntag, Sonntage | domingo | 📅 | Am *Sonntag* ist alles zu. | El domingo todo está cerrado. | Sonn-tag = «día del sol».
N das Wochenende, Wochenenden | fin de semana | 🎉 | Schönes *Wochenende*! | ¡Buen fin de semana!
`,
  },
  {
    id: "u04", nivel: "A1", emoji: "🍽️", titulo: "Comer y beber", desc: "Pedir, comer y decir qué te gusta.",
    gramatica: ["praesens", "haben"], lectura: "fruehstueck",
    lecciones: `
# Bebidas
N das Wasser | agua | 💧 | Ein *Wasser*, bitte. | Un agua, por favor.
N der Kaffee, Kaffees | café | ☕ | Der *Kaffee* ist heiß. | El café está caliente.
N der Tee, Tees | té | 🍵 | Ich trinke gern *Tee*. | Me gusta tomar té.
N die Milch | leche | 🥛 | Die *Milch* ist kalt. | La leche está fría.
N das Bier, Biere | cerveza | 🍺 | Ein *Bier*, bitte! | ¡Una cerveza, por favor!
N der Wein, Weine | vino | 🍷 | Der *Wein* kommt aus Italien. | El vino es de Italia.
N der Saft, Säfte | jugo | 🧃 | Ich nehme einen *Saft*. | Tomo un jugo.
V trinken (; hat getrunken) | beber/tomar | 🥤 | Wir *trinken* Wasser. | Tomamos agua.
# Comida
N das Brot, Brote | pan | 🍞 | Das *Brot* ist frisch. | El pan está fresco.
N das Brötchen, Brötchen | panecillo/bolillo | 🥐 | Zum Frühstück esse ich ein *Brötchen*. | En el desayuno me como un panecillo.
N der Käse | queso | 🧀 | Der *Käse* ist lecker. | El queso está rico.
N die Butter | mantequilla | 🧈 | Ich esse Brot mit *Butter*. | Como pan con mantequilla. | ¡No la confundas con «die Mutter» (la mamá)!
N das Ei, Eier | huevo | 🥚 | Ich esse ein *Ei*. | Me como un huevo.
N das Fleisch | carne | 🥩 | Isst du *Fleisch*? | ¿Comes carne?
N der Fisch, Fische | pescado/pez | 🐟 | Der *Fisch* ist frisch. | El pescado está fresco.
N das Gemüse | verduras | 🥦 | *Gemüse* ist gesund. | Las verduras son sanas. | En alemán es singular: das Gemüse.
N das Obst | fruta | 🍎 | Ich kaufe *Obst*. | Compro fruta.
N der Apfel, Äpfel | manzana | 🍏 | Der *Apfel* ist rot. | La manzana es roja.
N die Banane, Bananen | plátano | 🍌 | Die *Banane* ist gelb. | El plátano es amarillo.
V essen (isst; hat gegessen) | comer | 🍴 | Ich *esse* gern Pizza. | Me gusta comer pizza. | Irregular: du isst, er isst.
# En la mesa
N das Frühstück, Frühstücke | desayuno | 🍳 | Das *Frühstück* ist fertig. | El desayuno está listo.
N das Mittagessen, Mittagessen | comida (de mediodía) | 🍝 | Das *Mittagessen* ist um eins. | La comida es a la una.
N das Abendessen, Abendessen | cena | 🍽️ | Was gibt es zum *Abendessen*? | ¿Qué hay de cenar?
N der Hunger | hambre | 😋 | Ich habe *Hunger*. | Tengo hambre. | «Hunger haben» = tener hambre (igual que en español).
N der Durst | sed | 🥵 | Hast du *Durst*? | ¿Tienes sed?
N die Suppe, Suppen | sopa | 🍲 | Die *Suppe* ist heiß. | La sopa está caliente.
N der Zucker | azúcar | 🍬 | Kaffee ohne *Zucker*, bitte. | Café sin azúcar, por favor.
A lecker | rico/delicioso | 😋 | Die Suppe ist *lecker*! | ¡La sopa está deliciosa!
P es gibt | hay | 🫴 | *Es gibt* heute kein Brot. | Hoy no hay pan.
# Verbos de cocina
V kochen | cocinar | 👨‍🍳 | Ich *koche* heute Abend. | Hoy en la noche cocino.
V haben (; hat gehabt) | tener | 🤲 | Ich *habe* Hunger. | Tengo hambre. | Irregular: du hast, er hat.
V möchten (; —) | quisiera/querer (amable) | 🙏 | Ich *möchte* einen Kaffee. | Quisiera un café. | La forma amable de pedir algo.
V nehmen (nimmt; hat genommen) | tomar/agarrar | ✋ | Ich *nehme* die Suppe. | Voy a pedir la sopa. | Irregular: du nimmst, er nimmt.
V kaufen | comprar | 🛒 | Wir *kaufen* Brot. | Compramos pan.
W gern | con gusto (me gusta) | ❤️ | Ich trinke *gern* Kaffee. | Me gusta tomar café. | Verbo + gern = «me gusta hacerlo».
`,
  },
  {
    id: "u05", nivel: "A1", emoji: "🏠", titulo: "En casa", desc: "Tu casa, los muebles y decir que no.",
    gramatica: ["negacion"], lectura: "wohnung",
    lecciones: `
# La casa
N das Haus, Häuser | casa | 🏠 | Das *Haus* ist groß. | La casa es grande.
N die Wohnung, Wohnungen | departamento/piso | 🏢 | Die *Wohnung* hat drei Zimmer. | El departamento tiene tres cuartos.
N das Zimmer, Zimmer | cuarto/habitación | 🚪 | Mein *Zimmer* ist klein. | Mi cuarto es pequeño.
N die Küche, Küchen | cocina | 🍳 | Die *Küche* ist modern. | La cocina es moderna.
N das Bad, Bäder | baño | 🛁 | Das *Bad* ist neu. | El baño es nuevo.
N das Schlafzimmer, Schlafzimmer | recámara/dormitorio | 🛏️ | Das *Schlafzimmer* ist hell. | La recámara es luminosa.
N das Wohnzimmer, Wohnzimmer | sala | 🛋️ | Wir sitzen im *Wohnzimmer*. | Estamos en la sala.
N der Garten, Gärten | jardín | 🌳 | Der *Garten* ist schön. | El jardín es bonito.
V wohnen | vivir (residir) | 🏡 | Ich *wohne* in Berlin. | Vivo en Berlín. | «wohnen» = residir en un lugar; «leben» = vivir, estar vivo.
P zu Hause | en casa | 🏡 | Ich bin heute *zu Hause*. | Hoy estoy en casa.
# Los muebles
N der Tisch, Tische | mesa | 🪑 | Der *Tisch* ist aus Holz. | La mesa es de madera.
N der Stuhl, Stühle | silla | 🪑 | Der *Stuhl* ist bequem. | La silla es cómoda.
N das Bett, Betten | cama | 🛏️ | Das *Bett* ist zu klein. | La cama es demasiado chica.
N das Sofa, Sofas | sofá | 🛋️ | Das *Sofa* ist sehr bequem. | El sofá es muy cómodo.
N der Schrank, Schränke | armario/clóset | 🚪 | Der *Schrank* ist voll. | El clóset está lleno.
N die Lampe, Lampen | lámpara | 💡 | Die *Lampe* ist kaputt. | La lámpara está descompuesta.
N die Tür, Türen | puerta | 🚪 | Die *Tür* ist offen. | La puerta está abierta.
N das Fenster, Fenster | ventana | 🪟 | Das *Fenster* ist zu. | La ventana está cerrada.
N der Schlüssel, Schlüssel | llave | 🔑 | Wo ist mein *Schlüssel*? | ¿Dónde está mi llave?
# Mascotas
N das Haustier, Haustiere | mascota | 🐾 | Hast du ein *Haustier*? | ¿Tienes mascota?
N der Hund, Hunde | perro | 🐕 | Der *Hund* schläft im Garten. | El perro duerme en el jardín.
N die Katze, Katzen | gato | 🐈 | Die *Katze* liegt auf dem Sofa. | El gato está echado en el sofá. | El gato «en general» es femenino en alemán.
# Describir
A groß | grande/alto | 🐘 | Das Zimmer ist *groß*. | El cuarto es grande.
A klein | pequeño/chico | 🐭 | Die Wohnung ist *klein*. | El departamento es pequeño.
A neu | nuevo | ✨ | Das Sofa ist *neu*. | El sofá es nuevo.
A alt | viejo/antiguo | 🏚️ | Das Haus ist sehr *alt*. | La casa es muy vieja.
A schön | bonito/lindo | 🌸 | Der Garten ist *schön*. | El jardín es bonito.
A hell | luminoso/claro | ☀️ | Die Küche ist *hell*. | La cocina es luminosa.
A dunkel | oscuro | 🌑 | Das Zimmer ist *dunkel*. | El cuarto está oscuro.
A bequem | cómodo | 😌 | Das Bett ist *bequem*. | La cama es cómoda.
# Decir que no
W nicht | no (negación) | 🚫 | Das ist *nicht* gut. | Eso no está bien.
W kein | ningún/no (un) | 🙅 | Ich habe *kein* Auto. | No tengo carro. | Niega sustantivos que llevarían «ein» o ningún artículo.
W nichts | nada | 🕳️ | Ich sehe *nichts*. | No veo nada.
W hier | aquí | 📍 | Ich wohne *hier*. | Vivo aquí.
W da | ahí/allí | 👉 | Der Schlüssel ist *da*. | La llave está ahí.
`,
  },
  {
    id: "u06", nivel: "A1", emoji: "🏙️", titulo: "En la ciudad", desc: "Lugares, transporte, direcciones y preguntas.",
    gramatica: ["fragen"], lectura: "berlin",
    lecciones: `
# Lugares
N die Stadt, Städte | ciudad | 🏙️ | Die *Stadt* ist sehr groß. | La ciudad es muy grande.
N die Straße, Straßen | calle | 🛣️ | Die *Straße* ist lang. | La calle es larga.
N der Bahnhof, Bahnhöfe | estación de tren | 🚉 | Wo ist der *Bahnhof*? | ¿Dónde está la estación?
N der Supermarkt, Supermärkte | supermercado | 🛒 | Der *Supermarkt* ist um die Ecke. | El súper está a la vuelta.
N die Apotheke, Apotheken | farmacia | 💊 | Die *Apotheke* ist geschlossen. | La farmacia está cerrada.
N die Bank, Banken | banco (dinero) | 🏦 | Die *Bank* ist neben der Post. | El banco está junto al correo. | Ojo: «die Bank» también es la banca para sentarse (plural Bänke).
N das Restaurant, Restaurants | restaurante | 🍴 | Das *Restaurant* ist gut. | El restaurante es bueno.
N das Café, Cafés | cafetería | ☕ | Wir sitzen im *Café*. | Estamos en la cafetería.
N das Hotel, Hotels | hotel | 🏨 | Das *Hotel* ist teuer. | El hotel es caro.
N die Kirche, Kirchen | iglesia | ⛪ | Die *Kirche* ist sehr alt. | La iglesia es muy antigua.
N der Park, Parks | parque | 🌳 | Die Kinder spielen im *Park*. | Los niños juegan en el parque.
N das Museum, Museen | museo | 🏛️ | Das *Museum* ist am Montag zu. | El museo cierra los lunes.
N die Post | correo (oficina) | 📮 | Die *Post* ist hier links. | El correo está aquí a la izquierda.
# Transporte
N der Bus, Busse | autobús | 🚌 | Der *Bus* kommt gleich. | El autobús viene enseguida.
N der Zug, Züge | tren | 🚆 | Der *Zug* hat Verspätung. | El tren viene con retraso.
N das Auto, Autos | carro/coche | 🚗 | Das *Auto* ist rot. | El carro es rojo.
N das Fahrrad, Fahrräder | bicicleta | 🚲 | Ich fahre mit dem *Fahrrad*. | Voy en bicicleta.
N die U-Bahn, U-Bahnen | metro | 🚇 | Die *U-Bahn* ist schnell. | El metro es rápido.
N das Taxi, Taxis | taxi | 🚕 | Wir nehmen ein *Taxi*. | Tomamos un taxi.
N die Haltestelle, Haltestellen | parada | 🚏 | Die *Haltestelle* ist dort. | La parada está allá.
V gehen (; ist gegangen) | ir (a pie)/caminar | 🚶 | Ich *gehe* jetzt. | Ya me voy.
V fahren (fährt; ist gefahren) | ir (en vehículo)/manejar | 🚗 | Wir *fahren* mit dem Bus. | Vamos en autobús. | Irregular: du fährst, er fährt.
P nach Hause | a casa | 🏃 | Ich gehe *nach Hause*. | Me voy a casa. | «nach Hause» = hacia casa; «zu Hause» = en casa.
# Direcciones
W wo | dónde | 📍 | *Wo* ist die Toilette? | ¿Dónde está el baño?
W wohin | a dónde | 🧭 | *Wohin* gehst du? | ¿A dónde vas?
W links | a la izquierda | ⬅️ | Die Bank ist *links*. | El banco está a la izquierda.
W rechts | a la derecha | ➡️ | Das Hotel ist *rechts*. | El hotel está a la derecha.
W geradeaus | todo derecho | ⬆️ | Gehen Sie *geradeaus*. | Siga todo derecho.
W dort | allá/allí | 👉 | Der Bahnhof ist *dort*. | La estación está allá.
A weit | lejos | 🔭 | Ist das *weit*? | ¿Está lejos?
A nah | cerca | 📌 | Der Park ist ganz *nah*. | El parque está muy cerca.
# Preguntas
W was | qué | ❓ | *Was* ist das? | ¿Qué es eso?
W wer | quién | 🕵️ | *Wer* ist das? | ¿Quién es?
W wie | cómo | 🤔 | *Wie* heißt du? | ¿Cómo te llamas?
W wann | cuándo | 🕒 | *Wann* kommt der Zug? | ¿Cuándo llega el tren?
W warum | por qué | 🤷 | *Warum* lernst du Deutsch? | ¿Por qué aprendes alemán?
W wie viel | cuánto | 💶 | *Wie viel* kostet das? | ¿Cuánto cuesta eso?
`,
  },
  {
    id: "u07", nivel: "A1", emoji: "🔁", titulo: "Verbos de todos los días", desc: "Los verbos más usados y las palabras de frecuencia.",
    gramatica: ["vokalwechsel"],
    lecciones: `
# Verbos básicos
V machen | hacer | 🛠️ | Was *machst* du heute? | ¿Qué haces hoy?
V arbeiten | trabajar | 💼 | Ich *arbeite* in einem Büro. | Trabajo en una oficina.
V lernen | aprender/estudiar | 📚 | Wir *lernen* Deutsch. | Aprendemos alemán.
V spielen | jugar/tocar (instrumento) | 🎮 | Die Kinder *spielen* Fußball. | Los niños juegan fútbol.
V sagen | decir | 💬 | Was *sagst* du? | ¿Qué dices?
V fragen | preguntar | ❓ | Ich *frage* den Lehrer. | Le pregunto al maestro.
V antworten | responder | 🗨️ | Er *antwortet* nicht. | Él no responde.
V brauchen | necesitar | 🆘 | Ich *brauche* Hilfe. | Necesito ayuda.
# Ver, oír, hablar
V hören | oír/escuchar | 👂 | Ich *höre* Musik. | Escucho música.
V sehen (sieht; hat gesehen) | ver | 👀 | *Siehst* du das? | ¿Ves eso?
V lesen (liest; hat gelesen) | leer | 📖 | Sie *liest* ein Buch. | Ella lee un libro.
V schreiben (; hat geschrieben) | escribir | ✍️ | Ich *schreibe* eine E-Mail. | Escribo un correo.
V sprechen (spricht; hat gesprochen) | hablar | 🗣️ | *Sprichst* du Deutsch? | ¿Hablas alemán?
V verstehen (; hat verstanden) | entender | 💡 | Ich *verstehe* das nicht. | No entiendo eso.
V wissen (; hat gewusst) | saber | 🧠 | Ich *weiß* es nicht. | No lo sé. | Irregular: ich weiß, du weißt, er weiß.
V kennen (; hat gekannt) | conocer | 🤝 | *Kennst* du Maria? | ¿Conoces a Maria? | «kennen» = conocer (personas, lugares); «wissen» = saber (datos).
# Dar, encontrar, dormir
V geben (gibt; hat gegeben) | dar | 🎁 | Ich *gebe* dir das Buch. | Te doy el libro.
V finden (; hat gefunden) | encontrar/parecer | 🔍 | Ich *finde* meinen Schlüssel nicht. | No encuentro mi llave. | También es opinar: «Ich finde das gut» = Me parece bien.
V schlafen (schläft; hat geschlafen) | dormir | 😴 | Das Baby *schläft*. | El bebé duerme.
V helfen (hilft; hat geholfen) | ayudar | 🤝 | Kannst du mir *helfen*? | ¿Me puedes ayudar?
V warten | esperar | ⏳ | Ich *warte* auf den Bus. | Espero el autobús.
V bleiben (; ist geblieben) | quedarse | 🛑 | Wir *bleiben* zu Hause. | Nos quedamos en casa.
V laufen (läuft; ist gelaufen) | correr/caminar | 🏃 | Er *läuft* jeden Morgen. | Él corre cada mañana.
V leben | vivir | 🌱 | Wir *leben* in Deutschland. | Vivimos en Alemania.
# ¿Qué tan seguido?
W immer | siempre | ♾️ | Er kommt *immer* zu spät. | Siempre llega tarde.
W oft | seguido/a menudo | 🔁 | Ich koche *oft*. | Cocino seguido.
W manchmal | a veces | 🎲 | *Manchmal* trinke ich Tee. | A veces tomo té.
W nie | nunca | 🚫 | Ich rauche *nie*. | Nunca fumo.
W wieder | otra vez/de nuevo | 🔂 | Es regnet *wieder*. | Está lloviendo otra vez.
# Cantidades
W viel | mucho | 📈 | Ich arbeite *viel*. | Trabajo mucho.
W wenig | poco | 📉 | Er schläft *wenig*. | Él duerme poco.
W ein bisschen | un poco | 🤏 | Ich spreche *ein bisschen* Deutsch. | Hablo un poco de alemán.
W noch | todavía/aún | ⏳ | Ich bin *noch* müde. | Todavía estoy cansado.
W schon | ya | ✔️ | Bist du *schon* fertig? | ¿Ya terminaste?
W nur | solo/solamente | ☝️ | Ich habe *nur* fünf Euro. | Solo tengo cinco euros.
`,
  },
  {
    id: "u08", nivel: "A1", emoji: "👕", titulo: "Colores y ropa", desc: "Describir lo que llevas y cuánto cuesta.",
    gramatica: ["plural"],
    lecciones: `
# Colores
A rot | rojo | 🔴 | Die Tomate ist *rot*. | El jitomate es rojo.
A blau | azul | 🔵 | Der Himmel ist *blau*. | El cielo es azul.
A grün | verde | 🟢 | Das Gras ist *grün*. | El pasto es verde.
A gelb | amarillo | 🟡 | Die Sonne ist *gelb*. | El sol es amarillo.
A schwarz | negro | ⚫ | Die Katze ist *schwarz*. | El gato es negro.
A weiß | blanco | ⚪ | Der Schnee ist *weiß*. | La nieve es blanca.
A grau | gris | 🩶 | Der Himmel ist heute *grau*. | Hoy el cielo está gris.
A braun | café/marrón | 🟤 | Der Tisch ist *braun*. | La mesa es café.
A rosa | rosa | 🩷 | Das Kleid ist *rosa*. | El vestido es rosa.
A bunt | de colores | 🌈 | Die Blumen sind *bunt*. | Las flores son de colores.
N die Farbe, Farben | color | 🎨 | Welche *Farbe* magst du? | ¿Qué color te gusta?
# Ropa
N die Kleidung | ropa | 👚 | Die *Kleidung* ist neu. | La ropa es nueva.
N die Hose, Hosen | pantalón | 👖 | Die *Hose* ist zu lang. | El pantalón está muy largo. | En alemán es singular: die Hose.
N das Hemd, Hemden | camisa | 👔 | Das *Hemd* ist weiß. | La camisa es blanca.
N das T-Shirt, T-Shirts | playera/camiseta | 👕 | Ich trage ein *T-Shirt*. | Traigo puesta una playera.
N das Kleid, Kleider | vestido | 👗 | Das *Kleid* ist sehr schön. | El vestido es muy bonito.
N der Rock, Röcke | falda | 🩱 | Der *Rock* ist kurz. | La falda es corta.
N der Schuh, Schuhe | zapato | 👞 | Der *Schuh* ist zu klein. | El zapato es muy chico.
N die Jacke, Jacken | chamarra/chaqueta | 🧥 | Nimm eine *Jacke* mit! | ¡Llévate una chamarra!
N der Mantel, Mäntel | abrigo | 🧥 | Der *Mantel* ist warm. | El abrigo es calientito.
N die Mütze, Mützen | gorro | 🧢 | Im Winter trage ich eine *Mütze*. | En invierno uso gorro.
N die Tasche, Taschen | bolsa/bolso | 👜 | Die *Tasche* ist schwer. | La bolsa pesa.
N die Brille, Brillen | lentes/gafas | 👓 | Wo ist meine *Brille*? | ¿Dónde están mis lentes? | Singular en alemán: die Brille.
# ¿Cuánto cuesta?
V tragen (trägt; hat getragen) | llevar puesto/cargar | 🎒 | Sie *trägt* ein rotes Kleid. | Ella lleva un vestido rojo.
V kosten | costar | 💶 | Was *kostet* die Jacke? | ¿Cuánto cuesta la chamarra?
V gefallen (gefällt; hat gefallen) | gustar | 😍 | Das Kleid *gefällt* mir. | Me gusta el vestido. | Igual que «gustar»: lo que gusta es el sujeto.
A teuer | caro | 💸 | Die Schuhe sind zu *teuer*. | Los zapatos son demasiado caros.
A billig | barato | 🏷️ | Das T-Shirt ist *billig*. | La playera es barata.
A kurz | corto | ✂️ | Der Rock ist *kurz*. | La falda es corta.
A lang | largo | 📏 | Der Mantel ist *lang*. | El abrigo es largo.
W zu | demasiado | ⚠️ | Das ist *zu* teuer. | Eso es demasiado caro. | «zu» también es la preposición «a/hacia»: zu mir.
`,
  },
  {
    id: "u09", nivel: "A1", emoji: "⚽", titulo: "Tiempo libre", desc: "Hobbies, gustos y el acusativo.",
    gramatica: ["akkusativ"], lectura: "wochenende",
    lecciones: `
# Hobbies
N die Musik | música | 🎵 | Ich höre gern *Musik*. | Me gusta escuchar música.
N der Film, Filme | película | 🎬 | Der *Film* ist spannend. | La película es emocionante.
N das Buch, Bücher | libro | 📕 | Das *Buch* ist interessant. | El libro es interesante.
N der Sport | deporte | 🏅 | Ich mache gern *Sport*. | Me gusta hacer deporte.
N der Fußball, Fußbälle | fútbol/balón | ⚽ | Wir spielen *Fußball*. | Jugamos fútbol.
N das Spiel, Spiele | juego/partido | 🎲 | Das *Spiel* beginnt um acht. | El partido empieza a las ocho.
N das Hobby, Hobbys | pasatiempo | 🎨 | Mein *Hobby* ist Kochen. | Mi pasatiempo es cocinar.
N die Freizeit | tiempo libre | 🏖️ | In meiner *Freizeit* lese ich. | En mi tiempo libre leo.
# Actividades
V schwimmen (; ist geschwommen) | nadar | 🏊 | Im Sommer *schwimme* ich viel. | En verano nado mucho.
V tanzen | bailar | 💃 | Wir *tanzen* Salsa. | Bailamos salsa.
V singen (; hat gesungen) | cantar | 🎤 | Sie *singt* sehr schön. | Ella canta muy bonito.
V reisen (; ist gereist) | viajar | ✈️ | Ich *reise* gern. | Me gusta viajar.
V treffen (trifft; hat getroffen) | ver a alguien/quedar | 🤝 | Ich *treffe* meine Freunde. | Veo a mis amigos.
V malen | pintar | 🖌️ | Das Kind *malt* ein Bild. | El niño pinta un dibujo.
V fotografieren | tomar fotos | 📷 | Er *fotografiert* gern. | Le gusta tomar fotos.
V wandern (; ist gewandert) | hacer senderismo | 🥾 | Am Wochenende *wandern* wir. | El fin de semana hacemos senderismo.
# Gustos
V mögen (; —) | gustar (algo) | 💖 | Ich *mag* Schokolade. | Me gusta el chocolate. | Irregular: ich mag, du magst, er mag.
W lieber | prefiero/mejor | 👍 | Ich trinke *lieber* Tee. | Prefiero tomar té. | Comparativo de «gern».
W am liebsten | lo que más me gusta | 🥇 | *Am liebsten* esse ich Pizza. | Lo que más me gusta comer es pizza.
A interessant | interesante | 🤓 | Das Buch ist *interessant*. | El libro es interesante.
A langweilig | aburrido | 🥱 | Der Film ist *langweilig*. | La película es aburrida.
A lustig | divertido/chistoso | 😂 | Mein Onkel ist sehr *lustig*. | Mi tío es muy chistoso.
A toll | genial | 🤩 | Das ist *toll*! | ¡Qué padre!
P Lust haben | tener ganas | 😃 | Hast du *Lust* auf Kino? | ¿Tienes ganas de ir al cine?
# ¿Con quién?
W mit | con | ➕ | Ich gehe *mit* meiner Schwester. | Voy con mi hermana.
W ohne | sin | ➖ | Kaffee *ohne* Milch, bitte. | Café sin leche, por favor.
W für | para/por | 🎁 | Das Geschenk ist *für* dich. | El regalo es para ti.
W mich | me/a mí | 🙋 | Er liebt *mich*. | Él me ama.
W dich | te/a ti | 👉 | Ich sehe *dich*. | Te veo.
W zusammen | juntos | 👫 | Wir kochen *zusammen*. | Cocinamos juntos.
`,
  },
  {
    id: "u10", nivel: "A1", emoji: "☀️", titulo: "Mi día", desc: "Tu rutina, los verbos separables y los posesivos.",
    gramatica: ["trennbar", "possessiv"], lectura: "alltag",
    lecciones: `
# Partes del día
N der Morgen, Morgen | mañana (parte del día) | 🌅 | Am *Morgen* trinke ich Kaffee. | En la mañana tomo café.
N der Mittag, Mittage | mediodía | 🕛 | Zu *Mittag* esse ich Suppe. | Al mediodía como sopa.
N der Nachmittag, Nachmittage | tarde | 🌤️ | Am *Nachmittag* gehe ich spazieren. | En la tarde salgo a caminar.
N der Abend, Abende | noche (temprano) | 🌆 | Am *Abend* lese ich. | En la noche leo.
N die Nacht, Nächte | noche | 🌙 | Die *Nacht* ist kalt. | La noche está fría.
A früh | temprano | 🐓 | Ich bin *früh* wach. | Me despierto temprano.
A spät | tarde | 🌃 | Es ist schon *spät*. | Ya es tarde.
W dann | luego/entonces | ➡️ | Ich dusche, *dann* frühstücke ich. | Me baño y luego desayuno.
# Mi rutina
V auf·stehen (; ist aufgestanden) | levantarse | ⏰ | Ich *stehe* um sieben Uhr auf. | Me levanto a las siete.
V frühstücken | desayunar | 🥐 | Wir *frühstücken* zusammen. | Desayunamos juntos.
V duschen | bañarse (en regadera) | 🚿 | Ich *dusche* am Morgen. | Me baño en la mañana.
V ein·kaufen | hacer las compras | 🛍️ | Am Samstag *kaufe* ich ein. | El sábado hago las compras.
V an·rufen (; hat angerufen) | llamar (por teléfono) | 📞 | Ich *rufe* meine Mutter an. | Le llamo a mi mamá.
V fern·sehen (sieht; hat ferngesehen) | ver la tele | 📺 | Am Abend *sehe* ich fern. | En la noche veo la tele.
V an·fangen (fängt; hat angefangen) | empezar | 🏁 | Der Kurs *fängt* um neun an. | El curso empieza a las nueve.
V auf·räumen | ordenar/recoger | 🧹 | Ich *räume* mein Zimmer auf. | Ordeno mi cuarto.
V mit·kommen (; ist mitgekommen) | venir (con alguien) | 👯 | *Kommst* du mit? | ¿Vienes conmigo?
V zurück·kommen (; ist zurückgekommen) | regresar | 🔙 | Ich *komme* um sechs zurück. | Regreso a las seis.
# Trabajo y descanso
N die Arbeit, Arbeiten | trabajo | 💼 | Die *Arbeit* beginnt um acht. | El trabajo empieza a las ocho.
N die Schule, Schulen | escuela | 🏫 | Die Kinder gehen in die *Schule*. | Los niños van a la escuela.
N die Pause, Pausen | descanso/pausa | ☕ | Wir machen eine *Pause*. | Hacemos una pausa.
V beginnen (; hat begonnen) | comenzar | ▶️ | Der Film *beginnt* um acht. | La película comienza a las ocho.
V enden | terminar | ⏹️ | Der Kurs *endet* um zwölf. | El curso termina a las doce.
A fertig | listo/terminado | ✅ | Ich bin *fertig*! | ¡Ya terminé!
A frei | libre | 🕊️ | Am Sonntag habe ich *frei*. | El domingo tengo libre.
# Posesivos
W sein | su (de él) | 👨 | Das ist *sein* Auto. | Ese es su carro (de él).
W unser | nuestro | 👨‍👩‍👧 | Das ist *unser* Haus. | Esta es nuestra casa.
W euer | su (de ustedes)/vuestro | 👥 | Ist das *euer* Hund? | ¿Es su perro (de ustedes)?
`,
  },
];
