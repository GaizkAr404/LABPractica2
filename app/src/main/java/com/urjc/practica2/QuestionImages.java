package com.urjc.practica2;

import androidx.annotation.DrawableRes;
import androidx.annotation.Nullable;

import java.util.HashMap;
import java.util.Map;

/**
 * Traduce las claves de imagen guardadas en la base de datos a recursos drawable.
 * Se guardan claves en lugar de identificadores {@code R.drawable.*} porque estos
 * pueden cambiar entre compilaciones.
 */
public final class QuestionImages {

    public static final String FLAG_BELGIUM = "flag_belgium";
    public static final String FLAG_FRANCE = "flag_france";
    public static final String FLAG_IRELAND = "flag_ireland";
    public static final String FLAG_ITALY = "flag_italy";
    public static final String FLAG_JAPAN = "flag_japan";
    public static final String FLAG_SWEDEN = "flag_sweden";

    private static final Map<String, Integer> IMAGES = new HashMap<>();

    static {
        IMAGES.put(FLAG_BELGIUM, R.drawable.flag_belgium);
        IMAGES.put(FLAG_FRANCE, R.drawable.flag_france);
        IMAGES.put(FLAG_IRELAND, R.drawable.flag_ireland);
        IMAGES.put(FLAG_ITALY, R.drawable.flag_italy);
        IMAGES.put(FLAG_JAPAN, R.drawable.flag_japan);
        IMAGES.put(FLAG_SWEDEN, R.drawable.flag_sweden);
    }

    private QuestionImages() {
    }

    /** Devuelve el drawable asociado a la clave, o 0 si la clave es nula o desconocida. */
    @DrawableRes
    public static int resolve(@Nullable String key) {
        Integer resId = key != null ? IMAGES.get(key) : null;
        return resId != null ? resId : 0;
    }
}
