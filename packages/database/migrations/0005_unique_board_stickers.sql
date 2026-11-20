WITH locked_board AS (
  SELECT id, state FROM home_board FOR UPDATE
), unique_stickers AS (
  SELECT id, jsonb_agg(sticker ORDER BY position) AS stickers
  FROM (
    SELECT DISTINCT ON (id, sticker->>'kind') id, sticker, position
    FROM locked_board
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE WHEN jsonb_typeof(state->'stickers') = 'array' THEN state->'stickers' ELSE '[]'::jsonb END
    ) WITH ORDINALITY AS items(sticker, position)
    ORDER BY id, sticker->>'kind', position
  ) AS oldest
  GROUP BY id
)
UPDATE home_board AS board
SET state = jsonb_set(board.state, '{stickers}', unique_stickers.stickers)
FROM unique_stickers
WHERE board.id = unique_stickers.id
  AND board.state->'stickers' IS DISTINCT FROM unique_stickers.stickers;
