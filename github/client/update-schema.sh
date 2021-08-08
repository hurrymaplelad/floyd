curl \
  -H "Authorization: bearer $GITHUB_ACCESS_TOKEN" \
  -H "Accept: application/vnd.github.v4.idl" \
  https://api.github.com/graphql \
| jq -r '.data' \
> github_schema.graphql
