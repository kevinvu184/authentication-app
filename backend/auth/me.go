package main

import (
	"context"
	"net/http"
	"strings"

	"auth-app/common"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func MeHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	authHeader := request.Headers["Authorization"]
	if authHeader == "" {
		authHeader = request.Headers["authorization"]
	}
	
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return common.ErrorResponseFunc(http.StatusUnauthorized, "Unauthorized", "Missing or invalid authorization header")
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	claims, err := common.ValidateJWT(tokenString)
	if err != nil {
		return common.ErrorResponseFunc(http.StatusUnauthorized, "Unauthorized", "Invalid or expired token")
	}

	user, err := common.GetUserByID(claims.UserID)
	if err != nil {
		return common.ErrorResponseFunc(http.StatusNotFound, "Not Found", "User not found")
	}

	return common.Response(http.StatusOK, user)
}

func main() {
	lambda.Start(MeHandler)
}