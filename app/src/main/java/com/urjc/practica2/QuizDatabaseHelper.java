package com.urjc.practica2;

import android.content.ContentValues;
import android.content.Context;
import android.content.res.Resources;
import android.database.Cursor;
import android.database.DatabaseUtils;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import androidx.annotation.ArrayRes;
import androidx.annotation.Nullable;
import androidx.annotation.StringRes;

import java.util.ArrayList;
import java.util.List;

/**
 * Base de datos SQLite del juego. Guarda las preguntas del quiz y el historial de partidas.
 * Las preguntas se insertan la primera vez que se crea la base de datos a partir de los
 * textos de {@code res/values/strings.xml}.
 */
public class QuizDatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "geoquiz.db";
    private static final int DATABASE_VERSION = 1;
    private static final int OPTION_COUNT = 4;

    private static final String TABLE_QUESTIONS = "questions";
    private static final String COL_ID = "_id";
    private static final String COL_TEXT = "text";
    private static final String COL_IMAGE = "image";
    private static final String COL_OPTION_PREFIX = "option_";
    private static final String COL_OPTION_IMAGE_PREFIX = "option_image_";
    private static final String COL_CORRECT_INDEX = "correct_index";
    private static final String COL_ANSWER_TYPE = "answer_type";

    private static final String TABLE_SCORES = "scores";
    private static final String COL_PLAYED_AT = "played_at";
    private static final String COL_SCORE = "score";
    private static final String COL_CORRECT_COUNT = "correct_count";
    private static final String COL_TOTAL = "total";

    private static QuizDatabaseHelper instance;

    private final Resources resources;

    /** Una única instancia para toda la app, ligada al contexto de la aplicación. */
    public static synchronized QuizDatabaseHelper getInstance(Context context) {
        if (instance == null) {
            instance = new QuizDatabaseHelper(context.getApplicationContext());
        }
        return instance;
    }

    private QuizDatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
        resources = context.getResources();
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        StringBuilder questionsSql = new StringBuilder("CREATE TABLE " + TABLE_QUESTIONS + " ("
                + COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
                + COL_TEXT + " TEXT NOT NULL, "
                + COL_IMAGE + " TEXT, ");
        for (int i = 0; i < OPTION_COUNT; i++) {
            questionsSql.append(COL_OPTION_PREFIX).append(i).append(" TEXT NOT NULL, ");
            questionsSql.append(COL_OPTION_IMAGE_PREFIX).append(i).append(" TEXT, ");
        }
        questionsSql.append(COL_CORRECT_INDEX).append(" INTEGER NOT NULL, ")
                .append(COL_ANSWER_TYPE).append(" TEXT NOT NULL)");
        db.execSQL(questionsSql.toString());

        db.execSQL("CREATE TABLE " + TABLE_SCORES + " ("
                + COL_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
                + COL_PLAYED_AT + " INTEGER NOT NULL, "
                + COL_SCORE + " INTEGER NOT NULL, "
                + COL_CORRECT_COUNT + " INTEGER NOT NULL, "
                + COL_TOTAL + " INTEGER NOT NULL)");

        seedQuestions(db);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_QUESTIONS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_SCORES);
        onCreate(db);
    }

    // ---- Preguntas ----

    private void seedQuestions(SQLiteDatabase db) {
        insertQuestion(db, R.string.q_capital_australia, null,
                R.array.q_capital_australia_options, null, 1, Question.AnswerType.RADIO);
        insertQuestion(db, R.string.q_flag_country, QuestionImages.FLAG_JAPAN,
                R.array.q_flag_japan_options, null, 2, Question.AnswerType.SPINNER);
        insertQuestion(db, R.string.q_flag_italy, null,
                R.array.q_flag_italy_options,
                new String[]{QuestionImages.FLAG_FRANCE, QuestionImages.FLAG_IRELAND,
                        QuestionImages.FLAG_BELGIUM, QuestionImages.FLAG_ITALY},
                3, Question.AnswerType.IMAGES);
        insertQuestion(db, R.string.q_longest_river, null,
                R.array.q_longest_river_options, null, 0, Question.AnswerType.LIST);
        insertQuestion(db, R.string.q_flag_country, QuestionImages.FLAG_SWEDEN,
                R.array.q_flag_sweden_options, null, 1, Question.AnswerType.RADIO);
        insertQuestion(db, R.string.q_capital_canada, null,
                R.array.q_capital_canada_options, null, 1, Question.AnswerType.RADIO);
        insertQuestion(db, R.string.q_largest_ocean, null,
                R.array.q_largest_ocean_options, null, 2, Question.AnswerType.SPINNER);
        insertQuestion(db, R.string.q_highest_mountain, null,
                R.array.q_highest_mountain_options, null, 3, Question.AnswerType.LIST);
        insertQuestion(db, R.string.q_flag_country, QuestionImages.FLAG_FRANCE,
                R.array.q_flag_france_options, null, 1, Question.AnswerType.SPINNER);
        insertQuestion(db, R.string.q_flag_ireland, null,
                R.array.q_flag_ireland_options,
                new String[]{QuestionImages.FLAG_ITALY, QuestionImages.FLAG_IRELAND,
                        QuestionImages.FLAG_FRANCE, QuestionImages.FLAG_BELGIUM},
                1, Question.AnswerType.IMAGES);
        insertQuestion(db, R.string.q_largest_country, null,
                R.array.q_largest_country_options, null, 2, Question.AnswerType.RADIO);
        insertQuestion(db, R.string.q_capital_brazil, null,
                R.array.q_capital_brazil_options, null, 0, Question.AnswerType.LIST);
    }

    private void insertQuestion(SQLiteDatabase db, @StringRes int textResId,
                                @Nullable String imageKey, @ArrayRes int optionsResId,
                                @Nullable String[] optionImageKeys, int correctIndex,
                                Question.AnswerType answerType) {
        String[] options = resources.getStringArray(optionsResId);
        ContentValues values = new ContentValues();
        values.put(COL_TEXT, resources.getString(textResId));
        values.put(COL_IMAGE, imageKey);
        for (int i = 0; i < OPTION_COUNT; i++) {
            values.put(COL_OPTION_PREFIX + i, options[i]);
            values.put(COL_OPTION_IMAGE_PREFIX + i,
                    optionImageKeys != null ? optionImageKeys[i] : null);
        }
        values.put(COL_CORRECT_INDEX, correctIndex);
        values.put(COL_ANSWER_TYPE, answerType.name());
        db.insertOrThrow(TABLE_QUESTIONS, null, values);
    }

    public List<Question> getAllQuestions() {
        List<Question> questions = new ArrayList<>();
        try (Cursor cursor = getReadableDatabase().query(TABLE_QUESTIONS, null, null, null,
                null, null, COL_ID)) {
            while (cursor.moveToNext()) {
                questions.add(questionFromCursor(cursor));
            }
        }
        return questions;
    }

    public int getQuestionCount() {
        return (int) DatabaseUtils.queryNumEntries(getReadableDatabase(), TABLE_QUESTIONS);
    }

    private static Question questionFromCursor(Cursor cursor) {
        String text = cursor.getString(cursor.getColumnIndexOrThrow(COL_TEXT));
        String imageKey = cursor.getString(cursor.getColumnIndexOrThrow(COL_IMAGE));
        int correctIndex = cursor.getInt(cursor.getColumnIndexOrThrow(COL_CORRECT_INDEX));
        Question.AnswerType answerType = Question.AnswerType.valueOf(
                cursor.getString(cursor.getColumnIndexOrThrow(COL_ANSWER_TYPE)));

        String[] options = new String[OPTION_COUNT];
        for (int i = 0; i < OPTION_COUNT; i++) {
            options[i] = cursor.getString(cursor.getColumnIndexOrThrow(COL_OPTION_PREFIX + i));
        }

        if (answerType == Question.AnswerType.IMAGES) {
            int[] optionImages = new int[OPTION_COUNT];
            for (int i = 0; i < OPTION_COUNT; i++) {
                optionImages[i] = QuestionImages.resolve(cursor.getString(
                        cursor.getColumnIndexOrThrow(COL_OPTION_IMAGE_PREFIX + i)));
            }
            return Question.imageOptionsQuestion(text, options, optionImages, correctIndex);
        }
        if (imageKey != null) {
            return Question.imageQuestion(text, QuestionImages.resolve(imageKey), options,
                    correctIndex, answerType);
        }
        return Question.textQuestion(text, options, correctIndex, answerType);
    }

    // ---- Historial de partidas ----

    public void insertScore(ScoreEntry entry) {
        ContentValues values = new ContentValues();
        values.put(COL_PLAYED_AT, entry.getPlayedAt());
        values.put(COL_SCORE, entry.getScore());
        values.put(COL_CORRECT_COUNT, entry.getCorrectCount());
        values.put(COL_TOTAL, entry.getTotal());
        getWritableDatabase().insertOrThrow(TABLE_SCORES, null, values);
    }

    /** Partidas jugadas, de la más reciente a la más antigua. */
    public List<ScoreEntry> getScores() {
        List<ScoreEntry> scores = new ArrayList<>();
        try (Cursor cursor = getReadableDatabase().query(TABLE_SCORES, null, null, null,
                null, null, COL_PLAYED_AT + " DESC")) {
            while (cursor.moveToNext()) {
                scores.add(new ScoreEntry(
                        cursor.getLong(cursor.getColumnIndexOrThrow(COL_PLAYED_AT)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COL_SCORE)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COL_CORRECT_COUNT)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COL_TOTAL))));
            }
        }
        return scores;
    }

    /** Mejor puntuación guardada, o {@code null} si todavía no se ha jugado ninguna partida. */
    @Nullable
    public Integer getBestScore() {
        try (Cursor cursor = getReadableDatabase().rawQuery(
                "SELECT MAX(" + COL_SCORE + ") FROM " + TABLE_SCORES, null)) {
            if (cursor.moveToFirst() && !cursor.isNull(0)) {
                return cursor.getInt(0);
            }
            return null;
        }
    }

    public void clearScores() {
        getWritableDatabase().delete(TABLE_SCORES, null, null);
    }
}
