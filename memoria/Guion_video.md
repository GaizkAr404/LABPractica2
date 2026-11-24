# Guion del vídeo – GeoQuiz (máx. 3:00)

**Personas:** I1 = [Integrante 1] · I2 = [Integrante 2]
**Formato:** grabación de pantalla con las webcams de I1 e I2 en una esquina durante todo el vídeo. Así se os ve la cara en todo momento, no solo al principio y al final.
**Ritmo:** unas 130 palabras por minuto. Cada bloque está ajustado a ese ritmo.

---

## 1. Presentación (0:00 – 0:15) · I1 e I2 a cámara

**I1:** Hola, somos [Nombre I1]…
**I2:** …y [Nombre I2]. Os presentamos **GeoQuiz**, un juego de preguntas de geografía para Android, hecho en Java.

---

## 2. La aplicación en ejecución (0:15 – 1:15) · Emulador · Habla I1

| Tiempo | En pantalla | Texto |
|---|---|---|
| 0:15 | Pantalla de juego, pregunta con *RadioButton* | «Cada partida tiene preguntas aleatorias. Arriba vemos el progreso, la puntuación y una barra de avance.» |
| 0:25 | Responder bien → *Snackbar* «¡Correcto! +3» | «Cada acierto suma tres puntos…» |
| 0:32 | Responder mal → diálogo | «…y cada fallo resta dos. Al fallar se muestra la respuesta correcta y podemos continuar o empezar de nuevo.» |
| 0:42 | Pasar por *Spinner*, *ListView* y las banderas | «Las opciones aparecen de cuatro formas distintas: botones de opción, un desplegable, una lista o cuatro banderas para tocar.» |
| 0:52 | Girar el emulador | «Si giramos el móvil, la partida no se pierde.» |
| 0:57 | Pantalla de resultado con «¡Nuevo récord!» | «Al terminar vemos la puntuación final y, si superamos nuestra mejor marca, el aviso de récord.» |
| 1:03 | Historial → Ajustes (slider y sonido) → Ayuda | «El historial guarda todas las partidas. En Ajustes elegimos cuántas preguntas hay y si queremos sonido. Y aquí está el manual de usuario.» |

---

## 3. El código (1:15 – 2:25) · Android Studio · Habla I2

| Tiempo | Archivo / método | Texto |
|---|---|---|
| 1:15 | `QuizDatabaseHelper` → `onCreate()` y `seedQuestions()` | «Las preguntas y el historial se guardan en SQLite. Al crear la base de datos se insertan las doce preguntas a partir de `strings.xml`. La clase es un *Singleton*.» |
| 1:30 | `QuestionImages` | «Las banderas se guardan como claves de texto y aquí se traducen a *drawables*, porque los identificadores de `R` pueden cambiar al compilar.» |
| 1:40 | `MainActivity` → `startNewGame()` y `showQuestion()` | «Al empezar, barajamos las preguntas y mostramos solo el control que corresponde a su tipo.» |
| 1:50 | `getSelectedIndex()` y `checkAnswer()` | «Este método lee la respuesta de cualquiera de los cuatro controles, y `checkAnswer` suma o resta puntos y reproduce el sonido.» |
| 2:00 | `onSaveInstanceState()` | «Aquí guardamos el estado para que la partida sobreviva al giro de pantalla.» |
| 2:07 | `showResult()` → `ResultActivity` | «Al terminar guardamos la partida y pasamos los datos a la pantalla de resultado con un `Intent`.» |
| 2:14 | `GameSettings`, `SoundEffects`, `BaseActivity` | «Los ajustes van en `SharedPreferences`, los sonidos en un `SoundPool` y `BaseActivity` reúne la barra superior común a todas las pantallas.» |

---

## 4. Aportación de cada integrante (2:25 – 2:50) · Cámaras a pantalla completa

**I1:** Yo me he encargado de [p. ej.: la pantalla de juego, los cuatro tipos de pregunta, la puntuación y la gestión del estado al girar].
**I2:** Y yo de [p. ej.: la base de datos SQLite, el historial, los ajustes y los sonidos]. La memoria, el diseño y las pruebas los hicimos entre los dos.

---

## 5. Cierre (2:50 – 3:00) · Ambos a cámara

**I1:** Esto ha sido GeoQuiz.
**I2:** ¡Gracias por vernos!

---

### Consejos para la grabación
- Antes de grabar, preparad el emulador con alguna partida ya jugada, para que el historial no salga vacío y pueda aparecer el récord.
- En Ajustes, poned 3 preguntas por partida para que la demostración sea más corta.
- Tened abiertos en pestañas los archivos que vais a enseñar y aumentad el tamaño de letra del editor.
- Cronometrad un ensayo: si os pasáis de tiempo, recortad la parte del código de las 2:14 (`GameSettings`, `SoundEffects`, `BaseActivity`).
