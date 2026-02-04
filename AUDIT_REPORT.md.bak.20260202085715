# 🔍 AUDITORÍA EXHAUSTIVA - Saldaña Music Platform

**Fecha:** Febrero 2026  
**Versión:** 2.0  
**Proyecto:** Monorepo pnpm + Turborepo (Next.js 15 + NestJS 11)

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Estado | Prioridad |
|-----------|--------|-----------|
| Seguridad | 🔴 CRÍTICO | Alta |
| Funciones/Flujo | 🟡 MODERADO | Alta |
| Botones/UI | 🟡 MODERADO | Media |
| Branding | 🟢 BUENO | Baja |
| Notificaciones | � CRÍTICO | Alta |
| i18n Traducciones | � INCOMPLETO | Media |
| Base de Datos | � SCHEMA DESYNC | Alta |

---

## � PROBLEMAS CRÍTICOS EN PRODUCCIÓN (AHORA MISMO)

### 1. **SCHEMA DB DESINCRONIZADO** 🔴
**Error:** `column SplitSheet.inviteToken does not exist`
```sql
-- EJECUTAR EN PRODUCCIÓN:
ALTER TABLE "split_sheet" ADD COLUMN IF NOT EXISTS "inviteToken" character varying;
```

### 2. **SMTP NO CONFIGURADO** 🔴
**Error:** `Missing credentials for "PLAIN"`
- Variables `SMTP_USER` y `SMTP_PASS` no están en el contenedor API
- Todos los emails fallan (bienvenida, firma, invitaciones)

### 3. **Google OAuth Popup no cierra** 🟡
- El popup se cierra pero la ventana padre no siempre detecta el token
- Falta polling de cookie como fallback

---

## 🔄 AUDITORÍA DE FLUJOS Y FUNCIONES

### **FLUJO 1: Registro/Login con Google OAuth**
| Paso | Estado | Problema |
|------|--------|----------|
| 1. Click "Continuar con Google" | ✅ OK | - |
| 2. Popup abre Google | ✅ OK | - |
| 3. Google redirige a callback | ✅ OK | - |
| 4. API genera JWT | ✅ OK | - |
| 5. Redirect a `/login?token=...` | ✅ OK | - |
| 6. Popup envía token a opener | 🟡 PARCIAL | postMessage puede fallar cross-origin |
| 7. Popup se cierra | ✅ OK | - |
| 8. Parent redirige a dashboard | 🟡 PARCIAL | No siempre detecta el token |
| 9. Email de bienvenida | 🔴 FALLA | SMTP no configurado |

### **FLUJO 2: Crear Split Sheet**
| Paso | Estado | Problema |
|------|--------|----------|
| 1. Click "+ New Split Sheet" | ✅ OK | - |
| 2. Formulario de creación | ✅ OK | - |
| 3. Agregar colaboradores | ✅ OK | - |
| 4. Validar 100% total | ✅ OK | - |
| 5. Click "Generate Agreement" | 🔴 FALLA | `inviteToken` column missing |
| 6. Guardar en DB | 🔴 FALLA | Schema desync |

### **FLUJO 3: Firmar Split Sheet**
| Paso | Estado | Problema |
|------|--------|----------|
| 1. Owner inicia firmas | ✅ OK (código) | Falla por DB |
| 2. Emails a colaboradores | 🔴 FALLA | SMTP no configurado |
| 3. Colaborador firma | ✅ OK (código) | - |
| 4. Todos firman → COMPLETED | ✅ OK (código) | - |
| 5. Email de completado | 🔴 FALLA | SMTP no configurado |

### **FLUJO 4: Cambio de Idioma**
| Paso | Estado | Problema |
|------|--------|----------|
| 1. Click EN/ES toggle | ✅ OK | - |
| 2. URL cambia locale prefix | ✅ OK | Corregido |
| 3. Mensajes se cargan | 🟡 PARCIAL | Algunos textos hardcoded |

---

