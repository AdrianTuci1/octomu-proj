# DynamoDB Implementation Plan

## Tables Strategy
We will use a **Single Table Design** (or separate tables if simpler for this prototype) to store:
1.  **Users**: `PK=USER#<email>`, `SK=METADATA`
2.  **Orgs**: `PK=ORG#<id>`, `SK=METADATA`
3.  **Members**: `PK=ORG#<id>`, `SK=USER#<user_id>` (Contains Role)
4.  **Installations**: `PK=ORG#<id>`, `SK=MCP#<mcp_id>`
5.  **AuditLogs**: `PK=ORG#<id>`, `SK=LOG#<timestamp>`

## Implementation Steps
1.  Create `internal/store/dynamodb` package.
2.  Implement `Store` interface methods.
3.  Update `server.go` to use `NewDynamoDBStore`.

## Dependencies
- `github.com/aws/aws-sdk-go-v2`
- `github.com/aws/aws-sdk-go-v2/service/dynamodb`
