# SwiftLend - Pipeline de Microservicios con IA Agentica

SwiftLend es un microservicio Node.js/TypeScript para automatizar la aprobacion de microcreditos. El proyecto esta preparado para una entrega de tipo spec-to-code: la especificacion vive en `requirements.md`, el codigo implementa esas reglas con arquitectura limpia, y la calidad se valida con tests, Docker y un hook de QA.

## Creadores

- Pablo Martinez
- Alvaro Hernandez
- Adrian Tamargo
- Adrian Francino
- Firas Sabea

## 1. Objetivo Del Proyecto

El objetivo es simular un flujo profesional donde el codigo no nace de instrucciones informales, sino de documentos tecnicos y reglas de negocio extraidas por IA.

El repositorio demuestra:

- Extraccion de requisitos con NotebookLM.
- Desarrollo guiado por especificacion con Kiro.
- Microservicio funcional en TypeScript y Express.
- Validaciones con Zod.
- Tests unitarios y HTTP con Jest y Supertest.
- Dockerizacion con Docker Compose.
- Auditoria de alineacion entre codigo y `requirements.md`.
- Proteccion anti-trampa mediante `npm run check:spec`.

## 2. Stack Tecnologico

- Lenguaje: TypeScript.
- Runtime: Node.js.
- Framework HTTP: Express.
- Validacion: Zod.
- Tests: Jest y Supertest.
- Infraestructura: Docker y Docker Compose.
- Agente/IDE: Kiro.
- Analisis de fuentes: NotebookLM.
- Arquitectura: Clean Architecture ligera.

## 3. Requisitos Previos

Instala o verifica:

- Node.js 20 o superior.
- npm.
- Docker Desktop.
- Kiro IDE.
- Kiro CLI, si se va a usar desde terminal.
- NotebookLM, para la fase de extraccion de requisitos.

En este entorno se detecto Kiro CLI en:

```powershell
C:\Users\pablo\AppData\Local\Kiro-Cli\kiro-cli.exe
```

Si `kiro-cli` no se reconoce en PowerShell, prueba:

```powershell
& "$env:LOCALAPPDATA\Kiro-Cli\kiro-cli.exe" --help
```

Para anadirlo al PATH de usuario:

```powershell
$kiroPath = "$env:LOCALAPPDATA\Kiro-Cli"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($userPath -notlike "*$kiroPath*") {
  [Environment]::SetEnvironmentVariable("Path", "$userPath;$kiroPath", "User")
}
```

Despues cierra PowerShell, abre una nueva terminal y ejecuta:

```powershell
kiro-cli --help
```

Nota: Kiro CLI 2.0.1 no expone el subcomando `test --check-spec`. Por eso este proyecto usa `npm run check:spec` como guardrail local equivalente.

## 4. Estructura Del Proyecto

```text
.
|-- .kiro/
|   `-- hooks.json
|-- docs/
|   |-- hook-protection-demo.md
|   |-- qa-hook-setup.md
|   |-- prompts/
|   |   |-- kiro-audit-prompt.md
|   |   `-- notebooklm-master-prompt.md
|   `-- sources/
|       |-- rates-and-terms.md
|       |-- risk-policy.md
|       `-- technical-style-guide.md
|-- scripts/
|   `-- checkSpecCompliance.js
|-- src/
|   |-- application/
|   |-- domain/
|   |-- infrastructure/
|   |-- interfaces/
|   |-- app.ts
|   `-- server.ts
|-- tests/
|   |-- application/
|   |-- domain/
|   |-- helpers/
|   |-- infrastructure/
|   `-- interfaces/
|-- audit-report.md
|-- docker-compose.yml
|-- Dockerfile
|-- jest.config.cjs
|-- package.json
|-- requirements.md
|-- tsconfig.build.json
`-- tsconfig.json
```

## 5. Archivos Importantes

