FROM rabbitmq:3.10-management-alpine

COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf
COPY enabled_plugins /etc/rabbitmq/enabled_plugins
COPY definitions.json /etc/rabbitmq/definitions.json

EXPOSE 5672 15672

CMD ["rabbitmq-server", "-load_definitions", "/etc/rabbitmq/definitions.json"]