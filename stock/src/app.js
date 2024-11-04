import { connect } from "amqplib";

const stockQueue = "order_to_stock";
const paymentQueue = "stock_to_payment";
const compensationQueue = "compensate_stock";

const products = {
  1: { quantity: 10, price: 100 },
  2: { quantity: 5, price: 200 },
  3: { quantity: 2, price: 300 },
};

async function sendMessage(queue, message) {
  const connection = await connect("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}

async function processOrder(msg) {
  const order = JSON.parse(msg.content.toString());
  const product = products[order.productId];

  if (product && product.quantity >= order.quantity) {
    // Descontar stock
    product.quantity -= order.quantity;
    console.log(`[Stock] Stock updated:`, products);

    try {
      await sendMessage(paymentQueue, order);
    } catch (error) {
      console.error("[Stock] Failed to send order to payment, compensating...");
      // Compensación: Reasignar stock
      product.quantity += order.quantity;
      await sendMessage(compensationQueue, {
        ...order,
        status: "failed_stock",
      });
    }
  } else {
    console.error(
      "[Stock] Insufficient stock, sending failure message to order..."
    );
    await sendMessage(compensationQueue, { ...order, status: "failed_stock" });
  }
}

(async () => {
  const connection = await connect("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  await channel.assertQueue(stockQueue, { durable: false });
  await channel.consume(stockQueue, processOrder, { noAck: true });
})();
