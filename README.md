# yangJC Retro CLI Portfolio

애니메이션 감독, 일러스트레이터, 뮤지션, 프로그래머로서의 작업물을 담은 레트로 스타일의 터미널 포트폴리오 사이트입니다.

## 🚀 주요 특징
- **Retro CLI Interface**: 80년대 BIOS 부팅 시퀀스와 CRT 모니터 효과가 적용된 터미널 UI.
- **Interactive Commands**: `ls`, `open`, `theme` 등의 명령어를 통해 작업물 탐색.
- **Admin GUI**: 코딩 없이 `content.json`을 수정할 수 있는 전용 관리자 페이지(`admin.html`) 제공.
- **Zero Hosting Cost**: GitHub Pages를 통한 무료 배포.

## 🛠 사용 방법

### 1. 포트폴리오 탐색 (Main Site)
`index.html`을 통해 접속하며, 다음과 같은 명령어를 지원합니다:
- `help`: 사용 가능한 모든 명령어 확인.
- `ls`: 연도별 프로젝트 리스트 확인 (예: `ls animation`으로 필터링 가능).
- `open [ID]`: 특정 프로젝트의 영상이나 이미지를 모달 창으로 확인.
- `theme [color]`: 터미널 색상 변경 (green, amber, cyan, white).
- `font`: 제공된 레트로 폰트(Galmuri14, zpix) 간 전환.

### 2. 콘텐츠 관리 (Admin Panel)
`admin.html`을 브라우저에서 실행하여 콘텐츠를 관리합니다.
1. 프로필 정보 및 프로젝트 내용 수정.
2. 'Save' 버튼을 눌러 `content.json` 다운로드.
3. 다운로드된 파일을 프로젝트 루트 폴더에 덮어쓰기.
4. 변경된 내용을 Git Commit & Push.

## 📁 폴더 구조
- `index.html`: 메인 사이트 본체.
- `admin.html`: 포트폴리오 관리 도구.
- `content.json`: 모든 텍스트 및 프로젝트 데이터 저장소.
- `assets/`: 스타일시트(CSS) 및 스크립트(JS) 파일.
- `font/`: 레트로 감성 구현을 위한 픽셀 폰트.

## 📝 License
Copyright (c) 2024 yangJC. All rights reserved.
