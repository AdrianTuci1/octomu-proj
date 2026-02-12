package dynamodb

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/octomus/cloud/internal/store"
    "github.com/google/uuid"
)

type DynamoDBStore struct {
	client *dynamodb.Client
	table  string
}

func NewDynamoDBStore(ctx context.Context, tableName string) (*DynamoDBStore, error) {
	// Load AWS Config
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}

	// Check for Local Endpoint (e.g. for docker-compose / unit tests)
	var client *dynamodb.Client
	if endpoint := os.Getenv("DYNAMODB_ENDPOINT"); endpoint != "" {
		fmt.Printf("Using DynamoDB Local: %s\n", endpoint)
		client = dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
			o.BaseEndpoint = aws.String(endpoint)
		})
	} else {
		client = dynamodb.NewFromConfig(cfg)
	}

    // Ensure Table Exists (Schema Migration for Local Dev)
    // In production we assume Terraform created it, but locally we want magic.
    if os.Getenv("DYNAMODB_ENDPOINT") != "" {
        ensureTableExists(ctx, client, tableName)
    }

	return &DynamoDBStore{
		client: client,
		table:  tableName,
	}, nil
}

func ensureTableExists(ctx context.Context, client *dynamodb.Client, tableName string) {
    _, err := client.DescribeTable(ctx, &dynamodb.DescribeTableInput{TableName: aws.String(tableName)})
    if err == nil {
        return // Table exists
    }
    
    // Create Table for Local Dev
    fmt.Println("Creating DynamoDB table for local dev...")
    _, err = client.CreateTable(ctx, &dynamodb.CreateTableInput{
        TableName: aws.String(tableName),
        KeySchema: []types.KeySchemaElement{
            {AttributeName: aws.String("PK"), KeyType: types.KeyTypeHash},
            {AttributeName: aws.String("SK"), KeyType: types.KeyTypeRange},
        },
        AttributeDefinitions: []types.AttributeDefinition{
            {AttributeName: aws.String("PK"), AttributeType: types.ScalarAttributeTypeS},
            {AttributeName: aws.String("SK"), AttributeType: types.ScalarAttributeTypeS},
            {AttributeName: aws.String("GSI1PK"), AttributeType: types.ScalarAttributeTypeS},
            {AttributeName: aws.String("GSI1SK"), AttributeType: types.ScalarAttributeTypeS},
        },
        GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{
            {
                IndexName: aws.String("GSI1"),
                KeySchema: []types.KeySchemaElement{
                    {AttributeName: aws.String("GSI1PK"), KeyType: types.KeyTypeHash},
                    {AttributeName: aws.String("GSI1SK"), KeyType: types.KeyTypeRange},
                },
                Projection: &types.Projection{ProjectionType: types.ProjectionTypeAll},
                ProvisionedThroughput: &types.ProvisionedThroughput{
                    ReadCapacityUnits:  aws.Int64(5),
                    WriteCapacityUnits: aws.Int64(5),
                },
            },
        },
        ProvisionedThroughput: &types.ProvisionedThroughput{
            ReadCapacityUnits:  aws.Int64(5),
            WriteCapacityUnits: aws.Int64(5),
        },
    })
    if err != nil {
        fmt.Printf("Failed to create local table: %v\n", err)
    }
}

// Helper for Single Table Keys
func pkUserEmail(email string) string { return "USER#" + email }
func pkOrg(id uuid.UUID) string       { return "ORG#" + id.String() }
func skMetadata() string              { return "METADATA" }

// User Methods
func (s *DynamoDBStore) CreateUser(ctx context.Context, user *store.User) error {
	item, err := attributevalue.MarshalMap(user)
	if err != nil {
		return err
	}
	// Add PK/SK for access patterns
	item["PK"] = &types.AttributeValueMemberS{Value: pkUserEmail(user.Email)}
	item["SK"] = &types.AttributeValueMemberS{Value: skMetadata()}
    // Also GSI if needed for ID lookup, but email is primary for login

	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.table),
		Item:      item,
		ConditionExpression: aws.String("attribute_not_exists(PK)"), // Unique Email
	})
	return err
}

func (s *DynamoDBStore) GetUserByEmail(ctx context.Context, email string) (*store.User, error) {
	resp, err := s.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(s.table),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pkUserEmail(email)},
			"SK": &types.AttributeValueMemberS{Value: skMetadata()},
		},
	})
	if err != nil {
		return nil, err
	}
	if resp.Item == nil {
		return nil, errors.New("user not found")
	}

	var user store.User
	if err := attributevalue.UnmarshalMap(resp.Item, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// Org Methods
func (s *DynamoDBStore) CreateOrganization(ctx context.Context, org *store.Organization) error {
	item, err := attributevalue.MarshalMap(org)
	if err != nil {
		return err
	}
	item["PK"] = &types.AttributeValueMemberS{Value: pkOrg(org.ID)}
	item["SK"] = &types.AttributeValueMemberS{Value: skMetadata()}

	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.table),
		Item:      item,
	})
	return err
}

