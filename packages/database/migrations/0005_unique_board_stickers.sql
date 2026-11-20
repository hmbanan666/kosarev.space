UPDATE home_board
SET state = jsonb_set(state, '{stickers}', '[]'::jsonb)
WHERE state->'stickers' IS DISTINCT FROM '[]'::jsonb;
