# Guia de Estudio - Proyecto SwiftLend

## 1. Resumen General Del Proyecto

SwiftLend es un microservicio desarrollado en Node.js y TypeScript para automatizar la aprobacion de microcreditos.

El sistema recibe una solicitud de prestamo, valida los datos del usuario, aplica reglas de riesgo crediticio y devuelve una decision:

- `APPROVED`: si el prestamo cumple todas las reglas.
- `REJECTED`: si el prestamo incumple una o varias reglas de negocio.

El proyecto sigue un enfoque **Spec-to-Code**, es decir, primero se define una especificacion tecnica en `requirements.md` y despues se implementa el codigo siguiendo estrictamente ese documento.

La especificacion incluye:

- Contexto del sistema.
- Stack tecnologico.
- Modelo de datos.
- Endpoints HTTP.
- Reglas de negocio RB-01 a RB-09.
- Criterios de aceptacion.
- Reglas de validacion.
- Tasas, plazos e intereses.

El objetivo del proyecto es demostrar un flujo profesional donde el codigo no se genera desde instrucciones informales, sino desde documentos tecnicos, reglas de negocio y auditoria de calidad.

## 2. Como Explicarlo En Clase

Una forma sencilla de exponer el proyecto es esta:

1. **Problema**: SwiftLend necesita automatizar la aprobacion de microcreditos.
2. **Entrada**: una solicitud con datos del usuario, score, deuda externa, importe, tipo de plan y plazo.
3. **Proceso**:
   - Validar el request con Zod.
   - Aplicar reglas de negocio.
   - Calcular el plan de pagos si se aprueba.
   - Devolver una decision.
4. **Salida**:
   - Prestamo aprobado con plan de pagos.
   - Prestamo rechazado con razones.
   - Error HTTP 400 si el request es invalido.
5. **Calidad**:
   - Tests con Jest y Supertest.
   - Cobertura superior al 80%.
   - Docker para ejecutar el servicio.
   - Hook de QA para verificar que el codigo sigue alineado con la spec.

Frase resumen:

```text
SwiftLend es un microservicio spec-to-code que evalua solicitudes de microcredito aplicando reglas de riesgo, validaciones Zod, arquitectura limpia, tests automatizados y Docker.
```

## 3. Arquitectura Del Proyecto

El proyecto usa una arquitectura limpia ligera.

```text
src/
|-- domain/
|-- application/
|-- infrastructure/
|-- interfaces/http/
```

### Domain

Contiene la logica pura del negocio:

- Entidades.
- Politicas de riesgo.
- Reglas de aprobacion o rechazo.
- Calculo del plan de pagos.

Archivos importantes:

- `src/domain/policies/swiftLendPolicy.ts`
- `src/domain/services/riskPolicyService.ts`
- `src/domain/services/repaymentPlanService.ts`

### Application

Coordina el caso de uso principal.

Archivo importante:

- `src/application/use-cases/EvaluateLoanApplicationUseCase.ts`

Este caso de uso recibe la solicitud, aplica las reglas y devuelve la decision.

### Infrastructure

Contiene adaptadores tecnicos.

Ejemplos:

- Generador de UUID.
- Reloj del sistema.

Archivos:

- `src/infrastructure/ids/CryptoIdGenerator.ts`
- `src/infrastructure/time/SystemClock.ts`

### Interfaces HTTP

Contiene Express, rutas, controladores y validaciones.

Archivos:

- `src/interfaces/http/routes.ts`
- `src/interfaces/http/controllers/loanApplicationController.ts`
- `src/interfaces/http/schemas/loanApplicationSchema.ts`

## 4. Endpoints Del Microservicio

### GET /health

Sirve para comprobar que el servicio esta funcionando.

Respuesta:

```json
{
  "status": "ok",
  "service": "swiftlend"
}
```

### POST /loans/applications

Recibe una solicitud de prestamo y devuelve la decision.

Request:

```json
{
  "userId": "6a79cb91-2e46-4de2-a47c-73240f037211",
  "email": "founder@company.com",
  "birthDate": "1990-05-10",
  "creditScore": 720,
  "externalDebtCents": 100000,
  "isNewUser": true,
  "amountCents": 150000,
  "planType": "EMPRENDEDOR",
  "termMonths": 12
}
```

Si se aprueba, devuelve `APPROVED` y un `repaymentPlan`.

Si se rechaza por negocio, devuelve `REJECTED` y una lista de razones.

