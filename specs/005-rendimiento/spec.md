# 005 · Rendimiento

**Estado:** Implementado · **Fecha:** 23-11-2026

## Contexto
Petición: "más eficiente, que no sea lento, sin quitar ninguna característica".

## Requisitos
- **FR-001** No se elimina ninguna funcionalidad visible.
- **NFR-001** Lighthouse Performance ≥ 90 en móvil y ≥ 95 en escritorio.
- **NFR-002** Reducir a la mitad, como mínimo, los bytes de la carga inicial.
- **NFR-003** Las animaciones continuas se pausan fuera de pantalla o con la pestaña oculta.

## Resultado medido (Lighthouse)
| Métrica | Antes | Después |
|---|---|---|
| Performance móvil | 75 | 94–95 |
| Performance escritorio | 97 | 100 |
| LCP móvil | 4,3 s | 2,6–2,8 s |
| TBT móvil | 410 ms | 110–190 ms |
| Transferencia inicial | 466 KB | 261–268 KB (sin contar el vídeo) |
| Accesibilidad | 95 | 96 |