// ... Implement all other methods of store.Store interface ...

// MCP Installation
func (s *DynamoDBStore) InstallMCP(ctx context.Context, install *store.MCPInstallation) error {
    item, err := attributevalue.MarshalMap(install)
    if err != nil {
        return err
    }
    // PK = ORG#<id>, SK = MCP#<id>
    item["PK"] = &types.AttributeValueMemberS{Value: pkOrg(install.OrganizationID)}
    item["SK"] = &types.AttributeValueMemberS{Value: "MCP#" + install.ID.String()}
    
    _, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
        TableName: aws.String(s.table),
        Item:      item,
    })
    return err
}

func (s *DynamoDBStore) ListInstalledMCPs(ctx context.Context, orgID uuid.UUID) ([]*store.MCPInstallation, error) {
    resp, err := s.client.Query(ctx, &dynamodb.QueryInput{
        TableName: aws.String(s.table),
        KeyConditionExpression: aws.String("PK = :pk AND begins_with(SK, :sk_prefix)"),
        ExpressionAttributeValues: map[string]types.AttributeValue{
            ":pk":        &types.AttributeValueMemberS{Value: pkOrg(orgID)},
            ":sk_prefix": &types.AttributeValueMemberS{Value: "MCP#"},
        },
    })
    if err != nil {
        return nil, err
    }

    var installs []*store.MCPInstallation
    if err := attributevalue.UnmarshalListOfMaps(resp.Items, &installs); err != nil {
        return nil, err
    }
    return installs, nil
}

func (s *DynamoDBStore) UninstallMCP(ctx context.Context, orgID uuid.UUID, mcpName string) error {
	installs, err := s.ListInstalledMCPs(ctx, orgID)
	if err != nil {
		return err
	}

	var targetID string
	for _, inst := range installs {
		if inst.MCPName == mcpName {
			targetID = inst.ID.String()
			break
		}
	}

	if targetID == "" {
		return errors.New("mcp not found in organization")
	}

	_, err = s.client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(s.table),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pkOrg(orgID)},
			"SK": &types.AttributeValueMemberS{Value: "MCP#" + targetID},
		},
	})
	return err
}

// Stubs for remaining interface methods (Need implementation for full functionality)
func (s *DynamoDBStore) ListUsers(ctx context.Context) ([]*store.User, error) { return nil, nil }
func (s *DynamoDBStore) ListOrganizations(ctx context.Context) ([]*store.Organization, error) { return nil, nil }
// Org Methods implementation continued
func (s *DynamoDBStore) GetOrganization(ctx context.Context, id uuid.UUID) (*store.Organization, error) {
	resp, err := s.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(s.table),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pkOrg(id)},
			"SK": &types.AttributeValueMemberS{Value: skMetadata()},
		},
	})
	if err != nil {
		return nil, err
	}
	if resp.Item == nil {
		return nil, errors.New("organization not found")
	}

	var org store.Organization
	if err := attributevalue.UnmarshalMap(resp.Item, &org); err != nil {
		return nil, err
	}
	return &org, nil
}

// Audit Logs
func (s *DynamoDBStore) CreateAuditLog(ctx context.Context, log *store.AuditLog) error {
	item, err := attributevalue.MarshalMap(log)
	if err != nil {
		return err
	}
	// PK=ORG#<id>, SK=LOG#<timestamp>#<id>
	// Use timestamp for sorting/filtering
	sk := fmt.Sprintf("LOG#%d#%s", log.Timestamp.UnixNano(), log.ID.String())
	
	item["PK"] = &types.AttributeValueMemberS{Value: pkOrg(log.OrganizationID)}
	item["SK"] = &types.AttributeValueMemberS{Value: sk}

	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.table),
		Item:      item,
	})
	return err
}

func (s *DynamoDBStore) ListAuditLogs(ctx context.Context, orgID uuid.UUID) ([]*store.AuditLog, error) {
	resp, err := s.client.Query(ctx, &dynamodb.QueryInput{
		TableName: aws.String(s.table),
		KeyConditionExpression: aws.String("PK = :pk AND begins_with(SK, :sk_prefix)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pk":        &types.AttributeValueMemberS{Value: pkOrg(orgID)},
			":sk_prefix": &types.AttributeValueMemberS{Value: "LOG#"},
		},
		ScanIndexForward: aws.Bool(false), // Newest first
	})
	if err != nil {
		return nil, err
	}

	var logs []*store.AuditLog
	if err := attributevalue.UnmarshalListOfMaps(resp.Items, &logs); err != nil {
		return nil, err
	}
	return logs, nil
}

