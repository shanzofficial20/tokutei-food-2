# Tokutei Food 2 Web MVP

Website latihan Tokuteiginou 2 dengan:
- Login / register
- Akun free, premium, admin
- CBT 1/2/3/4
- Skor otomatis
- Admin tambah soal
- Premium manual

## 1. Install

```bash
npm install
npm run dev
```

Buka:

```txt
http://localhost:3000
```

## 2. Setup Supabase

1. Buat project di Supabase.
2. Buka SQL Editor.
3. Copy isi `supabase/schema.sql`.
4. Run SQL.
5. Buka Project Settings > API.
6. Copy `Project URL`, `anon public key`, dan `service_role key`.
7. Buat file `.env.local` berdasarkan `.env.example`.

## 3. Buat admin

Setelah kamu register akun pertama, buka Supabase SQL Editor lalu jalankan:

```sql
update public.profiles
set role = 'admin'
where email = 'emailkamu@example.com';
```

## 4. Premium manual

Kalau user sudah bayar:

```sql
update public.profiles
set role = 'premium',
    premium_until = now() + interval '30 days'
where email = 'emailuser@example.com';
```

## 5. Catatan penting

Untuk development, kalau login agak ribet karena email confirmation, buka Supabase:
Authentication > Providers > Email > Confirm email = OFF.
