import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, signup, markVerified, resetPassword, pwRule, emailRule } from '../lib/auth';
import { useApp } from '../state';
import { Icon } from '../components/Icon';
import { Kicker, Logo, Photo } from '../components/ui';

function Field({ id, label, type, value, onChange, icon, hint, error, autoComplete }: { id: string; label: string; type: string; value: string; onChange: (v: string) => void; icon: string; hint?: string; error?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-extrabold">{label}</label>
      <div className={`field ${error ? '!shadow-[inset_0_0_0_2px_rgb(var(--chili-d))]' : ''}`}><span className="text-muted"><Icon name={icon} /></span>
        <input id={id} type={type === 'password' && show ? 'text' : type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={hint || error ? `${id}-d` : undefined} />
        {type === 'password' && <button type="button" onClick={() => setShow(!show)} aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'} className="w-11 h-11 grid place-items-center"><Icon name="eye" /></button>}</div>
      {(error || hint) && <span id={`${id}-d`} className={`text-sm flex gap-1.5 items-center ${error ? 'text-chili-d font-bold' : 'text-muted'}`}><Icon name={error ? 'alert' : 'info'} size={16} />{error ?? hint}</span>}
    </div>
  );
}
function Social() {
  const { toast } = useApp();
  return (<>{[['Google', 'G'], ['네이버', 'N']].map(([n, m]) => (
    <button key={n} type="button" aria-disabled="true" onClick={() => toast('준비 중인 기능이에요')} className="w-full min-h-14 px-[18px] rounded-full shadow-[inset_0_0_0_1.5px_rgb(var(--ink)/.35)] flex items-center gap-3 font-bold">
      <span className="w-7 h-7 rounded-full bg-sand grid place-items-center font-grot font-extrabold text-[15px]">{m}</span><span className="flex-1 text-left">{n}로 계속하기</span><span className="px-2.5 py-1 rounded-full bg-putty text-[13px] font-extrabold">준비 중</span></button>))}</>);
}
const Notice = () => <p className="m-0 p-4 rounded-2xl bg-mint text-sm leading-normal flex gap-2.5"><Icon name="shield" size={18} /><span>테스트용 계정이며 이 기기에만 저장돼요. 실제로 쓰는 비밀번호는 넣지 마세요.</span></p>;

function AuthFrame({ kicker, title, sub, children }: { kicker: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <main className="flex-1 lg:flex lg:min-h-[900px]">
      <div className="relative h-[260px] m-2 lg:m-4 lg:mr-0 lg:h-auto lg:flex-1 rounded-[28px] lg:rounded-[40px] overflow-hidden">
        <Photo k="train" eager />
        <div className="absolute left-3.5 top-3.5 lg:left-8 lg:top-7 z-[4] px-3.5 py-2.5 lg:px-5 lg:py-3.5 rounded-2xl lg:rounded-[20px] bg-cloud"><Logo size={22} /></div>
        <div className="absolute left-5 right-5 bottom-4 lg:left-10 lg:bottom-10 z-[4] flex flex-col gap-3.5 text-[#FFFCF5]"><span className="serif-i text-5xl lg:text-[88px] leading-[.95] [text-shadow:0_2px_24px_rgba(0,0,0,.4)]">slow &amp; solo</span><span className="hidden lg:inline self-start px-4 py-2.5 rounded-full bg-[rgba(42,27,20,.72)] font-bold">창밖으로 강이 흐르는, 혼자만의 기차 여행</span></div>
      </div>
      <div className="w-full lg:w-[600px] px-4 lg:px-[88px] py-7 lg:py-14 flex flex-col justify-center gap-6 lg:gap-8 box-border">
        <div className="flex flex-col gap-2.5"><Kicker>{kicker}</Kicker><h1 className="m-0 text-[34px] lg:text-[52px] leading-[1.12] font-extrabold tracking-[-0.05em]">{title}</h1>{sub && <p className="m-0 text-[17px] leading-relaxed text-muted">{sub}</p>}</div>
        {children}
      </div>
    </main>
  );
}

export function Login() {
  const nav = useNavigate(); const loc = useLocation(); const { refresh } = useApp();
  const next = (loc.state as { next?: string } | null)?.next ?? '/plan';
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState<string>(); const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => { e.preventDefault(); setErr(undefined); if (!emailRule(email)) return setErr('이메일 형식을 확인해 주세요.'); setBusy(true);
    try { const u = await login(email, pw); await refresh(); nav(u.verified ? next : '/verify', { replace: true, state: { next } }); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); } };
  return (
    <AuthFrame kicker="Log in" title="다시 떠날 준비됐나요?" sub="로그인하면 계획을 저장하고 오프라인에서도 볼 수 있어요.">
      <form onSubmit={submit} className="flex flex-col gap-[18px]" noValidate>
        <Field id="email" label="이메일" type="email" value={email} onChange={setEmail} icon="mail" autoComplete="email" />
        <Field id="pw" label="비밀번호" type="password" value={pw} onChange={setPw} icon="lock" autoComplete="current-password" error={err} />
        <div className="flex justify-end"><Link to="/reset-password" className="min-h-11 inline-flex items-center font-bold text-[15px]">비밀번호 찾기</Link></div>
        <button type="submit" disabled={busy} className="btn btn-lagoon h-[60px] text-lg">{busy ? '확인 중…' : '로그인'}<Icon name="arrow" sw={2.4} /></button>
        <div className="flex items-center gap-3 text-sm text-muted"><span className="flex-1 h-[1.5px] bg-ink/20" />또는<span className="flex-1 h-[1.5px] bg-ink/20" /></div>
        <Social />
        <p className="m-0 text-center">처음이신가요? <Link to="/signup" state={{ next }} className="font-extrabold text-lagoon underline">이메일로 가입하기</Link></p>
        <Notice />
      </form>
    </AuthFrame>
  );
}

export function Signup() {
  const nav = useNavigate(); const loc = useLocation(); const { refresh } = useApp();
  const next = (loc.state as { next?: string } | null)?.next ?? '/plan';
  const [f, setF] = useState({ email: '', pw: '', pw2: '', terms: false, privacy: false, mkt: false });
  const [err, setErr] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => { e.preventDefault(); const er: Record<string, string> = {};
    if (!emailRule(f.email)) er.email = '이메일 형식을 확인해 주세요.'; if (!pwRule(f.pw)) er.pw = '8자 이상, 영문과 숫자를 함께 넣어 주세요.'; if (f.pw !== f.pw2) er.pw2 = '비밀번호가 서로 달라요.'; if (!f.terms || !f.privacy) er.terms = '필수 약관에 동의해 주세요.';
    setErr(er); if (Object.keys(er).length) return; setBusy(true);
    try { await signup(f.email, f.pw); await refresh(); nav('/verify', { state: { next } }); } catch (x) { setErr({ email: (x as Error).message }); } finally { setBusy(false); } };
  const Chk = ({ k, label }: { k: 'terms' | 'privacy' | 'mkt'; label: string }) => <label className="flex gap-3 items-center min-h-11 font-semibold"><input type="checkbox" checked={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} className="w-[22px] h-[22px] accent-[rgb(var(--lagoon))]" />{label}</label>;
  return (
    <AuthFrame kicker="Sign up" title="이메일로 가입하기">
      <form onSubmit={submit} className="flex flex-col gap-[18px]" noValidate>
        <Field id="su-email" label="이메일" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} icon="mail" error={err.email} autoComplete="email" />
        <Field id="su-pw" label="비밀번호" type="password" value={f.pw} onChange={(v) => setF({ ...f, pw: v })} icon="lock" hint="8자 이상, 영문·숫자 포함" error={err.pw} autoComplete="new-password" />
        <Field id="su-pw2" label="비밀번호 확인" type="password" value={f.pw2} onChange={(v) => setF({ ...f, pw2: v })} icon="lock" error={err.pw2} autoComplete="new-password" />
        <fieldset className="m-0 p-0 border-0 flex flex-col"><legend className="sr-only">약관 동의</legend><Chk k="terms" label="(필수) 이용약관 동의" /><Chk k="privacy" label="(필수) 개인정보 수집·이용 동의" /><Chk k="mkt" label="(선택) 여행 소식 받기" />{err.terms && <span className="text-sm font-bold text-chili-d">{err.terms}</span>}</fieldset>
        <button type="submit" disabled={busy} className="btn btn-lagoon h-[60px] text-lg">가입하기<Icon name="arrow" sw={2.4} /></button>
        <p className="m-0 text-center">이미 계정이 있나요? <Link to="/login" state={{ next }} className="font-extrabold text-lagoon underline">로그인</Link></p>
        <Notice />
      </form>
    </AuthFrame>
  );
}

