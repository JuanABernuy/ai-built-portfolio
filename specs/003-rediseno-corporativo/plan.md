# 003 · Plan técnico

## Sistema de diseño
- **Colores** (Tailwind y variables CSS): fondo `#F8FAFC`, superficies blancas, bordes `#E2E8F0`, texto `#0F172A`, marca `#0B2A4A` y acento `#1D4ED8`.
- **Tipografía:** Inter; JetBrains Mono solo para fechas.
- **Componentes:** tarjetas blancas con borde de 1 px y sombra suave; botones con radio de 8 px.

## Maquetación
- Contenedor único `.site-container`: 1280 px de ancho y margen lateral `--edge = clamp(16px, 3.5vw, 48px)`. Lo usan la barra superior, todas las secciones y el pie.
- Los botones flotantes se alinean al mismo `--edge`.

## Movimiento
- Aparición al hacer scroll: 16 px, 0,5 s, una sola vez.
- Inclinación de tarjetas máxima de 4°, sin reflejos.
- Se eliminan los efectos de texto que se descodifican.
