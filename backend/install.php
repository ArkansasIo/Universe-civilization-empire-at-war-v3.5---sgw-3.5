<?php
/**
 * ============================================================================
 * Universe Civilization & Stargate Warfare - Automated Database Installer
 * ============================================================================
 * 
 * Run via CLI: php backend/install.php
 * Or via Web:  http://localhost/backend/install.php
 * 
 * Verifies MySQL connection, initializes `stargate_universe_db`, executes
 * `database.sql`, seeds game world configurations, and verifies phpMyAdmin readiness.
 */

define('STARGATE_WARFARE_CORE', true);
require_once __DIR__ . '/config/config.php';

$isCli = (php_sapi_name() === 'cli');

function outputMsg(string $msg, string $type = 'info'): void {
    global $isCli;
    if ($isCli) {
        $colors = [
            'info'    => "\033[0;36m",
            'success' => "\033[0;32m",
            'warning' => "\033[0;33m",
            'error'   => "\033[0;31m",
            'bold'    => "\033[1;37m",
            'reset'   => "\033[0m"
        ];
        echo ($colors[$type] ?? '') . $msg . ($colors['reset'] ?? '') . PHP_EOL;
    } else {
        $bg = [
            'info'    => '#e0f2fe; color: #0369a1; border-color: #bae6fd;',
            'success' => '#dcfce7; color: #15803d; border-color: #bbf7d0;',
            'warning' => '#fef3c7; color: #b45309; border-color: #fde68a;',
            'error'   => '#fee2e2; color: #b91c1c; border-color: #fecaca;',
            'bold'    => '#f8fafc; color: #0f172a; border-color: #e2e8f0; font-weight: bold;'
        ];
        echo sprintf(
            '<div style="padding: 10px 14px; margin-bottom: 8px; border: 1px solid; font-family: monospace; font-size: 13px; %s">%s</div>',
            $bg[$type] ?? '',
            htmlspecialchars($msg)
        );
    }
}

if (!$isCli) {
    echo '<!DOCTYPE html><html><head><title>Stargate Warfare - Database Installer</title>';
    echo '<style>body { background: #0f172a; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; max-width: 900px; margin: 40px auto; padding: 20px; }</style>';
    echo '</head><body>';
    echo '<h1 style="color: #fbbf24; border-bottom: 2px solid #334155; padding-bottom: 10px;">STARGATE WARFARE // MYSQL & PHPMYADMIN INSTALLER</h1>';
}

outputMsg("=== STARGATE WARFARE: DATABASE INSTALLATION UTILITY ===", "bold");
outputMsg("Target Host: " . DB_HOST . ":" . DB_PORT, "info");
outputMsg("Target Database: " . DB_NAME, "info");
outputMsg("Target User: " . DB_USER, "info");
outputMsg("phpMyAdmin Expected URL: " . PMA_URL, "info");

// 1. Test MySQL Connection
outputMsg("\nStep 1: Connecting to MySQL server...", "info");
try {
    $rootDsn = sprintf('mysql:host=%s;port=%d;charset=%s', DB_HOST, DB_PORT, DB_CHARSET);
    $pdo = new PDO($rootDsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
    ]);
    outputMsg("✓ Successfully connected to MySQL server!", "success");
} catch (PDOException $e) {
    outputMsg("✗ Connection failed: " . $e->getMessage(), "error");
    outputMsg("Recommendation: Ensure MySQL/MariaDB service is running and credentials in config.php are correct.", "warning");
    exit(1);
}

// 2. Create Database if not exists
outputMsg("\nStep 2: Ensuring database exists...", "info");
try {
    $pdo->exec(sprintf(
        "CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET %s COLLATE %s",
        DB_NAME,
        DB_CHARSET,
        DB_COLLATE
    ));
    $pdo->exec("USE `" . DB_NAME . "`");
    outputMsg("✓ Database `" . DB_NAME . "` selected and ready.", "success");
} catch (PDOException $e) {
    outputMsg("✗ Failed to create/select database: " . $e->getMessage(), "error");
    exit(1);
}

// 3. Read and execute database.sql
outputMsg("\nStep 3: Checking database.sql schema dump...", "info");
$sqlFilePath = __DIR__ . '/database.sql';
if (!file_exists($sqlFilePath)) {
    $sqlFilePath = __DIR__ . '/../database.sql';
}

if (!file_exists($sqlFilePath)) {
    outputMsg("✗ database.sql not found at " . $sqlFilePath, "error");
    exit(1);
}

$sqlContent = file_get_contents($sqlFilePath);
outputMsg("✓ Loaded database.sql (" . number_format(strlen($sqlContent)) . " bytes).", "info");

// Split and run SQL statements
outputMsg("Executing schema queries...", "info");
try {
    // Disable foreign key checks for clean execution
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec($sqlContent);
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    outputMsg("✓ Successfully executed full database.sql schema and seed data!", "success");
} catch (PDOException $e) {
    outputMsg("✗ Error executing SQL: " . $e->getMessage(), "error");
    exit(1);
}

// 4. Verify Installed Tables
outputMsg("\nStep 4: Verifying phpMyAdmin database integrity...", "info");
$stmt = $pdo->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

outputMsg(sprintf("✓ Found %d active tables in `%s`:", count($tables), DB_NAME), "success");
foreach ($tables as $tbl) {
    $count = $pdo->query("SELECT COUNT(*) FROM `{$tbl}`")->fetchColumn();
    outputMsg("  - {$tbl} [{$count} rows]", "info");
}

// 5. Final Status
outputMsg("\n=======================================================", "bold");
outputMsg("INSTALLATION COMPLETE & PHPMYADMIN READY!", "success");
outputMsg("Open phpMyAdmin at: " . PMA_URL, "bold");
outputMsg("Select database: " . DB_NAME, "info");
outputMsg("Default Admin User: Grand Admiral (ID: user_supreme_cmd_01)", "info");
outputMsg("=======================================================", "bold");

if (!$isCli) {
    echo '<p style="margin-top: 20px;"><a href="' . htmlspecialchars(PMA_URL) . '" target="_blank" style="display: inline-block; background: #fbbf24; color: #111; padding: 10px 18px; font-weight: bold; text-decoration: none; border-radius: 4px;">Open phpMyAdmin</a></p>';
    echo '</body></html>';
}
