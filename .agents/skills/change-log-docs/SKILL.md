# Change Log Docs

## Rule

Every change to code, an API, a database, a migration, configuration, tests, or documentation must update the shared `../docs` project. Record the change in `../docs/data/entries.json`.

Use exactly these three categories:

- `決定`
- `新增 Feature`
- `修改 Error / Bug`

Each description must be an array of bullet items. Use `source: "Backend"` for backend work and `source: "Frontend"` for frontend work. If Backend and Frontend changes are part of one change, record both sources, and merge records for the same date rather than creating duplicate date pages.

After updating the data, run:

```sh
cd ../docs && npm run generate && npm test
```

`docs/index.html` and `docs/dates/YYYY-MM-DD.html` are generated artifacts and must not be edited directly. The generator uses the shared stylesheet and relative links. Do not create or restore `plans/` or `decisions/` Markdown files; the JSON log is the decision record.
