package project

import (
	"context"
	"fmt"
)

// Service handles business logic for projects.
type Service interface {
	Create(ctx context.Context, req CreateProjectRequest) (*Project, error)
	List(ctx context.Context) ([]*Project, error)
	Update(ctx context.Context, id int, req UpdateProjectRequest) (*Project, error)
	Delete(ctx context.Context, id int) error
}

type service struct {
	repo Repository
}

// NewService creates a new project Service.
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Create(ctx context.Context, req CreateProjectRequest) (*Project, error) {
	techStack := req.TechStack
	if techStack == nil {
		techStack = []string{}
	}

	p := &Project{
		Title:         req.Title,
		Description:   req.Description,
		TechStack:     techStack,
		GithubURL:     req.GithubURL,
		DemoURL:       req.DemoURL,
		CoverImageURL: req.CoverImageURL,
		IsFeatured:    req.IsFeatured,
		SortOrder:     req.SortOrder,
	}
	created, err := s.repo.Create(ctx, p)
	if err != nil {
		return nil, fmt.Errorf("create project: %w", err)
	}
	return created, nil
}

func (s *service) List(ctx context.Context) ([]*Project, error) {
	return s.repo.List(ctx)
}

func (s *service) Update(ctx context.Context, id int, req UpdateProjectRequest) (*Project, error) {
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	techStack := req.TechStack
	if techStack == nil {
		techStack = []string{}
	}

	existing.Title = req.Title
	existing.Description = req.Description
	existing.TechStack = techStack
	existing.GithubURL = req.GithubURL
	existing.DemoURL = req.DemoURL
	existing.CoverImageURL = req.CoverImageURL
	existing.IsFeatured = req.IsFeatured
	existing.SortOrder = req.SortOrder

	updated, err := s.repo.Update(ctx, existing)
	if err != nil {
		return nil, fmt.Errorf("update project: %w", err)
	}
	return updated, nil
}

func (s *service) Delete(ctx context.Context, id int) error {
	return s.repo.Delete(ctx, id)
}
