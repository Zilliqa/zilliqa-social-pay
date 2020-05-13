##############################################################################
# Step 1 : Builder image
#
FROM node:10 AS builder

# Define working directory and copy source
WORKDIR /app
COPY . .
# Install dependencies.
ARG DEPLOY_ENV="dev"
RUN npm install && npm run build

###############################################################################
# Step 2 : Run image
#
FROM node:10
WORKDIR /home/node/app

# Install deps for production only
COPY ./package* ./
RUN npm install && \
    npm cache clean --force
# Copy builded source from the upper builder stage
COPY --from=builder /app/build ./build

# Expose ports (for orchestrators and dynamic reverse proxies)
EXPOSE 3000

# Start the app
ENV DEPLOY_ENV=${DEPLOY_ENV}
ENTRYPOINT ["sh", "run.sh"]