- `requirements.md`: fuente de verdad de requisitos, reglas RB, contrato API y criterios de aceptacion.
- `src/domain/policies/swiftLendPolicy.ts`: constantes de negocio auditables.
- `src/domain/services/riskPolicyService.ts`: evaluacion de riesgo y reglas de rechazo.
- `src/domain/services/repaymentPlanService.ts`: calculo de interes simple y plan de pagos.
- `src/application/use-cases/EvaluateLoanApplicationUseCase.ts`: caso de uso principal.
- `src/interfaces/http/schemas/loanApplicationSchema.ts`: validaciones Zod de entrada HTTP.
- `src/interfaces/http/controllers/loanApplicationController.ts`: controlador Express.
- `tests/`: tests unitarios, de dominio, infraestructura y API.
- `scripts/checkSpecCompliance.js`: verificacion local de alineacion spec-codigo.
- `.kiro/hooks.json`: hook on-save para ejecutar QA.
- `audit-report.md`: reporte de auditoria de cumplimiento.
- `docs/sources/`: documentos simulados para NotebookLM.
- `docs/prompts/`: prompts para NotebookLM y Kiro.

## 6. Modelo De Datos

### Loan

- `id`: UUID.
- `userId`: UUID.
- `amountCents`: importe en centavos USD.
- `interestRate`: tasa anual decimal.
- `status`: `PENDING`, `APPROVED` o `REJECTED`.
- `planType`: `EMPRENDEDOR` o `PERSONAL`.
- `termMonths`: plazo en meses.
- `rejectionReasons`: razones de rechazo.

### User Profile

- `userId`: UUID.
- `email`: correo valido.
- `birthDate`: fecha ISO `YYYY-MM-DD`.
- `creditScore`: entero entre 0 y 1000.
- `externalDebtCents`: deuda externa en centavos USD.
- `isNewUser`: booleano.

### Repayment Plan

- `principalCents`: principal solicitado.
- `interestCents`: interes calculado.
- `totalRepaymentCents`: principal mas interes.
- `monthlyPaymentCents`: cuota mensual redondeada.
- `termMonths`: plazo elegido.
- `currency`: `USD`.

## 7. Reglas De Negocio

| Regla | Descripcion | Resultado |
| --- | --- | --- |
| RB-01 | Usuario nuevo no puede pedir mas de 2000 USD | `NEW_USER_AMOUNT_LIMIT` |
| RB-02 | Score menor a 600 | `LOW_CREDIT_SCORE` |
| RB-03 | Dominio de email temporal | `TEMP_EMAIL_DOMAIN` |
| RB-04 | Menor de 21 anos cumplidos | `UNDERAGE` |
| RB-05 | Deuda externa mayor a 5000 USD | `EXTERNAL_DEBT_TOO_HIGH` |
| RB-06 | Monto menor a 100 USD | HTTP `400` |
| RB-07 | Monto mayor a 10000 USD | HTTP `400` |
| RB-08 | `planType` invalido | HTTP `400` |
| RB-09 | Plazo no permitido para el plan | `INVALID_TERM_FOR_PLAN` |

El sistema acumula todas las razones de rechazo aplicables. Si hay al menos una razon, el estado es `REJECTED` y `repaymentPlan` es `null`.

## 8. Tasas Y Plazos

El calculo usa interes simple anual:

```text
totalInterest = amountCents * annualInterestRate * (termMonths / 12)
```

| planType | Tasa anual | Plazos permitidos |
| --- | ---: | --- |
| `EMPRENDEDOR` | `0.05` | `6`, `12`, `18` meses |
| `PERSONAL` | `0.12` | `3`, `6`, `12` meses |

Los importes se trabajan en centavos para evitar errores de precision decimal.

## 9. Instalacion Local

Desde PowerShell:

```powershell
cd C:\Users\pablo\Desktop\Practicas\robots
npm install
```

Resultado satisfactorio obtenido en la practica:

```text
added 393 packages
found 0 vulnerabilities
```

## 10. Comandos Disponibles

```powershell
npm run dev
```

Arranca el servidor en modo desarrollo con `tsx watch`.

```powershell
npm run build
```

Compila `src/` a `dist/`.

```powershell
npm start
```

Ejecuta la version compilada.

```powershell
npm test
```

Ejecuta Jest con cobertura.

```powershell
npm run check:spec
```

Ejecuta la verificacion spec-codigo y luego todos los tests.

```powershell
npm run lint
```

Ejecuta TypeScript sin emitir archivos.

## 11. Tutorial De Ejecucion Y Pruebas

