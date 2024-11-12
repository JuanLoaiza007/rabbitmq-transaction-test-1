#!/bin/bash

# Define manualmente los nombres de los deployments
deployments=("order-deployment" "stock-deployment" "payment-deployment" "information-deployment") 

# Iteramos sobre cada deployment definido en la lista
for deployment in "${deployments[@]}"; do
    echo "=== $deployment ==="
    echo ""
    kubectl logs deployment/$deployment --tail=4
    echo ""
    echo "----------------------------------------"
    echo ""
done
