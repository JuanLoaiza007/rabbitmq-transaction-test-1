
k3d cluster create mycluster --agents 1 \
  -p "3000:30081@agent:0"

# Delete  with
# k3d cluster delete mycluster

# Apply operator
kubectl apply -f https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml

# Check if the operator is running
# kubectl -n rabbitmq-system get all

# Delete content
# kubectl -n rabbitmq-system delete all --all
# Delete namespace
# kubectl delete namespace rabbitmq-system

# Create configmap
kubectl create configmap definitions --from-file=rabbitmq/definitions.json -n rabbitmq-system
# Deploy the RabbitMQ cluster
kubectl apply -f rabbitmq/rabbitmq-deployment.yaml

# Delete deployment
# kubectl delete RabbitmqCluster rabbit -n rabbitmq-system
# or
# kubectl delete -f rabbitmq/rabbitmq-deployment.yaml

# Check if the RabbitMQ cluster is running
# kubectl get all -l app.kubernetes.io/name=rabbitmq-cluster

# Do a port forward to access the RabbitMQ management console using localhost:15672
kubectl port-forward -n rabbitmq-system pod/rabbit-server-0 8080:15672
# or
# kubectl port-forward -n rabbitmq-system rabbit-server-0 8080:15672

# Get the username
RABBITMQ_USERNAME=$(kubectl -n rabbitmq-system get secret rabbit-default-user -o jsonpath="{.data.username}" | base64 --decode)
# Get the password
RABBITMQ_PASSWORD=$(kubectl -n rabbitmq-system get secret rabbit-default-user -o jsonpath="{.data.password}" | base64 --decode)

echo "Username: $RABBITMQ_USERNAME"
echo "Password: $RABBITMQ_PASSWORD"

kubectl apply -f order/order-deployment.yaml
# kubectl delete deployment order-deployment
kubectl apply -f stock/stock-deployment.yaml
# kubectl delete deployment stock-deployment
kubectl apply -f information/information-deployment.yaml
# kubectl delete deployment information-deployment
kubectl apply -f payment/payment-deployment.yaml
# kubectl delete deployment payment-deployment