Esta seccion resume el flujo completo que se debe seguir para instalar, ejecutar y comprobar el proyecto igual que en la practica.

### Paso 1: Entrar En La Carpeta Del Proyecto

```powershell
cd C:\Users\pablo\Desktop\Practicas\robots
```

### Paso 2: Instalar Dependencias

```powershell
npm install
```

Resultado esperado:

```text
found 0 vulnerabilities
```

### Paso 3: Compilar El Proyecto

```powershell
npm run build
```

Resultado satisfactorio obtenido:

```text
> swiftlend@1.0.0 build
> tsc -p tsconfig.build.json
```

El comando termino correctamente sin errores de TypeScript.

### Paso 4: Ejecutar Tests Y Cobertura

```powershell
npm test
```

Resultado satisfactorio obtenido:

```text
Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
Coverage:    98.09% statements, 92.3% branches, 94.73% functions, 98.09% lines
```

Este resultado supera el requisito de cobertura minima del 80%.

### Paso 5: Ejecutar La Verificacion Contra La Spec

```powershell
npm run check:spec
```

Este comando ejecuta:

- `scripts/checkSpecCompliance.js`.
- Los tests con Jest.
- La comprobacion de que las reglas criticas siguen alineadas con `requirements.md`.

Resultado satisfactorio obtenido:

```text
Spec compliance check passed.
Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
```

### Paso 6: Levantar El Servicio Con Docker

```powershell
docker compose up -d --build
```

Resultado satisfactorio obtenido:

```text
Container swiftlend Started
```

### Paso 7: Probar El Endpoint De Salud

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Resultado satisfactorio obtenido:

```powershell
status service
------ -------
ok     swiftlend
```

### Paso 8: Probar Una Solicitud Aprobada

```powershell
$body = @{
  userId = "6a79cb91-2e46-4de2-a47c-73240f037211"
  email = "founder@company.com"
  birthDate = "1990-05-10"
  creditScore = 720
  externalDebtCents = 100000
  isNewUser = $true
  amountCents = 150000
  planType = "EMPRENDEDOR"
  termMonths = 12
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:3000/loans/applications `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Resultado esperado:

```text
decision.status = APPROVED
loan.interestRate = 0.05
repaymentPlan.interestCents = 7500
repaymentPlan.totalRepaymentCents = 157500
repaymentPlan.monthlyPaymentCents = 13125
```

### Paso 9: Probar Una Solicitud Rechazada

```powershell
$body = @{
  userId = "6a79cb91-2e46-4de2-a47c-73240f037211"
  email = "person@10minutemail.com"
  birthDate = "2010-04-22"
  creditScore = 599
  externalDebtCents = 500001
  isNewUser = $true
  amountCents = 250000
  planType = "EMPRENDEDOR"
  termMonths = 12
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:3000/loans/applications `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Resultado esperado:

```text
decision.status = REJECTED
decision.reasons incluye:
- NEW_USER_AMOUNT_LIMIT
- LOW_CREDIT_SCORE
- TEMP_EMAIL_DOMAIN
- UNDERAGE
- EXTERNAL_DEBT_TOO_HIGH

repaymentPlan = null
```

### Paso 10: Apagar Docker

```powershell
docker compose down
```

Resultado satisfactorio obtenido:

```text
Container swiftlend Removed
Network robots_default Removed
```

## 12. Ejecucion Local Sin Docker

En una terminal:

```powershell
npm run dev
```

En otra terminal:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Respuesta esperada:

```powershell
status service
------ -------
ok     swiftlend
```

## 13. Ejecucion Con Docker

Construir y levantar:

```powershell
docker compose up --build
```

O en segundo plano:

```powershell
docker compose up -d --build
```

Comprobar salud:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Ver logs:

```powershell
docker compose logs -f
```

Apagar:

```powershell
docker compose down
```

## 14. API

Base URL local:

```text
http://localhost:3000
```

### GET /health

Comprueba que el servicio esta vivo.

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Respuesta:

```json
{
  "status": "ok",
  "service": "swiftlend"
}
```

### POST /loans/applications

Evalua una solicitud de prestamo.

Ejemplo aprobado:

