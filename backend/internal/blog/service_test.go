package blog

import (
	"context"
	"errors"
	"testing"
)

// --- fake repository ---

type fakeBlogRepo struct {
	posts              map[int]*Post
	nextID             int
	slugCounts         map[string]int
	err                error
	capturedListParams ListPostsParams
}

func newFakeBlogRepo() *fakeBlogRepo {
	return &fakeBlogRepo{
		posts:      make(map[int]*Post),
		slugCounts: make(map[string]int),
		nextID:     1,
	}
}

func (f *fakeBlogRepo) Create(_ context.Context, post *Post) (*Post, error) {
	if f.err != nil {
		return nil, f.err
	}
	p := *post
	p.ID = f.nextID
	f.nextID++
	f.posts[p.ID] = &p
	f.slugCounts[p.Slug]++
	return &p, nil
}

func (f *fakeBlogRepo) FindByID(_ context.Context, id int) (*Post, error) {
	if f.err != nil {
		return nil, f.err
	}
	p, ok := f.posts[id]
	if !ok {
		return nil, ErrNotFound
	}
	cp := *p
	return &cp, nil
}

func (f *fakeBlogRepo) FindBySlug(_ context.Context, slug string) (*Post, error) {
	if f.err != nil {
		return nil, f.err
	}
	for _, p := range f.posts {
		if p.Slug == slug {
			cp := *p
			return &cp, nil
		}
	}
	return nil, ErrNotFound
}

func (f *fakeBlogRepo) List(_ context.Context, params ListPostsParams) ([]*Post, int, error) {
	f.capturedListParams = params
	if f.err != nil {
		return nil, 0, f.err
	}
	return nil, 0, nil
}

func (f *fakeBlogRepo) Update(_ context.Context, post *Post) (*Post, error) {
	if f.err != nil {
		return nil, f.err
	}
	if _, ok := f.posts[post.ID]; !ok {
		return nil, ErrNotFound
	}
	p := *post
	f.posts[p.ID] = &p
	return &p, nil
}

func (f *fakeBlogRepo) Delete(_ context.Context, id int) error {
	if f.err != nil {
		return f.err
	}
	if _, ok := f.posts[id]; !ok {
		return ErrNotFound
	}
	delete(f.posts, id)
	return nil
}

func (f *fakeBlogRepo) SlugExists(_ context.Context, slug string) (bool, error) {
	if f.err != nil {
		return false, f.err
	}
	return f.slugCounts[slug] > 0, nil
}

// --- tests ---

func TestCreate_AssignsDraftStatus(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	post, err := svc.Create(context.Background(), CreatePostRequest{
		Title:   "Hello World",
		Content: "Content here",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if post.Status != "draft" {
		t.Errorf("expected status=draft, got %s", post.Status)
	}
}

func TestCreate_GeneratesSlugFromTitle(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	post, err := svc.Create(context.Background(), CreatePostRequest{
		Title:   "My First Post",
		Content: "Content",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if post.Slug == "" {
		t.Error("expected non-empty slug")
	}
}

func TestCreate_NilTagsBecomesEmpty(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	post, err := svc.Create(context.Background(), CreatePostRequest{
		Title:   "T",
		Content: "C",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if post.Tags == nil {
		t.Error("expected non-nil Tags slice")
	}
}

func TestCreate_GeneratesUniqueSlugOnCollision(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	p1, err := svc.Create(context.Background(), CreatePostRequest{Title: "Hello", Content: "c"})
	if err != nil {
		t.Fatalf("first create: %v", err)
	}

	p2, err := svc.Create(context.Background(), CreatePostRequest{Title: "Hello", Content: "c"})
	if err != nil {
		t.Fatalf("second create: %v", err)
	}
	if p1.Slug == p2.Slug {
		t.Errorf("expected unique slugs, both got %q", p1.Slug)
	}
}

func TestCreate_WhitespaceTitleReturnsError(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	_, err := svc.Create(context.Background(), CreatePostRequest{
		Title:   "   ",
		Content: "Content",
	})
	if err == nil {
		t.Fatal("expected error for whitespace-only title, got nil")
	}
}

func TestListPublished_PassesCorrectStatus(t *testing.T) {
	repo := newFakeBlogRepo()
	svc := NewService(repo)

	if _, _, err := svc.ListPublished(context.Background(), "", 1, 10); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if repo.capturedListParams.Status != "published" {
		t.Errorf("expected status=published, got %q", repo.capturedListParams.Status)
	}
}

func TestListAll_PassesCorrectStatus(t *testing.T) {
	repo := newFakeBlogRepo()
	svc := NewService(repo)

	if _, _, err := svc.ListAll(context.Background(), 1, 10); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if repo.capturedListParams.Status != "all" {
		t.Errorf("expected status=all, got %q", repo.capturedListParams.Status)
	}
}

func TestUpdate_NotFound(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	_, err := svc.Update(context.Background(), 999, UpdatePostRequest{Title: "t", Content: "c"})
	if !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}

func TestDelete_Success(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	post, _ := svc.Create(context.Background(), CreatePostRequest{Title: "t", Content: "c"})

	if err := svc.Delete(context.Background(), post.ID); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := svc.Delete(context.Background(), post.ID); !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound after deletion, got %v", err)
	}
}

func TestDelete_NotFound(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	if err := svc.Delete(context.Background(), 999); !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}

func TestPublish_SetsStatusAndPublishedAt(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	post, _ := svc.Create(context.Background(), CreatePostRequest{Title: "t", Content: "c"})

	published, err := svc.Publish(context.Background(), post.ID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if published.Status != "published" {
		t.Errorf("expected status=published, got %s", published.Status)
	}
	if published.PublishedAt == nil {
		t.Error("expected PublishedAt to be set")
	}
}

func TestPublish_PreservesOriginalPublishedAt(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	post, _ := svc.Create(context.Background(), CreatePostRequest{Title: "t", Content: "c"})

	// First publish — sets publishedAt.
	first, _ := svc.Publish(context.Background(), post.ID)
	originalTime := *first.PublishedAt

	// Second publish (no unpublish in between) — must preserve original time.
	second, err := svc.Publish(context.Background(), post.ID)
	if err != nil {
		t.Fatalf("re-publish: %v", err)
	}
	if second.PublishedAt == nil || !second.PublishedAt.Equal(originalTime) {
		t.Error("re-publish should preserve original published_at")
	}
}

func TestUnpublish_SetsDraftAndClearsPublishedAt(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	post, _ := svc.Create(context.Background(), CreatePostRequest{Title: "t", Content: "c"})
	svc.Publish(context.Background(), post.ID)

	unpublished, err := svc.Unpublish(context.Background(), post.ID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if unpublished.Status != "draft" {
		t.Errorf("expected status=draft, got %s", unpublished.Status)
	}
	if unpublished.PublishedAt != nil {
		t.Error("expected PublishedAt to be nil after unpublish")
	}
}

func TestUnpublish_NotFound(t *testing.T) {
	svc := NewService(newFakeBlogRepo())

	_, err := svc.Unpublish(context.Background(), 999)
	if !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}
