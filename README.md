# Frontend Angular para colección de videojuegos

Este proyecto implementa un frontend en Angular para:

- Iniciar sesión mediante `email` y `password`.
- Obtener y almacenar un token JWT devuelto por el backend.
- Listar juegos.
- Ver detalle de un juego.
- Dar de alta juegos.
- Modificar juegos.
- Dar de baja juegos.

## Endpoints usados

### Autenticación
- `POST /api/v1/auth/signin`

### Juegos
- `GET /api/game/all`
- `GET /api/game?id={uuid}`
- `POST /api/game`
- `PUT /api/game?id={uuid}`
- `DELETE /api/game?id={uuid}`

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Configuración

La URL base del backend se define en este fichero:

```ts
src/environments/environment.ts
```

Por defecto está configurada así:

```ts
apiBaseUrl: 'http://localhost:8080'
```

Cámbiala si tu backend corre en otra URL o puerto.

## Instalación

```bash
npm install
```

## Arranque en desarrollo

```bash
npm start
```

La aplicación quedará disponible normalmente en:

```bash
http://localhost:4200
```

## Build de producción

```bash
npm run build
```

El resultado se generará en:

```bash
dist/game-collection-frontend
```

## Notas importantes

### 1. Formato esperado para login

El frontend envía este JSON al endpoint `/api/v1/auth/signin`:

```json
{
  "email": "usuario@dominio.com",
  "password": "secreto"
}
```

Y espera una respuesta con este formato:

```json
{
  "token": "jwt-aqui"
}
```

Si tu clase `JwtAuthenticationResponse` devuelve otra propiedad distinta de `token`, tendrás que ajustar `AuthService`.

### 2. Formato esperado para juegos

El frontend maneja `GameDto` con esta estructura:

```json
{
  "id": "uuid",
  "name": "Nombre del juego",
  "description": "Descripción",
  "platform_id": "uuid-de-la-plataforma"
}
```

### 3. CORS

Si el frontend y el backend corren en hosts o puertos distintos, debes habilitar CORS en Spring Boot.

Ejemplo habitual para desarrollo:
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`

### 4. Seguridad

El JWT se guarda en `localStorage` y se envía automáticamente en la cabecera:

```http
Authorization: Bearer <token>
```

## Estructura del frontend

- `src/app/features/auth/login.component.ts`: pantalla de acceso.
- `src/app/features/games/games-list.component.ts`: listado de juegos.
- `src/app/features/games/game-detail.component.ts`: detalle del juego.
- `src/app/features/games/game-form.component.ts`: alta y edición.
- `src/app/core/auth.interceptor.ts`: añade el JWT a las peticiones.
- `src/app/core/game.service.ts`: llamadas HTTP del CRUD.
- `src/app/core/auth.service.ts`: autenticación.

## Flujo de uso

1. Abres `/login`.
2. Introduces email y contraseña.
3. Se llama a `/api/v1/auth/signin`.
4. Se guarda el JWT.
5. El usuario entra al módulo de juegos.
6. Todas las llamadas al CRUD incluyen el token automáticamente.