Si el request es invalido, devuelve HTTP `400`.

## 5. Reglas De Negocio

| Regla | Descripcion | Resultado |
| --- | --- | --- |
| RB-01 | Usuario nuevo no puede pedir mas de 2000 USD | `NEW_USER_AMOUNT_LIMIT` |
| RB-02 | Score menor a 600 | `LOW_CREDIT_SCORE` |
| RB-03 | Email temporal | `TEMP_EMAIL_DOMAIN` |
| RB-04 | Menor de 21 anos | `UNDERAGE` |
| RB-05 | Deuda externa mayor a 5000 USD | `EXTERNAL_DEBT_TOO_HIGH` |
| RB-06 | Monto menor a 100 USD | HTTP `400` |
| RB-07 | Monto mayor a 10000 USD | HTTP `400` |
| RB-08 | `planType` invalido | HTTP `400` |
| RB-09 | Plazo invalido para el plan | `INVALID_TERM_FOR_PLAN` |

## 6. Tasas Y Plazos

| planType | Tasa anual | Plazos permitidos |
| --- | ---: | --- |
| `EMPRENDEDOR` | `0.05` | `6`, `12`, `18` meses |
| `PERSONAL` | `0.12` | `3`, `6`, `12` meses |

Formula de interes simple:

```text
totalInterest = amountCents * annualInterestRate * (termMonths / 12)
```

Ejemplo:

```text
amountCents = 150000
annualInterestRate = 0.05
termMonths = 12

interestCents = 150000 * 0.05 * (12 / 12)
interestCents = 7500
```

## 7. Diferencia Entre Validacion Y Rechazo De Negocio

### Validacion HTTP

Comprueba que los datos tengan formato correcto.

Ejemplos:

- UUID invalido.
- Email invalido.
- `planType` no permitido.
- Monto menor a 100 USD.
- Monto mayor a 10000 USD.

Resultado:

```text
HTTP 400
```

### Rechazo De Negocio

Los datos tienen formato correcto, pero incumplen una politica de riesgo.

Ejemplos:

- Score menor a 600.
- Usuario menor de 21 anos.
- Email temporal.
- Deuda externa superior a 5000 USD.

Resultado:

```text
HTTP 201
status = REJECTED
repaymentPlan = null
```

## 8. Resultados Satisfactorios Obtenidos

Durante la practica se verifico:

```text
npm install        -> correcto
npm run build      -> correcto
npm test           -> 16/16 tests pasando
npm run check:spec -> Spec compliance check passed
docker compose     -> servicio levantado correctamente
/health            -> ok swiftlend
```

Cobertura obtenida:

```text
Statements: 98.09%
Branches:   92.3%
Functions:  94.73%
Lines:      98.09%
```

El requisito era una cobertura minima del 80%, por lo que el resultado fue satisfactorio.

## 9. Herramientas Usadas

### NotebookLM

NotebookLM es una herramienta de Google orientada al analisis de documentos mediante IA.

En el proyecto se plantea para cargar documentos simulados como:

- Politica de riesgos.
- Tabla de tasas y plazos.
- Guia tecnica.

Se usa porque permite extraer requisitos desde fuentes documentales y generar una primera version de la especificacion tecnica. Esto encaja con el objetivo del proyecto: partir de documentos reales o simulados, no de instrucciones informales.

### Kiro

Kiro es el IDE/agente usado para trabajar con desarrollo guiado por especificaciones.

En el proyecto se usa para:

- Leer `requirements.md`.
- Analizar reglas de negocio.
- Revisar alineacion entre codigo y spec.
- Ejecutar o simular auditorias.
- Configurar hooks de QA.

Se usa porque el proyecto pide un flujo de desarrollo agentico, donde el agente trabaja a partir de archivos de control y especificaciones.

### Kiro CLI

Kiro CLI es la version de terminal de Kiro.

En la practica se instalo Kiro CLI 2.0.1, pero se comprobo que no incluia el comando:

```text
kiro test --check-spec requirements.md
```

Por eso se creo una alternativa local:

```powershell
npm run check:spec
```

Se mantiene la idea del check de spec, pero usando un comando compatible con el entorno real.

### Node.js

Node.js es el runtime que permite ejecutar JavaScript y TypeScript en servidor.

Se usa porque el stack del proyecto pide Node.js y porque es adecuado para construir APIs HTTP ligeras y rapidas.

### TypeScript

