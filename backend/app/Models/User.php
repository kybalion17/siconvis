<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class User extends BaseModel
{
    protected string $table = 'trmausuarios';
    protected string $primaryKey = 'id';

    protected array $fillable = [
        'nombre',
        'apellido',
        'cedula',
        'login',
        'clave',
        'perfil',
        'primer_ingreso',
        'status',
        'cuenta',
        'eliminado'
    ];

    protected array $hidden = ['password'];

    public function authenticate(string $login, string $password): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE login = ? AND status = 0 AND eliminado = 0";
        $user = Database::fetchOne($sql, [$login]);

        if (!$user) {
            return null;
        }

        // Verificar contraseña (asumiendo que está hasheada)
        if (password_verify($password, $user['clave'])) {
            return $this->hideFields($user);
        }

        return null;
    }

    public function findByLogin(string $login): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE login = ?";
        $user = Database::fetchOne($sql, [$login]);
        
        return $user ? $this->hideFields($user) : null;
    }

    public function updatePassword(int $id, string $newPassword): bool
    {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        return $this->update($id, ['password' => $hashedPassword]);
    }

    public function getActiveUsers(): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE status = 0 AND eliminado = 0";
        $users = Database::fetchAll($sql);
        
        return array_map([$this, 'hideFields'], $users);
    }

    public function getUsersByProfile(int $profileId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE perfil = ? AND status = 0 AND eliminado = 0";
        $users = Database::fetchAll($sql, [$profileId]);

        return array_map([$this, 'hideFields'], $users);
    }

    public function updateLastLogin(int $id): bool
    {
        return $this->update($id, ['primer_ingreso' => 0]);
    }
}
