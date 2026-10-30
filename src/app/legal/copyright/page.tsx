// src/app/legal/copyright/page.tsx
export default function CopyrightPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl text-white">Copyright & Acceptable Use</h1>
      <p className="mb-8 text-[12px] uppercase tracking-[0.2em] text-[#3B82F6]">Last Updated: October 2026</p>

      <h2 className="mb-4 mt-8 text-xl text-white">1. Copyright Disclaimer</h2>
      <p className="mb-6">
        VidSave is intended for personal, non-commercial use only. We do not host or distribute copyrighted material. The service simply provides a technical link to files hosted on third-party platforms.
      </p>
      <p className="mb-6">
        Users are solely responsible for ensuring they have the legal right to download any content. Downloading copyrighted material without permission from the rights holder may violate copyright laws in your country.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">2. Copyright Infringement Claims</h2>
      <p className="mb-6">
        If you are a copyright owner and believe that content accessed via VidSave infringes upon your copyright, please contact us with the following information:
      </p>
      <ul className="mb-6 list-disc pl-5">
        <li>A description of the copyrighted work.</li>
        <li>The exact URL on the third-party platform where the infringing content is hosted.</li>
        <li>Your contact information.</li>
        <li>A statement of good faith belief that the use is not authorized.</li>
      </ul>
      <p className="mb-6">
        Because VidSave does not host the files, we cannot remove them. However, we will block access to the specific URL from our service upon receipt of a valid claim.
      </p>

      <h2 className="mb-4 mt-8 text-xl text-white">3. Contact</h2>
      <p className="mb-6">
        For copyright inquiries, please contact: <strong>support@vidsave-five.vercel.app</strong>
      </p>
    </div>
  );
}