## � AUDITORÍA DE BOTONES

### **Landing Page (`/[locale]/page.tsx`)**
| Botón | Funciona | Problema |
|-------|----------|----------|
| "Iniciar Sesión" (nav) | ✅ | - |
| "Unirse al Roster" (nav) | ✅ | - |
| "Comenzar Ahora" (hero) | ✅ | - |
| "Privacidad" (footer) | ✅ | - |
| "Términos" (footer) | ✅ | - |
| "Soporte" (footer) | ✅ | - |

### **Login Page (`/[locale]/login/page.tsx`)**
| Botón | Funciona | Problema |
|-------|----------|----------|
| "Continuar con Google" | 🟡 | Popup flow puede fallar |
| "Sign In" (form) | ⚠️ | Solo console.log, no implementado |
| "Apply for Access" | ✅ | - |

### **Dashboard (`/[locale]/dashboard/page.tsx`)**
| Botón | Funciona | Problema |
|-------|----------|----------|
| "+ New Split Sheet" | ✅ | - |
| "New Split Sheet" card | ✅ | - |
| "My Collaborators" card | ⚠️ | Solo "Coming Soon" |
| "Royalty Analytics" card | ⚠️ | Solo "Coming Soon" |

### **Create Split Sheet (`/[locale]/dashboard/create/page.tsx`)**
| Botón | Funciona | Problema |
|-------|----------|----------|
| "+ Add Collaborator" | ✅ | - |
| "Save Draft" | ⚠️ | No implementado (solo texto) |
| "Generate Agreement" | 🔴 | Falla por DB schema |

### **Actions Row (per split sheet)**
| Botón | Funciona | Problema |
|-------|----------|----------|
| Share/Invite | 🟡 | Depende de inviteToken |
| Start Signatures | 🟡 | Falla por DB |
| Sign | ✅ (código) | - |
| Download PDF | ✅ | - |

### **Profile Page**
| Botón | Funciona | Problema |
|-------|----------|----------|
| "Save Profile" | ✅ | - |

### **Sidebar Navigation**
| Link | Funciona | Problema |
|------|----------|----------|
| Panel Principal | ✅ | - |
| Mis Split Sheets | ✅ | Página existe |
| Colaboradores | ⚠️ | Página vacía/placeholder |
| Perfil | ✅ | - |
| Regalías | ⚠️ | Página vacía/placeholder |
| Configuración | ⚠️ | Página vacía/placeholder |
| Language Switcher | ✅ | Corregido |

---

## 🎨 AUDITORÍA DE BRANDING

### **Colores (Consistente ✅)**
| Variable | Valor | Uso |
|----------|-------|-----|
| Primary (Gold) | `#D4AF37` | Botones CTA, acentos, hover |
| Background | `#050505` / `#121212` | Fondos principales |
| Glass Border | `rgba(212, 175, 55, 0.1)` | Paneles glassmorphism |
| Text Primary | `#FFFFFF` | Títulos |
| Text Secondary | `#9CA3AF` (gray-400) | Subtítulos, labels |
| Status Green | `#22C55E` | Completed |
| Status Yellow | `#EAB308` | Draft/Pending |
| Status Blue | `#3B82F6` | Action Required |

### **Tipografía**
| Fuente | Uso | Estado |
|--------|-----|--------|
| Montserrat | Principal | ✅ Configurada |
| Serif (italic) | Hero "Blindado" | ✅ OK |

### **Logo**
| Archivo | Ubicación | Estado |
|---------|-----------|--------|
| `/logo.svg` | Sidebar, Login, Register | ✅ |
| `/logo.png` | Landing navbar, footer | ✅ |

### **Problemas de Branding**
1. **Texto hardcoded en inglés dentro de código español:**
   - "New Split Sheet" debería ser traducible
   - "Coming Soon" debería estar en i18n
   - "Generate Agreement" debería ser traducible

