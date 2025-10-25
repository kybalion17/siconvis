# 👥 SICONVIS - Sistema de Control de Visitantes

Sistema moderno de control de visitantes desarrollado con PHP backend y React frontend, basado en el sistema SAGAUT original.

## 🚀 Características Principales

- **Backend PHP 8.1+** con arquitectura moderna
- **Frontend React 18** con TypeScript
- **Base de datos MySQL 8.0** optimizada
- **Autenticación JWT** segura
- **APIs RESTful** bien documentadas
- **Dashboard interactivo** con métricas
- **Gestión completa** de visitantes y departamentos
- **Sistema de registro** de visitas
- **Reportes avanzados** y análisis

## 📁 Estructura del Proyecto

```
SICONVIS/
├── backend/                 # API PHP
│   ├── app/
│   │   ├── Controllers/     # Controladores API
│   │   ├── Models/          # Modelos de datos
│   │   ├── Services/        # Lógica de negocio
│   │   ├── Middleware/      # Autenticación, CORS
│   │   └── Utils/           # Utilidades
│   ├── config/              # Configuración
│   ├── database/            # Migraciones
│   ├── public/              # Punto de entrada
│   └── tests/               # Tests unitarios
├── frontend/                # React App
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # APIs y servicios
│   │   └── utils/           # Utilidades
│   └── public/
├── database/                # Scripts de base de datos
└── docs/                    # Documentación
```

## 🛠️ Instalación

### Requisitos Previos

- PHP 8.1 o superior
- MySQL 8.0 o superior
- Composer
- Node.js 18+ y npm
- Servidor web (Apache/Nginx)

### Backend (PHP)

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd SICONVIS/backend
   ```

2. **Instalar dependencias**
   ```bash
   composer install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Configurar base de datos**
   ```bash
   # Ejecutar el script de migración
   mysql -u root -p < ../database/migrate.sql
   ```

5. **Iniciar servidor de desarrollo**
   ```bash
   composer serve
   # O usar: php -S localhost:8000 -t public
   ```

### Frontend (React)

1. **Navegar al directorio frontend**
   ```bash
   cd ../frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Aplicación
APP_NAME="SICONVIS"
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de Datos
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=siconvis
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📚 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener usuario actual
- `POST /auth/refresh` - Renovar token

### Visitantes
- `GET /visitantes` - Listar visitantes
- `GET /visitantes/{id}` - Obtener visitante
- `POST /visitantes` - Crear visitante
- `PUT /visitantes/{id}` - Actualizar visitante
- `DELETE /visitantes/{id}` - Eliminar visitante
- `GET /visitantes/cedula` - Buscar por cédula
- `POST /visitantes/{id}/marcar-solicitado` - Marcar como solicitado

### Departamentos
- `GET /departamentos` - Listar departamentos
- `GET /departamentos/{id}` - Obtener departamento
- `POST /departamentos` - Crear departamento
- `PUT /departamentos/{id}` - Actualizar departamento
- `DELETE /departamentos/{id}` - Eliminar departamento
- `GET /departamentos/activos` - Listar activos
- `POST /departamentos/{id}/activar` - Activar departamento

### Dashboard
- `GET /dashboard/stats` - Estadísticas generales
- `GET /dashboard/reports` - Reportes detallados
- `GET /dashboard/alertas` - Alertas del sistema

## 🎯 Módulos del Sistema

### 1. Gestión de Visitantes
- Registro completo de visitantes
- Información personal y contacto
- Control de estado (solicitado/pendiente)
- Búsqueda por cédula
- Historial de visitas

### 2. Gestión de Departamentos
- Registro de departamentos
- Información del responsable
- Control de estado (activo/inactivo)
- Contactos y ubicación
- Estadísticas de visitas

### 3. Sistema de Visitas
- Registro de entrada y salida
- Control de motivos de visita
- Seguimiento de duración
- Historial completo
- Reportes de visitas

### 4. Dashboard y Métricas
- Estadísticas en tiempo real
- Gráficos de visitas por departamento
- Métricas de visitantes
- Alertas automáticas
- Reportes personalizables

### 5. Sistema de Alertas
- Visitantes sin foto
- Visitas prolongadas
- Departamentos inactivos
- Visitantes solicitados
- Notificaciones en tiempo real

## 📊 Dashboard y Reportes

- **Métricas en tiempo real** de visitantes y departamentos
- **Gráficos interactivos** de visitas y tendencias
- **Reportes personalizables** por período
- **Alertas automáticas** de situaciones especiales
- **Análisis de patrones** de visitas

## 🔒 Seguridad

- Autenticación JWT segura
- Validación de datos robusta
- CORS configurado correctamente
- Headers de seguridad
- Validación de entrada en todas las APIs

## 🧪 Testing

```bash
# Backend
cd backend
composer test

# Frontend
cd frontend
npm test
```

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Arquitecto de Software**: [Tu Nombre]
- **Diseñador UX/UI**: [Tu Nombre]

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@siconvis.com
- Documentación: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/tu-usuario/siconvis/issues)

---

**SICONVIS** - Transformando el control de visitantes 👥✨