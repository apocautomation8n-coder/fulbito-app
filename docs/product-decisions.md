# Fulbito - decisiones MVP

## Producto

- Nombre temporal: Fulbito.
- Desarrollado por: Apoc Automation.
- Email de soporte: apoc@apocautomation.site.
- Web: https://apoc.apocautomation.site.
- Lanzamiento inicial: Cordoba, Argentina.
- Plataformas: Android e iOS desde el inicio.
- Stack mobile: Expo, React Native, TypeScript y Supabase.
- Builds iOS: EAS Build para evitar depender de Mac local al principio.
- Edad minima: 18+.
- Todo requiere login.
- Roles iniciales: jugador, club y admin.

## Login

- Email y contrasena.
- Google.
- Apple, obligatorio si Google queda habilitado en iOS.

## Clubes

- El club se registra solo.
- Puede cargar perfil y canchas antes de estar aprobado.
- No puede recibir reservas online hasta cumplir dos condiciones:
  - verificacion admin aprobada;
  - MercadoPago conectado.
- Puede cargar reservas manuales para bloquear agenda.
- Las reservas manuales no pagan comision.

## Canchas

- Formatos iniciales: todos.
- Duracion default del turno: 60 minutos.
- Cada cancha puede editar su duracion.
- Cada cancha puede definir si cobra pago completo o sena.

## Reservas y pagos

- Toda reserva creada desde Fulbito requiere pago online.
- Fulbito cobra 5% sobre el precio total del turno.
- Si el club cobra sena, Fulbito sigue calculando el 5% sobre el valor total del turno.
- Bloqueo de pago normal: 10 minutos.
- MercadoPago Marketplace es la integracion de salida para MVP.
- No se implementa billetera real en MVP para evitar complejidad regulatoria, soporte financiero y custodia de saldos.

## Split de partidos

- Entra en MVP.
- Recomendacion aplicada: el organizador paga primero su parte.
- Los jugadores aprobados pagan su parte antes del deadline.
- Deadline default: 3 horas antes del partido.
- Cada club puede personalizar el deadline.
- Si no se completa el pago, el organizador puede cubrir lo faltante o liberar/cancelar cupos.

## Cancelaciones

- Politica default configurable por club:
  - 100% hasta 24 horas antes.
  - 50% hasta 3 horas antes.
  - 0% con menos de 3 horas.

## Ubicacion

- Se pide ubicacion como camino principal.
- Si el usuario no otorga permiso, se permite buscar por barrio.
- Mas adelante se puede agregar posicionamiento pago de canchas, pero no entra en MVP.

## Chat

- Sale despues del primer MVP.
- La base de datos queda preparada para mensajes y reportes, pero la UI no prioriza chat.

## Admin MVP

- Pantalla admin dentro de la misma app.
- Acciones iniciales:
  - aprobar/rechazar clubes;
  - ver usuarios;
  - ver pagos/comisiones;
  - suspender cuentas.

## App Store

- Agregar eliminacion de cuenta antes de produccion.
- Agregar reporte/bloqueo de usuarios por contenido social y calificaciones.
- Declarar permisos: ubicacion, fotos y notificaciones.
- Si Google login esta activo en iOS, Apple login tambien debe estar activo.
