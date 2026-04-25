.PHONY: build test run install

install:
	pnpm install

build:
	pnpm run build

test:
	pnpm run test

run:
	pnpm run dev
