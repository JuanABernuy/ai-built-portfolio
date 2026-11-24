# 004 · Plan técnico

- **Mapa:** se genera una sola vez a SVG estático con `d3-geo` y `world-atlas` (proyección cónica conforme, recortada a Europa). La web solo carga el JSON resultante, sin librerías de mapas.
- **Timeline:** las posiciones se calculan por meses y los solapes se reparten en carriles con un algoritmo voraz. Trabajo y estudios van en grupos de carriles separados.
- **Skills ↔ timeline:** `tagMatchesSkill()` compara etiquetas normalizadas (por ejemplo, "Power Query" coincide con "Power Query M").
- **Enlaces compartibles:** `history.replaceState` al seleccionar un elemento y lectura del hash al montar el componente.
