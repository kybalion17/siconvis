# 🚗 SICONFLOT - Sistema Control de Flota

Sistema moderno de control de flota vehicular desarrollado con PHP backend y React frontend, basado en el sistema SAGAUT original.

## 🚀 Características Principales

- **Backend PHP 8.1+** con arquitectura moderna
- **Frontend React 18** con TypeScript
- **Base de datos MySQL 8.0** optimizada
- **Autenticación JWT** segura
- **APIs RESTful** bien documentadas
- **Dashboard interactivo** con métricas
- **Gestión completa** de vehículos, choferes y asignaciones
- **Sistema de mantenimiento** y seguros
- **Reportes avanzados** y análisis

## 📁 Estructura del Proyecto

```
SICONFLOT/
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
   cd SICONFLOT/backend
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
APP_NAME="SAGAUT Modern"
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de Datos
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=sagaut_modern
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

### Vehículos
- `GET /vehiculos` - Listar vehículos
- `GET /vehiculos/{id}` - Obtener vehículo
- `POST /vehiculos` - Crear vehículo
- `PUT /vehiculos/{id}` - Actualizar vehículo
- `DELETE /vehiculos/{id}` - Eliminar vehículo

### Choferes
- `GET /choferes` - Listar choferes
- `GET /choferes/{id}` - Obtener chofer
- `POST /choferes` - Crear chofer
- `PUT /choferes/{id}` - Actualizar chofer
- `DELETE /choferes/{id}` - Eliminar chofer

### Asignaciones
- `GET /asignaciones` - Listar asignaciones
- `GET /asignaciones/{id}` - Obtener asignación
- `POST /asignaciones` - Crear asignación
- `PUT /asignaciones/{id}` - Actualizar asignación
- `DELETE /asignaciones/{id}` - Eliminar asignación

## 🎯 Módulos del Sistema

### 1. Gestión de Vehículos
- Registro completo de vehículos
- Información técnica detallada
- Historial de mantenimientos
- Estado del vehículo en tiempo real

### 2. Gestión de Choferes
- Datos personales y profesionales
- Licencias y certificaciones
- Historial de asignaciones
- Estado de disponibilidad

### 3. Sistema de Asignaciones
- Asignación de vehículos a choferes
- Control de fechas y horarios
- Seguimiento de uso
- Reportes de asignaciones

### 4. Mantenimiento
- Programación de mantenimientos
- Control de talleres
- Historial de reparaciones
- Alertas de vencimientos

### 5. Seguros y Pólizas
- Gestión de pólizas de seguro
- Control de vencimientos
- Coberturas y montos
- Renovaciones automáticas

### 6. Siniestros
- Registro de accidentes
- Seguimiento de reparaciones
- Documentación legal
- Análisis de siniestralidad

## 📊 Dashboard y Reportes

- **Métricas en tiempo real** de la flota
- **Gráficos interactivos** de uso y mantenimiento
- **Reportes personalizables** por período
- **Alertas automáticas** de vencimientos
- **Análisis de costos** y eficiencia

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
- Email: soporte@sagaut.com
- Documentación: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/tu-usuario/sagaut-modern/issues)

---

**SAGAUT Modern** - Transformando la gestión de flotas vehiculares 🚗✨
