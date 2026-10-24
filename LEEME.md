# Sitio web de D'Todo Eventos

Sitio estático (HTML, CSS y JavaScript, sin instalar nada) listo para publicar en Vercel.

## Qué contiene

| Archivo / carpeta | Para qué sirve |
|---|---|
| `index.html` | Página de inicio: portada, quiénes somos, categorías, alquiler de local, galería y contacto |
| `catalogo.html` | Catálogo completo (347 artículos) con buscador, filtros y lista para cotizar por WhatsApp |
| `js/catalogo.js` | **Aquí están todos los artículos.** Es el único archivo que hay que tocar para agregar o quitar productos |
| `js/app.js` | El funcionamiento del sitio (no hace falta tocarlo) |
| `css/estilos.css` | Colores y diseño |
| `img/cat/` | Fotos de cada artículo |
| `img/site/` | Logo, portada, galería y fotos del local |
| `vercel.json` | Configuración de Vercel y redirecciones de las páginas viejas de Google Sites |

## Cómo agregar, cambiar o quitar un artículo

1. Guarda la foto en `img/cat/` (por ejemplo `img/cat/silla-nueva.jpg`). Ideal: cuadrada, fondo blanco, menos de 300 KB.
2. Abre `js/catalogo.js`, busca la sección (por ejemplo `"titulo": "Sillas"`) y copia una línea de artículo:
   ```js
   { "n": "Silla nueva", "i": "img/cat/silla-nueva.jpg" },
   ```
   `n` es el nombre que se muestra e `i` es la foto.
3. Para quitar un artículo, borra su línea completa.
4. Guarda, haz commit y push. Vercel publica el cambio solo en un minuto.

El número de WhatsApp para cotizar está en `js/app.js` (línea `var WA = '50378747425'`) y en los enlaces `wa.me` de los dos archivos HTML.

## Publicar por primera vez

### 1. Subir a GitHub
1. En GitHub crea un repositorio nuevo, por ejemplo `dtodo-eventos-web` (puede ser privado).
2. Abre esta carpeta en VS Code y en la Terminal escribe:
   ```bash
   git init
   git add .
   git commit -m "Sitio web D'Todo Eventos"
   git branch -M main
   git remote add origin https://github.com/DTodoEventosv/dtodo-eventos-web.git
   git push -u origin main
   ```

### 2. Publicar en Vercel
1. En vercel.com → **Add New… → Project** → importa `dtodo-eventos-web`.
2. Framework Preset: **Other**. No cambies nada más → **Deploy**.
3. Revisa que se vea bien en la dirección temporal `….vercel.app`.

### 3. Conectar el dominio dtodoeventos.info (Namecheap)
1. En Vercel, dentro del proyecto: **Settings → Domains** → agrega `dtodoeventos.info` y también `www.dtodoeventos.info`. Vercel te mostrará los registros DNS exactos que necesitas.
2. En Namecheap: **Domain List → Manage** junto a dtodoeventos.info → pestaña **Advanced DNS**.
3. Borra los registros que hoy apuntan a Google Sites (normalmente un `CNAME www → ghs.googlehosted.com` y registros `A` o `URL Redirect` en `@`). **No borres** registros `MX` o `TXT` si usas correo con ese dominio.
4. Agrega los que te indicó Vercel. Normalmente son:
   - `A Record` · Host `@` · Value `76.76.21.21`
   - `CNAME Record` · Host `www` · Value el destino que te muestre Vercel (por ejemplo `cname.vercel-dns.com` o uno propio del proyecto)
5. Espera de 10 minutos a unas horas. Cuando Vercel muestre "Valid Configuration", el sitio ya está en línea con candado de seguridad (HTTPS).
6. Opcional: en Google Sites, quita el dominio personalizado del sitio viejo (Configuración → Dominios personalizados) para que no queden dos sitios compitiendo.

Las páginas viejas (`/inicio`, `/Servicios/...`, `/contacto`) redirigen solas a las nuevas, así que los enlaces que ya compartiste siguen funcionando.
