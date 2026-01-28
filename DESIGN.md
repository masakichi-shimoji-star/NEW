# WorkView - 設計ドキュメント

## 1. 概要

WorkViewは、候補者が自身の履歴書を管理し、過去の同僚・上司から評価（リファレンス）を収集して、企業に共有できるプラットフォームです。

## 2. 技術スタック

### フロントエンド + バックエンド（フルスタック）
- **Next.js 14 (App Router)** - Reactベースのフルスタックフレームワーク
- **TypeScript** - 型安全性の確保
- **Tailwind CSS** - ユーティリティファーストのCSS
- **shadcn/ui** - 再利用可能なUIコンポーネント
- **React Hook Form + Zod** - フォーム管理とバリデーション
- **Lucide React** - アイコンライブラリ

### データベース
- **Prisma ORM** - 型安全なデータベース操作
- **SQLite** (開発) / **PostgreSQL** (本番)

### 認証
- **NextAuth.js v5 (Auth.js)** - 認証・セッション管理

### ファイルストレージ
- ローカルファイルシステム（本番ではS3等に移行可能）

## 3. ユーザーロール

1. **候補者 (Candidate)** - 履歴書管理、評価依頼、公開URL管理
2. **評価者 (Reviewer)** - 候補者の評価入力（ログイン不要、トークン認証）
3. **企業 (Company)** - 公開URLで候補者情報閲覧（ログイン不要）
4. **管理者 (Admin)** - システム全体の管理

## 4. データベース設計

### User（候補者・管理者）
```
- id: UUID
- email: String (unique)
- password: String (hashed)
- name: String
- nameKana: String?
- phone: String?
- address: String?
- photo: String?
- selfPr: Text?
- role: Enum (CANDIDATE, ADMIN)
- onboardingCompleted: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### Education（学歴）
```
- id: UUID
- userId: UUID (FK)
- schoolType: Enum
- schoolName: String
- faculty: String?
- department: String?
- enrollmentDate: Date
- graduationDate: Date?
- isEnrolled: Boolean
- major: String?
- createdAt: DateTime
```

### WorkHistory（職歴）
```
- id: UUID
- userId: UUID (FK)
- companyName: String
- department: String?
- employmentType: String
- startDate: Date
- endDate: Date?
- isCurrentJob: Boolean
- position: String?
- jobCategory: String?
- responsibilities: Text
- achievements: Text?
- skills: Text?
- createdAt: DateTime
```

### Qualification（資格）
```
- id: UUID
- userId: UUID (FK)
- name: String
- acquiredDate: Date
- createdAt: DateTime
```

### Skill（スキル）
```
- id: UUID
- userId: UUID (FK)
- name: String
- level: Int (1-5)
- yearsOfExperience: Int?
- createdAt: DateTime
```

### DesiredCondition（希望条件）
```
- id: UUID
- userId: UUID (FK)
- desiredJobType: String?
- desiredLocation: String?
- desiredSalary: String?
- availableDate: String?
- createdAt: DateTime
```

### Reviewer（評価者）
```
- id: UUID
- candidateId: UUID (FK)
- name: String
- email: String
- company: String
- department: String?
- position: String?
- relationship: Enum
- workPeriodStart: Date
- workPeriodEnd: Date?
- isCurrentlyWorking: Boolean
- memo: Text?
- token: String (unique) - 評価フォームアクセス用
- status: Enum (NOT_SENT, SENT, IN_PROGRESS, COMPLETED)
- createdAt: DateTime
- updatedAt: DateTime
```

### Evaluation（評価）
```
- id: UUID
- reviewerId: UUID (FK)
- overallScore: Int (0-100)
- recommendationScore: Int (0-10)
- wouldWorkAgain: Boolean
- wouldWorkAgainReason: Text
- numericalEvaluations: JSON
- episode1: JSON
- episode2: JSON
- episode3: JSON?
- strengthTop: Text
- strengthEvidence: Text
- riskTop: Text
- riskConditions: Text
- riskSigns: Text
- riskMitigation: Text
- suitableEnvironment: Text
- managementTips: Text
- overallPersonality: Text
- factBased: Boolean
- confidentialityConsidered: Boolean
- noDefamation: Boolean
- isDraft: Boolean
- submittedAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
```

### PublicUrl（公開URL）
```
- id: UUID
- candidateId: UUID (FK)
- token: String (unique)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### AdminAction（管理者操作ログ）
```
- id: UUID
- adminId: UUID (FK)
- action: String
- targetType: String
- targetId: UUID
- details: JSON?
- createdAt: DateTime
```

## 5. ページ構成

### 未ログイン
- `/` - ランディングページ
- `/login` - ログイン
- `/register` - 新規登録
- `/forgot-password` - パスワード再設定

