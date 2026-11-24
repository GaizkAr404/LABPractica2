package com.urjc.practica2;

import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

/**
 * Muestra la puntuación final y permite empezar una nueva partida.
 */
public class ResultActivity extends BaseActivity {

    public static final String EXTRA_SCORE = "com.urjc.practica2.SCORE";
    public static final String EXTRA_CORRECT_COUNT = "com.urjc.practica2.CORRECT_COUNT";
    public static final String EXTRA_TOTAL = "com.urjc.practica2.TOTAL";
    public static final String EXTRA_NEW_RECORD = "com.urjc.practica2.NEW_RECORD";

    private MediaPlayer mediaPlayer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setUpScreen(R.layout.activity_result, false);

        Intent intent = getIntent();
        int score = intent.getIntExtra(EXTRA_SCORE, 0);
        int correctCount = intent.getIntExtra(EXTRA_CORRECT_COUNT, 0);
        int total = intent.getIntExtra(EXTRA_TOTAL, 0);
        boolean newRecord = intent.getBooleanExtra(EXTRA_NEW_RECORD, false);

        TextView tvFinalScore = findViewById(R.id.tvFinalScore);
        TextView tvCorrectCount = findViewById(R.id.tvCorrectCount);
        TextView tvResultMessage = findViewById(R.id.tvResultMessage);

        tvFinalScore.setText(String.valueOf(score));
        tvCorrectCount.setText(getString(R.string.correct_count_format, correctCount, total));
        tvResultMessage.setText(resultMessage(correctCount, total));
        findViewById(R.id.tvNewRecord).setVisibility(newRecord ? View.VISIBLE : View.GONE);

        findViewById(R.id.btnPlayAgain).setOnClickListener(v -> {
            startActivity(new Intent(this, MainActivity.class));
            finish();
        });
        findViewById(R.id.btnHistory).setOnClickListener(v ->
                startActivity(new Intent(this, HistoryActivity.class)));

        // La fanfarria suena solo al llegar a la pantalla, no al girar el dispositivo.
        if (savedInstanceState == null && new GameSettings(this).isSoundEnabled()) {
            playGameOverSound();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        releaseMediaPlayer();
    }

    private void playGameOverSound() {
        mediaPlayer = MediaPlayer.create(this, R.raw.game_over);
        if (mediaPlayer != null) {
            mediaPlayer.setOnCompletionListener(mp -> releaseMediaPlayer());
            mediaPlayer.start();
        }
    }

    private void releaseMediaPlayer() {
        if (mediaPlayer != null) {
            mediaPlayer.release();
            mediaPlayer = null;
        }
    }

    private int resultMessage(int correctCount, int total) {
        if (correctCount == total) {
            return R.string.result_excellent;
        } else if (correctCount * 2 >= total) {
            return R.string.result_good;
        } else {
            return R.string.result_bad;
        }
    }
}
