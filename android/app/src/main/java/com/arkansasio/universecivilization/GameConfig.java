package com.arkansasio.universecivilization;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;

/** Central configuration for the hosted game and optional API service. */
public final class GameConfig {
    private static final String PREFS = "universe_civilization_config";
    private static final String KEY_API_BASE = "api_base_url";
    public static final String GAME_URL =
            "https://arkansasio.github.io/Universe-civilization-empire-at-war-v3.5---sgw-3.5/";
    private static final String DEFAULT_API_BASE = "";

    private GameConfig() {}

    public static String getApiBaseUrl(Context context) {
        return preferences(context).getString(KEY_API_BASE, DEFAULT_API_BASE).trim();
    }

    public static boolean saveApiBaseUrl(Context context, String value) {
        String normalized = value == null ? "" : value.trim();
        if (!normalized.isEmpty()) {
            Uri uri = Uri.parse(normalized);
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null
                    || uri.getUserInfo() != null) {
                return false;
            }
            normalized = normalized.replaceAll("/+$", "");
        }
        preferences(context).edit().putString(KEY_API_BASE, normalized).apply();
        return true;
    }

    private static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
