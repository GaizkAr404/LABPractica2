const fs = require('fs');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Footer, PageNumber,
  TableOfContents, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ImageRun,
  PageBreak, LevelFormat, VerticalAlign, NumberFormat, HeightRule } = D;

const FONT = 'Times New Roman';
const P = (text, o = {}) => new Paragraph({ ...o, children: runs(text) });
// **negrita** e *cursiva* sencillas
function runs(t) {
  const out = []; const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g; let i = 0, m;
  while ((m = re.exec(t))) {
    if (m.index > i) out.push(new TextRun(t.slice(i, m.index)));
    const s = m[0];
    if (s.startsWith('**')) out.push(new TextRun({ text: s.slice(2, -2), bold: true }));
    else if (s.startsWith('`')) out.push(new TextRun({ text: s.slice(1, -1), font: 'Consolas', size: 21 }));
    else out.push(new TextRun({ text: s.slice(1, -1), italics: true }));
    i = m.index + s.length;
  }
  if (i < t.length) out.push(new TextRun(t.slice(i)));
  return out;
}
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const B = t => new Paragraph({ numbering: { reference: 'bul', level: 0 }, children: runs(t) });
const N = t => new Paragraph({ numbering: { reference: 'num', level: 0 }, children: runs(t) });
const brk = () => new Paragraph({ children: [new PageBreak()] });

// Pie de figura/tabla APA 7: número en negrita y título en cursiva, encima del elemento
let fig = 0, tab = 0;
function caption(kind, title) {
  const n = kind === 'Figura' ? ++fig : ++tab;
  return [
    new Paragraph({ keepNext: true, spacing: { before: 240, after: 0 }, children: [new TextRun({ text: `${kind} ${n}`, bold: true })] }),
    new Paragraph({ keepNext: true, spacing: { after: 120 }, children: [new TextRun({ text: title, italics: true })] }),
  ];
}
const note = t => new Paragraph({ spacing: { before: 80, after: 240 }, children: [new TextRun({ text: 'Nota. ', italics: true, size: 20 }), ...runs(t).map(r => r)], style: 'nota' });

const thin = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const borders = { top: thin, bottom: thin, left: thin, right: thin };
function table(header, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (t, head) => new TableCell({
    width: { size: widths[0], type: WidthType.DXA }, borders,
    shading: head ? { type: ShadingType.CLEAR, fill: 'DCE6F1', color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ spacing: { after: 0, line: 260 }, children: runs(t).map(r => r) , style: head ? 'tablaHead' : 'tabla'})],
  });
  const mk = (r, head) => new TableRow({ tableHeader: head, cantSplit: true, children: r.map((t, i) => {
    const c = cell(t, head); c.options = undefined; return new TableCell({
      width: { size: widths[i], type: WidthType.DXA }, borders,
      shading: head ? { type: ShadingType.CLEAR, fill: 'DCE6F1', color: 'auto' } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({ style: head ? 'tablaHead' : 'tabla', children: runs(t) })] }); }) });
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    rows: [mk(header, true), ...rows.map(r => mk(r, false))] });
}

// Marco reservado para una captura de pantalla
function shot(title, what) {
  const W = 3400;
  return [...caption('Figura', title), new Table({
    alignment: AlignmentType.CENTER, width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ height: { value: 5600, rule: HeightRule.EXACT }, children: [new TableCell({
      width: { size: W, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
      borders: Object.fromEntries(['top','bottom','left','right'].map(k => [k, { style: BorderStyle.DASHED, size: 8, color: '7F7F7F' }])),
      shading: { type: ShadingType.CLEAR, fill: 'F2F2F2', color: 'auto' },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 260 }, children: [
        new TextRun({ text: '[Insertar captura]', bold: true, color: '7F7F7F', size: 20 }), new TextRun({ text: what, break: 1, color: '7F7F7F', size: 18 })] })] })] })] })];
}

const content = [];
const add = (...x) => content.push(...x.flat());

