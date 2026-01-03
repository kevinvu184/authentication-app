package main

import (
	"context"
	"net/http"

	"auth-app/common"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// SignOutHandler handles user logout
// In a JWT-based system, logout is handled client-side by removing the token
// This endpoint serves as a confirmation and can be used for logging/analytics
func SignOutHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// For JWT tokens, we don't need to invalidate server-side
	// The client should remove the token from local storage
	// In a more complex system, you might maintain a blacklist of tokens
	
	response := map[string]string{
		"message": "Successfully signed out",
	}

	return common.Response(http.StatusOK, response)
}

func main() {
	lambda.Start(SignOutHandler)
}