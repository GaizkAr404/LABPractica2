package com.urjc.practica2;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.SoundPool;

/**
 * Efectos de sonido cortos de acierto y fallo. Se cargan una vez en un {@link SoundPool}
 * para que suenen sin retardo y solo se reproducen si el jugador tiene el sonido activado.
 */
public class SoundEffects {

    private final GameSettings settings;
    private final SoundPool soundPool;
    private final int correctSoundId;
    private final int wrongSoundId;

    public SoundEffects(Context context, GameSettings settings) {
        this.settings = settings;
        AudioAttributes attributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
        soundPool = new SoundPool.Builder()
                .setMaxStreams(2)
                .setAudioAttributes(attributes)
                .build();
        correctSoundId = soundPool.load(context, R.raw.correct, 1);
        wrongSoundId = soundPool.load(context, R.raw.wrong, 1);
    }

    public void playCorrect() {
        play(correctSoundId);
    }

    public void playWrong() {
        play(wrongSoundId);
    }

    private void play(int soundId) {
        if (settings.isSoundEnabled()) {
            soundPool.play(soundId, 1f, 1f, 1, 0, 1f);
        }
    }

    /** Libera los recursos de audio; llamar desde {@code onDestroy()}. */
    public void release() {
        soundPool.release();
    }
}