// ---------- c. Descripción ----------
add(H1('1. Descripción de la aplicación'),
P('**GeoQuiz** es una aplicación para Android, desarrollada en Java, que plantea al usuario un juego de preguntas y respuestas sobre geografía: capitales, ríos, montañas, océanos y banderas de distintos países. Su objetivo es que el jugador ponga a prueba y mejore sus conocimientos de forma entretenida, obteniendo una puntuación al final de cada partida y pudiendo compararla con sus partidas anteriores.'),
P('Cada partida está formada por un número configurable de preguntas (cinco por defecto, con un mínimo de tres) que se eligen al azar entre las doce almacenadas en la base de datos. Cada acierto suma 3 puntos y cada fallo resta 2; cuando el jugador falla, la aplicación le muestra la respuesta correcta y le permite continuar o volver a empezar. Para practicar el uso de distintos controles de la interfaz, las cuatro opciones de cada pregunta se presentan de una de cuatro formas diferentes: botones de opción (`RadioButton`), lista desplegable (`Spinner`), lista de selección única (`ListView`) o una cuadrícula de cuatro imágenes de banderas.'),
P('Además del juego, la aplicación incluye las siguientes funcionalidades:'),
B('**Persistencia en SQLite:** las preguntas y el historial de partidas se guardan en una base de datos local (Android Developers, s.f.-b).'),
B('**Historial y récord:** se registran la fecha, los aciertos y la puntuación de cada partida, y se avisa al jugador cuando supera su mejor marca.'),
B('**Ajustes:** el jugador puede activar o desactivar los efectos de sonido y elegir cuántas preguntas tiene cada partida; estas preferencias se guardan con `SharedPreferences` (Android Developers, s.f.-d).'),
B('**Efectos de sonido:** sonidos breves al acertar y fallar, y una fanfarria al terminar la partida.'),
B('**Manual de usuario:** una pantalla de ayuda que explica las reglas del juego.'),
B('**Diseño Material 3** con barra superior propia, modo oscuro y visualización de borde a borde (Google, s.f.; Android Developers, s.f.-h).'),
P('La aplicación está dirigida a dispositivos con Android 7.0 (API 24) o superior y se ha compilado contra la API 37. Toda la interfaz está en español y los textos se definen como recursos en `strings.xml`, lo que facilitaría su traducción a otros idiomas.'));

// ---------- d. Pantallas ----------
add(H1('2. Pantallas de la aplicación y relación entre ellas'),
P('La aplicación consta de cinco pantallas, cada una implementada como una *Activity* de Android (Android Developers, s.f.-g). La Tabla 1 resume cada una de ellas y la Figura 1 muestra cómo se navega entre ellas.'),
...caption('Tabla', 'Pantallas de GeoQuiz y Activity que las implementa'),
table(['Pantalla', 'Activity', 'Función'], [
  ['Juego', 'MainActivity', 'Pantalla principal y de inicio. Muestra las preguntas, recoge la respuesta y lleva la puntuación.'],
  ['Resultado', 'ResultActivity', 'Muestra la puntuación final, los aciertos, un mensaje según el resultado y el aviso de récord.'],
  ['Historial', 'HistoryActivity', 'Lista las partidas guardadas, el número de partidas jugadas y la mejor puntuación. Permite borrar el historial.'],
  ['Ajustes', 'SettingsActivity', 'Permite activar o desactivar el sonido y elegir el número de preguntas por partida.'],
  ['Cómo jugar', 'HelpActivity', 'Manual de usuario con las reglas del juego.'],
], [1700, 2100, 5226]),
note('Elaboración propia a partir de `AndroidManifest.xml`.'),
...caption('Figura', 'Diagrama de navegación entre las pantallas de GeoQuiz'),
new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240, lineRule: 'auto', after: 0 }, children: [new ImageRun({ type: 'png', data: fs.readFileSync('diagrama_navegacion.png'), transformation: { width: 600, height: 333 } })] }),
note('Las transiciones se realizan mediante *Intents* explícitos (Android Developers, s.f.-f). Elaboración propia.'),
P('La pantalla de juego es el punto de entrada de la aplicación (es la única Activity con el filtro `LAUNCHER`). Desde su barra superior se accede al historial (icono de reloj), a la ayuda (icono de interrogación) y, desde el menú desplegable, a los ajustes. Estas tres pantallas muestran la flecha de retroceso (*Up*), que vuelve a la partida en curso sin perderla. Al responder la última pregunta, la partida se guarda y se abre la pantalla de resultado; la pantalla de juego se cierra con `finish()`, de modo que el botón Atrás no devuelve a una partida ya terminada. Desde el resultado se puede jugar de nuevo o consultar el historial.'),

