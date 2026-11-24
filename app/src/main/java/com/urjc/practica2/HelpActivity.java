package com.urjc.practica2;

import android.os.Bundle;

/**
 * Manual de usuario: explica cómo se juega y qué hace cada pantalla.
 */
public class HelpActivity extends BaseActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setUpScreen(R.layout.activity_help, true);
    }
}