```powershell
$body = @{
  userId = "6a79cb91-2e46-4de2-a47c-73240f037211"
  email = "founder@company.com"
  birthDate = "1990-05-10"
  creditScore = 720
  externalDebtCents = 100000
  isNewUser = $true
  amountCents = 150000
  planType = "EMPRENDEDOR"
  termMonths = 12
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:3000/loans/applications `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Respuesta esperada:

```json
{
  "loan": {
    "id": "generated-uuid",
    "userId": "6a79cb91-2e46-4de2-a47c-73240f037211",
    "amountCents": 150000,
    "interestRate": 0.05,
    "status": "APPROVED",
    "planType": "EMPRENDEDOR",
    "termMonths": 12,
    "rejectionReasons": []
  },
  "decision": {
    "status": "APPROVED",
    "reasons": []
  },
  "repaymentPlan": {
    "principalCents": 150000,
    "interestCents": 7500,
    "totalRepaymentCents": 157500,
    "monthlyPaymentCents": 13125,
    "termMonths": 12,
    "currency": "USD"
  }
}
```

Ejemplo rechazado con varias razones:

```powershell
$body = @{
  userId = "6a79cb91-2e46-4de2-a47c-73240f037211"
  email = "person@10minutemail.com"
  birthDate = "2010-04-22"
  creditScore = 599
  externalDebtCents = 500001
  isNewUser = $true
  amountCents = 250000
  planType = "EMPRENDEDOR"
  termMonths = 12
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:3000/loans/applications `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Respuesta esperada:

```json
{
  "decision": {
    "status": "REJECTED",
    "reasons": [
      "NEW_USER_AMOUNT_LIMIT",
      "LOW_CREDIT_SCORE",
      "TEMP_EMAIL_DOMAIN",
      "UNDERAGE",
      "EXTERNAL_DEBT_TOO_HIGH"
    ]
  },
  "repaymentPlan": null
}
```

## 15. Tests Y Cobertura

Ejecutar:

```powershell
npm test
```

Estado verificado:

- Test suites: 4 passed.
- Tests: 16 passed.
- Cobertura global: 98.09%.
- Objetivo requerido: minimo 80%.

Mapa de tests:

- RB-01 a RB-05 y RB-09: `tests/application/EvaluateLoanApplicationUseCase.test.ts`.
- RB-03 normalizacion de dominio: `tests/domain/riskPolicyService.test.ts`.
- RB-06 a RB-08 validacion HTTP: `tests/interfaces/loanApplicationsApi.test.ts`.
- Adaptadores de infraestructura: `tests/infrastructure/systemAdapters.test.ts`.

## 16. Hook De QA

Archivo:

```text
.kiro/hooks.json
```

Configuracion esperada:

```json
{
  "hooks": [
    {
      "name": "Spec compliance on TypeScript save",
      "description": "Runs the local spec compliance check whenever TypeScript source or test files are saved.",
      "event": "onSave",
      "include": [
        "src/**/*.ts",
        "tests/**/*.ts"
      ],
      "actions": [
        {
          "type": "command",
          "command": "npm run check:spec"
        }
      ]
    }
  ]
}
```

El comando `npm run check:spec`:

- Comprueba que `requirements.md` contiene RB-01 a RB-09.
- Comprueba que las tasas `EMPRENDEDOR | 0.05` y `PERSONAL | 0.12` siguen en la spec.
- Comprueba que `swiftLendPolicy.ts` mantiene limites, score, edad, deuda, tasas, plazos y dominios temporales.
- Ejecuta todos los tests.
- Falla si alguien intenta cambiar reglas criticas sin actualizar el contrato.

Ejecutar manualmente:

```powershell
npm run check:spec
```

## 17. Flujo NotebookLM

1. Abrir NotebookLM.
2. Crear un notebook llamado `SwiftLend Spec-to-Code`.
3. Subir o pegar las fuentes de `docs/sources/`:
   - `risk-policy.md`.
   - `rates-and-terms.md`.
   - `technical-style-guide.md`.
