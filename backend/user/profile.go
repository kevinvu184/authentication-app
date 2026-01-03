package main

import (
	"context"
	"net/http"
	"strings"

	"auth-app/common"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// GetProfileHandler retrieves the authenticated user's profile
func GetProfileHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Extract JWT token from Authorization header
	authHeader := request.Headers["Authorization"]
	if authHeader == "" {
		authHeader = request.Headers["authorization"] // Handle case-insensitive headers
	}
	
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return common.ErrorResponseFunc(http.StatusUnauthorized, "Unauthorized", "Missing or invalid authorization header")
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	// Validate JWT token
	claims, err := common.ValidateJWT(tokenString)
	if err != nil {
		return common.ErrorResponseFunc(http.StatusUnauthorized, "Unauthorized", "Invalid or expired token")
	}

	// Get user from database
	user, err := common.GetUserByID(claims.UserID)
	if err != nil {
		return common.ErrorResponseFunc(http.StatusNotFound, "Not Found", "User not found")
	}

	return common.Response(http.StatusOK, user)
}

func main() {
	lambda.Start(GetProfileHandler)
}