package project

import (
	"context"
	"errors"
	"testing"
)

// --- fake repository ---

type fakeProjectRepo struct {
	projects map[int]*Project
	nextID   int
	err      error
}

func newFakeProjectRepo() *fakeProjectRepo {
	return &fakeProjectRepo{projects: make(map[int]*Project), nextID: 1}
}

func (f *fakeProjectRepo) Create(_ context.Context, p *Project) (*Project, error) {
	if f.err != nil {
		return nil, f.err
	}
	proj := *p
	proj.ID = f.nextID
	f.nextID++
	f.projects[proj.ID] = &proj
	return &proj, nil
}

func (f *fakeProjectRepo) FindByID(_ context.Context, id int) (*Project, error) {
	if f.err != nil {
		return nil, f.err
	}
	p, ok := f.projects[id]
	if !ok {
		return nil, ErrNotFound
	}
	cp := *p
	return &cp, nil
}

func (f *fakeProjectRepo) List(_ context.Context) ([]*Project, error) {
	if f.err != nil {
		return nil, f.err
	}
	out := make([]*Project, 0, len(f.projects))
	for _, p := range f.projects {
		cp := *p
		out = append(out, &cp)
	}
	return out, nil
}

func (f *fakeProjectRepo) Update(_ context.Context, p *Project) (*Project, error) {
	if f.err != nil {
		return nil, f.err
	}
	if _, ok := f.projects[p.ID]; !ok {
		return nil, ErrNotFound
	}
	proj := *p
	f.projects[proj.ID] = &proj
	return &proj, nil
}

func (f *fakeProjectRepo) Delete(_ context.Context, id int) error {
	if f.err != nil {
		return f.err
	}
	if _, ok := f.projects[id]; !ok {
		return ErrNotFound
	}
	delete(f.projects, id)
	return nil
}

// --- tests ---

func TestProjectCreate_Success(t *testing.T) {
	svc := NewService(newFakeProjectRepo())

	p, err := svc.Create(context.Background(), CreateProjectRequest{
		Title:       "My Blog",
		Description: "A personal blog",
		IsFeatured:  true,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Title != "My Blog" {
		t.Errorf("title: want My Blog, got %s", p.Title)
	}
	if !p.IsFeatured {
		t.Error("expected is_featured=true")
	}
	if p.ID == 0 {
		t.Error("expected non-zero ID")
	}
}

func TestProjectCreate_NilTechStackBecomesEmpty(t *testing.T) {
	svc := NewService(newFakeProjectRepo())

	p, err := svc.Create(context.Background(), CreateProjectRequest{Title: "T"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.TechStack == nil {
		t.Error("expected non-nil TechStack")
	}
	if len(p.TechStack) != 0 {
		t.Errorf("expected empty TechStack, got %v", p.TechStack)
	}
}

func TestProjectList_ReturnsAll(t *testing.T) {
	svc := NewService(newFakeProjectRepo())

	svc.Create(context.Background(), CreateProjectRequest{Title: "P1"})
	svc.Create(context.Background(), CreateProjectRequest{Title: "P2"})

	projects, err := svc.List(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(projects) != 2 {
		t.Errorf("expected 2 projects, got %d", len(projects))
	}
}

func TestProjectList_RepositoryError(t *testing.T) {
	repo := newFakeProjectRepo()
	repo.err = errors.New("db down")
	svc := NewService(repo)

	_, err := svc.List(context.Background())
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestProjectUpdate_Success(t *testing.T) {
	svc := NewService(newFakeProjectRepo())

	p, _ := svc.Create(context.Background(), CreateProjectRequest{Title: "Old Title"})

	updated, err := svc.Update(context.Background(), p.ID, UpdateProjectRequest{
		Title:      "New Title",
		IsFeatured: true,
		TechStack:  []string{"Go", "React"},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if updated.Title != "New Title" {
		t.Errorf("title: want New Title, got %s", updated.Title)
	}
	if !updated.IsFeatured {
		t.Error("expected is_featured=true")
	}
	if len(updated.TechStack) != 2 {
		t.Errorf("expected 2 tech stack items, got %d", len(updated.TechStack))
	}
}

func TestProjectUpdate_NotFound(t *testing.T) {
	svc := NewService(newFakeProjectRepo())

	_, err := svc.Update(context.Background(), 999, UpdateProjectRequest{Title: "x"})
	if !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}

func TestProjectUpdate_NilTechStackBecomesEmpty(t *testing.T) {
	svc := NewService(newFakeProjectRepo())

	p, _ := svc.Create(context.Background(), CreateProjectRequest{Title: "T", TechStack: []string{"Go"}})

	updated, err := svc.Update(context.Background(), p.ID, UpdateProjectRequest{Title: "T", TechStack: nil})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if updated.TechStack == nil {
		t.Error("expected non-nil TechStack after update with nil input")
	}
}

func TestProjectDelete_Success(t *testing.T) {
	svc := NewService(newFakeProjectRepo())

	p, _ := svc.Create(context.Background(), CreateProjectRequest{Title: "T"})

	if err := svc.Delete(context.Background(), p.ID); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := svc.Delete(context.Background(), p.ID); !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound after deletion, got %v", err)
	}
}

func TestProjectDelete_NotFound(t *testing.T) {
	svc := NewService(newFakeProjectRepo())

	if err := svc.Delete(context.Background(), 999); !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}
