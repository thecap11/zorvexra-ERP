-- Notifications table for CR → Student messaging
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT notifications_title_not_empty CHECK (title <> ''),
    CONSTRAINT notifications_message_not_empty CHECK (message <> '')
);

-- Index for fast student queries (unread notifications for a specific student)
CREATE INDEX idx_notifications_student_unread 
ON notifications(recipient_id, class_id, read_at) 
WHERE read_at IS NULL;

-- Index for fast class-wide queries (unread notifications for whole class)
CREATE INDEX idx_notifications_class_unread 
ON notifications(class_id, read_at) 
WHERE recipient_id IS NULL AND read_at IS NULL;

-- Comments
COMMENT ON TABLE notifications IS 'Stores notifications sent by CRs to students';
COMMENT ON COLUMN notifications.recipient_id IS 'NULL means notification is for whole class, specific UUID means for that student only';
COMMENT ON COLUMN notifications.read_at IS 'NULL means unread, timestamptz means read at that time';
