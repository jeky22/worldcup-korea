import Link from "next/link";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = pageMetadata({
  title: "개인정보처리방침",
  description:
    "월드컵 경우의수 개인정보처리방침 — 수집하는 정보, 쿠키와 광고(구글 애드센스·카카오 애드핏), 이용자의 선택권을 안내합니다.",
  path: "/privacy",
});

const UPDATED = "2026년 11월 4일";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "개인정보처리방침", path: "/privacy" },
        ])}
      />

      <h1 className="text-2xl font-bold tracking-tight">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-muted">최종 수정일: {UPDATED}</p>

      <div className="mt-6 space-y-8 text-[15px] leading-relaxed text-ink/90">
        <section>
          <h2 className="text-lg font-semibold tracking-tight">1. 수집하는 개인정보</h2>
          <p className="mt-3 text-muted">
            월드컵 경우의수(이하 &ldquo;사이트&rdquo;)는 회원가입, 로그인, 댓글
            등 이용자가 직접 개인정보를 입력하는 기능을 제공하지 않으며,
            이름·이메일·전화번호 등 개인정보를 직접 수집하지 않습니다.
          </p>
          <p className="mt-2 text-muted">
            사이트가 호스팅되는 인프라(Vercel)는 서비스 운영과 보안을 위해
            접속 IP, 브라우저 정보 등이 포함된 접속 기록을 일시적으로 처리할
            수 있습니다. 이 기록은 통계·보안 목적 외에 사용되지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">2. 쿠키와 광고</h2>
          <p className="mt-3 text-muted">
            사이트는 운영비 충당을 위해 제3자 광고(구글 애드센스, 카카오
            애드핏)를 게재할 수 있습니다. 광고 제공 과정에서 구글과 카카오 등
            제3자 광고 사업자는 쿠키를 사용해 이용자의 사이트 방문 기록을
            바탕으로 맞춤 광고를 제공할 수 있습니다.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
            <li>
              구글의 광고 쿠키 사용에 대한 자세한 내용:{" "}
              <a
                href="https://policies.google.com/technologies/ads?hl=ko"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google 광고 정책
              </a>
            </li>
            <li>
              맞춤 광고 해제:{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Google 광고 설정
              </a>
              {" · "}
              <a
                href="https://optout.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                aboutads.info
              </a>
            </li>
          </ul>
          <p className="mt-2 text-muted">
            이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수
            있습니다. 쿠키를 거부해도 사이트의 모든 기능을 이용할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">3. 외부 콘텐츠와 링크</h2>
          <p className="mt-3 text-muted">
            사이트에는 FIFA 공식 YouTube 영상(개인정보 보호 강화 모드인
            youtube-nocookie.com 도메인 사용), 언론사 뉴스 링크, Wikipedia·
            Transfermarkt 등 외부 사이트로 연결되는 링크가 포함됩니다. 외부
            사이트의 개인정보 처리는 해당 사이트의 방침을 따르며, 본 사이트는
            이에 대한 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">4. 방침의 변경</h2>
          <p className="mt-3 text-muted">
            이 방침의 내용이 변경되는 경우 이 페이지를 통해 고지하며, 최종
            수정일을 함께 갱신합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">5. 문의</h2>
          <p className="mt-3 text-muted">
            {CONTACT_EMAIL ? (
              <>
                개인정보 처리에 관한 문의는{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
                  {CONTACT_EMAIL}
                </a>
                로 보내주세요.
              </>
            ) : (
              <>
                개인정보 처리에 관한 문의는{" "}
                <Link href="/about" className="text-accent hover:underline">
                  사이트 소개
                </Link>{" "}
                페이지의 운영자 안내를 참고해주세요.
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
