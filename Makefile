install:
	npm ci

develop:
	npm run dev

build:
	NODE_ENV=production npm run build

preview:
	npm run preview

lint:
	npx oxlint && npx oxfmt --ignore-path=.oxfmtignore --check

lint-fix:
	npx oxfmt --ignore-path=.oxfmtignore && npx oxlint --fix

.PHONY: install develop build preview lint lint-fix
