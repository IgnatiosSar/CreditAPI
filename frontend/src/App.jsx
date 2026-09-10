import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import axios from 'axios'; // Προστέθηκε το Axios

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

const JOB_OPTIONS = [
  { value: 0, label: 'Unskilled, non-resident' },
  { value: 1, label: 'Unskilled, resident' },
  { value: 2, label: 'Skilled' },
  { value: 3, label: 'Highly skilled' },
];

const HOUSING_OPTIONS = [
  { value: 'own', label: 'Own' },
  { value: 'rent', label: 'Rent' },
  { value: 'free', label: 'Provided' },
];

const SAVINGS_OPTIONS = [
  { value: 'little', label: 'Modest' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'quite rich', label: 'Comfortable' },
  { value: 'rich', label: 'Substantial' },
];

const CHECKING_OPTIONS = [
  { value: 'little', label: 'Modest' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'rich', label: 'Well-funded' },
];

const PURPOSE_OPTIONS = [
  { value: 'car', label: 'Car' },
  { value: 'radio/TV', label: 'Radio / TV' },
  { value: 'furniture/equipment', label: 'Furniture / equipment' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'domestic appliances', label: 'Domestic appliances' },
  { value: 'repairs', label: 'Repairs' },
  { value: 'vacation/others', label: 'Vacation / other' },
];

const STEPS = ['About you', 'Housing & accounts', 'The loan', 'Review'];

const INITIAL_FORM = {
  age: '',
  sex: '',
  job: '',
  housing: '',
  savingAccounts: '',
  checkingAccount: '',
  purpose: '',
  creditAmount: '',
  duration: 24,
};

function validateStep(step, form) {
  const errors = {};
  if (step === 0) {
    const age = Number(form.age);
    if (!form.age || Number.isNaN(age) || age < 18 || age > 100) {
      errors.age = 'Enter an age between 18 and 100.';
    }
    if (!form.sex) errors.sex = 'Select one.';
    if (form.job === '') errors.job = 'Select one.';
  }
  if (step === 1) {
    if (!form.housing) errors.housing = 'Select one.';
    if (!form.savingAccounts) errors.savingAccounts = 'Select one.';
    if (!form.checkingAccount) errors.checkingAccount = 'Select one.';
  }
  if (step === 2) {
    if (!form.purpose) errors.purpose = 'Select one.';
    const amount = Number(form.creditAmount);
    if (!form.creditAmount || Number.isNaN(amount) || amount <= 0) {
      errors.creditAmount = 'Enter an amount greater than 0.';
    }
  }
  return errors;
}

function FieldLabel({ children, error }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <span className="text-sm text-stone-700">{children}</span>
      {error && <span className="text-xs text-red-800">{error}</span>}
    </div>
  );
}

