import { connect } from "amqplib";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let delay = 10000;
let retries = 3;

async function connectWithRetry(url) {
  while (retries) {
    try {
      const connection = await connect(url);
      console.log("Connected to RabbitMQ");
      return connection;
    } catch (err) {
      console.error(`Error connecting to RabbitMQ: ${err}. Retrying...`);
      retries -= 1;
      await wait(delay);
    }
  }
  throw new Error("Failed to connect to RabbitMQ after several attempts");
}

(async () => {
  const connection = await connectWithRetry("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  const informationQueue = "information_queue";

  await channel.assertQueue(informationQueue, { durable: false });

  channel.consume(informationQueue, async (msg) => {
    const { status, productId, quantity } = JSON.parse(msg.content.toString());
    console.log(
      `Information log: Order status: ${status} for Product ID: ${productId}, Quantity: ${quantity}`
    );
    // Espacio para lógica adicional para manejar el estado de la información
  });
})();
