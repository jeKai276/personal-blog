package admin

import (
	"context"
	"errors"
	"testing"
)

type fakeAdminRepo struct {
	stats *Stats
	err   error
}

func (f *fakeAdminRepo) GetStats(_ context.Context) (*Stats, error) {
	return f.stats, f.err
}

func TestGetStats_Success(t *testing.T) {
	want := &Stats{
		TotalPosts:     10,
		PublishedPosts: 7,
		DraftPosts:     3,
		TotalAlbums:    5,
		TotalPhotos:    42,
		TotalSkills:    12,
		TotalProjects:  4,
	}
	svc := NewService(&fakeAdminRepo{stats: want})

	got, err := svc.GetStats(context.Background())
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if *got != *want {
		t.Errorf("stats mismatch: want %+v, got %+v", want, got)
	}
}

func TestGetStats_RepositoryError(t *testing.T) {
	svc := NewService(&fakeAdminRepo{err: errors.New("db down")})

	_, err := svc.GetStats(context.Background())
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestGetStats_ZeroValues(t *testing.T) {
	svc := NewService(&fakeAdminRepo{stats: &Stats{}})

	got, err := svc.GetStats(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.TotalPosts != 0 || got.TotalAlbums != 0 {
		t.Errorf("expected all zeros, got %+v", got)
	}
}
