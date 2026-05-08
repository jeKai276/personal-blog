package blog

import (
	"context"
	"fmt"
	"time"

	"github.com/gosimple/slug"
)

// Service handles business logic for blog posts.
type Service interface {
	Create(ctx context.Context, req CreatePostRequest) (*Post, error)
	GetByID(ctx context.Context, id int) (*Post, error)
	GetBySlug(ctx context.Context, s string) (*Post, error)
	ListPublished(ctx context.Context, tag string, page, limit int) ([]*Post, int, error)
	ListAll(ctx context.Context, page, limit int) ([]*Post, int, error)
	Update(ctx context.Context, id int, req UpdatePostRequest) (*Post, error)
	Delete(ctx context.Context, id int) error
	Publish(ctx context.Context, id int) (*Post, error)
	Unpublish(ctx context.Context, id int) (*Post, error)
}

type service struct {
	repo Repository
}

// NewService returns a Service backed by the given Repository.
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Create(ctx context.Context, req CreatePostRequest) (*Post, error) {
	base := slug.Make(req.Title)
	if base == "" {
		return nil, fmt.Errorf("title produces empty slug — use meaningful text")
	}
	uniqueSlug, err := s.uniqueSlug(ctx, base)
	if err != nil {
		return nil, fmt.Errorf("generate slug: %w", err)
	}

	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	post := &Post{
		Title:         req.Title,
		Slug:          uniqueSlug,
		Content:       req.Content,
		Excerpt:       req.Excerpt,
		CoverImageURL: req.CoverImageURL,
		Status:        "draft",
		Tags:          tags,
	}

	created, err := s.repo.Create(ctx, post)
	if err != nil {
		return nil, fmt.Errorf("create post: %w", err)
	}
	return created, nil
}

func (s *service) GetByID(ctx context.Context, id int) (*Post, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *service) GetBySlug(ctx context.Context, sl string) (*Post, error) {
	return s.repo.FindBySlug(ctx, sl)
}

func (s *service) ListPublished(ctx context.Context, tag string, page, limit int) ([]*Post, int, error) {
	return s.repo.List(ctx, ListPostsParams{
		Tag:    tag,
		Page:   page,
		Limit:  limit,
		Status: "published",
	})
}

func (s *service) ListAll(ctx context.Context, page, limit int) ([]*Post, int, error) {
	return s.repo.List(ctx, ListPostsParams{
		Page:   page,
		Limit:  limit,
		Status: "all",
	})
}

func (s *service) Update(ctx context.Context, id int, req UpdatePostRequest) (*Post, error) {
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	existing.Title = req.Title
	existing.Content = req.Content
	existing.Excerpt = req.Excerpt
	existing.CoverImageURL = req.CoverImageURL
	existing.Tags = tags

	updated, err := s.repo.Update(ctx, existing)
	if err != nil {
		return nil, fmt.Errorf("update post: %w", err)
	}
	return updated, nil
}

func (s *service) Delete(ctx context.Context, id int) error {
	return s.repo.Delete(ctx, id)
}

func (s *service) Publish(ctx context.Context, id int) (*Post, error) {
	post, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	post.Status = "published"
	// Preserve original published_at on re-publish so sort-by-date stays correct.
	if post.PublishedAt == nil {
		now := time.Now()
		post.PublishedAt = &now
	}

	updated, err := s.repo.Update(ctx, post)
	if err != nil {
		return nil, fmt.Errorf("publish post: %w", err)
	}
	return updated, nil
}

func (s *service) Unpublish(ctx context.Context, id int) (*Post, error) {
	post, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	post.Status = "draft"
	post.PublishedAt = nil

	updated, err := s.repo.Update(ctx, post)
	if err != nil {
		return nil, fmt.Errorf("unpublish post: %w", err)
	}
	return updated, nil
}

// uniqueSlug ensures the slug is unique by appending -2, -3... if necessary.
func (s *service) uniqueSlug(ctx context.Context, base string) (string, error) {
	candidate := base
	for i := 2; ; i++ {
		exists, err := s.repo.SlugExists(ctx, candidate)
		if err != nil {
			return "", err
		}
		if !exists {
			return candidate, nil
		}
		candidate = fmt.Sprintf("%s-%d", base, i)
	}
}
