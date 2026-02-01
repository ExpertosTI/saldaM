# 🔍 AUDITORÍA EXHAUSTIVA - Saldaña Music Platform

**Fecha:** Febrero 2026  
**Versión:** 1.0  
**Proyecto:** Monorepo pnpm + Turborepo (Next.js 15 + NestJS 11)

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Estado | Prioridad |
|-----------|--------|-----------|
| Seguridad | 🔴 CRÍTICO | Alta |
| Código Muerto | 🟡 MODERADO | Media |
| Código Repetido | 🟢 BAJO | Baja |
| Estándares | 🟡 MODERADO | Media |
| Dependencias | 🟢 ACTUALIZADO | Baja |
| Arquitectura | 🟢 BUENA | - |

---

## 🔴 PROBLEMAS CRÍTICOS DE SEGURIDAD

### 1. **CREDENCIALES HARDCODEADAS EN CÓDIGO** ⚠️ CRÍTICO
**Archivo:** `apps/api/src/mail/mail.service.ts:13-16`
```typescript
auth: {
    user: 'info@renace.space',
    pass: 'JustWork2027@',  // ❌ CONTRASEÑA EXPUESTA
},
```
**Solución:** Mover a variables de entorno:
```typescript
auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
},
```

### 2. **SECRET JWT INSEGURO POR DEFECTO**
**Archivo:** `apps/api/src/auth/auth.module.ts:17`
```typescript
secret: configService.get<string>('JWT_SECRET') || 'secretKey', // ❌ Fallback inseguro
```
**Solución:** Eliminar fallback, hacer obligatorio:
```typescript
secret: configService.getOrThrow<string>('JWT_SECRET'),
```

### 3. **CONTRASEÑA MASTER HARDCODEADA**
**Archivo:** `apps/api/src/app.module.ts:78`
```typescript
passwordHash: process.env.MASTER_PASSWORD || 'ChangeMeASAP2027!', // ❌ Fallback expuesto
```
**Solución:** Usar bcrypt y eliminar fallback.

### 4. **CORS ABIERTO EN PRODUCCIÓN**
**Archivo:** `apps/api/src/main.ts:25`
```typescript
app.enableCors(); // ❌ Permite CUALQUIER origen
```
**Solución:**
```typescript
app.enableCors({
    origin: ['https://app.saldanamusic.com', 'https://saldanamusic.com'],
    credentials: true,
});
```

### 5. **IP HARDCODEADA EN FIRMAS**
**Archivo:** `apps/api/src/split-sheet/split-sheet.service.ts:71`
```typescript
collaborator.ipAddress = '127.0.0.1'; // TODO: Capture real IP
```
**Solución:** Capturar IP real del request.

### 6. **ENDPOINT DE USUARIO SIN PROTECCIÓN**
**Archivo:** `apps/api/src/user/user.controller.ts:14-17`
```typescript
@Get(':email')
findOne(@Param('email') email: string) {  // ❌ Sin AuthGuard - expone datos de usuarios
    return this.userService.findOne(email);
}
```
**Solución:** Agregar `@UseGuards(AuthGuard('jwt'))`.

### 7. **postMessage SIN VALIDACIÓN DE ORIGEN**
**Archivo:** `apps/web/src/app/[locale]/login/page.tsx:22`
```typescript
window.opener.postMessage({ token, isNewUser }, "*"); // ❌ Cualquier origen
```
**Solución:** Especificar origen exacto.

---

## 🟡 CÓDIGO MUERTO / INÚTIL

### 1. **AppController y AppService sin uso real**
**Archivos:** 
- `apps/api/src/app.controller.ts`
- `apps/api/src/app.service.ts`

Solo retornan "Hello World!" - sin funcionalidad real.
**Acción:** Eliminar o implementar health check.

### 2. **Código comentado sin implementar**
**Archivo:** `apps/api/src/split-sheet/split-sheet.service.ts`
```typescript
// throw new UnauthorizedException('Only owner can start signatures');
// throw new UnauthorizedException('Only owner can invite');
```
**Acción:** Implementar o eliminar comentarios.

### 3. **Archivo default.php en raíz**
**Archivo:** `default.php` (1078 líneas)  
Landing page estático duplicado fuera del monorepo.
**Acción:** Migrar contenido a Next.js o eliminar.

### 4. **client_secret JSON expuesto**
**Archivo:** `client_secret_2_609647959676-*.json`  
Credenciales de Google OAuth en raíz del proyecto.
**Acción:** Eliminar y usar variables de entorno.

### 5. **Error no declarado en smooth scroll**
**Archivo:** `default.php:1065`
```javascript
e.preventDefault(); // ❌ 'e' no está definido en el scope
```

---

## 🔄 CÓDIGO REPETIDO

### 1. **Fetch de token repetido en múltiples archivos**
Patrón repetido en:
- `apps/web/src/app/[locale]/dashboard/page.tsx`
- `apps/web/src/app/[locale]/dashboard/layout.tsx`
- `apps/web/src/components/dashboard/ActionsRow.tsx`

```typescript
const tokenMatch = document.cookie.match(/token=([^;]+)/);
const token = tokenMatch ? tokenMatch[1] : null;
```
**Solución:** Crear hook `useAuth()` o utility `getToken()`.

