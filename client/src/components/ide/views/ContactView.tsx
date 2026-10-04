import { useState, type FormEvent } from "react";
import { Mail, Phone, Linkedin, Github, Send, CheckCircle2, ArrowUpRight, MessageSquare } from "lucide-react";
import { abhinavProfile } from "../../../content/ideContent";

export function ContactView() {
  const [sent, setSent] = useState(false);
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:${abhinavProfile.email}?subject=${encodeURIComponent(
      formState.subject || "Portfolio Contact"
    )}&body=${encodeURIComponent(
      `From: ${formState.name} (${formState.email})\n\n${formState.message}`
    )}`;
    window.open(mailto, "_self");
    setSent(true);
  };

  const socials = [
    { label: "Email", value: abhinavProfile.email, href: `mailto:${abhinavProfile.email}`, icon: <Mail size={16} className="text-vscode-blue2" /> },
    { label: "Phone", value: abhinavProfile.phone, href: `tel:${abhinavProfile.phone.replaceAll("-", "")}`, icon: <Phone size={16} className="text-vscode-green" /> },
    { label: "LinkedIn", value: "in/abhinavnigam2207", href: abhinavProfile.linkedin, icon: <Linkedin size={16} className="text-[#0a66c2]" /> },
    { label: "GitHub", value: "github.com/abhinavnigam2207", href: abhinavProfile.github, icon: <Github size={16} className="text-vscode-text" /> },
    { label: "DEV.to", value: "dev.to/abhinavnigam2207", href: abhinavProfile.devto, icon: <MessageSquare size={16} className="text-vscode-purple" /> },
    { label: "Medium", value: "medium.com/@abhinavnigam2207", href: abhinavProfile.medium, icon: <MessageSquare size={16} className="text-vscode-green" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 select-text font-mono text-xs">
      {/* Code Header Comment */}
      <div className="text-vscode-gcm italic text-xs mb-1">
        /* contact.css — connect & build something extraordinary */
      </div>
      <div className="text-vscode-dim text-[11px] mb-6">
        <span className="text-vscode-purple">.contact-sheet</span> &#123; <span className="text-vscode-blue">availability</span>: <span className="text-vscode-green">'open'</span>; <span className="text-vscode-blue">roles</span>: <span className="text-vscode-green">'senior-staff-lead'</span>; &#125;
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Direct Links */}
        <div className="p-5 rounded-lg bg-vscode-bg2 border border-vscode-border space-y-4">
          <div className="border-b border-vscode-border pb-2">
            <h3 className="font-sans font-bold text-sm text-vscode-bright m-0">
              Direct Channels
            </h3>
            <p className="text-[11px] text-vscode-dim font-sans m-0 mt-0.5">
              Available for technical leadership discussions, engineering roles, and Google referrals.
            </p>
          </div>

          <div className="space-y-2">
            {socials.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="flex items-center justify-between p-3 rounded bg-vscode-bg border border-vscode-border hover:border-vscode-blue2 hover:bg-vscode-bg3 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <div>
                    <div className="font-sans font-semibold text-xs text-vscode-text">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-vscode-dim font-mono">
                      {item.value}
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-vscode-dim group-hover:text-vscode-blue2 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Send Message Form */}
        <div className="p-5 rounded-lg bg-vscode-bg2 border border-vscode-border">
          <div className="border-b border-vscode-border pb-2 mb-4">
            <h3 className="font-sans font-bold text-sm text-vscode-bright m-0">
              Send a Direct Message
            </h3>
            <p className="text-[11px] text-vscode-dim font-sans m-0 mt-0.5">
              Drafts an email directly to Abhinav's inbox.
            </p>
          </div>

          {sent ? (
            <div className="p-6 text-center space-y-3 bg-vscode-bg rounded-lg border border-vscode-border">
              <CheckCircle2 size={32} className="text-vscode-green mx-auto" />
              <div className="font-sans font-bold text-sm text-vscode-bright">
                Email Client Triggered
              </div>
              <p className="text-vscode-dim text-xs font-sans m-0">
                Your message was prepared in your default mail app. You can also email Abhinav directly at <span className="text-vscode-blue2 font-mono">{abhinavProfile.email}</span>.
              </p>
              <button
                onClick={() => setSent(false)}
                className="px-3 py-1 rounded bg-vscode-blue2 text-white font-sans text-xs cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-vscode-text block text-[11px]">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-1.5 rounded bg-vscode-bg border border-vscode-border text-vscode-text text-xs focus:border-vscode-blue2 outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-vscode-text block text-[11px]">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-1.5 rounded bg-vscode-bg border border-vscode-border text-vscode-text text-xs focus:border-vscode-blue2 outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-vscode-text block text-[11px]">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  placeholder="Engineering role / Discussion"
                  className="w-full px-3 py-1.5 rounded bg-vscode-bg border border-vscode-border text-vscode-text text-xs focus:border-vscode-blue2 outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-vscode-text block text-[11px]">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Write your message here..."
                  className="w-full px-3 py-1.5 rounded bg-vscode-bg border border-vscode-border text-vscode-text text-xs focus:border-vscode-blue2 outline-none font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-vscode-blue2 text-white font-sans text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send size={13} />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
