import React from 'react';
import { HairAnalysis, Salon } from '../types';
import { Ruler, Sparkles, MessageSquare, MapPin } from 'lucide-react';

interface AnalysisViewProps {
  analysis: HairAnalysis;
  generatedImage: string | null;
  salons: Salon[];
  onReset: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, generatedImage, salons, onReset }) => {
  
  const handleMapClick = (platform: 'naver' | 'kakao', salonName: string) => {
    // Clean the salon name for better search results
    const query = encodeURIComponent(salonName);
    
    // Naver Map Search URL
    // Kakao Map Search URL
    const url = platform === 'naver' 
      ? `https://map.naver.com/p/search/${query}` 
      : `https://map.kakao.com/link/search/${query}`;
      
    window.open(url, '_blank');
  };

  const techniqueMap: Record<string, string> = {
    perm: '펌',
    dry: '드라이',
    cut: '커트',
    color: '염색'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Generated Preview */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI 시뮬레이션 결과
          </h2>
          <p className="text-sm text-gray-500 mt-1">회원님의 현재 사진 형식을 유지하며 스타일을 적용했습니다.</p>
        </div>
        <div className="p-6 bg-slate-50 flex justify-center">
          {generatedImage ? (
            <div className="relative rounded-lg overflow-hidden shadow-lg max-w-md w-full group">
               <img src={generatedImage} alt="Generated Look" className="w-full h-auto" />
               <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                 <p className="text-white text-sm font-medium">AI 예측 스타일</p>
               </div>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg border border-dashed border-gray-300">
              이미지 생성에 실패했습니다. (텍스트 분석을 확인해주세요)
            </div>
          )}
        </div>
      </section>

      {/* Analysis Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Technical Advice */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-blue-500" />
            스타일 분석
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">필요 기장 / 커트</span>
              <p className="text-gray-800 font-medium mt-1">{analysis.growthAdvice}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">시술 방법</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  analysis.technique === 'perm' ? 'bg-purple-100 text-purple-700' :
                  analysis.technique === 'cut' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {techniqueMap[analysis.technique] || analysis.technique}
                </span>
                <p className="text-gray-800">{analysis.techniqueDetails}</p>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">관리 난이도</span>
              <p className="text-gray-800 mt-1">{analysis.difficultyLevel}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">스타일 키워드</span>
              <p className="text-indigo-600 font-medium mt-1">#{analysis.styleKeywords}</p>
            </div>
          </div>
        </section>

        {/* Script for Stylist */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            미용사 요청 가이드
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            미용사에게 이 화면을 보여주거나 아래 내용을 읽어주세요. 
            전문 용어를 사용하여 원하는 바를 명확하고 정중하게 전달합니다.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-400">
            <p className="text-gray-800 italic leading-relaxed">
              "{analysis.stylistScript}"
            </p>
          </div>
        </section>
      </div>

      {/* Salon Recommendations */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
         <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              추천 미용실 ({analysis.styleKeywords} 전문)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              현재 위치(GPS) 주변의 인기 미용실을 AI가 검색했습니다. <br/>
              <span className="text-indigo-600 font-semibold">네이버/카카오 버튼</span>을 눌러 실제 리뷰와 예약 정보를 확인하세요.
            </p>
         </div>
         
          {salons.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {salons.map((salon, idx) => (
                <div key={idx} className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1 mb-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-gray-900 line-clamp-2">{salon.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {salon.address}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleMapClick('naver', salon.name)}
                      className="col-span-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#03C75A] hover:bg-[#02b351] text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <span className="font-serif">N</span> 네이버
                    </button>
                    <button 
                      onClick={() => handleMapClick('kakao', salon.name)}
                      className="col-span-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FEE500] hover:bg-[#ebd500] text-[#191919] text-sm font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <span className="font-serif">K</span> 카카오
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
               <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
               <p className="text-gray-500 text-sm">
                주변 미용실 정보를 불러올 수 없거나, 위치 권한이 필요합니다.
              </p>
            </div>
          )}
      </section>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold shadow-lg hover:bg-gray-800 transition-transform active:scale-95 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          다른 스타일 시도하기
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;