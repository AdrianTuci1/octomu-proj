package api

import (
	"encoding/json"
	"fmt"
)

// OpenAPISpec represents a simplified OpenAPI 3.0 specification
type OpenAPISpec struct {
	OpenAPI string                 `json:"openapi"`
	Info    OpenAPISpecInfo        `json:"info"`
	Servers []OpenAPIServer        `json:"servers"`
	Paths   map[string]OpenAPIPath `json:"paths"`
}

type OpenAPISpecInfo struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Version     string `json:"version"`
}

type OpenAPIServer struct {
	URL         string `json:"url"`
	Description string `json:"description"`
}

type OpenAPIPath map[string]OpenAPIOperation // e.g., "get", "post"

type OpenAPIOperation struct {
	Summary     string                  `json:"summary"`
	OperationID string                  `json:"operationId"`
	Parameters  []OpenAPIParameter      `json:"parameters,omitempty"`
	RequestBody *OpenAPIRequestBody     `json:"requestBody,omitempty"`
	Responses   map[string]OpenAPIResponse `json:"responses"`
}

type OpenAPIParameter struct {
	Name        string `json:"name"`
	In          string `json:"in"` // query, header, path, cookie
	Required    bool   `json:"required"`
	Description string `json:"description"`
	Schema      any    `json:"schema"`
}

type OpenAPIRequestBody struct {
	Content map[string]OpenAPIMediaType `json:"content"`
}

type OpenAPIMediaType struct {
	Schema any `json:"schema"`
}

type OpenAPIResponse struct {
	Description string                  `json:"description"`
	Content     map[string]OpenAPIMediaType `json:"content,omitempty"`
}

func GenerateSpec(baseURL string) []byte {
	spec := OpenAPISpec{
		OpenAPI: "3.1.0",
		Info: OpenAPISpecInfo{
			Title:       "Octomus Local Agentic API",
			Description: "API for connecting LLMs to local tools via Octomus",
			Version:     "1.0.0",
		},
		Servers: []OpenAPIServer{
			{
				URL:         baseURL,
				Description: "Octomus Local Server",
			},
		},
		Paths: make(map[string]OpenAPIPath),
	}

	// GET /sync
	spec.Paths["/sync"] = OpenAPIPath{
		"get": OpenAPIOperation{
			Summary:     "Sync available tools",
			OperationID: "syncTools",
			Responses: map[string]OpenAPIResponse{
				"200": {
					Description: "List of available tools and their schemas",
					Content: map[string]OpenAPIMediaType{
						"application/json": {
							Schema: map[string]any{
								"type": "object",
								"properties": map[string]any{
									"tools": map[string]any{
										"type": "array",
										"items": map[string]any{
											"type": "object", // Tool definition
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	// POST /execute
	spec.Paths["/execute"] = OpenAPIPath{
		"post": OpenAPIOperation{
			Summary:     "Execute a tool functionality",
			OperationID: "executeTool",
			RequestBody: &OpenAPIRequestBody{
				Content: map[string]OpenAPIMediaType{
					"application/json": {
						Schema: map[string]any{
							"type": "object",
							"required": []string{"server_name", "tool_name", "arguments"},
							"properties": map[string]any{
								"server_name": map[string]any{"type": "string"},
								"tool_name":   map[string]any{"type": "string"},
								"arguments":   map[string]any{"type": "object"},
							},
						},
					},
				},
			},
			Responses: map[string]OpenAPIResponse{
				"200": {
					Description: "Tool execution result",
					Content: map[string]OpenAPIMediaType{
						"application/json": {
							Schema: map[string]any{
								"type": "object",
								"properties": map[string]any{
									"status":  map[string]any{"type": "string"},
									"result":  map[string]any{"type": "string"}, // JSON string or object
									"isError": map[string]any{"type": "boolean"},
								},
							},
						},
					},
				},
			},
		},
	}

	jsonBytes, err := json.MarshalIndent(spec, "", "  ")
	if err != nil {
		return []byte(fmt.Sprintf(`{"error": "%s"}`, err.Error()))
	}
	return jsonBytes
}
