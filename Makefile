.PHONY: build test run install

install:
	pnpm install

build: install
	pnpm run build

test: install
	pnpm run test

run: install
	pnpm run dev
