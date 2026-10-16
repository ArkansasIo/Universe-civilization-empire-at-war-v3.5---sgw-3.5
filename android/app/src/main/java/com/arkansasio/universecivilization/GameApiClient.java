package com.arkansasio.universecivilization;

import android.os.Handler;
import android.os.Looper;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Small HTTPS-only JSON client for the documented /api/v1 contract.
 * No credentials are embedded in the APK. Calls are asynchronous and must be
 * backed by a deployed server implementing API_CONTRACT.md.
 */
public final class GameApiClient {
    public interface Callback {
        void onComplete(boolean success, int statusCode, JSONObject body, String message);
    }

    private static final ExecutorService EXECUTOR = Executors.newFixedThreadPool(2);
    private static final Handler MAIN = new Handler(Looper.getMainLooper());

    private GameApiClient() {}

    public static void health(String baseUrl, Callback callback) {
        request(baseUrl, "/health", null, callback);
    }

    public static void get(String baseUrl, String path, String bearerToken, Callback callback) {
        request(baseUrl, path, bearerToken, callback);
    }

    public static void post(String baseUrl, String path, JSONObject payload,
                            String bearerToken, Callback callback) {
        request(baseUrl, path, payload, bearerToken, callback);
    }

    private static void request(String baseUrl, String path, JSONObject payload, Callback callback) {
        request(baseUrl, path, payload, null, callback);
    }

    private static void request(String baseUrl, String path, JSONObject payload,
                                String bearerToken, Callback callback) {
        EXECUTOR.execute(() -> {
            HttpURLConnection connection = null;
            boolean success = false;
            int status = 0;
            JSONObject body = new JSONObject();
            String message = "Unable to connect to the game API.";
            try {
                String base = baseUrl == null ? "" : baseUrl.trim().replaceAll("/+$", "");
                if (!base.startsWith("https://")) {
                    throw new IllegalArgumentException("Configure an HTTPS API base URL first.");
                }
                if (path == null || !path.startsWith("/") || path.startsWith("//")) {
                    throw new IllegalArgumentException("Invalid API route.");
                }
                URL url = new URL(base + path);
                if (!"https".equalsIgnoreCase(url.getProtocol())) {
                    throw new IllegalArgumentException("Only HTTPS connections are allowed.");
                }
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod(payload == null ? "GET" : "POST");
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                connection.setRequestProperty("Accept", "application/json");
                if (bearerToken != null && !bearerToken.trim().isEmpty()) {
                    connection.setRequestProperty("Authorization", "Bearer " + bearerToken.trim());
                }
                if (payload != null) {
                    connection.setDoOutput(true);
                    connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                    byte[] bytes = payload.toString().getBytes(StandardCharsets.UTF_8);
                    connection.getOutputStream().write(bytes);
                }
                status = connection.getResponseCode();
                InputStream stream = status >= 200 && status < 400
                        ? connection.getInputStream() : connection.getErrorStream();
                if (stream != null) {
                    StringBuilder text = new StringBuilder();
                    try (BufferedReader reader = new BufferedReader(
                            new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                        String line;
                        while ((line = reader.readLine()) != null) text.append(line);
                    }
                    if (text.length() > 0) body = new JSONObject(text.toString());
                }
                success = status >= 200 && status < 300;
                message = success ? "API request succeeded."
                        : body.optJSONObject("error") != null
                        ? body.optJSONObject("error").optString("message", "API request failed.")
                        : "API returned HTTP " + status + ".";
            } catch (Exception e) {
                message = e.getMessage() == null ? "API request failed." : e.getMessage();
            } finally {
                if (connection != null) connection.disconnect();
            }
            final boolean ok = success;
            final int code = status;
            final JSONObject response = body;
            final String resultMessage = message;
            MAIN.post(() -> callback.onComplete(ok, code, response, resultMessage));
        });
    }
}
