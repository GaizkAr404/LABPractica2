package com.urjc.practica2;

import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

import androidx.annotation.NonNull;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import java.text.DateFormat;
import java.util.Date;
import java.util.List;

/**
 * Historial de partidas guardadas en la base de datos, con la mejor puntuación.
 */
public class HistoryActivity extends BaseActivity {

    private QuizDatabaseHelper database;
    private ScoreAdapter adapter;
    private TextView tvGamesPlayed;
    private TextView tvBestScore;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setUpScreen(R.layout.activity_history, true);

        database = QuizDatabaseHelper.getInstance(this);
        tvGamesPlayed = findViewById(R.id.tvGamesPlayed);
        tvBestScore = findViewById(R.id.tvBestScore);

        ListView lvScores = findViewById(R.id.lvScores);
        lvScores.setEmptyView(findViewById(R.id.tvEmptyHistory));
        adapter = new ScoreAdapter(this);
        lvScores.setAdapter(adapter);

        loadScores();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_history, menu);
        return true;
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
        menu.findItem(R.id.action_clear_history).setVisible(!adapter.isEmpty());
        return super.onPrepareOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == R.id.action_clear_history) {
            confirmClearHistory();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private void loadScores() {
        List<ScoreEntry> scores = database.getScores();
        adapter.clear();
        adapter.addAll(scores);

        tvGamesPlayed.setText(String.valueOf(scores.size()));
        Integer bestScore = database.getBestScore();
        tvBestScore.setText(bestScore != null
                ? String.valueOf(bestScore)
                : getString(R.string.no_best_score));
        invalidateOptionsMenu();
    }

    private void confirmClearHistory() {
        new MaterialAlertDialogBuilder(this)
                .setTitle(R.string.clear_history_title)
                .setMessage(R.string.clear_history_message)
                .setPositiveButton(R.string.clear_history_confirm, (dialog, which) -> {
                    database.clearScores();
                    loadScores();
                })
                .setNegativeButton(android.R.string.cancel, null)
                .show();
    }

    /** Muestra cada partida con su fecha, aciertos y puntuación. */
    private static class ScoreAdapter extends ArrayAdapter<ScoreEntry> {

        private final DateFormat dateFormat =
                DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT);

        ScoreAdapter(Context context) {
            super(context, 0);
        }

        @NonNull
        @Override
        public View getView(int position, View convertView, @NonNull ViewGroup parent) {
            ViewHolder holder;
            if (convertView == null) {
                convertView = LayoutInflater.from(getContext())
                        .inflate(R.layout.item_score, parent, false);
                holder = new ViewHolder(convertView);
                convertView.setTag(holder);
            } else {
                holder = (ViewHolder) convertView.getTag();
            }

            ScoreEntry entry = getItem(position);
            if (entry != null) {
                Context context = getContext();
                holder.tvDate.setText(dateFormat.format(new Date(entry.getPlayedAt())));
                holder.tvCorrect.setText(context.getString(R.string.correct_count_format,
                        entry.getCorrectCount(), entry.getTotal()));
                holder.tvScore.setText(context.getString(R.string.points_format,
                        entry.getScore()));
            }
            return convertView;
        }

        private static class ViewHolder {
            final TextView tvDate;
            final TextView tvCorrect;
            final TextView tvScore;

            ViewHolder(View view) {
                tvDate = view.findViewById(R.id.tvDate);
                tvCorrect = view.findViewById(R.id.tvCorrect);
                tvScore = view.findViewById(R.id.tvScore);
            }
        }
    }
}
