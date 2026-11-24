package com.urjc.practica2;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class GameSettingsTest {

    @Test
    public void clampQuestionCount_keepsValueInRange() {
        assertEquals(5, GameSettings.clampQuestionCount(5, 12));
    }

    @Test
    public void clampQuestionCount_neverExceedsAvailable() {
        assertEquals(12, GameSettings.clampQuestionCount(20, 12));
    }

    @Test
    public void clampQuestionCount_raisesToMinimum() {
        assertEquals(GameSettings.MIN_QUESTIONS, GameSettings.clampQuestionCount(1, 12));
    }

    @Test
    public void clampQuestionCount_withFewQuestions_usesAllOfThem() {
        assertEquals(2, GameSettings.clampQuestionCount(5, 2));
    }
}
