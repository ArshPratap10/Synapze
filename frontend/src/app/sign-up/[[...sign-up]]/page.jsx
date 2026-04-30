import { SignUp } from "@clerk/nextjs";

const clerkDarkTheme = {
  variables: {
    colorBackground: '#13102a',
    colorInputBackground: '#1e1a3a',
    colorInputText: '#e8e3f8',
    colorText: '#e8e3f8',
    colorTextSecondary: '#9b94c4',
    colorPrimary: '#7c6bc4',
    colorDanger: '#f87171',
    borderRadius: '14px',
    fontFamily: 'DM Sans, sans-serif',
  },
  elements: {
    card: {
      background: '#13102a',
      boxShadow: '0 8px 40px rgba(124,107,196,0.18)',
      border: '1px solid rgba(124,107,196,0.2)',
    },
    headerTitle: { color: '#e8e3f8', fontWeight: '800' },
    headerSubtitle: { color: '#9b94c4' },
    socialButtonsBlockButton: {
      background: '#1e1a3a',
      border: '1px solid rgba(124,107,196,0.3)',
      color: '#e8e3f8',
      '&:hover': {
        background: '#2a2550',
        borderColor: '#7c6bc4',
      },
    },
    socialButtonsBlockButtonText: { color: '#e8e3f8', fontWeight: '600' },
    dividerLine: { background: 'rgba(124,107,196,0.2)' },
    dividerText: { color: '#9b94c4' },
    formFieldLabel: { color: '#c4bcec' },
    formFieldInput: {
      display: 'none',
    },
    formButtonPrimary: {
      display: 'none',
    },
    formFieldRow: { display: 'none' },
    dividerRow: { display: 'none' },
    footerActionLink: { display: 'none' },
    footerActionText: { display: 'none' },
    footer: { display: 'none' },
    identityPreviewEditButton: { color: '#a885e5' },
    otpCodeFieldInput: {
      background: '#1e1a3a',
      border: '1px solid rgba(124,107,196,0.3)',
      color: '#e8e3f8',
    },
  },
};

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #1a1240 0%, #0e0a1a 70%)' }}>
      <SignUp
        redirectUrl="/onboarding"
        appearance={clerkDarkTheme}
      />
    </div>
  );
}
