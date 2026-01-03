package common

import (
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
)

// DynamoDB client
var DynamoClient *dynamodb.DynamoDB

// Initialize DynamoDB client
func init() {
	sess := session.Must(session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_REGION")),
	}))
	DynamoClient = dynamodb.New(sess)
}

// GetTableName returns the DynamoDB table name from environment variable
func GetTableName() string {
	tableName := os.Getenv("USERS_TABLE")
	if tableName == "" {
		return "auth-app-users"
	}
	return tableName
}

// GetUserByEmail retrieves a user from DynamoDB by email
func GetUserByEmail(email string) (*User, error) {
	result, err := DynamoClient.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(GetTableName()),
		Key: map[string]*dynamodb.AttributeValue{
			"email": {
				S: aws.String(email),
			},
		},
	})

	if err != nil {
		return nil, err
	}

	if result.Item == nil {
		return nil, fmt.Errorf("user not found")
	}

	var user User
	err = dynamodbattribute.UnmarshalMap(result.Item, &user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// GetUserByID retrieves a user from DynamoDB by ID
func GetUserByID(id string) (*User, error) {
	result, err := DynamoClient.Query(&dynamodb.QueryInput{
		TableName:              aws.String(GetTableName()),
		IndexName:              aws.String("UserIdIndex"),
		KeyConditionExpression: aws.String("id = :id"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":id": {
				S: aws.String(id),
			},
		},
	})

	if err != nil {
		return nil, err
	}

	if len(result.Items) == 0 {
		return nil, fmt.Errorf("user not found")
	}

	var user User
	err = dynamodbattribute.UnmarshalMap(result.Items[0], &user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// SaveUser saves a user to DynamoDB
func SaveUser(user *User) error {
	item, err := dynamodbattribute.MarshalMap(user)
	if err != nil {
		return err
	}

	_, err = DynamoClient.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String(GetTableName()),
		Item:      item,
	})

	return err
}

// UpdateUser updates a user in DynamoDB
func UpdateUser(user *User) error {
	// Update specific fields to avoid overwriting the entire record
	_, err := DynamoClient.UpdateItem(&dynamodb.UpdateItemInput{
		TableName: aws.String(GetTableName()),
		Key: map[string]*dynamodb.AttributeValue{
			"email": {
				S: aws.String(user.Email),
			},
		},
		UpdateExpression: aws.String("SET firstName = :firstName, lastName = :lastName"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":firstName": {
				S: aws.String(user.FirstName),
			},
			":lastName": {
				S: aws.String(user.LastName),
			},
		},
	})

	return err
}