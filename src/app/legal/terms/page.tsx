// src/app/legal/terms/page.tsx
export default function TermsPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl text-white">Terms of Service</h1>
      <p className="mb-8 text-[12px] uppercase tracking-[0.2em] text-[#3B82F6]">Last Updated: October 2026</p>

      <p className="mb-6">
        Welcome to VidSave. By accessing or using our website, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">1. Description of Service</h2>
      <p className="mb-6">
        VidSave provides a tool to download publicly available media from various social media platforms. VidSave does not host, store, or claim ownership of any of the media downloaded through the service. All files are transferred directly from the original platform's servers to your device.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">2. Acceptable Use</h2>
      <p className="mb-6">
        You agree to use VidSave only for lawful purposes. You must only download content that you own, have permission to download, or that is explicitly permitted by the platform's terms of service. You may not use this service to infringe upon copyrights, distribute malware, or engage in illegal activities.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">3. Subscriptions and Billing</h2>
      <p className="mb-6">
        VidSave offers a free tier and a premium "Pro" subscription. Subscriptions are billed on a recurring basis (monthly) via our payment provider, Paystack. You may cancel your subscription at any time via your account settings. Refunds are handled in accordance with our refund policy.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">4. Disclaimer of Warranties</h2>
      <p className="mb-6">
        The service is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or that specific platforms will remain supported.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">5. Limitation of Liability</h2>
      <p className="mb-6">
        VidSave shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service, including but not limited to copyright claims from third parties arising from your downloads.
      </p>
    </div>
  );
}