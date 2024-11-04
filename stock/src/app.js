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

const products = {
  1: { stock: 10, price: 100 },
  2: { stock: 5, price: 200 },
  3: { stock: 0, price: 300 },
};

(async () => {
  const connection = await connectWithRetry("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  const orderQueue = "order_queue";
  const paymentQueue = "payment_queue";

  await channel.assertQueue(orderQueue, { durable: false });
  await channel.assertQueue(paymentQueue, { durable: false });

  channel.consume(orderQueue, async (msg) => {
    const { productId, quantity } = JSON.parse(msg.content.toString());
    console.log(
      `Stock received order: ${JSON.stringify({ productId, quantity })}`
    );

    if (products[productId].stock >= quantity) {
      products[productId].stock -= quantity;
      console.log(
        `Stock updated for product ${productId}: ${products[productId].stock}`
      );

      const totalPrice = products[productId].price * quantity;
      channel.sendToQueue(
        paymentQueue,
        Buffer.from(JSON.stringify({ productId, quantity, totalPrice }))
      );
    } else {
      console.error("Insufficient stock");
    }
  });
})();
