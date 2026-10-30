// src/app/legal/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl text-white">Privacy Policy</h1>
      <p className="mb-8 text-[12px] uppercase tracking-[0.2em] text-[#3B82F6]">Last Updated: October 2026</p>

      <p className="mb-6">
        At VidSave, we take your privacy seriously. This policy explains what data we collect and how it is used.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">1. Information We Collect</h2>
      <ul className="mb-6 list-disc pl-5">
        <li><strong>Account Data:</strong> If you create an account, we collect your email address to manage your subscription and usage limits.</li>
        <li><strong>Usage Data:</strong> We log the URLs you submit to check for abuse and rate-limiting. We do not permanently store the media files you download.</li>
        <li><strong>Payment Data:</strong> All payments are processed securely by Paystack. We do not store your raw credit card details on our servers.</li>
      </ul>

      <h2 className="mb-4 mt-8 text-xl text-white">2. How We Use Your Information</h2>
      <p className="mb-6">
        We use your information to provide the service, enforce quotas, prevent abuse, process payments, and communicate with you regarding your account.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">3. Cookies</h2>
      <p className="mb-6">
        We use essential cookies to maintain your login session and local storage to remember your recent downloads. We may also use privacy-conscious analytics (like Vercel Analytics) to understand traffic patterns.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">4. Third-Party Services</h2>
      <p className="mb-6">
        We use third-party APIs (like FastSaver) to process video links. These providers only receive the public URL you submit. We also use Paystack for payment processing.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">5. Data Retention and Deletion</h2>
      <p className="mb-6">
        You may request deletion of your account and associated data at any time by contacting us. We will delete your personal information within 30 days, except for billing records required by law.
      </p>
    </div>
  );
}