package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"auth-app/common"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func SignInHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var signInReq common.SignInRequest
	
	if err := json.Unmarshal([]byte(request.Body), &signInReq); err != nil {
		return common.ErrorResponseFunc(http.StatusBadRequest, "Bad Request", "Invalid request body")
	}

	if !common.ValidateEmail(signInReq.Email) {
		return common.ErrorResponseFunc(http.StatusBadRequest, "Bad Request", "Invalid email format")
	}

	if strings.TrimSpace(signInReq.Password) == "" {
		return common.ErrorResponseFunc(http.StatusBadRequest, "Bad Request", "Password is required")
	}

	user, err := common.GetUserByEmail(strings.ToLower(strings.TrimSpace(signInReq.Email)))
	if err != nil {
		return common.ErrorResponseFunc(http.StatusUnauthorized, "Unauthorized", "Invalid email or password")
	}

	if !common.CheckPassword(signInReq.Password, user.Password) {
		return common.ErrorResponseFunc(http.StatusUnauthorized, "Unauthorized", "Invalid email or password")
	}

	token, err := common.GenerateJWT(user.ID, user.Email)
	if err != nil {
		return common.ErrorResponseFunc(http.StatusInternalServerError, "Internal Server Error", "Failed to generate token")
	}

	authResponse := common.AuthResponse{
		Token:     token,
		ExpiresIn: 24 * 60 * 60, // 24 hours in seconds
		User:      *user,
	}

	return common.Response(http.StatusOK, authResponse)
}

func main() {
	lambda.Start(SignInHandler)
}