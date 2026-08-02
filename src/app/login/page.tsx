export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        method="POST"
        action="/api/auth/login"
        className="w-full max-w-sm space-y-4 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6"
      >
        <div className="text-center space-y-1">
          <div className="text-2xl">🚗🏍️</div>
          <h1 className="text-lg font-semibold">MyCar Maintenance</h1>
          <p className="text-sm text-neutral-500">パスワードを入力してください</p>
        </div>

        <input type="hidden" name="next" value={next ?? "/"} />

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            パスワードが違います
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2 font-medium"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}
