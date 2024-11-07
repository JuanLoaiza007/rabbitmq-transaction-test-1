#!/bin/bash

# Eliminar todos los deployments y servicios
kubectl delete deployments --all
kubectl delete services --all

# Eliminar el clúster de k3d
k3d cluster delete mycluster

echo "Despliegue destruido."
