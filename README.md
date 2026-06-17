# 🚀 ApexWallet API - FinTech P2P Platform

ApexWallet API es el motor backend para una plataforma de monedero digital y transferencias entre personas (P2P). El sistema está diseñado bajo los más altos estándares de desarrollo de software empresarial, utilizando **TypeScript**, **NestJS** (o **Clean Architecture** nativa), **Prisma ORM**, **Docker**, y un flujo automatizado de **CI/CD** con **GitHub Actions**.

El núcleo del sistema implementa un **Ledger de Doble Entrada (Double-Entry Bookkeeping)** para garantizar la consistencia absoluta, atomicidad e inmutabilidad de los movimientos financieros de los usuarios, previniendo problemas críticos de concurrencia y pérdida de saldos.

---

## 🛠️ Stack Tecnológico

* **Runtime:** Node.js v20+ & TypeScript.
* **Framework:** NestJS
* **Base de Datos:** PostgreSQL.
* **ORM:** Prisma ORM.
* **Contenedores:** Docker & Docker Compose.
* **Testing:** Jest (Unitarios) & Supertest (Integración).
* **CI/CD:** GitHub Actions (Pipelines automatizados de Lint, Build y Test).

---

## 📋 Requerimientos Funcionales (Features)

### 1. Gestión de Usuarios y Seguridad (Auth)
* **Registro de Usuarios:** Creación de cuenta con contraseña encriptada mediante `bcrypt`.
* **Autenticación Segura:** Inicio de sesión que genera tokens **JWT (JSON Web Tokens)** con expiración configurada.
* **Aislamiento de Recursos:** Los usuarios autenticados solo pueden consultar, operar y visualizar la información financiera asociada estrictamente a sus cuentas personales.

### 2. Cuentas Multidivisa (Wallets)
* **Soporte de Monedas:** Creación automática o bajo demanda de billeteras en **MXN, USD y EUR**.
* **Precisión Financiera:** Almacenamiento de saldos utilizando el tipo de datos `Decimal(18, 4)` en PostgreSQL para evitar errores de redondeo de punto flotante de JavaScript.
* **Regla de Unicidad:** Un usuario solo puede poseer una cuenta única por cada tipo de divisa.

### 3. Transferencias P2P e Integridad Financiera (Ledger Core)
* **Sistema de Doble Entrada:** Cada transacción genera un asiento contable inmutable con un origen (`sourceAccountId`) y un destino (`destinationAccountId`). El saldo se calcula como la suma histórica de débitos y créditos.
* **Operaciones Atómicas:** Las transferencias se ejecutan dentro de una transacción de base de datos (`$transaction` de Prisma). Si el descuento de saldo o el abono fallan, se aplica un `rollback` automático instantáneo.
* **Conversión de Divisas (FX Engine):** Soporte para transferencias entre cuentas con monedas distintas, aplicando una tasa de cambio simulada/calculada en tiempo real.
* **Prevención de Descubiertos:** El sistema valida de manera estricta que la cuenta origen cuente con los fondos suficientes antes de comprometer o iniciar cualquier movimiento contable.

### 4. Historial de Transacciones y Auditoría
* **Endpoints de Consulta:** Historial paginado de movimientos financieros realizados por el usuario.
* **Filtros Avanzados:** Capacidad de filtrar el historial por tipo de moneda, rango de fechas y tipo de movimiento (ingreso/egreso).

---

## 🏗️ Requerimientos No Funcionales y Calidad de Código

### 1. Arquitectura Limpia (Clean Architecture)
* Desacoplamiento total entre las reglas de negocio (Casos de Uso), el framework (NestJS/Express) y el mecanismo de persistencia (Prisma).
* Implementación estricta de inversión y de inyección de dependencias.

### 2. Estrategia de Pruebas Automatizadas (Testing Suite)
* **Pruebas Unitarias (Jest):** Cobertura completa de la lógica matemática pura (motores de conversión de divisas, cálculos de comisiones, validación de saldos).
* **Pruebas de Integración (Supertest):** Simulación de flujos de extremo a extremo en un entorno controlado (Registro de usuario ➡️ Login ➡️ Obtención de JWT ➡️ Depósito ➡️ Transferencia exitosa).

### 3. Pipeline de Automatización (CI/CD)
* Integración con **GitHub Actions** mediante un workflow que se dispara en cada `push` o `Pull Request` hacia la rama `main`.
* **Etapas del Pipeline:**
  1. **Linting & Formatting:** Validación estricta con ESLint y Prettier.
  2. **Compilation:** Compilación exitosa del código TypeScript a JavaScript nativo.
  3. **Testing Run:** Ejecución automática de toda la suite de pruebas unitarias y de integración para garantizar cero regresiones en producción.

---

## 🚀 Guía de Inicio Rápido (Próximamente)

```bash

# 1. Instalar dependencias
npm install

# 2. Levantar infraestructura local con Docker
docker-compose up -d

# 3. Correr migraciones de Prisma
npx prisma migrate dev