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

## Clubes

- El club se registra solo.
- Puede cargar perfil y canchas antes de estar aprobado.
- No puede recibir reservas online hasta tener verificacion admin aprobada.
- No necesita conectar MercadoPago para recibir reservas en el MVP.
- Puede cargar reservas manuales para bloquear agenda.
- Las reservas manuales no pagan comision.

## Canchas

- Formatos iniciales: todos.
- Duracion default del turno: 60 minutos.
- Cada cancha puede editar su duracion.
- En MVP, cada cancha usa pago en club.
- Apertura a padel: conviene preparar el modelo como multi-deporte porque muchos clubes tienen futbol y padel. Recomendacion: mantener Fulbito enfocado visualmente en clubes deportivos y agregar `deporte` por cancha: futbol o padel. Padel puede entrar como segunda vertical sin crear otra app.
- Implementacion tecnica: agregar `sport` en `courts` con valores `football` y `padel`. Default `football` para canchas existentes. En UI, futbol mantiene formatos 5v5, 6v6, 7v7, 8v8, 9v9, 11v11 u otro; padel usa 1v1 o 2v2.

## Reservas y pagos

- Toda reserva creada desde Fulbito requiere una tarifa online para bloquear el turno.
- Fulbito cobra 5% sobre el precio total del turno.
- El jugador paga 2.5% online al reservar.
- El jugador paga el valor completo del turno directamente en el club.
- El club acumula el 2.5% restante para el cierre mensual.
- La comision total de Fulbito es 5%: 2.5% jugador + 2.5% club.
- Bloqueo de pago normal: 10 minutos.
- MercadoPago se usa desde la cuenta de Fulbito para cobrar la tarifa de reserva online.
- El dia 1 de cada mes se genera automaticamente un link de pago para que el club pague la comision pendiente.
- El link mensual dura 10 dias.
- Si el club no paga dentro de esos 10 dias, su perfil queda bloqueado y no puede recibir ni agendar reservas desde Fulbito hasta regularizar la deuda.
- No se implementa billetera real en MVP para evitar complejidad regulatoria, soporte financiero y custodia de saldos.
- Flujo MVP: el jugador paga la tarifa de reserva en la app y paga el turno en el club en efectivo, transferencia o MercadoPago del club.
- Evitar en MVP que Fulbito cobre todo y luego transfiera manualmente al club, salvo validacion legal/contable previa.
- Futuro: evaluar pago completo online con MercadoPago Marketplace/Split cuando haya validacion legal y operativa.
- n8n puede usarse para automatizaciones operativas: escuchar webhooks de pago, marcar reservas como pagadas, avisar al club, generar comprobantes y disparar conciliacion.

## Clubes - gestion y retencion

- Agregar estadisticas para que el club vea valor de gestion:
  - turnos reservados;
  - ocupacion por dia y horario;
  - facturacion estimada;
  - pagos online vs efectivo;
  - cancelaciones;
  - clientes recurrentes;
  - rendimiento por cancha.
- Agregar tienda del club para vender productos o servicios: bebidas, indumentaria, alquiler de pecheras, eventos, torneos o promociones.
- Agregar vista kiosco como caja rapida: productos, cantidades, metodo de pago, total, stock y cierre diario. Esto ayuda a vender Fulbito como software de bolsillo para clubes, no solo marketplace.
- Fulbito no cobra comision sobre ventas del kiosco; esas ventas son 100% del club. Kiosco es una herramienta de gestion/caja.
- Agregar modulo Caja/Finanzas dentro de la pestana de pagos: ingresos por turnos, ingresos por kiosco, egresos, neto estimado y cierre mensual pendiente. No duplicar reglas de bloqueo ni explicaciones de comision que ya estan en Perfil; usar "Caja" como nombre visible.
- Agenda post-partido: despues del turno, el club debe poder marcar asistencia/no-show y calificar al organizador. Esa validacion alimenta confianza y suma pocos puntos verificados al ranking del jugador.
- Posicionamiento del producto para clubes: ademas de conseguir turnos, Fulbito funciona como software de gestion.

## Jugadores - crecimiento

- Guardar idea de ranking de jugadores por puntos, partidos jugados y partidos ganados.
- Cuando la red llegue aproximadamente a 100/150 clubes, evaluar premios mensuales para el top 3.
- Objetivo del ranking: incentivar recurrencia, referidos y actividad; los jugadores compiten, ganan premios y atraen mas personas a los clubes.
- Perfil deportivo jugador: el jugador puede elegir futbol, padel o ambos. Futbol tiene atributos propios como posicion, pie habil y numero; padel tiene lado preferido, estilo y nivel. Si elige ambos, conserva ambos perfiles.
- Ranking: es global para futbol y padel. Los puntos de ambos deportes suman en la misma tabla mensual.
- Antifraude ranking/premios: solo suman puntos partidos con reserva real, pago registrado, asistencia validada por el club y actividad consistente. Antes de pagar premios top 3, Fulbito debe revisar patrones sospechosos como reservas falsas, grupos repetidos, clubes vinculados al jugador, cancelaciones/no-shows y actividad creada solo para subir puntos.
- Resultados para ranking: el club no carga quien gano porque normalmente no sabe el resultado. El club solo valida asistencia/no-show. El organizador declara el resultado y los jugadores confirman. Si hay consenso, suma victoria al equipo ganador. Si hay disputa, el partido queda cerrado, suma asistencia/partido jugado, pero no suma victoria a nadie.
- Cobro de premios: el perfil de jugador debe pedir alias de transferencia antes de cobrar premios.

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
