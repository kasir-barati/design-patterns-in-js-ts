#! /bin/bash

clear

docker rm -f $(docker ps -a -q)
docker system prune -f
docker volume prune -f

# region: Create docker network for the whole thing
NETWORK_NAME="mongodb-network"
network_exists=$(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}")
if [ "$network_exists" == "$NETWORK_NAME" ]; then
  echo "Network '$NETWORK_NAME' exists. Deleting..."
  docker network rm $NETWORK_NAME
  echo "Network '$NETWORK_NAME' has been deleted."
fi
docker network create $NETWORK_NAME
# endregion

# region: Create shard 1
docker run -d -p 27101:27017 --name mongo-shard1-1 --network mongodb-network mongo:5 mongod --shardsvr --replSet mongo-shard1-rs --port 27017 --bind_ip localhost,mongo-shard1-1
docker run -d -p 27102:27017 --name mongo-shard1-2 --network mongodb-network mongo:5 mongod --shardsvr --replSet mongo-shard1-rs --port 27017 --bind_ip localhost,mongo-shard1-2
docker run -d -p 27103:27017 --name mongo-shard1-3 --network mongodb-network mongo:5 mongod --shardsvr --replSet mongo-shard1-rs --port 27017 --bind_ip localhost,mongo-shard1-3
# endregion

# region: Create shard 2
docker run -d -p 27201:27017 --name mongo-shard2-1 --network mongodb-network mongo:5 mongod --shardsvr --replSet mongo-shard2-rs --port 27017 --bind_ip localhost,mongo-shard2-1
docker run -d -p 27202:27017 --name mongo-shard2-2 --network mongodb-network mongo:5 mongod --shardsvr --replSet mongo-shard2-rs --port 27017 --bind_ip localhost,mongo-shard2-2
docker run -d -p 27203:27017 --name mongo-shard2-3 --network mongodb-network mongo:5 mongod --shardsvr --replSet mongo-shard2-rs --port 27017 --bind_ip localhost,mongo-shard2-3
# endregion

echo "Sleeping for 10 seconds..."
sleep 10;

# region: Check if the containers are running
declare -a containers=(
  "mongo-shard1-1"
  "mongo-shard1-2"
  "mongo-shard1-3"
  "mongo-shard2-1"
  "mongo-shard2-2"
  "mongo-shard2-3"
)
check_containers() 
{
  local container=$1
  local status=$(docker exec -it "$container" mongosh --port 27017 --eval "db.runCommand({ ping: 1 })" | grep ok)
  
  if [ -n "$status" ]; then
    echo "Container $container: { ok: 1 }"
    return 0
  else
    echo "Container $container: Ping failed"
    return 1
  fi
}
all_containers_ok=true
for container in "${containers[@]}"; do
  if ! check_containers "$container"; then
    all_containers_ok=false
  fi
done
if $all_containers_ok; then
  echo "All containers returned { ok: 1 }"
else
  echo "One or more containers did not return { ok: 1 }"
  exit 1;
fi
# endregion

