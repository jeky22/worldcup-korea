import Image from "next/image";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { BmcButton } from "@/components/bmc-button";

export const metadata = pageMetadata({
  title: "개발자 돕기",
  description:
    "월드컵 경우의수를 만든 개발자를 응원해주세요. 끝까지 뛴 대표팀에게 보내는 박수와, 우울한 개발자를 위한 커피 한 잔.",
  path: "/support",
  keywords: ["개발자 후원", "buy me a coffee", "월드컵 경우의수 후원"],
});

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "개발자 돕기", path: "/support" },
        ])}
      />

      {/* 아련한 대표팀 이미지 */}
      <figure className="relative -mx-4 overflow-hidden md:mx-0 md:rounded-2xl">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/image/202601200936282560_0.webp"
            alt="그라운드에 선 대한민국 축구 국가대표팀"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover object-top saturate-[0.9]"
          />
          {/* 아련하게 — 위·아래로 페이드 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/40 via-transparent to-[var(--color-bg)]" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <p className="text-balance text-lg font-semibold tracking-tight text-white drop-shadow-lg md:text-xl">
              끝까지, 뜨겁게.
            </p>
            <p className="mt-1 text-sm text-white/85 drop-shadow-md">
              2026, 그 여름의 태극전사들에게.
            </p>
          </div>
        </div>
      </figure>

      {/* 대표팀에게 */}
      <section className="mt-8">
        <h1 className="text-2xl font-bold tracking-tight text-balance">
          우리 국가대표팀 여러분, 정말 수고 많으셨습니다 🇰🇷
        </h1>
        <p className="mt-4 leading-relaxed text-ink/90">
          승패를 떠나, 그라운드 위에서 마지막 휘슬이 울릴 때까지 달려준
          태극전사들에게 박수를 보냅니다. 여러분이 있었기에 이 여름이
          뜨거웠고, 우리는 또 한 번 같은 마음으로 하나가 되었습니다.
          고개 숙이지 마세요. 충분히 멋졌습니다.
        </p>
      </section>

      {/* 개발자 사연 */}
      <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-surface/50 p-6 md:p-7">
        <h2 className="text-lg font-semibold tracking-tight">
          그리고… 여기 우울한 개발자 한 명이 있습니다 ☕
        </h2>
        <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted">
          <p>
            경기마다 뒤집히는 순위를 계산하겠다고 FIFA 타이브레이커 규정을
            파고들고, 조별 경우의 수 엔진을 며칠 밤새워 만들었습니다.
          </p>
          <p>
            감사하게도 사람이 몰려서 서버가 버티질 못해, 결국{" "}
            <span className="font-medium text-ink">유료 플랜(그것도 비싼 걸로)</span>
            까지 올렸는데…
          </p>
          <p>
            정작 <span className="font-medium text-ink">광고 심사는 통과도 하기 전에</span>,
            우리 대표팀이 곧 작별 인사를 할 것 같습니다. 서버비는
            따박따박 나가는데 수익은 <span className="font-medium text-ink">0원</span>,
          </p>
          <p className="text-ink/90">
            혹시 이 사이트가 0.1%라도 도움이 되셨다면, 따뜻한 커피 한 잔으로
            우울한 개발자를 일으켜 주세요. 여러분의 커피 한 잔이 다음 대회까지
            이 서버를 살립니다. 🙏
          </p>
        </div>

        {/* Buy Me a Coffee 위젯 버튼 */}
        <div className="mt-6">
          <BmcButton />
        </div>
      </section>

      <p className="mt-6 text-center text-sm text-muted">
        감사합니다. 다음 월드컵에서 또 만나요. ⚽
      </p>
    </div>
  );
}
