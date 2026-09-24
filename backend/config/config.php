<?php
/**
 * ============================================================================
 * Universe Civilization & Stargate Warfare - Master Configuration System
 * ============================================================================
 * 
 * Provides global settings, database credentials, tick engine parameters,
 * security tokens, and phpMyAdmin integration definitions.
 * 
 * Compatible with PHP 7.4+, 8.0+, 8.1+, 8.2+, 8.3+
 */

// Prevent direct script execution if accessed outside root index or CLI
if (!defined('STARGATE_WARFARE_CORE') && php_sapi_name() !== 'cli' && basename($_SERVER['SCRIPT_FILENAME']) === 'config.php') {
    http_response_code(403);
    die(json_encode(['error' => 'Direct access forbidden.']));
}

// ----------------------------------------------------------------------------
// 1. APPLICATION ENVIRONMENT
// ----------------------------------------------------------------------------
define('APP_NAME', 'Stargate Warfare: Milky Way & Pegasus');
define('APP_VERSION', '4.5.0-MMORPG-EXPANSION');
define('APP_ENV', getenv('APP_ENV') ?: 'production'); // 'development' or 'production'

// Error Reporting
if (APP_ENV === 'development') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);
}

// Set Default Timezone (UTC for deterministic galactic ticks)
date_default_timezone_set('UTC');

// ----------------------------------------------------------------------------
// 2. MYSQL & MARIADB DATABASE CREDENTIALS (phpMyAdmin Compatible)
// ----------------------------------------------------------------------------
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', (int)(getenv('DB_PORT') ?: 3306));
define('DB_NAME', getenv('DB_NAME') ?: 'stargate_universe_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');

// Optional Table Prefix (Default none for clean phpMyAdmin tables)
define('DB_PREFIX', '');

// ----------------------------------------------------------------------------
// 3. PHPMYADMIN INTEGRATION CONFIGURATION
// ----------------------------------------------------------------------------
// Default phpMyAdmin URL location on local dev stack (XAMPP / WAMP / Laragon / Docker)
define('PMA_URL', getenv('PMA_URL') ?: 'http://localhost/phpmyadmin/');
define('PMA_SERVER_INDEX', 1);
define('PMA_DATABASE_TARGET', DB_NAME);

// ----------------------------------------------------------------------------
// 4. GAME ENGINE & TICK GENERATOR SETTINGS
// ----------------------------------------------------------------------------
define('TICK_INTERVAL_SECONDS', 60);         // 1 minute per engine cycle
define('TURNS_PER_TICK', 1);                 // Turns awarded per cycle
define('MAX_TURNS_STORED', 3000);            // Maximum banked turns
define('MINER_NAQUADAH_YIELD', 80);          // Naquadah generated per miner/turn
define('BANK_INTEREST_RATE_PERCENT', 2.5);   // Interest rate per 24 hours
define('PROTECTION_HOURS_NEWBIE', 72);       // Hours of rookie protection
define('MAX_COLONIES_PER_COMMANDER', 9);     // Max settleable planets

// Starting Allocations for New Recruits
define('STARTING_NAQUADAH', 100000);
define('STARTING_CRYSTAL', 50000);
define('STARTING_TRINIUM', 25000);
define('STARTING_TURNS', 150);
define('STARTING_UNITS', 500);

// ----------------------------------------------------------------------------
// 5. SECURITY & AUTHENTICATION SECRETS
// ----------------------------------------------------------------------------
define('APP_SECRET_KEY', getenv('APP_SECRET_KEY') ?: 'sgc_ancient_zpm_subspace_secret_key_88410');
define('PASSWORD_HASH_ALGO', PASSWORD_BCRYPT);
define('PASSWORD_HASH_COST', 12);
define('SESSION_LIFETIME_SECONDS', 86400 * 7); // 7-day persistent commander session

// ----------------------------------------------------------------------------
// 6. GLOBAL HELPER FUNCTIONS
// ----------------------------------------------------------------------------

/**
 * Returns configuration dictionary as an associative array.
 */
function get_stargate_game_config() {
    return [
        'app_name' => APP_NAME,
        'app_version' => APP_VERSION,
        'environment' => APP_ENV,
        'database' => [
            'host' => DB_HOST,
            'port' => DB_PORT,
            'database' => DB_NAME,
            'user' => DB_USER,
            'charset' => DB_CHARSET,
            'phpmyadmin_url' => PMA_URL,
        ],
        'gameplay' => [
            'tick_rate' => TICK_INTERVAL_SECONDS,
            'turns_per_tick' => TURNS_PER_TICK,
            'max_turns' => MAX_TURNS_STORED,
            'miner_yield' => MINER_NAQUADAH_YIELD,
            'bank_interest' => BANK_INTEREST_RATE_PERCENT,
        ],
        'starting_resources' => [
            'naquadah' => STARTING_NAQUADAH,
            'crystal' => STARTING_CRYSTAL,
            'trinium' => STARTING_TRINIUM,
            'turns' => STARTING_TURNS,
            'recruits' => STARTING_UNITS,
        ]
    ];
}