// Role & Member Methods (Needs implementation or separate table design)
func (s *DynamoDBStore) CreateRole(ctx context.Context, role *store.Role) error { return nil }
func (s *DynamoDBStore) AddMember(ctx context.Context, member *store.Member) error { return nil }
func (s *DynamoDBStore) GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (*store.Role, error) { return nil, nil }
func (s *DynamoDBStore) GetMembers(ctx context.Context, orgID uuid.UUID) ([]*store.Member, error) { return nil, nil }
// Infrastructure Methods

func pkNode(id uuid.UUID) string { return "NODE#" + id.String() }

func (s *DynamoDBStore) RegisterNode(ctx context.Context, node *store.WorkerNode) error {
    node.LastHeartbeatAt = time.Now()
	item, err := attributevalue.MarshalMap(node)
	if err != nil {
		return err
	}
	item["PK"] = &types.AttributeValueMemberS{Value: pkNode(node.ID)}
	item["SK"] = &types.AttributeValueMemberS{Value: skMetadata()}
    // GSI for Active Nodes: PK=STATUS#active, SK=NODE#<id>
    item["GSI1PK"] = &types.AttributeValueMemberS{Value: "STATUS#" + node.Status}
    item["GSI1SK"] = &types.AttributeValueMemberS{Value: "NODE#" + node.ID.String()}

	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.table),
		Item:      item,
	})
	return err
}

func (s *DynamoDBStore) UpdateNodeHeartbeat(ctx context.Context, nodeID uuid.UUID) error {
    // In DynamoDB, we UpdateItem
    _, err := s.client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
        TableName: aws.String(s.table),
        Key: map[string]types.AttributeValue{
            "PK": &types.AttributeValueMemberS{Value: pkNode(nodeID)},
            "SK": &types.AttributeValueMemberS{Value: skMetadata()},
        },
        UpdateExpression: aws.String("SET last_heartbeat_at = :t"),
        ExpressionAttributeValues: map[string]types.AttributeValue{
            ":t": &types.AttributeValueMemberS{Value: time.Now().Format(time.RFC3339)},
        },
    })
	return err
}

func (s *DynamoDBStore) ListActiveNodes(ctx context.Context) ([]*store.WorkerNode, error) {
    // Requires GSI: GSI1PK = STATUS#active
    resp, err := s.client.Query(ctx, &dynamodb.QueryInput{
        TableName: aws.String(s.table),
        IndexName: aws.String("GSI1"), // Assuming GSI1 exists
        KeyConditionExpression: aws.String("GSI1PK = :pk"),
        ExpressionAttributeValues: map[string]types.AttributeValue{
            ":pk": &types.AttributeValueMemberS{Value: "STATUS#active"},
        },
    })
    if err != nil {
        return nil, err
    }

    var nodes []*store.WorkerNode
    if err := attributevalue.UnmarshalListOfMaps(resp.Items, &nodes); err != nil {
        return nil, err
    }
    return nodes, nil
}

// Session Methods
func pkSession(id uuid.UUID) string { return "SESSION#" + id.String() }

func (s *DynamoDBStore) CreateSession(ctx context.Context, session *store.VMSession) error {
	item, err := attributevalue.MarshalMap(session)
	if err != nil {
		return err
	}
	item["PK"] = &types.AttributeValueMemberS{Value: pkSession(session.ID)}
	item["SK"] = &types.AttributeValueMemberS{Value: skMetadata()}

	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(s.table),
		Item:      item,
	})
	return err
}

func (s *DynamoDBStore) GetSession(ctx context.Context, id uuid.UUID) (*store.VMSession, error) {
	resp, err := s.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(s.table),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pkSession(id)},
			"SK": &types.AttributeValueMemberS{Value: skMetadata()},
		},
	})
	if err != nil {
		return nil, err
	}
	if resp.Item == nil {
		return nil, errors.New("session not found")
	}

	var session store.VMSession
	if err := attributevalue.UnmarshalMap(resp.Item, &session); err != nil {
		return nil, err
	}
	return &session, nil
}

func (s *DynamoDBStore) UpdateSessionStatus(ctx context.Context, id uuid.UUID, status string) error {
    _, err := s.client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
        TableName: aws.String(s.table),
        Key: map[string]types.AttributeValue{
            "PK": &types.AttributeValueMemberS{Value: pkSession(id)},
            "SK": &types.AttributeValueMemberS{Value: skMetadata()},
        },
        UpdateExpression: aws.String("SET #s = :status"),
        ExpressionAttributeNames: map[string]string{
            "#s": "status", // explicit name to avoid reserved word conflicts
        },
        ExpressionAttributeValues: map[string]types.AttributeValue{
            ":status": &types.AttributeValueMemberS{Value: status},
        },
    })
	return err
}

