#!/bin/bash

echo "Environment is $DEPLOY_ENV"
echo "run script $SCRIPT"
echo "Callback: $CALLBACK"
echo "Contract Address: $CONTRACT_ADDRESS"
date
npm run db:create
npm run db:migrate
npm run db:seed
npm run $SCRIPT
