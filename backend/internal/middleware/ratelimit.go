package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yendp/personal-blog/pkg/response"
	"golang.org/x/time/rate"
)

type ipLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	loginLimiters sync.Map
	cleanupOnce   sync.Once
)

func getLoginLimiter(ip string) *rate.Limiter {
	val, ok := loginLimiters.Load(ip)
	if ok {
		il := val.(*ipLimiter)
		il.lastSeen = time.Now()
		return il.limiter
	}
	// 5 attempts per minute, burst of 5.
	l := rate.NewLimiter(rate.Every(time.Minute/5), 5)
	loginLimiters.Store(ip, &ipLimiter{limiter: l, lastSeen: time.Now()})
	return l
}

// LoginRateLimit limits login attempts to 5 per minute per IP address.
func LoginRateLimit() gin.HandlerFunc {
	cleanupOnce.Do(func() {
		go func() {
			for {
				time.Sleep(10 * time.Minute)
				loginLimiters.Range(func(key, value any) bool {
					if time.Since(value.(*ipLimiter).lastSeen) > 10*time.Minute {
						loginLimiters.Delete(key)
					}
					return true
				})
			}
		}()
	})

	return func(c *gin.Context) {
		if !getLoginLimiter(c.ClientIP()).Allow() {
			response.Error(c, http.StatusTooManyRequests, "too many login attempts, please try again later")
			c.Abort()
			return
		}
		c.Next()
	}
}
