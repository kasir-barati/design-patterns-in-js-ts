# Intro

So you wanna learn what is sharding. Congrats, you've ended up in the right place. Learn more about sharing in **general** [here](https://aws.amazon.com/what-is/database-sharding/). And also see the examples implemented here in this repo by watching this [YouTube video](https://youtu.be/8sk75-6W0ik?si=qICl1DboCdU4V3mB).

> [!CAUTION]
>
> Once a collection **has been sharded**, MongoDB provides **NO** method to unshard a sharded collection ([read more here](https://www.mongodb.com/docs/manual/sharding/#considerations-before-sharding)).

## My handwritings for it

If you are able to make sense of what I wrote here you go:

![First page of my handwritings in sharding](./assets/01.jpeg)
![Second page of my handwritings in sharding](./assets/02.jpg)
![Third page of my handwritings in sharding](./assets/03.jpg)
![Forth page of my handwritings in sharding](./assets/04.jpg)
![Fifth page of my handwritings in sharding](./assets/05.jpg)
![Sixth page of my handwritings in sharding](./assets/06.jpg)
![Seventh page of my handwritings in sharding](./assets/07.jpeg)
![Eighth page of my handwritings in sharding](./assets/08.jpg)
![Ninth page of my handwritings in sharding](./assets/09.jpg)
![Tenth page of my handwritings in sharding](./assets/10.jpg)
![Eleventh page of my handwritings in sharding](./assets/11.jpg)

But if you cannot, do not worry too much. I guess you could just go to the first two links I shared in order to gain a better understanding of what is going on here :slightly_smiling_face:.

## Bumps:

### First bump

![Second shard's replica set](./assets/bump1-shard2-rs.png)
![First shard's replica set](./assets/bump1-shard2-rs.png)

For some reason it is not distributing documents, either misconfigured shard key or sharded database since I also dunno why it is saying this, why second shard is primary. I know that I did not specify who should be primary but I am sure I added first shard first. I'll investigate it:

![Why primary shard is second shard?](./assets/bump1-primary-shard.png)

#### Steps I've tried that led me to successfully debug this issue:

1. I asked my question in [MongoDB Community forum](https://www.mongodb.com/community/forums/t/mongodb-sharding-seems-is-not-distributing-the-documents/288511?u=kasir_barati).
2. I started by reading [MongoDB sharding official doc](https://www.mongodb.com/docs/manual/sharding/).
3. I concentrated my focus on the [Ranged Sharding](https://www.mongodb.com/docs/manual/core/ranged-sharding/) since that was what I needed to implement the scenario that it described [here](https://youtu.be/8sk75-6W0ik?t=1281).
4. Then I read [this post](https://www.geeksforgeeks.org/ranged-sharding-in-mongodb/) on GeeksforGeeks, after that I went to the MongoDB official doc to learn more about this `addShardTag`.
5. In [this page](https://www.mongodb.com/docs/manual/reference/method/sh.addShardTag/) for the `addShardTag` I noticed that I failed to pay enough attention to the _chunks_ and its concept in MongoDB.
6. I am in the [MongoDB glossary, reading chunks definition](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-chunk),
7. Then I open [Data Partitioning with Chunks](https://www.mongodb.com/docs/manual/core/sharding-data-partitioning/). There I read something really intriguing about chunks, and how the MongoDB sharded cluster balancer([learn more about balancer here](https://www.mongodb.com/docs/manual/core/sharding-balancer-administration/)) works when our collection is empty (our scenario):
   > - The sharding operation creates one large initial chunk to cover all of the shard key values.
   > - After the initial chunk creation, the balancer moves ranges off of the initial chunk when it needs to start balancing data.
8. Then I continued to read and realized that we have another term in this field called [_range_](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-range). According to my understanding of it, MongoDB balancer decides to split data further whenever we hit the maximum size of a chunk which is 128 megabytes ([ref](https://www.mongodb.com/docs/manual/core/sharding-data-partitioning/#range-size)).

So I guess the mystery is solved now, except the fact that I am still unsatisfied with the way it splits data automatically. I do not mean I like to take care of it by myself too :sweat_smile:. And I also know that there are draw back when we wanna have more evenly data distribution:

> Small ranges lead to a more even distribution of data at the expense of more frequent migrations. This creates expense at the query routing (mongos) layer.

## What are we using here?

- [`nx`](https://nx.dev/)
- [`NodeJS`](https://nodejs.org/en)
- [_NestJS_](https://nestjs.com/)
- [`NodeJS native test runner`](https://dev.to/mbarzeev/is-nodejs-test-runner-dev-ready-4gm8)
- [`Automated tests`](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)

### Why NestJS?

- Highly opinionated and structured, promoting best practices.
- Built-in support for TypeScript, making it easier to write maintainable and scalable code.
- Includes many built-in features like dependency injection, modular architecture, and an easy-to-use CLI.
- Great for large-scale applications due to its modular structure.

#### How to add new apps?

```cmd
nx g @nx/nest:app app-name --directory apps/app-name
```

#### How to start it?

```cmd
cp .env.example .env
bash sharded-cluster.sh
nx serve mongodb-sharding
```

### Why Mongoose?

- Mongoose's `HydratedDocument` type transforms a raw document interface into the type of the hydrated Mongoose document, including virtuals, methods, etc.
