package dynamodb

import (
	"context"
	"encoding/base64"
	"encoding/json"

	"github.com/aws/aws-sdk-go-v2/service/kms"
)

type Encryptor struct {
	kmsClient *kms.Client
	keyID     string
}

func NewEncryptor(client *kms.Client, keyID string) *Encryptor {
	return &Encryptor{
		kmsClient: client,
		keyID:     keyID,
	}
}

func (e *Encryptor) Encrypt(ctx context.Context, data interface{}) ([]byte, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	input := &kms.EncryptInput{
		KeyId:     &e.keyID,
		Plaintext: jsonData,
	}

	result, err := e.kmsClient.Encrypt(ctx, input)
	if err != nil {
		return nil, err
	}

	return result.CiphertextBlob, nil
}

func (e *Encryptor) Decrypt(ctx context.Context, data []byte, v interface{}) error {
	input := &kms.DecryptInput{
		CiphertextBlob: data,
		KeyId:          &e.keyID,
	}

	result, err := e.kmsClient.Decrypt(ctx, input)
	if err != nil {
		return err
	}

	return json.Unmarshal(result.Plaintext, v)
}

// Helper to encrypt string to base64 string (for string fields)
func (e *Encryptor) EncryptString(ctx context.Context, text string) (string, error) {
	blob, err := e.Encrypt(ctx, text)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(blob), nil
}

func (e *Encryptor) DecryptString(ctx context.Context, b64 string) (string, error) {
	blob, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		return "", err
	}
	var text string
	if err := e.Decrypt(ctx, blob, &text); err != nil {
		return "", err
	}
	return text, nil
}
