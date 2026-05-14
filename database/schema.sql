-- Passerelle AI Refined Schema V1

-- Workspaces (Multitenancy)
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Profiles (Users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid references workspaces(id),
  full_name text,
  email text,
  role text check (role in ('admin', 'volunteer', 'social_worker')),
  created_at timestamptz default now()
);

-- Cases
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  creator_id uuid references profiles(id),
  migrant_name text,
  case_number text,
  status text default 'open' check (status in ('open', 'in_progress', 'closed', 'archived')),
  priority text default 'normal' check (priority in ('low', 'normal', 'urgent', 'critical')),
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_type text,
  ocr_status text default 'pending' check (ocr_status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz default now()
);

-- AI Extractions
create table if not exists extraction_results (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  raw_json jsonb not null,
  confidence_score float,
  is_verified boolean default false,
  verified_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Tasks (NGO Copilot generated)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  status text default 'todo' check (status in ('todo', 'done', 'cancelled')),
  created_at timestamptz default now()
);

-- Audit Logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id),
  user_id uuid references profiles(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb,
  created_at timestamptz default now()
);
