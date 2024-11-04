import { connect } from "amqplib";

const paymentQueue = "stock_to_payment";
const informationQueue = "payment_to_information";
const compensationQueue = "compensate_payment";

let creditCardBalance = 1000;

async function sendMessage(queue, message) {
  const connection = await connect("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}

async function processPayment(msg) {
  const order = JSON.parse(msg.content.toString());
  const productCost = order.quantity * products[order.productId].price;

  if (creditCardBalance >= productCost) {
    creditCardBalance -= productCost;
    console.log(
      `[Payment] Payment processed. New balance: $${creditCardBalance}`
    );

    try {
      await sendMessage(informationQueue, order);
    } catch (error) {
      console.error("[Payment] Failed to send to information, compensating...");
      creditCardBalance += productCost;
      await sendMessage(compensationQueue, {
        ...order,
        status: "failed_payment",
      });
    }
  } else {
    console.error("[Payment] Insufficient balance, sending failure message...");
    await sendMessage(compensationQueue, {
      ...order,
      status: "failed_payment",
    });
  }
}

(async () => {
  const connection = await connect("amqp://user:password@rabbitmq");
  const channel = await connection.createChannel();
  await channel.assertQueue(paymentQueue, { durable: false });
  await channel.consume(paymentQueue, processPayment, { noAck: true });
})();
