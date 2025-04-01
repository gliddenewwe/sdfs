# نظام إدارة المخزون

نظام متكامل لإدارة المخزون باستخدام HTML و CSS و JavaScript مع Supabase كقاعدة بيانات.

## المميزات

### قسم الأدمن
- إضافة منتجات جديدة مع:
  - رقم الموديل
  - الألوان المتاحة
  - القياسات المختلفة
  - صور المنتجات
- إدارة المنتجات:
  - تعديل معلومات المنتجات
  - إضافة/حذف الألوان والقياسات
  - حذف المنتجات
- عرض المبيعات وتتبعها

### قسم العملاء
- عرض المنتجات المتوفرة
- البحث عن المنتجات برقم الموديل
- إمكانية الشراء المباشر

## متطلبات النظام

1. حساب Supabase
2. متصفح حديث يدعم JavaScript

## الإعداد

1. إنشاء مشروع جديد في Supabase
2. إنشاء الجداول التالية:

```sql
-- جدول المنتجات
create table products (
  id uuid default uuid_generate_v4() primary key,
  model_number text not null,
  colors text[] not null,
  sizes text[] not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- جدول المبيعات
create table sales (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) not null,
  color text not null,
  size text not null,
  sale_date timestamp with time zone default timezone('utc'::text, now()) not null
);
```

3. إنشاء bucket باسم 'product-images' في Supabase Storage

4. تحديث ملف `js/supabase-config.js` بمعلومات مشروعك:
```javascript
const SUPABASE_URL = 'رابط_مشروعك'
const SUPABASE_ANON_KEY = 'المفتاح_العام_لمشروعك'
```

## التشغيل

1. رفع الملفات إلى خادم ويب
2. الوصول إلى النظام:
   - واجهة العملاء: `index.html`
   - لوحة التحكم: `admin/index.html`

## الأمان

- تأكد من إضافة قواعد أمان مناسبة في Supabase
- قم بتنفيذ نظام مصادقة للوصول إلى لوحة التحكم
- قم بتقييد الوصول إلى جداول قاعدة البيانات وفقًا للأدوار

## تخصيص النظام

يمكنك تخصيص النظام من خلال:
- تعديل التصميم في `css/style.css`
- إضافة حقول إضافية للمنتجات
- تخصيص نظام المصادقة
- إضافة ميزات جديدة