TypeScript es JavaScript con tipado estatico.

Se usa porque ayuda a detectar errores antes de ejecutar el codigo y mejora la mantenibilidad del proyecto. Tambien permite definir tipos claros para entidades como `Loan`, `LoanApplication` y `RepaymentPlan`.

### Express

Express es un framework HTTP para Node.js.

Se usa para crear los endpoints:

- `GET /health`
- `POST /loans/applications`

Se eligio porque es simple, conocido y suficiente para construir un microservicio pequeno.

### Zod

Zod es una libreria de validacion de datos.

Se usa para validar el cuerpo de las peticiones HTTP antes de ejecutar la logica de negocio.

Valida, entre otros:

- UUID.
- Email.
- Fecha de nacimiento.
- Score.
- Monto.
- Tipo de plan.
- Plazo.

Se usa porque evita que datos incorrectos entren al dominio.

### Jest

Jest es el framework de testing usado en el proyecto.

Se usa para probar:

- Reglas de negocio.
- Casos de uso.
- Servicios de dominio.
- Adaptadores.

Fue elegido porque es una herramienta habitual en proyectos Node.js/TypeScript y permite medir cobertura.

### Supertest

Supertest es una libreria para probar APIs HTTP.

Se usa para probar endpoints Express sin tener que levantar manualmente el servidor.

En SwiftLend se usa para comprobar:

- `GET /health`.
- Solicitud aprobada.
- Solicitud rechazada.
- Errores HTTP 400.

### Docker

Docker permite empaquetar la aplicacion en un contenedor.

Se usa para que el microservicio pueda ejecutarse de forma reproducible en cualquier entorno con Docker instalado.

### Docker Compose

Docker Compose permite levantar servicios usando un archivo `docker-compose.yml`.

En el proyecto se usa para construir y ejecutar SwiftLend en el puerto `3000`.

Comando principal:

```powershell
docker compose up -d --build
```

### npm

npm es el gestor de paquetes de Node.js.

Se usa para:

- Instalar dependencias.
- Ejecutar scripts.
- Lanzar tests.
- Compilar el proyecto.
- Ejecutar el check de spec.

Scripts importantes:

```powershell
npm install
npm run build
npm test
npm run check:spec
npm run dev
```

### Git

Git es el sistema de control de versiones.

Se usa para registrar cambios, crear commits y mantener historial del proyecto.

### GitHub

GitHub es la plataforma remota donde se subio el repositorio.

Se usa para entregar el proyecto, compartir el codigo y dejar evidencia de los commits.

Repositorio:

```text
https://github.com/PaabloMrtneez/robots.git
```

### PowerShell

PowerShell es la terminal usada en Windows durante la practica.

Se uso para ejecutar comandos como:

```powershell
npm test
docker compose up -d --build
Invoke-RestMethod http://localhost:3000/health
```

### Markdown

Markdown es el formato usado para documentacion.

Se usa en:

- `README.md`
- `requirements.md`
- `audit-report.md`
- `docs/guia-estudio-examen.md`

Se eligio porque es facil de leer, versionar y visualizar en GitHub.

## 10. Definiciones Importantes

### Microservicio

Aplicacion pequena e independiente que cumple una funcion concreta. En este proyecto, evalua solicitudes de microcredito.

### Spec-to-Code

Flujo donde el codigo se implementa a partir de una especificacion tecnica previa.

### Master Spec

Documento principal de requisitos. En este proyecto es `requirements.md`.

### `requirements.md`

Fuente de verdad del sistema. Define reglas, entidades, endpoints, validaciones y criterios de aceptacion.

### Regla De Negocio

Condicion que representa una politica real de la empresa. Ejemplo: si el score es menor a 600, se rechaza la solicitud.

### RB

Abreviatura de Regla de Negocio. En SwiftLend se usan reglas RB-01 a RB-09.

### Arquitectura Limpia

Forma de organizar el codigo separando responsabilidades. El dominio no depende de Express, Docker ni detalles externos.

### Dominio

Capa donde viven las reglas mas importantes del negocio.

### Caso De Uso

Operacion principal de la aplicacion. En este proyecto, evaluar una solicitud de prestamo.

### Infraestructura

Capa con detalles tecnicos externos, como generacion de UUID o fecha actual.

### Interfaz HTTP

Capa que expone la aplicacion mediante endpoints.

### Express

Framework de Node.js usado para construir la API HTTP.

### Endpoint

