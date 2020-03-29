# Zilliqa SocialPay

SocialPay is advertising platform, for each tweet with #zilliqa shoreham you can get rewards.

## Environment variables.

 * TWITTER_CONSUMER_KEY
 * TWITTER_CONSUMER_SECRET
 * JWT_SECRET
 * SESSION
 * NUMBER_OF_ADMINS
 * CONTRACT_ADDRESS

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
  * sequelize config - `server/config/config.json`
