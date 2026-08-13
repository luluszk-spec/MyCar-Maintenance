import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  email_taken: "このメールアドレスはすでに登録されています",
  weak_password: "パスワードは8文字以上にしてください",
  invalid: "入力内容を確認してください",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        method="POST"
        action="/api/auth/signup"
        className="w-full max-w-sm space-y-4 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6"
      >
        <div className="text-center space-y-1">
          <div className="text-2xl">🚗🏍️</div>
          <h1 className="text-lg font-semibold">MyCar Maintenance</h1>
          <p className="text-sm text-neutral-500">新規登録</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            お名前（任意）
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoFocus
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            パスワード（8文字以上）
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.invalid}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2 font-medium"
        >
          登録する
        </button>

        <p className="text-center text-sm text-neutral-500">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="underline">
            ログイン
          </Link>
        </p>
      </form>
    </div>
  );
}
