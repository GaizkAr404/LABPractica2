package com.urjc.practica2;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class QuestionImagesTest {

    @Test
    public void resolve_knownKey_returnsDrawable() {
        assertEquals(R.drawable.flag_japan, QuestionImages.resolve(QuestionImages.FLAG_JAPAN));
    }

    @Test
    public void resolve_unknownOrNullKey_returnsZero() {
        assertEquals(0, QuestionImages.resolve("flag_atlantis"));
        assertEquals(0, QuestionImages.resolve(null));
    }
}
