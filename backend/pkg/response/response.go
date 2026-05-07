package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response is the standard JSON envelope for all API responses.
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// OK writes a 200 response with the given data payload.
func OK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

// Created writes a 201 response with the given data payload.
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Success: true,
		Data:    data,
	})
}

// Error writes an error response with the given HTTP status code and message.
func Error(c *gin.Context, statusCode int, err string) {
	c.JSON(statusCode, Response{
		Success: false,
		Error:   err,
	})
}

// Message writes a 200 response with only a message field (no data).
func Message(c *gin.Context, msg string) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Message: msg,
	})
}
