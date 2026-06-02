# Nordico Admin — Panel de Administración

Panel interno para gestionar los precios de productos y servicios del sitio web de Nordico. Los cambios que se hacen aquí se reflejan en tiempo real en el sitio público.

**URL en producción:** [nordico-admin.vercel.app](https://nordico-admin.vercel.app)

---

## Qué hace este panel

- Editar el **precio por unidad** de cada modelo de loseta atérmica
- Activar/desactivar productos o marcarlos con etiquetas especiales (ej. "Más vendido")
- Gestionar los precios de **servicios adicionales** (Laca anticorrosiva, Cemento cola, etc.)
- Todo protegido por una contraseña de acceso simple

---

## Stack tecnológico

| Tecnología | Uso |
|-----------|-----|
| React 18 | UI |
| Vite | Bundler y servidor de desarrollo |
| Tailwind CSS v3 | Estilos |
| Supabase | Base de datos (lectura y escritura) |
| Vercel | Hosting y deploy |

---

## Levantar localmente

```bash
npm install
npm run dev
# Disponible en http://localhost:5173
```

### Variables de entorno

Crear un archivo `.env` en esta carpeta con:

```env
VITE_SUPABASE_URL=<URL del proyecto Supabase>
VITE_SUPABASE_ANON_KEY=<clave anónima de Supabase>
```

Estos valores están en el dashboard de Supabase → Project Settings → API.

> Hay un archivo `.env.example` en esta carpeta como referencia.

---

## Estructura de carpetas

```
src/
├── components/
│   ├── LoginGate.tsx       # Pantalla de contraseña de acceso
│   ├── ProductsTable.tsx   # Tabla para editar productos
│   ├── ServicesTable.tsx   # Tabla para editar servicios
│   └── PriceInput.tsx      # Input inline para editar precios
├── lib/
│   └── supabaseClient.ts   # Cliente de Supabase inicializado
├── App.tsx                 # Componente principal
├── types.ts                # Tipos TypeScript
└── main.tsx                # Entry point
```

---

## Tablas de Supabase

El panel edita directamente las tablas:

- **`products`**: modelos de losetas (`key`, `name`, `price_unit`, `tag`, `order`)
- **`services`**: servicios adicionales (`id`, `label`, `price`, `type`, `price_label`)

---

## Deploy

El deploy es automático via Vercel al hacer push a `main`.

```bash
npm run build   # build de producción
```
