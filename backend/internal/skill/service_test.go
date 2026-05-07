package skill

import (
	"context"
	"errors"
	"testing"
)

// --- fake repository ---

type fakeSkillRepo struct {
	skills map[int]*Skill
	nextID int
	err    error
}

func newFakeSkillRepo() *fakeSkillRepo {
	return &fakeSkillRepo{skills: make(map[int]*Skill), nextID: 1}
}

func (f *fakeSkillRepo) Create(_ context.Context, sk *Skill) (*Skill, error) {
	if f.err != nil {
		return nil, f.err
	}
	s := *sk
	s.ID = f.nextID
	f.nextID++
	f.skills[s.ID] = &s
	return &s, nil
}

func (f *fakeSkillRepo) FindByID(_ context.Context, id int) (*Skill, error) {
	if f.err != nil {
		return nil, f.err
	}
	s, ok := f.skills[id]
	if !ok {
		return nil, ErrNotFound
	}
	cp := *s
	return &cp, nil
}

func (f *fakeSkillRepo) List(_ context.Context) ([]*Skill, error) {
	if f.err != nil {
		return nil, f.err
	}
	out := make([]*Skill, 0, len(f.skills))
	for _, s := range f.skills {
		cp := *s
		out = append(out, &cp)
	}
	return out, nil
}

func (f *fakeSkillRepo) Update(_ context.Context, sk *Skill) (*Skill, error) {
	if f.err != nil {
		return nil, f.err
	}
	if _, ok := f.skills[sk.ID]; !ok {
		return nil, ErrNotFound
	}
	s := *sk
	f.skills[s.ID] = &s
	return &s, nil
}

func (f *fakeSkillRepo) Delete(_ context.Context, id int) error {
	if f.err != nil {
		return f.err
	}
	if _, ok := f.skills[id]; !ok {
		return ErrNotFound
	}
	delete(f.skills, id)
	return nil
}

// --- tests ---

func TestSkillCreate_Success(t *testing.T) {
	svc := NewService(newFakeSkillRepo())

	sk, err := svc.Create(context.Background(), CreateSkillRequest{
		Name:     "Go",
		Category: "backend",
		Level:    4,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if sk.Name != "Go" {
		t.Errorf("name: want Go, got %s", sk.Name)
	}
	if sk.Category != "backend" {
		t.Errorf("category: want backend, got %s", sk.Category)
	}
	if sk.Level != 4 {
		t.Errorf("level: want 4, got %d", sk.Level)
	}
	if sk.ID == 0 {
		t.Error("expected non-zero ID")
	}
}

func TestSkillList_ReturnsAll(t *testing.T) {
	svc := NewService(newFakeSkillRepo())

	svc.Create(context.Background(), CreateSkillRequest{Name: "Go", Category: "backend", Level: 4})
	svc.Create(context.Background(), CreateSkillRequest{Name: "React", Category: "frontend", Level: 3})

	skills, err := svc.List(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(skills) != 2 {
		t.Errorf("expected 2 skills, got %d", len(skills))
	}
}

func TestSkillList_RepositoryError(t *testing.T) {
	repo := newFakeSkillRepo()
	repo.err = errors.New("db down")
	svc := NewService(repo)

	_, err := svc.List(context.Background())
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestSkillUpdate_Success(t *testing.T) {
	svc := NewService(newFakeSkillRepo())

	sk, _ := svc.Create(context.Background(), CreateSkillRequest{Name: "Go", Category: "backend", Level: 4})

	updated, err := svc.Update(context.Background(), sk.ID, UpdateSkillRequest{
		Name:      "Golang",
		Category:  "backend",
		Level:     5,
		SortOrder: 1,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if updated.Name != "Golang" {
		t.Errorf("name: want Golang, got %s", updated.Name)
	}
	if updated.Level != 5 {
		t.Errorf("level: want 5, got %d", updated.Level)
	}
}

func TestSkillUpdate_NotFound(t *testing.T) {
	svc := NewService(newFakeSkillRepo())

	_, err := svc.Update(context.Background(), 999, UpdateSkillRequest{Name: "x", Category: "backend", Level: 1})
	if !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}

func TestSkillDelete_Success(t *testing.T) {
	svc := NewService(newFakeSkillRepo())

	sk, _ := svc.Create(context.Background(), CreateSkillRequest{Name: "Go", Category: "backend", Level: 4})

	if err := svc.Delete(context.Background(), sk.ID); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := svc.Delete(context.Background(), sk.ID); !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound after deletion, got %v", err)
	}
}

func TestSkillDelete_NotFound(t *testing.T) {
	svc := NewService(newFakeSkillRepo())

	if err := svc.Delete(context.Background(), 999); !errors.Is(err, ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}
