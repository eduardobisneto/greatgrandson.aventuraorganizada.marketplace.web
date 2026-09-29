# Aventura Organizada

Site institucional da Aventura Organizada, agência de turismo de aventura com roteiros pelo Brasil.

## Desenvolvimento

Requer [Bun](https://bun.sh).

```sh
bun install
bun run dev
```

## Build

```sh
bun run build
```

## Portas

Esquema fixo em todo repositório da Aventura Organizada (host:container),
pra nunca colidir quando mais de um serviço sobe ao mesmo tempo:

| Serviço | Porta |
| --- | --- |
| identity.api | 5000:8080 |
| marketplace.api | 5001:8080 |
| viagens.api | 5002:8080 |
| financeiro.api | 5003:8080 |
| **marketplace.web** (este repo) | **3000:3000** |
| backoffice.web | 3001:3000 |

## Docker

Dois arquivos aqui:

- **`docker-compose.yml`** — só este serviço, isolado, na porta 3000.
  100% mockado (localStorage), não depende de nenhuma API rodando.

  ```sh
  docker compose up --build
  ```

- **`docker-compose.stack.yml`** — a **stack completa** (marketplace.web
  + backoffice.web + marketplace.api + identity.api + viagens.api +
  financeiro.api). Requer os outros 5 repositórios clonados como pastas
  irmãs desta (ver comentário no topo do arquivo) e um Postgres já
  rodando no host com os bancos criados (ver scripts em cada API).

  ```sh
  cp .env.example .env
  docker compose -f docker-compose.stack.yml up --build
  ```

Sem compose, equivalente na mão pra só este serviço:

```sh
docker build -t greatgrandson-aventuraorganizada-marketplace-web .
docker run -p 3000:3000 greatgrandson-aventuraorganizada-marketplace-web
```

## Stack

- TanStack Start
- TypeScript
- React
- Tailwind CSS
