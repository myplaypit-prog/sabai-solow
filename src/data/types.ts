export type Region = '북부' | '동북부' | '중부' | '서부' | '걸프' | '동부' | '안다만';
export type SeasonBadge = 'rec' | 'warn' | 'save';
export type Interest = 'temple' | 'cafe' | 'nature' | 'sea' | 'yoga' | 'work';
export type TransportMode = 'train' | 'night_train' | 'bus' | 'night_bus' | 'minivan' | 'ferry' | 'flight' | 'songthaew';

export interface City {
  id: string; name: string; thai: string; region: Region; lat: number; lng: number;
  solo: number; stay: string; summary: string; point: string; highlights: string[];
  photo: string; mountainRoad?: boolean; tours: TourType[];
}
export interface TransportOption { mode: TransportMode; label: string; hours: number; hoursText: string; overnight?: boolean; ladies?: boolean; note?: string; seasonal?: string; }
export interface Leg { from: string; to: string; options: TransportOption[]; }
export interface CourseStop { city: string; nights: number; }
export interface Course {
  id: string; name: string; days: number; stops: CourseStop[]; start: string; end: string; route: string; transport: string;
  interests: Interest[]; regions: Region[]; photo: string;
  /** 카드용 감성 카피: tagline(영문 한 줄) · title(제목) · copy(2문장) · area(사진 위 위치) · mood(분위기 태그) · feats(특징 2개: [아이콘, 글]) */
  tagline: string; title: string; copy: string; area: string; mood: string; feats: [string, string][];
}
export type TourType = 'elephant' | 'cooking' | 'zipline' | 'trekking';
export interface Tour {
  id: TourType; name: string; cities: string[]; photo: string; photo2: string; duration: string; priceBand: string;
  what: string; prepare: string[]; cautions: string[]; highlights: string[]; rainyCaution?: string; noRiding?: boolean;
  links: { name: string; url: string }[];
}
export type EventType = 'no_alcohol' | 'festival' | 'holiday';
export interface CalendarEvent {
  id: string; type: EventType; title: string; dateText: string; from?: string; to?: string; months?: number[];
  cities: string[] | 'all'; message: string; impact?: string; photo?: string;
}
export interface SeasonTip { id: string; period: string; sub?: string; months: number[]; badge: SeasonBadge; badgeText: string; weather: string; price: string; pros: string; cons: string; quote: string; photo: string; recommend?: string[]; }
/** sample: 테스트용 임시 데이터(실제 숙소 아님). 정식 데이터로 바꿀 때 false로 두고 값을 채웁니다. */
export interface Stay { id: string; city: string; name: string; band: 1 | 2 | 3; rating: string; reviews: string; price: number; priceKrw: string; priceThb: string; site: string; checkedOn: string; distance: string; tags: string[]; photo: string; sample: boolean; }
