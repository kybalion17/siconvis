<?php

return [
    'name' => $_ENV['APP_NAME'] ?? 'SAGAUT Modern',
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'debug' => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN),
    'url' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
    
    'jwt' => [
        'secret' => $_ENV['JWT_SECRET'] ?? 'default-secret-key',
        'algorithm' => $_ENV['JWT_ALGORITHM'] ?? 'HS256',
        'expiration' => (int)($_ENV['JWT_EXPIRATION'] ?? 86400), // 24 horas
    ],
    
    'cors' => [
        'allowed_origins' => explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:3000,http://localhost:5173,http://localhost:5174'),
        'allowed_methods' => explode(',', $_ENV['CORS_ALLOWED_METHODS'] ?? 'GET,POST,PUT,DELETE,OPTIONS'),
        'allowed_headers' => explode(',', $_ENV['CORS_ALLOWED_HEADERS'] ?? 'Content-Type,Authorization,X-Requested-With'),
    ],
    
    'upload' => [
        'path' => $_ENV['UPLOAD_PATH'] ?? '../uploads/',
        'max_size' => (int)($_ENV['MAX_FILE_SIZE'] ?? 10485760), // 10MB
    ],
    
    'logging' => [
        'level' => $_ENV['LOG_LEVEL'] ?? 'info',
        'file' => $_ENV['LOG_FILE'] ?? '../logs/sagaut.log',
    ]
];
