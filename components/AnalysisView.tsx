import React from 'react';
import { HairAnalysis, PreviewVerification, Salon } from '../types';
import { AlertTriangle, MapPin, MessageSquare, Ruler, Sparkles } from 'lucide-react';

interface AnalysisViewProps {
  analysis: HairAnalysis;
  generatedImage: string | null;
  previewWarning: string | null;
  previewVerification: PreviewVerification | null;
  salons: Salon[];
  onReset: () => void;
}

const techniqueMap: Record<string, string> = {
  perm: '펌',
  dry: '드라이',
  cut: '커트',
  color: '염색',
};

const AnalysisView: React.FC<AnalysisViewProps> = ({
  analysis,
  generatedImage,
  previewWarning,
  previewVerification,
  salons,
  onReset,
}) => {
  const handleMapClick = (platform: 'naver' | 'kakao', salonName: string) => {
    const query = encodeURIComponent(salonName);
    const url =
      platform === 'naver'
        ? `https://map.naver.com/p/search/${query}`
        : `https://map.kakao.com/link/search/${query}`;

    window.open(url, '_blank');
  };

  return (
    <div className="mx-auto max-w-4xl animate-in space-y-8 pb-12 fade-in slide-in-from-bottom-4 duration-700">
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI 스타일 미리보기
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            현재 사진을 기준으로 요청한 헤어 스타일을 적용한 참고 이미지입니다.
          </p>
        </div>
        <div className="flex justify-center bg-slate-50 p-6">
          {generatedImage ? (
            <div className="w-full max-w-md space-y-3">
              <div className="group relative w-full overflow-hidden rounded-lg shadow-lg">
                <img src={generatedImage} alt="AI 생성 헤어 스타일 미리보기" className="h-auto w-full" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-sm font-medium text-white">AI 예측 스타일</p>
                </div>
              </div>

              {previewWarning && (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                  <div>
                    <p className="font-semibold">얼굴 보존 주의</p>
                    <p>{previewWarning}</p>
                    {previewVerification && (
                      <p className="mt-1 text-xs text-amber-800">
                        얼굴 보존 {previewVerification.identityScore}/10 · 스타일 유사도{' '}
                        {previewVerification.styleScore}/10
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-100 text-gray-400">
              이미지 생성에 실패했습니다. 텍스트 분석 결과를 확인해주세요.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Ruler className="h-5 w-5 text-blue-500" />
            스타일 분석
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                필요 기장 / 커트
              </span>
              <p className="mt-1 font-medium text-gray-800">{analysis.growthAdvice}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                시술 방법
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    analysis.technique === 'perm'
                      ? 'bg-purple-100 text-purple-700'
                      : analysis.technique === 'cut'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {techniqueMap[analysis.technique] || analysis.technique}
                </span>
                <p className="text-gray-800">{analysis.techniqueDetails}</p>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                관리 난이도
              </span>
              <p className="mt-1 text-gray-800">{analysis.difficultyLevel}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                스타일 키워드
              </span>
              <p className="mt-1 font-medium text-indigo-600">#{analysis.styleKeywords}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <MessageSquare className="h-5 w-5 text-green-500" />
            미용실 요청 가이드
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            아래 문장을 미용사에게 보여주거나 읽어주면 원하는 방향을 더 명확하게 전달할 수 있습니다.
          </p>
          <div className="rounded-xl border-l-4 border-green-400 bg-gray-50 p-4">
            <p className="leading-relaxed text-gray-800 italic">"{analysis.stylistScript}"</p>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <MapPin className="h-5 w-5 text-red-500" />
            추천 미용실
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            현재 위치 주변의 관련 미용실을 검색했습니다. 버튼을 눌러 지도에서 실제 리뷰와 예약 정보를 확인하세요.
          </p>
        </div>

        {salons.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {salons.map((salon, index) => (
              <div
                key={`${salon.name}-${index}`}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex-1">
                  <h4 className="line-clamp-2 font-bold text-gray-900">{salon.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{salon.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleMapClick('naver', salon.name)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-[#03C75A] py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#02b351]"
                  >
                    <span className="font-serif">N</span> 네이버
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMapClick('kakao', salon.name)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FEE500] py-2.5 text-sm font-bold text-[#191919] shadow-sm transition-colors hover:bg-[#ebd500]"
                  >
                    <span className="font-serif">K</span> 카카오
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">
              주변 미용실 정보를 불러오지 못했거나 위치 권한이 필요합니다.
            </p>
          </div>
        )}
      </section>

      <div className="flex justify-center pt-8">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:bg-gray-800 active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          다른 스타일 시도하기
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;
