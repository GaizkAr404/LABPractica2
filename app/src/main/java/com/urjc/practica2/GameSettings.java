package com.urjc.practica2;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Ajustes del jugador guardados en {@link SharedPreferences}.
 */
public class GameSettings {

    public static final int MIN_QUESTIONS = 3;
    public static final int DEFAULT_QUESTIONS = 5;

    private static final String PREFS_NAME = "game_settings";
    private static final String KEY_SOUND_ENABLED = "sound_enabled";
    private static final String KEY_QUESTIONS_PER_GAME = "questions_per_game";

    private final SharedPreferences prefs;

    public GameSettings(Context context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public boolean isSoundEnabled() {
        return prefs.getBoolean(KEY_SOUND_ENABLED, true);
    }

    public void setSoundEnabled(boolean enabled) {
        prefs.edit().putBoolean(KEY_SOUND_ENABLED, enabled).apply();
    }

    public int getQuestionsPerGame() {
        return prefs.getInt(KEY_QUESTIONS_PER_GAME, DEFAULT_QUESTIONS);
    }

    public void setQuestionsPerGame(int count) {
        prefs.edit().putInt(KEY_QUESTIONS_PER_GAME, count).apply();
    }

    /** Ajusta el número de preguntas pedido a las que hay disponibles en la base de datos. */
    public static int clampQuestionCount(int requested, int available) {
        return Math.max(Math.min(MIN_QUESTIONS, available), Math.min(requested, available));
    }
}