H2('2.1. Pantalla de juego'),
P('Es la pantalla principal (Figuras 2 a 5). En la parte superior muestra el progreso (por ejemplo, «Pregunta 1 de 5»), la puntuación acumulada y una barra de progreso. Debajo aparece el enunciado de la pregunta, una imagen opcional (la bandera, en las preguntas del tipo «¿De qué país es esta bandera?») y las cuatro opciones. En la parte inferior están los botones **Reiniciar**, que empieza una partida nueva con otras preguntas, y **Responder**, que comprueba la opción elegida.'),
P('Según el tipo de pregunta, la aplicación muestra solo uno de los cuatro controles de respuesta y oculta los demás, como se resume en la Tabla 2.'),
...caption('Tabla', 'Controles de la interfaz usados para mostrar las opciones de respuesta'),
table(['Tipo (AnswerType)', 'Control', 'Ejemplo de pregunta'], [
  ['RADIO', 'RadioGroup con cuatro RadioButton', '¿Cuál es la capital de Australia?'],
  ['SPINNER', 'Spinner (desplegable) con una primera entrada de ayuda', '¿Cuál es el océano más grande del mundo?'],
  ['LIST', 'ListView de selección única', '¿Cuál es el río más largo de Europa?'],
  ['IMAGES', 'GridLayout con cuatro MaterialCardView seleccionables', '¿Cuál de estas es la bandera de Italia?'],
], [2000, 3626, 3400]),
note('Elaboración propia.'),
...shot('Pantalla de juego con una pregunta de botones de opción', 'Pregunta de tipo RADIO'),
...shot('Pantalla de juego con una pregunta de lista desplegable e imagen', 'Pregunta de bandera con Spinner'),
...shot('Pantalla de juego con una pregunta de lista de selección', 'Pregunta de tipo LIST'),
...shot('Pantalla de juego con una pregunta de opciones en imagen', 'Cuadrícula de cuatro banderas'),
P('Si el jugador pulsa **Responder** sin haber elegido una opción, aparece un aviso (*Toast*) pidiéndole que seleccione una respuesta. Si acierta, suena un efecto de acierto, se muestra un *Snackbar* con el texto «¡Correcto! +3 puntos» y se pasa a la siguiente pregunta. Si falla, suena el efecto de error y aparece el diálogo de la Figura 6, que indica la respuesta correcta y ofrece dos opciones: **Continuar** con la siguiente pregunta o **Empezar de nuevo**. El diálogo no se puede cerrar tocando fuera de él, para obligar al jugador a decidir.'),
...shot('Diálogo de respuesta incorrecta', 'Diálogo «Respuesta incorrecta»'),

H2('2.2. Pantalla de resultado'),
P('Se muestra al terminar la partida (Figura 7). Presenta la puntuación final en grande, el número de aciertos sobre el total y un mensaje que depende del resultado: «¡Perfecto!» si se han acertado todas, «¡Buen trabajo!» si se ha acertado al menos la mitad y «Sigue practicando» en otro caso. Si la puntuación supera la mejor partida anterior, aparece además el distintivo «¡Nuevo récord!». Al abrirse suena una fanfarria (si el sonido está activado). Los botones **Jugar de nuevo** y **Ver historial** llevan, respectivamente, a una nueva partida y al historial.'),
...shot('Pantalla de resultado con aviso de nuevo récord', 'Pantalla «Resultado»'),

