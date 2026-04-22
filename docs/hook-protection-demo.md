# Demostración de Protección del Hook de QA

## Objetivo

El hook `onSave` debe detectar cuando un estudiante intenta modificar valores de negocio que contradicen la especificación original en `requirements.md`.

## Configuración del Hook

**Archivo**: `.kiro/hooks.json`

```json
{
  "hooks": [
    {
      "name": "Spec compliance on TypeScript save",
      "event": "onSave",
      "include": ["src/**/*.ts", "tests/**/*.ts"],
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

## Escenario de Trampa: Bajar Tasa de Interés a 0%

### ❌ Intento de Modificación Fraudulenta

Un estudiante intenta modificar `src/domain/policies/swiftLendPolicy.ts`:

```typescript
// ANTES (correcto según spec)
export const planPolicy: Record<PlanType, {...}> = {
  EMPRENDEDOR: {
    annualInterestRate: 0.05,  // 5% según requirements.md
    allowedTerms: [6, 12, 18]
  },
  PERSONAL: {
    annualInterestRate: 0.12,  // 12% según requirements.md
    allowedTerms: [3, 6, 12]
  }
};

// DESPUÉS (trampa)
export const planPolicy: Record<PlanType, {...}> = {
  EMPRENDEDOR: {
    annualInterestRate: 0.00,  // ❌ TRAMPA: 0% no está en la spec
    allowedTerms: [6, 12, 18]
  },
  PERSONAL: {
    annualInterestRate: 0.00,  // ❌ TRAMPA: 0% no está en la spec
    allowedTerms: [3, 6, 12]
  }
};
```

### 🛡️ Detección Automática del Hook

Cuando el estudiante guarda el archivo `.ts`, el hook ejecuta:

```bash
kiro test --check-spec requirements.md
```

**Kiro analiza:**

1. **Lee `requirements.md` (fuente de verdad)**:
   ```
   | planType    | annualInterestRate | allowedTerms |
   | ----------- | -----------------: | ------------ |
   | EMPRENDEDOR |               0.05 | 6, 12, 18    |
   | PERSONAL    |               0.12 | 3, 6, 12     |
   ```

2. **Lee el código modificado** en `swiftLendPolicy.ts`:
   ```typescript
   annualInterestRate: 0.00  // ❌ No coincide con spec
   ```

3. **Compara y detecta la discrepancia**:
   - Spec dice: `EMPRENDEDOR: 0.05`
   - Código dice: `EMPRENDEDOR: 0.00`
   - **CONTRADICCIÓN DETECTADA** ❌

### 🚫 Resultado del Hook

```
❌ Spec compliance check FAILED

Discrepancies found:
- swiftLendPolicy.ts: annualInterestRate for EMPRENDEDOR is 0.00, 
  but requirements.md specifies 0.05
- swiftLendPolicy.ts: annualInterestRate for PERSONAL is 0.00, 
  but requirements.md specifies 0.12

The code contradicts the specification.
Please revert changes or update requirements.md if this is intentional.
```

### ✅ Protección Garantizada

El hook previene:
- ❌ Modificar tasas de interés sin actualizar la spec
- ❌ Cambiar límites de montos (RB-06, RB-07)
- ❌ Modificar edad mínima (RB-04)
- ❌ Cambiar score mínimo (RB-02)
- ❌ Alterar límites de deuda (RB-05)
- ❌ Modificar términos permitidos (RB-09)

## Otros Escenarios de Trampa Detectados

### Escenario 2: Eliminar Validación de Edad

```typescript
// TRAMPA: Comentar validación de edad
// if (calculateAge(application.birthDate, applicationDate) < minimumApplicantAge) {
//   reasons.push("UNDERAGE");
// }
```

**Detección**: Los tests fallarán porque RB-04 requiere que menores de 21 sean rechazados.

### Escenario 3: Aumentar Límite de Usuario Nuevo

```typescript
// TRAMPA: Cambiar de $2,000 a $10,000
export const loanAmountLimitsCents = {
  newUserMaximum: 1_000_000,  // ❌ Spec dice 200_000
  ...
};
```

**Detección**: Kiro detecta que `newUserMaximum: 200_000` no está en el código.

## Flujo de Trabajo Correcto

Si un estudiante necesita cambiar una regla de negocio:

1. **Primero**: Actualizar `requirements.md` con la nueva regla
2. **Segundo**: Modificar el código para reflejar la nueva spec
3. **Tercero**: Actualizar los tests
4. **Resultado**: Hook pasa porque código y spec están alineados ✅

## Comando Manual

Para verificar manualmente:

```bash
kiro test --check-spec requirements.md
```

Este comando es la fuente de verdad para validar que el código implementa exactamente lo que dice la especificación.
