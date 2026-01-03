package main

import (
	"context"
	"net/http"

	"auth-app/common"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func SignOutHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	response := map[string]string{
		"message": "Successfully signed out",
	}
	return common.Response(http.StatusOK, response)
}

func main() {
	lambda.Start(SignOutHandler)
}