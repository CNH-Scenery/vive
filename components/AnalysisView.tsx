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
    <div className="animate-in space-y-6 pb-12 fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Generated Image Section */}
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
        <div className="border-b border-zinc-800 p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#D4AF37]">
            <Sparkles className="h-4 w-4" />
            AI 시뮬레이션 결과
          </h2>
          <p className="mt-1 text-[11px] text-gray-500">
            고객님의 현재 모발을 바탕으로 스타일을 적용했습니다.
          </p>
        </div>
        <div className="flex justify-center bg-[#0A0A0A] p-5">
          {generatedImage ? (
            <div className="w-full max-w-sm space-y-3">
              <div className="group relative w-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-[#D4AF37]/30">
                <img src={generatedImage} alt="AI 생성 헤어 스타일 미리보기" className="h-auto w-full" />
              </div>

              {previewWarning && (
                <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <AlertTriangle className="mt-0.5 h-3 w-3 flex-none" />
                  <div>
                    <p className="font-semibold mb-1">참고 사항</p>
                    <p className="opacity-80 leading-relaxed">{previewWarning}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50 text-xs text-gray-500">
              이미지 생성에 실패했습니다.
            </div>
          )}
        </div>
      </section>

      {/* Analysis Details */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg">
        <h3 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-gray-200">
          <Ruler className="h-4 w-4 text-[#D4AF37]" />
          스타일 진단서
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-zinc-800/50 pb-3">
            <span className="text-[11px] font-medium text-gray-500 w-24 flex-shrink-0 mt-0.5">필요 기장</span>
            <p className="text-sm text-gray-300 text-right">{analysis.growthAdvice}</p>
          </div>
          <div className="flex justify-between items-start border-b border-zinc-800/50 pb-3">
            <span className="text-[11px] font-medium text-gray-500 w-24 flex-shrink-0 mt-0.5">시술 방법</span>
            <div className="text-right">
              <span className="inline-block mb-1 rounded bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-semibold text-[#D4AF37]">
                {techniqueMap[analysis.technique] || analysis.technique}
              </span>
              <p className="text-sm text-gray-300">{analysis.techniqueDetails}</p>
            </div>
          </div>
          <div className="flex justify-between items-start border-b border-zinc-800/50 pb-3">
            <span className="text-[11px] font-medium text-gray-500 w-24 flex-shrink-0 mt-0.5">관리 난이도</span>
            <p className="text-sm text-gray-300 text-right">{analysis.difficultyLevel}</p>
          </div>
        </div>
      </section>

      {/* Stylist Script */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg">
        <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-gray-200">
          <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
          디자이너 소통 가이드
        </h3>
        <p className="mb-3 text-[11px] text-gray-500">
          담당 디자이너에게 아래 내용을 보여주시면 더 정확한 상담이 가능합니다.
        </p>
        <div className="rounded-xl border border-zinc-700 bg-[#0A0A0A] p-4">
          <p className="leading-relaxed text-[13px] text-gray-300">"{analysis.stylistScript}"</p>
        </div>
      </section>

      {/* Salons */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-gray-200">
            <MapPin className="h-4 w-4 text-[#D4AF37]" />
            추천 제휴 살롱
          </h3>
          <p className="mt-1 text-[11px] text-gray-500">
            현재 위치 주변에서 해당 스타일 시술이 가능한 미용실입니다.
          </p>
        </div>

        {salons.length > 0 ? (
          <div className="space-y-3">
            {salons.map((salon, index) => (
              <div
                key={`${salon.name}-${index}`}
                className="flex flex-col rounded-xl border border-zinc-800 bg-[#0A0A0A] p-4"
              >
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-200 text-sm">{salon.name}</h4>
                  <p className="mt-1 text-[11px] text-gray-500">{salon.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleMapClick('naver', salon.name)}
                    className="flex items-center justify-center gap-1.5 rounded bg-[#03C75A]/20 py-2 text-[11px] font-bold text-[#03C75A] transition-colors hover:bg-[#03C75A]/30"
                  >
                    네이버 지도
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMapClick('kakao', salon.name)}
                    className="flex items-center justify-center gap-1.5 rounded bg-[#FEE500]/20 py-2 text-[11px] font-bold text-[#FEE500] transition-colors hover:bg-[#FEE500]/30"
                  >
                    카카오 맵
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-700 bg-[#0A0A0A] py-6 text-center">
            <MapPin className="mx-auto mb-2 h-5 w-5 text-gray-600" />
            <p className="text-[11px] text-gray-500">
              주변 미용실 정보를 불러오지 못했습니다.
            </p>
          </div>
        )}
      </section>

      <div className="flex justify-center pt-4 pb-8">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-zinc-700 px-6 py-2.5 text-[13px] font-medium text-gray-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          처음으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;