H2('2.3. Pantalla de historial'),
P('Muestra un resumen con el número de partidas jugadas y la mejor puntuación, y debajo una lista con todas las partidas ordenadas de la más reciente a la más antigua, indicando la fecha y hora, los aciertos y los puntos (Figura 8). Si todavía no se ha jugado ninguna partida, se muestra un mensaje en lugar de la lista vacía. El icono de papelera de la barra superior permite borrar el historial tras confirmarlo en un diálogo; este icono se oculta cuando el historial está vacío.'),
...shot('Pantalla de historial de partidas', 'Pantalla «Historial»'),

H2('2.4. Pantalla de ajustes'),
P('Contiene un interruptor (`MaterialSwitch`) para activar o desactivar los efectos de sonido y un deslizador (`Slider`) para elegir el número de preguntas por partida, entre tres y el total de preguntas disponibles (Figura 9). Los cambios se guardan en el momento, sin necesidad de pulsar ningún botón, y el número de preguntas se aplica a partir de la siguiente partida.'),
...shot('Pantalla de ajustes', 'Pantalla «Ajustes»'),

H2('2.5. Pantalla de ayuda'),
P('Es el manual de usuario de la aplicación (Figura 10). Explica en apartados el objetivo del juego, cómo responder a cada tipo de pregunta, el sistema de puntuación, el funcionamiento del historial y las opciones de los ajustes.'),
...shot('Pantalla de ayuda «Cómo jugar»', 'Pantalla «Cómo jugar»'));

