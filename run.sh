#!/bin/bash

echo "Environment is $DEPLOY_ENV"
if [ "$DEPLOY_ENV" = "dev" ]; then
    npm run dev
else
    echo "Callback: $CALLBACK"
    echo "Contract Address: $CONTRACT_ADDRESS"
    npm run db:create
    npm run start
fi
