import { ArrowUpRight, ChevronDown, FileUp, LockKeyhole, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageIntro, PageMeta, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";
import { referralFaq } from "@/content/referralFaq";

const companies = ["Amazon", "Apple", "Meta", "Microsoft", "Netflix", "NVIDIA", "Adobe", "Uber", "Airbnb", "Atlassian", "Stripe", "Salesforce", "Oracle", "LinkedIn", "Flipkart", "Other"];

export default function GoogleRefer() {
  // The form is open unless the server says the sheet is not connected. Starting open keeps the
  // "opens soon" notice out of the pre-rendered page and off the screen while the check is in flight.
  const [closed, setClosed] = useState(false);
  const [notice, setNotice] = useState("");
  const [fileError, setFileError] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/referrals/status")
      .then(response => response.ok ? response.json() as Promise<{ ready: boolean }> : Promise.reject())
      .then(value => { if (mounted) setClosed(!value.ready); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // The company list is a dropdown: close it on a click elsewhere or on Escape.
  const picker = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent | KeyboardEvent) => {
      const el = picker.current;
      if (!el?.open) return;
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !el.contains(event.target as Node)) el.open = false;
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = (form.elements.namedItem("resume") as HTMLInputElement).files?.[0];
    setFileError("");
    setNotice("");
    if (!file) { setFileError("Please choose your resume before continuing."); return; }
    if (!/\.(pdf|doc|docx)$/i.test(file.name) || file.size > 4 * 1024 * 1024) {
      setFileError("Upload a PDF or Word document up to 4 MB.");
      return;
    }
    if (closed) {
      setNotice("The form is not open yet. Nothing was sent. Please email the role link and your resume instead.");
      return;
    }
    const values = new FormData(form);
    setSending(true);
    try {
      // readAsDataURL gives "data:<type>;base64,<data>"; the server wants the data part.
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"), email: values.get("email"), phone: values.get("phone"), currentCompany: values.get("currentCompany"),
          previousCompanies: selectedCompanies, jobLink: values.get("jobLink"), website: values.get("website"), consent: true,
          resume: { name: file.name, data },
        }),
      });
      const result = await response.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error);
      form.reset();
      setSelectedCompanies([]);
      setNotice("Thank you. Your request has reached Abhinav. He will get back to you if there is a fit.");
    } catch (error) {
      setNotice((error instanceof Error && error.message) || "Something went wrong and nothing was sent. Please try again, or email the role link and your resume.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteShell>
      <PageMeta {...pageMeta.googleRefer} />
      <main className="wrap page-main referral-main">
        <PageIntro eyebrow="Google referrals" title="A role you’re excited about?">
          <p>Share a few details and the job link. I’ll take a look and get back to you if there’s a fit.</p>
        </PageIntro>
        <div className="referral-layout">
        <div className="referral-column">
        {closed && (
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
              <details className="company-picker" ref={picker}>
                <summary aria-describedby="company-help">
                  {selectedCompanies.length ? (
                    <span className="chips">
                      {selectedCompanies.map(company => (
                        <span className="chip" key={company}>
                          {company}
                          {/* preventDefault keeps the click from also opening or closing the list. */}
                          <button type="button" aria-label={`Remove ${company}`} onClick={event => { event.preventDefault(); setSelectedCompanies(current => current.filter(item => item !== company)); }}><X size={14} aria-hidden="true" /></button>
                        </span>
                      ))}
                    </span>
                  ) : <span>Choose one or more companies</span>}
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
            <label className="field field-wide upload-field"><span>Resume <b>*</b></span><div className="upload-control"><FileUp size={19} /><input type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required onChange={() => setFileError("")} /><small>PDF or Word document · up to 4 MB</small></div></label>
            {/* Honeypot: hidden from people, filled in by bots. */}
            <input className="hp-field" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          </div>
          {fileError && <p className="form-error" role="alert">{fileError}</p>}
          <label className="consent-row"><input type="checkbox" required /><span>I agree to share these details and my resume with Abhinav for this referral request.</span></label>
          {notice && <p className="form-note" role="status">{notice}</p>}
          <div className="form-footer"><button className="button" type="submit" disabled={closed || sending}>{sending ? "Sending…" : "Submit referral"} <ArrowUpRight size={15} /></button><p>Your details go to Abhinav only. A referral is not guaranteed.</p></div>
        </form>
        </div>
        <section className="faq" aria-labelledby="faq-title">
          <h2 id="faq-title">FAQ</h2>
          {/* Native <details>: answers stay in the HTML for search engines and work without JavaScript. */}
          <div className="faq-list">
            {referralFaq.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary><h3>{item.question}</h3><ChevronDown size={18} aria-hidden="true" /></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
        </div>
      </main>
    </SiteShell>
  );
}
