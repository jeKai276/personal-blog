package admin

import (
	"context"
	"fmt"
)

// Service handles business logic for admin operations.
type Service interface {
	GetStats(ctx context.Context) (*Stats, error)
}

type service struct {
	repo Repository
}

// NewService returns a Service backed by the given Repository.
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetStats(ctx context.Context) (*Stats, error) {
	stats, err := s.repo.GetStats(ctx)
	if err != nil {
		return nil, fmt.Errorf("get stats: %w", err)
	}
	return stats, nil
}
