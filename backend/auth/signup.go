package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"auth-app/common"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// SignUpHandler handles user registration
func SignUpHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var signUpReq common.SignUpRequest
	
	if err := json.Unmarshal([]byte(request.Body), &signUpReq); err != nil {
		return common.ErrorResponseFunc(http.StatusBadRequest, "Bad Request", "Invalid request body")
	}

	// Validate input
	if !common.ValidateEmail(signUpReq.Email) {
		return common.ErrorResponseFunc(http.StatusBadRequest, "Bad Request", "Invalid email format")
	}

	if !common.ValidatePassword(signUpReq.Password) {
		return common.ErrorResponseFunc(http.StatusBadRequest, "Bad Request", "Password must be at least 8 characters")
	}

	if strings.TrimSpace(signUpReq.FirstName) == "" || strings.TrimSpace(signUpReq.LastName) == "" {
		return common.ErrorResponseFunc(http.StatusBadRequest, "Bad Request", "First name and last name are required")
	}

	// Check if user already exists
	existingUser, _ := common.GetUserByEmail(signUpReq.Email)
	if existingUser != nil {
		return common.ErrorResponseFunc(http.StatusConflict, "Conflict", "User with this email already exists")
	}

	// Hash password
	hashedPassword, err := common.HashPassword(signUpReq.Password)
	if err != nil {
		return common.ErrorResponseFunc(http.StatusInternalServerError, "Internal Server Error", "Failed to process password")
	}

	// Create user
	userID, err := generateUserID()
	if err != nil {
		return common.ErrorResponseFunc(http.StatusInternalServerError, "Internal Server Error", "Failed to generate user ID")
	}

	user := &common.User{
		CreatedAt: time.Now(),
		Email:     strings.ToLower(strings.TrimSpace(signUpReq.Email)),
		FirstName: strings.TrimSpace(signUpReq.FirstName),
		ID:        userID,
		LastName:  strings.TrimSpace(signUpReq.LastName),
		Password:  hashedPassword,
	}

	// Save to DynamoDB
	if err := common.SaveUser(user); err != nil {
		return common.ErrorResponseFunc(http.StatusInternalServerError, "Internal Server Error", "Failed to create user")
	}

	// Generate JWT token
	token, err := common.GenerateJWT(user.ID, user.Email)
	if err != nil {
		return common.ErrorResponseFunc(http.StatusInternalServerError, "Internal Server Error", "Failed to generate token")
	}

	// Prepare response
	authResponse := common.AuthResponse{
		Token:     token,
		ExpiresIn: 24 * 60 * 60, // 24 hours in seconds
		User:      *user,
	}

	return common.Response(http.StatusCreated, authResponse)
}

// generateUserID creates a secure random user ID
func generateUserID() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func main() {
	lambda.Start(SignUpHandler)
}