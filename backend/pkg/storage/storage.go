package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
)

// Storage wraps S3 operations needed by the application.
type Storage interface {
	// PresignedPutURL returns a presigned URL for the client to upload directly to S3.
	PresignedPutURL(ctx context.Context, key, contentType string, expiry time.Duration) (string, error)

	// Delete removes an object from S3.
	Delete(ctx context.Context, key string) error

	// PutObject uploads bytes directly (used for thumbnails generated server-side).
	PutObject(ctx context.Context, key, contentType string, data []byte) error

	// GetObject downloads an object (used for thumbnail generation after client upload).
	GetObject(ctx context.Context, key string) ([]byte, error)

	// PublicURL returns the public HTTPS URL for a given S3 key.
	PublicURL(key string) string
}

type s3Storage struct {
	client  *s3.Client
	presign *s3.PresignClient
	bucket  string
	baseURL string
}

// New creates a new Storage backed by AWS S3.
func New(region, bucket, accessKey, secretKey, baseURL string) (Storage, error) {
	cfg, err := awsconfig.LoadDefaultConfig(
		context.Background(),
		awsconfig.WithRegion(region),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	client := s3.NewFromConfig(cfg)
	presign := s3.NewPresignClient(client)

	return &s3Storage{
		client:  client,
		presign: presign,
		bucket:  bucket,
		baseURL: baseURL,
	}, nil
}

// NewR2 creates a Storage backed by Cloudflare R2 (S3-compatible).
func NewR2(accountID, bucket, accessKey, secretKey, baseURL string) (Storage, error) {
	if accountID == "" || bucket == "" || accessKey == "" || secretKey == "" {
		return nil, fmt.Errorf("R2 credentials incomplete")
	}

	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID)

	cfg, err := awsconfig.LoadDefaultConfig(
		context.Background(),
		awsconfig.WithRegion("auto"),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("load R2 config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})
	presign := s3.NewPresignClient(client)

	if baseURL == "" {
		baseURL = fmt.Sprintf("https://%s.r2.dev", bucket)
	}

	return &s3Storage{
		client:  client,
		presign: presign,
		bucket:  bucket,
		baseURL: baseURL,
	}, nil
}

// PresignedPutURL returns a presigned URL valid for the given expiry duration.
func (s *s3Storage) PresignedPutURL(ctx context.Context, key, contentType string, expiry time.Duration) (string, error) {
	req, err := s.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(expiry))
	if err != nil {
		return "", fmt.Errorf("presign put object: %w", err)
	}
	return req.URL, nil
}

// Delete removes an object from S3.
func (s *s3Storage) Delete(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("delete object %q: %w", key, err)
	}
	return nil
}

// PutObject uploads raw bytes to S3.
func (s *s3Storage) PutObject(ctx context.Context, key, contentType string, data []byte) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
		Body:        bytes.NewReader(data),
	})
	if err != nil {
		return fmt.Errorf("put object %q: %w", key, err)
	}
	return nil
}

// GetObject downloads an object from S3 and returns its bytes.
func (s *s3Storage) GetObject(ctx context.Context, key string) ([]byte, error) {
	out, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, fmt.Errorf("get object %q: %w", key, err)
	}
	defer out.Body.Close()

	data, err := io.ReadAll(out.Body)
	if err != nil {
		return nil, fmt.Errorf("read object body %q: %w", key, err)
	}
	return data, nil
}

// PublicURL returns the public HTTPS URL for a given S3 key.
func (s *s3Storage) PublicURL(key string) string {
	return fmt.Sprintf("%s/%s", s.baseURL, key)
}
