import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  Check,
  GraduationCap,
  HeartPulse,
  Info,
  Landmark,
  LoaderCircle,
  ShoppingBag,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { ApiError, generateResearch } from "../lib/api";
import type { Complexity, Domain, GenerateInput } from "../lib/types";

const DOMAINS: { value: Domain; description: string; icon: typeof HeartPulse }[] = [
  { value: "Healthcare", description: "Clinical, hospital, or patient workflows", icon: HeartPulse },
  { value: "Education", description: "Learning, assessment, or campus systems", icon: GraduationCap },
  { value: "Finance", description: "Payments, accounts, risk, or compliance", icon: Landmark },
  { value: "E-commerce", description: "Catalog, checkout, orders, or sellers", icon: ShoppingBag },
  { value: "Other", description: "A specialized domain or internal tool", icon: Boxes },
];

const COMPLEXITIES: { value: Complexity; description: string }[] = [
  { value: "Basic", description: "Focused first release" },
  { value: "Intermediate", description: "Balanced production scope" },
  { value: "Advanced", description: "Broader platform vision" },
];

const SECTION_PREVIEW = [
  "Problem statement",
  "Project overview",
  "Target users",
  "Proposed features",
  "Functional requirements",
  "Non-functional requirements",
  "Technology stack",
  "API design",
  "Database entities",
  "Risks and limitations",
  "Future scope",
];

type FormErrors = Partial<Record<"title" | "idea" | "domain" | "complexity", string>>;

const EMPTY_FORM: GenerateInput = {
  title: "",
  idea: "",
  domain: "Healthcare",
  complexity: "Intermediate",
};

