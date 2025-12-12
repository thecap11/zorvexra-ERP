-- CR Messages table for Student → CR communication
CREATE TABLE IF NOT EXISTS cr_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    from_student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_cr_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNREAD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT cr_messages_subject_not_empty CHECK (subject <> ''),
    CONSTRAINT cr_messages_message_not_empty CHECK (message <> ''),
    CONSTRAINT cr_messages_status_valid CHECK (status IN ('UNREAD', 'READ', 'RESOLVED'))
);

-- Index for fast CR queries (get all messages for a CR)
CREATE INDEX idx_cr_messages_to_cr 
ON cr_messages(to_cr_id, created_at DESC);

-- Index for fast student queries (get all messages from a student)
CREATE INDEX idx_cr_messages_from_student 
ON cr_messages(from_student_id, created_at DESC);

-- Index for unread count queries
CREATE INDEX idx_cr_messages_unread 
ON cr_messages(to_cr_id, status) 
WHERE status = 'UNREAD';

-- Comments
COMMENT ON TABLE cr_messages IS 'Messages sent by students to their Class Representative';
COMMENT ON COLUMN cr_messages.status IS 'Message status: UNREAD, READ, or RESOLVED';
COMMENT ON COLUMN cr_messages.updated_at IS 'Last update timestamp, changes when status is updated';
