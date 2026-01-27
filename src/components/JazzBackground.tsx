/**
 * Jazz Cup 90s-style swoosh background pattern
 * Teal and purple aesthetic inspired by the iconic Solo Jazz design
 */
export const JazzBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Main teal swoosh - bottom left curve */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large teal swoosh from bottom left */}
        <path
          d="M-100 900 Q200 700 400 750 T800 600 T1200 650 T1600 500"
          fill="none"
          stroke="hsl(175, 65%, 45%)"
          strokeWidth="120"
          strokeLinecap="round"
          opacity="0.15"
        />
        
        {/* Secondary teal swoosh - thinner */}
        <path
          d="M-50 950 Q250 800 500 820 T900 700 T1300 720 T1550 600"
          fill="none"
          stroke="hsl(175, 65%, 50%)"
          strokeWidth="40"
          strokeLinecap="round"
          opacity="0.12"
        />
        
        {/* Purple accent swoosh - top right area */}
        <path
          d="M800 -50 Q900 150 1100 100 T1400 200 T1500 150"
          fill="none"
          stroke="hsl(280, 55%, 55%)"
          strokeWidth="60"
          strokeLinecap="round"
          opacity="0.1"
        />
        
        {/* Small purple accent */}
        <path
          d="M1000 50 Q1100 120 1250 80 T1450 130"
          fill="none"
          stroke="hsl(280, 55%, 60%)"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.08"
        />
        
        {/* Thin teal line accent */}
        <path
          d="M-20 850 Q300 650 550 700 T950 550 T1350 600 T1500 450"
          fill="none"
          stroke="hsl(175, 70%, 55%)"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.18"
        />
      </svg>
    </div>
  );
};