Ruta HTTP que ofrece una funcionalidad. Ejemplo: `GET /health`.

### Zod

Libreria de validacion usada para comprobar que los datos del request son correctos.

### Validacion HTTP

Comprobacion de formato de los datos de entrada. Si falla, se devuelve HTTP `400`.

### Rechazo De Negocio

La solicitud tiene formato valido, pero incumple una politica de riesgo. Devuelve `REJECTED`.

### HTTP 400

Codigo de error que indica request invalido.

### HTTP 201

Codigo de exito que indica que la solicitud fue procesada.

### `APPROVED`

Estado de un prestamo aprobado.

### `REJECTED`

Estado de un prestamo rechazado.

### `rejectionReasons`

Lista de razones por las que se rechaza una solicitud.

### `amountCents`

Importe expresado en centavos. Por ejemplo, 2000 USD son `200000`.

### `planType`

Tipo de prestamo. Puede ser `EMPRENDEDOR` o `PERSONAL`.

### Interes Simple

Calculo de interes que usa principal, tasa y tiempo.

```text
totalInterest = amountCents * annualInterestRate * (termMonths / 12)
```

### Plan De Pagos

Objeto con principal, interes, total a devolver y cuota mensual.

### Jest

Framework de testing usado para ejecutar pruebas automatizadas.

### Supertest

Libreria usada para probar endpoints HTTP de Express.

### Docker

Herramienta para ejecutar la aplicacion dentro de un contenedor.

### Dockerfile

Archivo que define como construir la imagen Docker.

### Docker Compose

Herramienta para levantar servicios definidos en `docker-compose.yml`.

### NotebookLM

Herramienta usada para analizar documentos fuente y extraer requisitos.

### RAG

Retrieval-Augmented Generation. Tecnica donde la IA responde usando documentos proporcionados como contexto.

### Kiro

IDE/agente usado para desarrollo guiado por especificacion.

### Hook De QA

Automatizacion que se ejecuta al guardar archivos para validar que el proyecto sigue cumpliendo la spec.

### `npm run check:spec`

Comando que valida la alineacion entre spec y codigo, y despues ejecuta los tests.

### Guardrail

Mecanismo de proteccion que evita cambios peligrosos o contradictorios.

### Auditoria

Revision que comprueba que cada regla esta implementada, testeada y alineada con la spec.

## 11. Preguntas De Desarrollo Con Respuesta

### 1. Explica el objetivo principal del proyecto SwiftLend.

SwiftLend automatiza la aprobacion de microcreditos. Recibe solicitudes, valida datos, aplica reglas de riesgo y devuelve si el prestamo queda aprobado o rechazado.

### 2. Que papel cumple `requirements.md`?

Es la fuente de verdad. Contiene entidades, endpoints, reglas de negocio, tasas, plazos, validaciones y criterios de aceptacion.

### 3. Como se aplica arquitectura limpia en el proyecto?

Separando responsabilidades: `domain` contiene reglas de negocio, `application` coordina casos de uso, `interfaces/http` contiene Express y Zod, e `infrastructure` contiene adaptadores tecnicos.

### 4. Por que se usa Zod?

Para validar las entradas externas antes de que lleguen a la logica de negocio. Asi se evitan datos mal formados.

### 5. Diferencia entre rechazo de negocio y error HTTP 400.

Un rechazo de negocio ocurre cuando los datos son validos pero incumplen una regla de riesgo. Un HTTP 400 ocurre cuando el request no cumple el formato o limites de validacion.

### 6. Como se calcula el plan de pagos?

Con interes simple anual:

```text
totalInterest = amountCents * annualInterestRate * (termMonths / 12)
```

Luego se calcula total a devolver y cuota mensual.

### 7. Que protege el hook de QA?

Protege la alineacion entre codigo y `requirements.md`. Detecta cambios como modificar tasas, limites, edad minima o score minimo.

### 8. Por que se usan centavos?

Para evitar errores de precision decimal en calculos monetarios.

### 9. Que reglas provocan rechazo del prestamo?

RB-01, RB-02, RB-03, RB-04, RB-05 y RB-09 provocan rechazo de negocio.

### 10. Que resultados obtuvo el proyecto?

El proyecto compila, Docker funciona, `/health` responde correctamente, pasan 16 tests de 16 y la cobertura global es 98.09%.

## 12. Preguntas Tipo Test

### 1. Cual es la fuente de verdad del proyecto?

