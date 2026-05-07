// ============================
// All Arabic strings centralized here
// ============================

export const STRINGS = {
  // App
  appName: 'KS CMR',

  // Auth - Login
  loginTitle: 'تسجيل الدخول',
  loginSubtitle: 'نظام KS CMR للمبيعات',
  emailPlaceholder: 'البريد الإلكتروني',
  passwordPlaceholder: 'كلمة المرور',
  loginButton: 'دخول',
  loggingIn: 'جاري الدخول...',
  loginError: 'خطأ في البريد الإلكتروني أو كلمة المرور',
  networkError: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال.',

  // Auth - Lock / PIN
  lockTitle: 'التحقق من الهوية',
  lockSubtitle: 'أدخل رمز PIN للمتابعة',
  pinLabel: 'رمز PIN',
  useBiometric: 'استخدام البصمة / Face ID',
  wrongPin: 'رمز PIN غير صحيح',
  pinAttemptsLeft: (n: number) => `تبقى ${n} محاولات`,
  lockedOut: 'تم تجاوز الحد الأقصى. يرجى تسجيل الدخول مجدداً.',
  biometricFailed: 'فشل التحقق البيومتري، يرجى إدخال PIN',
  setupPin: 'إعداد رمز PIN',
  setupPinSubtitle: 'أدخل رمز PIN من 4 أرقام',
  confirmPin: 'تأكيد رمز PIN',
  confirmPinSubtitle: 'أعد إدخال رمز PIN للتأكيد',
  pinMismatch: 'رمز PIN غير متطابق، حاول مجدداً',
  pinSetSuccess: 'تم إعداد رمز PIN بنجاح',

  // Navigation
  searchTab: 'بحث',
  todayTab: 'اليوم',
  logoutButton: 'خروج',

  // Search Screen
  searchTitle: 'البحث عن عميل',
  searchPlaceholder: 'ابحث بالاسم أو رقم الهاتف...',
  searchHint: 'ابدأ الكتابة للبحث',
  noResults: 'لا توجد نتائج',
  loadingCustomers: 'جاري البحث...',

  // Customer Card
  balanceLabel: 'الرصيد',
  debtLabel: 'دين',
  creditLabel: 'دائن',
  logEventButton: 'تسجيل حدث',

  // Log Event Screen
  logEventTitle: 'تسجيل حدث',
  eventType: 'نوع الحدث',
  debtType: 'دين',
  paymentType: 'دفعة',
  amountLabel: 'المبلغ',
  amountPlaceholder: 'أدخل المبلغ',
  currencyLabel: 'العملة',
  noteLabel: 'ملاحظة (اختياري)',
  notePlaceholder: 'أدخل ملاحظة...',
  submitButton: 'حفظ الحدث',
  submitting: 'جاري الحفظ...',
  eventSuccess: 'تم تسجيل الحدث بنجاح',
  eventError: 'فشل تسجيل الحدث. حاول مجدداً.',
  amountRequired: 'يرجى إدخال المبلغ',
  invalidAmount: 'المبلغ غير صحيح',

  // Today Screen
  todayTitle: "أحداث اليوم",
  noEventsToday: 'لا توجد أحداث اليوم',
  totalEvents: (n: number) => `${n} حدث مسجل اليوم`,

  // Offline
  offlineMessage: 'لا يوجد اتصال بالإنترنت',
  offlineSubtitle: 'يرجى التحقق من الاتصال والمحاولة مجدداً',

  // Errors
  errorGeneric: 'حدث خطأ غير متوقع',
  retry: 'إعادة المحاولة',
}
