package com.arkansasio.universecivilization;

import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

/**
 * Mobile shell for the repository's existing full React game.
 * The app never fabricates server state: the game is loaded from its Pages deployment.
 */
public final class MainActivity extends Activity {
    private static final int BG = Color.rgb(8, 15, 28);
    private static final int PANEL = Color.rgb(17, 30, 49);
    private static final int ACCENT = Color.rgb(58, 190, 220);
    private static final int TEXT = Color.rgb(230, 240, 250);

    private WebView webView;
    private ProgressBar progress;
    private View offlinePanel;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Window window = getWindow();
        window.setStatusBarColor(BG);
        window.setNavigationBarColor(BG);
        if (Build.VERSION.SDK_INT >= 29) {
            window.setNavigationBarContrastEnforced(false);
        }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(dp(10), dp(7), dp(10), dp(7));
        toolbar.setBackgroundColor(PANEL);

        TextView brand = new TextView(this);
        brand.setText("UNIVERSE  //  SGW 3.5");
        brand.setTextColor(ACCENT);
        brand.setTextSize(13);
        brand.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        toolbar.addView(brand, new LinearLayout.LayoutParams(0, dp(44), 1f));
        toolbar.addView(toolbarButton("GAME", v -> loadGame()));
        toolbar.addView(toolbarButton("↻", v -> reloadGame()));
        toolbar.addView(toolbarButton("API", v -> showApiSettings()));
        root.addView(toolbar, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(ACCENT));
        progress.setIndeterminateTintList(android.content.res.ColorStateList.valueOf(ACCENT));
        root.addView(progress, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(3)));

        FrameLayout stage = new FrameLayout(this);
        webView = new WebView(this);
        configureWebView();
        stage.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        offlinePanel = buildOfflinePanel();
        offlinePanel.setVisibility(View.GONE);
        stage.addView(offlinePanel, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        root.addView(stage, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        setContentView(root);
        if (state != null && webView.restoreState(state) != null) {
            // restoreState restores the existing page/history when possible
        } else {
            loadGame();
        }
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true); // required by the React game
        settings.setDomStorageEnabled(true); // game UI persistence
        settings.setDatabaseEnabled(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setLoadsImagesAutomatically(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);

        webView.setBackgroundColor(BG);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int value) {
                progress.setProgress(value);
                progress.setVisibility(value >= 100 ? View.GONE : View.VISIBLE);
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return routeUrl(request.getUrl().toString());
            }

            @SuppressWarnings("deprecation")
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return routeUrl(url);
            }

            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                offlinePanel.setVisibility(View.GONE);
                progress.setVisibility(View.VISIBLE);
                progress.setProgress(5);
            }

            @Override public void onPageFinished(WebView view, String url) {
                progress.setVisibility(View.GONE);
                offlinePanel.setVisibility(View.GONE);
                applyMobileLayout();
            }

            @Override public void onReceivedError(WebView view, WebResourceRequest request,
                                                   WebResourceError error) {
                if (request.isForMainFrame()) showOffline();
            }

            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request,
                                                       android.webkit.WebResourceResponse response) {
                if (request.isForMainFrame() && response.getStatusCode() >= 400) showOffline();
            }
        });
    }

    private boolean routeUrl(String value) {
        Uri uri = Uri.parse(value);
        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
        if ("arkansasio.github.io".equals(host)) return false;
        if ("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme())) {
            try {
                startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW, uri));
            } catch (Exception ignored) {
                Toast.makeText(this, "No browser is available for this link.", Toast.LENGTH_SHORT).show();
            }
            return true;
        }
        return true;
    }

    private void loadGame() {
        offlinePanel.setVisibility(View.GONE);
        webView.loadUrl(GameConfig.GAME_URL);
    }

    private void reloadGame() {
        if (webView.getUrl() == null) loadGame();
        else {
            offlinePanel.setVisibility(View.GONE);
            webView.reload();
        }
    }

    private void showOffline() {
        progress.setVisibility(View.GONE);
        offlinePanel.setVisibility(View.VISIBLE);
    }

    private View buildOfflinePanel() {
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setGravity(Gravity.CENTER);
        panel.setPadding(dp(28), dp(24), dp(28), dp(24));
        panel.setBackgroundColor(BG);

        TextView title = new TextView(this);
        title.setText("GALACTIC LINK UNAVAILABLE");
        title.setTextColor(ACCENT);
        title.setTextSize(19);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        panel.addView(title);

        TextView body = new TextView(this);
        body.setText("The game website could not be reached. Check your connection or wait for the GitHub Pages deployment to finish, then retry. No live game data is simulated by this app.");
        body.setTextColor(TEXT);
        body.setTextSize(14);
        body.setGravity(Gravity.CENTER);
        body.setPadding(0, dp(14), 0, dp(18));
        panel.addView(body);

        Button retry = toolbarButton("RETRY CONNECTION", v -> loadGame());
        panel.addView(retry);
        return panel;
    }

    private void applyMobileLayout() {
        // Keep the existing game engine and controls intact while preventing
        // accidental horizontal overflow on narrow Android screens.
        String css = "javascript:(function(){var s=document.getElementById('android-mobile-fit');"
                + "if(!s){s=document.createElement('style');s.id='android-mobile-fit';"
                + "document.head.appendChild(s);}s.textContent='html,body,#root{max-width:100%;"
                + "min-height:100%;overflow-x:hidden}body{width:100%;}img,video,canvas,svg{"
                + "max-width:100%;}*{box-sizing:border-box;}@media(max-width:700px){"
                + "body{font-size:14px;}#root{width:100%;overflow-x:hidden;}"
                + "input,select,textarea,button{max-width:100%;}}';})()";
        webView.evaluateJavascript(css.replaceFirst("^javascript:", ""), null);
    }

    private Button toolbarButton(String label, View.OnClickListener listener) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextSize(11);
        button.setTextColor(Color.WHITE);
        button.setAllCaps(false);
        button.setPadding(dp(8), 0, dp(8), 0);
        button.setMinWidth(dp(44));
        button.setMinimumHeight(dp(40));
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(ACCENT);
        shape.setCornerRadius(dp(8));
        button.setBackground(shape);
        button.setOnClickListener(listener);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, dp(40));
        params.leftMargin = dp(5);
        button.setLayoutParams(params);
        return button;
    }

    private void showApiSettings() {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(dp(20), dp(8), dp(20), 0);

        TextView info = new TextView(this);
        info.setText("Optional HTTPS API base URL (for example, https://api.example.com/api/v1). Leave blank if no API server is deployed. Never enter a database password here.");
        info.setTextSize(13);
        box.addView(info);

        EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setHint("https://your-api-host/api/v1");
        input.setInputType(android.text.InputType.TYPE_CLASS_TEXT
                | android.text.InputType.TYPE_TEXT_VARIATION_URI);
        input.setText(GameConfig.getApiBaseUrl(this));
        box.addView(input);

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle("GAME API SETTINGS")
                .setView(box)
                .setPositiveButton("SAVE", null)
                .setNeutralButton("TEST HEALTH", null)
                .setNegativeButton("CANCEL", null)
                .create();
        dialog.setOnShowListener(ignored -> {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
                String value = input.getText().toString();
                if (!GameConfig.saveApiBaseUrl(this, value)) {
                    input.setError("Use a valid HTTPS URL, or leave blank.");
                    return;
                }
                Toast.makeText(this, value.trim().isEmpty()
                        ? "API URL cleared." : "API URL saved.", Toast.LENGTH_SHORT).show();
                dialog.dismiss();
            });
            dialog.getButton(AlertDialog.BUTTON_NEUTRAL).setOnClickListener(v -> {
                String value = input.getText().toString().trim();
                if (!GameConfig.saveApiBaseUrl(this, value) || value.isEmpty()) {
                    input.setError("Enter a valid HTTPS API base URL.");
                    return;
                }
                Toast.makeText(this, "Checking API health…", Toast.LENGTH_SHORT).show();
                GameApiClient.health(GameConfig.getApiBaseUrl(this),
                        (ok, code, body, message) -> Toast.makeText(this,
                                (ok ? "API OK: " : "API unavailable: ") + message,
                                Toast.LENGTH_LONG).show());
            });
        });
        dialog.show();
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        super.onSaveInstanceState(state);
        if (webView != null) webView.saveState(state);
    }

    @Override public void onBackPressed() {
        if (offlinePanel != null && offlinePanel.getVisibility() == View.VISIBLE) {
            offlinePanel.setVisibility(View.GONE);
            loadGame();
        } else if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
