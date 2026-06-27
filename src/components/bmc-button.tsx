/**
 * Buy Me a Coffee 버튼.
 * 공식 위젯 스크립트(button.prod.min.js)는 document.writeln()으로 버튼을 그려
 * 페이지 로드 이후(SPA)엔 사용할 수 없다. 그래서 공식 정적 버튼 이미지를 직접 렌더링한다.
 */
const SLUG = "qhzh33t";

export function BmcButton() {
  return (
    <div className="flex justify-center">
      <a
        href={`https://www.buymeacoffee.com/${SLUG}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Buy Me a Coffee로 개발자 돕기"
        className="inline-block transition-transform hover:-translate-y-0.5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me a Coffee"
          style={{ height: 60, width: 217 }}
        />
      </a>
    </div>
  );
}
