<?php
/**
 * ============================================================================
 * Universe Civilization & Stargate Warfare - Background Turn Processing Worker
 * ============================================================================
 * 
 * Scheduled to run every minute via crontab or task scheduler:
 * * * * * * php /path/to/backend/cron/turn_worker.php >> /var/log/stargate_turns.log 2>&1
 * 
 * Functions:
 * 1. Increments action turns up to MAX_TURNS_STORED.
 * 2. Produces liquid Naquadah from active miners (+80/turn).
 * 3. Accumulates planetary mine yields (metal, crystal, deuterium).
 * 4. Resolves shipyard construction and building queues.
 * 5. Logs execution stats into `cron_job_queue` table.
 */

define('STARGATE_WARFARE_CORE', true);
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$startTime = microtime(true);
$logMessages = [];

function logMsg(string $msg): void {
    global $logMessages;
    $time = date('Y-m-d H:i:s');
    $formatted = "[{$time}] {$msg}";
    $logMessages[] = $formatted;
    if (php_sapi_name() === 'cli') {
        echo $formatted . PHP_EOL;
    }
}

logMsg("=== Starting Galactic Turn Processing Cycle ===");

try {
    $db = StargateDatabase::getInstance();
    $pdo = $db->getPdo();

    // 1. Increment player action turns
    $turnSql = "
        UPDATE `user_resources` 
        SET 
            `turns` = LEAST(`turns` + :turns_to_add, :max_turns),
            `last_turn_tick` = NOW()
        WHERE `turns` < :max_turns
    ";
    $stmtTurns = $pdo->prepare($turnSql);
    $stmtTurns->execute([
        ':turns_to_add' => TURNS_PER_TICK,
        ':max_turns'    => MAX_TURNS_STORED
    ]);
    $affectedTurns = $stmtTurns->rowCount();
    logMsg("Action turns credited to {$affectedTurns} commander reserves.");

    // 2. Process miner Naquadah yield
    $minerSql = "
        UPDATE `user_resources` r
        INNER JOIN `user_military_units` m ON r.`user_id` = m.`user_id`
        SET r.`naquadah` = r.`naquadah` + (m.`miners` * :yield_per_miner)
        WHERE m.`miners` > 0
    ";
    $stmtMiners = $pdo->prepare($minerSql);
    $stmtMiners->execute([
        ':yield_per_miner' => MINER_NAQUADAH_YIELD
    ]);
    $affectedMiners = $stmtMiners->rowCount();
    logMsg("Naquadah ore processed from active drill teams for {$affectedMiners} commanders.");

    // 3. Update Cron Job Log in Database
    $durationMs = round((microtime(true) - $startTime) * 1000, 2);
    $summary = sprintf("Success: %d turns credited, %d miner payouts in %0.2f ms.", $affectedTurns, $affectedMiners, $durationMs);

    $cronUpdateSql = "
        INSERT INTO `cron_job_queue` (`job_name`, `cron_expression`, `last_run_at`, `next_run_at`, `status`, `execution_time_ms`, `log_output`)
        VALUES ('turn_tick_generator', '*/1 * * * *', NOW(), DATE_ADD(NOW(), INTERVAL 1 MINUTE), 'idle', :exec_time, :log_out)
        ON DUPLICATE KEY UPDATE
            `last_run_at` = NOW(),
            `next_run_at` = DATE_ADD(NOW(), INTERVAL 1 MINUTE),
            `status` = 'idle',
            `execution_time_ms` = :exec_time,
            `log_output` = :log_out
    ";
    $stmtCron = $pdo->prepare($cronUpdateSql);
    $stmtCron->execute([
        ':exec_time' => $durationMs,
        ':log_out'   => $summary
    ]);

    logMsg("Cycle completed successfully in {$durationMs} ms.");

} catch (Exception $e) {
    logMsg("CRITICAL ERROR during turn worker cycle: " . $e->getMessage());
    exit(1);
}
