<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Configuracion extends BaseModel
{
    protected string $table = 'trmaconfiguracion';
    protected array $fillable = [
        'clave', 'valor', 'descripcion', 'tipo', 'activo'
    ];

    /**
     * Obtener configuración por clave
     */
    public static function getByClave($clave)
    {
        return self::where('clave', $clave)
                  ->where('activo', true)
                  ->first();
    }

    /**
     * Obtener valor de configuración por clave
     */
    public static function getValor($clave, $default = null)
    {
        $config = self::getByClave($clave);
        
        if (!$config) {
            return $default;
        }

        // Convertir valor según el tipo
        switch ($config->tipo) {
            case 'number':
                return (float) $config->valor;
            case 'boolean':
                return $config->valor === 'true' || $config->valor === '1';
            case 'json':
                return json_decode($config->valor, true);
            default:
                return $config->valor;
        }
    }

    /**
     * Establecer valor de configuración
     */
    public static function setValor($clave, $valor, $tipo = 'string', $descripcion = null)
    {
        $config = self::where('clave', $clave)->first();
        
        if (!$config) {
            $config = new self();
            $config->clave = $clave;
        }

        $config->valor = $valor;
        $config->tipo = $tipo;
        $config->descripcion = $descripcion;
        $config->activo = true;
        
        return $config->save();
    }

    /**
     * Obtener todas las configuraciones activas
     */
    public static function getActivas()
    {
        return self::where('activo', true)
                  ->orderBy('clave')
                  ->get();
    }

    /**
     * Obtener configuraciones por tipo
     */
    public static function getByTipo($tipo)
    {
        return self::where('tipo', $tipo)
                  ->where('activo', true)
                  ->orderBy('clave')
                  ->get();
    }

    /**
     * Validar valor según el tipo
     */
    public function validateValue()
    {
        switch ($this->tipo) {
            case 'number':
                return is_numeric($this->valor);
            case 'boolean':
                return in_array($this->valor, ['true', 'false', '1', '0']);
            case 'json':
                json_decode($this->valor);
                return json_last_error() === JSON_ERROR_NONE;
            case 'string':
            default:
                return is_string($this->valor);
        }
    }

    /**
     * Obtener valor convertido según el tipo
     */
    public function getConvertedValue()
    {
        switch ($this->tipo) {
            case 'number':
                return (float) $this->valor;
            case 'boolean':
                return $this->valor === 'true' || $this->valor === '1';
            case 'json':
                return json_decode($this->valor, true);
            default:
                return $this->valor;
        }
    }

    /**
     * Scope para configuraciones activas
     */
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para configuraciones por tipo
     */
    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }
}
