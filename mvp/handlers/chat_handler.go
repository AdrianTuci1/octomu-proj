package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	"octomus-cloud/models"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// ProxyLLMChat acts as a secure proxy between the Wails client and the Gemini API.
func ProxyLLMChat(c *gin.Context) {
	var req models.ProxiedChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.MessageResponse{
			Message: "Invalid chat payload format",
			Status:  "error",
			Details: err.Error(),
		})
		return
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "GEMINI_API_KEY not configured"})
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Gemini client: " + err.Error()})
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")
	model.SetTemperature(0.7)
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text("You are Octomus Cloud AI, a helpful agentic assistant. You receive local tools dynamically provided by the user. Always use tools to verify information before answering if possible. Format responses using clean markdown."),
		},
	}

	// 1. Build Conversation History
	var history []*genai.Content
	for _, m := range req.Messages {
		role, _ := m["role"].(string)
		contentStr, _ := m["content"].(string)

		genaiRole := "user"
		if role == "assistant" {
			genaiRole = "model"
		} else if role == "tool" {
			genaiRole = "user" // Tools usually act as user messages containing function responses
			// Optional: wrap the response in the functionResponse protobuf structure, but sending text as "user" works too for MVP.
			contentStr = "Result of tool execution:\n" + contentStr
		}

		history = append(history, &genai.Content{
			Role:  genaiRole,
			Parts: []genai.Part{genai.Text(contentStr)},
		})
	}

	reqBytes, _ := json.MarshalIndent(req.Tools, "", "  ")
	log.Printf("[LLM PROXY] Incoming tools schema:\n%s", string(reqBytes))

	// 2. Register Tools dynamically from Wails Frontend
	var functionDecls []*genai.FunctionDeclaration
	for _, t := range req.Tools {
		name, _ := t["name"].(string)
		desc, _ := t["description"].(string)
		if name == "" {
			continue
		}

		genaiSchema := &genai.Schema{
			Type:       genai.TypeObject,
			Properties: map[string]*genai.Schema{},
		}

		// Try inputSchema first (standard MCP format), then parameters (legacy)
		var schemaSource map[string]interface{}
		if s, ok := t["inputSchema"].(map[string]interface{}); ok {
			schemaSource = s
		} else if s, ok := t["parameters"].(map[string]interface{}); ok {
			schemaSource = s
		}

		if schemaSource != nil {
			if props, ok := schemaSource["properties"].(map[string]interface{}); ok {
				for k, v := range props {
					propMap, ok := v.(map[string]interface{})
					if !ok {
						continue
					}

					propSchema := &genai.Schema{}

					// Map type
					typeStr, _ := propMap["type"].(string)
					switch typeStr {
					case "boolean":
						propSchema.Type = genai.TypeBoolean
					case "integer":
						propSchema.Type = genai.TypeInteger
					case "number":
						propSchema.Type = genai.TypeNumber
					case "array":
						propSchema.Type = genai.TypeArray
					case "object":
						propSchema.Type = genai.TypeObject
					default:
						propSchema.Type = genai.TypeString
					}

					// Map description
					if d, ok := propMap["description"].(string); ok {
						propSchema.Description = d
					}

					// Map enum values
					if enumVals, ok := propMap["enum"].([]interface{}); ok {
						for _, ev := range enumVals {
							if s, ok := ev.(string); ok {
								propSchema.Enum = append(propSchema.Enum, s)
							}
						}
					}

					genaiSchema.Properties[k] = propSchema
				}
			}

			// Map required fields
			if reqs, ok := schemaSource["required"].([]interface{}); ok {
				for _, r := range reqs {
					if rs, ok := r.(string); ok {
						genaiSchema.Required = append(genaiSchema.Required, rs)
					}
				}
			}
		}

		functionDecls = append(functionDecls, &genai.FunctionDeclaration{
			Name:        name,
			Description: desc,
			Parameters:  genaiSchema,
		})
	}

	if len(functionDecls) > 0 {
		model.Tools = []*genai.Tool{{FunctionDeclarations: functionDecls}}
	}

	// 3. Generate Content
	log.Printf("[LLM PROXY] Calling Gemini with %d history messages and %d tools", len(history), len(functionDecls))

	if len(history) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No messages provided"})
		return
	}

	lastMsgParts := history[len(history)-1].Parts
	history = history[:len(history)-1]

	cs := model.StartChat()
	cs.History = history
	resp, err := cs.SendMessage(ctx, lastMsgParts...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gemini generation failed: " + err.Error()})
		return
	}

	if len(resp.Candidates) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gemini returned no candidates"})
		return
	}

	part := resp.Candidates[0].Content.Parts[0]

	// 4. Handle Function Call or Text
	if funcCall, ok := part.(genai.FunctionCall); ok {
		log.Printf("[LLM PROXY] Gemini requested Tool Call: %s", funcCall.Name)
		c.JSON(http.StatusOK, models.ProxiedChatResponse{
			Role: "assistant",
			ToolCall: gin.H{
				"name":      funcCall.Name,
				"arguments": funcCall.Args,
			},
		})
		return
	}

	if text, ok := part.(genai.Text); ok {
		log.Printf("[LLM PROXY] Gemini returned Text: %d chars", len(string(text)))
		c.JSON(http.StatusOK, models.ProxiedChatResponse{
			Role:    "assistant",
			Content: string(text),
		})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"error": "Unknown response part type from Gemini"})
}

// Just keeping this to prevent unused string import if we need it later
func containsKeyword(query string, keywords ...string) bool {
	query = strings.ToLower(query)
	for _, kw := range keywords {
		if strings.Contains(query, strings.ToLower(kw)) {
			return true
		}
	}
	return false
}
