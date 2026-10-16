package com.arkansasio.universecivilization;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.graphics.Typeface;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

/**
 * Native starter screen for the Universe Civilization mobile companion.
 * The screen is intentionally offline-safe; backend integration must use HTTPS.
 */
public final class MainActivity extends Activity {
    private static final int BG = Color.rgb(8, 15, 28);
    private static final int PANEL = Color.rgb(17, 30, 49);
    private static final int ACCENT = Color.rgb(58, 190, 220);
    private LinearLayout content;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(20), dp(24), dp(20), dp(28));
        content.setBackgroundColor(BG);
        scroll.addView(content, new ScrollView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(scroll);
        renderOverview();
    }

    private void renderOverview() {
        content.removeAllViews();
        TextView eyebrow = text("GALACTIC COMMAND // MOBILE", 12, ACCENT, true);
        content.addView(eyebrow);

        TextView title = text("UNIVERSE\nCIVILIZATION", 30, Color.WHITE, true);
        title.setPadding(0, dp(10), 0, dp(4));
        content.addView(title);

        content.addView(text("Empire at Wars • Android Companion v3.5.0",
                13, Color.rgb(170, 190, 210), false));

        LinearLayout resources = panel();
        resources.addView(text("COMMAND STATUS", 12, ACCENT, true));
        resources.addView(text("Naquadah — API not connected", 15, Color.WHITE, false));
        resources.addView(text("Fleet — Ready for synchronization", 15, Color.WHITE, false));
        resources.addView(text("Research — Local companion mode", 15, Color.WHITE, false));
        resources.addView(text("Galaxy — Awaiting server configuration", 15, Color.WHITE, false));
        content.addView(resources);

        addAction("OVERVIEW", "View commander status and resources", "Overview");
        addAction("GALAXY MAP", "Navigate galaxies, systems and colonies", "Galaxy");
        addAction("FLEET COMMAND", "Review fleet and combat operations", "Fleet");
        addAction("RESEARCH", "Review technology disciplines", "Research");
        addAction("STARGATE NETWORK", "Manage gate and iris status", "Stargate");
        addAction("SETTINGS / API", "Configure the HTTPS game API endpoint", "Settings");

        TextView footer = text("SECURE CONNECTION REQUIRED FOR LIVE GAME DATA",
                11, Color.rgb(140, 160, 180), true);
        footer.setGravity(Gravity.CENTER);
        footer.setPadding(0, dp(24), 0, dp(8));
        content.addView(footer);
    }

    private void addAction(String label, String description, String section) {
        LinearLayout card = panel();
        card.addView(text(label, 16, Color.WHITE, true));
        TextView detail = text(description, 13, Color.rgb(170, 190, 210), false);
        detail.setPadding(0, dp(4), 0, dp(10));
        card.addView(detail);

        Button button = new Button(this);
        button.setText("OPEN " + section.toUpperCase());
        button.setTextColor(Color.WHITE);
        button.setBackgroundTintList(
                android.content.res.ColorStateList.valueOf(ACCENT));
        button.setOnClickListener(v -> showSection(section));
        card.addView(button);
        content.addView(card);
    }

    private void showSection(String section) {
        content.removeAllViews();
        Button back = new Button(this);
        back.setText("← COMMAND OVERVIEW");
        back.setOnClickListener(v -> renderOverview());
        content.addView(back);

        content.addView(text(section.toUpperCase(), 26, Color.WHITE, true));
        LinearLayout card = panel();
        card.addView(text("LIVE BACKEND NOT CONFIGURED", 14, ACCENT, true));
        card.addView(text(
                "This native APK shell is ready for the game's API integration. " +
                "No live account, resource, fleet, or planet data is displayed until " +
                "a valid HTTPS API base URL and authenticated endpoints are configured.",
                14, Color.WHITE, false));
        content.addView(card);
    }

    private LinearLayout panel() {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(16), dp(14), dp(16), dp(14));
        card.setBackgroundColor(PANEL);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.topMargin = dp(14);
        content.addView(card, lp);
        return card;
    }

    private TextView text(String value, int size, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(color);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        view.setPadding(0, dp(5), 0, dp(5));
        return view;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