// ---------- e. Clases ----------
add(H1('3. Principales clases utilizadas'),
P('El código está organizado en el paquete `com.urjc.practica2`. La Tabla 3 resume las clases propias del proyecto y, a continuación, se describen con más detalle las más importantes.'),
...caption('Tabla', 'Clases propias de GeoQuiz'),
table(['Clase', 'Tipo', 'Responsabilidad'], [
  ['BaseActivity', 'Activity abstracta', 'Configuración común de todas las pantallas: barra superior con logotipo, diseño de borde a borde y navegación Up.'],
  ['MainActivity', 'Activity', 'Lógica de la partida: orden aleatorio, mostrar preguntas, comprobar respuestas y puntuación.'],
  ['ResultActivity', 'Activity', 'Muestra el resultado final y reproduce la fanfarria.'],
  ['HistoryActivity', 'Activity', 'Muestra el historial con un adaptador propio (ScoreAdapter).'],
  ['SettingsActivity', 'Activity', 'Edición de los ajustes del juego.'],
  ['HelpActivity', 'Activity', 'Muestra el manual de usuario.'],
  ['QuizDatabaseHelper', 'SQLiteOpenHelper', 'Crea la base de datos, carga las preguntas iniciales y gestiona el historial.'],
  ['Question', 'Modelo', 'Representa una pregunta con cuatro opciones y su respuesta correcta.'],
  ['ScoreEntry', 'Modelo', 'Representa una partida guardada en el historial.'],
  ['QuestionImages', 'Utilidad', 'Traduce las claves de imagen guardadas en la base de datos a recursos drawable.'],
  ['GameSettings', 'Utilidad', 'Lee y guarda los ajustes en SharedPreferences.'],
  ['SoundEffects', 'Utilidad', 'Carga y reproduce los efectos de acierto y fallo con SoundPool.'],
], [2300, 1900, 4826]),
note('Elaboración propia.'),

H2('3.1. BaseActivity'),
P('Clase abstracta que hereda de `AppCompatActivity` y de la que heredan las cinco pantallas. Su método `setUpScreen()` carga el *layout*, activa el modo de borde a borde (*edge-to-edge*), configura la `MaterialToolbar` como barra de acciones con el icono de la aplicación y ajusta los márgenes según las barras del sistema (*window insets*). También sobrescribe `onSupportNavigateUp()` para que la flecha *Up* se comporte como el botón Atrás. Así se evita repetir el mismo código en cada pantalla.'),
H2('3.2. MainActivity'),
P('Contiene la lógica del juego. Al empezar una partida baraja los índices de todas las preguntas con `Collections.shuffle()` y se queda con tantas como indiquen los ajustes. El método `showQuestion()` actualiza el progreso y la puntuación, muestra la imagen si la hay y hace visible solo el control correspondiente al tipo de pregunta; `getSelectedIndex()` obtiene la opción elegida en cualquiera de los cuatro controles, y `checkAnswer()` aplica la puntuación (+3 o −2). Al terminar, guarda la partida en la base de datos y abre `ResultActivity` pasándole los datos mediante *extras* del `Intent`. Además, guarda su estado en `onSaveInstanceState()` para que la partida no se pierda al girar el dispositivo (Android Developers, s.f.-e).'),
H2('3.3. QuizDatabaseHelper'),
P('Extiende `SQLiteOpenHelper` y gestiona la base de datos `geoquiz.db` (Android Developers, s.f.-b). Sigue el patrón *Singleton* (`getInstance()`), guardando el contexto de la aplicación para no retener ninguna Activity en memoria. En `onCreate()` crea las dos tablas de la Tabla 4 e inserta las doce preguntas a partir de los recursos de `strings.xml`. Ofrece métodos para obtener todas las preguntas, contar cuántas hay, insertar una partida, listar el historial, obtener la mejor puntuación (`SELECT MAX(score)`) y borrar el historial. Las consultas usan *try-with-resources* para cerrar siempre los cursores.'),
...caption('Tabla', 'Esquema de la base de datos geoquiz.db'),
table(['Tabla', 'Columnas', 'Contenido'], [
  ['questions', '_id, text, image, option_0…option_3, option_image_0…option_image_3, correct_index, answer_type', 'Las doce preguntas del juego. Las imágenes se guardan como claves de texto (por ejemplo, flag_japan).'],
  ['scores', '_id, played_at, score, correct_count, total', 'Una fila por partida terminada; played_at es la fecha en milisegundos.'],
], [1500, 4200, 3326]),
note('Elaboración propia a partir de `QuizDatabaseHelper.java`.'),
H2('3.4. Question y ScoreEntry'),
P('Son las clases de modelo. `Question` es inmutable y se crea mediante tres métodos de fábrica según su forma: `textQuestion()` (texto con opciones de texto), `imageQuestion()` (pregunta sobre una imagen) e `imageOptionsQuestion()` (opciones en imagen). El constructor valida que el índice de la respuesta correcta esté dentro del rango, y el *enum* `AnswerType` indica con qué control se muestran las opciones. `ScoreEntry` agrupa los datos de una partida: fecha, puntuación, aciertos y total de preguntas.'),
H2('3.5. GameSettings, SoundEffects y QuestionImages'),
P('`GameSettings` encapsula el acceso a `SharedPreferences` para los dos ajustes del juego e incluye el método estático `clampQuestionCount()`, que ajusta el número de preguntas pedido a las disponibles. `SoundEffects` precarga los sonidos de acierto y fallo en un `SoundPool`, que permite reproducir sonidos cortos sin retardo (Android Developers, s.f.-i), y solo los reproduce si el sonido está activado; la fanfarria final, más larga, se reproduce en `ResultActivity` con `MediaPlayer` (Android Developers, s.f.-c). Por último, `QuestionImages` asocia cada clave de imagen con su recurso `R.drawable`.'),
H2('3.6. Clases del SDK y de Material Components'),
P('Además de las clases propias, el proyecto se apoya en clases de Android y de la biblioteca Material Components (Material Components for Android, s.f.): `Intent` para la navegación, `ArrayAdapter` para el `Spinner` y las listas, `MaterialAlertDialogBuilder` para los diálogos, `Snackbar` y `Toast` para los avisos, `LinearProgressIndicator`, `MaterialCardView`, `MaterialSwitch` y `Slider` para los controles, y `MaterialToolbar` como barra superior (Android Developers, s.f.-a).'),
H2('3.7. Pruebas unitarias'),
P('El proyecto incluye pruebas unitarias con JUnit 4 (JUnit, s.f.) para las clases que no dependen de Android: `QuestionTest` comprueba la validación de los índices y los tipos de pregunta, `GameSettingsTest` comprueba los límites de `clampQuestionCount()` y `QuestionImagesTest` comprueba la traducción de claves de imagen.'));

