const handles = [
  'ali',
  'asta',
  'alex',
  'baby_boomer',
  'cowboy_from_mexico',
  'dweller_of_abyss',
  'eye_of_horus',
  'fuji_mountain',
  'gossip_neighbor',
  'hometowner',
  'immortal_king',
  'infinite_loop',
  'joker_100',
  'jin',
  'kasir',
  'killer_b',
  'konstantin',
  'lucifer_999',
  'maximilian',
  'nine_tail',
  'oscar',
  'pyramid',
  'quarantine_zone',
  'roller_coaster',
  'sakura',
  'trump',
  'umbrella_pop',
  'volvo_120',
  'weeper_deeper',
  'xylophone_musician',
  'yoghurt_fan',
  'zen_buddhist',
] as const;
const postImage = 'https://mongodb-sharding.com/images/random.png';
const posts = [];

for (let i = 0; i < 50; i++) {
  for (const handle of handles) {
    const postText = String(
      Math.floor(Date.now() * Math.random() * 10_000),
    );

    posts.push({
      handle,
      postText,
      postImage,
    });
  }
}

export { posts };
