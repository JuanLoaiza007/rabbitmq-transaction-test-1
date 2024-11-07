#!/bin/bash

# Crear el cluster de k3d
echo "Creando el cluster de k3d..."
k3d cluster create mycluster --agents 1 \
  -p "5672:30080@agent:0" \
  -p "15672:30081@agent:0" \
  -p "3000:30082@agent:0" 

# Aplicar los despliegues
echo "Aplicando despliegues..."

echo "Aplicando despliegue de rabbitmq"
kubectl apply -f rabbitmq/rabbitmq-deployment.yaml

# echo "Esperando a que RabbitMQ esté en estado Running..."
# kubectl wait --for=condition=ready pod -l app=rabbitmq --timeout=600s

# echo "Aplicando despliegues dependientes de rabbitmq"
# kubectl apply -f order/order-deployment.yaml
# kubectl apply -f stock/stock-deployment.yaml
# kubectl apply -f information/information-deployment.yaml
# kubectl apply -f payment/payment-deployment.yaml

echo "Despliegues aplicados con éxito."
