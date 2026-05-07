package skill

import (
	"context"
	"fmt"
)

// Service handles business logic for skills.
type Service interface {
	Create(ctx context.Context, req CreateSkillRequest) (*Skill, error)
	List(ctx context.Context) ([]*Skill, error)
	Update(ctx context.Context, id int, req UpdateSkillRequest) (*Skill, error)
	Delete(ctx context.Context, id int) error
}

type service struct {
	repo Repository
}

// NewService creates a new skill Service.
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Create(ctx context.Context, req CreateSkillRequest) (*Skill, error) {
	sk := &Skill{
		Name:      req.Name,
		Category:  req.Category,
		Level:     req.Level,
		IconURL:   req.IconURL,
		SortOrder: req.SortOrder,
	}
	created, err := s.repo.Create(ctx, sk)
	if err != nil {
		return nil, fmt.Errorf("create skill: %w", err)
	}
	return created, nil
}

func (s *service) List(ctx context.Context) ([]*Skill, error) {
	return s.repo.List(ctx)
}

func (s *service) Update(ctx context.Context, id int, req UpdateSkillRequest) (*Skill, error) {
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	existing.Name = req.Name
	existing.Category = req.Category
	existing.Level = req.Level
	existing.IconURL = req.IconURL
	existing.SortOrder = req.SortOrder

	updated, err := s.repo.Update(ctx, existing)
	if err != nil {
		return nil, fmt.Errorf("update skill: %w", err)
	}
	return updated, nil
}

func (s *service) Delete(ctx context.Context, id int) error {
	return s.repo.Delete(ctx, id)
}
