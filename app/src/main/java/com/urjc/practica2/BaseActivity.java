package com.urjc.practica2;

import android.graphics.Color;

import androidx.activity.EdgeToEdge;
import androidx.activity.SystemBarStyle;
import androidx.annotation.LayoutRes;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.appbar.MaterialToolbar;

/**
 * Configuración común a todas las pantallas: diseño edge-to-edge y Toolbar con el icono
 * y el nombre de la aplicación.
 */
public abstract class BaseActivity extends AppCompatActivity {

    /**
     * Carga el layout, que debe tener una vista raíz con id {@code main} e incluir
     * {@code view_toolbar}.
     */
    protected void setUpScreen(@LayoutRes int layoutResId, boolean showUpButton) {
        // La Toolbar es oscura, así que los iconos de la barra de estado van en claro.
        EdgeToEdge.enable(this, SystemBarStyle.dark(Color.TRANSPARENT));
        setContentView(layoutResId);

        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayShowHomeEnabled(true);
            actionBar.setDisplayUseLogoEnabled(true);
            actionBar.setLogo(R.drawable.ic_app_logo_toolbar);
            actionBar.setDisplayHomeAsUpEnabled(showUpButton);
        }
        toolbar.setLogoDescription(R.string.app_logo_description);

        // La Toolbar se extiende bajo la barra de estado; el resto del contenido no.
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, 0, systemBars.right, systemBars.bottom);
            toolbar.setPadding(0, systemBars.top, 0, 0);
            return insets;
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        // Volver atrás en lugar de recrear la pantalla padre, para no perder la partida en curso.
        getOnBackPressedDispatcher().onBackPressed();
        return true;
    }
}
