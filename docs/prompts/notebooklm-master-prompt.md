# Prompt Maestro para NotebookLM

Actua como analista senior de requisitos para un microservicio fintech llamado SwiftLend.

Usa exclusivamente las fuentes cargadas. No inventes reglas. Si una regla es ambigua, marca la decision como "requiere confirmacion".

Genera un archivo `requirements.md` en formato EARS que incluya:

1. Contexto del sistema.
2. Stack tecnologico.
3. Entidades y campos.
4. Contrato HTTP para `GET /health` y `POST /loans/applications`.
5. Reglas de negocio numeradas como `RB-*`.
6. Criterios de aceptacion.
7. Casos de error.
8. Trazabilidad entre cada regla y la fuente documental.

Incluye explicitamente las reglas sobre edad minima, score minimo, deuda externa maxima, limite de usuario nuevo, dominios temporales, tasas por tipo de plan y plazos permitidos.
