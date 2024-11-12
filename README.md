Este es un proyecto de prueba para probar el funcionamiento de RabbitMQ implementando el patrón de SAGA.

Para ejecutar el proyecto, sigue los siguientes pasos:

1. Ejecuta el Docker Compose:

```bash
docker compose up --build
```

2. Envia una petición tipo `POST` al servidor send en `http://localhost:3000`:

```bash
{
  "productId": 1,
  "quantity": 3
}
```

## Información

### Stock

Esta precargado con 3 productos:

| id  | cantidad | precio |
| --- | -------- | ------ |
| 1   | 10       | 100    |
| 2   | 5        | 200    |
| 3   | 2        | 300    |

### Payment

Esta precargado con un saldo de **500**.