2. **Inconsistencia de nombres:**
   - "Member Portal" (sidebar) vs "MEMBER PORTAL" (inconsistencia case)
   - Email from: `info@renace.space` debería ser `@saldanamusic.com`

---

## 📧 AUDITORÍA DE NOTIFICACIONES (EMAIL)

### **Templates Existentes**
| Template | Función | Estado |
|----------|---------|--------|
| `sendUserWelcome` | Nuevo usuario | 🔴 FALLA (SMTP) |
| `sendSignatureRequest` | Solicitar firma | 🔴 FALLA (SMTP) |
| `sendPasswordReset` | Reset password | 🔴 FALLA (SMTP) |
| `sendSplitSheetCompleted` | Sheet completado | 🔴 FALLA (SMTP) |
| `sendCollaboratorInvite` | Invitar colaborador | 🔴 FALLA (SMTP) |

### **Problemas de Email**
1. **SMTP sin credenciales** - Variables de entorno no configuradas
2. **From address incorrecto** - `info@renace.space` debería ser dominio propio
3. **BCC hardcoded** - `expertostird@gmail.com` en todos los emails
4. **Sin templates HTML profesionales** - Solo HTML básico inline
5. **Sin retry logic** - Si falla, se pierde el email
6. **Sin cola de emails** - Todo síncrono

### **Variables Requeridas para Email**
```bash
SMTP_HOST=smtp.hostinger.com  # o tu proveedor
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=notifications@saldanamusic.com
SMTP_PASS=<secure_password>
```

---

## 🌐 AUDITORÍA i18n (TRADUCCIONES)

### **Cobertura de Traducciones**
| Sección | ES | EN | Problema |
|---------|----|----|----------|
| Landing.heroTitle | ✅ | ✅ | - |
| Landing.heroSubtitle | ✅ | ✅ | - |
| Landing.ctaStart | ✅ | ✅ | - |
| Dashboard.nav.* | ✅ | ✅ | - |
| Dashboard.nav.profile | ❌ | ❌ | **FALTA** |
| Dashboard.header.* | ✅ | ✅ | - |
| Common.* | ✅ | ✅ | - |
| Create.* | ❌ | ❌ | **FALTA TODO** |
| Profile.* | ❌ | ❌ | **FALTA TODO** |
| Onboarding.* | ❌ | ❌ | **FALTA TODO** |
| Errors.* | ❌ | ❌ | **FALTA TODO** |

### **Textos Hardcoded que Necesitan i18n**
```
- "New Split Sheet"
- "Create New Split Sheet"
- "Song Title"
- "Collaborators"
- "Generate Agreement"
- "Save Draft"
- "Coming Soon"
- "COMPLETE YOUR PROFILE"
- "My Profile"
- "First Name" / "Last Name"
- "Save Profile"
- Status labels: "DRAFT", "PENDING_SIGNATURES", "COMPLETED"
```

---

## 📋 PLAN DE ACCIÓN ACTUALIZADO

### � INMEDIATO (Antes de usar en producción)
1. [x] ~~Google OAuth funcionando~~ ✅
2. [ ] **Agregar columna `inviteToken` a DB** ← CRÍTICO
3. [ ] **Configurar SMTP en stack** ← CRÍTICO
4. [ ] Mover credenciales a env vars
5. [ ] Proteger endpoint `/users/:email`

### � ESTA SEMANA
1. [ ] Completar traducciones i18n (es.json, en.json)
2. [ ] Implementar botón "Save Draft" funcional
3. [ ] Implementar páginas placeholder (Colaboradores, Regalías, Settings)
4. [ ] Mejorar popup OAuth con polling fallback
5. [ ] Cambiar email from a dominio propio

### � PRÓXIMAS 2 SEMANAS
1. [ ] Templates de email profesionales (HTML)
2. [ ] Sistema de notificaciones in-app
3. [ ] Implementar login con email/password funcional
4. [ ] Tests e2e para flujos críticos

---

**Generado por:** Auditoría Cascade v2.0  
**Última actualización:** 02/02/2026
