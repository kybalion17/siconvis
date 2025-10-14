<?php

namespace SAGAUT\Utils;

use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;
use Exception;

class JWT
{
    private static string $secret;
    private static string $algorithm;
    private static int $expiration;

    public static function init(): void
    {
        $config = require __DIR__ . '/../../config/app.php';
        self::$secret = $config['jwt']['secret'];
        self::$algorithm = $config['jwt']['algorithm'];
        self::$expiration = $config['jwt']['expiration'];
    }

    public static function encode(array $payload): string
    {
        self::init();
        
        $payload['iat'] = time();
        $payload['exp'] = time() + self::$expiration;
        
        return FirebaseJWT::encode($payload, self::$secret, self::$algorithm);
    }

    public static function decode(string $token): array
    {
        self::init();
        
        try {
            $decoded = FirebaseJWT::decode($token, new Key(self::$secret, self::$algorithm));
            return (array) $decoded;
        } catch (Exception $e) {
            throw new Exception('Token inválido: ' . $e->getMessage());
        }
    }

    public static function validate(string $token): bool
    {
        try {
            self::decode($token);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function getPayload(string $token): ?array
    {
        try {
            return self::decode($token);
        } catch (Exception $e) {
            return null;
        }
    }
}
