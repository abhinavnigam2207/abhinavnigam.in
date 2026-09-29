import { useState, useEffect, type FormEvent } from "react";
import { LockKeyhole, FileUp, ChevronDown, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";

const CURRENT_COMPANIES = ["Google", "Observe.ai", "Rapido", "Reliance Jio", "IHS Markit", "MetaDesign Solutions", "Other"];
const PREVIOUS_COMPANIES = ["Google", "Amazon", "Apple", "Meta", "Microsoft", "Netflix", "NVIDIA", "Adobe", "Uber", "Airbnb", "Atlassian", "Stripe", "Other"];

interface ReferralStatus {
  ready: boolean;
  message: string;
}

export function GoogleReferView() {
  const [status, setStatus] = useState<ReferralStatus>({
    ready: false,
    message: "Checking Microsoft Excel / OneDrive destination status...",
  });
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/referrals/status")
      .then((res) => (res.ok ? res.json() as Promise<ReferralStatus> : Promise.reject()))
      .then((data) => {
        if (mounted) setStatus(data);
      })
      .catch(() => {
        if (mounted) {
          setStatus({
            ready: false,
            message: "Microsoft Excel / OneDrive destination is currently in preview mode.",
          });
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFileError("");
    setNotice("");

    const form = e.currentTarget;
    const file = (form.elements.namedItem("resume") as HTMLInputElement)?.files?.[0];

    if (!file) {
      setFileError("Please select a resume file before submitting.");
      return;
    }

    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const allowedExt = /\.(pdf|doc|docx)$/i.test(file.name);
    if ((!allowed.includes(file.type) && !allowedExt) || file.size > 5 * 1024 * 1024) {
      setFileError("Please upload a PDF or Word document up to 5 MB.");
      return;
    }

    if (!status.ready) {
      setNotice(
        "Preview mode: your referral details and resume remain in your browser and were not sent to a live spreadsheet."
      );
      setSubmitted(true);
      return;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 select-text font-mono text-xs">
      {/* Code Header Comment */}
      <div className="text-vscode-gcm italic text-xs mb-1">
        // google-refer.tsx — Abhinav Nigam | Google Candidate Referral Intake Portal
      </div>
      <div className="text-vscode-dim text-[11px] mb-6">
        <span className="text-vscode-purple">export default function</span> <span className="text-vscode-blue">GoogleReferralForm</span>() &#123; <span className="text-vscode-green">/* Confidential referral portal */</span> &#125;
      </div>

      <div className="p-6 rounded-lg bg-vscode-bg2 border border-vscode-border shadow-xs space-y-6">
        {/* Status Callout Banner */}
        <div
          className={`p-3 rounded-md border flex items-start gap-2.5 ${
            status.ready
              ? "bg-vscode-green/10 border-vscode-green/30 text-vscode-green"
              : "bg-vscode-yellow/10 border-vscode-yellow/30 text-vscode-text"
          }`}
        >
          <LockKeyhole size={16} className="shrink-0 mt-0.5 text-vscode-yellow" />
          <div className="text-xs font-sans">
            <span className="font-bold">
              {status.ready ? "Live Submission Connected" : "Secure Preview Active: "}
            </span>
            <span className="opacity-90">{status.message}</span>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3 bg-vscode-bg rounded-lg border border-vscode-border">
            <CheckCircle2 size={36} className="text-vscode-green mx-auto" />
            <h3 className="font-sans font-bold text-base text-vscode-bright m-0">
              Referral Details Received (Preview)
            </h3>
            <p className="font-sans text-xs text-vscode-dim max-w-md mx-auto m-0 leading-relaxed">
              {notice || "Thank you for sharing your profile. In this preview, your file was verified client-side."}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-1.5 rounded bg-vscode-blue2 text-white font-sans text-xs cursor-pointer hover:opacity-90"
              >
                Submit another role
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-semibold text-vscode-text block">
                  Full Name <span className="text-vscode-red">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your full name"
                  className="w-full px-3 py-2 rounded bg-vscode-bg border border-vscode-border text-vscode-text text-xs focus:border-vscode-blue2 outline-none font-sans"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-semibold text-vscode-text block">
                  Email Address <span className="text-vscode-red">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded bg-vscode-bg border border-vscode-border text-vscode-text text-xs focus:border-vscode-blue2 outline-none font-sans"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="font-semibold text-vscode-text block">
                  Phone <span className="text-vscode-dim font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91-..."
                  className="w-full px-3 py-2 rounded bg-vscode-bg border border-vscode-border text-vscode-text text-xs focus:border-vscode-blue2 outline-none font-sans"
                />
              </div>

              {/* Current Company */}
              <div className="space-y-1">
                <label className="font-semibold text-vscode-text block">
                  Current Company <span className="text-vscode-red">*</span>
                </label>
                <select
                  name="currentCompany"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2 rounded bg-vscode-bg border border-vscode-border text-vscode-text text-xs focus:border-vscode-blue2 outline-none font-sans cursor-pointer"
                >
                  <option value="" disabled>Select current company</option>
                  {CURRENT_COMPANIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Previous Companies Multi-select */}
            <div className="space-y-1">
              <label className="font-semibold text-vscode-text block">
                Target / Previous Companies
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded bg-vscode-bg border border-vscode-border max-h-24 overflow-y-auto thin-scroll">
                {PREVIOUS_COMPANIES.map((company) => {
                  const isChecked = selectedCompanies.includes(company);
                  return (
                    <button
                      type="button"
                      key={company}
                      onClick={() =>
                        setSelectedCompanies((prev) =>
                          isChecked ? prev.filter((x) => x !== company) : [...prev, company]
                        )
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-sans border cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-vscode-blue2 text-white border-vscode-blue2"
                          : "bg-vscode-bg2 text-vscode-dim border-vscode-border hover:text-vscode-text"
                      }`}
                    >
                      {company}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Job Link */}
            <div className="space-y-1">
              <label className="font-semibold text-vscode-text block">
                Google Job Opening URL <span className="text-vscode-red">*</span>
              </label>
              <input
                type="url"
                name="jobLink"
                required
                placeholder="https://careers.google.com/jobs/results/..."
                className="w-full px-3 py-2 rounded bg-vscode-bg border border-vscode-border text-vscode-text text-xs focus:border-vscode-blue2 outline-none font-sans"
              />
            </div>

            {/* Resume Upload */}
            <div className="space-y-1">
              <label className="font-semibold text-vscode-text block">
                Resume / CV <span className="text-vscode-red">*</span>
              </label>
              <div className="border-2 border-dashed border-vscode-border rounded-lg p-4 text-center bg-vscode-bg hover:border-vscode-blue2 transition-colors">
                <FileUp size={22} className="mx-auto text-vscode-dim mb-1" />
                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  required
                  onChange={() => setFileError("")}
                  className="text-xs text-vscode-dim file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-vscode-blue2 file:text-white file:cursor-pointer cursor-pointer"
                />
                <p className="text-[10px] text-vscode-dim mt-1 m-0">
                  PDF or Word document · up to 5 MB
                </p>
              </div>
            </div>

            {fileError && (
              <div className="p-2 rounded bg-vscode-red/10 border border-vscode-red/30 text-vscode-red text-xs">
                {fileError}
              </div>
            )}

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input type="checkbox" required className="mt-0.5 rounded cursor-pointer" />
              <span className="text-[11px] text-vscode-dim leading-relaxed">
                I agree to share these details and resume with Abhinav Nigam for Google referral consideration.
              </span>
            </label>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="px-5 py-2 rounded bg-vscode-blue2 text-white font-sans text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Submit Referral</span>
                <ArrowUpRight size={14} />
              </button>
              <span className="text-[11px] text-vscode-dim">
                For questions: <a href="mailto:abhinavnigam2207@gmail.com" className="text-vscode-blue2 hover:underline">abhinavnigam2207@gmail.com</a>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
