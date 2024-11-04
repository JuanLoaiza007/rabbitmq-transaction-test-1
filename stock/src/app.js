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

let productStock = {
  1: { quantity: 10, price: 100 },
  2: { quantity: 5, price: 200 },
  3: { quantity: 2, price: 300 },
};

(async () => {
  const connection = await connectWithRetry("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  const orderQueue = "order_queue";
  const paymentQueue = "payment_queue";
  const paymentCompensationQueue = "stock_compensation_queue"; // Cola de compensación

  await channel.assertQueue(paymentQueue, { durable: false });
  await channel.assertQueue(orderQueue, { durable: false });
  await channel.assertQueue(paymentCompensationQueue, { durable: false });

  channel.consume(orderQueue, async (msg) => {
    const { productId, quantity } = JSON.parse(msg.content.toString());
    console.log(
      `Stock processing order: ${JSON.stringify({ productId, quantity })}`
    );

    if (productStock[productId].quantity >= quantity) {
      productStock[productId].quantity -= quantity;
      console.log(
        `Stock updated for productId ${productId}. New quantity: ${productStock[productId].quantity}`
      );
      // Enviar orden a Payment
      channel.sendToQueue(
        paymentQueue,
        Buffer.from(
          JSON.stringify({
            productId,
            quantity,
            totalPrice: productStock[productId].price * quantity,
          })
        )
      );
    } else {
      console.error("Insufficient stock for productId:", productId);
      // TODO: informacion a order
    }
  });

  // Consumir de la cola de compensación
  channel.consume(paymentCompensationQueue, async (msg) => {
    const { productId, quantity } = JSON.parse(msg.content.toString());
    console.log(
      `Restoring stock for productId: ${productId}, quantity: ${quantity}`
    );
    productStock[productId].quantity += quantity; // Reasigna el stock
    console.log(
      `Stock restored for productId ${productId}. New quantity: ${productStock[productId].quantity}`
    );
    // TODO: Logica adicional para informar a order
  });
})();
