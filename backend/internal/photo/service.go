package photo

import (
	"bytes"
	"context"
	"fmt"
	"image/jpeg"
	"log"
	"strings"

	"github.com/disintegration/imaging"
	"github.com/yendp/personal-blog/pkg/storage"
)

// Service handles business logic for albums and photos.
type Service interface {
	// Album operations
	CreateAlbum(ctx context.Context, req CreateAlbumRequest) (*Album, error)
	GetAlbum(ctx context.Context, id int) (*Album, error)
	ListAlbums(ctx context.Context) ([]*Album, error)
	UpdateAlbum(ctx context.Context, id int, req UpdateAlbumRequest) (*Album, error)
	DeleteAlbum(ctx context.Context, id int) error

	// Photo operations
	AddPhoto(ctx context.Context, albumID int, req AddPhotoRequest) (*Photo, error)
	DeletePhoto(ctx context.Context, photoID int) error
	UpdatePhoto(ctx context.Context, photoID int, req UpdatePhotoRequest) (*Photo, error)
}

type service struct {
	repo  Repository
	store storage.Storage
}

// NewService creates a new photo Service.
func NewService(repo Repository, store storage.Storage) Service {
	return &service{repo: repo, store: store}
}

// ---- Album operations ----

func (s *service) CreateAlbum(ctx context.Context, req CreateAlbumRequest) (*Album, error) {
	takenAt, err := parseTakenAt(req.TakenAt)
	if err != nil {
		return nil, err
	}

	album := &Album{
		Title:       req.Title,
		Description: req.Description,
		Location:    req.Location,
		TakenAt:     takenAt,
	}

	created, err := s.repo.CreateAlbum(ctx, album)
	if err != nil {
		return nil, fmt.Errorf("create album: %w", err)
	}
	return created, nil
}

func (s *service) GetAlbum(ctx context.Context, id int) (*Album, error) {
	album, err := s.repo.FindAlbumByID(ctx, id)
	if err != nil {
		return nil, err
	}
	for i, p := range album.Photos {
		album.Photos[i] = s.enrichPhoto(p)
	}
	return album, nil
}

func (s *service) ListAlbums(ctx context.Context) ([]*Album, error) {
	return s.repo.ListAlbums(ctx)
}

func (s *service) UpdateAlbum(ctx context.Context, id int, req UpdateAlbumRequest) (*Album, error) {
	takenAt, err := parseTakenAt(req.TakenAt)
	if err != nil {
		return nil, err
	}

	album := &Album{
		ID:           id,
		Title:        req.Title,
		Description:  req.Description,
		Location:     req.Location,
		TakenAt:      takenAt,
		CoverPhotoID: req.CoverPhotoID,
	}

	updated, err := s.repo.UpdateAlbum(ctx, album)
	if err != nil {
		return nil, fmt.Errorf("update album: %w", err)
	}
	return updated, nil
}

func (s *service) DeleteAlbum(ctx context.Context, id int) error {
	return s.repo.DeleteAlbum(ctx, id)
}

// ---- Photo operations ----

// AddPhoto saves photo metadata and generates a thumbnail via S3.
// req.URL must be the S3 key returned by the presigned-url endpoint (format: "photos/<ts>/<filename>").
// S3 keys are stored in the database; full URLs are populated before returning.
func (s *service) AddPhoto(ctx context.Context, albumID int, req AddPhotoRequest) (*Photo, error) {
	// Guard against path traversal: only accept keys issued by our presigned-url endpoint.
	if !strings.HasPrefix(req.URL, "photos/") || strings.Contains(req.URL, "..") {
		return nil, fmt.Errorf("invalid photo key: must start with \"photos/\" and contain no \"..\"")
	}

	// 1. Download original from S3.
	data, err := s.store.GetObject(ctx, req.URL)
	if err != nil {
		return nil, fmt.Errorf("download original from S3: %w", err)
	}

	// 2. Decode image.
	img, err := imaging.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("decode image: %w", err)
	}

	// 3. Resize to max 400px width, preserving aspect ratio.
	thumb := imaging.Resize(img, 400, 0, imaging.Lanczos)

	// 4. Encode thumbnail as JPEG.
	var thumbBuf bytes.Buffer
	if err := jpeg.Encode(&thumbBuf, thumb, &jpeg.Options{Quality: 85}); err != nil {
		return nil, fmt.Errorf("encode thumbnail: %w", err)
	}

	// 5. Upload thumbnail to S3.
	thumbKey := "thumbs/" + req.URL
	if err := s.store.PutObject(ctx, thumbKey, "image/jpeg", thumbBuf.Bytes()); err != nil {
		return nil, fmt.Errorf("upload thumbnail: %w", err)
	}

	// 6. Persist S3 keys in DB (not full URLs — keys are needed for future deletion).
	photo := &Photo{
		AlbumID:      albumID,
		URL:          req.URL,
		ThumbnailURL: thumbKey,
		Caption:      req.Caption,
		Width:        req.Width,
		Height:       req.Height,
		SizeBytes:    req.SizeBytes,
	}

	created, err := s.repo.CreatePhoto(ctx, photo)
	if err != nil {
		return nil, fmt.Errorf("save photo metadata: %w", err)
	}
	return s.enrichPhoto(created), nil
}

// DeletePhoto removes the photo from S3 (original + thumbnail) and the database.
// photo.URL and photo.ThumbnailURL stored in DB are S3 keys.
func (s *service) DeletePhoto(ctx context.Context, photoID int) error {
	photo, err := s.repo.FindPhotoByID(ctx, photoID)
	if err != nil {
		return err
	}

	if photo.URL != "" {
		if err := s.store.Delete(ctx, photo.URL); err != nil {
			log.Printf("photo.DeletePhoto: delete original from S3 (key=%q): %v", photo.URL, err)
		}
	}
	if photo.ThumbnailURL != "" {
		if err := s.store.Delete(ctx, photo.ThumbnailURL); err != nil {
			log.Printf("photo.DeletePhoto: delete thumbnail from S3 (key=%q): %v", photo.ThumbnailURL, err)
		}
	}

	return s.repo.DeletePhoto(ctx, photoID)
}

// UpdatePhoto updates mutable photo fields.
func (s *service) UpdatePhoto(ctx context.Context, photoID int, req UpdatePhotoRequest) (*Photo, error) {
	photo, err := s.repo.FindPhotoByID(ctx, photoID)
	if err != nil {
		return nil, err
	}

	photo.Caption = req.Caption
	photo.SortOrder = req.SortOrder

	updated, err := s.repo.UpdatePhoto(ctx, photo)
	if err != nil {
		return nil, fmt.Errorf("update photo: %w", err)
	}
	return s.enrichPhoto(updated), nil
}

// enrichPhoto returns a copy of p with S3 keys replaced by full public URLs for API responses.
// It never mutates the original so callers can still use the DB key for S3 operations.
func (s *service) enrichPhoto(p *Photo) *Photo {
	copy := *p
	if copy.URL != "" {
		copy.URL = s.store.PublicURL(copy.URL)
	}
	if copy.ThumbnailURL != "" {
		copy.ThumbnailURL = s.store.PublicURL(copy.ThumbnailURL)
	}
	return &copy
}