A. `README.md`  
B. `requirements.md`  
C. `package.json`  
D. `Dockerfile`

Respuesta: B.

Justificacion: `requirements.md` contiene las reglas, endpoints, modelos y criterios de aceptacion.

### 2. Que framework HTTP usa SwiftLend?

A. Fastify  
B. NestJS  
C. Express  
D. Hapi

Respuesta: C.

Justificacion: La API esta implementada con Express.

### 3. Que libreria valida las entradas?

A. Joi  
B. Zod  
C. Yup  
D. Ajv

Respuesta: B.

Justificacion: Los schemas HTTP usan Zod.

### 4. Que endpoint comprueba la salud del servicio?

A. `/status`  
B. `/health`  
C. `/ping`  
D. `/api/health`

Respuesta: B.

Justificacion: El contrato define `GET /health`.

### 5. Que endpoint evalua solicitudes de prestamo?

A. `POST /loans`  
B. `POST /loans/applications`  
C. `GET /loans`  
D. `POST /users`

Respuesta: B.

Justificacion: Es el endpoint principal de evaluacion.

### 6. Que estado se devuelve si no hay razones de rechazo?

A. `PENDING`  
B. `APPROVED`  
C. `VALID`  
D. `ACCEPTED`

Respuesta: B.

Justificacion: Sin razones de rechazo, el prestamo queda aprobado.

### 7. Que ocurre si el score es 599?

A. Se aprueba  
B. Se rechaza  
C. Devuelve HTTP 400  
D. Queda pendiente

Respuesta: B.

Justificacion: RB-02 rechaza scores menores a 600.

### 8. Que razon corresponde a score bajo?

A. `BAD_SCORE`  
B. `LOW_CREDIT_SCORE`  
C. `SCORE_ERROR`  
D. `REJECTED_SCORE`

Respuesta: B.

Justificacion: Es el codigo definido en la spec.

### 9. Cual es la edad minima?

A. 18  
B. 20  
C. 21  
D. 25

Respuesta: C.

Justificacion: RB-04 exige 21 anos cumplidos.

### 10. Monto maximo para usuarios nuevos.

A. 1000 USD  
B. 2000 USD  
C. 5000 USD  
D. 10000 USD

Respuesta: B.

Justificacion: RB-01 limita a usuarios nuevos a 2000 USD.

### 11. Deuda externa maxima permitida.

A. 2000 USD  
B. 3000 USD  
C. 5000 USD  
D. 10000 USD

Respuesta: C.

Justificacion: RB-05 rechaza deuda mayor a 5000 USD.

### 12. Monto minimo permitido.

A. 50 USD  
B. 100 USD  
C. 500 USD  
D. 1000 USD

Respuesta: B.

Justificacion: RB-06 valida minimo de 100 USD.

### 13. Monto maximo general.

A. 2000 USD  
B. 5000 USD  
C. 10000 USD  
D. 20000 USD

Respuesta: C.

Justificacion: RB-07 valida maximo general de 10000 USD.

### 14. Tasa de `EMPRENDEDOR`.

A. 0%  
B. 5%  
C. 10%  
D. 12%

Respuesta: B.

Justificacion: `EMPRENDEDOR` usa `0.05`.

### 15. Tasa de `PERSONAL`.

A. 5%  
B. 8%  
C. 10%  
D. 12%

Respuesta: D.

Justificacion: `PERSONAL` usa `0.12`.

### 16. Plazos de `EMPRENDEDOR`.

A. 3, 6, 12  
B. 6, 12, 18  
C. 12, 24  
D. 1, 2, 3

Respuesta: B.

Justificacion: Son los plazos permitidos para `EMPRENDEDOR`.

### 17. Plazos de `PERSONAL`.

A. 3, 6, 12  
B. 6, 12, 18  
C. 12, 18, 24  
D. 1, 6, 9

Respuesta: A.

Justificacion: Son los plazos permitidos para `PERSONAL`.

### 18. Que ocurre con un plazo invalido?

A. HTTP 400  
B. `INVALID_TERM_FOR_PLAN`  
C. Se corrige automaticamente  
D. Se ignora

Respuesta: B.

Justificacion: RB-09 es una regla de negocio.

### 19. Que ocurre con `planType = BUSINESS`?

A. Se aprueba  
B. Se rechaza como negocio  
C. Devuelve HTTP 400  
D. Se cambia a `PERSONAL`

Respuesta: C.