### 2. **URL de API hardcodeada repetida**
```typescript
`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}`
```
**Solución:** Crear constante `API_BASE_URL` centralizada.

### 3. **Colores duplicados**
- `apps/web/tailwind.config.ts`: `primary: "#D4AF37"`
- `apps/web/src/app/globals.css`: `--primary: #D4AF37`
- `default.php`: `--primary: #D4AF37`

**Solución:** Unificar en un solo lugar.

---

## 📦 DEPENDENCIAS

### Estado Actual (Actualizado ✅)
| Paquete | Versión | Estado |
|---------|---------|--------|
| Next.js | 15.1.4 | ✅ Último |
| React | 19.0.0 | ✅ Último |
| NestJS | 11.0.1 | ✅ Último |
| TypeORM | 0.3.28 | ✅ Actual |
| Turbo | 2.7.6 | ✅ Actual |
| TypeScript | 5.7.3 | ✅ Actual |

### Dependencias Faltantes
- **bcrypt** - Para hash de contraseñas (actualmente almacena plain text)
- **@nestjs/jwt** - Listado en imports pero no en package.json explícitamente
- **rate-limiter-flexible** - Para rate limiting más granular

### Dependencias con Wildcards ⚠️
**Archivo:** `apps/api/package.json:27`
```json
"@nestjs/mapped-types": "*"  // ❌ Versión no fijada
```

---

## 🏗️ PROBLEMAS DE ARQUITECTURA

### 1. **synchronize: true en TypeORM**
**Archivo:** `apps/api/src/app.module.ts:44`
```typescript
synchronize: true, // ❌ PELIGROSO EN PRODUCCIÓN
```
**Solución:** Usar migraciones en producción.

### 2. **DTOs sin tipado fuerte**
Múltiples métodos usan `any`:
```typescript
async create(createUserDto: any) // ❌
async updateProfile(id: string, data: any) // ❌
```
**Solución:** Crear DTOs con class-validator.

### 3. **Sin manejo centralizado de errores**
Los servicios lanzan `new Error()` genérico.
**Solución:** Implementar excepciones HTTP de NestJS.

### 4. **Sin logging estructurado**
Solo `console.log/error`.
**Solución:** Implementar Winston o Pino.

---

## ✅ FORTALEZAS

1. **Arquitectura Monorepo bien estructurada** - Turborepo + pnpm workspaces
2. **Stack moderno** - Next.js 15, React 19, NestJS 11
3. **Internacionalización** - next-intl implementado
4. **Throttling básico** - ThrottlerModule configurado
5. **Swagger documentado** - API docs en `/api/docs`
6. **Helmet activado** - Headers de seguridad básicos
7. **Compresión gzip** - Implementada
8. **Validación global** - ValidationPipe con whitelist
9. **Diseño UI premium** - Glassmorphism, animaciones fluidas
10. **Audit Log** - Sistema de auditoría implementado

---

## 📋 PLAN DE ACCIÓN PRIORIZADO

### 🔴 INMEDIATO (24-48h)
1. [ ] Mover TODAS las credenciales a variables de entorno
2. [ ] Eliminar fallbacks inseguros de JWT_SECRET y MASTER_PASSWORD
3. [ ] Configurar CORS restrictivo
4. [ ] Proteger endpoint `/users/:email` con AuthGuard
5. [ ] Eliminar archivo `client_secret*.json`

### 🟠 CORTO PLAZO (1 semana)
1. [ ] Implementar bcrypt para hash de contraseñas
2. [ ] Crear DTOs tipados para todos los endpoints
3. [ ] Capturar IP real en firmas
4. [ ] Implementar refresh tokens
5. [ ] Desactivar `synchronize: true` y crear migraciones

### 🟡 MEDIO PLAZO (2-4 semanas)
1. [ ] Crear utility centralizado para autenticación en frontend
2. [ ] Implementar logging estructurado (Winston)
3. [ ] Eliminar código muerto (AppController, default.php)
4. [ ] Implementar tests unitarios y e2e
5. [ ] Configurar CI/CD con checks de seguridad

### 🟢 MEJORAS OPCIONALES
1. [ ] Implementar rate limiting por usuario
2. [ ] Agregar 2FA
3. [ ] Implementar CSP headers
4. [ ] Optimizar bundle size
5. [ ] Implementar WebSockets para notificaciones en tiempo real

---

## 📁 ARCHIVOS A ELIMINAR

```
/client_secret_2_609647959676-*.json  (credenciales expuestas)
/default.php                           (código legacy duplicado)
/.npmrc                                (archivo vacío)
```

---

## 🔧 COMANDOS DE VERIFICACIÓN

```bash
# Buscar credenciales hardcodeadas
grep -r "password\|secret\|key" apps/api/src --include="*.ts" | grep -v node_modules

# Verificar endpoints sin protección
grep -r "@Get\|@Post\|@Patch\|@Delete" apps/api/src --include="*.ts" -A2 | grep -v UseGuards

# Buscar console.log en producción
grep -r "console\." apps/ --include="*.ts" --include="*.tsx" | wc -l
```

---

**Generado por:** Auditoría Automatizada Cascade  
**Próxima revisión recomendada:** 30 días
