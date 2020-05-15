#!/bin/bash

echo $(pwd)

docker --version
aws --version

echo $TRAVIS_COMMIT
commit=$(git rev-parse --short=7 $TRAVIS_COMMIT)

accountID=$(aws sts get-caller-identity --output text --query 'Account')
regionID=us-west-2

application=socialpay-server
registryURL=${accountID}.dkr.ecr.${regionID}.amazonaws.com/$application

eval "$(aws ecr get-login --no-include-email --region $regionID)"
docker build --build-arg SCRIPT="start" -t "$registryURL:latest" -t "$registryURL:$commit" .
docker build --build-arg SCRIPT="scheduler" -t "$registryURL:latest" -t "$registryURL:$commit" .
docker build --build-arg SCRIPT="tx:handler" -t "$registryURL:latest" -t "$registryURL:$commit" .
docker push "$registryURL"
