#!/bin/sh

docker build . -t nextchess_webui_unit_tests --file ./Dockerfile.Tests
docker run --rm nextchess_webui_unit_tests