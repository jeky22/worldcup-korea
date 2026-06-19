export function DataError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mb-3 text-4xl" aria-hidden>
        ⚠️
      </div>
      <h1 className="mb-2 text-lg font-semibold">실데이터를 불러오지 못했습니다</h1>
      <p className="mb-4 text-sm text-muted">
        이 사이트는 실제 경기 데이터만 표시합니다. 임시 데이터로 채우지 않습니다.
      </p>
      <p className="rounded-md bg-surface px-3 py-2 text-xs text-muted">{message}</p>
      <p className="mt-4 text-sm text-muted">
        잠시 후 새로고침하거나, 데이터 소스 상태를 확인해 주세요.
      </p>
    </div>
  );
}
