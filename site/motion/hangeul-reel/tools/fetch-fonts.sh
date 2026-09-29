#!/usr/bin/env sh
# 릴스에 쓰는 글꼴 (모두 SIL OFL 1.1) — fonts/ 에 받는다. 저장소에는 넣지 않는다 (30MB).
set -e
cd "$(dirname "$0")/../fonts" 2>/dev/null || { mkdir -p "$(dirname "$0")/../fonts"; cd "$(dirname "$0")/../fonts"; }
G=https://raw.githubusercontent.com
curl -fL -o PretendardVariable.ttf "$G/orioncactus/pretendard/main/packages/pretendard/dist/public/variable/PretendardVariable.ttf"
curl -fL -o NotoSerifKR-VF.ttf "$G/google/fonts/main/ofl/notoserifkr/NotoSerifKR%5Bwght%5D.ttf"
curl -fL -o FiraMono-Medium.ttf "$G/google/fonts/main/ofl/firamono/FiraMono-Medium.ttf"
ls -la