export function Verify() {
  const { user, refresh, toast } = useApp(); const nav = useNavigate(); const loc = useLocation();
  const next = (loc.state as { next?: string } | null)?.next ?? '/plan';
  return (
    <AuthFrame kicker="Verify email" title="메일함을 확인해 주세요" sub={`${user?.email ?? '가입한 이메일'}로 인증 링크를 보냈다고 가정해요. 프로토타입이라 실제 메일은 가지 않아요.`}>
      <div className="flex flex-col gap-3">
        <button type="button" onClick={async () => { if (!user) return nav('/login'); await markVerified(user.id); await refresh(); toast('인증을 마쳤어요'); nav(next, { replace: true }); }} className="btn btn-lagoon h-[60px] text-lg">인증 완료로 처리(테스트)<Icon name="check" sw={2.6} /></button>
        <button type="button" onClick={() => toast('인증 메일을 다시 보냈다고 가정할게요')} className="btn btn-line h-14">인증 메일 다시 보내기</button>
        <Notice />
      </div>
    </AuthFrame>
  );
}

export function Reset() {
  const { toast } = useApp(); const nav = useNavigate();
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState<string>();
  const submit = async (e: FormEvent) => { e.preventDefault(); if (!pwRule(pw)) return setErr('8자 이상, 영문과 숫자를 함께 넣어 주세요.'); try { await resetPassword(email, pw); toast('새 비밀번호로 바꿨어요'); nav('/login'); } catch (x) { setErr((x as Error).message); } };
  return (
    <AuthFrame kicker="Reset password" title="비밀번호 다시 정하기" sub="프로토타입에서는 메일 링크 대신 이 화면에서 바로 바꿔요.">
      <form onSubmit={submit} className="flex flex-col gap-[18px]" noValidate>
        <Field id="rs-email" label="이메일" type="email" value={email} onChange={setEmail} icon="mail" />
        <Field id="rs-pw" label="새 비밀번호" type="password" value={pw} onChange={setPw} icon="lock" hint="8자 이상, 영문·숫자 포함" error={err} />
        <button type="submit" className="btn btn-lagoon h-[60px] text-lg">비밀번호 바꾸기</button>
      </form>
    </AuthFrame>
  );
}
