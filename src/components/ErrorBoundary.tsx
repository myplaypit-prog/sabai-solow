import { Component, type ReactNode } from 'react';
import { Icon } from './Icon';

/** 화면 하나가 오류로 멈춰도 머리·바닥 메뉴는 남기고, 다시 시도할 길을 보여줘요 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { console.error(e); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="wrap gutter py-16 lg:py-24 flex-1 flex flex-col items-center text-center gap-5" role="alert">
        <span className="w-16 h-16 rounded-2xl bg-mango-t text-mango-d grid place-items-center"><Icon name="alert" size={30} /></span>
        <h1 className="m-0 text-[28px] lg:text-[36px] font-extrabold tracking-[-0.02em]">화면을 불러오지 못했어요</h1>
        <p className="m-0 max-w-[480px] text-[16px] leading-relaxed text-slate">잠깐 문제가 생겼어요. 저장한 일정은 이 기기에 그대로 있어요. 다시 불러오거나 홈으로 돌아가 주세요.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={() => location.reload()} className="btn btn-primary"><Icon name="route" size={18} />다시 불러오기</button>
          <a href="#/" onClick={() => this.setState({ failed: false })} className="btn btn-line">홈으로</a>
        </div>
      </main>
    );
  }
}