function PillGroup({ options, value, onChange, columns = 3 }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-md border px-3 py-2.5 text-sm text-left transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1 ${
              active
                ? 'border-emerald-800 bg-emerald-800 text-white'
                : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function StepRail({ current }) {
  return (
    <div className="flex items-start">
      {STEPS.map((label, i) => (
        <div key={label} className={`flex flex-col items-start ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
          
          <div className="flex w-full items-center">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${
                i < current
                  ? 'border-emerald-800 bg-emerald-800 text-white'
                  : i === current
                  ? 'border-emerald-800 text-emerald-800'
                  : 'border-stone-300 text-stone-400'
              }`}
            >
              {i < current ? <Check size={15} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative mx-3 h-px flex-1 bg-stone-300">
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-800 transition-all duration-500 motion-reduce:transition-none"
                  style={{ width: i < current ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
          <span className={`mt-2 text-sm leading-tight ${i === current ? 'text-stone-900' : 'text-stone-500'}`}>
            {label}
          </span>
          
        </div>
      ))}
    </div>
  );
}

function ScoreScale({ percent, approved }) {
  const threshold = 50;
  return (
    <div className="mt-6">
      <div className="relative h-2 rounded-full overflow-hidden bg-stone-200">
        <div className="absolute inset-y-0 left-0 bg-red-700" style={{ width: `${threshold}%` }} />
        <div className="absolute inset-y-0 right-0 bg-emerald-700" style={{ width: `${100 - threshold}%` }} />
        <div className="absolute inset-y-0 w-px bg-stone-600" style={{ left: `${threshold}%` }} />
      </div>
      <div className="relative h-0">
        <div
          className={`absolute top-0 h-5 w-5 rounded-full border-2 border-white shadow-sm transition-all duration-700 ease-out motion-reduce:transition-none ${
            approved ? 'bg-emerald-700' : 'bg-red-800'
          }`}
          style={{ left: `${percent}%`, transform: 'translate(-50%, -70%)' }}
        />
      </div>
      <div className="mt-3 flex justify-between font-mono text-xs text-stone-400">
        <span>0</span>
        <span>Threshold</span>
        <span>100</span>
      </div>
    </div>
  );
}

export default function LoanApplication() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('form'); 
  const [result, setResult] = useState(null);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const goNext = () => {
    const stepErrors = validateStep(step, form);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const goBack = () => {
    setErrors({});
    if (step > 0) setStep(step - 1);
  };


  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const res = await axios.post('/api/credit/predict', {
        age: Number(form.age),
        sex: form.sex,
        job: form.job,
        housing: form.housing,
        saving_accounts: form.savingAccounts,
        checking_account: form.checkingAccount,
        credit_amount: Number(form.creditAmount),
        duration: Number(form.duration),
        purpose: form.purpose,
      });

      setResult({ 
        probability_good: res.data.probability_good, 
        is_approved: res.data.is_approved 
      });
      setStatus('result');
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to submit the application. Please try again later.");
      setStatus('form');
    }
  };

  const reset = () => {
    setForm(INITIAL_FORM);
    setStep(0);
    setErrors({});
    setStatus('form');
    setResult(null);
  };

  return (
    <div
      className="min-h-screen w-full bg-stone-100 px-4 py-10 sm:py-16"
      style={{ fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <style>{`@import url('${FONT_IMPORT_URL}');`}</style>

      <div className="mx-auto max-w-xl">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl text-stone-900" style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
            Credit API
          </h1>
          <p className="mt-1 text-base text-stone-500 mb-1">Find out if you are eligible for a loan</p>
        </header>

        {status !== 'result' && (
          <div className="mb-8">
            <StepRail current={step} />
          </div>
        )}

        <div className="rounded-lg border border-stone-300 bg-white p-6 sm:p-8">
          {status === 'form' && step === 0 && (
            <div className="space-y-6">
              <div>
                <FieldLabel error={errors.age}>Age</FieldLabel>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => update({ age: e.target.value })}
                  placeholder="e.g. 34"
                  className="w-full rounded-md border border-stone-300 px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
              <div>
                <FieldLabel error={errors.sex}>Sex</FieldLabel>
                <PillGroup
                  columns={2}
                  options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
                  value={form.sex}
                  onChange={(sex) => update({ sex })}
                />
              </div>
              <div>
                <FieldLabel error={errors.job}>Occupation</FieldLabel>
                <PillGroup columns={1} options={JOB_OPTIONS} value={form.job} onChange={(job) => update({ job })} />
              </div>
            </div>
          )}

          {status === 'form' && step === 1 && (
            <div className="space-y-6">
              <div>
                <FieldLabel error={errors.housing}>Housing</FieldLabel>
                <PillGroup columns={3} options={HOUSING_OPTIONS} value={form.housing} onChange={(housing) => update({ housing })} />
              </div>
              <div>
                <FieldLabel error={errors.savingAccounts}>Savings account balance</FieldLabel>
                <PillGroup columns={2} options={SAVINGS_OPTIONS} value={form.savingAccounts} onChange={(savingAccounts) => update({ savingAccounts })} />
              </div>
              <div>
                <FieldLabel error={errors.checkingAccount}>Checking account balance</FieldLabel>
                <PillGroup columns={2} options={CHECKING_OPTIONS} value={form.checkingAccount} onChange={(checkingAccount) => update({ checkingAccount })} />
              </div>
            </div>
          )}

          {status === 'form' && step === 2 && (
            <div className="space-y-6">
              <div>
                <FieldLabel error={errors.purpose}>What is the loan for?</FieldLabel>
                <PillGroup columns={2} options={PURPOSE_OPTIONS} value={form.purpose} onChange={(purpose) => update({ purpose })} />
              </div>
              <div>
                <FieldLabel error={errors.creditAmount}>Amount requested</FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">€</span>
                  <input
                    type="number"
                    value={form.creditAmount}
                    onChange={(e) => update({ creditAmount: e.target.value })}
                    placeholder="2000"
                    className="w-full rounded-md border border-stone-300 pl-7 pr-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Term</FieldLabel>
                <input
                  type="range"
                  min="3"
                  max="72"
                  value={form.duration}
                  onChange={(e) => update({ duration: e.target.value })}
                  className="w-full accent-emerald-800"
                />
                <div className="mt-2 flex items-baseline gap-1">
                  <span 
                    className="text-xl font-semibold text-emerald-900" 
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {form.duration}
                  </span>
                  <span className="text-sm text-stone-500">months</span>
                </div>
              </div> 
            </div>
          )}

          {status === 'form' && step === 3 && (
            <div>
              <p className="text-sm text-stone-500 mb-4">Review before you submit.</p>
              <dl className="divide-y divide-stone-200 text-sm">
                {[
                  ['Age', form.age],
                  ['Sex', form.sex],
                  ['Occupation', JOB_OPTIONS.find((o) => o.value === form.job)?.label],
                  ['Housing', HOUSING_OPTIONS.find((o) => o.value === form.housing)?.label],
                  ['Savings', SAVINGS_OPTIONS.find((o) => o.value === form.savingAccounts)?.label],
                  ['Checking', CHECKING_OPTIONS.find((o) => o.value === form.checkingAccount)?.label],
                  ['Purpose', PURPOSE_OPTIONS.find((o) => o.value === form.purpose)?.label],
                  ['Amount', form.creditAmount ? `€${Number(form.creditAmount).toLocaleString()}` : ''],
                  ['Term', `${form.duration} months`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2.5">
                    <dt className="text-stone-500">{label}</dt>
                    <dd className="text-stone-900" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {value || '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-8 w-8 rounded-full border-2 border-stone-300 border-t-emerald-800 animate-spin motion-reduce:animate-none" />
              <p className="mt-4 text-sm text-stone-500">Weighing the application…</p>
            </div>
          )}

          {status === 'result' && result && (
            <div>
              <h2
                className={`text-2xl mb-1 ${result.is_approved ? 'text-emerald-900' : 'text-red-900'}`}
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
              >
                {result.is_approved ? 'Approved' : 'Not approved'}
              </h2>
              <p className="text-sm text-stone-500">
                {result.is_approved
                  ? 'The numbers support this loan.'
                  : 'The estimated risk is above the threshold for this amount and term.'}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl text-stone-900" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {Math.round(result.probability_good * 100)}
                </span>
                <span className="text-stone-500 text-sm">/ 100 estimated repayment likelihood</span>
              </div>

              <ScoreScale percent={Math.round(result.probability_good * 100)} approved={result.is_approved} />

              <button
                type="button"
                onClick={reset}
                className="mt-8 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 rounded px-1"
              >
                <RotateCcw size={14} />
                Start a new application
              </button>
            </div>
          )}
        </div>

        {status === 'form' && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 text-sm text-stone-600 disabled:opacity-0 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 rounded px-2 py-1"
            >
              <ArrowLeft size={15} />
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-800 px-5 py-2.5 text-sm text-white hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
              >
                Continue
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-800 px-5 py-2.5 text-sm text-white hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
              >
                Submit application
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}