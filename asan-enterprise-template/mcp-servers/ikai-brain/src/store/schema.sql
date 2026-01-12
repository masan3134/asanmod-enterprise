-- IKAI Brain System - SQLite Database Schema
-- Version: 1.0.0
-- Created: 2025-12-13
-- Purpose: Persistent knowledge store for auto-learning from git commits and error solutions

-- ========================================
-- Core entities (rules, patterns, modules)
-- ========================================
CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    entity_type TEXT NOT NULL, -- Rule, Pattern, Module, MCP, Identity, Error, Solution
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Observations about entities
-- ========================================
CREATE TABLE IF NOT EXISTS observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL, -- git, error, manual, pattern, migration, asanmod
    source_ref TEXT, -- commit hash, error id, file path
    confidence REAL DEFAULT 1.0, -- 0.0 to 1.0
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    UNIQUE(entity_id, content)
);

-- ========================================
-- Relations between entities
-- ========================================
CREATE TABLE IF NOT EXISTS relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_entity TEXT NOT NULL,
    to_entity TEXT NOT NULL,
    relation_type TEXT NOT NULL, -- has_rule, uses, depends_on, fixes, causes, related_to
    strength REAL DEFAULT 1.0, -- 0.0 to 1.0
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_entity) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (to_entity) REFERENCES entities(id) ON DELETE CASCADE,
    UNIQUE(from_entity, to_entity, relation_type)
);

-- ========================================
-- Error solutions (learned from debug sessions)
-- ========================================
CREATE TABLE IF NOT EXISTS error_solutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    error_pattern TEXT NOT NULL, -- normalized error message
    error_message TEXT, -- full error message
    error_type TEXT, -- runtime, compile, lint, build, etc.
    file_pattern TEXT, -- affected files pattern (glob or regex)
    stack_trace_pattern TEXT, -- normalized stack trace
    solution_description TEXT NOT NULL, -- human-readable solution
    solution_code TEXT, -- code snippet if applicable
    solution_files TEXT, -- JSON array of files that were changed to fix
    solution_steps TEXT, -- JSON array of steps taken
    related_pattern TEXT, -- PATTERN_IKAI_* reference
    tags TEXT, -- JSON array of searchable tags
    success_count INTEGER DEFAULT 1,
    fail_count INTEGER DEFAULT 0,
    last_used_at DATETIME,
    commit_hash TEXT, -- commit that introduced the fix
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Git commits (learning history)
-- ========================================
CREATE TABLE IF NOT EXISTS git_commits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commit_hash TEXT NOT NULL UNIQUE,
    message TEXT NOT NULL,
    type TEXT, -- feat, fix, docs, refactor, test, chore, style, perf, build, ci
    module TEXT, -- backend, frontend, asanmod, db, infra, brain
    identity TEXT, -- MOD, W1-W6, PROD-FIX
    author TEXT,
    files_changed TEXT, -- JSON array of changed files
    insertions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    has_brain_block INTEGER DEFAULT 0, -- boolean
    brain_block TEXT, -- JSON of BRAIN block content
    error_fix TEXT, -- extracted from BRAIN block
    pattern TEXT, -- extracted from BRAIN block
    tags TEXT, -- extracted from BRAIN block
    solution TEXT, -- extracted from BRAIN block
    is_breaking INTEGER DEFAULT 0, -- boolean
    commit_timestamp DATETIME,
    learned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Code patterns learned from code
-- ========================================
CREATE TABLE IF NOT EXISTS code_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_name TEXT NOT NULL UNIQUE, -- PATTERN_IKAI_*
    pattern_type TEXT NOT NULL, -- react-hooks, prisma, rbac, api, file-upload, etc.
    category TEXT, -- frontend, backend, database, security, deployment
    description TEXT NOT NULL,
    example_code TEXT, -- good example
    anti_pattern TEXT, -- what NOT to do
    anti_pattern_reason TEXT, -- why the anti-pattern is bad
    related_files TEXT, -- JSON array of typical files where this pattern applies
    tags TEXT, -- JSON array of searchable tags
    usage_count INTEGER DEFAULT 0,
    effectiveness_score REAL DEFAULT 1.0, -- 0.0 to 1.0 based on success rate
    created_from_commit TEXT, -- commit hash that introduced this pattern
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Sync log (Memory MCP synchronization)
-- ========================================
CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_type TEXT NOT NULL, -- full, incremental, manual
    direction TEXT NOT NULL, -- to_memory, from_memory, bidirectional
    entities_synced INTEGER DEFAULT 0,
    observations_synced INTEGER DEFAULT 0,
    relations_synced INTEGER DEFAULT 0,
    errors_synced INTEGER DEFAULT 0,
    patterns_synced INTEGER DEFAULT 0,
    status TEXT NOT NULL, -- success, failed, partial
    error_message TEXT,
    duration_ms INTEGER,
    memory_mcp_size INTEGER, -- size of memory.jsonl after sync
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Query cache (for fast repeated queries)
-- ========================================
CREATE TABLE IF NOT EXISTS query_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_hash TEXT NOT NULL UNIQUE, -- MD5 hash of query
    query_text TEXT NOT NULL,
    result TEXT NOT NULL, -- JSON result
    hit_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME -- optional TTL
);

