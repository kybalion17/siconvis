<?php

namespace SAGAUT\Utils;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;
    private static array $config = [];

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            self::loadConfig();
            self::connect();
        }
        
        return self::$instance;
    }

    private static function loadConfig(): void
    {
        self::$config = require __DIR__ . '/../../config/database.php';
    }

    private static function connect(): void
    {
        try {
            $config = self::$config['connections']['mysql'];
            
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $config['host'],
                $config['port'],
                $config['database'],
                $config['charset']
            );

            self::$instance = new PDO(
                $dsn,
                $config['username'],
                $config['password'],
                $config['options']
            );

        } catch (PDOException $e) {
            throw new PDOException("Error de conexión a la base de datos: " . $e->getMessage());
        }
    }

    public static function query(string $sql, array $params = []): \PDOStatement
    {
        $pdo = self::getInstance();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public static function fetchAll(string $sql, array $params = []): array
    {
        return self::query($sql, $params)->fetchAll();
    }

    public static function fetchOne(string $sql, array $params = []): ?array
    {
        $result = self::query($sql, $params)->fetch();
        return $result ?: null;
    }

    public static function lastInsertId(): string
    {
        return self::getInstance()->lastInsertId();
    }

    public static function beginTransaction(): bool
    {
        return self::getInstance()->beginTransaction();
    }

    public static function commit(): bool
    {
        return self::getInstance()->commit();
    }

    public static function rollback(): bool
    {
        return self::getInstance()->rollBack();
    }
}
