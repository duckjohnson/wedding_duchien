# Sync nha_trai Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đồng bộ source code từ dự án `nha_trai` sang `nha_gai` nhưng vẫn giữ lại thông tin cấu hình và hình ảnh riêng của `nha_gai`.

**Architecture:** Sử dụng bash command (`cp`, `rsync`) để đồng bộ toàn bộ logic và UI components. File `config/wedding.ts` sẽ được merge thủ công để không mất thông tin nhà gái.

**Tech Stack:** Next.js, React, Bash

**Spec:** docs/superpowers/specs/2026-09-29-sync-nha-trai-design.md

## Global Constraints

Thư mục `public/` và thông tin cá nhân trong `config/wedding.ts` của nhà gái không được phép bị ghi đè hay mất đi.

---

### Task 1: Đồng bộ các file cấu hình gốc

**Files:**
- Modify: `package.json`, `package-lock.json`, `.env.example`, `.env.local`, `.gitignore`, `README.md`

- [ ] **Step 1: Copy các file config từ nha_trai sang nha_gai**

```bash
cp /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/package.json ./package.json
cp /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/package-lock.json ./package-lock.json
cp /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/.env.example ./.env.example
cp /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/.env.local ./.env.local
cp /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/.gitignore ./.gitignore
cp /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/README.md ./README.md
```

- [ ] **Step 2: Commit thay đổi**

```bash
git add package.json package-lock.json .env.example .env.local .gitignore README.md
git commit -m "chore: sync root config files from nha_trai"
```

### Task 2: Đồng bộ mã nguồn (Source Code)

**Files:**
- Modify/Create: `app/`, `components/`, `lib/`, `data/`, `docs/`, `config/wishes-ui.ts`

- [ ] **Step 1: Sử dụng rsync để đồng bộ các thư mục source code**

```bash
rsync -av --delete /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/app/ ./app/
rsync -av --delete /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/components/ ./components/
rsync -av --delete /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/lib/ ./lib/
rsync -av /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/data/ ./data/
rsync -av /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/docs/ ./docs/
cp /Users/macbook/Downloads/files_wedding/code/nha_trai/thiep-cuoi-nextjs/config/wishes-ui.ts ./config/wishes-ui.ts
```

- [ ] **Step 2: Commit thay đổi**

```bash
git add app/ components/ lib/ data/ docs/ config/wishes-ui.ts
git commit -m "feat: sync source code and components from nha_trai"
```

### Task 3: Merge config/wedding.ts

**Files:**
- Modify: `config/wedding.ts`

- [ ] **Step 1: So sánh file config/wedding.ts của hai bên**

Sử dụng tool để đọc nội dung `config/wedding.ts` của nhà gái hiện tại và `nha_trai`.
Xác định các trường (fields) bị thiếu trong `nha_gai` so với `nha_trai` (như cấu hình cho wishes, admin).

- [ ] **Step 2: Cập nhật config/wedding.ts của nha_gai**

Sử dụng tool (replace_file_content hoặc write_to_file) để thêm các trường bị thiếu vào `config/wedding.ts` nhưng **PHẢI GIỮ NGUYÊN** các thông tin liên quan đến cô dâu, tên, địa điểm, STK.

- [ ] **Step 3: Test và Commit**

Kiểm tra file đã hợp lệ chưa.
```bash
git add config/wedding.ts
git commit -m "chore: merge wedding config with new schema from nha_trai"
```

### Task 4: Cài đặt dependency và Build kiểm tra

**Files:**
- Modify: Không có

- [ ] **Step 1: Chạy npm install**

```bash
npm install
```

- [ ] **Step 2: Chạy kiểm tra build**

```bash
npm run build
```

- [ ] **Step 3: Commit lock file nếu có thay đổi**

```bash
git add package-lock.json
git commit -m "chore: update dependencies after sync" || echo "No changes to commit"
```
