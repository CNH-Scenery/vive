import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[100dvh] bg-[#111111] font-sans text-gray-100 flex flex-col items-center">
            {/* Mobile App Container Constraint */}
            <div className="w-full max-w-md h-[100dvh] flex flex-col relative bg-[#111111] overflow-hidden shadow-2xl">
                
                {/* Background Image with Dark Overlay */}
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop')" }}
                >
                    {/* Deep gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#111111]/80 to-[#111111]"></div>
                </div>

                {/* Content Layer */}
                <div className="relative z-10 flex flex-col h-full px-6 py-12 justify-between">
                    
                    {/* Top Branding */}
                    <div className="w-full flex justify-center pt-8">
                        <span className="text-white font-semibold tracking-widest text-2xl uppercase flex items-center gap-1">
                            Hair<span className="text-[#D4AF37]">Sync</span>
                        </span>
                    </div>

                    {/* Main Copy */}
                    <div className="flex flex-col items-center text-center mt-auto mb-16 space-y-6">
                        <span className="px-4 py-1.5 border border-[#D4AF37]/40 text-[#D4AF37] rounded-full text-[11px] uppercase tracking-wider font-medium">
                            AI Personal Styling
                        </span>
                        
                        <h1 className="text-3xl font-light leading-snug break-keep text-gray-100">
                            대기하시는 동안,<br />
                            <span className="font-medium text-white">당신만의 스타일</span>을<br />
                            찾아보세요.
                        </h1>
                        
                        <p className="text-[15px] opacity-70 font-light max-w-[260px] break-keep leading-relaxed">
                            HairSync AI가 얼굴형과 모질을 분석하여 최적의 시술을 제안합니다.
                        </p>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="w-full pb-8">
                        <button
                            onClick={() => navigate('/app')}
                            className="w-full py-4 bg-white text-black text-[16px] font-medium rounded-lg transition-colors active:bg-gray-200"
                        >
                            컨설팅 시작하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
