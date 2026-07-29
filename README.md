# PoE League Tracker

Aplicación privada para nuestra liga de **Path of Exile**, pensada para un grupo reducido de jugadores. Permite registrar los objetos que cada uno necesita, ver qué está buscando el resto del grupo y marcar los items como encontrados una vez conseguidos.

Construida con [Nuxt](https://nuxt.com) y [Nuxt UI](https://ui.nuxt.com).

## Funcionalidades

- ➕ **Agregar objetos**: cada jugador puede registrar los items que necesita para su build o progresión.
- 👀 **Ver necesidades del grupo**: lista compartida de todo lo que el equipo está buscando, para saber qué guardar cuando dropea.
- ✅ **Marcar como encontrado**: al conseguir un objeto se marca como encontrado/entregado y desaparece de la lista de pendientes.
- 🔒 Uso privado, pensado solo para los miembros de la liga.

## Stack

- **Frontend**: Nuxt + Nuxt UI
- **Backend**: API propia + base de datos // Items desde docs.poe.watch o poewiki.net

## Setup

Instalar las dependencias:

```bash
pnpm install
```

Crear un archivo `.env` en la raíz del proyecto con las variables necesarias (ver `.env.example`):

```bash
# Ejemplo
NUXT_SESSION_PASSWORD=
```

## Servidor de desarrollo

Levantar el servidor de desarrollo en `https://poe.localhost/`: <br>
Requiere [Portless](https://github.com/vercel-labs/portless)

```bash
pnpm dev
```

## Producción

Compilar la aplicación para producción:

```bash
pnpm build
```

Previsualizar el build de producción localmente:

```bash
pnpm preview
```

Más info en la [documentación de deployment de Nuxt](https://nuxt.com/docs/getting-started/deployment).

## Roadmap / ideas futuras

- [ ] Crear grupos para separar diferentes ligas
  - [ ] Listar ligas disponibles para guardar (usado en api)
  - [ ] Generar código/link de invitation
- [ ] Notificaciones cuando alguien agrega un item que otro está buscando
- [ ] Historial de items encontrados por jugador
