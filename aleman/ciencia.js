// La ciencia detrás de Täglich: qué dice la investigación y cómo lo usa la app.
export const CIENCIA = [
  {
    emoji: "📈", titulo: "Repetición espaciada",
    idea: "Olvidamos rápido lo nuevo (la curva del olvido de Ebbinghaus), pero cada vez que repasamos justo antes de olvidarlo, el recuerdo dura más. Repasar en días separados funciona mucho mejor que estudiar todo junto.",
    app: "Cada palabra tiene su propio calendario calculado con FSRS-5, el algoritmo moderno de repetición espaciada. Estima qué tan estable es tu memoria de cada palabra y te la vuelve a mostrar cuando la probabilidad de recordarla baja al 90% (lo puedes ajustar).",
    ref: "Ebbinghaus (1885); Cepeda et al. (2006), Psychological Bulletin; Ye, Su y Cao (2022), KDD; Kang (2016), Policy Insights from the Behavioral and Brain Sciences.",
  },
  {
    emoji: "🧠", titulo: "Recuperación activa (efecto del examen)",
    idea: "Sacar un dato de tu memoria lo fortalece mucho más que volver a leerlo. Es una de las técnicas con mejor evidencia para aprender.",
    app: "Casi todo son ejercicios donde tienes que recordar: elegir, escribir, completar, ordenar y decir. Al principio de cada sesión hay un pequeño repaso de calentamiento.",
    ref: "Roediger y Karpicke (2006), Psychological Science; Karpicke y Roediger (2008), Science; Dunlosky et al. (2013), Psychological Science in the Public Interest.",
  },
  {
    emoji: "🎯", titulo: "La regla del 85%",
    idea: "Se aprende más rápido cuando aciertas más o menos el 85% de las veces: si todo es fácil no aprendes y si todo es difícil te frustras.",
    app: "La app mide en tiempo real qué tanto aciertas. Si vas arriba de 93%, te pone ejercicios más difíciles (escribir en vez de elegir, frases completas, dictado); si bajas de 72%, te da ejercicios más guiados.",
    ref: "Wilson, Shenhav, Straccia y Cohen (2019), Nature Communications.",
  },
  {
    emoji: "🔀", titulo: "Intercalado",
    idea: "Mezclar temas y tipos de ejercicio en una misma sesión cuesta un poco más, pero ayuda a distinguir y a recordar mejor que practicar un solo tipo en bloque.",
    app: "Las sesiones mezclan palabras nuevas con repasos de otras unidades, gramática y distintos tipos de ejercicio. Nunca te toca el mismo tipo dos veces seguidas.",
    ref: "Rohrer y Taylor (2007), Instructional Science; Kornell y Bjork (2008), Psychological Science.",
  },
  {
    emoji: "🏋️", titulo: "Dificultades deseables",
    idea: "Lo que cuesta un poco de esfuerzo mental (generar la respuesta en vez de reconocerla, esperar unos días para repasar) produce un aprendizaje más duradero.",
    app: "Cada palabra avanza del reconocimiento a la producción: primero la eliges, luego la escribes, después la usas en una frase, la escuchas y la dices. Cuanto mejor la recuerdas, más difícil el ejercicio.",
    ref: "Bjork (1994); Bjork y Bjork (2011); Slamecka y Graf (1978), efecto de generación.",
  },
  {
    emoji: "💡", titulo: "Equivocarse enseña (con buena retroalimentación)",
    idea: "Los errores seguidos de la respuesta correcta y una explicación se corrigen muy bien, sobre todo cuando estabas seguro. Por eso no hay «vidas» que se acaban.",
    app: "Al fallar ves la respuesta, el porqué (la regla de género, la conjugación, la explicación gramatical) y la palabra vuelve a salir unos ejercicios después. Si escribes otra palabra que existe (Butter en vez de Mutter), te dice cuál escribiste.",
    ref: "Butterfield y Metcalfe (2001), Journal of Experimental Psychology: Learning, Memory, and Cognition; Hattie y Timperley (2007), Review of Educational Research.",
  },
  {
    emoji: "📖", titulo: "Input comprensible",
    idea: "Adquirimos un idioma entendiendo mensajes un poquito por encima de nuestro nivel (i + 1).",
    app: "Las lecturas de cada unidad usan sobre todo palabras que ya aprendiste. Puedes tocar cualquier palabra para ver su significado, escuchar el texto y ver la traducción frase por frase.",
    ref: "Krashen (1982), Principles and Practice in Second Language Acquisition.",
  },
  {
    emoji: "📊", titulo: "Frecuencia primero",
    idea: "Unas pocas palabras aparecen muchísimo: con las ~1000 más frecuentes ya entiendes buena parte de un texto cotidiano.",
    app: "Las unidades empiezan con las palabras y frases más útiles y frecuentes (sein, haben, ich, nicht, gut…) y dejan lo especializado para después.",
    ref: "Nation (2006), Canadian Modern Language Review.",
  },
  {
    emoji: "🎨", titulo: "Doble codificación",
    idea: "Recordamos mejor lo que guardamos de dos formas: palabra e imagen, o palabra y sonido.",
    app: "Cada palabra tiene un emoji, audio en alemán y, si es sustantivo, un color según su género (azul der, rojo die, verde das), para que el artículo se pegue a la palabra.",
    ref: "Paivio (1986), Mental Representations: A Dual Coding Approach.",
  },
  {
    emoji: "🗣️", titulo: "Decirlo en voz alta",
    idea: "Pronunciar una palabra en voz alta hace que se recuerde mejor que leerla en silencio (efecto de producción).",
    app: "Hay ejercicios de hablar con reconocimiento de voz y todos los textos se pueden escuchar. Repetir en voz alta lo que oyes (shadowing) también cuenta.",
    ref: "MacLeod, Gopie, Hourihan, Neary y Ozubko (2010), Journal of Experimental Psychology: Learning, Memory, and Cognition.",
  },
  {
    emoji: "🌱", titulo: "Hábito pequeño y diario",
    idea: "Los hábitos se forman repitiendo una acción en el mismo contexto. Funciona mejor decidir de antemano «cuándo y dónde» lo vas a hacer (intención de implementación).",
    app: "Eliges una meta diaria pequeña y un momento fijo («después del café…»). La racha, el calendario y los avisos te ayudan a volver cada día, y los protectores de racha evitan que un mal día lo arruine todo.",
    ref: "Gollwitzer (1999), American Psychologist; Lally et al. (2010), European Journal of Social Psychology.",
  },
  {
    emoji: "😴", titulo: "Dormir consolida",
    idea: "Mientras duermes, el cerebro consolida lo que aprendiste. Estudiar un poco cada día y dormir bien vale más que maratones.",
    app: "Las palabras nuevas tienen un límite diario y la primera revisión llega al día siguiente o al otro: justo después de una noche de sueño.",
    ref: "Diekelmann y Born (2010), Nature Reviews Neuroscience.",
  },
];
