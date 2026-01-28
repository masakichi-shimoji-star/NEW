-- User table
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  nameKana TEXT,
  phone TEXT,
  address TEXT,
  photo TEXT,
  selfPr TEXT,
  role TEXT DEFAULT 'CANDIDATE' NOT NULL,
  onboardingCompleted INTEGER DEFAULT 0 NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL
);

-- Education table
CREATE TABLE IF NOT EXISTS Education (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  schoolType TEXT NOT NULL,
  schoolName TEXT NOT NULL,
  faculty TEXT,
  department TEXT,
  enrollmentDate TEXT NOT NULL,
  graduationDate TEXT,
  isEnrolled INTEGER DEFAULT 0 NOT NULL,
  major TEXT,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- WorkHistory table
CREATE TABLE IF NOT EXISTS WorkHistory (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  companyName TEXT NOT NULL,
  department TEXT,
  employmentType TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate TEXT,
  isCurrentJob INTEGER DEFAULT 0 NOT NULL,
  position TEXT,
  jobCategory TEXT,
  responsibilities TEXT NOT NULL,
  achievements TEXT,
  skills TEXT,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Qualification table
CREATE TABLE IF NOT EXISTS Qualification (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  acquiredDate TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Skill table
CREATE TABLE IF NOT EXISTS Skill (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  yearsOfExperience INTEGER,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- DesiredCondition table
CREATE TABLE IF NOT EXISTS DesiredCondition (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  desiredJobType TEXT,
  desiredLocation TEXT,
  desiredSalary TEXT,
  availableDate TEXT,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Reviewer table
CREATE TABLE IF NOT EXISTS Reviewer (
  id TEXT PRIMARY KEY,
  candidateId TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  department TEXT,
  position TEXT,
  relationship TEXT NOT NULL,
  workPeriodStart TEXT NOT NULL,
  workPeriodEnd TEXT,
  isCurrentlyWorking INTEGER DEFAULT 0 NOT NULL,
  memo TEXT,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'NOT_SENT' NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (candidateId) REFERENCES User(id) ON DELETE CASCADE
);

-- Evaluation table
CREATE TABLE IF NOT EXISTS Evaluation (
  id TEXT PRIMARY KEY,
  reviewerId TEXT UNIQUE NOT NULL,
  overallScore INTEGER,
  recommendationScore INTEGER,
  wouldWorkAgain INTEGER,
  wouldWorkAgainReason TEXT,
  numericalEvaluations TEXT,
  episode1 TEXT,
  episode2 TEXT,
  episode3 TEXT,
  strengthTop TEXT,
  strengthEvidence TEXT,
  riskTop TEXT,
  riskConditions TEXT,
  riskSigns TEXT,
  riskMitigation TEXT,
  suitableEnvironment TEXT,
  managementTips TEXT,
  overallPersonality TEXT,
  factBased INTEGER DEFAULT 0 NOT NULL,
  confidentialityConsidered INTEGER DEFAULT 0 NOT NULL,
  noDefamation INTEGER DEFAULT 0 NOT NULL,
  isDraft INTEGER DEFAULT 1 NOT NULL,
  submittedAt TEXT,
  canEdit INTEGER DEFAULT 1 NOT NULL,
  editDeadline TEXT,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL,
  isExcluded INTEGER DEFAULT 0 NOT NULL,
  excludeReason TEXT,
  FOREIGN KEY (reviewerId) REFERENCES Reviewer(id) ON DELETE CASCADE
);

-- PublicUrl table
CREATE TABLE IF NOT EXISTS PublicUrl (
  id TEXT PRIMARY KEY,
  candidateId TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  isActive INTEGER DEFAULT 1 NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (candidateId) REFERENCES User(id) ON DELETE CASCADE
);

-- AdminAction table
CREATE TABLE IF NOT EXISTS AdminAction (
  id TEXT PRIMARY KEY,
  adminId TEXT NOT NULL,
  action TEXT NOT NULL,
  targetType TEXT NOT NULL,
  targetId TEXT NOT NULL,
  details TEXT,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (adminId) REFERENCES User(id)
);
