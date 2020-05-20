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
 * `TWITTER_CONSUMER_KEY` # Get from [twitter-apps](https://developer.twitter.com/en/apps).
 * `TWITTER_CONSUMER_SECRET` # Get from [twitter-apps](https://developer.twitter.com/en/apps).
 * `CALLBACk` # See on [twitter-apps](https://developer.twitter.com/en/apps).
 * `LIKES_FOR_CLAIM` #  Amount of Likes for claim tweet. When user click to claim server check amount of likes for tweet.
 * `MAX_AMOUNT_NOTIFICATIONS` # Amount of notifications count for show user. Maximum number of notifications for show user.
 * `END_OF_CAMPAIGN` # Date time when compaign has end. When comapaign had end, then all claim and serch tweet just disable.
 * `JWT_SECRET` # Any string for generate JWT.
 * `SESSION` # Any string for generate cookies session.
 * `NUMBER_OF_ADMINS` # Number of admin accounts.
 * `CONTRACT_ADDRESS` # SocialPay contract address
 * `POSTGRES_DB` # DataBase name.
 * `POSTGRES_PASSWORD` # DataBase password.
 * `POSTGRES_USER` # DataBase username.
 * `POSTGRES_HOST` # DataBase host for example (127.0.0.1) for production build use 'postgres'.
 * `REDIS_URL` # Redis connection url, for cache.
 * `NODE_ENV` # development, test, production

## Run:
Create database for only test or `test`, `production` mode.
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

Runing for production mode.
```bash
$ npm run build
$ npm run start
```

when server has runing server create admin account by `NUMBER_OF_ADMINS` env.
```bash
zilliqa-social-pay:server admin 0: zil170u8pswtmeu2zy9j0ssgwwaaswwf5j9c63rdq7, balance: 0, status: disabled
zilliqa-social-pay:server admin 1: zil15asw80nsgjujmtvfj9cquuz8fhv662d0nyuqe9, balance: 0, status: disabled
zilliqa-social-pay:server admin 2: zil1hgjcxss0mzya5t4h6ga64zncrnn9zjs3yew5h6, balance: 0, status: disabled
zilliqa-social-pay:server admin 3: zil1pud3t54khen6r28juhkswan8kzusm95z92u0lv, balance: 0, status: disabled
zilliqa-social-pay:server admin 4: zil1wdmu8fqyzfju939hdw3vfdlkytejcyzvlrwy93, balance: 0, status: disabled
zilliqa-social-pay:server admin 5: zil1cg7vx5t8nulnrdzhadc3u3h7un9sfhkkjhv8lg, balance: 0, status: disabled
zilliqa-social-pay:server admin 6: zil1edlve2f8qwwh5u43uwej8eq0eqzk46u5sl88sw, balance: 0, status: disabled
zilliqa-social-pay:server admin 7: zil1hrfql2gtk0fztlr3tsf0t2x0rc4cpvlq3j2xym, balance: 0, status: disabled
zilliqa-social-pay:server admin 8: zil1w8rz538g9202vl0f0dqf5cqhuaz734na0g6qwn, balance: 0, status: disabled
zilliqa-social-pay:server admin 9: zil1clkwmtp4r4p4c8zl5pu6mql6tz7vf558tjrw2t, balance: 0, status: disabled
```
There accounts is `disabled`, for enable accounts need to call transition `ConfigureAdmin` on smart contract

server will autodetect it and, change status to `enable`.

## setup database:
  * sequelize config - `server/config/config.js`

## Build docker container.

```bash
$ docker-compose build # run building.
$ docker-compose up -d # runing.
```
