# Prompt de Auditoria para Kiro

Audita el repositorio SwiftLend contra `requirements.md`.

Verifica:

1. Que cada regla RB-01 a RB-09 tenga implementacion.
2. Que cada regla tenga al menos un test automatizado.
3. Que los controladores no contengan logica de negocio que deba vivir en dominio o aplicacion.
4. Que las validaciones externas usen Zod.
5. Que las tasas de interes coincidan con la spec.
6. Que no exista una tasa de interes al 0% ni una regla contradictoria a la spec.
7. Que Docker y Docker Compose permitan ejecutar el servicio.

Genera `audit-report.md` con una tabla de cumplimiento, evidencias por archivo y riesgos residuales.
