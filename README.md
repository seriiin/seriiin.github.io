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

도메인을 구매한 다음 GitHub **Settings → Pages → Custom domain**에 등록하고, 도메인 업체의 DNS를 연결합니다. 도메인을 아직 정하지 않았으므로 `CNAME`과 canonical URL은 넣지 않았습니다. 도메인 연결 뒤 canonical/OG URL도 추가하면 됩니다.

공식 안내: [사용자 도메인 연결](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## 수정할 곳

- `index.html`: 소개, 대표 연구, 논문, 경력, 수상, 연락처. 논문을 추가할 때 `data-category="international"` 또는 `"domestic"`을 설정하면 필터에 반영됩니다. 전체 편수는 JavaScript가 계산합니다.
- `styles.css`: 색, 글꼴, 간격, 화면 크기별 배치.
- `main.js`: 모바일 메뉴, 논문 필터, 현재 섹션 표시, 헤더 XR 버디의 시선·인사 동작.
- `assets/`: 프로필 사진, 대표 논문 이미지, 다하자 아이콘, 파비콘. `assets/fonts/`에는 Manrope·Instrument Serif 글꼴과 라이선스를 포함합니다.
- `SOURCES.md`: 내용·이미지 출처와 논문 정보 대조 기록.

글꼴은 사이트에서 직접 제공하므로 외부 글꼴 서비스에 연결하지 않습니다. 웹페이지에는 이메일만 표시하며 추적 도구, 별도 백엔드 서버, API 키는 사용하지 않습니다.

## 확인

```powershell
npm run check
```

모든 논문은 HTML에 포함되어 JavaScript가 꺼져 있어도 볼 수 있습니다. 논문 필터와 모바일 메뉴는 JavaScript를 사용합니다. 헤더의 XR 버디는 마우스를 올리면 시선을 움직이고 클릭·탭·키보드로 인사합니다. 자동 애니메이션은 없으며, 동작 줄이기 설정에서는 움직임 없이 인사말만 표시합니다. 키보드 포커스, 본문 바로가기, 이미지 대체 텍스트, 인쇄 스타일을 포함했습니다.

이번 작업 환경에는 연결된 브라우저가 없어 실제 화면 렌더링과 모바일 터치 조작은 확인하지 못했습니다. 공개 배포 전 데스크톱·모바일에서 한 번 확인하세요.
