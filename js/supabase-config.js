// Initialize Supabase client
const SUPABASE_URL = 'https://vxutpsclahxaxhgmdfls.supabase.co'; // قم بتغيير هذا إلى رابط مشروع Supabase الخاص بك
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dXRwc2NsYWh4YXhoZ21kZmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NzE4NjQsImV4cCI6MjA1OTA0Nzg2NH0.0jZjKp-xintcu6xvBRRY6sM6SNPG-jFYZvebra6Abqk'; // قم بتغيير هذا إلى المفتاح العام لمشروع Supabase الخاص بك

// إنشاء عميل Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// التأكد من أن عميل Supabase متاح عالمياً
window.supabaseClient = supabase;

console.log('Supabase client initialized:', !!supabase);

// التحقق من الاتصال بـ Supabase
async function checkConnection() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('count', { count: 'exact' });
            
        if (error) throw error;
        console.log('Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Supabase connection error:', error.message);
        return false;
    }
}

// تشغيل اختبار الاتصال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', checkConnection);