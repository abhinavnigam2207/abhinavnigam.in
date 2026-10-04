import { ArrowUpRight, ChevronDown, FileUp, LockKeyhole } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PageIntro, PageMeta, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";
import { referralFaq } from "@/content/referralFaq";

const companies = ["Amazon", "Apple", "Meta", "Microsoft", "Netflix", "NVIDIA", "Adobe", "Uber", "Airbnb", "Atlassian", "Stripe", "Salesforce", "Oracle", "LinkedIn", "Flipkart", "Other"];
type ReferralStatus = { ready: boolean; message: string };

export default function GoogleRefer() {
  const [status, setStatus] = useState<ReferralStatus>({ ready: false, message: "" });
  const [notice, setNotice] = useState("");
  const [fileError, setFileError] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/referrals/status")
      .then(response => response.ok ? response.json() as Promise<ReferralStatus> : Promise.reject())
      .then(value => { if (mounted) setStatus(value); })
      .catch(() => { if (mounted) setStatus({ ready: false, message: "" }); });
    return () => { mounted = false; };
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = (form.elements.namedItem("resume") as HTMLInputElement).files?.[0];
    setFileError("");
    if (!file) { setFileError("Please choose your resume before continuing."); return; }
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const allowedExtension = /\.(pdf|doc|docx)$/i.test(file.name);
    if ((!allowed.includes(file.type) && !allowedExtension) || file.size > 5 * 1024 * 1024) {
      setFileError("Upload a PDF or Word document up to 5 MB.");
      return;
    }
    if (!status.ready) {
      setNotice("The form is not open yet. Nothing was sent. Please email the role link and your resume instead.");
      return;
    }
    setNotice("Referral submission is not available yet.");
  };

  return (
    <SiteShell>
      <PageMeta {...pageMeta.googleRefer} />
      <main className="wrap page-main referral-main">
        <PageIntro eyebrow="Google referrals" title="A role you’re excited about?">
          <p>Share a few details and the job link. I’ll take a look and get back to you if there’s a fit.</p>
        </PageIntro>
        {!status.ready && (
          <div className="integration-banner" role="status">
            <LockKeyhole size={17} aria-hidden="true" />
            <p><strong>This form opens soon.</strong> Until then, <a className="inline-link" href="mailto:abhinavnigam2207@gmail.com?subject=Google%20referral">email me the role link and your resume</a>.</p>
          </div>
        )}
        <form className="referral-form" onSubmit={submit}>
          <div className="form-grid">
            <label className="field"><span>Full name <b>*</b></span><input name="name" autoComplete="name" required placeholder="Your name" /></label>
            <label className="field"><span>Email address <b>*</b></span><input type="email" name="email" autoComplete="email" required placeholder="you@example.com" /></label>
            <label className="field"><span>Phone <small>Optional</small></span><input type="tel" name="phone" autoComplete="tel" placeholder="Country code + number" /></label>
            <label className="field"><span>Current company <b>*</b></span><select name="currentCompany" required defaultValue=""><option value="" disabled>Select a company</option>{companies.map(company => <option key={company}>{company}</option>)}</select></label>
            <fieldset className="field field-wide company-field">
              <legend>Previous companies</legend>
              <details className="company-picker">
                <summary aria-describedby="company-help">
                  <span>{selectedCompanies.length ? `${selectedCompanies.length} selected` : "Choose one or more companies"}</span>
                  <ChevronDown size={15} aria-hidden="true" />
                </summary>
                <div className="company-picker-options" role="group" aria-label="Previous companies">
                  {companies.map(company => (
                    <label className="company-option" key={company}>
                      <input
                        type="checkbox"
                        name="previousCompanies"
                        value={company}
                        checked={selectedCompanies.includes(company)}
                        onChange={event => {
                          const { checked } = event.currentTarget;
                          setSelectedCompanies(current => checked ? [...current, company] : current.filter(item => item !== company));
                        }}
                      />
                      <span>{company}</span>
                    </label>
                  ))}
                </div>
              </details>
              <small id="company-help" className="company-help">Choose any that apply.</small>
            </fieldset>
            <label className="field field-wide"><span>Job link <b>*</b></span><input type="url" name="jobLink" required placeholder="https://careers.google.com/jobs/..." /></label>
            <label className="field field-wide upload-field"><span>Resume <b>*</b></span><div className="upload-control"><FileUp size={19} /><input type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required onChange={() => setFileError("")} /><small>PDF or Word document · up to 5 MB</small></div></label>
          </div>
          {fileError && <p className="form-error" role="alert">{fileError}</p>}
          <label className="consent-row"><input type="checkbox" required /><span>I agree to share these details and my resume with Abhinav for this referral request.</span></label>
          {notice && <p className="form-note" role="status">{notice}</p>}
          <div className="form-footer"><button className="button" type="submit" disabled={!status.ready}>Submit referral <ArrowUpRight size={15} /></button><p>Your details go to Abhinav only. A referral is not guaranteed.</p></div>
        </form>
        <section className="faq" aria-labelledby="faq-title">
          <h2 id="faq-title">Questions</h2>
          <dl>
            {referralFaq.map(item => <div key={item.question}><dt>{item.question}</dt><dd>{item.answer}</dd></div>)}
          </dl>
        </section>
      </main>
    </SiteShell>
  );
}
