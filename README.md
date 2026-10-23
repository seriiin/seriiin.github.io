# Selin Choi · Research Portfolio

KAIST UVR Lab의 AR/VR 연구자 Selin Choi를 위한 영문 포트폴리오입니다.
별도 빌드나 패키지 설치 없이 HTML, CSS, JavaScript 파일을 그대로 GitHub Pages에 배포할 수 있습니다.

## 로컬에서 보기

`index.html`을 브라우저에서 열면 됩니다. Node.js가 설치되어 있다면 다음 명령으로 미리보기 서버를 실행할 수도 있습니다.

```powershell
npm run dev
```

주소: http://127.0.0.1:4173 · 종료: `Ctrl+C`

## GitHub Pages에 올리기

CV에 기재된 GitHub 아이디 `seriiin`을 기준으로 안내합니다.

1. 기존 저장소 [seriiin/seriiin.github.io](https://github.com/seriiin/seriiin.github.io)를 사용합니다. 기본 브랜치는 `master`입니다.
2. `index.html`, `styles.css`, `main.js`, `.nojekyll`, `assets/`를 저장소 최상위에 올립니다. 로컬 서버를 함께 관리하려면 `scripts/`, `package.json`도 포함할 수 있습니다. `tmp/`는 올리지 않습니다.
3. 저장소의 **Settings → Pages → Build and deployment → Source**에서 **Deploy from a branch**를 선택합니다.
4. **master**, **/(root)**를 선택하고 저장합니다.
5. 배포가 완료되면 https://seriiin.github.io 에서 확인합니다.

이 작업 폴더는 위 저장소에 연결되어 있습니다. 이후 수정 사항은 `master` 브랜치에 커밋하고 push하면 됩니다. 이전 블로그 파일은 Git 기록에서 확인할 수 있습니다.

공식 안내: [GitHub Pages Quickstart](https://docs.github.com/en/pages/quickstart), [배포 소스 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 도메인 연결

연결된 도메인은 **https://selinchoi.com**입니다. 루트의 `CNAME` 파일과 GitHub **Settings → Pages → Custom domain**에는 `selinchoi.com`을 유지합니다. Spaceship DNS는 GitHub Pages의 A 레코드 네 개와 `www → seriiin.github.io` CNAME으로 연결합니다.

공식 안내: [사용자 도메인 연결](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## 수정할 곳

- `index.html`: 소개, 대표 연구, 논문, Academic Profile, Projects, 연락처. Academic Profile에는 학력·경력·수상·장학금·Teaching을, Projects에는 참여 연구과제·NRF 연구장려금, 다하자, Demo gallery를 배치합니다. 갤러리에는 메타버스 개발자 경진대회 AR 복셀 드로잉, GCT501 문화기술론 MINIEMO, 증강현실 프로젝트 수업의 Virtual Consumable Resources 데모를 소개합니다. 수업 프로젝트 두 개의 수행 연도는 2023년입니다. 논문을 추가할 때 `data-category="international"` 또는 `"domestic"`을 설정하면 필터에 반영됩니다. 전체 편수는 JavaScript가 계산합니다.
- `styles.css`: 색, 글꼴, 간격, 화면 크기별 배치.
- `main.js`: 모바일 메뉴, 논문 필터와 갤러리 연결 링크, 현재 섹션 표시, 프로필 사진 뒤집기, 영상 제어, 헤더 캐릭터의 시선·인사와 페이지 클릭 시 눈 레이저 효과.
- `assets/`: 기본 프로필 `selin-choi-studio.jpg`, 뒷면 프로필 `selin-choi.jpg`, 대표 논문 이미지, 다하자 아이콘, 파비콘. `assets/fonts/`에는 Manrope·Instrument Serif 글꼴과 라이선스를 포함합니다.
- `assets/videos/`: 대표 연구 영상 두 개, 갤러리 데모 세 개와 각 미리보기 이미지. 연구 카드는 **Watch video**를 펼쳐 재생하며, 갤러리는 썸네일에 기본 재생기를 표시합니다. 자동 재생과 영상 미리 다운로드는 사용하지 않습니다. 로컬 서버도 MP4 스트리밍과 구간 탐색을 지원합니다.
- `SOURCES.md`: 내용·이미지 출처와 논문 정보 대조 기록.

글꼴은 사이트에서 직접 제공하므로 외부 글꼴 서비스에 연결하지 않습니다. 웹페이지에는 이메일만 표시하며 추적 도구, 별도 백엔드 서버, API 키는 사용하지 않습니다.

## 확인

공유용 썸네일은 `assets/social-preview.png` (1200×630)이며, 벡터 원본은 `assets/social-preview.svg`입니다. 하늘색 배경에 헤더 캐릭터와 이름·AR/VR Researcher를 넣었습니다. `index.html`의 Open Graph·Twitter 카드 메타데이터는 `https://selinchoi.com/assets/social-preview.png`를 가리킵니다.

헤더 캐릭터를 누르면 기존 윙크·인사가 나옵니다. 그 외에는 빈 공간을 포함해 페이지 어디를 클릭해도 캐릭터의 실제 눈 위치에서 클릭 지점으로 하늘색 레이저가 약 0.5초 뻗고, 끝에 작은 빛이 나타납니다. 키보드로 컨트롤을 활성화하면 해당 컨트롤 중앙을 향합니다. 효과는 클릭을 가로막지 않으며, 동작 줄이기 설정에서는 생략합니다.

```powershell
npm run check
```

모든 논문은 HTML에 포함되어 JavaScript가 꺼져 있어도 볼 수 있습니다. 논문 필터와 모바일 메뉴는 JavaScript를 사용합니다. 헤더에는 추가로 제공한 사진을 참고한 흑백 SVG 캐릭터가 있으며 파비콘도 같은 얼굴을 사용합니다. 새로 제공한 그림을 참고해 얼굴의 세로 길이를 줄이고 볼과 턱을 둥글게 넓혔으며, 가벼운 앞머리와 작은 귀를 반영했습니다. 검은 머리·굵은 선·점눈·웃는 표정은 기존 그림체를 유지합니다. 머리는 볼륨을 줄인 중단발 레이어드 형태로, 겉머리는 안쪽으로 말리고 안쪽 층만 살짝 뻗칩니다. 헤더는 원래의 투명한 48px 버튼을 사용합니다. 페이지 어디서든 마우스를 움직이면 커서 방향으로 눈과 고개가 부드럽게 따라갑니다. 커서가 멀어져도 눈이 얼굴 밖으로 나가지 않도록 이동 폭을 제한하며, 창을 벗어나거나 다른 창으로 전환하면 정면으로 돌아옵니다. 클릭·탭·키보드로는 고개를 까딱이며 윙크와 인사를 합니다. 자동 애니메이션은 없으며, 터치 조작과 동작 줄이기 설정에서는 시선 추적을 하지 않습니다. 동작 줄이기 설정에서는 움직임 없이 인사말만 표시합니다. 키보드 포커스, 본문 바로가기, 이미지 대체 텍스트, 인쇄 스타일을 포함했습니다.

메인 프로필은 새로 제공한 단발·검은 상의 사진이 기본입니다. 클릭·탭하거나 키보드로 사진 버튼을 누르면 카드가 뒤집혀 기존 긴 머리·파란 카디건 사진을 보여 주고, 다시 누르면 돌아옵니다. 동작 줄이기 설정에서는 회전 없이 바로 전환합니다. JavaScript가 꺼져 있거나 인쇄할 때는 기본 사진을 표시합니다. 사진 위 AR 안경과 펼쳐지는 메뉴는 사용하지 않습니다.

연구·갤러리 영상은 기본 HTML 재생기로 JavaScript 없이도 볼 수 있습니다. JavaScript가 켜져 있으면 연구 영상을 접을 때 멈추고, 다른 영상을 재생할 때 앞서 재생하던 영상도 멈춥니다. AR 복셀 드로잉 데모는 2023년 관련 논문과 메타버스 개발자 경진대회 2위 항목에 양방향으로 연결됩니다. Virtual Consumable Resources의 2023년 수업 데모도 해당 2024년 논문 항목에 양방향으로 연결됩니다. 논문 필터로 해당 논문이 숨겨져 있어도 갤러리의 Related paper 링크를 누르면 표시됩니다. 영상·음성 디코딩과 로컬 HTTP 구간 요청은 검사했습니다.

이번 작업 환경에는 연결된 브라우저가 없어 실제 페이지 렌더링과 모바일 터치 조작은 확인하지 못했습니다. 공개 배포 전 데스크톱·모바일에서 한 번 확인하세요.
