# Miniaturas del blog

Pon aquí las imágenes de portada de cada artículo.

- Recomendado: relación 16/10 (p.ej. 1200×750), formato `.png`, `.jpg` o `.webp`.
- Nombra el archivo igual que el slug del post: `verifactu-2026.png`.
- Luego, en `app/blog/data.ts`, añade el campo a ese post:

  ```ts
  coverImage: "/blog/verifactu-2026.png",
  ```

Si un post no tiene `coverImage`, se muestra el placeholder de rayas por defecto.