4. Abrir `docs/prompts/notebooklm-master-prompt.md`.
5. Copiar el prompt y ejecutarlo en NotebookLM.
6. Comparar la salida con `requirements.md`.
7. Asegurar que se mantienen:
   - Edad minima: 21.
   - Score minimo: 600.
   - Deuda externa maxima: 5000 USD.
   - Limite de usuario nuevo: 2000 USD.
   - Monto minimo: 100 USD.
   - Monto maximo general: 10000 USD.
   - `EMPRENDEDOR`: 5%.
   - `PERSONAL`: 12%.

## 18. Flujo Kiro

1. Abrir Kiro.
2. Seleccionar `Open Folder`.
3. Abrir:

```text
C:\Users\pablo\Desktop\Practicas\robots
```

4. En el chat de Kiro:

```text
Usa requirements.md como fuente de verdad del proyecto SwiftLend. Analiza las reglas RB-01 a RB-09 y confirma que entiendes el contrato antes de modificar nada.
```

5. Verificar que Kiro reconoce:
   - `RB-01`: limite de usuario nuevo.
   - `RB-02`: score minimo.
   - `RB-03`: emails temporales.
   - `RB-04`: edad minima.
   - `RB-05`: deuda externa.
   - `RB-06` a `RB-09`: validaciones de monto, plan y plazo.

6. Probar el hook guardando un archivo `.ts`, por ejemplo:

```text
src/domain/policies/swiftLendPolicy.ts
```

7. Ejecutar la auditoria con el prompt:

```text
docs/prompts/kiro-audit-prompt.md
```

8. Pedir a Kiro:

```text
Actualiza audit-report.md con el resultado final de la auditoria, incluyendo trazabilidad entre requirements.md, RB-01 a RB-09, archivos de implementacion y tests.
```

## 19. Auditoria

El archivo `audit-report.md` resume:

- Cumplimiento de RB-01 a RB-09.
- Evidencias por archivo.
- Evidencias por test.
- Cobertura.
- Arquitectura limpia.
- Uso de Zod.
- Docker funcional.
- Riesgos residuales.

Comando recomendado antes de entregar:

```powershell
npm run check:spec
npm run build
docker compose up -d --build
Invoke-RestMethod http://localhost:3000/health
docker compose down
```

## 20. Solucion De Problemas

### `get http://localhost:3000/health` no funciona

PowerShell no tiene un comando HTTP llamado `get`. Usa:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

### `curl http://localhost:3000/health` no conecta

Probablemente el servidor no esta levantado.

Con Docker:

```powershell
docker compose up -d --build
Invoke-RestMethod http://localhost:3000/health
```

Sin Docker:

```powershell
npm run dev
```

En otra terminal:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

### `kiro-cli` no se reconoce

Usa la ruta completa:

```powershell
& "$env:LOCALAPPDATA\Kiro-Cli\kiro-cli.exe" --help
```

O anade `C:\Users\pablo\AppData\Local\Kiro-Cli` al PATH de usuario.

### `kiro-cli test --check-spec requirements.md` no existe

En Kiro CLI 2.0.1 ese subcomando no esta disponible. Usa:

```powershell
npm run check:spec
```

### Puerto 3000 ocupado

Comprueba que proceso escucha:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

Apaga Docker si el contenedor esta activo:

```powershell
docker compose down
```

## 21. Estado Actual Verificado

- `npm install`: correcto.
- `npm run build`: correcto.
- `npm test`: correcto.
- `npm run check:spec`: correcto.
- `docker compose build`: correcto.
- `docker compose up` + `/health`: correcto.
- Tests: 16/16 pasando.
- Cobertura global: 98.09%.
- Servicio: `http://localhost:3000`.
- Health check obtenido: `status = ok`, `service = swiftlend`.
- Hook de QA configurado con `npm run check:spec`.
- Auditoria disponible en `audit-report.md`.

## 22. Entregables

Para evaluacion, el repositorio contiene:

- `requirements.md`: Master Spec.
- `docs/sources/`: documentos simulados para NotebookLM.
- `docs/prompts/`: prompts de generacion y auditoria.
- `src/`: codigo fuente TypeScript.
- `tests/`: tests automatizados.
- `.kiro/hooks.json`: hook de QA.
- `scripts/checkSpecCompliance.js`: comprobacion anti-trampa.
- `Dockerfile` y `docker-compose.yml`: infraestructura.
- `audit-report.md`: reporte de auditoria.
- `README.md`: instrucciones completas.