// ---------- f. Dificultades ----------
const dif = (t, prob, sol) => [H2(t), P('**Problema.** ' + prob), P('**Solución.** ' + sol)];
add(H1('4. Dificultades encontradas y su solución'),
...dif('4.1. Pérdida de la partida al girar el dispositivo',
 'Al rotar la pantalla, Android destruye y vuelve a crear la Activity, por lo que se perdían la pregunta actual, la puntuación y el orden de las preguntas. Si el giro ocurría con el diálogo de fallo abierto, este también desaparecía.',
 'Se guarda el estado de la partida en `onSaveInstanceState()` (orden de preguntas, índice actual, puntuación, aciertos, imagen seleccionada y si se estaba esperando la decisión del diálogo) y se restaura en `onCreate()`, volviendo a mostrar el diálogo si hacía falta (Android Developers, s.f.-e). Del mismo modo, en `ResultActivity` la fanfarria solo suena cuando `savedInstanceState` es nulo, para que no se repita al girar.'),
...dif('4.2. Guardar imágenes en la base de datos',
 'Las preguntas de banderas necesitan referenciar imágenes, pero los identificadores `R.drawable.*` son números generados en la compilación y pueden cambiar entre versiones, de modo que guardarlos en la base de datos podía hacer que se mostrara una imagen equivocada.',
 'Se guardan claves de texto estables (por ejemplo, `flag_italy`) y la clase `QuestionImages` las traduce al recurso correspondiente al leer las preguntas. Una clave desconocida devuelve 0 en lugar de provocar un error.'),
...dif('4.3. Cuatro controles distintos para una misma pregunta',
 'Cada control obtiene la opción elegida de una forma distinta y el `Spinner` siempre tiene un elemento seleccionado, por lo que no se podía saber si el usuario había elegido realmente una respuesta.',
 'Se añadió una primera entrada «Selecciona una respuesta» al `Spinner`, que no cuenta como respuesta, y se unificó la lectura en `getSelectedIndex()`, que devuelve −1 si no se ha elegido nada en ningún control. Para las imágenes se usan `MaterialCardView` marcables que guardan el índice seleccionado.'),
...dif('4.4. Volver de otras pantallas sin perder la partida',
 'Al pulsar la flecha *Up* de la barra superior en Historial, Ajustes o Ayuda, Android recreaba la pantalla padre y empezaba una partida nueva.',
 'En `BaseActivity` se sobrescribió `onSupportNavigateUp()` para que delegue en el botón Atrás, que vuelve a la instancia existente de la pantalla de juego.'),
...dif('4.5. Diseño de borde a borde',
 'Al activar el modo *edge-to-edge*, el contenido quedaba debajo de la barra de estado y de la barra de navegación del sistema (Android Developers, s.f.-h).',
 'Se aplican los márgenes de las barras del sistema (*insets*) con `ViewCompat.setOnApplyWindowInsetsListener()`: la barra superior se extiende bajo la barra de estado y el resto del contenido se separa de los bordes.'),
...dif('4.6. Número de preguntas y récord',
 'Si el jugador pedía más preguntas de las que hay en la base de datos la partida fallaba, y en la primera partida siempre aparecía «¡Nuevo récord!».',
 'El método `clampQuestionCount()` ajusta el valor entre el mínimo (tres) y las preguntas disponibles, y se cubrió con pruebas unitarias. El récord solo se muestra si ya existía una partida anterior y se supera su puntuación.'),
...dif('4.7. Retardo en los efectos de sonido',
 'Crear un `MediaPlayer` en cada respuesta provocaba un pequeño retardo y consumía recursos.',
 'Los sonidos cortos se precargan una sola vez en un `SoundPool` (Android Developers, s.f.-i) y se liberan en `onDestroy()`; `MediaPlayer` se reserva para la fanfarria final y se libera al terminar de sonar.'));

