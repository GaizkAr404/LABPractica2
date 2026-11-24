package com.urjc.practica2;

/**
 * Resultado de una partida guardado en el historial.
 */
public class ScoreEntry {

    private final long playedAt;
    private final int score;
    private final int correctCount;
    private final int total;

    public ScoreEntry(long playedAt, int score, int correctCount, int total) {
        this.playedAt = playedAt;
        this.score = score;
        this.correctCount = correctCount;
        this.total = total;
    }

    /** Momento en que terminó la partida, en milisegundos desde epoch. */
    public long getPlayedAt() {
        return playedAt;
    }

    public int getScore() {
        return score;
    }

    public int getCorrectCount() {
        return correctCount;
    }

    public int getTotal() {
        return total;
    }
}
