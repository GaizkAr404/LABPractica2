package com.urjc.practica2;

import android.os.Bundle;
import android.widget.TextView;

import com.google.android.material.materialswitch.MaterialSwitch;
import com.google.android.material.slider.Slider;

/**
 * Ajustes del juego: activar o desactivar el sonido y elegir cuántas preguntas tiene cada
 * partida. Los cambios se guardan al momento.
 */
public class SettingsActivity extends BaseActivity {

    private TextView tvQuestionsValue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setUpScreen(R.layout.activity_settings, true);

        GameSettings settings = new GameSettings(this);

        MaterialSwitch swSound = findViewById(R.id.swSound);
        swSound.setChecked(settings.isSoundEnabled());
        swSound.setOnCheckedChangeListener((button, checked) -> settings.setSoundEnabled(checked));

        // El máximo depende de cuántas preguntas haya en la base de datos.
        int available = QuizDatabaseHelper.getInstance(this).getQuestionCount();
        int current = GameSettings.clampQuestionCount(settings.getQuestionsPerGame(), available);
        tvQuestionsValue = findViewById(R.id.tvQuestionsValue);
        Slider slider = findViewById(R.id.sliderQuestions);
        slider.setValueFrom(GameSettings.MIN_QUESTIONS);
        slider.setValueTo(Math.max(available, GameSettings.MIN_QUESTIONS + 1));
        slider.setValue(current);
        slider.setLabelFormatter(value -> String.valueOf((int) value));
        slider.addOnChangeListener((s, value, fromUser) -> {
            settings.setQuestionsPerGame((int) value);
            showQuestionCount((int) value);
        });
        showQuestionCount(current);
    }

    private void showQuestionCount(int count) {
        tvQuestionsValue.setText(getResources().getQuantityString(
                R.plurals.questions_per_game_value, count, count));
    }
}
