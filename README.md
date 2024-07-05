IP OF GRAPH NODE EC2(GRAPH_IP):
echo $(aws ec2 describe-instances --filters 'Name=tag:Name,Values=TheGraphServiceStack/GraphCluster/nodeClientLaunchTemplate' --query  'Reservations[0].Instances[0].PublicIpAddress' --output text)

54.175.39.126
34.201.250.153

graph create --node http://${GRAPH_IP}:8020 ${SUBGRAPH_NAME}
graph deploy --node http://${GRAPH_IP}:8020/ --ipfs http://${GRAPH_IP}:5001 ${SUBGRAPH_NAME}

"create-aws": "graph create --node http://34.201.250.153:8020 APE",
"deploy-aws": "graph deploy --node http://34.201.250.153:8020/ --ipfs http://34.201.250.153:5001 APE"


API GATEWAY: https://e5jo2aw5o0.execute-api.us-east-1.amazonaws.com

For general queries (from the front end or other applications), you can query the subgraph through API Gateway. There are two routes on the API Gateway:
POST <API Gateway Invoke URL>/subgraphs/name/<NAME OF SUBGRAPH> accepts valid subgraph names as a path element. It is used for queries on the specified subgraph.
POST [<API Gateway Invoke URL>](https://e5jo2aw5o0.execute-api.us-east-1.amazonaws.com)/subgraphs/name/APE 
POST https://e5jo2aw5o0.execute-api.us-east-1.amazonaws.com/subgraphs/name/APE

POST <API Gateway Invoke URL>/graphql is for status queries about the syncing status of the Graph Node.
POST https://e5jo2aw5o0.execute-api.us-east-1.amazonaws.com/graphql


https://e5jo2aw5o0.execute-api.us-east-1.amazonaws.com/subgraphs/name/APE
https://e5jo2aw5o0.execute-api.us-east-1.amazonaws.com/graphql

curl -X POST \
-H "Content-Type: application/json" \
-H "Authorization: secretToken" \
-d '{"query":"query MyQuery { tokens(first: 10) { name id tokenURI } }"}' \
http://54.175.39.126:8000/subgraphs/name/APE

curl -X POST \
-H "Content-Type: application/json" \
-H "Authorization: secretToken" \
-d '{"query":"query MyQuery { tokens(first: 10) { name id tokenURI } }"}' \
https://e5jo2aw5o0.execute-api.us-east-1.amazonaws.com/subgraphs/name/APE


curl -X POST \
-H "Content-Type: application/json" \
-H "Authorization: secretToken" \
https://e5jo2aw5o0.execute-api.us-east-1.amazonaws.com/graphql


From the development machine, the GraphQL endpoint is: 
http://<EC2 IP>/subgraphs/name/<NAME OF SUBGRAPH>
http://54.175.39.126/subgraphs/name/APE
(
GRAPH_QL interface for queries
http://54.224.227.245/subgraphs/name/APE/graphql
)

VITE_GRAPHQL_ENDPOINT=
https://<END_POINT>/subgraphs/name/<SUBGRAPH_NAME>
https://3c0y2qovtk.execute-api.us-east-1.amazonaws.com/subgraphs/name/APE





<!-- to check syncing status of graph -->
<!-- curl --location 'http://gn-ec2-clr-dev-alb-626297434.us-east-1.elb.amazonaws.com/graphql' \
--header 'Content-Type: application/json' \
--header 'authorization: secretToken' \
--data '{"query":"query { indexingStatuses { subgraph synced health fatalError { block { number } message handler } nonFatalErrors { block { number } message handler } chains { network chainHeadBlock { number } earliestBlock { number } latestBlock { number } lastHealthyBlock { number } } entityCount node } }","variables":{}}' -->