-- ========================================
-- Learning sessions (tracks agent learning)
-- ========================================
CREATE TABLE IF NOT EXISTS learning_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL UNIQUE,
    agent_identity TEXT, -- MOD, W1-W6
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    commits_learned INTEGER DEFAULT 0,
    errors_learned INTEGER DEFAULT 0,
    patterns_learned INTEGER DEFAULT 0,
    queries_made INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' -- active, completed, failed
);

-- ========================================
-- INDEXES for performance
-- ========================================

-- Entities
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);

-- Observations
CREATE INDEX IF NOT EXISTS idx_observations_entity ON observations(entity_id);
CREATE INDEX IF NOT EXISTS idx_observations_source ON observations(source);
CREATE INDEX IF NOT EXISTS idx_observations_created ON observations(created_at);

-- Relations
CREATE INDEX IF NOT EXISTS idx_relations_from ON relations(from_entity);
CREATE INDEX IF NOT EXISTS idx_relations_to ON relations(to_entity);
CREATE INDEX IF NOT EXISTS idx_relations_type ON relations(relation_type);

-- Error solutions
CREATE INDEX IF NOT EXISTS idx_error_solutions_pattern ON error_solutions(error_pattern);
CREATE INDEX IF NOT EXISTS idx_error_solutions_type ON error_solutions(error_type);
CREATE INDEX IF NOT EXISTS idx_error_solutions_success ON error_solutions(success_count DESC);

-- Git commits
CREATE INDEX IF NOT EXISTS idx_git_commits_hash ON git_commits(commit_hash);
CREATE INDEX IF NOT EXISTS idx_git_commits_module ON git_commits(module);
CREATE INDEX IF NOT EXISTS idx_git_commits_type ON git_commits(type);
CREATE INDEX IF NOT EXISTS idx_git_commits_identity ON git_commits(identity);
CREATE INDEX IF NOT EXISTS idx_git_commits_has_brain ON git_commits(has_brain_block);
CREATE INDEX IF NOT EXISTS idx_git_commits_timestamp ON git_commits(commit_timestamp DESC);

-- Code patterns
CREATE INDEX IF NOT EXISTS idx_code_patterns_type ON code_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_code_patterns_category ON code_patterns(category);
CREATE INDEX IF NOT EXISTS idx_code_patterns_usage ON code_patterns(usage_count DESC);

-- Query cache
CREATE INDEX IF NOT EXISTS idx_query_cache_hash ON query_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON query_cache(expires_at);

-- Sync log
CREATE INDEX IF NOT EXISTS idx_sync_log_type ON sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status);

-- ========================================
-- Code Quality Issues (v2.2 - learned from lint errors)
-- ========================================
CREATE TABLE IF NOT EXISTS code_quality_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_type TEXT NOT NULL, -- prettier, eslint, typescript, escape, useless-escape
    issue_pattern TEXT NOT NULL, -- normalized error pattern
    issue_message TEXT,
    file_pattern TEXT, -- affected file types (*.ts, *.tsx, etc.)
    fix_description TEXT NOT NULL,
    fix_code TEXT, -- code snippet for fix
    occurrence_count INTEGER DEFAULT 1,
    last_occurred_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for code_quality_issues
CREATE INDEX IF NOT EXISTS idx_code_quality_type ON code_quality_issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_code_quality_pattern ON code_quality_issues(issue_pattern);

-- ========================================
-- TRIGGERS for auto-update timestamps
-- ========================================

CREATE TRIGGER IF NOT EXISTS update_entities_timestamp
AFTER UPDATE ON entities
BEGIN
    UPDATE entities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_error_solutions_timestamp
AFTER UPDATE ON error_solutions
BEGIN
    UPDATE error_solutions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_code_patterns_timestamp
AFTER UPDATE ON code_patterns
BEGIN
    UPDATE code_patterns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ========================================
-- VIEWS for common queries
-- ========================================

-- View: Most effective error solutions
CREATE VIEW IF NOT EXISTS v_effective_solutions AS
SELECT
    id,
    error_pattern,
    solution_description,
    success_count,
    fail_count,
    ROUND(CAST(success_count AS REAL) / NULLIF(success_count + fail_count, 0) * 100, 2) as success_rate,
    tags,
    last_used_at
FROM error_solutions
WHERE success_count > 0
ORDER BY success_rate DESC, success_count DESC;

-- View: Recent commits with BRAIN blocks
CREATE VIEW IF NOT EXISTS v_brain_commits AS
SELECT
    commit_hash,
    message,
    type,
    module,
    identity,
    error_fix,
    pattern,
    tags,
    solution,
    learned_at
FROM git_commits
WHERE has_brain_block = 1
ORDER BY learned_at DESC;

-- View: Pattern usage statistics
CREATE VIEW IF NOT EXISTS v_pattern_stats AS
SELECT
    pattern_name,
    pattern_type,
    category,
    usage_count,
    effectiveness_score,
    created_at
FROM code_patterns
ORDER BY usage_count DESC, effectiveness_score DESC;

-- View: Entity observation counts
CREATE VIEW IF NOT EXISTS v_entity_observations AS
SELECT
    e.id,
    e.name,
    e.entity_type,
    COUNT(o.id) as observation_count,
    MAX(o.created_at) as last_observation
FROM entities e
LEFT JOIN observations o ON e.id = o.entity_id
GROUP BY e.id
ORDER BY observation_count DESC;

