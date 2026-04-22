# Configuración de Hook de QA

## Evento onSave en TypeScript

### ✅ Hook Configurado

**Archivo**: `.kiro/hooks.json`

```json
{
  "hooks": [
    {
      "name": "Spec compliance on TypeScript save",
      "description": "Runs the Kiro spec check whenever TypeScript source or test files are saved.",
      "event": "onSave",
      "include": [
        "src/**/*.ts",
        "tests/**/*.ts"
      ],
      "actions": [
        {
          "type": "command",
          "command": "kiro test --check-spec requirements.md"
        }
      ]
    }
  ]
}
```

### Comportamiento

**Trigger**: Cada vez que se guarda un archivo `.ts` en `src/` o `tests/`

**Acción**: Ejecuta `npm run check:spec` que:
1. Verifica tokens requeridos en `requirements.md`
2. Verifica tokens requeridos en `src/domain/policies/swiftLendPolicy.ts`
3. Ejecuta todos los tests con Jest
4. Verifica cobertura mínima del 80%

### Script de Verificación

**Archivo**: `scripts/checkSpecCompliance.js`

**Tokens verificados en requirements.md:**
- RB-01 a RB-09
- EMPRENDEDOR | 0.05
- PERSONAL | 0.12

**Tokens verificados en swiftLendPolicy.ts:**
- minimum: 10_000 (RB-06)
- generalMaximum: 1_000_000 (RB-07)
- newUserMaximum: 200_000 (RB-01)
- externalDebtMaximum: 500_000 (RB-05)
- minimumCreditScore = 600 (RB-02)
- minimumApplicantAge = 21 (RB-04)
- annualInterestRate: 0.05 (EMPRENDEDOR)
- annualInterestRate: 0.12 (PERSONAL)
- allowedTerms: [6, 12, 18] (EMPRENDEDOR)
- allowedTerms: [3, 6, 12] (PERSONAL)
- "tempmail.com" (RB-03)
- "10minutemail.com" (RB-03)

### Ejecución Manual

```bash
kiro test --check-spec requirements.md
```

### Protección Anti-Trampa

El hook detecta automáticamente cuando el código contradice `requirements.md`:

**Ejemplo de trampa detectada:**
```typescript
// Si un estudiante cambia:
annualInterestRate: 0.00  // ❌ Spec dice 0.05

// Kiro detecta la discrepancia y falla el hook
```

**Escenarios protegidos:**
- ❌ Modificar tasas de interés (0.05 → 0.00)
- ❌ Cambiar límites de montos (RB-06, RB-07)
- ❌ Alterar edad mínima (RB-04: 21 años)
- ❌ Modificar score mínimo (RB-02: 600)
- ❌ Cambiar límites de deuda (RB-05: $5,000)
- ❌ Alterar términos permitidos (RB-09)

Ver `docs/hook-protection-demo.md` para ejemplos detallados.

### Estado Actual

✅ **Hook activo y funcionando**
✅ **Spec compliance check: PASSED**
✅ **Tests: 16/16 passing**
✅ **Coverage: 98.09% (>80% required)**

### Ejemplo de Salida Exitosa

```
Spec compliance check passed.

Test Suites: 4 passed, 4 total
Tests:       16 passed, 16 total
Coverage:    98.09%
```

### Ejemplo de Salida con Error

Si falta un token requerido:

```
Spec compliance check failed:
- requirements.md is missing required token: RB-01
- src/domain/policies/swiftLendPolicy.ts is missing required token: minimumCreditScore = 600
```

El hook previene commits que rompan la alineación con la spec.
