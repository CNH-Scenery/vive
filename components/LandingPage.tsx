import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen font-sans text-gray-900">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-sm text-white/90 text-[13px] h-[60px] flex items-center z-50 transition-all border-b border-white/10">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-4 md:gap-8">
                        <span className="text-white font-bold text-xl tracking-tight cursor-pointer flex items-center gap-1" onClick={() => navigate('/')}>
                            Style<span className="text-[#7c3aed]">Sync</span>
                        </span>
                        <div className="hidden md:flex gap-6 font-medium">
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/app'); }} className="hover:text-[#7c3aed] transition-colors">스타일 진단</a>
                            <a href="#" className="hover:text-[#7c3aed] transition-colors">이용 가이드</a>
                            <a href="#" className="hover:text-[#7c3aed] transition-colors">스타일 갤러리</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <a href="#" className="hidden sm:block hover:text-white transition-colors">로그인</a>
                        <span className="hidden sm:block opacity-30">|</span>
                        <button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3 md:px-4 py-1.5 rounded-full font-bold transition-colors text-xs whitespace-nowrap">
                            마이 페이지
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Hero Section (Full Screen) */}
            <div className="relative w-full h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2670&auto=format&fit=crop')" }}>
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Main Center Content */}
                <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center text-white px-4">
                    <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-sm font-light mb-6 backdrop-blur-md">
                        AI 기반 퍼스널 헤어 컨설팅
                    </span>
                    <h1 className="text-[40px] md:text-[72px] font-bold leading-tight mb-8 drop-shadow-lg break-keep shadow-black">
                        누구나 쉽게 찾는<br />
                        <span className="text-[#7c3aed]">인생 헤어스타일</span>
                    </h1>
                    <p className="text-[16px] md:text-[24px] opacity-90 mb-10 font-light max-w-xl md:max-w-2xl text-gray-100 break-keep">
                        실패 없는 스타일 변신, StyleSync AI가 도와드립니다.<br className="hidden md:block" />
                        내 얼굴형에 딱 맞는 최적의 스타일을 지금 확인해보세요.
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/app')}
                            className="px-8 md:px-10 py-4 md:py-5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[18px] md:text-[20px] font-bold rounded-lg transition-all transform hover:scale-105 shadow-xl ring-4 ring-[#7c3aed]/30"
                        >
                            무료로 시작하기
                        </button>
                    </div>
                </div>

                {/* Bottom Banner (Inside Hero) */}
                <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-md border-t border-white/10 py-6">
                    <div className="max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-white text-center">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#7c3aed] flex items-center justify-center text-[#7c3aed] font-bold text-xl md:text-2xl shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                            !
                        </div>
                        <span className="text-[16px] md:text-[24px] font-light break-keep">
                            <span className="font-bold text-[#7c3aed]">StyleSync</span> 누구나 · 쉽게 · 무료로 받는 헤어 컨설팅
                        </span>
                    </div>
                </div>
            </div>

            {/* New Content Section (Grey Background) - Filling the empty space */}
            <div className="w-full bg-[#f5f6f8] py-16">
                <div className="max-w-[1280px] mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left: Text Description */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-800 leading-snug">
                                복잡한 설치 없이 <br />
                                <span className="text-[#7c3aed]">사진 한 장이면 충분합니다.</span>
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                미용실 가기 전, 나에게 어울리는 스타일을 미리 확인해보세요.<br />
                                StyleSync AI가 얼굴형과 트렌드를 분석하여<br />
                                당신만을 위한 인생 머리를 찾아드립니다.
                            </p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <span className="w-2 h-2 rounded-full bg-[#7c3aed]"></span>
                                    실시간 AI 얼굴형 분석
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <span className="w-2 h-2 rounded-full bg-[#7c3aed]"></span>
                                    자연스러운 헤어 합성 시뮬레이션
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <span className="w-2 h-2 rounded-full bg-[#7c3aed]"></span>
                                    내 주변 스타일 전문 미용실 추천
                                </li>
                            </ul>
                        </div>

                        {/* Right: Representative Image (Tablet/Phone mockup style) */}
                        <div className="relative">
                            <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2669&auto=format&fit=crop"
                                    alt="StyleSync Feature"
                                    className="w-full object-cover h-[400px]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                                    <p className="text-white font-medium">당신의 변화를 미리 경험하세요</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer mimic */}
            <footer className="bg-[#f9f9f9] py-10 text-center border-t border-[#eee]">
                <p className="text-[#888] text-sm">© StyleSync AI Corp.</p>
            </footer>
        </div>
    );
};


export default LandingPage;