Justificacion: Zod valida que `planType` solo sea `EMPRENDEDOR` o `PERSONAL`.

### 20. Que comando ejecuta el hook?

A. `npm test`  
B. `npm run check:spec`  
C. `docker compose up`  
D. `npm start`

Respuesta: B.

Justificacion: El hook usa el guardrail local `npm run check:spec`.

### 21. Por que no se usa `kiro test --check-spec`?

A. Es lento  
B. No existe en Kiro CLI 2.0.1  
C. Rompe Docker  
D. No usa Node

Respuesta: B.

Justificacion: La version instalada de Kiro CLI no tiene el subcomando `test`.

### 22. Donde vive la logica de riesgo?

A. En el controlador  
B. En un servicio de dominio  
C. En Dockerfile  
D. En README

Respuesta: B.

Justificacion: La logica de riesgo esta en `riskPolicyService.ts`.

### 23. Que test cubre la API HTTP?

A. `loanApplicationsApi.test.ts`  
B. `SystemClock.ts`  
C. `README.md`  
D. `Dockerfile`

Respuesta: A.

Justificacion: Usa Supertest para probar endpoints.

### 24. Que devuelve un prestamo rechazado en `repaymentPlan`?

A. Un plan vacio  
B. `null`  
C. `0`  
D. `undefined`

Respuesta: B.

Justificacion: La spec exige `repaymentPlan: null` en prestamos rechazados.

### 25. Que cobertura global se obtuvo?

A. 50%  
B. 75%  
C. 80%  
D. 98.09%

Respuesta: D.

Justificacion: La practica obtuvo 98.09% de statements.

## 13. Apuntes Rapidos Para Memorizar

```text
Proyecto: SwiftLend
Tipo: Microservicio fintech
Lenguaje: TypeScript
Runtime: Node.js
Framework: Express
Validacion: Zod
Tests: Jest + Supertest
Infraestructura: Docker + Docker Compose
Spec principal: requirements.md
Arquitectura: Clean Architecture
Endpoint salud: GET /health
Endpoint principal: POST /loans/applications
Hook QA: npm run check:spec
Coverage: 98.09%
Tests: 16/16 passing
```

Reglas para memorizar:

```text
RB-01: nuevo usuario > 2000 USD -> NEW_USER_AMOUNT_LIMIT
RB-02: score < 600 -> LOW_CREDIT_SCORE
RB-03: email temporal -> TEMP_EMAIL_DOMAIN
RB-04: edad < 21 -> UNDERAGE
RB-05: deuda externa > 5000 USD -> EXTERNAL_DEBT_TOO_HIGH
RB-06: monto < 100 USD -> HTTP 400
RB-07: monto > 10000 USD -> HTTP 400
RB-08: planType invalido -> HTTP 400
RB-09: plazo invalido -> INVALID_TERM_FOR_PLAN
```

Tasas:

```text
EMPRENDEDOR -> 5% -> 6, 12, 18 meses
PERSONAL    -> 12% -> 3, 6, 12 meses
```

Comandos:

```powershell
npm install
npm run build
npm test
npm run check:spec
docker compose up -d --build
Invoke-RestMethod http://localhost:3000/health
docker compose down
```

## 14. Mini Guion Para Defender El Proyecto

SwiftLend es un microservicio de aprobacion de microcreditos construido con Node.js, TypeScript y Express. El proyecto sigue una metodologia spec-to-code, donde `requirements.md` actua como fuente de verdad. A partir de esa especificacion se implementan las entidades, reglas de negocio, endpoints y tests.

El sistema recibe solicitudes en `POST /loans/applications`, valida la entrada con Zod y aplica reglas de riesgo como edad minima, score minimo, deuda externa, emails temporales y limites de importe. Si la solicitud cumple todas las reglas, se aprueba y se genera un plan de pagos con interes simple. Si incumple alguna regla de negocio, se rechaza y se devuelven todas las razones.

El proyecto esta organizado con arquitectura limpia: dominio para reglas, aplicacion para casos de uso, infraestructura para adaptadores e interfaces HTTP para Express. Ademas, se implementaron tests unitarios y de API, obteniendo 16 tests correctos y una cobertura del 98.09%.

Finalmente, el servicio esta dockerizado y cuenta con un hook de QA mediante `npm run check:spec`, que comprueba que el codigo no contradiga la especificacion. Esto permite demostrar no solo que el codigo funciona, sino que esta alineado con los requisitos originales.