// ---------- g. Conclusiones ----------
add(H1('5. Conclusiones'),
H2('5.1. Conclusiones técnicas'),
B('Se ha comprendido el ciclo de vida de las *Activities* y la importancia de guardar y restaurar su estado para que la aplicación se comporte bien ante cambios de configuración.'),
B('SQLite, a través de `SQLiteOpenHelper`, es una forma sencilla y eficaz de guardar datos estructurados en el dispositivo, mientras que `SharedPreferences` resulta más adecuado para preferencias simples.'),
B('Separar la lógica en clases de modelo y utilidades (`Question`, `GameSettings`, `QuestionImages`) facilita reutilizar el código y escribir pruebas unitarias sin necesidad de un emulador.'),
B('Usar herencia (`BaseActivity`) para el código común evita duplicar la configuración de la barra superior y del diseño en cada pantalla.'),
B('Definir todos los textos como recursos y usar componentes de Material Design 3 da como resultado una interfaz coherente, con modo oscuro, y preparada para traducirse.'),
B('Cada control de Android (`RadioGroup`, `Spinner`, `ListView`, tarjetas) tiene su propia forma de gestionar la selección, y conviene unificar su lectura para simplificar la lógica.'),
H2('5.2. Conclusiones personales'),
B('El proyecto nos ha permitido aplicar en una aplicación completa los conceptos vistos en la asignatura, desde el diseño de pantallas hasta la persistencia de datos.'),
B('Hemos aprendido a probar la aplicación en situaciones poco habituales (girar el dispositivo, pulsar sin elegir respuesta, borrar el historial) y a corregir los errores que aparecían.'),
B('Trabajar en equipo con un repositorio Git compartido nos ha obligado a organizar el trabajo y a revisar los cambios del compañero.'),
B('Como posibles mejoras quedan ampliar el banco de preguntas, añadir niveles de dificultad o categorías y añadir un temporizador por pregunta.'));

// ---------- h. Bibliografía ----------
const ref = t => new Paragraph({ style: 'ref', children: runs(t) });
const R = 'Recuperado el 24 de noviembre de 2026, de ';
add(H1('6. Bibliografía'),
ref('American Psychological Association. (2020). *Publication manual of the American Psychological Association* (7.ª ed.). https://doi.org/10.1037/0000165-000'),
ref('Android Developers. (s.f.-a). *Agrega la barra de la app*. Google. ' + R + 'https://developer.android.com/develop/ui/views/components/appbar'),
ref('Android Developers. (s.f.-b). *Cómo guardar datos con SQLite*. Google. ' + R + 'https://developer.android.com/training/data-storage/sqlite'),
ref('Android Developers. (s.f.-c). *Descripción general de MediaPlayer*. Google. ' + R + 'https://developer.android.com/media/platform/mediaplayer'),
ref('Android Developers. (s.f.-d). *Guarda datos simples con SharedPreferences*. Google. ' + R + 'https://developer.android.com/training/data-storage/shared-preferences'),
ref('Android Developers. (s.f.-e). *Guarda estados de IU*. Google. ' + R + 'https://developer.android.com/topic/libraries/architecture/saving-states'),
ref('Android Developers. (s.f.-f). *Intents y filtros de intents*. Google. ' + R + 'https://developer.android.com/guide/components/intents-filters'),
ref('Android Developers. (s.f.-g). *Introducción a las actividades*. Google. ' + R + 'https://developer.android.com/guide/components/activities/intro-activities'),
ref('Android Developers. (s.f.-h). *Muestra contenido de borde a borde en tu app*. Google. ' + R + 'https://developer.android.com/develop/ui/views/layout/edge-to-edge'),
ref('Android Developers. (s.f.-i). *SoundPool*. Google. ' + R + 'https://developer.android.com/reference/android/media/SoundPool'),
ref('Google. (s.f.). *Material Design 3*. ' + R + 'https://m3.material.io/'),
ref('JUnit. (s.f.). *JUnit 4*. ' + R + 'https://junit.org/junit4/'),
ref('Material Components for Android. (s.f.). *Material Components for Android* [Repositorio de código]. GitHub. ' + R + 'https://github.com/material-components/material-components-android'));

