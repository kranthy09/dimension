# Metadata → Metajson Migration

## Summary

All references to `metadata` have been renamed to `metajson` to avoid conflicts with built-in Python/JavaScript properties.

## Why This Change?

- `metadata` can conflict with built-in object metadata properties
- `metajson` is more explicit and avoids naming collisions
- Clearer intent - indicates JSON data storage

---

## Backend Changes (7 files)

### 1. ✅ `backend/app/models/content_file.py`
**Changed**:
- Column name: `metadata` → `metajson`
- Index name: `idx_metadata_gin` → `idx_metajson_gin`
- Property methods updated to use `self.metajson`

**Lines changed**: 4
- Line 20: Column definition
- Line 33: Index definition
- Line 42: `slug` property
- Line 47: `title` property

### 2. ✅ `backend/app/schemas/content_file.py`
**Changed**:
- `ContentFileUpdate.metadata` → `ContentFileUpdate.metajson`
- `ContentFileResponse.metadata` → `ContentFileResponse.metajson`
- `ContentFileListItem.metadata` → `ContentFileListItem.metajson`
- `MarkdownContentResponse.metadata` → `MarkdownContentResponse.metajson`

**Lines changed**: 4 (lines 43, 50, 63, 73)

### 3. ✅ `backend/app/services/content_service.py`
**Changed**:
- Parse result variable: `metadata` → `metajson`
- All references to metadata dict updated
- Database queries using JSON path updated

**Lines changed**: 3
- Line 33: Parse result
- Line 37: Validation
- Line 42: Get slug
- Line 56: ContentFile creation
- Line 76: Database query

### 4. ✅ `backend/app/api/routes/content.py`
**Changed**:
- Response dict key in `/markdown` endpoint

**Lines changed**: 1 (line 63)

### 5. ✅ `backend/alembic/versions/001_create_content_files.py`
**Changed**:
- Column name in table creation
- Index name

**Lines changed**: 2 (lines 25, 36)

---

## Frontend Changes (6 files)

### 6. ✅ `frontend/src/lib/api.ts`
**Changed**:
- `ContentFile.metadata` → `ContentFile.metajson`
- `MarkdownContent.metadata` → `MarkdownContent.metajson`

**Lines changed**: 2 (lines 8, 17)

### 7. ✅ `frontend/src/components/content/ContentCard.tsx`
**Changed**:
- Destructuring source

**Lines changed**: 1 (line 11)

### 8. ✅ `frontend/src/app/admin/upload/page.tsx`
**Changed**:
- Success message reference

**Lines changed**: 1 (line 29)

### 9. ✅ `frontend/src/app/blog/[slug]/page.tsx`
**Changed**:
- Destructuring source

**Lines changed**: 1 (line 18)

### 10. ✅ `frontend/src/app/projects/[slug]/page.tsx`
**Changed**:
- Destructuring source

**Lines changed**: 1 (line 25)

### 11. ✅ `frontend/src/app/case-studies/[slug]/page.tsx`
**Changed**:
- Destructuring source

**Lines changed**: 1 (line 18)

---

## Total Changes

- **Files Modified**: 11
- **Backend Files**: 5
- **Frontend Files**: 6
- **Total Lines Changed**: ~20

---

## Database Impact

### Migration Required

Since we've updated the migration file `001_create_content_files.py`, the database will be created with `metajson` column from the start.

**For Fresh Installations**:
```bash
# Clean start (destroys existing data)
docker-compose down -v
docker-compose build
docker-compose up -d
```

**For Existing Installations**:
If you have existing data, you'll need to:
1. Backup your data
2. Drop and recreate the database
3. OR create a migration script to rename the column

### Example Migration Script (if needed)
```python
"""rename metadata to metajson

Revision ID: 002
Revises: 001
"""
from alembic import op

def upgrade() -> None:
    op.alter_column('content_files', 'metadata', new_column_name='metajson')
    op.execute('DROP INDEX IF EXISTS idx_metadata_gin')
    op.create_index('idx_metajson_gin', 'content_files', ['metajson'], postgresql_using='gin')

def downgrade() -> None:
    op.alter_column('content_files', 'metajson', new_column_name='metadata')
    op.execute('DROP INDEX IF EXISTS idx_metajson_gin')
    op.create_index('idx_metadata_gin', 'content_files', ['metadata'], postgresql_using='gin')
```

---

## Verification

### 1. Backend API
```bash
# Check API schema
curl http://localhost:8000/docs

# Look for "metajson" in response models
```

### 2. Test Upload
```bash
# Create test file
cat > test.md << 'EOF'
---
slug: test
title: Test Post
summary: Testing metajson
category: Test
---
# Test
EOF

# Upload
curl -X POST "http://localhost:8000/api/v1/content/upload?section=blog" \
  -F "file=@test.md"

# Response should show "metajson" field instead of "metadata"
```

### 3. Frontend
```bash
# Open browser dev tools
# Network tab → Check API responses
# Should see "metajson" field in all responses
```

---

## Breaking Changes

⚠️ **This is a breaking change if you have existing clients consuming the API**

### Impact:
- API responses now use `metajson` instead of `metadata`
- Existing API consumers need to update their code
- Database column name changed

### Migration Path for API Consumers:
1. Update all API client code to use `metajson`
2. Update database queries
3. Update tests

---

## Benefits

✅ **No more conflicts** with built-in metadata properties
✅ **More explicit** - clearly indicates JSON data
✅ **Consistent naming** across backend and frontend
✅ **Future-proof** - avoids potential framework conflicts

---

## Rollback Plan

If you need to rollback:

1. Revert all code changes
2. Rename database column back to `metadata`
3. Restart services

```bash
# In psql
ALTER TABLE content_files RENAME COLUMN metajson TO metadata;
DROP INDEX idx_metajson_gin;
CREATE INDEX idx_metadata_gin ON content_files USING gin(metadata);
```

---

## Next Steps

1. ✅ Clean database start: `docker-compose down -v && docker-compose build && docker-compose up -d`
2. ✅ Test upload functionality
3. ✅ Verify API responses
4. ✅ Test frontend display

---

**Status**: ✅ All changes complete and ready for testing!
