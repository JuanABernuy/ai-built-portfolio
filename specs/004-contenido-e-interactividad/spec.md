# 004 · Contenido real e interactividad

**Estado:** Implementado · **Fechas:** 23-11-2026 / 24-11-2026

## Contexto
La primera versión tenía datos de relleno y algunos inventados. Fuentes válidas: mi CV en PDF y mi perfil de LinkedIn.

## Requisitos de contenido
- **FR-001** Experiencia real: Bullboat (Logistics & Operations Intern → Business Systems Analyst), Zamora Company y Multiservicios Byntel, con fechas.
- **FR-002** Formación real: ADE, Data Science, Erasmus en Tallin, Santander X, idiomas, cursos y certificaciones.
- **FR-003** Enlaces reales a LinkedIn y GitHub. El CV descargable es el PDF real.

## Requisitos de interactividad
- **FR-004** Timeline tipo Gantt con selección por clic o flechas, panel de detalle y filtro Trabajo / Estudios / Todo. En móvil, vertical.
- **FR-005** Mapa de Europa con Madrid y Tallin, zoom al elegir una ciudad e interruptor de operaciones en remoto (almacenes de Países Bajos y Reino Unido).
- **FR-006** Al pulsar una skill se resaltan en el timeline los puestos donde se ha usado.
- **FR-007** Enlaces compartibles: `#project-<id>`, `#role-<id>` y `#city-<id>`.

## Criterios de aceptación
- Abrir `/#role-zamora` selecciona el puesto de Zamora en el timeline.
- Fijar la skill "Power BI" resalta los dos puestos de Bullboat.
- Ningún dato de la web contradice el CV ni LinkedIn.
