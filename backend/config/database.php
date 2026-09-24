<?php
/**
 * ============================================================================
 * Universe Civilization & Stargate Warfare - Database Connection Abstraction
 * ============================================================================
 * 
 * Provides robust PDO connection handling, transaction management, prepared
 * statements execution, error logging, and phpMyAdmin verification.
 */

require_once __DIR__ . '/config.php';

class StargateDatabase {
    private static ?StargateDatabase $instance = null;
    private ?PDO $pdo = null;
    private bool $inTransaction = false;

    /**
     * Private constructor enforces Singleton pattern
     */
    private function __construct() {
        $this->connect();
    }

    /**
     * Get Singleton Instance
     */
    public static function getInstance(): StargateDatabase {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Establish PDO connection with UTF-8 and strict error handling
     */
    private function connect(): void {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE " . DB_COLLATE,
            PDO::ATTR_PERSISTENT         => false,
        ];

        try {
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // If database does not exist yet, try connecting without dbname
            if ($e->getCode() === 1049) {
                $this->attemptCreateDatabase();
            } else {
                $this->logError("Database Connection Failed: " . $e->getMessage());
                throw new RuntimeException("Could not connect to MySQL server. Please verify credentials or import database.sql into phpMyAdmin.");
            }
        }
    }

    /**
     * Attempt automatic database creation if missing
     */
    private function attemptCreateDatabase(): void {
        try {
            $rootDsn = sprintf('mysql:host=%s;port=%d;charset=%s', DB_HOST, DB_PORT, DB_CHARSET);
            $rootPdo = new PDO($rootDsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $rootPdo->exec(sprintf(
                "CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET %s COLLATE %s",
                DB_NAME,
                DB_CHARSET,
                DB_COLLATE
            ));
            
            // Re-attempt connection
            $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            $this->logError("Auto-create Database Failed: " . $e->getMessage());
            throw new RuntimeException("Database '" . DB_NAME . "' does not exist. Please create it or import backend/database.sql in phpMyAdmin.");
        }
    }

    /**
     * Get Raw PDO Handle
     */
    public function getPdo(): PDO {
        if ($this->pdo === null) {
            $this->connect();
        }
        return $this->pdo;
    }

    /**
     * Execute parameterized query
     */
    public function query(string $sql, array $params = []): PDOStatement {
        try {
            $stmt = $this->getPdo()->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            $this->logError("Query execution failed: " . $e->getMessage() . " | SQL: " . $sql);
            throw $e;
        }
    }

    /**
     * Fetch all matching records
     */
    public function fetchAll(string $sql, array $params = []): array {
        return $this->query($sql, $params)->fetchAll();
    }

    /**
     * Fetch single record or null
     */
    public function fetchOne(string $sql, array $params = []): ?array {
        $result = $this->query($sql, $params)->fetch();
        return $result !== false ? $result : null;
    }

    /**
     * Fetch single scalar value
     */
    public function fetchValue(string $sql, array $params = []): mixed {
        return $this->query($sql, $params)->fetchColumn();
    }

    /**
     * Insert record helper
     */
    public function insert(string $table, array $data): string {
        $columns = array_keys($data);
        $placeholders = array_map(fn($col) => ':' . $col, $columns);
        
        $sql = sprintf(
            "INSERT INTO `%s` (`%s`) VALUES (%s)",
            $table,
            implode('`, `', $columns),
            implode(', ', $placeholders)
        );

        $params = [];
        foreach ($data as $key => $value) {
            $params[':' . $key] = $value;
        }

        $this->query($sql, $params);
        return $this->getPdo()->lastInsertId();
    }

    /**
     * Update record helper
     */
    public function update(string $table, array $data, string $whereClause, array $whereParams = []): int {
        $setClauses = [];
        $params = [];

        foreach ($data as $col => $val) {
            $paramKey = ':set_' . $col;
            $setClauses[] = sprintf("`%s` = %s", $col, $paramKey);
            $params[$paramKey] = $val;
        }

        $sql = sprintf(
            "UPDATE `%s` SET %s WHERE %s",
            $table,
            implode(', ', $setClauses),
            $whereClause
        );

        foreach ($whereParams as $key => $val) {
            $params[$key] = $val;
        }

        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    /**
     * Begin Database Transaction
     */
    public function beginTransaction(): bool {
        if (!$this->inTransaction) {
            $this->inTransaction = $this->getPdo()->beginTransaction();
        }
        return $this->inTransaction;
    }

    /**
     * Commit Database Transaction
     */
    public function commit(): bool {
        if ($this->inTransaction) {
            $committed = $this->getPdo()->commit();
            $this->inTransaction = false;
            return $committed;
        }
        return false;
    }

    /**
     * Rollback Database Transaction
     */
    public function rollBack(): bool {
        if ($this->inTransaction) {
            $rolled = $this->getPdo()->rollBack();
            $this->inTransaction = false;
            return $rolled;
        }
        return false;
    }

    /**
     * Check Database Health and Tables Count
     */
    public function getSystemHealth(): array {
        try {
            $tables = $this->fetchAll("SHOW TABLES");
            $tableList = array_map(fn($row) => array_values($row)[0], $tables);
            
            $userCount = in_array('users', $tableList) 
                ? (int)$this->fetchValue("SELECT COUNT(*) FROM `users`") 
                : 0;

            $serverVersion = $this->getPdo()->getAttribute(PDO::ATTR_SERVER_VERSION);

            return [
                'status' => 'ONLINE',
                'database' => DB_NAME,
                'tables_count' => count($tableList),
                'tables' => $tableList,
                'user_count' => $userCount,
                'server_version' => $serverVersion,
                'phpmyadmin_compatible' => true,
            ];
        } catch (Exception $e) {
            return [
                'status' => 'ERROR',
                'error' => $e->getMessage(),
                'phpmyadmin_compatible' => false,
            ];
        }
    }

    /**
     * Error logger helper
     */
    private function logError(string $message): void {
        error_log(sprintf('[%s] [STARGATE-DB] %s', date('Y-m-d H:i:s'), $message));
    }
}

/**
 * Global helper function to get database instance
 */
function db(): StargateDatabase {
    return StargateDatabase::getInstance();
}
