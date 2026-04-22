# Manual de Procedimientos de Riesgo Crediticio - SwiftLend v2.4

Departamento: Cumplimiento y Operaciones

## 1. Requisitos de Elegibilidad del Solicitante

Edad minima: Para mitigar riesgos legales, el solicitante debe tener al menos 21 anos cumplidos al momento de la solicitud.

Validacion de identidad: Es obligatorio el uso de correos electronicos corporativos o de dominios verificados. Se prohibe explicitamente el registro con dominios de correos temporales, incluyendo `tempmail.com` y `10minutemail.com`.

## 2. Umbrales de Aprobacion

RB-01: Los usuarios nuevos, sin historial en SwiftLend, tienen un limite maximo de desembolso de $2,000.

RB-02: El sistema debe rechazar automaticamente cualquier solicitud cuyo puntaje de credito sea inferior a 600 puntos.

RB-03: No se autorizaran prestamos si el usuario posee deudas externas reportadas superiores a $5,000, independientemente de su score.
