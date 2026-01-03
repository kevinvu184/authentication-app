package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"auth-app/common"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// UpdateProfileRequest represents the profile update request
type UpdateProfileRequest struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

// UpdateProfileHandler updates the authenticated user's profile
func UpdateProfileHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
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

	// Parse request body
	var updateReq UpdateProfileRequest
	if err := json.Unmarshal([]byte(request.Body), &updateReq); err != nil {
		return common.ErrorResponseFunc(http.StatusBadRequest, "Bad Request", "Invalid request body")
	}

	// Validate input
	if strings.TrimSpace(updateReq.FirstName) == "" || strings.TrimSpace(updateReq.LastName) == "" {
		return common.ErrorResponseFunc(http.StatusBadRequest, "Bad Request", "First name and last name are required")
	}

	// Get current user from database
	user, err := common.GetUserByID(claims.UserID)
	if err != nil {
		return common.ErrorResponseFunc(http.StatusNotFound, "Not Found", "User not found")
	}

	// Update user data
	user.FirstName = strings.TrimSpace(updateReq.FirstName)
	user.LastName = strings.TrimSpace(updateReq.LastName)
	user.UpdatedAt = time.Now()

	// Save updated user
	if err := common.UpdateUser(user); err != nil {
		return common.ErrorResponseFunc(http.StatusInternalServerError, "Internal Server Error", "Failed to update profile")
	}

	return common.Response(http.StatusOK, user)
}

func main() {
	lambda.Start(UpdateProfileHandler)
}