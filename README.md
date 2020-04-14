# Zilliqa SocialPay

SocialPay is advertising platform, for each tweet with #zilliqa shoreham you can get rewards.

# Get started.

For first need to deploy smart contract via [Editor](https://zilpay.xyz/app/Editor).

### Contract init fields.
 * `owner` # Your zilliqa address(zil1).
 * `hashtag` # Twitter hashtag for example `#zilliqa`, this field only lowercase!!!
 * `zils_per_tweet` # Amount of ZIL per tweet in QA, for example (10000000000000) `10ZIL`.
 * `blocks_per_day` # Amount of block per day, for claim tweet.
 * `blocks_per_week` # Amount of block for address change.

When contract has deployed, rename `.env.example` -> `.env` and change `CONTRACT_ADDRESS` to your contract address.
Also need to deposit few ZILs, call `Deposit` transition and send few ZIls.

### Environment variables.
 * TWITTER_CONSUMER_KEY # Get from [twitter-apps](https://developer.twitter.com/en/apps).
 * TWITTER_CONSUMER_SECRET # Get from [twitter-apps](https://developer.twitter.com/en/apps).
 * CALLBACk # See on [twitter-apps](https://developer.twitter.com/en/apps).
 * JWT_SECRET # Any string for generate JWT.
 * SESSION # Any string for generate cookies session.
 * NUMBER_OF_ADMINS # Number of admin accounts.
 * CONTRACT_ADDRESS # SocialPay contract address
 * POSTGRES_DB # DataBase name.
 * POSTGRES_PASSWORD # DataBase password.
 * POSTGRES_USER # DataBase username.
 * POSTGRES_HOST # DataBase host for example (127.0.0.1) for production build use 'postgres'.
 * NODE_ENV # development, test, production

## Run:
Create database for only test or production mode.
```bash
$ npm run db:create
# or
$ npx sequelize db:create
```

Create all migrations:
```bash
$ npm run db:migrate
# or
$ npx sequelize db:migrate
```
More info on [sequelize/cli](https://github.com/sequelize/cli).

Runing for dev mode.
```bash
$ npm run dev
```

Runing for production mode.
```bash
$ npm run build
$ npm run start
```

## setup database:
  * sequelize config - `server/config/config.js`

## Build docker container.

```bash
$ docker-compose build # run building.
$ docker-compose up -d # runing.
```