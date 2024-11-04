Este es un proyecto de prueba para probar el funcionamiento de RabbitMQ.

Para ejecutar el proyecto, sigue los siguientes pasos:

1. Ejecuta el Docker Compose:

```bash
docker compose up --build
```

2. Envia una petición tipo `POST` al servidor send en `localhost:3000`:

- Cuerpo para mensaje:

```
  {
    "type": "message",
    "content": "Hola mundo"
  }
```

- Cuerpo para número:

```
  {
    "type": "number",
    "content": "123456789"
  }
```
