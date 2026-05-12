package repository

import (
	"time"

	"github.com/lib/pq"

	"builderstack-backend/internal/database"
	"builderstack-backend/internal/scraper"
)

// ScrapeLog mirrors a row in the scrape_logs table
type ScrapeLog struct {
	ID              int
	Front           string
	Source          string
	JobType         string
	Status          string
	ItemsFound      int
	ItemsNew        int
	ItemsUpdated    int
	ItemsSkipped    int
	ErrorMessage    string
	ErrorCount      int
	StartedAt       time.Time
	CompletedAt     time.Time
	DurationSeconds int
	TriggeredBy     string
}

// SaveMention inserts a ProcessedMention into the tool_mentions table.
// toolID must correspond to an existing row in the tools table.
func SaveMention(mention scraper.ProcessedMention, toolID int) error {
	query := `
		INSERT INTO tool_mentions (
			tool_id,
			platform,
			source_name,
			post_title,
			post_url,
			post_content,
			post_author,
			post_score,
			comment_count,
			sentiment,
			sentiment_score,
			mentioned_pros,
			mentioned_cons,
			use_case,
			is_recommended,
			post_date
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9,
			$10, $11, $12, $13, $14, $15, $16
		)
	`

	_, err := database.DB.Exec(
		query,
		toolID,
		mention.Platform,
		mention.SourceName,
		mention.PostTitle,
		mention.PostURL,
		mention.PostContent,
		mention.PostAuthor,
		mention.PostScore,
		mention.CommentCount,
		mention.Sentiment,
		mention.SentimentScore,
		pq.Array(mention.Pros),
		pq.Array(mention.Cons),
		mention.UseCase,
		mention.IsRecommended,
		mention.PostDate,
	)

	return err
}

// GetMentionsByToolID returns all mentions for a given tool
func GetMentionsByToolID(toolID int) ([]scraper.ProcessedMention, error) {
	query := `
		SELECT
			platform, source_name, post_title, post_url, post_content,
			post_author, post_score, comment_count,
			sentiment, sentiment_score, mentioned_pros, mentioned_cons,
			use_case, is_recommended, post_date
		FROM tool_mentions
		WHERE tool_id = $1
		ORDER BY post_date DESC
	`

	rows, err := database.DB.Query(query, toolID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanMentions(rows)
}

// GetRecentMentions returns the most recently scraped mentions across all tools
func GetRecentMentions(limit int) ([]scraper.ProcessedMention, error) {
	query := `
		SELECT
			platform, source_name, post_title, post_url, post_content,
			post_author, post_score, comment_count,
			sentiment, sentiment_score, mentioned_pros, mentioned_cons,
			use_case, is_recommended, post_date
		FROM tool_mentions
		ORDER BY scraped_at DESC
		LIMIT $1
	`

	rows, err := database.DB.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanMentions(rows)
}

// scanMentions shared row-scanner for mention queries
func scanMentions(rows interface {
	Next() bool
	Scan(...interface{}) error
	Close() error
}) ([]scraper.ProcessedMention, error) {
	var mentions []scraper.ProcessedMention

	for rows.Next() {
		var m scraper.ProcessedMention
		err := rows.Scan(
			&m.Platform,
			&m.SourceName,
			&m.PostTitle,
			&m.PostURL,
			&m.PostContent,
			&m.PostAuthor,
			&m.PostScore,
			&m.CommentCount,
			&m.Sentiment,
			&m.SentimentScore,
			pq.Array(&m.Pros),
			pq.Array(&m.Cons),
			&m.UseCase,
			&m.IsRecommended,
			&m.PostDate,
		)
		if err != nil {
			return nil, err
		}
		mentions = append(mentions, m)
	}

	return mentions, nil
}

// SaveScrapeLog inserts a record into the scrape_logs table
func SaveScrapeLog(log ScrapeLog) error {
	query := `
		INSERT INTO scrape_logs (
			front, source, job_type, status,
			items_found, items_new, items_updated, items_skipped,
			error_message, error_count,
			started_at, completed_at, duration_seconds,
			triggered_by
		) VALUES (
			$1, $2, $3, $4,
			$5, $6, $7, $8,
			$9, $10,
			$11, $12, $13,
			$14
		)
	`

	_, err := database.DB.Exec(
		query,
		log.Front,
		log.Source,
		log.JobType,
		log.Status,
		log.ItemsFound,
		log.ItemsNew,
		log.ItemsUpdated,
		log.ItemsSkipped,
		log.ErrorMessage,
		log.ErrorCount,
		log.StartedAt,
		log.CompletedAt,
		log.DurationSeconds,
		log.TriggeredBy,
	)

	return err
}

// GetRecentScrapeLogs returns the most recent scrape log entries
func GetRecentScrapeLogs(limit int) ([]ScrapeLog, error) {
	query := `
		SELECT
			id, front, source, job_type, status,
			items_found, items_new, items_updated, items_skipped,
			COALESCE(error_message, ''), error_count,
			COALESCE(started_at, completed_at), completed_at,
			COALESCE(duration_seconds, 0), COALESCE(triggered_by, '')
		FROM scrape_logs
		ORDER BY completed_at DESC
		LIMIT $1
	`

	rows, err := database.DB.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []ScrapeLog
	for rows.Next() {
		var l ScrapeLog
		err := rows.Scan(
			&l.ID,
			&l.Front,
			&l.Source,
			&l.JobType,
			&l.Status,
			&l.ItemsFound,
			&l.ItemsNew,
			&l.ItemsUpdated,
			&l.ItemsSkipped,
			&l.ErrorMessage,
			&l.ErrorCount,
			&l.StartedAt,
			&l.CompletedAt,
			&l.DurationSeconds,
			&l.TriggeredBy,
		)
		if err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}

	return logs, nil
}
