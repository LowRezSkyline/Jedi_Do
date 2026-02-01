# JEDI-do

Jedi To-Do and Do Not Do list — **Do or Do Not! There is no try!**

A simple TODO app with two types: **Do!** and **Not Do!** (e.g. "Do! Talk to Yoda", "Not Do! Kiss Chewy").

## Requirements

- **.NET 10 SDK** — [Download](https://dotnet.microsoft.com/download) (or use the latest LTS SDK that supports `net10.0`).

## Run locally

```bash
cd JEDI_DO
dotnet run
```

- App: **https://localhost:5001** (or the URL in `launchSettings.json`).
- Root page: launcher to choose front-end (VanillaJS, Vue, Svelte, Angular, React).
- VanillaJS app: **https://localhost:5001/vanillajs/**.
- API: **https://localhost:5001/api/JediDoItems**.

Data is stored in **SQLite** (`JediDo.db` in the project folder). For a clean database, delete `JediDo.db` and run again; migrations and seed will recreate it.

## Tech stack

- **.NET 10** — ASP.NET Core minimal hosting, C# with nullable reference types and implicit usings.
- **SQLite** — Single, self-contained database (no SQL Server or in-memory option).
- **Entity Framework Core 10** — Migrations create/update the schema.
- **Shared library** — Entities and DTOs in `Shared`, context and app logic in `JEDI_DO`.
- **Front-ends** — VanillaJS (Bootstrap 5 CDN + vanilla JS) under `/vanillajs/`; placeholders for Vue, Svelte, Angular, React (Phase 2).

## Concepts

- CRUD API for JediDo items (Create, Read, Update, Delete).
- Dependency injection (DbContext, `IItemToDTOFactory`).
- Factory pattern for entity → DTO mapping.
- REST API; Postman collection in `Shared/Postman/`.
- Docker support (see below).

## Docker

```bash
docker compose up --build
```

Uses .NET 10 SDK image; app runs with `dotnet watch run` and listens on port 5001.

## Project layout

- **JEDI_DO/** — Web app: `Program.cs` (minimal hosting), `Models/` (DbContext), `Data/` (Seed), `Controllers/`, `wwwroot/`.
- **Shared/** — `Entities/` (JediDoItem), `DTOs/`, `Factories/` (item → DTO), `Postman/`.
- **wwwroot/** — `index.html` (launcher), `vanillajs/` (current UI), `assets/`, and placeholder folders for Vue, Svelte, Angular, React.