export function NewResearch() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState<GenerateInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof GenerateInput>(key: K, value: GenerateInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setServerError("");
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (form.title.trim().length < 3) {
      next.title = "Give the project a title of at least 3 characters.";
    }
    if (form.idea.trim().length < 20) {
      next.idea = "Describe the problem in at least 20 characters so the blueprint has enough context.";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      addToast("Please fix the highlighted fields.", "error");
      document.getElementById(nextErrors.title ? "project-title" : "project-idea")?.focus();
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const project = await generateResearch({
        ...form,
        title: form.title.trim(),
        idea: form.idea.trim(),
      });
      addToast("Blueprint generated. Review the report and architecture.", "success");
      navigate(`/projects/${project.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        const mapped: FormErrors = {};
        for (const field of error.fields) {
          const key = field.field.split(".").pop();
          if (key === "title" || key === "idea" || key === "domain" || key === "complexity") {
            mapped[key] = field.message;
          }
        }
        setErrors(mapped);
        setServerError(error.message);
        addToast(error.message, "error");
      } else {
        setServerError("Unexpected error while generating the blueprint. Please try again.");
        addToast("Generation failed. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page new-research-page">
      <PageHeader
        eyebrow="Guided intake"
        title="New research project"
        description="Give the generator enough context to produce a useful first draft. You can refine the scope after reviewing the blueprint."
      />

      <div className="new-research-grid">
        <form className="research-form" onSubmit={handleSubmit} noValidate>
          <div className="panel form-card">
            <div className="form-card-head">
              <span className="step-chip">01</span>
              <div>
                <h2>Project essentials</h2>
                <p>Required context for the blueprint.</p>
              </div>
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="project-title">Project title</label>
                <span>{form.title.length}/120</span>
              </div>
              <input
                id="project-title"
                type="text"
                value={form.title}
                maxLength={120}
                placeholder="e.g. CareFlow Hospital Platform"
                className={errors.title ? "input input-error" : "input"}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : undefined}
                onChange={(event) => updateField("title", event.target.value)}
              />
              {errors.title && (
                <p className="field-error" id="title-error" role="alert">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="project-idea">Project idea or problem statement</label>
                <span>{form.idea.length}/4000</span>
              </div>
              <textarea
                id="project-idea"
                value={form.idea}
                maxLength={4000}
                rows={6}
                placeholder="An AI-powered hospital management platform that manages appointments, patient records, diagnostics, and doctor workflows."
                className={errors.idea ? "input textarea input-error" : "input textarea"}
                aria-invalid={Boolean(errors.idea)}
                aria-describedby={errors.idea ? "idea-error" : "idea-hint"}
                onChange={(event) => updateField("idea", event.target.value)}
              />
              {errors.idea ? (
                <p className="field-error" id="idea-error" role="alert">
                  {errors.idea}
                </p>
              ) : (
                <p className="field-hint" id="idea-hint">
                  Describe who has the problem, what is broken today, and the outcome you want.
                </p>
              )}
            </div>
          </div>

          <div className="panel form-card">
            <div className="form-card-head">
              <span className="step-chip">02</span>
              <div>
                <h2>Domain and depth</h2>
                <p>Domain templates shape features, data, and risks.</p>
              </div>
            </div>

            <fieldset className="field fieldset">
              <legend>Domain</legend>
              <div className="option-grid domain-grid">
                {DOMAINS.map((domain) => {
                  const Icon = domain.icon;
                  const selected = form.domain === domain.value;
                  return (
                    <label key={domain.value} className={`option-card ${selected ? "option-card-selected" : ""}`}>
                      <input
                        type="radio"
                        name="domain"
                        value={domain.value}
                        checked={selected}
                        onChange={() => updateField("domain", domain.value)}
                        className="sr-only"
                      />
                      <span className="option-icon">
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span className="option-copy">
                        <strong>{domain.value}</strong>
                        <small>{domain.description}</small>
                      </span>
                      <span className="option-check" aria-hidden="true">
                        {selected && <Check size={12} />}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.domain && (
                <p className="field-error" role="alert">
                  {errors.domain}
                </p>
              )}
            </fieldset>

            <fieldset className="field fieldset">
              <legend>Complexity</legend>
              <div className="option-grid complexity-grid">
                {COMPLEXITIES.map((complexity) => {
                  const selected = form.complexity === complexity.value;
                  return (
                    <label
                      key={complexity.value}
                      className={`option-card option-card-compact ${selected ? "option-card-selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="complexity"
                        value={complexity.value}
                        checked={selected}
                        onChange={() => updateField("complexity", complexity.value)}
                        className="sr-only"
                      />
                      <span className="option-copy">
                        <strong>{complexity.value}</strong>
                        <small>{complexity.description}</small>
                      </span>
                      <span className="option-check" aria-hidden="true">
                        {selected && <Check size={12} />}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.complexity && (
                <p className="field-error" role="alert">
                  {errors.complexity}
                </p>
              )}
            </fieldset>

            {serverError && (
              <div className="form-server-error" role="alert">
                <Info size={15} aria-hidden="true" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="form-submit-row">
              <button type="submit" className="btn btn-primary btn-generate" disabled={submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle size={17} className="spin" aria-hidden="true" />
                    Generating blueprint...
                  </>
                ) : (
                  <>
                    <WandSparkles size={17} aria-hidden="true" />
                    Generate Blueprint
                  </>
                )}
              </button>
              <p>Deterministic generation. No API key required.</p>
            </div>
          </div>
        </form>

        <aside className="research-aside">
          <div className="panel aside-card">
            <div className="aside-card-head">
              <span className="aside-icon">
                <Sparkles size={16} aria-hidden="true" />
              </span>
              <h2>What you&apos;ll get</h2>
            </div>
            <p className="aside-lead">A structured report with 11 sections, exportable as Markdown.</p>
            <ul className="check-list">
              {SECTION_PREVIEW.map((section, index) => (
                <li key={section}>
                  <span className="check-mark">
                    <Check size={11} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="check-index">{String(index + 1).padStart(2, "0")}</span>
                    {section}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="honesty-note">
            <Info size={17} aria-hidden="true" />
            <div>
              <strong>No hidden AI calls</strong>
              <p>
                The default engine uses deterministic templates. It does not browse the web, call an
                LLM, or run agents. Advanced capabilities are labeled Planned.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