// ---------- Portada ----------
const C = (t, size, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: o.after ?? 120, before: o.before ?? 0, line: 276, lineRule: 'auto' }, children: [new TextRun({ text: t, size, bold: o.bold, italics: o.italics, color: o.color })] });
const cover = [
  C('UNIVERSIDAD REY JUAN CARLOS', 36, { bold: true, color: '1F4E79', before: 600 }),
  C('www.urjc.es', 22, { color: '595959', after: 1800 }),
  C('Memoria del proyecto', 28, { italics: true, after: 200 }),
  C('GeoQuiz', 72, { bold: true, color: '1F4E79', after: 120 }),
  C('Aplicación Android de preguntas de geografía', 26, { after: 2000 }),
  C('Integrantes del equipo', 24, { bold: true }),
  C('[Nombre y apellidos del integrante 1]', 24),
  C('[Nombre y apellidos del integrante 2]', 24, { after: 400 }),
  C('Titulación', 24, { bold: true }),
  C('[Titulación]', 24, { after: 400 }),
  C('Profesora', 24, { bold: true }),
  C('[Nombre y apellidos de la profesora]', 24, { after: 400 }),
  C('24 de noviembre de 2026', 24),
];

const toc = [
  new Paragraph({ style: 'tocTitle', children: [new TextRun('Índice')] }),
  new TableOfContents('Índice', { hyperlink: true, headingStyleRange: '1-2' }),

];

const doc = new Document({
  creator: 'Equipo GeoQuiz', title: 'Memoria del proyecto GeoQuiz', language: 'es-ES',
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 24, language: { value: 'es-ES' } }, paragraph: { spacing: { after: 160, line: 360, lineRule: 'auto' }, alignment: AlignmentType.JUSTIFIED } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 32, bold: true, color: '1F4E79' }, paragraph: { spacing: { before: 360, after: 200 }, keepNext: true, alignment: AlignmentType.LEFT, outlineLevel: 0, pageBreakBefore: true } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 26, bold: true, color: '1F4E79' }, paragraph: { spacing: { before: 280, after: 120 }, keepNext: true, alignment: AlignmentType.LEFT, outlineLevel: 1 } },
      { id: 'tocTitle', name: 'Título índice', basedOn: 'Normal', run: { font: FONT, size: 32, bold: true, color: '1F4E79' }, paragraph: { spacing: { after: 240 }, alignment: AlignmentType.LEFT } },
      { id: 'tabla', name: 'Texto tabla', basedOn: 'Normal', run: { size: 20 }, paragraph: { spacing: { after: 0, line: 260 }, alignment: AlignmentType.LEFT } },
      { id: 'tablaHead', name: 'Cabecera tabla', basedOn: 'tabla', run: { size: 20, bold: true } },
      { id: 'nota', name: 'Nota', basedOn: 'Normal', run: { size: 20 }, paragraph: { spacing: { line: 260 }, alignment: AlignmentType.LEFT } },
      { id: 'ref', name: 'Referencia', basedOn: 'Normal', paragraph: { indent: { left: 720, hanging: 720 }, alignment: AlignmentType.LEFT, spacing: { after: 160 } } },
    ],
  },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ] },
  sections: [
    { properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children: cover },
    { properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 22 })] })] }) },
      children: [...toc, ...content] },
  ],
});
Packer.toBuffer(doc).then(b => fs.writeFileSync('Memoria_GeoQuiz.docx', b));