# region: Initialize the replica set for mongo-shard1-rs
docker exec -it mongo-shard1-1 mongosh --eval "rs.initiate({
 _id: \"mongo-shard1-rs\",
 members: [
   {_id: 0, host: \"mongo-shard1-1\"},
   {_id: 1, host: \"mongo-shard1-2\"},
   {_id: 2, host: \"mongo-shard1-3\"}
 ]
})"
# endregion

# region: Initialize the replica set for mongo-shard2-rs
docker exec -it mongo-shard2-1 mongosh --eval "rs.initiate({
 _id: \"mongo-shard2-rs\",
 members: [
   {_id: 0, host: \"mongo-shard2-1\"},
   {_id: 1, host: \"mongo-shard2-2\"},
   {_id: 2, host: \"mongo-shard2-3\"}
 ]
})"
# endregion

# region: Check if the replica sets are running
declare -a replica_sets=(
  "mongo-shard1-1"
  "mongo-shard2-1"
)
check_rs() 
{
  local replica_set=$1
  local status=$(docker exec -it "$replica_set" mongosh --eval "rs.status()" | grep ok)
  
  if [ -n "$status" ]; then
    echo "Replica set $replica_set: { ok: 1 }"
    return 0
  else
    echo "Replica set $replica_set: status check failed"
    return 1
  fi
}
all_rs_ok=true
for replica_set in "${replica_sets[@]}"; do
  if ! check_rs "$replica_set"; then
    all_rs_ok=false
  fi
done
if $all_rs_ok; then
  echo "All replica sets returned { ok: 1 }"
else
  echo "One or more replica sets did not return { ok: 1 }"
  exit 1;
fi
# endregion

# region: Setup config server replica set
docker run -dit --name mongo-config-server-1 --net mongodb-network -p 27001:27017 mongo:5 --configsvr --replSet mongo-config-server-rs --port 27017 --bind_ip localhost,mongo-config-server-1
docker run -dit --name mongo-config-server-2 --net mongodb-network -p 27002:27017 mongo:5 --configsvr --replSet mongo-config-server-rs --port 27017 --bind_ip localhost,mongo-config-server-2
docker run -dit --name mongo-config-server-3 --net mongodb-network -p 27003:27017 mongo:5 --configsvr --replSet mongo-config-server-rs --port 27017 --bind_ip localhost,mongo-config-server-3
# endregion

echo "Sleeping for another 10 seconds..."
sleep 10;

# region: Check config server replica set
declare -a config_servers=(
  "mongo-config-server-1"
  "mongo-config-server-2"
  "mongo-config-server-3"
)
check_config_servers() 
{
  local config_server=$1
  local status=$(docker exec -it "$config_server" mongosh --port 27017 --eval "db.runCommand({ ping: 1 })" | grep ok)
  
  if [ -n "$status" ]; then
    echo "Config server $config_server: { ok: 1 }"
    return 0
  else
    echo "Config server $config_server: Ping failed"
    return 1
  fi
}
all_config_servers_ok=true
for config_server in "${config_servers[@]}"; do
  if ! check_config_servers "$config_server"; then
    all_config_servers_ok=false
  fi
done
if $all_config_servers_ok; then
  echo "All config servers returned { ok: 1 }"
else
  echo "One or more config server/s did not return { ok: 1 }"
  exit 1;
fi
# endregion

# region: Initialize config server replica set
docker exec -it mongo-config-server-1 mongosh --port 27017 --eval "rs.initiate({                                                                                                 
 _id: \"mongo-config-server-rs\",
 members: [
   {_id: 0, host: \"mongo-config-server-1\"},
   {_id: 1, host: \"mongo-config-server-2\"},
   {_id: 2, host: \"mongo-config-server-3\"}
 ]
})"
# endregion

# region: Check config server replica set
if docker exec -it mongo-config-server-1 mongosh --port 27017 --eval "rs.status()" | grep -q "ok"; then
  echo "Config server's replica set is initialized."
else
  echo "Config server's replica set is NOT initialized!"
  exit 1
fi
# endregion

# region: Setup mongos
docker run -dit --name mongos-router-1 --net mongodb-network -p 27100:27017 mongo:5 mongos --configdb mongo-config-server-rs/mongo-config-server-1:27017,mongo-config-server-2:27017,mongo-config-server-3:27017 --port 27017 --bind_ip localhost,mongos-router-1
docker run -dit --name mongos-router-2 --net mongodb-network -p 27200:27017 mongo:5 mongos --configdb mongo-config-server-rs/mongo-config-server-1:27017,mongo-config-server-2:27017,mongo-config-server-3:27017 --port 27017 --bind_ip localhost,mongos-router-2
# endregion

echo "Sleeping for 20 seconds this time..."
sleep 20;

# region: Check mongos
declare -a mongos=(
  "mongos-router-1"
  "mongos-router-2"
)
check_mongos()
{
  local mongos=$1
  local status=$(docker exec -it "$mongos" mongosh --port 27017 --eval "db.runCommand({ ping: 1 })" | grep ok)
  
  if [ -n "$status" ]; then
    echo "Mongos $mongos: { ok: 1 }"
    return 0
  else
    echo "Mongos $mongos: status check failed"
    return 1
  fi
}
all_mongos_ok=true
for mongos in "${mongos[@]}"; do
  if ! check_mongos "$mongos"; then
    all_mongos_ok=false
  fi
done
if $all_mongos_ok; then
  echo "All mongoses returned { ok: 1 }"
else
  echo "One or more mongoses did not return { ok: 1 }"
  exit 1;
fi
# endregion

# region: Connect shards with mongos
docker exec -it mongos-router-1 mongosh --port 27017 --eval "sh.addShard(\"mongo-shard1-rs/mongo-shard1-1:27017,mongo-shard1-2:27017,mongo-shard1-3:27017\")"
docker exec -it mongos-router-1 mongosh --port 27017 --eval "sh.addShard(\"mongo-shard2-rs/mongo-shard2-1:27017,mongo-shard2-2:27017,mongo-shard2-3:27017\")"
docker exec -it mongos-router-2 mongosh --port 27017 --eval "sh.addShard(\"mongo-shard1-rs/mongo-shard1-1:27017,mongo-shard1-2:27017,mongo-shard1-3:27017\")"
docker exec -it mongos-router-2 mongosh --port 27017 --eval "sh.addShard(\"mongo-shard2-rs/mongo-shard2-1:27017,mongo-shard2-2:27017,mongo-shard2-3:27017\")"
# endregion