### 候補者（ログイン後）
- `/dashboard` - ダッシュボード
- `/onboarding` - オンボーディング（初回）
- `/resume` - 履歴書編集
- `/resume/preview` - 履歴書プレビュー
- `/reviewers` - 評価者管理
- `/reviewers/new` - 評価者登録
- `/reviewers/[id]` - 評価者詳細・依頼文作成
- `/requests` - 依頼一覧
- `/evaluations` - 評価一覧
- `/evaluations/[id]` - 評価詳細
- `/public-url` - 公開URL管理
- `/settings` - アカウント設定

### 評価者（トークン認証）
- `/review/[token]` - 評価フォーム入口
- `/review/[token]/form` - 評価入力フォーム
- `/review/[token]/complete` - 完了画面

### 企業（公開URL）
- `/public/[token]` - 候補者公開ページ

### 管理者
- `/admin/login` - 管理者ログイン
- `/admin` - 管理ダッシュボード
- `/admin/candidates` - 候補者一覧
- `/admin/candidates/[id]` - 候補者詳細
- `/admin/evaluations` - 評価一覧
- `/admin/evaluations/[id]` - 評価詳細
- `/admin/logs` - 監査ログ

## 6. API設計

### 認証
- `POST /api/auth/register` - 新規登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `POST /api/auth/forgot-password` - パスワード再設定リクエスト

### 候補者
- `GET/PUT /api/candidate/profile` - プロフィール取得・更新
- `GET/POST /api/candidate/educations` - 学歴一覧・追加
- `PUT/DELETE /api/candidate/educations/[id]` - 学歴更新・削除
- `GET/POST /api/candidate/work-histories` - 職歴一覧・追加
- `PUT/DELETE /api/candidate/work-histories/[id]` - 職歴更新・削除
- `GET/POST /api/candidate/qualifications` - 資格一覧・追加
- `GET/POST /api/candidate/skills` - スキル一覧・追加
- `GET/PUT /api/candidate/desired-conditions` - 希望条件取得・更新

### 評価者管理
- `GET/POST /api/reviewers` - 評価者一覧・登録
- `GET/PUT/DELETE /api/reviewers/[id]` - 評価者取得・更新・削除
- `POST /api/reviewers/[id]/generate-request` - 依頼文生成
- `PUT /api/reviewers/[id]/status` - ステータス更新

### 評価
- `GET /api/evaluations` - 評価一覧
- `GET /api/evaluations/[id]` - 評価詳細

### 公開URL
- `GET/POST /api/public-url` - 公開URL取得・発行
- `PUT /api/public-url/[id]` - 公開URL更新（有効/無効）
- `POST /api/public-url/[id]/regenerate` - 公開URL再生成

### 評価者フォーム（トークン認証）
- `GET /api/review/[token]` - フォーム情報取得
- `PUT /api/review/[token]/profile` - 評価者プロフィール更新
- `GET/PUT /api/review/[token]/evaluation` - 評価取得・保存
- `POST /api/review/[token]/submit` - 評価送信

### 企業向け公開ページ
- `GET /api/public/[token]` - 候補者情報取得

### 管理者
- `POST /api/admin/auth/login` - 管理者ログイン
- `GET /api/admin/candidates` - 候補者一覧
- `GET /api/admin/candidates/[id]` - 候補者詳細
- `GET /api/admin/evaluations` - 評価一覧
- `PUT /api/admin/evaluations/[id]/exclude` - 評価除外
- `GET /api/admin/logs` - 監査ログ

## 7. 数値評価項目

評価フォームの数値評価（全て5段階）:
1. 専門知識・スキル
2. 問題解決能力
3. コミュニケーション能力
4. チームワーク・協調性
5. リーダーシップ
6. 主体性・積極性
7. 責任感
8. 時間管理・締切遵守
9. 創造性・革新性
10. ストレス耐性

## 8. エピソード入力項目

各エピソード（2件必須、1件任意）:
1. エピソードタイトル
2. 期間
3. 目的・背景
4. 候補者の役割
5. 具体的な行動（時系列）
6. 成果・結果
7. 発揮された能力・特性
8. 課題や困難への対応
9. 学びや成長

## 9. セキュリティ考慮事項

- パスワードはbcryptでハッシュ化
- セッションはHTTP-only Cookieで管理
- 評価者トークンは十分な長さ（32文字以上）
- SQLインジェクション対策（Prisma使用）
- XSS対策（React自動エスケープ）
- CSRF対策（NextAuth.js組み込み）
- レート制限（本番環境で実装）

## 10. ディレクトリ構成

```
/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (candidate)/
│   │   │   ├── dashboard/
│   │   │   ├── onboarding/
│   │   │   ├── resume/
│   │   │   ├── reviewers/
│   │   │   ├── requests/
│   │   │   ├── evaluations/
│   │   │   ├── public-url/
│   │   │   └── settings/
│   │   ├── review/
│   │   │   └── [token]/
│   │   ├── public/
│   │   │   └── [token]/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   ├── candidates/
│   │   │   ├── evaluations/
│   │   │   └── logs/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── layouts/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/
│   └── uploads/
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```
