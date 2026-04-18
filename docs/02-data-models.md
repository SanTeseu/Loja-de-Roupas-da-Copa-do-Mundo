
Objetivo: O mapa exato das entidades (1:1, 1:N, N:M) para a IA criar o banco perfeitamente.
Markdown

# Modelagem de Dados

## 1. NationalTeam (1:N com Jersey)
- `id`: UUID (PK)
- `countryName`: String (Obrigatório)
- `confederation`: String

## 2. Jersey (N:1 com NationalTeam, 1:1 com JerseyTechSpec, N:M com Customer)
- `id`: UUID (PK)
- `nationalTeamId`: UUID (FK)
- `edition`: String (ex: "Titular", "Reserva")
- `price`: Decimal
- `stockQuantity`: Integer (Default: 0)

## 3. JerseyTechSpec (1:1 com Jersey)
- `id`: UUID (PK)
- `jerseyId`: UUID (FK, Único)
- `fabricMaterial`: String
- `coolingTechnology`: String

## 4. Customer (N:M com Jersey)
- `id`: UUID (PK)
- `fullName`: String (Obrigatório)
- `email`: String (Único)

## 5. Order (Tabela Pivô - N:M)
Tabela que registra a compra.
- `customerId`: UUID (FK - PK Composta)
- `jerseyId`: UUID (FK - PK Composta)
- `purchaseDate`: DateTime (Default: now)